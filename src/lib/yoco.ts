import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "./site";
import type { BookingWithEvent } from "./types";

const CHECKOUT_API = "https://payments.yoco.com/api/checkouts";
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60;

export const SUCCESSFUL_CHARGE_TYPES = new Set([
  "payment.succeeded",
  "payment.created",
  "payment.success",
  "charge.succeeded",
  "charge.success",
]);

export function yocoSecretKey(): string | undefined {
  const value = process.env.YOCO_SECRET_KEY?.trim();
  return value || undefined;
}

/** Fake seed links like https://pay.yoco.com/phc-slug 404 on Yoco. */
export function usablePayLink(url: string | null | undefined): string | null {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return null;
  if (/^https?:\/\/pay\.yoco\.com\/phc-/i.test(trimmed)) return null;
  return trimmed;
}

export function cardPaymentsEnabled(paymentLink?: string | null): boolean {
  return Boolean(yocoSecretKey()) || Boolean(usablePayLink(paymentLink));
}

export function yocoWebhookSecrets(): string[] {
  return [process.env.YOCO_WEBHOOK_SECRET, process.env.YOCO_SECRET_KEY]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

export function hmacSecretBytes(secret: string): Buffer {
  const trimmed = secret.trim();
  if (trimmed.startsWith("whsec_")) {
    return Buffer.from(trimmed.slice("whsec_".length), "base64");
  }
  return Buffer.from(trimmed, "utf8");
}

function header(headers: Headers, name: string): string {
  return headers.get(name) ?? headers.get(name.toLowerCase()) ?? "";
}

function safeEqual(left: string, right: string): boolean {
  const leftBuf = Buffer.from(left);
  const rightBuf = Buffer.from(right);
  if (leftBuf.length !== rightBuf.length) {
    timingSafeEqual(leftBuf, leftBuf);
    return false;
  }
  return timingSafeEqual(leftBuf, rightBuf);
}

function matchesSignature(expected: string, provided: string): boolean {
  const tokens = provided
    .split(/\s+/)
    .flatMap((token) => {
      const trimmed = token.trim();
      if (!trimmed) return [];
      const comma = trimmed.indexOf(",");
      return [comma === -1 ? trimmed : trimmed.slice(comma + 1)];
    });

  return tokens.some((token) => safeEqual(expected, token));
}

export function verifyYocoSignature(rawBody: string, headers: Headers): boolean {
  const secrets = yocoWebhookSecrets();
  if (secrets.length === 0) return false;

  const webhookId = header(headers, "webhook-id");
  const timestamp = header(headers, "webhook-timestamp");
  const signature =
    header(headers, "webhook-signature") ||
    header(headers, "x-yoco-signature") ||
    header(headers, "x-webhook-signature");

  if (!signature) return false;

  if (timestamp) {
    const seconds = Number(timestamp);
    if (!Number.isFinite(seconds)) return false;
    const drift = Math.abs(Date.now() / 1000 - seconds);
    if (drift > TIMESTAMP_TOLERANCE_SECONDS) return false;
  }

  const signedContent =
    webhookId && timestamp ? `${webhookId}.${timestamp}.${rawBody}` : rawBody;

  return secrets.some((secret) => {
    const key = hmacSecretBytes(secret);
    const standard = createHmac("sha256", key).update(signedContent).digest("base64");
    const bodyHex = createHmac("sha256", key).update(rawBody).digest("hex");
    const bodyB64 = createHmac("sha256", key).update(rawBody).digest("base64");
    return (
      matchesSignature(standard, signature) ||
      matchesSignature(bodyHex, signature) ||
      matchesSignature(bodyB64, signature)
    );
  });
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null;
}

function collectStrings(value: unknown, into: string[] = [], depth = 0): string[] {
  if (depth > 6 || value == null) return into;
  if (typeof value === "string" || typeof value === "number") {
    into.push(String(value));
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, into, depth + 1);
    return into;
  }
  const object = asObject(value);
  if (!object) return into;
  for (const item of Object.values(object)) collectStrings(item, into, depth + 1);
  return into;
}

export function extractBookingReference(payload: unknown): string | null {
  const object = asObject(payload);
  if (!object) return null;

  const nested = asObject(object.payload) ?? {};
  const metadata = asObject(nested.metadata) ?? asObject(object.metadata) ?? {};

  const candidates = [
    metadata.bookingReference,
    metadata.booking_reference,
    metadata.reference,
    metadata.clientReferenceId,
    nested.clientReferenceId,
    nested.externalId,
    object.clientReferenceId,
    object.externalId,
    object.reference,
  ];

  for (const candidate of candidates) {
    const match = String(candidate ?? "").toUpperCase().match(/PHC-[A-Z0-9]{4,12}/);
    if (match) return match[0];
  }

  for (const text of collectStrings(payload)) {
    const match = text.toUpperCase().match(/PHC-[A-Z0-9]{4,12}/);
    if (match) return match[0];
  }

  return null;
}

export function eventTypeOf(payload: unknown): string {
  const object = asObject(payload);
  if (!object) return "";
  const nested = asObject(object.payload);
  const type =
    object.type ??
    object.event_type ??
    object.eventType ??
    nested?.type ??
    "";
  return String(type).trim().toLowerCase();
}

export function isSuccessfulCharge(payload: unknown): boolean {
  const type = eventTypeOf(payload);
  if (SUCCESSFUL_CHARGE_TYPES.has(type)) return true;

  const object = asObject(payload);
  const nested = asObject(object?.payload);
  const status = String(nested?.status ?? object?.status ?? "").toLowerCase();
  const kind = String(nested?.type ?? "").toLowerCase();
  return status === "succeeded" && (kind === "payment" || kind === "charge");
}

export function chargeAmountCents(payload: unknown): number | null {
  const object = asObject(payload);
  const nested = asObject(object?.payload);
  const amount = nested?.amount ?? object?.amount;
  return typeof amount === "number" && Number.isFinite(amount) ? amount : null;
}

export async function createYocoCheckout(
  booking: BookingWithEvent,
): Promise<string | null> {
  const secret = yocoSecretKey();
  if (!secret || booking.amountCents <= 0) return null;

  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");
  const bookingUrl = `${origin}/booking/${booking.reference}`;
  const response = await fetch(CHECKOUT_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `phc-checkout-${booking.reference}`,
    },
    body: JSON.stringify({
      amount: booking.amountCents,
      currency: "ZAR",
      successUrl: bookingUrl,
      cancelUrl: bookingUrl,
      failureUrl: bookingUrl,
      clientReferenceId: booking.reference,
      externalId: booking.reference,
      metadata: {
        bookingReference: booking.reference,
        eventSlug: booking.event.slug,
      },
      lineItems: [
        {
          displayName: booking.event.title,
          quantity: booking.people,
          pricingDetails: { price: booking.event.priceCents },
        },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[yoco] checkout failed", response.status, detail.slice(0, 400));
    return null;
  }

  const data = (await response.json()) as { redirectUrl?: string };
  return data.redirectUrl ?? null;
}
