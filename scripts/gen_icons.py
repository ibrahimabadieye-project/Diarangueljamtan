"""Génère les icônes PWA de Keur Mame Diarra (palette Terre & Soleil)."""
from PIL import Image, ImageDraw

TERRACOTTA = (180, 83, 42)      # #B4532A
CREAM = (250, 247, 239)         # #FAF7EF
FOREST = (20, 83, 45)           # #14532D
SUN = (240, 170, 60)            # jaune ocre chaleureux


def rounded(draw, xy, radius, fill):
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def make_icon(size: int, maskable: bool = False):
    img = Image.new("RGB", (size, size), CREAM)
    dr = ImageDraw.Draw(img)
    s = size
    # Fond : carré arrondi terracotta (plein si maskable, sinon marges)
    pad = 0 if maskable else int(s * 0.04)
    bg_radius = s if maskable else int(s * 0.22)
    if maskable:
        dr.rectangle([0, 0, s, s], fill=TERRACOTTA)
    else:
        rounded(dr, [pad, pad, s - pad, s - pad], bg_radius, TERRACOTTA)

    cx = s / 2
    # Soleil (cercle ocre clair) en haut au centre
    sun_r = s * 0.16
    sun_y = s * 0.38
    dr.ellipse([cx - sun_r, sun_y - sun_r, cx + sun_r, sun_y + sun_r], fill=SUN)

    # Colline verte (arc) en bas
    hill_top = s * 0.62
    dr.ellipse([s * 0.05, hill_top, s * 0.75, s * 1.25], fill=FOREST)
    dr.ellipse([s * 0.45, hill_top + s * 0.06, s * 1.1, s * 1.3], fill=FOREST)

    # Petit toit de case stylisé (triangle crème) sur la colline
    roof_w = s * 0.30
    roof_h = s * 0.16
    roof_cx = cx
    roof_base = s * 0.78
    dr.polygon(
        [
            (roof_cx - roof_w / 2, roof_base),
            (roof_cx, roof_base - roof_h),
            (roof_cx + roof_w / 2, roof_base),
        ],
        fill=CREAM,
    )
    # Corps de la case
    body_w = s * 0.18
    dr.rectangle(
        [roof_cx - body_w / 2, roof_base, roof_cx + body_w / 2, s * 0.92],
        fill=FOREST,
    )
    return img


for size in (192, 512):
    make_icon(size).save(f"public/icons/icon-{size}.png")
    make_icon(size, maskable=True).save(f"public/icons/icon-{size}-maskable.png")

# Favicon 64px
make_icon(64).save("public/icons/icon-64.png")
print("Icônes générées : 64, 192, 512 + maskable")
