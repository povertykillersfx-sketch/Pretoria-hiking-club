import {
  memoryCreateEvent,
  memoryDeleteEvent,
  memoryGetAllEventsForAdmin,
  memoryGetEventById,
  memoryGetEventBySlug,
  memoryGetPastEvents,
  memoryGetUpcomingEvents,
  memorySetBookingsClosed,
  memorySetPublished,
  memorySlugTaken,
  memoryUpdateEvent,
} from "./memory-store";
import { hydrateEvent, todayIso, type EventRecord } from "./records";
import { getSupabase, throwSupabaseError, usingSupabase } from "./db";
import type { EventInput, EventWithAvailability } from "./types";

export type { EventInput } from "./types";
export { withAvailability } from "./records";

const EVENT_SELECT = "*, bookings(people, status)";

function toEventRow(input: EventInput) {
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
  };
}

async function supabaseRows(
  query: PromiseLike<{ data: EventRecord[] | null; error: { message: string } | null }>,
): Promise<EventWithAvailability[]> {
  const { data, error } = await query;
  if (error) throwSupabaseError(error);
  return (data ?? []).map((row) => hydrateEvent(row));
}

export async function getUpcomingEvents(limit?: number): Promise<EventWithAvailability[]> {
  if (!usingSupabase()) return memoryGetUpcomingEvents(limit);

  let request = getSupabase()
    .from("events")
    .select(EVENT_SELECT)
    .eq("published", true)
    .gte("event_date", todayIso())
    .order("event_date", { ascending: true });

  if (limit) request = request.limit(limit);
  return supabaseRows(request);
}

export async function getPastEvents(limit = 6): Promise<EventWithAvailability[]> {
  if (!usingSupabase()) return memoryGetPastEvents(limit);

  return supabaseRows(
    getSupabase()
      .from("events")
      .select(EVENT_SELECT)
      .eq("published", true)
      .lt("event_date", todayIso())
      .order("event_date", { ascending: false })
      .limit(limit),
  );
}

export async function getAllEventsForAdmin(): Promise<EventWithAvailability[]> {
  if (!usingSupabase()) return memoryGetAllEventsForAdmin();

  return supabaseRows(
    getSupabase().from("events").select(EVENT_SELECT).order("event_date", { ascending: true }),
  );
}

export async function getEventBySlug(slug: string): Promise<EventWithAvailability | null> {
  if (!usingSupabase()) return memoryGetEventBySlug(slug);

  const { data, error } = await getSupabase()
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throwSupabaseError(error);
  return data ? hydrateEvent(data as EventRecord) : null;
}

export async function getEventById(id: number): Promise<EventWithAvailability | null> {
  if (!usingSupabase()) return memoryGetEventById(id);

  const { data, error } = await getSupabase()
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throwSupabaseError(error);
  return data ? hydrateEvent(data as EventRecord) : null;
}

export async function getBookableEvents(): Promise<EventWithAvailability[]> {
  return (await getUpcomingEvents()).filter((event) => event.bookingOpen);
}

export async function createEvent(input: EventInput): Promise<number> {
  if (!usingSupabase()) return memoryCreateEvent(input);

  const { data, error } = await getSupabase()
    .from("events")
    .insert(toEventRow(input))
    .select("id")
    .single();

  if (error || data == null) throwSupabaseError(error ?? { message: "Could not create event." });
  return Number(data.id);
}

export async function updateEvent(id: number, input: EventInput): Promise<void> {
  if (!usingSupabase()) return memoryUpdateEvent(id, input);

  const { error } = await getSupabase()
    .from("events")
    .update({ ...toEventRow(input), updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throwSupabaseError(error);
}

export async function deleteEvent(id: number): Promise<void> {
  if (!usingSupabase()) return memoryDeleteEvent(id);

  const { error } = await getSupabase().from("events").delete().eq("id", id);
  if (error) throwSupabaseError(error);
}

export async function setBookingsClosed(id: number, closed: boolean): Promise<void> {
  if (!usingSupabase()) return memorySetBookingsClosed(id, closed);

  const { error } = await getSupabase()
    .from("events")
    .update({ bookings_closed: closed, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throwSupabaseError(error);
}

export async function setPublished(
  id: number,
  published: boolean,
): Promise<{ ok: true } | { ok: false; reason: "payment_link" }> {
  if (published) {
    const event = await getEventById(id);
    if (event && event.priceCents > 0 && !event.paymentLink) {
      return { ok: false, reason: "payment_link" };
    }
  }

  if (!usingSupabase()) {
    await memorySetPublished(id, published);
    return { ok: true };
  }

  const { error } = await getSupabase()
    .from("events")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throwSupabaseError(error);
  return { ok: true };
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

export async function uniqueSlug(base: string, ignoreId?: number): Promise<string> {
  const root = slugify(base) || "event";
  let candidate = root;
  let suffix = 2;

  for (;;) {
    const taken = usingSupabase()
      ? await (async () => {
          const { data, error } = await getSupabase()
            .from("events")
            .select("id")
            .eq("slug", candidate)
            .maybeSingle();
          if (error) throwSupabaseError(error);
          return data != null && Number(data.id) !== ignoreId;
        })()
      : await memorySlugTaken(candidate, ignoreId);

    if (!taken) return candidate;
    candidate = `${root}-${suffix++}`;
  }
}
