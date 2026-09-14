import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { ArriveOnTimeNotice, ScheduleTimeline } from "@/components/schedule-timeline";
import { StickyBookBar } from "@/components/sticky-book-bar";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getEventBySlug, getUpcomingEvents } from "@/lib/events";
import {
  categoryLabel,
  dateParts,
  formatDate,
  formatPrice,
  spotsLabel,
  trailLabel,
} from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return { title: "Event not found" };
  }

  const title = `${event.title} · ${formatDate(event.date)}`;

  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title,
      description: event.summary,
      type: "article",
      url: `${site.url}/events/${event.slug}`,
      images: [{ url: event.image, width: 1200, height: 630, alt: event.title }],
    },
  };
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-forest-900/10 bg-white p-5">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone">
        {label}
      </p>
      <p className="mt-2 font-display text-lg font-bold tracking-tight text-forest-900">
        {value}
      </p>
    </div>
  );
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event || !event.published) notFound();

  const { day, month } = dateParts(event.date);
  const others = getUpcomingEvents()
    .filter((item) => item.id !== event.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: `${event.date}T${event.startTime.padStart(5, "0")}:00+02:00`,
    eventStatus: event.soldOut
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: [`${site.url}${event.image}`],
    location: {
      "@type": "Place",
      name: event.meetingPoint,
      address: { "@type": "PostalAddress", addressLocality: event.location, addressCountry: "ZA" },
    },
    organizer: { "@type": "Organization", name: site.name, url: site.url },
    offers: {
      "@type": "Offer",
      price: (event.priceCents / 100).toFixed(2),
      priceCurrency: "ZAR",
      availability: event.bookingOpen
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
      url: `${site.url}/book/${event.slug}`,
      validFrom: event.createdAt,
    },
  };

  return (
    <div className="pb-20 lg:pb-0">
      <JsonLd data={jsonLd} />
      <StickyBookBar event={event} />

      <section className="relative isolate flex min-h-[70svh] flex-col justify-end overflow-hidden bg-forest-950 px-5 pb-12 pt-32 sm:px-8 sm:pb-16 sm:pt-40 lg:px-10">
        <div className="absolute inset-0 -z-10">
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="animate-kenburns object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/70 to-forest-950/40" />
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Breadcrumb" className="fade-up text-sm text-white/60">
            <Link href="/events" className="transition-colors hover:text-white">
              Events
            </Link>
            <span className="px-2">/</span>
            <span className="text-white/85">{event.title}</span>
          </nav>

          <div className="fade-up mt-6 flex flex-wrap items-center gap-2" style={{ animationDelay: "120ms" }}>
            <span className="rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
              {categoryLabel(event.category)}
            </span>
            <span className="rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
              {trailLabel(event)}
            </span>
            <span className="rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
              {event.difficulty}
            </span>
            {event.soldOut && (
              <span className="rounded-full bg-clay px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white">
                Sold out
              </span>
            )}
          </div>

          <h1
            className="display fade-up mt-5 max-w-4xl text-[clamp(2.25rem,7vw,4.75rem)] text-white"
            style={{ animationDelay: "200ms" }}
          >
            {event.title}
          </h1>

          <div
            className="fade-up mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-white/80"
            style={{ animationDelay: "280ms" }}
          >
            <span className="flex items-center gap-2.5">
              <span className="flex flex-col items-center rounded-2xl bg-white px-3 py-1.5 text-center text-forest-900">
                <span className="font-display text-xl font-extrabold leading-none">{day}</span>
                <span className="text-[0.6rem] font-bold tracking-[0.14em]">{month}</span>
              </span>
              <span className="text-sm sm:text-base">{formatDate(event.date)}</span>
            </span>
            <span className="text-sm sm:text-base">📍 {event.location}</span>
            <span className="text-sm sm:text-base">🕖 Arrive {event.arrivalTime} · starts {event.startTime}</span>
          </div>
        </div>
      </section>

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.55fr_1fr] lg:gap-16 lg:px-10">
          <div>
            <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Trail options" value={trailLabel(event)} />
              <Fact label="Difficulty" value={event.difficulty} />
              <Fact label="Starting time" value={event.startTime} />
              <Fact label="Arrival" value={event.arrivalTime} />
              <Fact label="Price" value={formatPrice(event.priceCents)} />
              <Fact
                label="Availability"
                value={
                  <span className={cn(event.soldOut ? "text-clay" : "text-forest-600")}>
                    {spotsLabel(event)}
                  </span>
                }
              />
            </Reveal>

            <Reveal className="mt-12">
              <h2 className="display text-3xl sm:text-4xl">About this event</h2>
              <div className="mt-5 space-y-5 text-base leading-relaxed text-forest-900/80">
                {event.description.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <div className="mt-12">
              <Reveal>
                <h2 className="display text-3xl sm:text-4xl">Programme for the day</h2>
                <p className="mt-3 text-stone">
                  This schedule is specific to {event.title}. Times can shift
                  slightly with the weather, so we always confirm on WhatsApp the
                  day before.
                </p>
              </Reveal>
              <div className="mt-8">
                <ScheduleTimeline schedule={event.schedule} />
              </div>
              <div className="mt-4">
                <ArriveOnTimeNotice />
              </div>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {event.includes.length > 0 && (
                <Reveal className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-7">
                  <h3 className="font-display text-xl font-bold tracking-tight text-forest-900">
                    What&apos;s included
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-forest-900/80">
                    {event.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 text-forest-600">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {event.bring.length > 0 && (
                <Reveal delay={100} className="rounded-4xl border border-forest-900/10 bg-forest-900 p-6 text-white sm:p-7">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    What to bring
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-white/75">
                    {event.bring.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-1 text-forest-300">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>

            {event.gallery.length > 0 && (
              <Reveal className="mt-12">
                <h2 className="display text-3xl sm:text-4xl">From previous trips</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {event.gallery.map((image) => (
                    <div key={image} className="aspect-4/5 overflow-hidden rounded-3xl">
                      <Image
                        src={image}
                        alt={`${event.title} gallery image`}
                        width={800}
                        height={1000}
                        sizes="(max-width: 640px) 92vw, 30vw"
                        className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-4xl border border-forest-900/10 bg-white shadow-[0_24px_60px_-40px_rgba(6,26,17,0.7)]">
              <div className="bg-forest-950 px-6 py-6 text-white">
                <p className="eyebrow text-forest-300">Book this event</p>
                <p className="mt-3 font-display text-4xl font-extrabold tracking-tight">
                  {formatPrice(event.priceCents)}
                  {event.priceCents > 0 && (
                    <span className="ml-2 align-middle text-sm font-semibold text-white/60">
                      per person
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4 px-6 py-6">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone">Date</dt>
                    <dd className="text-right font-semibold text-forest-900">
                      {formatDate(event.date)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone">Meeting point</dt>
                    <dd className="text-right font-semibold text-forest-900">
                      {event.meetingPoint}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone">Trail options</dt>
                    <dd className="text-right font-semibold text-forest-900">
                      {trailLabel(event)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-stone">Capacity</dt>
                    <dd className="text-right font-semibold text-forest-900">
                      {event.capacity} hikers
                    </dd>
                  </div>
                </dl>

                <div className="rounded-2xl bg-sand/70 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-forest-900">
                      {spotsLabel(event)}
                    </span>
                    <span className="text-stone">
                      {event.spotsBooked}/{event.capacity} booked
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        event.soldOut ? "bg-clay" : "bg-forest-600",
                      )}
                      style={{
                        width: `${Math.min(100, Math.round((event.spotsBooked / Math.max(event.capacity, 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {event.bookingOpen ? (
                  <Link
                    href={`/book/${event.slug}`}
                    className={buttonClasses("primary", "lg", "w-full")}
                  >
                    Book Your Spot
                    <ArrowIcon />
                  </Link>
                ) : (
                  <span
                    className={cn(
                      buttonClasses("outlineDark", "lg", "w-full"),
                      "pointer-events-none border-forest-900/15 text-stone opacity-70",
                    )}
                  >
                    {event.soldOut ? "Sold Out" : event.isPast ? "Event Completed" : "Bookings Closed"}
                  </span>
                )}

                {event.soldOut && (
                  <p className="text-center text-xs text-stone">
                    Fully booked — email {site.email} to join the waiting list.
                  </p>
                )}

                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block text-center text-sm font-semibold text-forest-700 underline underline-offset-4"
                  >
                    Open meeting point in Maps
                  </a>
                )}

                <p className="text-center text-xs leading-relaxed text-stone">
                  Secure booking · instant email confirmation ·{" "}
                  <Link href="/cancellation-policy" className="underline underline-offset-2">
                    cancellation policy
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-sand/50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="display text-3xl sm:text-4xl">More adventures coming up</h2>
              <Link href="/events" className={buttonClasses("outlineDark", "sm")}>
                All events
                <ArrowIcon />
              </Link>
            </div>
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item, index) => (
                <Reveal key={item.id} delay={index * 90}>
                  <EventCard event={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
