import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <circle cx="24" cy="24" r="23" className="fill-current" opacity="0.12" />
      <circle cx="24" cy="24" r="23" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
      <path
        d="M9 33.5 19.2 17.8l5.1 7.9 3.1-4.6L39 33.5H9Z"
        fill="currentColor"
      />
      <circle cx="32.5" cy="15" r="3.6" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5",
        tone === "light" ? "text-white" : "text-forest-800",
        className,
      )}
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-extrabold tracking-tight">
          Pretoria Hiking Club
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em]",
            tone === "light" ? "text-forest-300" : "text-stone",
          )}
        >
          Est. Gauteng
        </span>
      </span>
    </span>
  );
}
