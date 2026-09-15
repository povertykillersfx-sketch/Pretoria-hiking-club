import Link from "next/link";
import { redirect } from "next/navigation";
import { toggleBookingsAction, togglePublishedAction } from "@/app/actions/admin";
import { isAuthenticated } from "@/lib/auth";
import { getAllEventsForAdmin } from "@/lib/events";
import { formatDate, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { saved, deleted } = await searchParams;
  const events = getAllEventsForAdmin();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-white sm:text-5xl">Events</h1>
          <p className="mt-3 text-white/60">
            Create events, set capacity and prices, and close bookings when you
            are full.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-forest-500 px-5 py-3 font-display font-bold tracking-tight text-white transition-colors hover:bg-forest-400"
        >
          + New event
        </Link>
      </div>

      {(saved || deleted) && (
        <p className="mt-6 rounded-2xl border border-forest-400/30 bg-forest-500/15 px-5 py-3 text-sm font-semibold text-forest-300">
          {saved ? "Event saved." : "Event deleted."}
        </p>
      )}

      <div className="mt-8 space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold tracking-tight text-white">
                    {event.title}
                  </h2>
                  {!event.published && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/60">
                      Draft
                    </span>
                  )}
                  {event.soldOut && (
                    <span className="rounded-full bg-ember px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink">
                      Sold out
                    </span>
                  )}
                  {event.bookingsClosed && !event.soldOut && (
                    <span className="rounded-full bg-clay px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">
                      Bookings closed
                    </span>
                  )}
                  {event.isPast && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/60">
                      Past
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-white/55">
                  {formatDate(event.date)} · {event.location} ·{" "}
                  {formatPrice(event.priceCents)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-display text-2xl font-extrabold tracking-tight text-white">
                  {event.spotsBooked}
                  <span className="text-white/40">/{event.capacity}</span>
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-forest-300">
                  {event.spotsRemaining} remaining
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${event.soldOut ? "bg-ember" : "bg-forest-500"}`}
                style={{
                  width: `${Math.min(100, Math.round((event.spotsBooked / Math.max(event.capacity, 1)) * 100))}%`,
                }}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/events/${event.id}`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
              >
                Edit
              </Link>
              <Link
                href={`/admin/events/${event.id}/bookings`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
              >
                Attendees ({event.spotsBooked})
              </Link>
              <a
                href={`/api/admin/events/${event.id}/export`}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
              >
                Export CSV
              </a>

              <form action={toggleBookingsAction}>
                <input type="hidden" name="id" value={event.id} />
                <input type="hidden" name="closed" value={String(!event.bookingsClosed)} />
                <button
                  type="submit"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
                >
                  {event.bookingsClosed ? "Reopen bookings" : "Close bookings"}
                </button>
              </form>

              <form action={togglePublishedAction}>
                <input type="hidden" name="id" value={event.id} />
                <input type="hidden" name="published" value={String(!event.published)} />
                <button
                  type="submit"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
                >
                  {event.published ? "Unpublish" : "Publish"}
                </button>
              </form>

              <Link
                href={`/events/${event.slug}`}
                className="ml-auto text-sm font-semibold text-forest-300 underline underline-offset-4"
              >
                View public page
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
