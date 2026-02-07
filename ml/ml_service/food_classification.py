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
) -> Dict[str, Any]:
    """
    Classify food items from a base64-encoded image using Gemini API.
    """
    start_time = time.time()

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
    
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response_json}")
    
    if "candidates" not in response_json:
        raise Exception(f"Unexpected API response format: {response_json}")
    
    llm_json_str = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    food_classification_output = json.loads(llm_json_str)

    # Attach prices to food classification output
    if menu_json:
        menu_by_name = {item.get("food_name"): item for item in menu_json}
        for item in food_classification_output:
            closest_item = item.get("closest_menu_item", "")
            
            if closest_item.lower() == "not found":
                continue
            
            menu_item = menu_by_name.get(closest_item)
            if menu_item:
                item["price"] = float(menu_item.get("price"))

    return food_classification_output


def rescue_bag_creation(
    food_classification_output: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Create rescue bags from leftover food items with prices already attached.
    Uses regular_bag_price and large_bag_price from config.ini [RESCUE_BAG].
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
    
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response_json}")
    
    if "candidates" not in response_json:
        raise Exception(f"Unexpected API response format: {response_json}")
    
    llm_json_str = response_json["candidates"][0]["content"]["parts"][0]["text"].strip()
    rescue_bag_creation_output = json.loads(llm_json_str)
    
    return rescue_bag_creation_output

