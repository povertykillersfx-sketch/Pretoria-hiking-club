import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ArriveOnTimeNotice, ScheduleTimeline } from "@/components/schedule-timeline";
import { SectionHeading } from "@/components/section-heading";
import { DEFAULT_SCHEDULE } from "@/lib/seed-data";

export function HikingDay() {
  return (
    <section id="hiking-day" className="scroll-mt-24 bg-bone py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="How a hike day works"
          title="Here is exactly what to expect"
          description="This is our standard programme. Every event has its own schedule on the event page, so always check the details for your specific hike."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <ScheduleTimeline schedule={DEFAULT_SCHEDULE} />
            <div className="mt-4">
              <ArriveOnTimeNotice />
            </div>
          </div>

          <div className="space-y-6">
            <Reveal className="relative aspect-4/5 overflow-hidden rounded-4xl sm:aspect-3/4 lg:aspect-4/5">
              <Image
                src="/images/hero-trail.jpg"
                alt="Club members hiking single file through the bushveld"
                fill
                sizes="(max-width: 1024px) 92vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-forest-950/70 to-transparent" />
              <div className="absolute inset-x-6 bottom-6 text-white">
                <p className="eyebrow text-forest-300">Trail leaders on every route</p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight">
                  Nobody gets left behind — there is always a sweeper at the back.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-4xl border border-forest-900/10 bg-white p-6 sm:p-7">
              <p className="eyebrow text-forest-600">What to bring</p>
              <ul className="mt-4 space-y-3 text-sm text-forest-900/80">
                {[
                  "Comfortable hiking shoes or trainers",
                  "At least 2 litres of water",
                  "Sunscreen, a hat and a light jacket",
                  "Breakfast, snacks and lunch",
                  "A charged phone for the group photos",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                      <path d="m5 8.2 2.1 2.1L11 6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
