"""Replace stock photography with the club's own photos.

Every existing /public/images filename is kept so page, event and gallery
references do not have to change. Each file is regenerated from one of the
ten club photos, cropped around a focal point so faces survive landscape
and square cuts from the original 3:4 portraits.
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "brand-source" / "club-photos"
OUT = ROOT / "public" / "images"

# Original uploads, in the order they were sent.
SOURCES = {
    "line-sunny": "line-sunny.jpg",
    "colour-run": "colour-run.jpg",
    "one-movement": "one-movement.jpg",
    "tents": "tents.jpg",
    "completed-frame": "completed-frame.jpg",
    "colour-ridge": "colour-ridge.jpg",
    "waterfall": "waterfall.jpg",
    "welcome-frame": "welcome-frame.jpg",
    "trail-line": "trail-line.jpg",
    "camp-chairs": "camp-chairs.jpg",
}

# (width, height)
LANDSCAPE = (1920, 1200)
PORTRAIT = (1200, 1600)
SQUARE = (900, 900)
HERO = (1920, 1280)


def cover(im: Image.Image, tw: int, th: int, fx: float, fy: float) -> Image.Image:
    """Crop to the target aspect around a focal point, then resize."""
    sw, sh = im.size
    target = tw / th
    source = sw / sh
    if source > target:
        nw = int(sh * target)
        cx = int(fx * sw)
        left = max(0, min(sw - nw, cx - nw // 2))
        box = (left, 0, left + nw, sh)
    else:
        nh = int(sw / target)
        cy = int(fy * sh)
        top = max(0, min(sh - nh, cy - nh // 2))
        box = (0, top, sw, top + nh)
    cropped = im.crop(box)
    return cropped.resize((tw, th), Image.Resampling.LANCZOS)


def save_jpeg(im: Image.Image, path: Path) -> None:
    rgb = im.convert("RGB")
    rgb = ImageOps.exif_transpose(rgb)
    rgb.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"  {path.name:32s} {path.stat().st_size // 1024:4d}KB  {rgb.size}")


loaded: dict[str, Image.Image] = {}
for key, filename in SOURCES.items():
    src = ASSETS / filename
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    loaded[key] = im
    print(f"loaded {key} {im.size}")


# filename -> (source key, size, fx, fy)
# Focal points are fractions of width/height; they keep faces in frame when
# the 3:4 originals are cut to landscape or square.
JOBS: list[tuple[str, str, tuple[int, int], float, float]] = [
    # Heroes
    ("hero-group-hike.jpg", "line-sunny", HERO, 0.48, 0.68),
    ("hero-trail.jpg", "trail-line", PORTRAIT, 0.48, 0.58),
    ("hero-ridge.jpg", "colour-ridge", LANDSCAPE, 0.45, 0.42),
    # What we do cards
    ("card-monthly-hikes.jpg", "trail-line", LANDSCAPE, 0.45, 0.55),
    ("card-camping.jpg", "tents", LANDSCAPE, 0.55, 0.55),
    ("card-getaways.jpg", "waterfall", LANDSCAPE, 0.48, 0.52),
    ("card-community.jpg", "one-movement", LANDSCAPE, 0.52, 0.55),
    # Event covers
    ("event-magaliesberg.jpg", "trail-line", LANDSCAPE, 0.42, 0.58),
    ("event-hennops.jpg", "line-sunny", LANDSCAPE, 0.50, 0.68),
    ("event-suikerbosrand.jpg", "colour-ridge", LANDSCAPE, 0.40, 0.48),
    ("event-night-camp.jpg", "tents", LANDSCAPE, 0.62, 0.50),
    ("event-drakensberg-camp.jpg", "tents", PORTRAIT, 0.55, 0.50),
    ("event-ballito.jpg", "waterfall", LANDSCAPE, 0.42, 0.48),
    ("event-capetown.jpg", "colour-run", LANDSCAPE, 0.50, 0.42),
    ("event-braai.jpg", "camp-chairs", LANDSCAPE, 0.45, 0.55),
    ("event-sunrise-hike.jpg", "colour-run", PORTRAIT, 0.50, 0.55),
    ("event-bushveld.jpg", "colour-ridge", PORTRAIT, 0.42, 0.50),
    # Gallery
    ("gallery-friends-sunset.jpg", "completed-frame", PORTRAIT, 0.48, 0.50),
    ("gallery-campfire.jpg", "camp-chairs", PORTRAIT, 0.48, 0.52),
    ("gallery-green-valley.jpg", "trail-line", PORTRAIT, 0.48, 0.45),
    ("gallery-sunset-rock.jpg", "colour-run", PORTRAIT, 0.50, 0.55),
    ("gallery-tent-night.jpg", "tents", PORTRAIT, 0.55, 0.50),
    ("gallery-suspension-bridge.jpg", "one-movement", PORTRAIT, 0.52, 0.55),
    ("gallery-golden-hour.jpg", "welcome-frame", PORTRAIT, 0.50, 0.50),
    ("gallery-braai-fire.jpg", "completed-frame", LANDSCAPE, 0.48, 0.52),
    ("gallery-peaks.jpg", "colour-ridge", PORTRAIT, 0.55, 0.28),
    ("gallery-stars-tent.jpg", "tents", LANDSCAPE, 0.50, 0.40),
    ("gallery-forest-bridge.jpg", "one-movement", LANDSCAPE, 0.50, 0.42),
    ("gallery-long-table.jpg", "welcome-frame", LANDSCAPE, 0.50, 0.52),
    ("gallery-hands.jpg", "completed-frame", SQUARE, 0.55, 0.55),
    ("gallery-elephant.jpg", "colour-run", LANDSCAPE, 0.50, 0.32),
    ("gallery-mountain-lake.jpg", "waterfall", PORTRAIT, 0.50, 0.40),
    ("gallery-forest-road.jpg", "line-sunny", PORTRAIT, 0.62, 0.38),
    ("gallery-red-mountain.jpg", "colour-ridge", LANDSCAPE, 0.55, 0.28),
    # Member avatars — tighter crops on faces
    ("member-thabo.jpg", "completed-frame", SQUARE, 0.22, 0.55),
    ("member-sarah.jpg", "welcome-frame", SQUARE, 0.50, 0.52),
    ("member-naledi.jpg", "camp-chairs", SQUARE, 0.62, 0.38),
    ("member-lerato.jpg", "line-sunny", SQUARE, 0.22, 0.62),
]

print("\nwriting site images")
for filename, key, size, fx, fy in JOBS:
    out = cover(loaded[key], size[0], size[1], fx, fy)
    save_jpeg(out, OUT / filename)

# A dedicated landscape of the hero for the Open Graph card.
og_photo = cover(loaded["line-sunny"], 1600, 900, 0.45, 0.70)
save_jpeg(og_photo, Path("/tmp/og-photo.jpg"))

missing = sorted(set(os.listdir(OUT)) - {j[0] for j in JOBS})
print("unmapped files:", missing or "none")
