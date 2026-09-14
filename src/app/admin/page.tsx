import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getClubStats, getRecentBookings } from "@/lib/bookings";
import { getAllEventsForAdmin } from "@/lib/events";
import { formatDate, formatPrice, formatPriceExact } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-300">{label}</p>
      <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-sm text-white/50">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const events = getAllEventsForAdmin();
  const upcoming = events.filter((event) => !event.isPast);
  const stats = getClubStats();
  const recent = getRecentBookings(8);

  const spotsLeft = upcoming.reduce((total, event) => total + event.spotsRemaining, 0);
  const soldOut = upcoming.filter((event) => event.soldOut).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="display text-4xl text-white sm:text-5xl">Dashboard</h1>
      <p className="mt-3 text-white/60">
        Everything happening across your events right now.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming events"
          value={String(upcoming.length)}
          hint={`${soldOut} sold out`}
        />
        <StatCard
          label="Booked hikers"
          value={String(stats.bookedHikers)}
          hint="Across all events"
        />
        <StatCard label="Spots still open" value={String(spotsLeft)} hint="Upcoming events" />
        <StatCard
          label="Payments received"
          value={formatPrice(stats.paidRevenueCents)}
          hint="Card payments marked paid"
        />
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            Next events
          </h2>
          <Link
            href="/admin/events"
            className="text-sm font-semibold text-forest-300 underline underline-offset-4"
          >
            Manage all events
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-white/50">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Booked</th>
                <th className="px-5 py-3.5 font-semibold">Remaining</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {upcoming.slice(0, 6).map((event) => (
                <tr key={event.id} className="text-white/80">
                  <td className="px-5 py-4 font-semibold text-white">{event.title}</td>
                  <td className="px-5 py-4">{formatDate(event.date)}</td>
                  <td className="px-5 py-4">
                    {event.spotsBooked}/{event.capacity}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        event.soldOut
                          ? "font-semibold text-ember"
                          : "font-semibold text-forest-300"
                      }
                    >
                      {event.spotsRemaining}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {!event.published
                      ? "Draft"
                      : event.soldOut
                        ? "Sold out"
                        : event.bookingsClosed
                          ? "Closed"
                          : "Open"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/events/${event.id}/bookings`}
                      className="font-semibold text-forest-300 underline underline-offset-4"
                    >
                      Attendees
                    </Link>
                  </td>
                </tr>
              ))}
              {upcoming.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/50">
                    No upcoming events yet.{" "}
                    <Link href="/admin/events/new" className="text-forest-300 underline">
                      Create one
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Latest bookings
        </h2>

        <ul className="mt-5 space-y-3">
          {recent.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-white">
                  {booking.name}{" "}
                  <span className="text-white/40">· {booking.reference}</span>
                </p>
                <p className="text-sm text-white/55">
                  {booking.event.title} · {booking.distance} · {booking.people}{" "}
                  {booking.people === 1 ? "spot" : "spots"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-white">
                  {booking.amountCents > 0 ? formatPriceExact(booking.amountCents) : "Free"}
                </p>
                <p
                  className={
                    booking.status === "cancelled"
                      ? "text-ember"
                      : booking.paymentStatus === "pending"
                        ? "text-ember"
                        : "text-forest-300"
                  }
                >
                  {booking.status === "cancelled"
                    ? "Cancelled"
                    : booking.paymentStatus === "pending"
                      ? "Awaiting EFT"
                      : booking.paymentStatus === "paid"
                        ? "Paid"
                        : "Confirmed"}
                </p>
              </div>
            </li>
          ))}
          {recent.length === 0 && (
            <li className="rounded-3xl border border-white/10 bg-white/5 px-5 py-8 text-center text-white/50">
              No bookings yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
