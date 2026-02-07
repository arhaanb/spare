"""
Test script for food classification flow.
Loads menu from menu.json, calls classify_food_from_file with an image, and prints the result.

Run from repo root (ml/):  python -m ml_service.test_food_classification
Or from ml_service/:       python test_food_classification.py

Requires a test image at ml/images/test_img.jpeg (or set IMAGE_PATH).
"""
import json
import os
import sys
from pathlib import Path

# Resolve repo root and path for menu (parent of ml_service)
REPO_ROOT = Path(__file__).resolve().parent.parent

# Allow running as script from ml_service/ or as module from ml/
if __name__ == "__main__" and __package__ is None:
    sys.path.insert(0, str(REPO_ROOT))
    from ml_service.food_classification import classify_food_from_file
else:
    from ml_service.food_classification import classify_food_from_file

MENU_PATH = REPO_ROOT / "menu.json"
DEFAULT_IMAGE_PATH = REPO_ROOT / "images" / "test_img.jpeg"


def load_menu():
    """Load menu array from menu.json."""
    with open(MENU_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("menu", data)


def main():
    image_path = os.environ.get("IMAGE_PATH", str(DEFAULT_IMAGE_PATH))
    if not Path(image_path).exists():
        print(f"Image not found: {image_path}")
        print("Set IMAGE_PATH or place a test image at ml/images/test_img.jpeg")
        sys.exit(1)

    if not MENU_PATH.exists():
        print(f"Menu not found: {MENU_PATH}")
        sys.exit(1)

    menu_json = load_menu()
    print(f"Loaded {len(menu_json)} menu items from {MENU_PATH}")
    print(f"Classifying food from image: {image_path}\n")

    result = classify_food_from_file(image_path, menu_json=menu_json)

    print("Result:")
    print(f"  total_items: {result.total_items}")
    print(f"  processing_time_ms: {result.processing_time_ms}")
    print("  items:")
    for i, item in enumerate(result.items, 1):
        print(f"    {i}. type={item.type!r} quantity={item.quantity} closest_menu_item={item.closest_menu_item!r} confidence={item.confidence}")
    print("\nDone.")


if __name__ == "__main__":
    main()
    # python -m ml_service.test_food_classification