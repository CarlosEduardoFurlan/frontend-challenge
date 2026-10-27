"""
Builds side-by-side comparison sheets: Figma reference on the left, implementation on the right.

Usage: python scripts/figma-compare.py
Reads docs/figma-comparison/figma-reference/<frame>.png and docs/figma-comparison/after/<shot>.png
(pairs listed in PAIRS) and writes docs/figma-comparison/comparisons/<frame>.png. Both images are
scaled to the same width (the Figma frame width) and top-aligned so sections can be compared row
by row; heights differ because the implementation renders real fixture data.
Requires: Pillow
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "docs" / "figma-comparison"
REF = BASE / "figma-reference"
AFTER = BASE / "after"
OUT = BASE / "comparisons"

# (Figma reference, implementation screenshot)
PAIRS = [
    ("desktop-home", "home--desktop-1440"),
    ("desktop-nft-detail", "nft-nft-001--desktop-1440"),
    ("desktop-cart", "cart--desktop-1440"),
    ("desktop-checkout", "checkout--desktop-1440"),
    ("desktop-order-confirmation", "order--desktop-1440"),
    ("desktop-wallets", "account-wallets--desktop-1440"),
    ("mobile-checkout", "checkout--mobile-414"),
]
GUTTER = 24
HEADER = 36


def fit_width(image: Image.Image, width: int) -> Image.Image:
    if image.width == width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for ref_name, after_name in PAIRS:
        ref_path = REF / f"{ref_name}.png"
        after_path = AFTER / f"{after_name}.png"
        if not ref_path.exists() or not after_path.exists():
            print(f"skip {ref_name}: missing {'reference' if not ref_path.exists() else 'screenshot'}")
            continue
        with Image.open(ref_path) as ref, Image.open(after_path) as after:
            ref = ref.convert("RGB")
            width = ref.width
            after = fit_width(after.convert("RGB"), width)
            height = max(ref.height, after.height)
            sheet = Image.new("RGB", (width * 2 + GUTTER, height + HEADER), "#140d0a")
            draw = ImageDraw.Draw(sheet)
            draw.text((12, 10), f"Figma {ref_name}", fill="#e89b55")
            draw.text((width + GUTTER + 12, 10), f"Implementação {after_name}", fill="#e89b55")
            sheet.paste(ref, (0, HEADER))
            sheet.paste(after, (width + GUTTER, HEADER))
            target = OUT / f"{ref_name}.png"
            sheet.save(target, optimize=True)
            print(f"{target.relative_to(ROOT)} {sheet.width}x{sheet.height}")


if __name__ == "__main__":
    main()
