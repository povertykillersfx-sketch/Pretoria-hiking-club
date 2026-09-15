export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  tag: "Group hikes" | "Trails" | "Nature" | "Camping" | "Team" | "Getaways" | "Social";
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/hero-group-hike.jpg",
    alt: "Pretoria Hiking Club members walking a grassy trail on a sunny day",
    caption: "The crew on the trail",
    tag: "Group hikes",
  },
  {
    src: "/images/gallery-sunset-rock.jpg",
    alt: "Hikers covered in colour powder walking a rocky hillside",
    caption: "Colour run on the ridge",
    tag: "Group hikes",
  },
  {
    src: "/images/gallery-suspension-bridge.jpg",
    alt: "Club members in One Movement Different Locations shirts walking together",
    caption: "One movement, different locations",
    tag: "Team",
  },
  {
    src: "/images/gallery-tent-night.jpg",
    alt: "Rows of club tents pitched on a grassy campsite",
    caption: "Camp is up",
    tag: "Camping",
  },
  {
    src: "/images/gallery-friends-sunset.jpg",
    alt: "Three members posing in an I have completed the hike photo frame",
    caption: "Hike completed",
    tag: "Social",
  },
  {
    src: "/images/hero-trail.jpg",
    alt: "A line of hikers on a red-earth trail through bushveld",
    caption: "Single file on the trail",
    tag: "Trails",
  },
  {
    src: "/images/gallery-mountain-lake.jpg",
    alt: "Club members celebrating under a waterfall",
    caption: "Waterfall stop",
    tag: "Getaways",
  },
  {
    src: "/images/gallery-golden-hour.jpg",
    alt: "A member holding a Pretoria Hiking Club welcome photo frame",
    caption: "Welcome to the movement",
    tag: "Social",
  },
  {
    src: "/images/gallery-peaks.jpg",
    alt: "Three hikers walking away along a dusty ridge under a blue sky",
    caption: "Up on the ridge",
    tag: "Trails",
  },
  {
    src: "/images/gallery-campfire.jpg",
    alt: "Two members sitting by a tent after a hike, wearing club shirts",
    caption: "After the hike, at camp",
    tag: "Camping",
  },
  {
    src: "/images/card-community.jpg",
    alt: "The group walking away in matching club shirts",
    caption: "The Saturday crew",
    tag: "Team",
  },
  {
    src: "/images/hero-ridge.jpg",
    alt: "Hikers on a dry hillside with colour powder in their hair",
    caption: "Colour still in the hair",
    tag: "Nature",
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
