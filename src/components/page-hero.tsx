import Image from "next/image";
import { cn } from "@/lib/cn";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  children,
  compact = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  image: string;
  imageAlt?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden bg-forest-950 px-5 pb-12 pt-32 sm:px-8 sm:pb-16 sm:pt-40 lg:px-10",
        compact ? "min-h-[46svh]" : "min-h-[62svh]",
      )}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950 via-forest-950/70 to-forest-950/45" />
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {eyebrow && <p className="eyebrow fade-up text-forest-300">{eyebrow}</p>}
        <h1
          className="display fade-up mt-4 max-w-3xl text-[clamp(2.25rem,7vw,4.5rem)] text-white"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="fade-up mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            {description}
          </p>
        )}
        {children && (
          <div className="fade-up mt-8" style={{ animationDelay: "320ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
