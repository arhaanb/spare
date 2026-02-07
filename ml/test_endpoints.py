"""
Test script for food extraction and rescue bag creation endpoints
"""

import requests
import base64
import json

BASE_URL = "http://localhost:8000"
IMAGE_PATH = "images/test_img_2.jpeg"
MENU_PATH = "menu.json"
FOOD_OUTPUT_PATH = "food_classification_output.json"
RESCUE_OUTPUT_PATH = "rescue_bag_creation_output.json"


def test_food_extraction():
    """Test food extraction endpoint"""
    print("Testing food extraction...")
    
    with open(IMAGE_PATH, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")
    
    with open(MENU_PATH, "r", encoding="utf-8") as f:
        menu_data = json.load(f)
    
    menu = menu_data.get("menu", menu_data)
    
    payload = {
        "image_base64": image_base64,
        "menu": menu
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ml/food-extraction",
        json=payload,
        timeout=120
    )
    
    if response.status_code == 200:
        food_items = response.json()
        with open(FOOD_OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(food_items, f, indent=2)
        print(f"✓ Food extraction successful! Saved to {FOOD_OUTPUT_PATH}")
        print(f"  Detected {len(food_items)} items")
        return food_items
    else:
        print(f"✗ Food extraction failed: {response.status_code}")
        print(response.text)
        return None


def test_rescue_bag_creation(food_items):
    """Test rescue bag creation endpoint"""
    print("\nTesting rescue bag creation...")
    
    response = requests.post(
        f"{BASE_URL}/api/ml/rescue-bag-creation",
        json=food_items,
        timeout=120
    )
    
    if response.status_code == 200:
        rescue_bags = response.json()
        with open(RESCUE_OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(rescue_bags, f, indent=2)
        print(f"✓ Rescue bag creation successful! Saved to {RESCUE_OUTPUT_PATH}")
        print(f"  Created {len(rescue_bags)} bags")
        return rescue_bags
    else:
        print(f"✗ Rescue bag creation failed: {response.status_code}")
        print(response.text)
        return None


def main():
    print("=" * 80)
    print("  FOOD EXTRACTION & RESCUE BAG CREATION TEST")
    print("=" * 80)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Image: {IMAGE_PATH}")
    print(f"Menu: {MENU_PATH}\n")
    
    food_items = test_food_extraction()
    
    if food_items:
        rescue_bags = test_rescue_bag_creation(food_items)
    
    print("\n" + "=" * 80)
    print("  TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
