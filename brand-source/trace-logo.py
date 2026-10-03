"""Generate brand assets from the supplied club logo PNG.

The source art is a flat two-colour lockup at 500px. Everything the site uses is
traced from it so the mark stays crisp at any size.
"""

import json

import numpy as np
import potrace
from PIL import Image, ImageFilter
from scipy import ndimage

SRC = "/home/ubuntu/.cursor/projects/workspace/assets/54627caf-20e0-4d1e-80b1-336f977d2fde.png"
BRAND_GREEN = "#00BF63"
INK = "#061a11"

im = Image.open(SRC).convert("RGBA")
a = np.array(im).astype(int)
r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
opaque = al > 40
white_all = opaque & (r > 200) & (g > 200) & (b > 200)
green_all = opaque & ~white_all

# Drop the "PRETORIA" wordmark and the "HIKING CLUB" / tagline lines: the site
# renders all of those as live text.
lab, n = ndimage.label(white_all)
for i in range(1, n + 1):
    ys, xs = np.where(lab == i)
    if ys.min() >= 310 and ys.max() <= 345 and xs.max() <= 240:
        white_all[lab == i] = False
white_all[350:, :] = False
green_all[350:, :] = False


def trace(mask, box, scale=4, blur=4.0, turd=80, tol=2.0):
    x0, y0, x1, y1 = box
    sub = mask[y0:y1, x0:x1]
    if not sub.any():
        return ""
    img = Image.fromarray((sub * 255).astype(np.uint8), mode="L")
    img = img.resize((img.width * scale, img.height * scale), Image.LANCZOS)
    img = img.filter(ImageFilter.GaussianBlur(blur))
    bmp = potrace.Bitmap(~(np.array(img) > 127))
    path = bmp.trace(turdsize=turd, alphamax=1.0, opticurve=True, opttolerance=tol)
    out = []
    for curve in path:
        p = curve.start_point
        out.append(f"M{p.x / scale:.1f} {p.y / scale:.1f}")
        for seg in curve:
            e = seg.end_point
            if seg.is_corner:
                c = seg.c
                out.append(f"L{c.x / scale:.1f} {c.y / scale:.1f}L{e.x / scale:.1f} {e.y / scale:.1f}")
            else:
                c1, c2 = seg.c1, seg.c2
                out.append(
                    f"C{c1.x / scale:.1f} {c1.y / scale:.1f} "
                    f"{c2.x / scale:.1f} {c2.y / scale:.1f} {e.x / scale:.1f} {e.y / scale:.1f}"
                )
        out.append("Z")
    return "".join(out)


# --- full mark -------------------------------------------------------------
icon = white_all | green_all
ys, xs = np.where(icon)
box = (xs.min() - 2, ys.min() - 2, xs.max() + 3, ys.max() + 3)
MW, MH = box[2] - box[0], box[3] - box[1]
mark_green = trace(green_all, box)
mark_white = trace(white_all, box)
print(f"mark {MW}x{MH} green={len(mark_green)} white={len(mark_white)}")

# --- hiker only (legible at favicon sizes) ---------------------------------
hbox = (248, 132, 392, 344)
HW, HH = hbox[2] - hbox[0], hbox[3] - hbox[1]
hiker_green = trace(green_all, hbox, blur=3.0, turd=50, tol=1.6)
hiker_white = trace(white_all, hbox, blur=3.0, turd=50, tol=1.6)
print(f"hiker {HW}x{HH} green={len(hiker_green)} white={len(hiker_white)}")

json.dump(
    {
        "mark": {"w": int(MW), "h": int(MH), "green": mark_green, "white": mark_white},
        "hiker": {"w": HW, "h": HH, "green": hiker_green, "white": hiker_white},
        "brandGreen": BRAND_GREEN,
        "ink": INK,
    },
    open("/tmp/brand.json", "w"),
)
print("wrote /tmp/brand.json")
