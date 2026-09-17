import QRCode from "qrcode";
import { getBookingByReference } from "@/lib/bookings";
import { qrPayload } from "@/lib/qr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const booking = getBookingByReference(reference);

  if (!booking || !booking.checkinToken || booking.status === "cancelled") {
    return new Response("Booking not found", { status: 404 });
  }

  const png = await QRCode.toBuffer(qrPayload(booking.checkinToken), {
    type: "png",
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#061a11", light: "#ffffff" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${booking.reference}-checkin.png"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
