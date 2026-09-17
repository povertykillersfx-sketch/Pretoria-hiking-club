import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { getUpcomingEvents } from "@/lib/events";
import { formatDate, formatPrice, spotsLabel, trailLabel } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Hike",
  description:
    "Book your spot on the next Pretoria Hiking Club hike, camp or getaway. Choose your event, pick 5KM or 10KM and get instant email confirmation.",
  alternates: { canonical: "/book" },
};

export default async function BookIndexPage() {
  const events = getUpcomingEvents();
  const open = events.filter((event) => event.bookingOpen);
  const closed = events.filter((event) => !event.bookingOpen);

  return (
    <>
      <PageHero
        eyebrow="Step 1 of 4"
        title="Select your event"
        description="Choose the adventure you want to join. The whole booking takes about two minutes and your spot is confirmed by email straight away."
        image="/images/gallery-sunset-rock.jpg"
        imageAlt="Hikers watching the sunset from a mountain viewpoint"
        compact
      />

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          {open.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-forest-900/20 bg-white/70 p-12 text-center">
              <p className="font-display text-2xl font-bold text-forest-900">
                Every upcoming event is fully booked.
              </p>
              <p className="mt-3 text-stone">
                Email {site.email} to join the waiting list, or follow us on
                Instagram for the next release of dates.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {open.map((event, index) => (
                <Reveal as="li" key={event.id} delay={index * 70}>
                  <Link
                    href={`/book/${event.slug}`}
                    className="group flex flex-col gap-5 overflow-hidden rounded-4xl border border-forest-900/10 bg-white p-4 transition-all duration-400 hover:-translate-y-1 hover:border-forest-600/40 hover:shadow-[0_28px_60px_-40px_rgba(6,26,17,0.6)] sm:flex-row sm:items-center sm:p-5"
                  >
                    <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-3xl sm:h-28 sm:w-44">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="(max-width: 640px) 92vw, 11rem"
                        className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-600">
                        {formatDate(event.date)}
                      </p>
                      <h2 className="mt-1.5 font-display text-xl font-bold tracking-tight text-forest-950 sm:text-2xl">
                        {event.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-stone">
                        {event.location} · {trailLabel(event)} · starts {event.startTime}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end sm:gap-2">
                      <div className="text-left sm:text-right">
                        <p className="font-display text-xl font-extrabold tracking-tight text-forest-900">
                          {formatPrice(event.priceCents)}
                        </p>
                        <p className="text-xs font-semibold text-forest-600">
                          {spotsLabel(event)}
                        </p>
                      </div>
                      <span className={buttonClasses("primary", "sm")}>
                        Select
                        <ArrowIcon />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}

          {closed.length > 0 && (
            <div className="mt-12">
              <h2 className="font-display text-lg font-bold tracking-tight text-forest-900">
                Closed for bookings
              </h2>
              <ul className="mt-4 space-y-3">
                {closed.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-forest-900/10 bg-white/60 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-forest-900">{event.title}</p>
                      <p className="text-sm text-stone">{formatDate(event.date)}</p>
                    </div>
                    <span className="rounded-full bg-clay/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-clay">
                      {event.soldOut ? "Sold out" : "Bookings closed"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
