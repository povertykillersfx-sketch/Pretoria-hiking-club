"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { galleryImages, galleryTags, type GalleryImage } from "@/lib/gallery";

export function GalleryGrid({ images = galleryImages }: { images?: GalleryImage[] }) {
  const [tag, setTag] = useState<(typeof galleryTags)[number]>("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () => (tag === "All" ? images : images.filter((image) => image.tag === tag)),
    [images, tag],
  );

  const close = useCallback(() => setActiveIndex(null), []);
  const step = useCallback(
    (direction: 1 | -1) =>
      setActiveIndex((current) => {
        if (current === null) return current;
        return (current + direction + filtered.length) % filtered.length;
      }),
    [filtered.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, step]);

  const active = activeIndex === null ? null : filtered[activeIndex];

  return (
    <div>
      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {galleryTags.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setTag(option);
              setActiveIndex(null);
            }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300",
              tag === option
                ? "border-forest-800 bg-forest-800 text-white"
                : "border-forest-900/15 bg-white text-forest-900/70 hover:border-forest-900/40 hover:text-forest-900",
            )}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
        {filtered.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative block w-full overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={index % 3 === 1 ? 1000 : 600}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 45vw, 30vw"
              className="h-auto w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-linear-to-t from-forest-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="absolute inset-x-4 bottom-4 translate-y-3 text-left text-sm font-semibold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              {image.caption}
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
          className="fixed inset-0 z-100 flex items-center justify-center bg-forest-950/95 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close image"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white hover:text-forest-950"
          >
            ✕
          </button>

          <button
            type="button"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white hover:text-forest-950 sm:left-8"
          >
            ‹
          </button>

          <figure
            className="relative max-h-[85vh] w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={active.src}
              alt={active.alt}
              width={1400}
              height={933}
              sizes="90vw"
              className="max-h-[78vh] w-full rounded-3xl object-contain"
            />
            <figcaption className="mt-4 text-center text-sm text-white/75">
              {active.caption} · <span className="text-forest-300">{active.tag}</span>
            </figcaption>
          </figure>

          <button
            type="button"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
            className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white hover:text-forest-950 sm:right-8"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
