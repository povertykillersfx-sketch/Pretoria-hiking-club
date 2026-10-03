"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { lookupHikerTicket } from "@/lib/bookings";

export type TicketLookupState = {
  status: "idle" | "error";
  message?: string;
};

export async function lookupTicket(
  _prev: TicketLookupState,
  formData: FormData,
): Promise<TicketLookupState> {
  const parsed = z
    .object({
      reference: z.string().trim().min(4, "Enter your booking reference."),
      email: z.string().trim().email("Enter the email you booked with."),
    })
    .safeParse({
      reference: formData.get("reference"),
      email: formData.get("email"),
    });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  const raw = parsed.data.reference.trim().toUpperCase();
  const reference = raw.startsWith("PHC-") ? raw : `PHC-${raw}`;

  const booking = lookupHikerTicket(reference, parsed.data.email);
  if (!booking) {
    return {
      status: "error",
      message: "We could not find a booking with that reference and email.",
    };
  }

  redirect(`/booking/${booking.reference}`);
}
