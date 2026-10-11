import { randomBytes } from "node:crypto";
import { qrPayload } from "./qr";
import {
  hydrateEvent,
  mapBooking,
  todayIso,
  type BookingRecord,
  type EventRecord,
} from "./records";
import { seedEvents } from "./seed-data";
import type {
  Booking,
  BookingWithEvent,
  EventInput,
  EventWithAvailability,
  PaymentStatus,
} from "./types";

type MemoryState = {
  events: EventRecord[];
  bookings: BookingRecord[];
  nextEventId: number;
  nextBookingId: number;
};

declare global {
  var __phcMemory: MemoryState | undefined;
  var __phcMemoryLock: Promise<void> | undefined;
}

function parseSeedJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function seedState(): MemoryState {
  const events: EventRecord[] = [];
  const bookings: BookingRecord[] = [];
  let nextEventId = 1;
  let nextBookingId = 1;

  for (const event of seedEvents()) {
    const id = nextEventId++;
    const created = nowIso();
    events.push({
      id,
      slug: event.row.slug,
      title: event.row.title,
      category: event.row.category,
      summary: event.row.summary,
      description: event.row.description,
      location: event.row.location,
      meeting_point: event.row.meeting_point,
      map_url: event.row.map_url,
      event_date: event.row.event_date,
      start_time: event.row.start_time,
      arrival_time: event.row.arrival_time,
      end_time: event.row.end_time,
      distance_5km: Boolean(event.row.distance_5km),
      distance_10km: Boolean(event.row.distance_10km),
      difficulty: event.row.difficulty,
      price_cents: event.row.price_cents,
      payment_link:
        event.row.price_cents > 0 ? `https://pay.yoco.com/phc-${event.row.slug}` : null,
      capacity: event.row.capacity,
      image: event.row.image,
      gallery: parseSeedJson(event.row.gallery, [] as string[]),
      schedule: parseSeedJson(event.row.schedule, []),
      includes: parseSeedJson(event.row.includes, [] as string[]),
      bring: parseSeedJson(event.row.bring, [] as string[]),
      published: Boolean(event.row.published),
      bookings_closed: Boolean(event.row.bookings_closed),
      created_at: created,
      updated_at: created,
    });

    for (const booking of event.bookings) {
      const token = randomBytes(16).toString("hex");
      bookings.push({
        id: nextBookingId++,
        reference: booking.reference,
        event_id: id,
        distance: booking.distance,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        people: booking.people,
        amount_cents: event.row.price_cents * booking.people,
        payment_method: event.row.price_cents > 0 ? booking.payment_method : "free",
        payment_status:
          event.row.price_cents > 0 ? booking.payment_status : "not_required",
        status: "confirmed",
        notes: null,
        created_at: created,
        checkin_token: token,
        qr_payload: qrPayload(token),
        checked_in_at: null,
      });
    }
  }

  return { events, bookings, nextEventId, nextBookingId };
}

function state(): MemoryState {
  if (!global.__phcMemory) {
    if (process.env.NETLIFY) {
      console.warn(
        "[phc] Supabase is not configured. Bookings cannot persist on Netlify without NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      );
    }
    global.__phcMemory = seedState();
  }
  return global.__phcMemory;
}

async function exclusive<T>(fn: () => T | Promise<T>): Promise<T> {
  const previous = global.__phcMemoryLock ?? Promise.resolve();
  let release: () => void = () => undefined;
  global.__phcMemoryLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

function withBookings(event: EventRecord): EventRecord {
  return {
    ...event,
    bookings: state()
      .bookings.filter((booking) => booking.event_id === event.id)
      .map((booking) => ({ people: booking.people, status: booking.status })),
  };
}

export async function memoryGetUpcomingEvents(limit?: number): Promise<EventWithAvailability[]> {
  const today = todayIso();
  const rows = state()
    .events.filter((event) => Boolean(event.published) && event.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, limit ?? Infinity)
    .map((event) => hydrateEvent(withBookings(event)));
  return rows;
}

export async function memoryGetPastEvents(limit = 6): Promise<EventWithAvailability[]> {
  const today = todayIso();
  return state()
    .events.filter((event) => Boolean(event.published) && event.event_date < today)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .slice(0, limit)
    .map((event) => hydrateEvent(withBookings(event)));
}

export async function memoryGetAllEventsForAdmin(): Promise<EventWithAvailability[]> {
  return state()
    .events.slice()
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .map((event) => hydrateEvent(withBookings(event)));
}

export async function memoryGetEventBySlug(slug: string): Promise<EventWithAvailability | null> {
  const event = state().events.find((row) => row.slug === slug);
  return event ? hydrateEvent(withBookings(event)) : null;
}

export async function memoryGetEventById(id: number): Promise<EventWithAvailability | null> {
  const event = state().events.find((row) => row.id === id);
  return event ? hydrateEvent(withBookings(event)) : null;
}

export async function memoryCreateEvent(input: EventInput): Promise<number> {
  return exclusive(() => {
    const db = state();
    const id = db.nextEventId++;
    const created = nowIso();
    db.events.push({
      id,
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      description: input.description,
      location: input.location,
      meeting_point: input.meetingPoint,
      map_url: input.mapUrl,
      event_date: input.date,
      start_time: input.startTime,
      arrival_time: input.arrivalTime,
      end_time: input.endTime,
      distance_5km: input.distance5km,
      distance_10km: input.distance10km,
      difficulty: input.difficulty,
      price_cents: input.priceCents,
      payment_link: input.paymentLink,
      capacity: input.capacity,
      image: input.image,
      gallery: input.gallery,
      schedule: input.schedule,
      includes: input.includes,
      bring: input.bring,
      published: input.published,
      bookings_closed: input.bookingsClosed,
      created_at: created,
      updated_at: created,
    });
    return id;
  });
}

export async function memoryUpdateEvent(id: number, input: EventInput): Promise<void> {
  await exclusive(() => {
    const event = state().events.find((row) => row.id === id);
    if (!event) return;
    Object.assign(event, {
      slug: input.slug,
      title: input.title,
      category: input.category,
      summary: input.summary,
      description: input.description,
      location: input.location,
      meeting_point: input.meetingPoint,
      map_url: input.mapUrl,
      event_date: input.date,
      start_time: input.startTime,
      arrival_time: input.arrivalTime,
      end_time: input.endTime,
      distance_5km: input.distance5km,
      distance_10km: input.distance10km,
      difficulty: input.difficulty,
      price_cents: input.priceCents,
      payment_link: input.paymentLink,
      capacity: input.capacity,
      image: input.image,
      gallery: input.gallery,
      schedule: input.schedule,
      includes: input.includes,
      bring: input.bring,
      published: input.published,
      bookings_closed: input.bookingsClosed,
      updated_at: nowIso(),
    });
  });
}

export async function memoryDeleteEvent(id: number): Promise<void> {
  await exclusive(() => {
    const db = state();
    db.events = db.events.filter((event) => event.id !== id);
    db.bookings = db.bookings.filter((booking) => booking.event_id !== id);
  });
}

export async function memorySetBookingsClosed(id: number, closed: boolean): Promise<void> {
  await exclusive(() => {
    const event = state().events.find((row) => row.id === id);
    if (event) {
      event.bookings_closed = closed;
      event.updated_at = nowIso();
    }
  });
}

export async function memorySetPublished(id: number, published: boolean): Promise<void> {
  await exclusive(() => {
    const event = state().events.find((row) => row.id === id);
    if (event) {
      event.published = published;
      event.updated_at = nowIso();
    }
  });
}

export async function memorySlugTaken(slug: string, ignoreId?: number): Promise<boolean> {
  return state().events.some((event) => event.slug === slug && event.id !== ignoreId);
}

function hydrateBooking(row: BookingRecord | undefined): BookingWithEvent | null {
  if (!row) return null;
  const event = state().events.find((item) => item.id === row.event_id);
  if (!event) return null;
  return { ...mapBooking(row), event: hydrateEvent(withBookings(event)) };
}

export async function memoryGetBookingByReference(reference: string): Promise<BookingWithEvent | null> {
  const row = state().bookings.find(
    (booking) => booking.reference.toUpperCase() === reference.toUpperCase(),
  );
  return hydrateBooking(row);
}

export async function memoryGetBookingByToken(token: string): Promise<BookingWithEvent | null> {
  const cleaned = token.trim().toLowerCase();
  if (!cleaned) return null;
  const row = state().bookings.find(
    (booking) =>
      booking.checkin_token === cleaned || booking.qr_payload?.toLowerCase() === cleaned,
  );
  return hydrateBooking(row);
}

export async function memoryInsertBooking(row: Omit<BookingRecord, "id" | "created_at">): Promise<BookingRecord> {
  return exclusive(() => {
    const db = state();
    const event = db.events.find((item) => item.id === row.event_id);
    if (!event) {
      throw new Error("not_found");
    }
    const booked = db.bookings
      .filter((booking) => booking.event_id === row.event_id && booking.status === "confirmed")
      .reduce((total, booking) => total + booking.people, 0);
    if (row.people > Math.max(event.capacity - booked, 0)) {
      throw new Error("sold_out");
    }
    const created: BookingRecord = {
      ...row,
      id: db.nextBookingId++,
      created_at: nowIso(),
    };
    db.bookings.push(created);
    return created;
  });
}

export async function memoryReferenceTaken(reference: string): Promise<boolean> {
  return state().bookings.some((booking) => booking.reference === reference);
}

export async function memoryTokenTaken(token: string): Promise<boolean> {
  return state().bookings.some(
    (booking) => booking.checkin_token === token || booking.qr_payload === qrPayload(token),
  );
}

export async function memorySearchBookingsForEvent(
  eventId: number,
  like: string,
  exactId: string,
): Promise<Booking[]> {
  const needle = like.toLowerCase();
  return state()
    .bookings.filter((booking) => {
      if (booking.event_id !== eventId) return false;
      return (
        String(booking.id) === exactId ||
        booking.reference.toLowerCase().includes(needle) ||
        booking.name.toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => {
      const cancel = Number(a.status === "cancelled") - Number(b.status === "cancelled");
      if (cancel !== 0) return cancel;
      const idMatch = Number(String(a.id) !== exactId) - Number(String(b.id) !== exactId);
      if (idMatch !== 0) return idMatch;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 20)
    .map(mapBooking);
}

export async function memoryGetBookingRecordById(id: number): Promise<BookingWithEvent | null> {
  return hydrateBooking(state().bookings.find((booking) => booking.id === id));
}

export async function memoryGetBookingRecordByToken(token: string): Promise<BookingWithEvent | null> {
  return memoryGetBookingByToken(token);
}

export async function memoryCheckIn(id: number): Promise<BookingRecord | null> {
  return exclusive(() => {
    const row = state().bookings.find((booking) => booking.id === id);
    if (!row) return null;
    if (!row.checked_in_at) row.checked_in_at = nowIso();
    return row;
  });
}

export async function memoryGetCheckInStats(eventId: number) {
  const rows = state().bookings.filter((booking) => booking.event_id === eventId);
  const confirmed = rows.filter((booking) => booking.status === "confirmed");
  const checked = confirmed.filter((booking) => booking.checked_in_at);
  return {
    confirmed: confirmed.length,
    hikers: confirmed.reduce((total, booking) => total + booking.people, 0),
    checkedInBookings: checked.length,
    checkedInHikers: checked.reduce((total, booking) => total + booking.people, 0),
  };
}

export async function memoryGetBookingsForEvent(eventId: number): Promise<Booking[]> {
  return state()
    .bookings.filter((booking) => booking.event_id === eventId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
    .map(mapBooking);
}

export async function memoryGetRecentBookings(limit = 10): Promise<BookingWithEvent[]> {
  return state()
    .bookings.slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
    .slice(0, limit)
    .flatMap((row) => {
      const hydrated = hydrateBooking(row);
      return hydrated ? [hydrated] : [];
    });
}

export async function memoryUpdateBookingStatus(id: number, status: Booking["status"]): Promise<void> {
  await exclusive(() => {
    const row = state().bookings.find((booking) => booking.id === id);
    if (row) row.status = status;
  });
}

export async function memoryUpdatePaymentStatus(id: number, status: PaymentStatus): Promise<void> {
  await exclusive(() => {
    const row = state().bookings.find((booking) => booking.id === id);
    if (row) row.payment_status = status;
  });
}

export async function memoryGetClubStats() {
  const db = state();
  const confirmed = db.bookings.filter((booking) => booking.status === "confirmed");
  return {
    bookedHikers: confirmed.reduce((total, booking) => total + booking.people, 0),
    totalEvents: db.events.length,
    paidRevenueCents: confirmed
      .filter((booking) => booking.payment_status === "paid")
      .reduce((total, booking) => total + booking.amount_cents, 0),
  };
}

export async function memoryExclusive<T>(fn: () => T | Promise<T>): Promise<T> {
  return exclusive(fn);
}
