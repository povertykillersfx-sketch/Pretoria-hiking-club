import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { galleryImages } from "@/lib/gallery";
import { communityStats, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Club",
  description:
    "Pretoria Hiking Club is a community of 1,000+ hikers built around fitness, adventure, friendships and travel. All ages and experience levels are welcome.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Everyone is welcome",
    copy: "First hike or hundredth, 18 or 68 — there is a route and a pace for you. Nobody is ever left at the back on their own.",
  },
  {
    title: "Properly organised",
    copy: "Trail leaders, sweepers, first aid, permits and a clear schedule. You pitch up, we handle the rest.",
  },
  {
    title: "It's social first",
    copy: "The hike is the reason, the people are the point. Lunch, music and team activities are part of every event.",
  },
  {
    title: "Adventure beyond the trail",
    copy: "Camping weekends, coastal getaways and trips to Cape Town keep the calendar interesting all year round.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the club"
        title="A community built on trails, fires and friendships"
        description="What started as a few friends looking for a reason to get outside on a Saturday is now 1,000+ hikers strong — and still growing every month."
        image="/images/gallery-golden-hour.jpg"
        imageAlt="Group of club members standing together in golden light"
      />

      <section className="bg-bone py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="More than just hiking"
                description="Pretoria Hiking Club exists to get people outside, moving and connected. We are a community built around fitness, adventure, friendships, travel and unforgettable experiences."
              />

              <div className="mt-8 space-y-5 text-base leading-relaxed text-forest-900/80">
                <p>
                  We host one to two hikes every month around Gauteng and the
                  surrounding provinces — Magaliesberg, Hennops, the Cradle of
                  Humankind, Suikerbosrand and the reserves right here in
                  Pretoria. Every hike has a relaxed 5KM route and a tougher 10KM
                  route so that the whole group can go out together and still
                  choose their own challenge.
                </p>
                <p>
                  Beyond the monthly trails we run camping weekends, coastal
                  getaways in Ballito and a yearly adventure week in Cape Town.
                  Some members come for the fitness, some for the travel, most
                  stay for the people.
                </p>
                <p>
                  <strong className="font-semibold text-forest-900">
                    All ages and all experience levels are welcome.
                  </strong>{" "}
                  If you can walk 5KM, you can hike with us. Bring a friend or
                  come alone — you will not stay a stranger for long.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/events" className={buttonClasses("primary", "lg")}>
                  See upcoming events
                  <ArrowIcon />
                </Link>
                <a
                  href={site.whatsappGroup}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={buttonClasses("outlineDark", "lg")}
                >
                  Join the WhatsApp group
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal className="aspect-4/5 overflow-hidden rounded-4xl sm:mt-10">
                <Image
                  src="/images/hero-group-hike.jpg"
                  alt="Club members on a mountain trail"
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover"
                />
              </Reveal>
              <Reveal delay={120} className="aspect-4/5 overflow-hidden rounded-4xl">
                <Image
                  src="/images/gallery-campfire.jpg"
                  alt="Campfire social at a club camping weekend"
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover"
                />
              </Reveal>
              <Reveal delay={60} className="aspect-4/5 overflow-hidden rounded-4xl sm:mt-10">
                <Image
                  src="/images/gallery-suspension-bridge.jpg"
                  alt="Hiker crossing a suspension bridge"
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover"
                />
              </Reveal>
              <Reveal delay={180} className="aspect-4/5 overflow-hidden rounded-4xl">
                <Image
                  src="/images/gallery-long-table.jpg"
                  alt="Club members at a long table social dinner"
                  width={900}
                  height={1125}
                  className="h-full w-full object-cover"
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-white/12 bg-white/10 lg:grid-cols-4">
            {communityStats.map((stat) => (
              <div key={stat.label} className="bg-forest-950 px-6 py-8 text-center">
                <dt className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </dt>
                <dd className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-300">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {values.map((value, index) => (
              <Reveal
                key={value.title}
                delay={index * 80}
                className="rounded-4xl border border-white/10 bg-white/5 p-7"
              >
                <h3 className="font-display text-xl font-bold tracking-tight text-white">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{value.copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bone py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="Previous adventures"
            title="Where we have been"
            description="Group photos, scenic locations, camping and the social moments in between."
          />
          <div className="mt-10">
            <GalleryGrid images={galleryImages.slice(0, 12)} />
          </div>
          <div className="mt-10 text-center">
            <Link href="/gallery" className={buttonClasses("outlineDark", "lg")}>
              Open the full gallery
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
