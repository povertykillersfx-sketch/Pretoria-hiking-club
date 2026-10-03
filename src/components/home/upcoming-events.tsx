import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import type { EventWithAvailability } from "@/lib/types";

export function UpcomingEvents({ events }: { events: EventWithAvailability[] }) {
  return (
    <section id="events" className="relative scroll-mt-24 bg-bone py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Upcoming events"
          title={
            <>
              The next adventures
              <br className="hidden sm:block" /> on the calendar
            </>
          }
          description="Every hike has a 5KM and a 10KM option, a trail leader on each route and a social afterwards. Book online in under two minutes."
          action={
            <Link href="/events" className={buttonClasses("outlineDark", "md")}>
              View all events
              <ArrowIcon />
            </Link>
          }
        />

        {events.length === 0 ? (
          <Reveal className="mt-14 rounded-4xl border border-dashed border-forest-900/20 bg-white/60 p-12 text-center">
            <p className="font-display text-2xl font-bold text-forest-900">
              New dates are being planned right now.
            </p>
            <p className="mt-3 text-stone">
              Follow us on Instagram or join the WhatsApp group to hear about the
              next hike first.
            </p>
          </Reveal>
        ) : (
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Reveal key={event.id} delay={index * 90}>
                <EventCard event={event} priority={index === 0} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-14 overflow-hidden rounded-4xl bg-forest-900 px-6 py-10 sm:px-12 sm:py-12">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="display text-2xl text-white sm:text-3xl">
                Not sure which hike to start with?
              </h3>
              <p className="mt-3 text-white/70">
                Take the 5KM route on any of our monthly hikes. It is the easiest
                way in — friendly pace, trail leader at the back and nobody gets
                left behind.
              </p>
            </div>
            <Link href="/book" className={buttonClasses("ember", "lg")}>
              Book Your Spot
              <ArrowIcon />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
