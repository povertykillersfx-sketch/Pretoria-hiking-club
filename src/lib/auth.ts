import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "phc_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "trailboss";
}

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? `phc-dev-secret::${adminPassword()}`;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function verifyPassword(input: string): boolean {
  return safeEqual(input, adminPassword());
}

export async function createSession(): Promise<void> {
  const issuedAt = Date.now().toString();
  const token = `${issuedAt}.${sign(issuedAt)}`;
  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  if (!safeEqual(signature, sign(issuedAt))) return false;

  const age = (Date.now() - Number(issuedAt)) / 1000;
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_SECONDS;
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}
