import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getCheckInStats } from "@/lib/bookings";
import { getAllEventsForAdmin } from "@/lib/events";
import { formatDate } from "@/lib/format";
import type { EventWithAvailability } from "@/lib/types";

export const dynamic = "force-dynamic";

function EventRow({ event }: { event: EventWithAvailability }) {
  const stats = getCheckInStats(event.id);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
      <div className="min-w-0">
        <p className="font-semibold text-white">{event.title}</p>
        <p className="text-sm text-white/55">
          {formatDate(event.date)} · {event.location}
        </p>
        <p className="mt-1 text-xs text-white/45">
          {stats.checkedInBookings} of {stats.confirmed} bookings checked in
          {stats.hikers > 0 ? ` · ${stats.checkedInHikers}/${stats.hikers} hikers` : ""}
        </p>
      </div>
      <Link
        href={`/admin/check-in/${event.id}`}
        className="rounded-full bg-forest-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-400"
      >
        Open check-in
      </Link>
    </li>
  );
}

export default async function CheckInPickerPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const events = getAllEventsForAdmin();
  const upcoming = events.filter((event) => !event.isPast);
  const past = events.filter((event) => event.isPast).slice().reverse();

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="display text-4xl text-white sm:text-5xl">Check-in</h1>
      <p className="mt-3 text-white/60">
        Pick the hike happening today. Each QR only works for that event.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold tracking-tight text-white">Upcoming</h2>
        <ul className="mt-4 space-y-3">
          {upcoming.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
          {upcoming.length === 0 && (
            <li className="rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-white/50">
              No upcoming events.{" "}
              <Link href="/admin/events/new" className="text-forest-300 underline">
                Create one
              </Link>
              .
            </li>
          )}
        </ul>
      </section>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold tracking-tight text-white">Past hikes</h2>
          <ul className="mt-4 space-y-3">
            {past.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
