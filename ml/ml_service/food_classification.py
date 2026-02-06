import configparser
import requests
import json
import base64
import time
from typing import List, Optional
from .models import FoodItem, FoodClassificationResponse

# Load config
config = configparser.ConfigParser()
config.read('config.ini')

LLM_API_KEY = config['GEMINI']['api_key']
GEMINI_URL = config['GEMINI']['api_url']


def get_system_prompt(menu_items: Optional[List[str]] = None) -> str:
    """Generate system prompt with optional menu items"""
    base_prompt = """You are a food recognition assistant. Your task is to analyze images of restaurant food and identify food items.

For each food item you detect in the image, provide the following information in JSON format:
1. Type of food item - the name/type of the food you see
2. Quantity - the number of that specific food item present
3. Closest menu item - match it to the closest item from the provided restaurant menu
4. Confidence level - your confidence score (0-100) for the classification

Output your response as a valid JSON array, where each object represents one food item detected. Format:
[
  {
    "type": "food item name",
    "quantity": number,
    "closest_menu_item": "menu item name",
    "confidence": number (0-100)
  }
]

Be thorough and identify all visible food items in the image. If you cannot confidently match an item to the menu, still provide the type and quantity, but indicate low confidence or "not found" for the menu match.

Don't include backticks in your response. Only the JSON body."""

    if menu_items:
        menu_list = "\n".join([f"- {item}" for item in menu_items])
        base_prompt += f"\n\nAvailable menu items:\n{menu_list}"
    
    return base_prompt


def classify_food_from_image(image_base64: str, menu_items: Optional[List[str]] = None) -> FoodClassificationResponse:
    """
    Classify food items from a base64-encoded image using Gemini API
    
    Args:
        image_base64: Base64-encoded image string
        menu_items: Optional list of menu items for matching
        
    Returns:
        FoodClassificationResponse with detected items
    """
    start_time = time.time()
    
    # Prepare system prompt
    system_prompt = get_system_prompt(menu_items)
    
    # Prepare API request
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": LLM_API_KEY
    }
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }
        ]
    }
    
    # Call Gemini API
    response = requests.post(GEMINI_URL, headers=headers, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
    
    # Parse response
    response_json = response.json()
    llm_output = response_json["candidates"][0]["content"]["parts"][0]["text"]
    
    # Parse JSON output (handle string-wrapped JSON)
    try:
        items_data = json.loads(llm_output)
    except json.JSONDecodeError:
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in llm_output:
            json_str = llm_output.split("```json")[1].split("```")[0].strip()
            items_data = json.loads(json_str)
        elif "```" in llm_output:
            json_str = llm_output.split("```")[1].split("```")[0].strip()
            items_data = json.loads(json_str)
        else:
            raise Exception(f"Failed to parse JSON from LLM output: {llm_output}")
    
    # Convert to FoodItem objects
    items = [FoodItem(**item) for item in items_data]
    
    # Calculate processing time
    processing_time = (time.time() - start_time) * 1000  # Convert to milliseconds
    
    return FoodClassificationResponse(
        items=items,
        total_items=len(items),
        processing_time_ms=round(processing_time, 2)
    )


def classify_food_from_file(image_path: str, menu_items: Optional[List[str]] = None) -> FoodClassificationResponse:
    """
    Classify food items from an image file
    
    Args:
        image_path: Path to image file
        menu_items: Optional list of menu items for matching
        
    Returns:
        FoodClassificationResponse with detected items
    """
    # Read and encode image
    with open(image_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")
    
    return classify_food_from_image(image_base64, menu_items)
