import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteEventAction } from "@/app/actions/admin";
import { EventForm } from "@/components/admin/event-form";
import { isAuthenticated } from "@/lib/auth";
import { getEventById } from "@/lib/events";
import { getImageLibrary } from "@/lib/media";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const event = getEventById(Number(id));

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/admin/events"
        className="text-sm font-semibold text-forest-300 underline underline-offset-4"
      >
        ← Back to events
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-white sm:text-5xl">Edit event</h1>
          <p className="mt-3 text-white/60">
            {event.spotsBooked} of {event.capacity} spots booked ·{" "}
            {event.spotsRemaining} remaining
          </p>
        </div>
        <Link
          href={`/admin/events/${event.id}/bookings`}
          className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
        >
          View attendees
        </Link>
      </div>

      <div className="mt-10">
        <EventForm event={event} library={getImageLibrary()} />
      </div>

      <form
        action={deleteEventAction}
        className="mt-12 rounded-3xl border border-ember/30 bg-ember/10 p-6"
      >
        <input type="hidden" name="id" value={event.id} />
        <h2 className="font-display text-lg font-bold tracking-tight text-white">
          Delete this event
        </h2>
        <p className="mt-2 text-sm text-white/60">
          This removes the event and all {event.spotsBooked} booked spots. It
          cannot be undone.
        </p>
        <button
          type="submit"
          className="mt-4 rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-clay hover:text-white"
        >
          Delete event
        </button>
      </form>
    </div>
  );
}
