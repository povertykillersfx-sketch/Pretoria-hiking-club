import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn(align === "center" ? "max-w-3xl" : "max-w-2xl")}>
        {eyebrow && (
          <p className={cn("eyebrow", tone === "light" ? "text-forest-300" : "text-forest-600")}>
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "display mt-4 text-4xl sm:text-5xl lg:text-[3.4rem]",
            tone === "light" ? "text-white" : "text-forest-950",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-5 text-base leading-relaxed sm:text-lg",
              tone === "light" ? "text-white/70" : "text-stone",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
