"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import {
  checkInBooking,
  searchBookingsForEvent,
  type CheckInResult,
} from "@/lib/bookings";

export type CheckInView = {
  ok: boolean;
  reason?: "not_found" | "cancelled" | "wrong_event" | "already_checked_in";
  message: string;
  name?: string;
  reference?: string;
  distance?: string;
  people?: number;
  eventTitle?: string;
  eventDate?: string;
  checkedInAt?: string | null;
  paymentWarning?: string;
};

export type SearchHit = {
  id: number;
  name: string;
  reference: string;
  distance: string;
  people: number;
  status: string;
  checkedInAt: string | null;
};

function toView(result: CheckInResult): CheckInView {
  if (result.ok) {
    const { booking } = result;
    return {
      ok: true,
      message: `${booking.name} is checked in.`,
      name: booking.name,
      reference: booking.reference,
      distance: booking.distance,
      people: booking.people,
      eventTitle: booking.event.title,
      eventDate: booking.event.date,
      checkedInAt: booking.checkedInAt,
      paymentWarning:
        booking.paymentStatus === "pending"
          ? "EFT payment is still outstanding."
          : undefined,
    };
  }

  return {
    ok: false,
    reason: result.reason,
    message: result.message,
    name: result.booking?.name,
    reference: result.booking?.reference,
    distance: result.booking?.distance,
    people: result.booking?.people,
    eventTitle: result.booking?.event.title,
    eventDate: result.booking?.event.date,
    checkedInAt: result.booking?.checkedInAt ?? null,
  };
}

async function requireStaff(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

export async function submitCheckIn(eventId: number, code: string): Promise<CheckInView> {
  await requireStaff();
  const result = checkInBooking(eventId, code);
  revalidatePath("/admin/check-in");
  revalidatePath(`/admin/check-in/${eventId}`);
  revalidatePath(`/admin/events/${eventId}/bookings`);
  return toView(result);
}

export async function searchCheckIn(eventId: number, query: string): Promise<SearchHit[]> {
  await requireStaff();
  return searchBookingsForEvent(eventId, query).map((booking) => ({
    id: booking.id,
    name: booking.name,
    reference: booking.reference,
    distance: booking.distance,
    people: booking.people,
    status: booking.status,
    checkedInAt: booking.checkedInAt,
  }));
}
