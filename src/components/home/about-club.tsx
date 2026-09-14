import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";

const highlights = [
  { value: "Every level", label: "From first-timers to trail runners" },
  { value: "18 – 65+", label: "All ages hike with us" },
  { value: "Weekend", label: "Hikes, camps and getaways" },
];

export function AboutClub() {
  return (
    <section id="about" className="scroll-mt-24 bg-sand/60 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <SectionHeading
              eyebrow="About the club"
              title="More than a hiking club — a crew that shows up for each other"
              description="Pretoria Hiking Club started with a handful of friends looking for a reason to get outside on a Saturday. Today we are 1,000+ hikers strong, built around fitness, adventure, friendships, travel and the kind of experiences you talk about for years."
            />

            <div className="mt-8 space-y-5 text-base leading-relaxed text-forest-900/80">
              <p>
                We keep it simple: every event has a relaxed 5KM route and a
                tougher 10KM route, so you choose the day you want. Come alone,
                come with friends, come with family — you will leave with new
                people in your contact list.
              </p>
              <p>
                <strong className="font-semibold text-forest-900">
                  All ages and all experience levels are welcome.
                </strong>{" "}
                If you can walk 5KM, you can hike with us. Our trail leaders set
                the pace, our sweepers make sure nobody is alone at the back, and
                the social afterwards is where the club really happens.
              </p>
            </div>

            <dl className="mt-10 grid gap-5 sm:grid-cols-3">
              {highlights.map((item, index) => (
                <Reveal key={item.value} delay={index * 80} className="rounded-3xl bg-white p-5 shadow-[0_2px_18px_-12px_rgba(6,26,17,0.4)]">
                  <dt className="font-display text-xl font-extrabold tracking-tight text-forest-800">
                    {item.value}
                  </dt>
                  <dd className="mt-1.5 text-sm text-stone">{item.label}</dd>
                </Reveal>
              ))}
            </dl>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/about" className={buttonClasses("primary", "lg")}>
                Read our story
                <ArrowIcon />
              </Link>
              <Link href="/gallery" className={buttonClasses("outlineDark", "lg")}>
                See the gallery
              </Link>
            </div>
          </div>

          <div className="order-1 grid grid-cols-2 gap-4 lg:order-2 lg:gap-5">
            <Reveal className="col-span-2 aspect-16/10 overflow-hidden rounded-4xl">
              <Image
                src="/images/gallery-friends-sunset.jpg"
                alt="Club members sitting together watching the sunset after a hike"
                width={1400}
                height={875}
                className="h-full w-full object-cover"
              />
            </Reveal>
            <Reveal delay={100} className="aspect-4/5 overflow-hidden rounded-4xl">
              <Image
                src="/images/gallery-campfire.jpg"
                alt="Members around a campfire at a club camping weekend"
                width={900}
                height={1125}
                className="h-full w-full object-cover"
              />
            </Reveal>
            <Reveal delay={180} className="aspect-4/5 overflow-hidden rounded-4xl">
              <Image
                src="/images/gallery-sunset-rock.jpg"
                alt="Hikers watching the sunset from a rocky viewpoint"
                width={900}
                height={1125}
                className="h-full w-full object-cover"
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
