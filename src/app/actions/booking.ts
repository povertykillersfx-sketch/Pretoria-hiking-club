"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { BookingError, createBooking } from "@/lib/bookings";
import { sendAdminBookingAlert, sendBookingConfirmation } from "@/lib/email";
import { sendContactMessage } from "@/lib/email";

const bookingSchema = z.object({
  eventSlug: z.string().min(1),
  distance: z.enum(["5KM", "10KM"]),
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(9, "Please enter a valid phone number.")
    .regex(/^[0-9+()\s-]{9,20}$/, "Please enter a valid phone number."),
  people: z.coerce.number().int().min(1, "At least one spot.").max(10, "Maximum 10 spots per booking."),
  paymentMethod: z.enum(["card", "eft", "free"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type BookingFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitBooking(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingSchema.safeParse({
    eventSlug: formData.get("eventSlug"),
    distance: formData.get("distance"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    people: formData.get("people"),
    paymentMethod: formData.get("paymentMethod"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  let reference: string;

  try {
    const booking = createBooking({
      eventSlug: parsed.data.eventSlug,
      distance: parsed.data.distance,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      people: parsed.data.people,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes || null,
    });

    reference = booking.reference;

    try {
      await sendBookingConfirmation(booking);
      await sendAdminBookingAlert(booking);
    } catch (error) {
      // A failed email must never lose a confirmed booking.
      console.error("[booking] confirmation email failed", error);
    }
  } catch (error) {
    if (error instanceof BookingError) {
      return { status: "error", message: error.message };
    }
    console.error("[booking] unexpected failure", error);
    return {
      status: "error",
      message: "Something went wrong on our side. Please try again or WhatsApp us.",
    };
  }

  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/booking/${reference}`);
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  message: z.string().trim().min(10, "Tell us a little more (10 characters minimum)."),
});

export type ContactFormState = {
  status: "idle" | "error" | "sent";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the form." };
  }

  try {
    await sendContactMessage(parsed.data);
  } catch (error) {
    console.error("[contact] failed", error);
    return {
      status: "error",
      message: `Could not send right now — please email us directly.`,
    };
  }

  return { status: "sent", message: "Thanks! We will get back to you within 24 hours." };
}
