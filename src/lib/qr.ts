export const QR_PREFIX = "phc1";

export function qrPayload(token: string): string {
  return `${QR_PREFIX}.${token}`;
}
