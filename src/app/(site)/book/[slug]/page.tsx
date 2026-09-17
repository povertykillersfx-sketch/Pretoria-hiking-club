import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/booking-form";
import { buttonClasses } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/events";
import { formatDate, formatPrice, spotsLabel, trailLabel } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  return {
    title: event ? `Book · ${event.title}` : "Book a hike",
    description: event?.summary ?? site.description,
    robots: { index: false, follow: true },
  };
}

export default async function BookEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event || !event.published) notFound();

  if (!event.bookingOpen) {
    return (
      <section className="bg-bone px-5 pb-24 pt-36 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-xl rounded-4xl border border-forest-900/10 bg-white p-10 text-center">
          <p className="eyebrow text-clay">
            {event.soldOut ? "Sold out" : event.isPast ? "Completed" : "Bookings closed"}
          </p>
          <h1 className="display mt-4 text-3xl">{event.title}</h1>
          <p className="mt-4 text-stone">
            {event.soldOut
              ? "Every spot on this one is taken. Email us to join the waiting list — cancellations do happen."
              : event.isPast
                ? "This event has already taken place. Have a look at what is coming up next."
                : "Bookings for this event are closed."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/events" className={buttonClasses("primary", "md")}>
              See upcoming events
            </Link>
            <a href={`mailto:${site.email}`} className={buttonClasses("outlineDark", "md")}>
              Join the waiting list
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bone px-5 pb-20 pt-28 sm:px-8 sm:pt-32 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="text-sm text-stone">
          <Link href="/events" className="transition-colors hover:text-forest-800">
            Events
          </Link>
          <span className="px-2">/</span>
          <Link href={`/events/${event.slug}`} className="transition-colors hover:text-forest-800">
            {event.title}
          </Link>
          <span className="px-2">/</span>
          <span className="text-forest-900">Book</span>
        </nav>

        <h1 className="display mt-5 text-4xl sm:text-5xl">Book your spot</h1>
        <p className="mt-3 max-w-2xl text-stone">
          You are booking <strong className="text-forest-900">{event.title}</strong> on{" "}
          {formatDate(event.date)}.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div className="rounded-4xl border border-forest-900/10 bg-white p-6 shadow-[0_24px_60px_-48px_rgba(6,26,17,0.8)] sm:p-8">
            <BookingForm event={event} />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-4xl border border-forest-900/10 bg-white">
              <div className="relative aspect-16/10">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 30rem"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-forest-950/80 to-transparent" />
                <div className="absolute inset-x-5 bottom-4">
                  <p className="font-display text-xl font-bold tracking-tight text-white">
                    {event.title}
                  </p>
                  <p className="text-sm text-white/75">{event.location}</p>
                </div>
              </div>

              <dl className="space-y-3 px-6 py-6 text-sm">
                {[
                  ["Date", formatDate(event.date)],
                  ["Arrival", event.arrivalTime],
                  ["Hike starts", event.startTime],
                  ["Trail options", trailLabel(event)],
                  ["Difficulty", event.difficulty],
                  ["Price", `${formatPrice(event.priceCents)}${event.priceCents > 0 ? " per person" : ""}`],
                  ["Availability", spotsLabel(event)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-5">
                    <dt className="text-stone">{label}</dt>
                    <dd className="text-right font-semibold text-forest-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-forest-900/10 px-6 py-5 text-sm text-stone">
                <p>
                  Questions before you book?{" "}
                  <a
                    href={site.whatsapp}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-forest-700 underline underline-offset-4"
                  >
                    WhatsApp the crew
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
