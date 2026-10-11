import { getBookingByReference, isQrUnlocked } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);

  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  return Response.json({
    paymentStatus: booking.paymentStatus,
    qrUnlocked: isQrUnlocked(booking),
  });
}
