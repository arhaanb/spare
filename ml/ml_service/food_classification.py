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
from .db_helper import get_merchant_menu, get_merchant_bag_pricing

load_dotenv()

# Load config
config = configparser.ConfigParser()
config.read("config.ini")

LLM_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = config["GEMINI"]["api_url"]


def classify_food_from_image(
    merchant_id: str,
    image_base64: str,
) -> List[Dict[str, Any]]:
    """
    Classify food items from a base64-encoded image.

    Args:
        merchant_id: Merchant UUID
        image_base64: Base64 encoded image

    Returns:
        List[Dict[str, Any]]: List of food items as a JSON
    """
    
    # Pull menu from DB
    menu_json = get_merchant_menu(merchant_id)

    system_prompt = FOOD_CLASSIFICATION_SYSTEM_PROMPT
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
    
    # Check for API errors
    if "error" in response_json:
        error_msg = response_json.get("error", {}).get("message", "Unknown error")
        raise Exception(f"Gemini API error: {error_msg}")
    
    # Check if candidates exist in response
    if "candidates" not in response_json or len(response_json["candidates"]) == 0:
        print("Full API response:", json.dumps(response_json, indent=2))
        raise Exception(f"No candidates in Gemini API response. This usually means the API request was blocked or failed. Response: {response_json}")
    
    try:
        llm_raw_output = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
        food_classification_output = json.loads(llm_raw_output)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print("Full API response:", json.dumps(response_json, indent=2))
        raise Exception(f"Failed to parse Gemini API response: {str(e)}. Response: {response_json}")

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
    merchant_id: str,
    food_classification_output: List[Dict[str, Any]],
    menu_json: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Create rescue bags from leftover food items with prices already attached.
    
    Args:
        merchant_id: Merchant UUID
        food_classification_output: List of leftover food items with prices and non_veg field
        menu_json: Full menu list to validate veg/non-veg status
    """
    
    # Get bag pricing from merchant
    bag_pricing = get_merchant_bag_pricing(merchant_id)

    user_message = {
        "regular_bag_price": bag_pricing["regular_bag_price"],
        "large_bag_price": bag_pricing["large_bag_price"],
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
    
    # Check for API errors
    if "error" in response_json:
        error_msg = response_json.get("error", {}).get("message", "Unknown error")
        raise Exception(f"Gemini API error: {error_msg}")
    
    # Check if candidates exist in response
    if "candidates" not in response_json or len(response_json["candidates"]) == 0:
        print("Full API response:", json.dumps(response_json, indent=2))
        raise Exception(f"No candidates in Gemini API response. This usually means the API request was blocked or failed. Response: {response_json}")
    
    try:
        llm_raw_output = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
        suggested_rescue_bags = json.loads(llm_raw_output)
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print("Full API response:", json.dumps(response_json, indent=2))
        raise Exception(f"Failed to parse Gemini API response: {str(e)}. Response: {response_json}")
    
    # Validate and fix veg bags - remove any non-veg items from menu.json
    validated_rescue_bags = check_veg_rescue_bag_creation(suggested_rescue_bags, menu_json)
    
    return validated_rescue_bags

