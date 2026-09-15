import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { communityStats } from "@/lib/site";

const testimonials = [
  {
    quote:
      "I joined on my own for a 5KM hike and left with a WhatsApp group full of new friends. Two years later I have not missed a month.",
    name: "Naledi D.",
    role: "Member since 2023",
    image: "/images/member-naledi.jpg",
  },
  {
    quote:
      "The Drakensberg weekend was the best trip I have ever done. Properly organised, and the crew makes it feel like a road trip with old friends.",
    name: "Thabo M.",
    role: "10KM route regular",
    image: "/images/member-thabo.jpg",
  },
  {
    quote:
      "I was worried about being the slowest. There is always a trail leader at the back and nobody made me feel rushed. Now I do the 10KM.",
    name: "Sarah K.",
    role: "First hike in 2024",
    image: "/images/member-sarah.jpg",
  },
];

export function Community() {
  return (
    <section
      id="community"
      className="relative scroll-mt-24 overflow-hidden bg-forest-950 py-20 sm:py-28"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/gallery-golden-hour.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-linear-to-b from-forest-950 via-forest-950/85 to-forest-950" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="eyebrow text-forest-300">The community</p>
          <h2 className="display mt-4 text-4xl text-white sm:text-6xl">
            More Than A Hike. <br className="hidden sm:block" />
            It&apos;s A Community.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Every trail we walk ends the same way — new faces, shared photos and
            plans for the next one. This is what keeps 1,000+ hikers coming back.
          </p>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-4xl border border-white/12 bg-white/10 lg:grid-cols-4">
          {communityStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 80}
              className="bg-forest-950/70 px-6 py-8 text-center"
            >
              <dt className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </dt>
              <dd className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-300">
                {stat.label}
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal
              key={testimonial.name}
              delay={index * 100}
              className="flex h-full flex-col justify-between rounded-4xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
            >
              <p className="text-base leading-relaxed text-white/85">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-7 flex items-center gap-3.5">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-display text-base font-bold tracking-tight text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-forest-300">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex flex-col items-center gap-6 rounded-4xl border border-white/12 bg-forest-900/70 px-6 py-12 text-center backdrop-blur-sm sm:px-12">
          <h3 className="display text-3xl text-white sm:text-4xl">
            Ready for your next adventure?
          </h3>
          <p className="max-w-xl text-white/70">
            Pick a date, choose your trail and book in under two minutes. Your
            spot is confirmed by email straight away.
          </p>
          <Link href="/book" className={buttonClasses("ember", "lg")}>
            Join Our Next Hike
            <ArrowIcon />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
