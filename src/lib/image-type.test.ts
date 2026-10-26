import assert from "node:assert/strict";
import { test } from "node:test";
import { sniffImageType } from "./image-type";

test("sniffs JPEG, PNG, WebP and AVIF magic bytes", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const webp = Uint8Array.from([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
  ]);
  const avif = Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]);

  assert.equal(sniffImageType(jpeg), "image/jpeg");
  assert.equal(sniffImageType(png), "image/png");
  assert.equal(sniffImageType(webp), "image/webp");
  assert.equal(sniffImageType(avif), "image/avif");
});

test("sniffs iPhone HEIC so the API can reject it with a clear error", () => {
  const heic = Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
  const mif1 = Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x69, 0x66, 0x31]);
  assert.equal(sniffImageType(heic), "image/heic");
  assert.equal(sniffImageType(mif1), "image/heic");
});

test("returns undefined for short or unknown buffers", () => {
  assert.equal(sniffImageType(Uint8Array.from([1, 2, 3])), undefined);
  assert.equal(sniffImageType(Uint8Array.from(Array(12).fill(0))), undefined);
});
