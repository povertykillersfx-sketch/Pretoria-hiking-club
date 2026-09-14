import { getDb } from "./db";
import type {
  Difficulty,
  EventCategory,
  EventWithAvailability,
  HikeEvent,
  ScheduleItem,
} from "./types";

type EventRow = {
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
  distance_5km: number;
  distance_10km: number;
  difficulty: string;
  price_cents: number;
  capacity: number;
  image: string;
  gallery: string;
  schedule: string;
  includes: string;
  bring: string;
  published: number;
  bookings_closed: number;
  created_at: string;
  updated_at: string;
  spots_booked?: number | null;
};

function parseJson<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function mapEvent(row: EventRow): HikeEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as EventCategory,
    summary: row.summary,
    description: row.description,
    location: row.location,
    meetingPoint: row.meeting_point,
    mapUrl: row.map_url,
    date: row.event_date,
    startTime: row.start_time,
    arrivalTime: row.arrival_time,
    endTime: row.end_time,
    distance5km: Boolean(row.distance_5km),
    distance10km: Boolean(row.distance_10km),
    difficulty: row.difficulty as Difficulty,
    priceCents: row.price_cents,
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

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
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
    bookingOpen:
      event.published && !event.bookingsClosed && !soldOut && !isPast,
  };
}

const SELECT_WITH_BOOKED = `
  SELECT e.*, COALESCE((
    SELECT SUM(b.people) FROM bookings b
    WHERE b.event_id = e.id AND b.status = 'confirmed'
  ), 0) AS spots_booked
  FROM events e
`;

function hydrate(rows: EventRow[]): EventWithAvailability[] {
  return rows.map((row) => withAvailability(mapEvent(row), Number(row.spots_booked ?? 0)));
}

export function getUpcomingEvents(limit?: number): EventWithAvailability[] {
  const rows = getDb()
    .prepare<[string], EventRow>(
      `${SELECT_WITH_BOOKED}
       WHERE e.published = 1 AND e.event_date >= ?
       ORDER BY e.event_date ASC
       ${limit ? `LIMIT ${Number(limit)}` : ""}`,
    )
    .all(todayIso());

  return hydrate(rows);
}

export function getPastEvents(limit = 6): EventWithAvailability[] {
  const rows = getDb()
    .prepare<[string], EventRow>(
      `${SELECT_WITH_BOOKED}
       WHERE e.published = 1 AND e.event_date < ?
       ORDER BY e.event_date DESC
       LIMIT ${Number(limit)}`,
    )
    .all(todayIso());

  return hydrate(rows);
}

export function getAllEventsForAdmin(): EventWithAvailability[] {
  const rows = getDb()
    .prepare<[], EventRow>(`${SELECT_WITH_BOOKED} ORDER BY e.event_date ASC`)
    .all();

  return hydrate(rows);
}

export function getEventBySlug(slug: string): EventWithAvailability | null {
  const row = getDb()
    .prepare<[string], EventRow>(`${SELECT_WITH_BOOKED} WHERE e.slug = ?`)
    .get(slug);

  return row ? hydrate([row])[0] : null;
}

export function getEventById(id: number): EventWithAvailability | null {
  const row = getDb()
    .prepare<[number], EventRow>(`${SELECT_WITH_BOOKED} WHERE e.id = ?`)
    .get(id);

  return row ? hydrate([row])[0] : null;
}

export function getBookableEvents(): EventWithAvailability[] {
  return getUpcomingEvents().filter((event) => event.bookingOpen);
}

export type EventInput = {
  slug: string;
  title: string;
  category: EventCategory;
  summary: string;
  description: string;
  location: string;
  meetingPoint: string;
  mapUrl: string | null;
  date: string;
  startTime: string;
  arrivalTime: string;
  endTime: string | null;
  distance5km: boolean;
  distance10km: boolean;
  difficulty: Difficulty;
  priceCents: number;
  capacity: number;
  image: string;
  gallery: string[];
  schedule: ScheduleItem[];
  includes: string[];
  bring: string[];
  published: boolean;
  bookingsClosed: boolean;
};

function toParams(input: EventInput) {
  return {
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
    distance_5km: input.distance5km ? 1 : 0,
    distance_10km: input.distance10km ? 1 : 0,
    difficulty: input.difficulty,
    price_cents: input.priceCents,
    capacity: input.capacity,
    image: input.image,
    gallery: JSON.stringify(input.gallery),
    schedule: JSON.stringify(input.schedule),
    includes: JSON.stringify(input.includes),
    bring: JSON.stringify(input.bring),
    published: input.published ? 1 : 0,
    bookings_closed: input.bookingsClosed ? 1 : 0,
  };
}

export function createEvent(input: EventInput): number {
  const info = getDb()
    .prepare(
      `INSERT INTO events (
         slug, title, category, summary, description, location, meeting_point, map_url,
         event_date, start_time, arrival_time, end_time, distance_5km, distance_10km,
         difficulty, price_cents, capacity, image, gallery, schedule, includes, bring,
         published, bookings_closed
       ) VALUES (
         @slug, @title, @category, @summary, @description, @location, @meeting_point, @map_url,
         @event_date, @start_time, @arrival_time, @end_time, @distance_5km, @distance_10km,
         @difficulty, @price_cents, @capacity, @image, @gallery, @schedule, @includes, @bring,
         @published, @bookings_closed
       )`,
    )
    .run(toParams(input));

  return Number(info.lastInsertRowid);
}

export function updateEvent(id: number, input: EventInput): void {
  getDb()
    .prepare(
      `UPDATE events SET
         slug = @slug, title = @title, category = @category, summary = @summary,
         description = @description, location = @location, meeting_point = @meeting_point,
         map_url = @map_url, event_date = @event_date, start_time = @start_time,
         arrival_time = @arrival_time, end_time = @end_time, distance_5km = @distance_5km,
         distance_10km = @distance_10km, difficulty = @difficulty, price_cents = @price_cents,
         capacity = @capacity, image = @image, gallery = @gallery, schedule = @schedule,
         includes = @includes, bring = @bring, published = @published,
         bookings_closed = @bookings_closed, updated_at = datetime('now')
       WHERE id = @id`,
    )
    .run({ ...toParams(input), id });
}

export function deleteEvent(id: number): void {
  getDb().prepare("DELETE FROM events WHERE id = ?").run(id);
}

export function setBookingsClosed(id: number, closed: boolean): void {
  getDb()
    .prepare(
      "UPDATE events SET bookings_closed = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .run(closed ? 1 : 0, id);
}

export function setPublished(id: number, published: boolean): void {
  getDb()
    .prepare(
      "UPDATE events SET published = ?, updated_at = datetime('now') WHERE id = ?",
    )
    .run(published ? 1 : 0, id);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function uniqueSlug(base: string, ignoreId?: number): string {
  const db = getDb();
  const root = slugify(base) || "event";
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const existing = db
      .prepare<[string], { id: number }>("SELECT id FROM events WHERE slug = ?")
      .get(candidate);

    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${root}-${suffix++}`;
  }
}
