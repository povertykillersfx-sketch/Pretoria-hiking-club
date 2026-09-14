"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSession,
  destroySession,
  isAuthenticated,
  verifyPassword,
} from "@/lib/auth";
import { updateBookingStatus, updatePaymentStatus } from "@/lib/bookings";
import {
  createEvent,
  deleteEvent,
  setBookingsClosed,
  setPublished,
  updateEvent,
  uniqueSlug,
  type EventInput,
} from "@/lib/events";
import { DEFAULT_SCHEDULE } from "@/lib/seed-data";
import type { ScheduleItem } from "@/lib/types";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!password || !verifyPassword(password)) {
    return { error: "That password is not right. Try again." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

const scheduleItemSchema = z.object({
  time: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().or(z.literal("")),
});

const eventSchema = z.object({
  title: z.string().trim().min(3, "Give the event a title."),
  slug: z.string().trim().optional().or(z.literal("")),
  category: z.enum(["hike", "camping", "getaway", "social"]),
  summary: z.string().trim().min(10, "Write a short summary for the event card."),
  description: z.string().trim().min(20, "Add a longer description."),
  location: z.string().trim().min(3, "Where is it?"),
  meetingPoint: z.string().trim().min(3, "Add a meeting point."),
  mapUrl: z.string().trim().url("Map link must be a URL.").optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  startTime: z.string().trim().min(2, "Add a starting time."),
  arrivalTime: z.string().trim().min(2, "Add an arrival time."),
  endTime: z.string().trim().optional().or(z.literal("")),
  distance5km: z.coerce.boolean(),
  distance10km: z.coerce.boolean(),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
  priceRands: z.coerce.number().min(0, "Price cannot be negative."),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1."),
  image: z.string().trim().min(1, "Choose a cover photo."),
  gallery: z.string().optional().or(z.literal("")),
  schedule: z.string().optional().or(z.literal("")),
  includes: z.string().optional().or(z.literal("")),
  bring: z.string().optional().or(z.literal("")),
  published: z.coerce.boolean(),
  bookingsClosed: z.coerce.boolean(),
});

export type EventFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function lines(value: string | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseSchedule(value: string | undefined): ScheduleItem[] {
  if (!value) return DEFAULT_SCHEDULE;

  try {
    const parsed = JSON.parse(value);
    const result = z.array(scheduleItemSchema).safeParse(parsed);
    if (!result.success || result.data.length === 0) return DEFAULT_SCHEDULE;
    return result.data.map((item) => ({
      time: item.time,
      title: item.title,
      ...(item.description ? { description: item.description } : {}),
    }));
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

function toEventInput(data: z.infer<typeof eventSchema>, id?: number): EventInput {
  return {
    slug: uniqueSlug(data.slug?.trim() || data.title, id),
    title: data.title,
    category: data.category,
    summary: data.summary,
    description: data.description,
    location: data.location,
    meetingPoint: data.meetingPoint,
    mapUrl: data.mapUrl ? data.mapUrl : null,
    date: data.date,
    startTime: data.startTime,
    arrivalTime: data.arrivalTime,
    endTime: data.endTime ? data.endTime : null,
    distance5km: data.distance5km,
    distance10km: data.distance10km,
    difficulty: data.difficulty,
    priceCents: Math.round(data.priceRands * 100),
    capacity: data.capacity,
    image: data.image,
    gallery: lines(data.gallery),
    schedule: parseSchedule(data.schedule),
    includes: lines(data.includes),
    bring: lines(data.bring),
    published: data.published,
    bookingsClosed: data.bookingsClosed,
  };
}

function readEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    category: formData.get("category"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    location: formData.get("location"),
    meetingPoint: formData.get("meetingPoint"),
    mapUrl: formData.get("mapUrl") ?? "",
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    arrivalTime: formData.get("arrivalTime"),
    endTime: formData.get("endTime") ?? "",
    distance5km: formData.get("distance5km") === "on" || formData.get("distance5km") === "true",
    distance10km: formData.get("distance10km") === "on" || formData.get("distance10km") === "true",
    difficulty: formData.get("difficulty"),
    priceRands: formData.get("priceRands"),
    capacity: formData.get("capacity"),
    image: formData.get("image"),
    gallery: formData.get("gallery") ?? "",
    schedule: formData.get("schedule") ?? "",
    includes: formData.get("includes") ?? "",
    bring: formData.get("bring") ?? "",
    published: formData.get("published") === "on" || formData.get("published") === "true",
    bookingsClosed:
      formData.get("bookingsClosed") === "on" || formData.get("bookingsClosed") === "true",
  });
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

export async function saveEvent(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  await requireAdmin();

  const idValue = formData.get("id");
  const id = idValue ? Number(idValue) : undefined;
  const parsed = readEventForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  if (!parsed.data.distance5km && !parsed.data.distance10km) {
    return {
      status: "error",
      message: "Offer at least one trail distance.",
      fieldErrors: { distance5km: "Select 5KM, 10KM or both." },
    };
  }

  const input = toEventInput(parsed.data, id);

  if (id) {
    updateEvent(id, input);
  } else {
    createEvent(input);
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/book");
  revalidatePath("/admin/events");
  redirect("/admin/events?saved=1");
}

export async function toggleBookingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const closed = formData.get("closed") === "true";
  setBookingsClosed(id, closed);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function togglePublishedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const published = formData.get("published") === "true";
  setPublished(id, published);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireAdmin();
  deleteEvent(Number(formData.get("id")));
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
  redirect("/admin/events?deleted=1");
}

export async function markBookingPaidAction(formData: FormData): Promise<void> {
  await requireAdmin();
  updatePaymentStatus(Number(formData.get("id")), "paid");
  revalidatePath(`/admin/events/${formData.get("eventId")}/bookings`);
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const cancel = formData.get("cancel") === "true";
  updateBookingStatus(Number(formData.get("id")), cancel ? "cancelled" : "confirmed");
  revalidatePath(`/admin/events/${formData.get("eventId")}/bookings`);
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}
