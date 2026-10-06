import type {
  Booking,
  BookingStatus,
  Difficulty,
  EventCategory,
  EventWithAvailability,
  HikeEvent,
  PaymentMethod,
  PaymentStatus,
  ScheduleItem,
  TrailDistance,
} from "./types";

export type EventRecord = {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  location: string;
  meeting_point: string;
  map_url: string | null;
  event_date: string;
  start_time: string;
  arrival_time: string;
  end_time: string | null;
  distance_5km: boolean | number;
  distance_10km: boolean | number;
  difficulty: string;
  price_cents: number;
  payment_link: string | null;
  capacity: number;
  image: string;
  gallery: unknown;
  schedule: unknown;
  includes: unknown;
  bring: unknown;
  published: boolean | number;
  bookings_closed: boolean | number;
  created_at: string;
  updated_at: string;
  bookings?: { people: number; status: string }[] | null;
  spots_booked?: number | null;
};

export type BookingRecord = {
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
  qr_payload: string | null;
  checked_in_at: string | null;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function asIsoDate(value: string): string {
  return value.slice(0, 10);
}

export function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function mapEvent(row: EventRecord): HikeEvent {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    category: row.category as EventCategory,
    summary: row.summary,
    description: row.description,
    location: row.location,
    meetingPoint: row.meeting_point,
    mapUrl: row.map_url,
    date: asIsoDate(String(row.event_date)),
    startTime: row.start_time,
    arrivalTime: row.arrival_time,
    endTime: row.end_time,
    distance5km: Boolean(row.distance_5km),
    distance10km: Boolean(row.distance_10km),
    difficulty: row.difficulty as Difficulty,
    priceCents: row.price_cents,
    paymentLink: row.payment_link?.trim() ? row.payment_link.trim() : null,
    capacity: row.capacity,
    image: row.image,
    gallery: parseJson<string[]>(row.gallery, []),
    schedule: parseJson<ScheduleItem[]>(row.schedule, []),
    includes: parseJson<string[]>(row.includes, []),
    bring: parseJson<string[]>(row.bring, []),
    published: Boolean(row.published),
    bookingsClosed: Boolean(row.bookings_closed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function spotsBookedFrom(row: EventRecord): number {
  if (row.spots_booked != null) return Number(row.spots_booked);
  return (row.bookings ?? [])
    .filter((booking) => booking.status === "confirmed")
    .reduce((total, booking) => total + Number(booking.people), 0);
}

export function withAvailability(
  event: HikeEvent,
  spotsBooked: number,
): EventWithAvailability {
  const spotsRemaining = Math.max(event.capacity - spotsBooked, 0);
  const isPast = event.date < todayIso();
  const soldOut = spotsRemaining <= 0;

  return {
    ...event,
    spotsBooked,
    spotsRemaining,
    soldOut,
    isPast,
    bookingOpen: event.published && !event.bookingsClosed && !soldOut && !isPast,
  };
}

export function hydrateEvent(row: EventRecord): EventWithAvailability {
  return withAvailability(mapEvent(row), spotsBookedFrom(row));
}

export function mapBooking(row: BookingRecord): Booking {
  return {
    id: Number(row.id),
    reference: row.reference,
    eventId: Number(row.event_id),
    distance: row.distance as TrailDistance,
    name: row.name,
    email: row.email,
    phone: row.phone,
    people: row.people,
    amountCents: row.amount_cents,
    paymentMethod: row.payment_method as PaymentMethod,
    paymentStatus: row.payment_status as PaymentStatus,
    status: row.status as BookingStatus,
    notes: row.notes,
    createdAt: row.created_at,
    checkinToken: row.checkin_token ?? "",
    checkedInAt: row.checked_in_at,
  };
}
