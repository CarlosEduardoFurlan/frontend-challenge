"""
Deterministic artwork generator for the mock catalog.

The original Figma assets could not be accessed from the build environment, so the
catalog ships with original, procedurally generated abstract artworks. Running this
script again always produces the same files (seeded by NFT id), which keeps visual
regression baselines stable.

Usage: python scripts/generate-artwork.py
Requires: Pillow (pip install pillow)
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT_NFTS = ROOT / "public" / "nfts"
OUT_AVATARS = ROOT / "public" / "avatars"
SIZE = 640
SMALL = 320
NFT_COUNT = 24
GALLERY_PER_NFT = 3

# Six collections, each with its own palette so cards read as families.
COLLECTIONS = {
    "geometria-viva": ["#e58a3a", "#f5ede0", "#3a2a1f", "#8c4a1c", "#f09a4c"],
    "cosmos-pixelado": ["#2d1b4e", "#7b4dff", "#c9b8ff", "#1b0f2e", "#ffb347"],
    "flora-sintetica": ["#0f3d2e", "#3fb950", "#b7f5c9", "#1c5a3f", "#f5ede0"],
    "ruido-urbano": ["#1a1a1a", "#f05252", "#f5ede0", "#5a5a5a", "#e58a3a"],
    "mares-digitais": ["#0b2a4a", "#3aa0e5", "#bfe3ff", "#123d6b", "#f5ede0"],
    "vertices": ["#2a1c14", "#facc15", "#f5ede0", "#5a3d1e", "#e58a3a"],
}
COLLECTION_IDS = list(COLLECTIONS.keys())


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def gradient(size: int, c1: str, c2: str, angle: float) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()
    a, b = hex_to_rgb(c1), hex_to_rgb(c2)
    cos, sin = math.cos(angle), math.sin(angle)
    for y in range(size):
        for x in range(size):
            t = ((x / size) * cos + (y / size) * sin + 1) / 2
            t = max(0.0, min(1.0, t))
            px[x, y] = lerp(a, b, t)
    return img


def draw_piece(seed: int, palette: list[str], variant: int) -> Image.Image:
    rng = random.Random(seed * 1000 + variant)
    bg1, bg2 = rng.sample(palette, 2)
    img = gradient(SIZE, bg1, bg2, rng.uniform(0, math.pi))
    draw = ImageDraw.Draw(img, "RGBA")

    shapes = rng.randint(4, 8)
    for _ in range(shapes):
        color = hex_to_rgb(rng.choice(palette)) + (rng.randint(120, 230),)
        kind = rng.choice(["circle", "poly", "ring", "bar"])
        cx, cy = rng.randint(80, SIZE - 80), rng.randint(80, SIZE - 80)
        r = rng.randint(40, 220)
        if kind == "circle":
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
        elif kind == "ring":
            w = rng.randint(8, 30)
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=w)
        elif kind == "bar":
            h = rng.randint(10, 40)
            ang = rng.uniform(0, math.pi)
            length = rng.randint(200, 520)
            dx, dy = math.cos(ang) * length / 2, math.sin(ang) * length / 2
            draw.line([(cx - dx, cy - dy), (cx + dx, cy + dy)], fill=color, width=h)
        else:
            n = rng.randint(3, 6)
            pts = []
            for i in range(n):
                ang = (2 * math.pi * i / n) + rng.uniform(-0.3, 0.3)
                rr = r * rng.uniform(0.6, 1.0)
                pts.append((cx + math.cos(ang) * rr, cy + math.sin(ang) * rr))
            draw.polygon(pts, fill=color)

    # Soft glow + grain to make flat shapes feel like rendered art.
    glow = img.filter(ImageFilter.GaussianBlur(18))
    img = Image.blend(img, glow, 0.25)
    noise = Image.effect_noise((SIZE, SIZE), 24).convert("L")
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    img = Image.blend(img, noise_rgb, 0.08)

    # Thin inner frame in the collection accent.
    frame = ImageDraw.Draw(img)
    frame.rectangle([14, 14, SIZE - 15, SIZE - 15], outline=hex_to_rgb(palette[1]), width=3)
    return img


def save_webp(img: Image.Image, path: Path, size: int) -> None:
    out = img if size == SIZE else img.resize((size, size), Image.LANCZOS)
    out.save(path, "WEBP", quality=78, method=6)


def avatar(seed: int, palette: list[str]) -> Image.Image:
    rng = random.Random(seed)
    img = gradient(128, palette[0], palette[1], rng.uniform(0, math.pi))
    draw = ImageDraw.Draw(img, "RGBA")
    for _ in range(3):
        c = hex_to_rgb(rng.choice(palette)) + (200,)
        x, y, r = rng.randint(20, 108), rng.randint(20, 108), rng.randint(14, 40)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=c)
    return img


def main() -> None:
    OUT_NFTS.mkdir(parents=True, exist_ok=True)
    OUT_AVATARS.mkdir(parents=True, exist_ok=True)

    for i in range(1, NFT_COUNT + 1):
        nft_id = f"nft-{i:03d}"
        collection = COLLECTION_IDS[(i - 1) % len(COLLECTION_IDS)]
        palette = COLLECTIONS[collection]
        for variant in range(GALLERY_PER_NFT):
            img = draw_piece(i, palette, variant)
            save_webp(img, OUT_NFTS / f"{nft_id}-{variant + 1}.webp", SIZE)
            if variant == 0:
                save_webp(img, OUT_NFTS / f"{nft_id}-1-sm.webp", SMALL)

    for idx, collection in enumerate(COLLECTION_IDS):
        avatar(100 + idx, COLLECTIONS[collection]).save(
            OUT_AVATARS / f"{collection}.webp", "WEBP", quality=80
        )
    for user_idx in range(1, 4):
        avatar(200 + user_idx, COLLECTIONS[COLLECTION_IDS[user_idx % 6]]).save(
            OUT_AVATARS / f"user-{user_idx}.webp", "WEBP", quality=80
        )
    print(f"generated {NFT_COUNT * GALLERY_PER_NFT + NFT_COUNT} artworks and avatars")


if __name__ == "__main__":
    main()
