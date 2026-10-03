import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckInDesk } from "@/components/admin/check-in-desk";
import { isAuthenticated } from "@/lib/auth";
import { getCheckInStats } from "@/lib/bookings";
import { getEventById } from "@/lib/events";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CheckInEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { eventId } = await params;
  const event = getEventById(Number(eventId));
  if (!event) notFound();

  const stats = getCheckInStats(event.id);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href="/admin/check-in"
        className="text-sm font-semibold text-forest-300 underline underline-offset-4"
      >
        ← All events
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-300">
            Trailhead check-in
          </p>
          <h1 className="display mt-2 text-4xl text-white sm:text-5xl">{event.title}</h1>
          <p className="mt-3 text-white/60">
            {formatDate(event.date)} · {event.location} · arrive {event.arrivalTime}
          </p>
        </div>
        <Link
          href={`/admin/events/${event.id}/bookings`}
          className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
        >
          Attendee list
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Checked in", value: `${stats.checkedInBookings}/${stats.confirmed}` },
          { label: "Hikers on the trail", value: `${stats.checkedInHikers}/${stats.hikers}` },
          {
            label: "Still to arrive",
            value: String(Math.max(stats.confirmed - stats.checkedInBookings, 0)),
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-300">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <CheckInDesk eventId={event.id} eventTitle={event.title} />
      </div>
    </div>
  );
}
