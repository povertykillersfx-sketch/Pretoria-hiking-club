import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { computeBookingTotalCents } from "./format";
import {
  extractBookingReference,
  hmacSecretBytes,
  isSuccessfulCharge,
  usablePayLink,
  verifyYocoSignature,
} from "./yoco";

test("ignores placeholder pay.yoco.com/phc- seed links", () => {
  assert.equal(usablePayLink("https://pay.yoco.com/phc-magaliesberg-sunrise-hike"), null);
  assert.equal(usablePayLink("https://pay.yoco.com/club-hike"), "https://pay.yoco.com/club-hike");
  assert.equal(usablePayLink(null), null);
});

test("multiplies ticket quantity by the hike price", () => {
  assert.equal(computeBookingTotalCents(15000, 3), 45000);
  assert.equal(computeBookingTotalCents(12000, 1), 12000);
  assert.equal(computeBookingTotalCents(15000, 0), 0);
});

test("recognises a successful charge event", () => {
  assert.equal(isSuccessfulCharge({ type: "payment.succeeded", payload: { status: "succeeded" } }), true);
  assert.equal(isSuccessfulCharge({ event_type: "payment.created" }), true);
  assert.equal(isSuccessfulCharge({ type: "payment.failed" }), false);
});

test("extracts the booking reference from metadata or free text", () => {
  assert.equal(
    extractBookingReference({
      type: "payment.succeeded",
      payload: { metadata: { bookingReference: "PHC-8F3K21" } },
    }),
    "PHC-8F3K21",
  );
  assert.equal(
    extractBookingReference({ description: "Hike payment for phc-ab12cd" }),
    "PHC-AB12CD",
  );
});

test("rejects unsigned and tampered Yoco webhooks", () => {
  const secret = "whsec_dGVzdC1zZWNyZXQ=";
  process.env.YOCO_WEBHOOK_SECRET = secret;
  process.env.YOCO_SECRET_KEY = "";

  const body = JSON.stringify({ type: "payment.succeeded", payload: { metadata: { bookingReference: "PHC-TEST01" } } });
  const id = "msg_test";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", hmacSecretBytes(secret)).update(signed).digest("base64");

  const valid = new Headers({
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": `v1,${expected}`,
  });
  assert.equal(verifyYocoSignature(body, valid), true);

  const tampered = new Headers(valid);
  tampered.set("webhook-signature", "v1,aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=");
  assert.equal(verifyYocoSignature(body, tampered), false);

  assert.equal(verifyYocoSignature(` ${body}`, valid), false);
});
