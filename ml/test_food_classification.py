"""
Test script for food classification flow.
Run from ml_service/:  python test_food_classification.py
"""
import base64
import json
import sys
from pathlib import Path
from typing import Dict, Any

from ml_service.food_classification import classify_food_from_image, rescue_bag_creation

MENU_PATH = "menu.json"
IMAGE_PATH = "images/test_img_2.jpeg"


with open(IMAGE_PATH, "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

with open(MENU_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

menu_json = data.get("menu", data)
food_classification_output = classify_food_from_image(image_base64, menu_json=menu_json)

# Save food classification output to file
with open("food_classification_output.json", "w", encoding="utf-8") as f:
    json.dump(food_classification_output, f, indent=2)

leftover_food_items = food_classification_output
rescue_bag_creation_output = rescue_bag_creation(leftover_food_items)

# Save rescue bag creation output to file
with open("rescue_bag_creation_output.json", "w", encoding="utf-8") as f:
    json.dump(rescue_bag_creation_output, f, indent=2)
