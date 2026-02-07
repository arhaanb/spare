"""
Prompt template for food classification. Loaded dynamically by food_classification module.
"""
import json
from typing import List, Any

FOOD_CLASSIFICATION_SYSTEM_PROMPT = """You are a food recognition assistant. Your task is to analyze images of restaurant food and identify food items.

For each food item you detect in the image, provide the following information in JSON format:
1. type - the name/type of the food you see
2. quantity - the number of that specific food item present
3. closest_menu_item - match to the exact "food_name" from the provided restaurant menu JSON
4. confidence - your confidence score (0-100) for the classification

Output your response as a valid JSON array. Each object represents one food item detected. Format:
[
  {
    "type": "food item name",
    "quantity": number,
    "closest_menu_item": "exact food_name from menu",
    "confidence": number (0-100)
  }
]

Be thorough and identify all visible food items. Match each item to the closest menu entry by food_name. If you cannot confidently match an item to the menu, still provide type and quantity, use "closest_menu_item": "not found" and lower confidence.

Respond with only the JSON array. No markdown, no backticks, no extra text.
"""


def get_food_classification_prompt(menu_json: List[Any]) -> str:
    """
    Build the full system prompt with menu JSON attached dynamically.

    Args:
        menu_json: List of menu item dicts (e.g. from menu.json "menu" array).
                   Each item can have food_name, food_type, veg, price, nutritional_value.

    Returns:
        Complete system prompt string with menu embedded.
    """
    prompt = FOOD_CLASSIFICATION_SYSTEM_PROMPT
    if menu_json:
        menu_str = json.dumps(menu_json, indent=2)
        prompt += f"\n\nRestaurant menu (match by food_name):\n{menu_str}"
    return prompt
