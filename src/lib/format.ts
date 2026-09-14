import type { EventWithAvailability, HikeEvent } from "./types";

const dateFormatter = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  timeZone: "Africa/Johannesburg",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T12:00:00Z`));
}

export function formatShortDate(iso: string): string {
  return shortDateFormatter.format(new Date(`${iso}T12:00:00Z`));
}

export function dateParts(iso: string): { day: string; month: string; year: string } {
  const date = new Date(`${iso}T12:00:00Z`);
  return {
    day: new Intl.DateTimeFormat("en-ZA", { day: "2-digit", timeZone: "Africa/Johannesburg" }).format(date),
    month: new Intl.DateTimeFormat("en-ZA", { month: "short", timeZone: "Africa/Johannesburg" })
      .format(date)
      .toUpperCase(),
    year: new Intl.DateTimeFormat("en-ZA", { year: "numeric", timeZone: "Africa/Johannesburg" }).format(date),
  };
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  const rands = cents / 100;
  return `R${rands.toLocaleString("en-ZA", {
    minimumFractionDigits: rands % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPriceExact(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function trailLabel(event: Pick<HikeEvent, "distance5km" | "distance10km">): string {
  if (event.distance5km && event.distance10km) return "5KM & 10KM";
  if (event.distance5km) return "5KM";
  if (event.distance10km) return "10KM";
  return "Route announced soon";
}

export function availableDistances(
  event: Pick<HikeEvent, "distance5km" | "distance10km">,
): ("5KM" | "10KM")[] {
  const distances: ("5KM" | "10KM")[] = [];
  if (event.distance5km) distances.push("5KM");
  if (event.distance10km) distances.push("10KM");
  return distances;
}

export function categoryLabel(category: HikeEvent["category"]): string {
  switch (category) {
    case "camping":
      return "Camping";
    case "getaway":
      return "Getaway";
    case "social":
      return "Social";
    default:
      return "Hike";
  }
}

export function spotsLabel(event: EventWithAvailability): string {
  if (event.isPast) return "Event completed";
  if (event.soldOut) return "Sold out";
  if (event.bookingsClosed) return "Bookings closed";
  if (event.spotsRemaining <= 5) {
    return `Only ${event.spotsRemaining} ${event.spotsRemaining === 1 ? "spot" : "spots"} left`;
  }
  return `${event.spotsRemaining} spots remaining`;
}

export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T12:00:00Z`).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
