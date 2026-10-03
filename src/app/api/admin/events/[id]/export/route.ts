import { isAuthenticated } from "@/lib/auth";
import { bookingsToCsv, getBookingsForEvent } from "@/lib/bookings";
import { getEventById } from "@/lib/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return new Response("Not authorised", { status: 401 });
  }

  const { id } = await params;
  const event = getEventById(Number(id));

  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const csv = bookingsToCsv(getBookingsForEvent(event.id), event.title, event.date);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-attendees.csv"`,
    },
  });
}
