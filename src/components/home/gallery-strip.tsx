import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { galleryImages } from "@/lib/gallery";

const strip = galleryImages.slice(0, 10);

export function GalleryStrip() {
  return (
    <section className="overflow-hidden bg-bone py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-forest-600">Gallery</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl lg:text-[3.4rem]">
              Real hikes. Real people. Real moments.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone sm:text-lg">
              Mountain trails, camp fires, beach weekends and the faces you will
              meet on the trail.
            </p>
          </div>
          <Link href="/gallery" className={buttonClasses("outlineDark", "md")}>
            Open full gallery
            <ArrowIcon />
          </Link>
        </Reveal>
      </div>

      <div className="relative mt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-bone to-transparent sm:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-bone to-transparent sm:w-28"
        />

        <div className="flex w-max animate-marquee gap-4 will-change-transform hover:[animation-play-state:paused]">
          {[...strip, ...strip].map((image, index) => (
            <Link
              key={`${image.src}-${index}`}
              href="/gallery"
              className="group relative h-56 w-72 shrink-0 overflow-hidden rounded-3xl sm:h-72 sm:w-96"
              aria-hidden={index >= strip.length}
              tabIndex={index >= strip.length ? -1 : undefined}
            >
              <Image
                src={image.src}
                alt={index < strip.length ? image.alt : ""}
                fill
                sizes="(max-width: 640px) 72vw, 24rem"
                className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-linear-to-t from-forest-950/80 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
              <span className="absolute inset-x-5 bottom-4 text-sm font-semibold text-white">
                {image.caption}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
