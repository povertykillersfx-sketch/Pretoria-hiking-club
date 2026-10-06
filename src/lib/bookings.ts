import { randomBytes } from "node:crypto";
import { getEventById, getEventBySlug, withAvailability } from "./events";
import { usingSupabase, getSupabase } from "./db";
import {
  memoryCheckIn,
  memoryGetBookingByReference,
  memoryGetBookingByToken,
  memoryGetBookingRecordById,
  memoryGetBookingsForEvent,
  memoryGetCheckInStats,
  memoryGetClubStats,
  memoryGetRecentBookings,
  memoryInsertBooking,
  memoryReferenceTaken,
  memorySearchBookingsForEvent,
  memoryTokenTaken,
  memoryUpdateBookingStatus,
  memoryUpdatePaymentStatus,
} from "./memory-store";
import { mapBooking, type BookingRecord } from "./records";
import { qrPayload } from "./qr";
import type {
  Booking,
  BookingWithEvent,
  PaymentMethod,
  PaymentStatus,
  TrailDistance,
} from "./types";

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

function bookingErrorFromMessage(message: string): BookingError | null {
  if (message.includes("sold_out")) {
    return new BookingError("sold_out", "This hike is fully booked.");
  }
  if (message.includes("closed")) {
    return new BookingError("closed", "Bookings for this hike are closed.");
  }
  if (message.includes("not_found")) {
    return new BookingError("not_found", "That event could not be found.");
  }
  if (message.includes("invalid")) {
    return new BookingError("invalid", "That booking is not valid for this event.");
  }
  return null;
}

async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const reference = generateReference();
    if (usingSupabase()) {
      const { data, error } = await getSupabase()
        .from("bookings")
        .select("id")
        .eq("reference", reference)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return reference;
    } else if (!(await memoryReferenceTaken(reference))) {
      return reference;
    }
  }
  return generateReference();
}

async function uniqueCheckinToken(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = generateCheckinToken();
    if (usingSupabase()) {
      const { data, error } = await getSupabase()
        .from("bookings")
        .select("id")
        .or(`checkin_token.eq.${token},qr_payload.eq.${qrPayload(token)}`)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return token;
    } else if (!(await memoryTokenTaken(token))) {
      return token;
    }
  }
  return generateCheckinToken();
}

async function hydrateBooking(row: BookingRecord | null | undefined): Promise<BookingWithEvent | null> {
  if (!row) return null;
  const event = await getEventById(Number(row.event_id));
  if (!event) return null;
  return { ...mapBooking(row), event };
}

export async function createBooking(input: CreateBookingInput): Promise<BookingWithEvent> {
  const event = await getEventBySlug(input.eventSlug);
  if (!event) throw new BookingError("not_found", "That event could not be found.");
  if (event.isPast) throw new BookingError("closed", "This event has already taken place.");
  if (!event.published || event.bookingsClosed) {
    throw new BookingError("closed", "Bookings for this hike are closed.");
  }
  if (input.people < 1 || input.people > 10) {
    throw new BookingError("invalid", "You can book between 1 and 10 spots at a time.");
  }
  if (input.distance === "5KM" && !event.distance5km) {
    throw new BookingError("invalid", "The 5KM route is not available for this event.");
  }
  if (input.distance === "10KM" && !event.distance10km) {
    throw new BookingError("invalid", "The 10KM route is not available for this event.");
  }
  if (input.people > event.spotsRemaining) {
    throw new BookingError(
      "sold_out",
      event.spotsRemaining === 0
        ? "This hike is fully booked."
        : `Only ${event.spotsRemaining} ${event.spotsRemaining === 1 ? "spot is" : "spots are"} left for this hike.`,
    );
  }

  const isFree = event.priceCents === 0;
  const amountCents = event.priceCents * input.people;
  const paymentMethod: PaymentMethod = isFree ? "free" : input.paymentMethod;
  const paymentStatus: PaymentStatus = isFree ? "not_required" : "pending";
  const reference = await uniqueReference();
  const token = await uniqueCheckinToken();
  const payload = qrPayload(token);
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const notes = input.notes?.trim() || null;

  if (!usingSupabase()) {
    try {
      const created = await memoryInsertBooking({
        reference,
        event_id: event.id,
        distance: input.distance,
        name,
        email,
        phone,
        people: input.people,
        amount_cents: amountCents,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        status: "confirmed",
        notes,
        checkin_token: token,
        qr_payload: payload,
        checked_in_at: null,
      });
      return (await hydrateBooking(created))!;
    } catch (error) {
      const mapped = bookingErrorFromMessage(error instanceof Error ? error.message : "");
      if (mapped) throw mapped;
      throw error;
    }
  }

  const { data, error } = await getSupabase()
    .rpc("create_hike_booking", {
      p_event_slug: input.eventSlug,
      p_distance: input.distance,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_people: input.people,
      p_amount_cents: amountCents,
      p_payment_method: paymentMethod,
      p_payment_status: paymentStatus,
      p_notes: notes,
      p_reference: reference,
      p_checkin_token: token,
      p_qr_payload: payload,
    })
    .maybeSingle();

  if (error) {
    const mapped = bookingErrorFromMessage(error.message);
    if (mapped) throw mapped;

    // RPC missing (schema not applied yet): insert the row directly.
    if (error.message.toLowerCase().includes("could not find the function")) {
      const { data: inserted, error: insertError } = await getSupabase()
        .from("bookings")
        .insert({
          reference,
          event_id: event.id,
          distance: input.distance,
          name,
          email,
          phone,
          people: input.people,
          amount_cents: amountCents,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          status: "confirmed",
          notes,
          checkin_token: token,
          qr_payload: payload,
        })
        .select("*")
        .single();

      if (insertError) {
        throw bookingErrorFromMessage(insertError.message) ?? new Error(insertError.message);
      }
      return (await hydrateBooking(inserted as BookingRecord))!;
    }

    throw new Error(error.message);
  }

  return (await hydrateBooking(data as BookingRecord))!;
}

export async function getBookingByReference(reference: string): Promise<BookingWithEvent | null> {
  if (!usingSupabase()) return memoryGetBookingByReference(reference);

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .eq("reference", reference.toUpperCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return hydrateBooking(data as BookingRecord | null);
}

export async function getBookingByToken(token: string): Promise<BookingWithEvent | null> {
  const cleaned = token.trim().toLowerCase();
  if (!cleaned) return null;
  if (!usingSupabase()) return memoryGetBookingByToken(cleaned);

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .or(`checkin_token.eq.${cleaned},qr_payload.eq.${cleaned},qr_payload.eq.${qrPayload(cleaned)}`)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return hydrateBooking(data as BookingRecord | null);
}

export async function lookupHikerTicket(
  reference: string,
  email: string,
): Promise<BookingWithEvent | null> {
  const booking = await getBookingByReference(reference);
  if (!booking) return null;
  if (booking.email !== email.trim().toLowerCase()) return null;
  return booking;
}

export async function searchBookingsForEvent(eventId: number, query: string): Promise<Booking[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const parsed = parseCheckInCode(term);
  if (parsed?.token) {
    const booking = await getBookingByToken(parsed.token);
    return booking && booking.eventId === eventId ? [booking] : [];
  }

  const safe = term.replace(/[%_,]/g, "");
  if (safe.length < 2) return [];

  if (!usingSupabase()) {
    return memorySearchBookingsForEvent(eventId, safe, term);
  }

  const like = `%${safe}%`;
  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .eq("event_id", eventId)
    .or(`reference.ilike.${like},name.ilike.${like},id.eq.${Number.isFinite(Number(term)) ? Number(term) : -1}`)
    .limit(20);

  if (error) throw new Error(error.message);

  return (data as BookingRecord[])
    .sort((a, b) => {
      const cancel = Number(a.status === "cancelled") - Number(b.status === "cancelled");
      if (cancel !== 0) return cancel;
      const idMatch = Number(String(a.id) !== term) - Number(String(b.id) !== term);
      if (idMatch !== 0) return idMatch;
      return a.name.localeCompare(b.name);
    })
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

export async function checkInBooking(eventId: number, code: string): Promise<CheckInResult> {
  const parsed = parseCheckInCode(code);
  if (!parsed) {
    return { ok: false, reason: "not_found", message: "This QR code is not a valid booking." };
  }

  let booking: BookingWithEvent | null = null;
  if (parsed.token) booking = await getBookingByToken(parsed.token);
  else if (parsed.reference) booking = await getBookingByReference(parsed.reference);
  else if (parsed.id != null) {
    if (usingSupabase()) {
      const { data, error } = await getSupabase()
        .from("bookings")
        .select("*")
        .eq("id", parsed.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      booking = await hydrateBooking(data as BookingRecord | null);
    } else {
      booking = await memoryGetBookingRecordById(parsed.id);
    }
  }

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

  if (booking.eventId !== eventId) {
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

  if (!usingSupabase()) {
    const updated = await memoryCheckIn(booking.id);
    return { ok: true, booking: (await hydrateBooking(updated))! };
  }

  const { data, error } = await getSupabase()
    .rpc("check_in_hike_booking", { p_booking_id: booking.id })
    .maybeSingle();

  if (error) {
    if (error.message.includes("already_checked_in")) {
      return {
        ok: false,
        reason: "already_checked_in",
        message: `${booking.name} is already checked in.`,
        booking,
      };
    }
    if (error.message.toLowerCase().includes("could not find the function")) {
      const { data: updated, error: updateError } = await getSupabase()
        .from("bookings")
        .update({ checked_in_at: new Date().toISOString() })
        .eq("id", booking.id)
        .is("checked_in_at", null)
        .select("*")
        .maybeSingle();

      if (updateError) throw new Error(updateError.message);
      const hydrated = await hydrateBooking((updated as BookingRecord | null) ?? null);
      if (!hydrated) {
        return { ok: false, reason: "already_checked_in", message: `${booking.name} is already checked in.`, booking };
      }
      return { ok: true, booking: hydrated };
    }
    throw new Error(error.message);
  }

  const hydrated = await hydrateBooking(data as BookingRecord);
  if (hydrated?.checkedInAt && hydrated.checkedInAt === booking.checkedInAt) {
    return {
      ok: false,
      reason: "already_checked_in",
      message: `${booking.name} is already checked in.`,
      booking: hydrated,
    };
  }

  return { ok: true, booking: hydrated! };
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

export async function getCheckInStats(eventId: number): Promise<{
  confirmed: number;
  hikers: number;
  checkedInBookings: number;
  checkedInHikers: number;
}> {
  if (!usingSupabase()) return memoryGetCheckInStats(eventId);

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("people, status, checked_in_at")
    .eq("event_id", eventId);

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const confirmed = rows.filter((row) => row.status === "confirmed");
  const checked = confirmed.filter((row) => row.checked_in_at);
  return {
    confirmed: confirmed.length,
    hikers: confirmed.reduce((total, row) => total + Number(row.people), 0),
    checkedInBookings: checked.length,
    checkedInHikers: checked.reduce((total, row) => total + Number(row.people), 0),
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

export async function getBookingsForEvent(eventId: number): Promise<Booking[]> {
  if (!usingSupabase()) return memoryGetBookingsForEvent(eventId);

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as BookingRecord[]).map(mapBooking);
}

export async function getRecentBookings(limit = 10): Promise<BookingWithEvent[]> {
  if (!usingSupabase()) return memoryGetRecentBookings(limit);

  const { data, error } = await getSupabase()
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = (data as BookingRecord[]) ?? [];
  const hydrated = await Promise.all(rows.map((row) => hydrateBooking(row)));
  return hydrated.filter((row): row is BookingWithEvent => row != null);
}

export async function updateBookingStatus(id: number, status: Booking["status"]): Promise<void> {
  if (!usingSupabase()) return memoryUpdateBookingStatus(id, status);

  const { error } = await getSupabase().from("bookings").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updatePaymentStatus(id: number, status: PaymentStatus): Promise<void> {
  if (!usingSupabase()) return memoryUpdatePaymentStatus(id, status);

  const { error } = await getSupabase().from("bookings").update({ payment_status: status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getClubStats() {
  if (!usingSupabase()) return memoryGetClubStats();

  const [{ count, error: eventError }, { data, error }] = await Promise.all([
    getSupabase().from("events").select("*", { count: "exact", head: true }),
    getSupabase().from("bookings").select("people, amount_cents, status, payment_status"),
  ]);

  if (eventError) throw new Error(eventError.message);
  if (error) throw new Error(error.message);

  const confirmed = (data ?? []).filter((row) => row.status === "confirmed");
  return {
    bookedHikers: confirmed.reduce((total, row) => total + Number(row.people), 0),
    totalEvents: count ?? 0,
    paidRevenueCents: confirmed
      .filter((row) => row.payment_status === "paid")
      .reduce((total, row) => total + Number(row.amount_cents), 0),
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
