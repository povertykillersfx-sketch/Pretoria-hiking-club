import { revalidatePath } from "next/cache";
import { markBookingPaidByReference } from "@/lib/bookings";
import {
  chargeAmountCents,
  extractBookingReference,
  isSuccessfulCharge,
  verifyYocoSignature,
  yocoWebhookSecrets,
} from "@/lib/yoco";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, endpoint: "/webhooks/payments" });
}

export async function POST(request: Request) {
  if (yocoWebhookSecrets().length === 0) {
    console.error("[yoco] webhook received but YOCO_WEBHOOK_SECRET / YOCO_SECRET_KEY is not set");
    return Response.json({ error: "Webhook secret is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();

  if (!verifyYocoSignature(rawBody, request.headers)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isSuccessfulCharge(payload)) {
    return Response.json({ ok: true, ignored: true });
  }

  const reference = extractBookingReference(payload);
  if (!reference) {
    console.warn("[yoco] successful charge without a booking reference");
    return Response.json({ ok: true, unmatched: true });
  }

  const booking = await markBookingPaidByReference(reference);
  if (!booking) {
    console.warn("[yoco] no booking for", reference);
    return Response.json({ ok: true, unmatched: true });
  }

  const charged = chargeAmountCents(payload);
  if (charged != null && charged !== booking.amountCents) {
    console.warn("[yoco] amount mismatch", {
      reference,
      charged,
      expected: booking.amountCents,
    });
  }

  revalidatePath(`/booking/${booking.reference}`);
  revalidatePath(`/admin/events/${booking.eventId}/bookings`);
  revalidatePath("/admin");

  return Response.json({
    ok: true,
    reference: booking.reference,
    paymentStatus: booking.paymentStatus,
  });
}
