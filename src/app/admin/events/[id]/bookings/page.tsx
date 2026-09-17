import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cancelBookingAction, markBookingPaidAction } from "@/app/actions/admin";
import { isAuthenticated } from "@/lib/auth";
import { getBookingsForEvent, getCheckInStats } from "@/lib/bookings";
import { getEventById } from "@/lib/events";
import { formatDate, formatDateTime, formatPriceExact } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventBookingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  const { id } = await params;
  const event = getEventById(Number(id));

  if (!event) notFound();

  const bookings = getBookingsForEvent(event.id);
  const stats = getCheckInStats(event.id);
  const confirmed = bookings.filter((booking) => booking.status === "confirmed");
  const outstanding = confirmed.filter((booking) => booking.paymentStatus === "pending");
  const fiveKm = confirmed
    .filter((booking) => booking.distance === "5KM")
    .reduce((total, booking) => total + booking.people, 0);
  const tenKm = confirmed
    .filter((booking) => booking.distance === "10KM")
    .reduce((total, booking) => total + booking.people, 0);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/admin/events"
        className="text-sm font-semibold text-forest-300 underline underline-offset-4"
      >
        ← Back to events
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl text-white sm:text-5xl">{event.title}</h1>
          <p className="mt-3 text-white/60">
            {formatDate(event.date)} · {event.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/check-in/${event.id}`}
            className="rounded-full bg-forest-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-forest-400"
          >
            Check-in desk
          </Link>
          <a
            href={`/api/admin/events/${event.id}/export`}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
          >
            Export attendees (CSV)
          </a>
          <Link
            href={`/admin/events/${event.id}`}
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
          >
            Edit event
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: "Booked", value: `${event.spotsBooked}/${event.capacity}` },
          { label: "Remaining", value: String(event.spotsRemaining) },
          { label: "5KM hikers", value: String(fiveKm) },
          { label: "10KM hikers", value: String(tenKm) },
          { label: "Awaiting EFT", value: String(outstanding.length) },
          {
            label: "Checked in",
            value: `${stats.checkedInBookings}/${stats.confirmed}`,
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

      <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.14em] text-white/50">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Hiker</th>
              <th className="px-5 py-3.5 font-semibold">Contact</th>
              <th className="px-5 py-3.5 font-semibold">Trail</th>
              <th className="px-5 py-3.5 font-semibold">Spots</th>
              <th className="px-5 py-3.5 font-semibold">Amount</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Checked in</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className={booking.status === "cancelled" ? "text-white/35" : "text-white/80"}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-white">{booking.name}</p>
                  <p className="text-xs text-white/45">{booking.reference}</p>
                  {booking.notes && (
                    <p className="mt-1 max-w-xs text-xs italic text-white/45">{booking.notes}</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p>{booking.email}</p>
                  <p className="text-white/50">{booking.phone}</p>
                </td>
                <td className="px-5 py-4 font-semibold">{booking.distance}</td>
                <td className="px-5 py-4">{booking.people}</td>
                <td className="px-5 py-4">
                  {booking.amountCents > 0 ? formatPriceExact(booking.amountCents) : "Free"}
                </td>
                <td className="px-5 py-4">
                  {booking.status === "cancelled" ? (
                    <span className="text-ember">Cancelled</span>
                  ) : booking.paymentStatus === "pending" ? (
                    <span className="text-ember">Awaiting EFT</span>
                  ) : booking.paymentStatus === "paid" ? (
                    <span className="text-forest-300">Paid</span>
                  ) : (
                    <span className="text-forest-300">Confirmed</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {booking.status === "cancelled" ? (
                    <span className="text-white/35">—</span>
                  ) : booking.checkedInAt ? (
                    <span className="text-forest-300">{formatDateTime(booking.checkedInAt)}</span>
                  ) : (
                    <span className="text-white/45">Not yet</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    {booking.paymentStatus === "pending" && booking.status === "confirmed" && (
                      <form action={markBookingPaidAction}>
                        <input type="hidden" name="id" value={booking.id} />
                        <input type="hidden" name="eventId" value={event.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
                        >
                          Mark paid
                        </button>
                      </form>
                    )}
                    <form action={cancelBookingAction}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="eventId" value={event.id} />
                      <input
                        type="hidden"
                        name="cancel"
                        value={String(booking.status !== "cancelled")}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-forest-950"
                      >
                        {booking.status === "cancelled" ? "Restore" : "Cancel"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-white/50">
                  No bookings for this event yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
