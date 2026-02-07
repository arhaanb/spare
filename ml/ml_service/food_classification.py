import configparser
import requests
import json
import base64
import time
from typing import List, Optional, Any

from .models import FoodItem, FoodClassificationResponse
from .prompt import get_food_classification_prompt

# Load config
config = configparser.ConfigParser()
config.read("config.ini")

LLM_API_KEY = config["GEMINI"]["api_key"]
GEMINI_URL = config["GEMINI"]["api_url"]


def classify_food_from_image(
    image_base64: str,
    menu_json: Optional[List[Any]] = None,
) -> FoodClassificationResponse:
    """
    Classify food items from a base64-encoded image using Gemini API.
    Uses the provided menu JSON to match detected items and quantify.

    Args:
        image_base64: Base64-encoded image string
        menu_json: Optional list of menu item dicts (e.g. from menu.json "menu" key).
                   Each item typically has food_name, food_type, veg, price, etc.

    Returns:
        FoodClassificationResponse with detected items (type, quantity, closest_menu_item, confidence)
    """
    start_time = time.time()

    system_prompt = get_food_classification_prompt(menu_json or [])

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": LLM_API_KEY,
    }

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}],
        },
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

    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response.text}")

    response_json = response.json()
    llm_output = response_json["candidates"][0]["content"]["parts"][0]["text"]

    try:
        items_data = json.loads(llm_output)
    except json.JSONDecodeError:
        if "```json" in llm_output:
            json_str = llm_output.split("```json")[1].split("```")[0].strip()
            items_data = json.loads(json_str)
        elif "```" in llm_output:
            json_str = llm_output.split("```")[1].split("```")[0].strip()
            items_data = json.loads(json_str)
        else:
            raise Exception(f"Failed to parse JSON from LLM output: {llm_output}")

    items = [FoodItem(**item) for item in items_data]
    processing_time = (time.time() - start_time) * 1000

    return FoodClassificationResponse(
        items=items,
        total_items=len(items),
        processing_time_ms=round(processing_time, 2),
    )


def classify_food_from_file(
    image_path: str,
    menu_json: Optional[List[Any]] = None,
) -> FoodClassificationResponse:
    """
    Classify food items from an image file.

    Args:
        image_path: Path to image file
        menu_json: Optional list of menu item dicts (same format as menu.json "menu" array)

    Returns:
        FoodClassificationResponse with detected items
    """
    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")
    return classify_food_from_image(image_base64, menu_json)
