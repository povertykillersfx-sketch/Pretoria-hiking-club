import { randomBytes } from "node:crypto";
import { getDb } from "./db";
import { getEventById, getEventBySlug, withAvailability } from "./events";
import type {
  Booking,
  BookingWithEvent,
  PaymentMethod,
  PaymentStatus,
  TrailDistance,
} from "./types";

type BookingRow = {
  id: number;
  reference: string;
  event_id: number;
  distance: string;
  name: string;
  email: string;
  phone: string;
  people: number;
  amount_cents: number;
  payment_method: string;
  payment_status: string;
  status: string;
  notes: string | null;
  created_at: string;
};

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    reference: row.reference,
    eventId: row.event_id,
    distance: row.distance as TrailDistance,
    name: row.name,
    email: row.email,
    phone: row.phone,
    people: row.people,
    amountCents: row.amount_cents,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    status: row.status as Booking["status"],
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function generateReference(): string {
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `PHC-${raw}`;
}

export class BookingError extends Error {
  code: "sold_out" | "closed" | "not_found" | "invalid";

  constructor(code: BookingError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

export type CreateBookingInput = {
  eventSlug: string;
  distance: TrailDistance;
  name: string;
  email: string;
  phone: string;
  people: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
};

export function createBooking(input: CreateBookingInput): BookingWithEvent {
  const db = getDb();

  const run = db.transaction((data: CreateBookingInput): BookingRow => {
    const event = getEventBySlug(data.eventSlug);
    if (!event) throw new BookingError("not_found", "That event could not be found.");
    if (event.isPast) throw new BookingError("closed", "This event has already taken place.");
    if (!event.published || event.bookingsClosed) {
      throw new BookingError("closed", "Bookings for this hike are closed.");
    }
    if (data.people < 1 || data.people > 10) {
      throw new BookingError("invalid", "You can book between 1 and 10 spots at a time.");
    }
    if (data.distance === "5KM" && !event.distance5km) {
      throw new BookingError("invalid", "The 5KM route is not available for this event.");
    }
    if (data.distance === "10KM" && !event.distance10km) {
      throw new BookingError("invalid", "The 10KM route is not available for this event.");
    }
    if (data.people > event.spotsRemaining) {
      throw new BookingError(
        "sold_out",
        event.spotsRemaining === 0
          ? "This hike is fully booked."
          : `Only ${event.spotsRemaining} ${event.spotsRemaining === 1 ? "spot is" : "spots are"} left for this hike.`,
      );
    }

    const isFree = event.priceCents === 0;
    const amountCents = event.priceCents * data.people;
    const paymentMethod: PaymentMethod = isFree ? "free" : data.paymentMethod;
    const paymentStatus: PaymentStatus = isFree
      ? "not_required"
      : paymentMethod === "card"
        ? "paid"
        : "pending";

    let reference = generateReference();
    while (
      db
        .prepare<[string], { id: number }>("SELECT id FROM bookings WHERE reference = ?")
        .get(reference)
    ) {
      reference = generateReference();
    }

    const info = db
      .prepare(
        `INSERT INTO bookings (
           reference, event_id, distance, name, email, phone, people,
           amount_cents, payment_method, payment_status, status, notes
         ) VALUES (
           @reference, @event_id, @distance, @name, @email, @phone, @people,
           @amount_cents, @payment_method, @payment_status, 'confirmed', @notes
         )`,
      )
      .run({
        reference,
        event_id: event.id,
        distance: data.distance,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        people: data.people,
        amount_cents: amountCents,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes: data.notes?.trim() || null,
      });

    return db
      .prepare<[number], BookingRow>("SELECT * FROM bookings WHERE id = ?")
      .get(Number(info.lastInsertRowid))!;
  });

  const row = run(input);
  const event = getEventById(row.event_id)!;

  return { ...mapBooking(row), event };
}

export function getBookingByReference(reference: string): BookingWithEvent | null {
  const row = getDb()
    .prepare<[string], BookingRow>("SELECT * FROM bookings WHERE reference = ?")
    .get(reference.toUpperCase());

  if (!row) return null;
  const event = getEventById(row.event_id);
  if (!event) return null;

  return { ...mapBooking(row), event };
}

export function getBookingsForEvent(eventId: number): Booking[] {
  return getDb()
    .prepare<[number], BookingRow>(
      "SELECT * FROM bookings WHERE event_id = ? ORDER BY created_at DESC",
    )
    .all(eventId)
    .map(mapBooking);
}

export function getRecentBookings(limit = 10): BookingWithEvent[] {
  const rows = getDb()
    .prepare<[number], BookingRow>(
      "SELECT * FROM bookings ORDER BY created_at DESC, id DESC LIMIT ?",
    )
    .all(limit);

  return rows.flatMap((row) => {
    const event = getEventById(row.event_id);
    return event ? [{ ...mapBooking(row), event }] : [];
  });
}

export function updateBookingStatus(
  id: number,
  status: Booking["status"],
): void {
  getDb().prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, id);
}

export function updatePaymentStatus(id: number, status: PaymentStatus): void {
  getDb()
    .prepare("UPDATE bookings SET payment_status = ? WHERE id = ?")
    .run(status, id);
}

export function getClubStats() {
  const db = getDb();
  const hikers = db
    .prepare<[], { total: number | null }>(
      "SELECT SUM(people) AS total FROM bookings WHERE status = 'confirmed'",
    )
    .get()!;
  const events = db
    .prepare<[], { total: number }>("SELECT COUNT(*) AS total FROM events")
    .get()!;
  const revenue = db
    .prepare<[], { total: number | null }>(
      "SELECT SUM(amount_cents) AS total FROM bookings WHERE status = 'confirmed' AND payment_status = 'paid'",
    )
    .get()!;

  return {
    bookedHikers: hikers.total ?? 0,
    totalEvents: events.total,
    paidRevenueCents: revenue.total ?? 0,
  };
}

export function bookingsToCsv(
  bookings: Booking[],
  eventTitle: string,
  eventDate: string,
): string {
  const header = [
    "Reference",
    "Name",
    "Email",
    "Phone",
    "Trail",
    "People",
    "Amount (ZAR)",
    "Payment method",
    "Payment status",
    "Booking status",
    "Notes",
    "Booked at",
    "Event",
    "Event date",
  ];

  const escape = (value: string | number | null) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const rows = bookings.map((booking) =>
    [
      booking.reference,
      booking.name,
      booking.email,
      booking.phone,
      booking.distance,
      booking.people,
      (booking.amountCents / 100).toFixed(2),
      booking.paymentMethod,
      booking.paymentStatus,
      booking.status,
      booking.notes ?? "",
      booking.createdAt,
      eventTitle,
      eventDate,
    ]
      .map(escape)
      .join(","),
  );

  return [header.join(","), ...rows].join("\n");
}

export { withAvailability };
