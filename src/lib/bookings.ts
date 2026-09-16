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
  checkin_token: string | null;
  checked_in_at: string | null;
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
    checkinToken: row.checkin_token ?? "",
    checkedInAt: row.checked_in_at,
  };
}

function generateReference(): string {
  const raw = randomBytes(4).toString("hex").toUpperCase();
  return `PHC-${raw}`;
}

function generateCheckinToken(): string {
  return randomBytes(16).toString("hex");
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

    let token = generateCheckinToken();
    while (
      db
        .prepare<[string], { id: number }>("SELECT id FROM bookings WHERE checkin_token = ?")
        .get(token)
    ) {
      token = generateCheckinToken();
    }

    const info = db
      .prepare(
        `INSERT INTO bookings (
           reference, event_id, distance, name, email, phone, people,
           amount_cents, payment_method, payment_status, status, notes, checkin_token
         ) VALUES (
           @reference, @event_id, @distance, @name, @email, @phone, @people,
           @amount_cents, @payment_method, @payment_status, 'confirmed', @notes, @checkin_token
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
        checkin_token: token,
      });

    return db
      .prepare<[number], BookingRow>("SELECT * FROM bookings WHERE id = ?")
      .get(Number(info.lastInsertRowid))!;
  });

  // An immediate transaction takes the write lock before the capacity check, so
  // two people booking the last spots at the same time can never oversell it.
  const row = run.immediate(input);
  const event = getEventById(row.event_id)!;

  return { ...mapBooking(row), event };
}

export function getBookingByReference(reference: string): BookingWithEvent | null {
  const row = getDb()
    .prepare<[string], BookingRow>("SELECT * FROM bookings WHERE reference = ?")
    .get(reference.toUpperCase());

  return hydrateBooking(row);
}

export function getBookingByToken(token: string): BookingWithEvent | null {
  const cleaned = token.trim().toLowerCase();
  if (!cleaned) return null;

  const row = getDb()
    .prepare<[string], BookingRow>("SELECT * FROM bookings WHERE checkin_token = ?")
    .get(cleaned);

  return hydrateBooking(row);
}

function hydrateBooking(row: BookingRow | undefined): BookingWithEvent | null {
  if (!row) return null;
  const event = getEventById(row.event_id);
  if (!event) return null;
  return { ...mapBooking(row), event };
}

export function lookupHikerTicket(reference: string, email: string): BookingWithEvent | null {
  const booking = getBookingByReference(reference);
  if (!booking) return null;
  if (booking.email !== email.trim().toLowerCase()) return null;
  return booking;
}

export function searchBookingsForEvent(eventId: number, query: string): Booking[] {
  const term = query.trim();
  if (term.length < 2) return [];

  const parsed = parseCheckInCode(term);
  if (parsed?.token) {
    const row = getDb()
      .prepare<[string, number], BookingRow>(
        "SELECT * FROM bookings WHERE checkin_token = ? AND event_id = ?",
      )
      .get(parsed.token, eventId);
    return row ? [mapBooking(row)] : [];
  }

  const safe = term.replace(/[%_]/g, "");
  if (safe.length < 2) return [];

  const like = `%${safe}%`;

  return getDb()
    .prepare<[number, string, string, string, string], BookingRow>(
      `SELECT * FROM bookings
       WHERE event_id = ?
         AND (
           reference LIKE ? COLLATE NOCASE
           OR name LIKE ? COLLATE NOCASE
           OR CAST(id AS TEXT) = ?
         )
       ORDER BY
         CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END,
         CASE WHEN CAST(id AS TEXT) = ? THEN 0 ELSE 1 END,
         name COLLATE NOCASE
       LIMIT 20`,
    )
    .all(eventId, like, like, term, term)
    .map(mapBooking);
}

export type CheckInFailure =
  | "not_found"
  | "cancelled"
  | "wrong_event"
  | "already_checked_in";

export type CheckInResult =
  | { ok: true; booking: BookingWithEvent }
  | {
      ok: false;
      reason: CheckInFailure;
      message: string;
      booking?: BookingWithEvent;
    };

export function checkInBooking(eventId: number, code: string): CheckInResult {
  const db = getDb();

  const run = db.transaction((payload: { eventId: number; code: string }): CheckInResult => {
    const parsed = parseCheckInCode(payload.code);
    if (!parsed) {
      return { ok: false, reason: "not_found", message: "This QR code is not a valid booking." };
    }

    let row: BookingRow | undefined;
    if (parsed.token) {
      row = db.prepare<[string], BookingRow>("SELECT * FROM bookings WHERE checkin_token = ?").get(parsed.token);
    } else if (parsed.reference) {
      row = db
        .prepare<[string], BookingRow>("SELECT * FROM bookings WHERE reference = ?")
        .get(parsed.reference);
    } else if (parsed.id != null) {
      row = db.prepare<[number], BookingRow>("SELECT * FROM bookings WHERE id = ?").get(parsed.id);
    } else {
      return { ok: false, reason: "not_found", message: "This QR code is not a valid booking." };
    }

    const booking = hydrateBooking(row);
    if (!booking) {
      return { ok: false, reason: "not_found", message: "This QR code is not a valid booking." };
    }

    if (booking.status === "cancelled") {
      return {
        ok: false,
        reason: "cancelled",
        message: "This booking was cancelled and cannot be checked in.",
        booking,
      };
    }

    if (booking.eventId !== payload.eventId) {
      const date = formatDateSafe(booking.event.date);
      return {
        ok: false,
        reason: "wrong_event",
        message: `Invalid for this event. This ticket is for ${booking.event.title} on ${date}.`,
        booking,
      };
    }

    if (booking.checkedInAt) {
      return {
        ok: false,
        reason: "already_checked_in",
        message: `${booking.name} is already checked in.`,
        booking,
      };
    }

    db.prepare("UPDATE bookings SET checked_in_at = datetime('now') WHERE id = ?").run(booking.id);
    const updated = hydrateBooking(
      db.prepare<[number], BookingRow>("SELECT * FROM bookings WHERE id = ?").get(booking.id),
    )!;

    return { ok: true, booking: updated };
  });

  return run.immediate({ eventId, code });
}

function formatDateSafe(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Africa/Johannesburg",
    }).format(new Date(`${iso}T12:00:00Z`));
  } catch {
    return iso;
  }
}

export function getCheckInStats(eventId: number): {
  confirmed: number;
  hikers: number;
  checkedInBookings: number;
  checkedInHikers: number;
} {
  const row = getDb()
    .prepare<
      [number],
      {
        confirmed: number;
        hikers: number;
        checked_in_bookings: number;
        checked_in_hikers: number;
      }
    >(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) AS confirmed,
         COALESCE(SUM(CASE WHEN status = 'confirmed' THEN people ELSE 0 END), 0) AS hikers,
         COALESCE(SUM(CASE WHEN status = 'confirmed' AND checked_in_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS checked_in_bookings,
         COALESCE(SUM(CASE WHEN status = 'confirmed' AND checked_in_at IS NOT NULL THEN people ELSE 0 END), 0) AS checked_in_hikers
       FROM bookings
       WHERE event_id = ?`,
    )
    .get(eventId)!;

  return {
    confirmed: row.confirmed,
    hikers: row.hikers,
    checkedInBookings: row.checked_in_bookings,
    checkedInHikers: row.checked_in_hikers,
  };
}

export type ParsedCheckInCode =
  | { token: string; reference?: undefined; id?: undefined }
  | { reference: string; token?: undefined; id?: undefined }
  | { id: number; token?: undefined; reference?: undefined };

export function parseCheckInCode(raw: string): ParsedCheckInCode | null {
  const value = raw.trim();
  if (!value) return null;

  const prefixed = value.match(/phc1[.:]([a-f0-9]{32})/i);
  if (prefixed) return { token: prefixed[1].toLowerCase() };

  try {
    const url = new URL(value);
    const fromQuery = url.searchParams.get("token") ?? url.searchParams.get("code");
    if (fromQuery && /^[a-f0-9]{32}$/i.test(fromQuery)) {
      return { token: fromQuery.toLowerCase() };
    }
    const pathToken = url.pathname.match(/\/(?:t|ticket)\/([a-f0-9]{32})/i);
    if (pathToken) return { token: pathToken[1].toLowerCase() };
  } catch {
    // Not a URL — keep parsing as a raw code.
  }

  const reference = value.toUpperCase().match(/PHC-[A-Z0-9]{4,12}/);
  if (reference) return { reference: reference[0] };

  if (/^[a-f0-9]{32}$/i.test(value)) return { token: value.toLowerCase() };

  if (/^\d{1,10}$/.test(value)) return { id: Number(value) };

  return null;
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
    "Checked in",
    "Notes",
    "Booked at",
    "Event",
    "Event date",
  ];

  const escape = (value: string | number | null) => {
    let text = value === null || value === undefined ? "" : String(value);
    // Spreadsheets treat a leading =, +, - or @ as a formula, so a hiker could put
    // one in their name or notes. Prefix a quote to keep it inert text.
    if (/^[=+\-@\t\r]/.test(text)) {
      text = `'${text}`;
    }
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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
      booking.checkedInAt ?? "",
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
