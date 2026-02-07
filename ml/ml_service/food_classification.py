import configparser
import requests
import json
import time
from typing import List, Optional, Any, Dict
import os
from dotenv import load_dotenv

from .prompt import (
    FOOD_CLASSIFICATION_SYSTEM_PROMPT,
    RESCUE_BAG_CREATION_SYSTEM_PROMPT,
)

load_dotenv()

# Load config
config = configparser.ConfigParser()
config.read("config.ini")

LLM_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = config["GEMINI"]["api_url"]
REGULAR_BAG_PRICE = float(config["RESCUE_BAG"]["regular_bag_price"])
LARGE_BAG_PRICE = float(config["RESCUE_BAG"]["large_bag_price"])


def classify_food_from_image(
    image_base64: str,
    menu_json: Optional[List[Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Classify food items from a base64-encoded image.

    Args:
        image_base64: Base64 encoded image
        menu_json: Optional menu as list of items (e.g. from menu.json 'menu' array) for matching and quantification

    Returns:
        List[Dict[str, Any]]: List of food items as a JSON
    """

    system_prompt = FOOD_CLASSIFICATION_SYSTEM_PROMPT
    if menu_json:
        system_prompt += "\n\nRestaurant menu (match by food_name):\n" + json.dumps(menu_json, indent=2)

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": LLM_API_KEY,
    }
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64,
                        }
                    },
                ],
            }
        ],
    }

    response = requests.post(GEMINI_URL, headers=headers, json=payload)
    response_json = response.json()
    llm_raw_output = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    food_classification_output = json.loads(llm_raw_output)

    # Attach prices and non_veg field to food classification output
    menu_by_name: Dict[str, Any] = {item.get("food_name"): item for item in menu_json}
    
    matched_food_items = []
    for item in food_classification_output:
        closest_item = item.get("closest_menu_item", "")
        
        # skip if the closest item is not found in the menu
        if closest_item.lower() == "not found":
            continue
     
        menu_item = menu_by_name.get(closest_item)
        if menu_item:
            item["price"] = float(menu_item.get("price"))
            item["non_veg"] = menu_item.get("non_veg", False)
            matched_food_items.append(item)

    return matched_food_items


def check_veg_rescue_bag_creation(
    suggested_rescue_bags: List[Dict[str, Any]],
    menu_json: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Check if the suggested rescue bags are valid.
    If a non-veg item is found in a veg rescue bag, remove it and recalculate the total price.
    
    Args:
        suggested_rescue_bags: List of rescue bags from LLM
        menu_json: Menu items list to check non_veg status
    
    Returns:
        List of validated and corrected rescue bags
    """
    # Create lookup map from menu to check non_veg status
    menu_by_name = {item.get("food_name"): item for item in menu_json}
    
    for bag in suggested_rescue_bags:
        bag_type = bag.get("bag_type", "")
        
        # Only check veg bags
        if bag_type == "regular_veg" or bag_type == "large_veg":
            items_to_remove = []
            
            for item in bag["items"]:
                food_name = item.get("food_name")
                
                # Check if this food item is non-veg in menu.json
                menu_item = menu_by_name.get(food_name)
                if menu_item and menu_item.get("non_veg", False):
                    items_to_remove.append(item)
                    print(f"Warning: Removing non-veg item '{food_name}' from {bag_type} bag")
            
            # Remove all non-veg items
            for item in items_to_remove:
                bag["items"].remove(item)
            
            # Recalculate the estimated total value after removing non-veg items
            bag["estimated_total_value"] = sum(
                item.get("quantity", 1) * item.get("unit_price", 0) 
                for item in bag["items"]
            )
    
    # Filter out any bags that are now empty after removing non-veg items
    return [bag for bag in suggested_rescue_bags if len(bag.get("items", [])) > 0]

def rescue_bag_creation(
    food_classification_output: List[Dict[str, Any]],
    menu_json: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Create rescue bags from leftover food items with prices already attached.
    Uses regular_bag_price and large_bag_price from config.ini [RESCUE_BAG].
    
    Args:
        food_classification_output: List of leftover food items with prices and non_veg field
        menu_json: Full menu list to validate veg/non-veg status
    """

    user_message = {
        "regular_bag_price": REGULAR_BAG_PRICE,
        "large_bag_price": LARGE_BAG_PRICE,
        "leftover_food_items": food_classification_output,
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": LLM_API_KEY,
    }

    payload = {
        "systemInstruction": {"parts": [{"text": RESCUE_BAG_CREATION_SYSTEM_PROMPT}]},
        "contents": [
            {
                "role": "user",
                "parts": [{"text": json.dumps(user_message, indent=2)}],
            }
        ],
    }

    response = requests.post(GEMINI_URL, headers=headers, json=payload)
    response_json = response.json()
    
    llm_raw_output = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    suggested_rescue_bags = json.loads(llm_raw_output)
    
    # Validate and fix veg bags - remove any non-veg items from menu.json
    validated_rescue_bags = check_veg_rescue_bag_creation(suggested_rescue_bags, menu_json)
    
    return validated_rescue_bags

