export const site = {
  name: "Pretoria Hiking Club",
  shortName: "PHC",
  tagline: "Hike. Connect. Explore.",
  slogan: "One Movement, Different Locations",
  description:
    "Join 1,000+ hikers exploring some of South Africa's best trails and outdoor experiences. Monthly 5KM and 10KM hikes, camping adventures and getaway weekends from Pretoria.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pretoriahikingclub.co.za",
  email: "hello@pretoriahikingclub.co.za",
  phone: "+27 67 986 2379",
  whatsapp: "https://wa.me/27679862379",
  whatsappGroup: "https://chat.whatsapp.com/FyOOtXnCJQpJ588AGtUbKi",
  instagram: "https://www.instagram.com/pretoria.hiking.c/",
  instagramHandle: "@pretoria.hiking.c",
  tiktok: "https://www.tiktok.com/@pretoria.hiking.c",
  tiktokHandle: "@pretoria.hiking.c",
  city: "Pretoria, South Africa",
  bank: {
    accountName: "Pretoria Hiking Club",
    bank: "FNB Gold Business Account",
    accountNumber: "63227120283",
    branchCode: "250655",
  },
} as const;

export function whatsappShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export const clubStats = [
  { value: "1,000+", label: "Hikers" },
  { value: "5KM & 10KM", label: "Trails" },
  { value: "1–2", label: "Hikes every month" },
  { value: "All ages", label: "Welcome" },
];

export const communityStats = [
  { value: "1,000+", label: "Hikers" },
  { value: "5KM & 10KM", label: "Trails" },
  { value: "12+", label: "Events every year" },
  { value: "All ages", label: "Welcome" },
];
