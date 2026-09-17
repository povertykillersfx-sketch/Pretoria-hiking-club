import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArriveOnTimeNotice, ScheduleTimeline } from "@/components/schedule-timeline";
import { TicketQr } from "@/components/booking/ticket-qr";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { getBookingByReference } from "@/lib/bookings";
import { formatDate, formatPriceExact, trailLabel } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = getBookingByReference(reference);

  if (!booking) notFound();

  const { event } = booking;
  const shareText = encodeURIComponent(
    `I just booked ${event.title} with ${site.name} on ${formatDate(event.date)}. Join me! ${site.url}/events/${event.slug}`,
  );

  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-950 px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:px-10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={event.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/85 to-forest-950/70" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <span className="fade-up mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-500 text-3xl text-white">
            ✓
          </span>
          <p className="eyebrow fade-up mt-6 text-forest-300" style={{ animationDelay: "100ms" }}>
            Booking confirmed
          </p>
          <h1
            className="display fade-up mt-4 text-[clamp(2.25rem,7vw,4rem)] text-white"
            style={{ animationDelay: "180ms" }}
          >
            You&apos;re in, {booking.name.split(" ")[0]}!
          </h1>
          <p
            className="fade-up mx-auto mt-5 max-w-xl text-lg text-white/75"
            style={{ animationDelay: "260ms" }}
          >
            Your spot on {event.title} is locked in. We have emailed the details
            to {booking.email} — check your spam folder if it is not there in a
            few minutes.
          </p>
          <p
            className="fade-up mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-display text-lg font-extrabold tracking-tight text-white backdrop-blur"
            style={{ animationDelay: "340ms" }}
          >
            Reference: {booking.reference}
          </p>
        </div>
      </section>

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14 lg:px-10">
          <div>
            <h2 className="display text-3xl">Your booking</h2>
            <dl className="mt-6 divide-y divide-forest-900/10 overflow-hidden rounded-4xl border border-forest-900/10 bg-white">
              {[
                ["Event", event.title],
                ["Date", formatDate(event.date)],
                ["Arrival time", event.arrivalTime],
                ["Hike starts", event.startTime],
                ["Meeting point", event.meetingPoint],
                ["Location", event.location],
                ["Trail", `${booking.distance} (${trailLabel(event)} available)`],
                ["People", String(booking.people)],
                [
                  "Payment",
                  booking.paymentStatus === "not_required"
                    ? "Free event"
                    : booking.paymentStatus === "paid"
                      ? `Paid · ${formatPriceExact(booking.amountCents)}`
                      : `Outstanding · ${formatPriceExact(booking.amountCents)}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-6 px-5 py-4">
                  <dt className="text-sm text-stone">{label}</dt>
                  <dd className="text-right text-sm font-semibold text-forest-900">{value}</dd>
                </div>
              ))}
            </dl>

            {booking.status === "cancelled" ? (
              <div className="mt-6 rounded-4xl border border-ember/40 bg-ember/10 p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-forest-950">
                  This booking was cancelled
                </h3>
                <p className="mt-2 text-sm text-forest-900/70">
                  The QR code is no longer valid. Email {site.email} if you think
                  this is a mistake.
                </p>
              </div>
            ) : (
              <div className="mt-6 lg:hidden">
                <TicketQr token={booking.checkinToken} reference={booking.reference} />
              </div>
            )}

            {booking.paymentStatus === "pending" && (
              <div className="mt-6 rounded-4xl border border-ember/40 bg-ember/10 p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-forest-950">
                  Finish your EFT payment
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-900/80">
                  {site.bank.accountName}
                  <br />
                  {site.bank.bank} · Account {site.bank.accountNumber}
                  <br />
                  Branch code {site.bank.branchCode}
                  <br />
                  <strong>Reference: {booking.reference}</strong>
                </p>
                <p className="mt-3 text-sm text-forest-900/70">
                  Send proof of payment to {site.email} at least 48 hours before
                  the event to keep your spot.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`/api/bookings/${booking.reference}/calendar.ics`}
                className={buttonClasses("primary", "md")}
              >
                Add to calendar
              </a>
              <a
                href={`${site.whatsapp}?text=${shareText}`}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClasses("outlineDark", "md")}
              >
                Share on WhatsApp
              </a>
              <Link href="/events" className={buttonClasses("ghost", "md")}>
                Browse more events
                <ArrowIcon />
              </Link>
            </div>

            <div className="mt-10">
              <h2 className="display text-2xl">Programme for the day</h2>
              <div className="mt-6">
                <ScheduleTimeline schedule={event.schedule} />
              </div>
              <div className="mt-4">
                <ArriveOnTimeNotice />
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {booking.status !== "cancelled" && booking.checkinToken ? (
              <div className="hidden lg:block">
                <TicketQr token={booking.checkinToken} reference={booking.reference} />
              </div>
            ) : null}
            <div className="overflow-hidden rounded-4xl border border-forest-900/10 bg-white">
              <div className="relative aspect-4/3">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1024px) 92vw, 26rem"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-forest-950">
                  What happens next
                </h3>
                <ol className="mt-4 space-y-3 text-sm text-forest-900/80">
                  <li className="flex gap-3">
                    <span className="font-bold text-forest-600">1.</span>
                    Check your inbox for the confirmation email with your
                    reference and the full programme.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-forest-600">2.</span>
                    We add you to the event WhatsApp group a week before the
                    hike.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-forest-600">3.</span>
                    Arrive at {event.meetingPoint} by {event.arrivalTime} and
                    check in with your QR code.
                  </li>
                </ol>
              </div>
            </div>

            <div className="rounded-4xl bg-forest-950 p-6 text-white">
              <h3 className="font-display text-lg font-bold tracking-tight">
                Need to change something?
              </h3>
              <p className="mt-3 text-sm text-white/70">
                Email {site.email} or WhatsApp us with your reference{" "}
                <strong className="text-white">{booking.reference}</strong> and we
                will sort it out.
              </p>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClasses("light", "sm", "mt-5")}
              >
                WhatsApp the crew
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
