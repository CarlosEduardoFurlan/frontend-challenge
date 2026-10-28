"""
Prepares the Figma assets for the web build.

The raw files come from the Figma MCP server (`download_assets` / `get_design_context`
asset URLs of the "Frontend Challenge (Copy)" file) and are stored outside the repository.
This script converts the artwork PNGs (1254x1254) into responsive WebP variants and copies
the vector icons into `public/assets`, so production never references temporary Figma URLs.

Usage: python scripts/figma-assets.py <rawDir>
  <rawDir>/imgFrame136.png      -> public/assets/nfts/ape-emerald{,-sm,-lg}.webp
  <rawDir>/imgNftArtwork18.png  -> public/assets/nfts/ape-sage{,-sm,-lg}.webp
  <rawDir>/imgNftArtwork05.png  -> public/assets/nfts/ape-ivory{,-sm,-lg}.webp
  <rawDir>/imgNftArtwork09.png  -> public/assets/nfts/ape-golden{,-sm,-lg}.webp
  <rawDir>/*.svg                -> public/assets/icons/*.svg (renamed, see ICONS)
Requires: Pillow with WebP support (pip install pillow)
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_NFTS = ROOT / "public" / "assets" / "nfts"
OUT_ICONS = ROOT / "public" / "assets" / "icons"
OUT_BANNERS = ROOT / "public" / "assets" / "banners"

# Figma layer -> artwork slug (names follow the NFTs that use them on the home frame).
ARTWORKS = {
    "imgFrame136.png": "ape-emerald",  # Hero, "Emerald Ape #042", promo "Genesis Drops"
    "imgNftArtwork18.png": "ape-sage",  # Featured banner, "Sage Nomad", "Cosmic Bloom"
    "imgNftArtwork05.png": "ape-ivory",  # "Neon Vessel", "Ivory Baron", promo "Curated Art"
    "imgNftArtwork09.png": "ape-golden",  # "Golden Beat", "Golden Signal"
}
VARIANTS = {"": 640, "-sm": 320, "-lg": 1024}

# Figma vector layer -> icon file.
ICONS = {
    "imgSearchIcon.svg": "search.svg",
    "imgCartIcon.svg": "cart.svg",
    "imgLogout.svg": "login.svg",  # Iconly/Curved/Logout, used on the "Entrar" button
    "imgArrowRight.svg": "arrow-right.svg",  # Iconly/Curved/Arrow - Right (promo CTA)
    "imgArrowRight2.svg": "arrow-right-2.svg",  # Iconly/Curved/Arrow - Right 2 (pagination)
    "imgArrowDown2.svg": "arrow-down.svg",  # Iconly/Two-tone/Arrow - Down 2 (sort)
    "imgFrame108.svg": "social-facebook.svg",
    "imgFrame109.svg": "social-instagram.svg",
    "imgFrame110.svg": "social-twitter.svg",
    "imgFrame111.svg": "social-linkedin.svg",
    "imgFrame112.svg": "social-youtube.svg",
    "imgGroup4.svg": "hero-dots.svg",
}
BANNERS = {
    "imgMaskGroup.svg": "promo-rings.svg",  # decorative rings of the promo cards
}


def convert(src: Path, slug: str) -> None:
    with Image.open(src) as image:
        image = image.convert("RGB")
        for suffix, size in VARIANTS.items():
            resized = image.resize((size, size), Image.Resampling.LANCZOS)
            target = OUT_NFTS / f"{slug}{suffix}.webp"
            resized.save(target, "WEBP", quality=82, method=6)
            print(f"{target.relative_to(ROOT)} {target.stat().st_size // 1024} KB")


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    raw = Path(sys.argv[1])
    for out in (OUT_NFTS, OUT_ICONS, OUT_BANNERS):
        out.mkdir(parents=True, exist_ok=True)
    for name, slug in ARTWORKS.items():
        convert(raw / name, slug)
    for mapping, out in ((ICONS, OUT_ICONS), (BANNERS, OUT_BANNERS)):
        for name, target in mapping.items():
            shutil.copyfile(raw / name, out / target)
            print(f"{(out / target).relative_to(ROOT)}")


if __name__ == "__main__":
    main()
