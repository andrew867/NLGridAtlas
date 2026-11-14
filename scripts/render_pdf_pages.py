from __future__ import annotations

import sys
from pathlib import Path

import fitz


def main() -> None:
    source = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    rotation = 0
    page_args = sys.argv[3:]
    if page_args and page_args[0].startswith("--rotate="):
        rotation = int(page_args.pop(0).split("=", 1)[1])
    output_dir.mkdir(parents=True, exist_ok=True)
    document = fitz.open(source)
    for page_number_text in page_args:
        page_number = int(page_number_text)
        page = document[page_number - 1]
        matrix = fitz.Matrix(1.8, 1.8).prerotate(rotation)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        target = output_dir / f"page-{page_number:04d}.png"
        pixmap.save(target)
        print(target)


if __name__ == "__main__":
    main()
