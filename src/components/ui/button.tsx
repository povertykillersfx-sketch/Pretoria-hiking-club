import { cn } from "@/lib/cn";

type Variant = "primary" | "ember" | "light" | "outline" | "outlineDark" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-display font-bold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-700 text-white shadow-[0_10px_30px_-12px_rgba(6,26,17,0.8)] hover:bg-forest-600 hover:shadow-[0_18px_40px_-14px_rgba(6,26,17,0.85)] hover:-translate-y-0.5 active:translate-y-0",
  ember:
    "bg-ember text-ink shadow-[0_10px_30px_-12px_rgba(192,112,60,0.9)] hover:bg-clay hover:text-white hover:-translate-y-0.5 active:translate-y-0",
  light:
    "bg-white text-forest-900 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.6)] hover:bg-forest-100 hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border border-white/35 bg-white/5 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-forest-900 hover:-translate-y-0.5 active:translate-y-0",
  outlineDark:
    "border border-forest-900/20 text-forest-900 hover:border-forest-900 hover:bg-forest-900 hover:text-white hover:-translate-y-0.5 active:translate-y-0",
  ghost: "text-forest-800 hover:text-forest-600",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-7 py-4 text-base sm:text-[1.05rem]",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("h-4 w-4 transition-transform duration-300 group-hover:translate-x-1", className)}
    >
      <path
        d="M4 10h11m0 0-4.2-4.2M15 10l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
