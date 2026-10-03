import { getBookingByReference } from "@/lib/bookings";
import { site } from "@/lib/site";

function icsEscape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsStamp(date: string, time: string): string {
  const [hours = "08", minutes = "00"] = time.split(":");
  // Times are South African local time (UTC+2).
  const utc = new Date(`${date}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00+02:00`);
  return utc.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const booking = getBookingByReference(reference);

  if (!booking) {
    return new Response("Booking not found", { status: 404 });
  }

  const { event } = booking;
  const start = toIcsStamp(event.date, event.arrivalTime);
  const end = toIcsStamp(event.date, "17:00");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@pretoriahikingclub`,
    `DTSTAMP:${toIcsStamp(event.date, event.arrivalTime)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(event.title)} (${booking.distance})`,
    `LOCATION:${icsEscape(`${event.meetingPoint}, ${event.location}`)}`,
    `DESCRIPTION:${icsEscape(
      `Booking reference ${booking.reference}. Arrive at ${event.arrivalTime}, hike starts ${event.startTime}. ${site.url}/events/${event.slug}`,
    )}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT12H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(`${event.title} tomorrow — arrive ${event.arrivalTime}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.reference}.ics"`,
    },
  });
}
