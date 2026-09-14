import Link from "next/link";
import { ArrowIcon, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatPrice, spotsLabel } from "@/lib/format";
import type { EventWithAvailability } from "@/lib/types";

export function StickyBookBar({ event }: { event: EventWithAvailability }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-900/10 bg-bone/95 px-4 py-3 backdrop-blur-lg lg:hidden">
      <div className="flex items-center justify-between gap-4 pb-[env(safe-area-inset-bottom)]">
        <div className="min-w-0">
          <p className="font-display text-xl font-extrabold leading-none tracking-tight text-forest-900">
            {formatPrice(event.priceCents)}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-xs font-semibold",
              event.soldOut ? "text-clay" : "text-forest-600",
            )}
          >
            {spotsLabel(event)}
          </p>
        </div>

        {event.bookingOpen ? (
          <Link href={`/book/${event.slug}`} className={buttonClasses("primary", "md")}>
            Book Your Spot
            <ArrowIcon />
          </Link>
        ) : (
          <span
            className={cn(
              buttonClasses("outlineDark", "md"),
              "pointer-events-none border-forest-900/15 text-stone opacity-70",
            )}
          >
            {event.soldOut ? "Sold Out" : event.isPast ? "Completed" : "Bookings Closed"}
          </span>
        )}
      </div>
    </div>
  );
}
