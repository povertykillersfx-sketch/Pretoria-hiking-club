import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Private Hikes",
  description:
    "Book a private Pretoria Hiking Club hike for your team, family or friends. Breakfast, lunch, snacks, team-building, a guided hike and a venue of your choice.",
  alternates: { canonical: "/private-hikes" },
};

const included = [
  "Breakfast",
  "Lunch",
  "Refreshment / snack break",
  "Team-building games",
  "Guided hike + coordinator",
  "First-aid kit",
  "Hiking venue of your choice — or we recommend and choose one for you",
];

const photos = [
  {
    src: "/images/private-hike-warmup.jpg",
    alt: "A private hike group stretching together on the lawn before the trail",
    caption: "Warm-up with the coordinator",
  },
  {
    src: "/images/private-hike-breakfast.jpg",
    alt: "Guests collecting breakfast and fruit cups at a private hike buffet",
    caption: "Breakfast and lunch on the day",
  },
  {
    src: "/images/private-hike-colour.jpg",
    alt: "Two private-hike guests holding colour powder packets on the grass",
    caption: "Team-building games",
  },
];

export default function PrivateHikesPage() {
  return (
    <>
      <PageHero
        eyebrow="Private hikes"
        title="Your group. Your trail. We handle the day."
        description="Companies, families and friend groups book the club for a private hike. You pick the date and the venue — or we choose one for you — and we run the day."
        image="/images/private-hike-warmup.jpg"
        imageAlt="A private hike group stretching together before the trail"
      />

      <section className="bg-bone py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="eyebrow text-forest-600">From previous private hikes</p>
            <h2 className="display mt-4 max-w-3xl text-3xl sm:text-5xl">
              A full day, not just a walk
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <Reveal key={photo.src} delay={index * 90} className="overflow-hidden rounded-4xl">
                <div className="relative aspect-4/5">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 92vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-forest-900">{photo.caption}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand/50 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <Reveal>
            <p className="eyebrow text-forest-600">The package</p>
            <h2 className="display mt-4 text-3xl sm:text-5xl">What you get</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">
              Every private hike includes food, a guided trail, games and a
              coordinator so you can enjoy the day with your people.
            </p>
            <ul className="mt-8 space-y-3">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 text-forest-900"
                >
                  <span className="mt-0.5 font-bold text-forest-600" aria-hidden="true">
                    ✓
                  </span>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-4xl bg-forest-950 p-8 text-white sm:p-10">
              <h3 className="display text-3xl">Book a private hike</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Email us your group size, preferred date and whether you have a
                venue in mind. We will come back with a proposal.
              </p>
              <a
                href={`mailto:${site.bookingEmail}`}
                className={buttonClasses("light", "lg", "mt-8 w-full")}
              >
                {site.bookingEmail}
                <ArrowIcon />
              </a>
              <p className="mt-5 text-sm text-white/55">
                For club calendar hikes,{" "}
                <Link href="/events" className="underline underline-offset-4">
                  book online
                </Link>{" "}
                as usual.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
