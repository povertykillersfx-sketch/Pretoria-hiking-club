import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { clubStats } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[94svh] flex-col justify-end overflow-hidden bg-forest-950 pb-10 pt-32 sm:pb-14">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-group-hike.jpg"
          alt="Pretoria Hiking Club members walking a sunny trail together"
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/55 to-forest-950/35" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-950/80 via-transparent to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <p
          className="eyebrow fade-up text-forest-300"
          style={{ animationDelay: "120ms" }}
        >
          Pretoria · Gauteng · South Africa
        </p>

        <h1
          className="display fade-up mt-5 max-w-4xl text-[clamp(2.75rem,10vw,7rem)] text-white"
          style={{ animationDelay: "220ms" }}
        >
          Hike.{" "}
          <span className="text-forest-300">Connect.</span>{" "}
          Explore.
        </h1>

        <p
          className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl"
          style={{ animationDelay: "340ms" }}
        >
          Join 1,000+ hikers exploring some of South Africa&apos;s best trails
          and outdoor experiences.
        </p>

        <div
          className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ animationDelay: "440ms" }}
        >
          <Link href="/events" className={buttonClasses("light", "lg")}>
            View Upcoming Hikes
            <ArrowIcon />
          </Link>
          <Link href="/#community" className={buttonClasses("outline", "lg")}>
            Join the Community
          </Link>
        </div>

        <dl
          className="fade-up mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md lg:grid-cols-4"
          style={{ animationDelay: "560ms" }}
        >
          {clubStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-forest-950/40 px-5 py-5 text-white sm:px-6 sm:py-6"
            >
              <dt className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
