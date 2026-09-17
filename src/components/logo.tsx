import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

// Intrinsic size of the traced artwork, used to reserve space and avoid layout shift.
const MARK_W = 268;
const MARK_H = 214;

/**
 * The club mark. The artwork's overlay (hiker, mountain outlines, sparkles) is
 * white, which disappears on pale backgrounds, so there are two variants. Both
 * are rendered and cross-faded: the header flips tone on scroll, and keeping
 * each variant in the DOM means the swap never flashes an unloaded image.
 *
 * The mark lives in /public rather than inline because the traced paths are
 * ~21KB; as a static file the browser fetches it once and caches it site-wide.
 */
export function LogoMark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn("relative block h-9 shrink-0", className)}
      style={{ aspectRatio: `${MARK_W} / ${MARK_H}` }}
    >
      {(
        [
          ["/brand/mark-on-light.svg", tone === "dark"],
          ["/brand/mark-on-dark.svg", tone === "light"],
        ] as const
      ).map(([src, visible]) => (
        // eslint-disable-next-line @next/next/no-img-element -- static SVG needs no optimisation
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          width={MARK_W}
          height={MARK_H}
          className={cn(
            "absolute inset-0 h-full w-full transition-opacity duration-500",
            visible ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </span>
  );
}

export function Logo({
  className,
  tone = "dark",
  showTagline = true,
}: {
  className?: string;
  tone?: "dark" | "light";
  showTagline?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5",
        tone === "light" ? "text-white" : "text-forest-900",
        className,
      )}
    >
      <LogoMark tone={tone} className="h-10" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-extrabold tracking-tight">
          {site.name}
        </span>
        {showTagline ? (
          <span
            className={cn(
              "mt-1 hidden whitespace-nowrap text-[0.53rem] font-semibold uppercase tracking-[0.16em] sm:block",
              tone === "light" ? "text-forest-300" : "text-stone",
            )}
          >
            {site.slogan}
          </span>
        ) : null}
      </span>
    </span>
  );
}
