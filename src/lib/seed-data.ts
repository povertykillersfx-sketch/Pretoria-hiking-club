import type { ScheduleItem } from "./types";

type SeedRow = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  location: string;
  meeting_point: string;
  map_url: string | null;
  event_date: string;
  start_time: string;
  arrival_time: string;
  end_time: string | null;
  distance_5km: number;
  distance_10km: number;
  difficulty: string;
  price_cents: number;
  capacity: number;
  image: string;
  gallery: string;
  schedule: string;
  includes: string;
  bring: string;
  published: number;
  bookings_closed: number;
};

type SeedBooking = {
  reference: string;
  distance: string;
  name: string;
  email: string;
  phone: string;
  people: number;
  payment_method: string;
  payment_status: string;
};

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { time: "07:00 – 07:30", title: "Arrival", description: "Registration, check-in and meet the crew." },
  { time: "07:30 – 08:00", title: "Breakfast & toilet visit", description: "Grab a coffee, fuel up and get comfortable." },
  { time: "08:00 – 08:15", title: "Briefing & warm up", description: "Trail route, safety rules and a group stretch." },
  { time: "08:15 – 08:20", title: "Team picture", description: "The one for the group chat." },
  { time: "08:30", title: "Hike starts", description: "5KM and 10KM groups head out with their trail leaders." },
  { time: "12:00", title: "Lunch", description: "Refuel, rest and swap trail stories." },
  { time: "13:00", title: "Team building / social activities", description: "Games, music and sundowners before we head home." },
];

function dateFromToday(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const standardIncludes = [
  "Qualified trail leaders on the 5KM and 10KM routes",
  "Registration, safety briefing and warm up",
  "Reserve / conservation entry fees",
  "Group photos from the day",
  "First aid support on the trail",
];

const standardBring = [
  "Comfortable hiking shoes or trainers",
  "At least 2 litres of water",
  "Sunscreen, hat and a light jacket",
  "Snacks, breakfast and lunch",
  "A fully charged phone for the group photos",
];

function booking(
  reference: string,
  name: string,
  email: string,
  phone: string,
  people: number,
  distance: string,
  paid = true,
): SeedBooking {
  return {
    reference,
    name,
    email,
    phone,
    people,
    distance,
    payment_method: paid ? "card" : "eft",
    payment_status: paid ? "paid" : "pending",
  };
}

export function seedEvents(): { row: SeedRow; bookings: SeedBooking[] }[] {
  return [
    {
      row: {
        slug: "magaliesberg-sunrise-hike",
        title: "Magaliesberg Sunrise Hike",
        category: "hike",
        summary:
          "Our signature hike through the Magaliesberg mountain range, with rock pools, ridge views and a sunrise start.",
        description:
          "The Magaliesberg is one of the oldest mountain ranges in the world and it is right on Pretoria's doorstep. We start early to catch the light on the ridge, then split into a relaxed 5KM group and a faster 10KM group.\n\nThe 5KM route follows the valley floor past the rock pools and is perfect if it is your first hike with us. The 10KM route climbs to the ridge line for the big views over the Hartbeespoort valley, with a few scrambly sections along the way.\n\nEveryone meets back at base camp for lunch, music and a social before we head home.",
        location: "Magaliesberg, North West",
        meeting_point: "Mountain Sanctuary Park gate, Rustenburg Road",
        map_url: "https://maps.google.com/?q=Magaliesberg",
        event_date: dateFromToday(12),
        start_time: "08:30",
        arrival_time: "07:00",
        end_time: "15:00",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Moderate",
        price_cents: 15000,
        capacity: 80,
        image: "/images/event-magaliesberg.jpg",
        gallery: JSON.stringify([
          "/images/gallery-green-valley.jpg",
          "/images/gallery-sunset-rock.jpg",
          "/images/hero-trail.jpg",
        ]),
        schedule: JSON.stringify(DEFAULT_SCHEDULE),
        includes: JSON.stringify(standardIncludes),
        bring: JSON.stringify(standardBring),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-8F3K21", "Thabo Mokoena", "thabo.mokoena@example.co.za", "082 445 1123", 2, "10KM"),
        booking("PHC-2M9P04", "Chantel van Wyk", "chantel.vw@example.co.za", "071 220 8890", 1, "5KM"),
        booking("PHC-7Q1D55", "Naledi Dlamini", "naledi.d@example.co.za", "083 901 4432", 4, "5KM", false),
        booking("PHC-5R8T77", "Sipho Khumalo", "sipho.k@example.co.za", "079 553 2210", 2, "10KM"),
      ],
    },
    {
      row: {
        slug: "hennops-river-trail",
        title: "Hennops River Trail Hike",
        category: "hike",
        summary:
          "A beginner-friendly favourite just outside Centurion — river crossings, cable car and shaded forest paths.",
        description:
          "Hennops is where most of our new members do their very first hike. It is close to Pretoria, well marked and shaded for most of the route.\n\nExpect two river crossings, the famous cable car pull across the water and plenty of spots to stop for photos. The 5KM loop is flat and easy going, while the 10KM route adds the ridge section with views over the valley.\n\nBring a picnic blanket — we finish the day on the lawn next to the river.",
        location: "Hennops, Centurion",
        meeting_point: "Hennops Hiking Trail entrance, R511",
        map_url: "https://maps.google.com/?q=Hennops+Hiking+Trail",
        event_date: dateFromToday(26),
        start_time: "08:30",
        arrival_time: "07:00",
        end_time: "14:30",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Easy",
        price_cents: 12000,
        capacity: 70,
        image: "/images/event-hennops.jpg",
        gallery: JSON.stringify([
          "/images/gallery-forest-bridge.jpg",
          "/images/gallery-forest-road.jpg",
          "/images/gallery-hands.jpg",
        ]),
        schedule: JSON.stringify(DEFAULT_SCHEDULE),
        includes: JSON.stringify(standardIncludes),
        bring: JSON.stringify([...standardBring, "Sandals or shoes you do not mind getting wet"]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-3K7W12", "Lerato Mabaso", "lerato.m@example.co.za", "072 118 7765", 3, "5KM"),
        booking("PHC-9L2X38", "Ryan Peters", "ryan.peters@example.co.za", "084 667 1290", 1, "10KM"),
      ],
    },
    {
      row: {
        slug: "groenkloof-city-hike",
        title: "Groenkloof Nature Reserve City Hike",
        category: "hike",
        summary:
          "A free community hike in Pretoria's oldest game reserve. Zebra, giraffe and a 360° view over the city.",
        description:
          "Once a month we host a free community hike so that anyone can join us, no matter their budget. Groenkloof Nature Reserve sits ten minutes from the city centre and is home to zebra, giraffe, kudu and impala.\n\nThe 5KM route is a gentle loop around the lower plateau. The 10KM route climbs to the top of the ridge for a full view over Pretoria.\n\nThis hike fills up fast, so book early.",
        location: "Groenkloof Nature Reserve, Pretoria",
        meeting_point: "Groenkloof Nature Reserve main gate, Christina Street",
        map_url: "https://maps.google.com/?q=Groenkloof+Nature+Reserve",
        event_date: dateFromToday(19),
        start_time: "08:00",
        arrival_time: "06:45",
        end_time: "12:30",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Easy",
        price_cents: 0,
        capacity: 60,
        image: "/images/event-suikerbosrand.jpg",
        gallery: JSON.stringify([
          "/images/gallery-elephant.jpg",
          "/images/gallery-green-valley.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "06:45 – 07:15", title: "Arrival", description: "Sign in at the main gate and meet your trail leader." },
          { time: "07:15 – 07:40", title: "Coffee & toilet visit", description: "Coffee truck on site from 06:45." },
          { time: "07:40 – 07:55", title: "Briefing & warm up", description: "Route options, game viewing rules and a stretch." },
          { time: "07:55 – 08:00", title: "Team picture", description: "Group photo at the gate." },
          { time: "08:00", title: "Hike starts", description: "5KM and 10KM groups depart together." },
          { time: "11:00", title: "Brunch & social", description: "Picnic on the lawn with the whole group." },
          { time: "12:30", title: "Wrap up", description: "Head home or join the coffee crew in Brooklyn." },
        ]),
        includes: JSON.stringify([
          "Free entry for club members and first timers",
          "Trail leaders on both routes",
          "Group photos from the day",
        ]),
        bring: JSON.stringify(standardBring),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-4T6Y90", "Ayanda Nkosi", "ayanda.nkosi@example.co.za", "081 442 9987", 2, "10KM"),
        booking("PHC-6B0N23", "Michelle Botha", "michelle.b@example.co.za", "073 889 4410", 5, "5KM"),
      ],
    },
    {
      row: {
        slug: "cradle-night-hike-campout",
        title: "Cradle of Humankind Night Hike & Campout",
        category: "camping",
        summary:
          "Head torches on for a full-moon night hike, then a campfire, a braai and a night under the stars.",
        description:
          "Our most popular overnight experience. We hike as the sun goes down, watch the moon come up over the Cradle and then set up camp together.\n\nThe night hike is a relaxed 5KM, or a 10KM route for the crew who want more. Back at camp there is a braai, a big fire, music and stargazing. Tents go up before dark and we wake up to coffee and a slow morning walk.\n\nBring your own tent, or hire one from us when you book.",
        location: "Cradle of Humankind, Gauteng",
        meeting_point: "Kromdraai camp site, Cradle of Humankind",
        map_url: "https://maps.google.com/?q=Cradle+of+Humankind",
        event_date: dateFromToday(40),
        start_time: "16:30",
        arrival_time: "15:00",
        end_time: "10:00 (Sunday)",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Moderate",
        price_cents: 45000,
        capacity: 45,
        image: "/images/event-night-camp.jpg",
        gallery: JSON.stringify([
          "/images/gallery-campfire.jpg",
          "/images/gallery-stars-tent.jpg",
          "/images/gallery-tent-night.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "15:00 – 16:00", title: "Arrival & camp setup", description: "Check in, pitch your tent and meet the crew." },
          { time: "16:00 – 16:20", title: "Briefing & warm up", description: "Night hike safety, head torch check and a stretch." },
          { time: "16:20 – 16:30", title: "Team picture", description: "Golden hour group photo." },
          { time: "16:30", title: "Night hike starts", description: "5KM and 10KM groups depart with trail leaders." },
          { time: "19:30", title: "Braai & campfire", description: "Bring your own meat, we sort the fire and the sides." },
          { time: "21:00", title: "Stargazing & social", description: "Music, games and the stars over the Cradle." },
          { time: "07:30 (Sunday)", title: "Coffee & sunrise walk", description: "A slow 3KM loop before we pack up." },
        ]),
        includes: JSON.stringify([
          "Camp site fee for Saturday night",
          "Night hike with trail leaders and sweepers",
          "Campfire, wood and braai facilities",
          "Sunday morning coffee and rusks",
          "First aid support",
        ]),
        bring: JSON.stringify([
          "Tent and sleeping bag (hire available on request)",
          "Head torch with fresh batteries",
          "Warm layers for the evening",
          "Meat and drinks for the braai",
          "Camping chair",
        ]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-1C5V67", "Kabelo Sithole", "kabelo.s@example.co.za", "082 331 5567", 2, "10KM"),
        booking("PHC-8G4H11", "Emma Fourie", "emma.fourie@example.co.za", "076 220 3391", 2, "5KM", false),
      ],
    },
    {
      row: {
        slug: "drakensberg-camping-weekend",
        title: "Drakensberg Camping Weekend",
        category: "camping",
        summary:
          "Three days in the Northern Berg — amphitheatre views, waterfalls, campfires and the best hiking in the country.",
        description:
          "Our annual Drakensberg weekend is the highlight of the club calendar. We travel down on the Friday, camp at the foot of the Amphitheatre and spend Saturday on the trails.\n\nSaturday offers a relaxed 5KM waterfall walk and a proper 10KM mountain route for the experienced hikers. Sunday is a slow morning, a swim in the rock pools and the drive home.\n\nTransport can be arranged from Pretoria — select it as a note when you book.",
        location: "Northern Drakensberg, KwaZulu-Natal",
        meeting_point: "Departure from Menlyn Park, Pretoria (or meet us there)",
        map_url: "https://maps.google.com/?q=Northern+Drakensberg",
        event_date: dateFromToday(61),
        start_time: "07:00",
        arrival_time: "06:00",
        end_time: "Sunday 16:00",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Challenging",
        price_cents: 145000,
        capacity: 40,
        image: "/images/event-drakensberg-camp.jpg",
        gallery: JSON.stringify([
          "/images/gallery-peaks.jpg",
          "/images/gallery-mountain-lake.jpg",
          "/images/gallery-campfire.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "Friday 06:00", title: "Arrival & departure", description: "Meet at Menlyn Park for the convoy down to the Berg." },
          { time: "Friday 13:00", title: "Camp setup & lunch", description: "Pitch tents, settle in and explore the camp." },
          { time: "Friday 18:00", title: "Braai & briefing", description: "Dinner around the fire and the plan for Saturday." },
          { time: "Saturday 06:30", title: "Breakfast", description: "Coffee, eggs and a big start to the day." },
          { time: "Saturday 07:30", title: "Hike starts", description: "5KM waterfall route or 10KM mountain route." },
          { time: "Saturday 13:00", title: "Lunch at the pools", description: "Swim, rest and refuel." },
          { time: "Saturday 18:30", title: "Social night", description: "Music, games and stargazing." },
          { time: "Sunday 09:00", title: "Slow morning & pack up", description: "Coffee, photos and the drive home." },
        ]),
        includes: JSON.stringify([
          "Two nights camping",
          "Friday braai and Saturday breakfast",
          "Guided hikes on both routes",
          "Conservation and camp fees",
          "First aid support",
        ]),
        bring: JSON.stringify([
          "Tent, sleeping bag and mattress",
          "Warm clothing — the Berg gets cold at night",
          "Hiking boots with ankle support",
          "Swimming costume for the rock pools",
          "Head torch and camping chair",
        ]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-2W9E48", "Jason Adams", "jason.adams@example.co.za", "083 447 2219", 2, "10KM"),
        booking("PHC-7Y3U62", "Palesa Mothibi", "palesa.m@example.co.za", "078 990 1123", 3, "5KM"),
      ],
    },
    {
      row: {
        slug: "ballito-getaway-weekend",
        title: "Ballito Getaway Weekend",
        category: "getaway",
        summary:
          "Coastal trails, warm ocean, beach braais and a long weekend with the crew on the KZN North Coast.",
        description:
          "Four days on the North Coast with the people you hike with. We stay in self-catering villas a few minutes from the beach, hike the coastal forest trails in the morning and spend the afternoons in the ocean.\n\nThere is a 5KM beach route and a 10KM coastal forest route on the Saturday, a boat cruise on the Sunday and a farewell beach braai to close the weekend.\n\nSpots are limited to keep the group tight.",
        location: "Ballito, KwaZulu-Natal",
        meeting_point: "Ballito villas — address sent after booking",
        map_url: "https://maps.google.com/?q=Ballito",
        event_date: dateFromToday(89),
        start_time: "14:00",
        arrival_time: "12:00",
        end_time: "Monday 11:00",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Easy",
        price_cents: 295000,
        capacity: 30,
        image: "/images/event-ballito.jpg",
        gallery: JSON.stringify([
          "/images/card-getaways.jpg",
          "/images/gallery-long-table.jpg",
          "/images/gallery-golden-hour.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "Friday 12:00 – 14:00", title: "Arrival & check in", description: "Settle into the villas and meet your roommates." },
          { time: "Friday 17:00", title: "Welcome sundowners", description: "Drinks on the deck and the weekend briefing." },
          { time: "Saturday 07:00", title: "Breakfast", description: "Fuel up before the trail." },
          { time: "Saturday 08:00", title: "Coastal hike starts", description: "5KM beach route or 10KM coastal forest route." },
          { time: "Saturday 13:00", title: "Beach afternoon", description: "Swim, surf lessons or simply nap." },
          { time: "Saturday 18:30", title: "Beach braai", description: "The big social of the weekend." },
          { time: "Sunday 10:00", title: "Boat cruise & lunch", description: "Out on the water with the whole crew." },
          { time: "Monday 11:00", title: "Check out", description: "Coffee, group photo and the road home." },
        ]),
        includes: JSON.stringify([
          "Three nights shared self-catering accommodation",
          "Saturday guided coastal hikes",
          "Welcome sundowners and Saturday beach braai",
          "Sunday boat cruise",
          "Group photos and video from the weekend",
        ]),
        bring: JSON.stringify([
          "Swimming costume and beach towel",
          "Trail shoes for the coastal forest route",
          "Sunscreen and a hat",
          "Something smart for the Saturday night braai",
        ]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-5N8J39", "Zanele Mahlangu", "zanele.m@example.co.za", "082 110 7754", 2, "5KM"),
      ],
    },
    {
      row: {
        slug: "cape-town-adventure-week",
        title: "Cape Town Adventure Week",
        category: "getaway",
        summary:
          "Table Mountain, Lion's Head sunrise, Cape Point and a week of adventure in the Mother City.",
        description:
          "Our biggest trip of the year. Five days in Cape Town with a hike every morning and the city every evening.\n\nWe do the Lion's Head sunrise hike, Platteklip Gorge up Table Mountain, the Cape Point coastal route and a wine farm walk in Stellenbosch. Everything has a 5KM and a 10KM option so that every fitness level can join.\n\nFlights are not included. We help you book the same flights as the group.",
        location: "Cape Town, Western Cape",
        meeting_point: "Group accommodation in Green Point — details after booking",
        map_url: "https://maps.google.com/?q=Cape+Town",
        event_date: dateFromToday(124),
        start_time: "09:00",
        arrival_time: "08:00",
        end_time: "Day 5, 18:00",
        distance_5km: 1,
        distance_10km: 1,
        difficulty: "Challenging",
        price_cents: 650000,
        capacity: 24,
        image: "/images/event-capetown.jpg",
        gallery: JSON.stringify([
          "/images/gallery-red-mountain.jpg",
          "/images/gallery-suspension-bridge.jpg",
          "/images/card-getaways.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "Day 1 08:00", title: "Arrival & check in", description: "Meet at the group house in Green Point." },
          { time: "Day 1 16:00", title: "Sea Point promenade walk", description: "Easy 5KM to shake off the flight." },
          { time: "Day 2 04:30", title: "Lion's Head sunrise hike", description: "Head torches on for the classic sunrise summit." },
          { time: "Day 3 07:00", title: "Table Mountain", description: "Platteklip Gorge up, cable car down." },
          { time: "Day 4 08:00", title: "Cape Point coastal route", description: "5KM or 10KM along the peninsula." },
          { time: "Day 5 10:00", title: "Stellenbosch wine walk", description: "A gentle vineyard walk and a long lunch." },
        ]),
        includes: JSON.stringify([
          "Five nights shared accommodation",
          "All guided hikes and permits",
          "Airport transfers and transport between hikes",
          "Welcome dinner and farewell lunch",
          "Trip photographer",
        ]),
        bring: JSON.stringify([
          "Proper hiking boots",
          "Windbreaker — the Cape weather turns fast",
          "Daypack with a 2 litre water bladder",
          "Camera",
        ]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-3Z1Q84", "Tebogo Radebe", "tebogo.r@example.co.za", "079 445 1176", 1, "10KM"),
      ],
    },
    {
      row: {
        slug: "braai-and-sundowners-social",
        title: "Braai & Sundowners Social",
        category: "social",
        summary:
          "No hiking boots needed. An easy 5KM stroll, a big braai and sundowners with the whole club.",
        description:
          "Once a quarter we swap the trail for a braai. There is a relaxed 5KM sunset walk for those who want to move, and a fire, music and good food for everyone else.\n\nThis is the easiest way to meet the club if you are new. Bring a friend, bring your own meat and we will handle the rest.",
        location: "Rietvlei Nature Reserve, Pretoria",
        meeting_point: "Rietvlei Dam picnic site",
        map_url: "https://maps.google.com/?q=Rietvlei+Nature+Reserve",
        event_date: dateFromToday(33),
        start_time: "15:00",
        arrival_time: "14:30",
        end_time: "20:00",
        distance_5km: 1,
        distance_10km: 0,
        difficulty: "Easy",
        price_cents: 8000,
        capacity: 12,
        image: "/images/event-braai.jpg",
        gallery: JSON.stringify([
          "/images/gallery-braai-fire.jpg",
          "/images/gallery-long-table.jpg",
          "/images/card-community.jpg",
        ]),
        schedule: JSON.stringify([
          { time: "14:30 – 15:00", title: "Arrival", description: "Check in and claim your spot at the fire." },
          { time: "15:00", title: "Sunset walk", description: "An easy 5KM loop around the dam." },
          { time: "16:30", title: "Fires on", description: "Braai time — bring your own meat." },
          { time: "18:00", title: "Sundowners & music", description: "The social part of the club at its best." },
          { time: "20:00", title: "Wrap up", description: "Gates close at 20:30." },
        ]),
        includes: JSON.stringify([
          "Reserve entry",
          "Braai fires, wood and grids",
          "Salads and sides",
          "Music and games",
        ]),
        bring: JSON.stringify([
          "Your own meat and drinks",
          "A camping chair",
          "A warm top for after sunset",
        ]),
        published: 1,
        bookings_closed: 0,
      },
      bookings: [
        booking("PHC-6D2S95", "Hannes Pretorius", "hannes.p@example.co.za", "084 220 9981", 6, "5KM"),
        booking("PHC-9F7A16", "Refilwe Moloi", "refilwe.m@example.co.za", "071 664 3320", 4, "5KM"),
        booking("PHC-0H5K27", "Dineo Molefe", "dineo.m@example.co.za", "072 331 9985", 2, "5KM"),
      ],
    },
  ];
}
