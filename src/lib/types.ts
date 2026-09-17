export type EventCategory = "hike" | "camping" | "getaway" | "social";

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export type TrailDistance = "5KM" | "10KM";

export type ScheduleItem = {
  time: string;
  title: string;
  description?: string;
};

export type HikeEvent = {
  id: number;
  slug: string;
  title: string;
  category: EventCategory;
  summary: string;
  description: string;
  location: string;
  meetingPoint: string;
  mapUrl: string | null;
  date: string;
  startTime: string;
  arrivalTime: string;
  endTime: string | null;
  distance5km: boolean;
  distance10km: boolean;
  difficulty: Difficulty;
  priceCents: number;
  capacity: number;
  image: string;
  gallery: string[];
  schedule: ScheduleItem[];
  includes: string[];
  bring: string[];
  published: boolean;
  bookingsClosed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventWithAvailability = HikeEvent & {
  spotsBooked: number;
  spotsRemaining: number;
  soldOut: boolean;
  bookingOpen: boolean;
  isPast: boolean;
};

export type PaymentMethod = "card" | "eft" | "free";
export type PaymentStatus = "paid" | "pending" | "not_required";
export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: number;
  reference: string;
  eventId: number;
  distance: TrailDistance;
  name: string;
  email: string;
  phone: string;
  people: number;
  amountCents: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  checkinToken: string;
  checkedInAt: string | null;
};

export type BookingWithEvent = Booking & {
  event: HikeEvent;
};
