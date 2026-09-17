import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon } from "@/components/ui/button";

const pillars = [
  {
    emoji: "🥾",
    title: "Monthly Hikes",
    copy: "We host 1–2 hikes every month, with 5KM and 10KM trail options.",
    image: "/images/card-monthly-hikes.jpg",
    href: "/events",
    cta: "See the dates",
  },
  {
    emoji: "🏕️",
    title: "Camping Adventures",
    copy: "Take the adventure beyond the trail with camping experiences and outdoor weekends.",
    image: "/images/card-camping.jpg",
    href: "/events?category=camping",
    cta: "Browse camp outs",
  },
  {
    emoji: "🌴",
    title: "Getaway Weekends",
    copy: "Join us for unforgettable group getaways in destinations such as Ballito and Cape Town.",
    image: "/images/card-getaways.jpg",
    href: "/events?category=getaway",
    cta: "Plan your escape",
  },
  {
    emoji: "🤝",
    title: "Community",
    copy: "Meet new people, make friends and become part of a growing community of outdoor enthusiasts.",
    image: "/images/card-community.jpg",
    href: "/#community",
    cta: "Meet the crew",
  },
];

export function WhatWeDo() {
  return (
    <section id="what-we-do" className="scroll-mt-24 bg-forest-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          tone="light"
          align="center"
          eyebrow="What we do"
          title="Four ways to get outside with us"
          description="From an easy Saturday morning trail to a week in Cape Town — there is always something on the calendar."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 90} className="h-full">
              <Link
                href={pillar.href}
                className="group relative flex h-full min-h-[24rem] flex-col justify-end overflow-hidden rounded-4xl border border-white/10"
              >
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 23vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/70 to-forest-950/10 transition-opacity duration-500 group-hover:from-forest-950 group-hover:via-forest-950/55" />

                <div className="relative p-6">
                  <span className="text-3xl" aria-hidden="true">
                    {pillar.emoji}
                  </span>
                  <h3 className="display mt-4 text-2xl text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{pillar.copy}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest-300 transition-colors group-hover:text-white">
                    {pillar.cta}
                    <ArrowIcon />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
