export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  tag: "Group hikes" | "Trails" | "Nature" | "Camping" | "Team" | "Getaways" | "Social";
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/hero-group-hike.jpg",
    alt: "Hikers celebrating together on a mountain trail",
    caption: "Summit high fives, Magaliesberg",
    tag: "Group hikes",
  },
  {
    src: "/images/gallery-friends-sunset.jpg",
    alt: "Club members sitting together watching the sunset",
    caption: "Sundowners after the 10KM route",
    tag: "Social",
  },
  {
    src: "/images/hero-trail.jpg",
    alt: "Two hikers walking a mountain trail",
    caption: "Early start on the ridge",
    tag: "Trails",
  },
  {
    src: "/images/gallery-campfire.jpg",
    alt: "Group around a campfire at night",
    caption: "Campfire stories, Cradle of Humankind",
    tag: "Camping",
  },
  {
    src: "/images/gallery-green-valley.jpg",
    alt: "Green valley with dramatic clouds",
    caption: "Big sky country",
    tag: "Nature",
  },
  {
    src: "/images/gallery-sunset-rock.jpg",
    alt: "Hikers watching the sunset from a rocky viewpoint",
    caption: "The reward at the top",
    tag: "Group hikes",
  },
  {
    src: "/images/gallery-tent-night.jpg",
    alt: "Tent pitched in a mountain meadow",
    caption: "Camp set up before dark",
    tag: "Camping",
  },
  {
    src: "/images/gallery-suspension-bridge.jpg",
    alt: "Hiker crossing a suspension bridge",
    caption: "Crossing over, Hennops",
    tag: "Trails",
  },
  {
    src: "/images/gallery-golden-hour.jpg",
    alt: "Friends standing together in golden hour light",
    caption: "The crew, golden hour",
    tag: "Team",
  },
  {
    src: "/images/gallery-braai-fire.jpg",
    alt: "Braai on the fire",
    caption: "Braai day at Rietvlei",
    tag: "Social",
  },
  {
    src: "/images/event-capetown.jpg",
    alt: "Aerial view of Cape Town and Table Mountain",
    caption: "Cape Town adventure week",
    tag: "Getaways",
  },
  {
    src: "/images/gallery-peaks.jpg",
    alt: "Snow dusted mountain peaks",
    caption: "Drakensberg weekend",
    tag: "Nature",
  },
  {
    src: "/images/gallery-stars-tent.jpg",
    alt: "Tent under a starry sky",
    caption: "Stargazing after the night hike",
    tag: "Camping",
  },
  {
    src: "/images/gallery-forest-bridge.jpg",
    alt: "Wooden bridge through a forest",
    caption: "Forest section, Hennops river trail",
    tag: "Trails",
  },
  {
    src: "/images/gallery-long-table.jpg",
    alt: "Long table social dinner",
    caption: "Club dinner, Pretoria East",
    tag: "Social",
  },
  {
    src: "/images/event-ballito.jpg",
    alt: "Coastline at sunrise",
    caption: "Ballito getaway weekend",
    tag: "Getaways",
  },
  {
    src: "/images/gallery-hands.jpg",
    alt: "Hands stacked together as a team",
    caption: "One team, one trail",
    tag: "Team",
  },
  {
    src: "/images/gallery-elephant.jpg",
    alt: "Elephant in the bushveld",
    caption: "Game reserve hike",
    tag: "Nature",
  },
  {
    src: "/images/gallery-mountain-lake.jpg",
    alt: "Mountain peaks above the clouds",
    caption: "Above the clouds",
    tag: "Nature",
  },
  {
    src: "/images/event-night-camp.jpg",
    alt: "Glowing tent at night",
    caption: "Night hike and campout",
    tag: "Camping",
  },
  {
    src: "/images/gallery-forest-road.jpg",
    alt: "Road through a misty forest",
    caption: "On the way to the trailhead",
    tag: "Trails",
  },
  {
    src: "/images/card-community.jpg",
    alt: "Friends laughing together outdoors",
    caption: "The social part of the club",
    tag: "Team",
  },
  {
    src: "/images/gallery-red-mountain.jpg",
    alt: "Red mountain ridge at sunrise",
    caption: "First light on the ridge",
    tag: "Trails",
  },
  {
    src: "/images/card-getaways.jpg",
    alt: "Surfer riding a wave",
    caption: "Ocean days on the KZN coast",
    tag: "Getaways",
  },
];

export const galleryTags = [
  "All",
  "Group hikes",
  "Trails",
  "Nature",
  "Camping",
  "Team",
  "Getaways",
  "Social",
] as const;
