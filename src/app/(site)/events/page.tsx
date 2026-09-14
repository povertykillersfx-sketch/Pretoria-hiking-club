import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
import { getPastEvents, getUpcomingEvents } from "@/lib/events";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import type { EventCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Hikes & Events",
  description:
    "Every upcoming Pretoria Hiking Club event — monthly 5KM and 10KM hikes, camping weekends, getaways and socials. Book your spot online in minutes.",
  alternates: { canonical: "/events" },
};

const filters: { label: string; value: EventCategory | "all" }[] = [
  { label: "All events", value: "all" },
  { label: "Hikes", value: "hike" },
  { label: "Camping", value: "camping" },
  { label: "Getaways", value: "getaway" },
  { label: "Socials", value: "social" },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = filters.some((filter) => filter.value === category)
    ? (category as EventCategory | "all")
    : "all";

  const allUpcoming = getUpcomingEvents();
  const upcoming =
    active === "all"
      ? allUpcoming
      : allUpcoming.filter((event) => event.category === active);
  const past = getPastEvents(3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Upcoming events",
    itemListElement: allUpcoming.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        startDate: event.date,
        location: {
          "@type": "Place",
          name: event.location,
          address: event.location,
        },
        url: `${site.url}/events/${event.slug}`,
        image: `${site.url}${event.image}`,
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Upcoming events"
        title="Pick your next adventure"
        description="Monthly hikes with 5KM and 10KM routes, overnight camps, getaway weekends and club socials. Every spot is booked online and confirmed by email."
        image="/images/gallery-green-valley.jpg"
        imageAlt="Green valley trail under a dramatic sky"
        compact
      />

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {filters.map((filter) => (
              <Link
                key={filter.value}
                href={filter.value === "all" ? "/events" : `/events?category=${filter.value}`}
                className={cn(
                  "shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                  active === filter.value
                    ? "border-forest-800 bg-forest-800 text-white"
                    : "border-forest-900/15 bg-white text-forest-900/70 hover:border-forest-900/40 hover:text-forest-900",
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>

          {upcoming.length === 0 ? (
            <div className="mt-12 rounded-4xl border border-dashed border-forest-900/20 bg-white/60 p-12 text-center">
              <p className="font-display text-2xl font-bold text-forest-900">
                Nothing on the calendar in this category yet.
              </p>
              <p className="mt-3 text-stone">
                New dates drop every month — follow us on Instagram to hear first.
              </p>
              <Link
                href="/events"
                className="mt-6 inline-block font-semibold text-forest-700 underline underline-offset-4"
              >
                See all upcoming events
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event, index) => (
                <Reveal key={event.id} delay={(index % 3) * 90}>
                  <EventCard event={event} priority={index < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="bg-sand/50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <Reveal>
              <p className="eyebrow text-forest-600">Recently completed</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl">
                Where the club has been
              </h2>
            </Reveal>
            <ul className="mt-8 divide-y divide-forest-900/10 border-y border-forest-900/10">
              {past.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-display text-lg font-bold tracking-tight text-forest-900">
                      {event.title}
                    </p>
                    <p className="text-sm text-stone">{event.location}</p>
                  </div>
                  <div className="text-sm text-stone sm:text-right">
                    <p>{formatDate(event.date)}</p>
                    <p className="text-forest-600">{event.spotsBooked} hikers joined</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
