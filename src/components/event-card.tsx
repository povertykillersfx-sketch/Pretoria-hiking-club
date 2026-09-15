import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  categoryLabel,
  dateParts,
  formatDate,
  formatPrice,
  spotsLabel,
  trailLabel,
} from "@/lib/format";
import type { EventWithAvailability } from "@/lib/types";

function MetaRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-forest-900/75">
      <span className="mt-0.5 text-forest-600">{icon}</span>
      <span className="leading-snug">{children}</span>
    </li>
  );
}

const icons = {
  pin: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M8 14.5s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="6.4" r="1.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  route: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3.4 12.6c3 0 2-4.4 5-4.4s2.2-4.4 5.2-4.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="3.4" cy="12.6" r="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.6" cy="3.8" r="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  gauge: (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M2.6 12a5.8 5.8 0 1 1 10.8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 11 10.8 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

export function EventCard({
  event,
  priority = false,
  className,
}: {
  event: EventWithAvailability;
  priority?: boolean;
  className?: string;
}) {
  const { day, month } = dateParts(event.date);
  const closed = !event.bookingOpen;
  const almostGone = !closed && event.spotsRemaining <= 8;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-4xl border border-forest-900/8 bg-white shadow-[0_2px_20px_-12px_rgba(6,26,17,0.35)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(6,26,17,0.55)]",
        className,
      )}
    >
      <Link href={`/events/${event.slug}`} className="relative block aspect-4/3 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-forest-950/75 via-forest-950/10 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-col items-center rounded-2xl bg-white/95 px-3.5 py-2 text-center shadow-lg backdrop-blur">
          <span className="font-display text-2xl font-extrabold leading-none text-forest-800">{day}</span>
          <span className="mt-0.5 text-[0.62rem] font-bold tracking-[0.16em] text-stone">{month}</span>
        </div>

        <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
          <span className="rounded-full bg-forest-950/70 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
            {categoryLabel(event.category)}
          </span>
          {event.soldOut && (
            <span className="rounded-full bg-clay px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white">
              Sold out
            </span>
          )}
          {!event.soldOut && almostGone && (
            <span className="rounded-full bg-ember px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink">
              Almost full
            </span>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <h3 className="display text-xl text-white drop-shadow-sm sm:text-2xl">{event.title}</h3>
          <span className="shrink-0 rounded-full bg-white/95 px-3 py-1.5 font-display text-sm font-extrabold text-forest-800">
            {formatPrice(event.priceCents)}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <ul className="space-y-2.5">
          <MetaRow icon={icons.pin}>{event.location}</MetaRow>
          <MetaRow icon={icons.clock}>
            {formatDate(event.date)} · starts {event.startTime}
          </MetaRow>
          <MetaRow icon={icons.route}>{trailLabel(event)} trail options</MetaRow>
          <MetaRow icon={icons.gauge}>{event.difficulty} · all fitness levels supported</MetaRow>
        </ul>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone">{event.summary}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-forest-900/8 pt-4">
          <span
            className={cn(
              "text-sm font-semibold",
              event.soldOut || closed
                ? "text-clay"
                : almostGone
                  ? "text-ember"
                  : "text-forest-600",
            )}
          >
            {spotsLabel(event)}
          </span>

          {event.bookingOpen ? (
            <Link
              href={`/book/${event.slug}`}
              className={buttonClasses("primary", "sm")}
              aria-label={`Book your spot for ${event.title}`}
            >
              Book Your Spot
              <ArrowIcon />
            </Link>
          ) : (
            <span
              className={cn(
                buttonClasses("outlineDark", "sm"),
                "pointer-events-none border-forest-900/15 text-stone opacity-70",
              )}
            >
              {event.soldOut ? "Sold Out" : event.isPast ? "Completed" : "Bookings Closed"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
