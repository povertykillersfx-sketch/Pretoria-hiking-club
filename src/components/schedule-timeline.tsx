import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/cn";
import type { ScheduleItem } from "@/lib/types";

export function ScheduleTimeline({
  schedule,
  tone = "dark",
  className,
}: {
  schedule: ScheduleItem[];
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-1", className)}>
      {schedule.map((item, index) => (
        <Reveal as="li" key={`${item.time}-${item.title}`} delay={index * 60}>
          <div
            className={cn(
              "group relative flex gap-5 rounded-3xl px-4 py-4 transition-colors duration-300 sm:px-6",
              tone === "light"
                ? "hover:bg-white/5"
                : "hover:bg-forest-900/5",
            )}
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 transition-all duration-300 group-hover:scale-125",
                  tone === "light"
                    ? "bg-forest-300 ring-forest-300/20"
                    : "bg-forest-600 ring-forest-600/15",
                )}
              />
              {index < schedule.length - 1 && (
                <span
                  className={cn(
                    "mt-1 w-px flex-1",
                    tone === "light" ? "bg-white/15" : "bg-forest-900/12",
                  )}
                />
              )}
            </div>

            <div className="flex-1 pb-6">
              <p
                className={cn(
                  "font-display text-sm font-extrabold uppercase tracking-[0.12em]",
                  tone === "light" ? "text-forest-300" : "text-forest-600",
                )}
              >
                {item.time}
              </p>
              <h3
                className={cn(
                  "mt-1.5 font-display text-xl font-bold tracking-tight sm:text-2xl",
                  tone === "light" ? "text-white" : "text-forest-950",
                )}
              >
                {item.title}
              </h3>
              {item.description && (
                <p
                  className={cn(
                    "mt-1.5 text-sm leading-relaxed",
                    tone === "light" ? "text-white/60" : "text-stone",
                  )}
                >
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

export function ArriveOnTimeNotice({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Reveal
      className={cn(
        "flex items-start gap-4 rounded-4xl border p-6 sm:p-7",
        tone === "light"
          ? "border-ember/40 bg-ember/10"
          : "border-clay/25 bg-clay/8",
      )}
    >
      <span className="text-2xl" aria-hidden="true">
        ⏰
      </span>
      <div>
        <p
          className={cn(
            "font-display text-lg font-extrabold tracking-tight sm:text-xl",
            tone === "light" ? "text-white" : "text-forest-950",
          )}
        >
          PLEASE ARRIVE ON TIME
        </p>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed sm:text-base",
            tone === "light" ? "text-white/70" : "text-stone",
          )}
        >
          Late arrivals may not be accommodated once the hike has started.
        </p>
      </div>
    </Reveal>
  );
}
