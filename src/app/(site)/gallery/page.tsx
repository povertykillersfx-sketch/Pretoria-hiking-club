import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos from Pretoria Hiking Club adventures — group hikes, mountain trails, camping weekends, team photos, getaways and socials.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Every trail tells a story"
        description="Group hikes, mountain trails, nature, camping, team photos, getaways, social activities and scenic views from across South Africa."
        image="/images/gallery-peaks.jpg"
        imageAlt="Hikers on a ridge after a colour-run hike"
        compact
      />

      <section className="bg-bone py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <GalleryGrid />
        </div>
      </section>

      <section className="bg-forest-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className="display text-3xl text-white sm:text-5xl">
            Want to be in the next one?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/70">
            Book your spot on the next hike and bring a friend. Tag us in your
            photos and we will add them here.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/book" className={buttonClasses("ember", "lg")}>
              Book Your Spot
              <ArrowIcon />
            </Link>
            <Link href="/events" className={buttonClasses("outline", "lg")}>
              View upcoming hikes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
