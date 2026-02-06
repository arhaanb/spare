"""
Test script for Spare ML Service endpoints

Tests:
1. Health check
2. Food classification (JSON with base64)
3. Food classification (File upload)
4. Price optimization (multiple scenarios)
"""

import requests
import base64
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
IMAGE_PATH = "images/test_img.jpeg"

# Sample menu items for food classification
MENU_ITEMS = [
    "Popcorn",
    "Butter Popcorn", 
    "Devil Popcorn",
    "Nachos",
    "Nacho Crisps",
    "Cheese Crackers",
    "Chocolate Wafer Rolls",
    "Chocolate Cookies",
    "Oreo Biscuits",
    "Chocolate Bar",
    "Snickers Bar",
    "Mixed Fruit Juice",
    "Mango Juice",
    "Mango Drink",
    "Cotton Candy"
]


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_response(response: requests.Response):
    """Pretty print API response"""
    print(f"\nStatus Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")


def test_health_check():
    """Test health check endpoint"""
    print_section("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print_response(response)
        
        if response.status_code == 200:
            print("\n✓ Health check passed!")
        else:
            print("\n✗ Health check failed!")
    except Exception as e:
        print(f"\n✗ Error: {e}")


def test_food_classification_json():
    """Test food classification with JSON (base64)"""
    print_section("TEST 2: Food Classification (JSON with base64)")
    
    try:
        # Read and encode image
        with open(IMAGE_PATH, "rb") as f:
            image_base64 = base64.b64encode(f.read()).decode("utf-8")
        
        # Prepare request
        payload = {
            "image_base64": image_base64,
            "menu_items": MENU_ITEMS
        }
        
        print(f"\nSending request to: {BASE_URL}/api/ml/food-classification")
        print(f"Menu items count: {len(MENU_ITEMS)}")
        print(f"Image size (base64): {len(image_base64)} characters")
        
        # Make request
        response = requests.post(
            f"{BASE_URL}/api/ml/food-classification",
            json=payload,
            timeout=60  # Gemini API can be slow
        )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            print("\n✓ Food classification successful!")
            print(f"  - Total items detected: {data['total_items']}")
            print(f"  - Processing time: {data['processing_time_ms']:.2f}ms")
            
            print("\n  Detected items:")
            for item in data['items']:
                print(f"    • {item['type']} (qty: {item['quantity']}, "
                      f"menu: {item['closest_menu_item']}, "
                      f"confidence: {item['confidence']}%)")
        else:
            print("\n✗ Food classification failed!")
            
    except Exception as e:
        print(f"\n✗ Error: {e}")


def test_food_classification_upload():
    """Test food classification with file upload"""
    print_section("TEST 3: Food Classification (File Upload)")
    
    try:
        # Prepare files and form data
        with open(IMAGE_PATH, "rb") as f:
            files = {
                'image': ('test_img.jpeg', f, 'image/jpeg')
            }
            data = {
                'menu_items': json.dumps(MENU_ITEMS)
            }
            
            print(f"\nSending request to: {BASE_URL}/api/ml/food-classification/upload")
            print(f"Image file: {IMAGE_PATH}")
            
            # Make request
            response = requests.post(
                f"{BASE_URL}/api/ml/food-classification/upload",
                files=files,
                data=data,
                timeout=60
            )
        
        print_response(response)
        
        if response.status_code == 200:
            data = response.json()
            print("\n✓ File upload classification successful!")
            print(f"  - Total items detected: {data['total_items']}")
            print(f"  - Processing time: {data['processing_time_ms']:.2f}ms")
        else:
            print("\n✗ File upload classification failed!")
            
    except Exception as e:
        print(f"\n✗ Error: {e}")


def test_price_optimization_scenario(
    scenario_name: str,
    merchant_id: str,
    time_until_closing: int,
    item_type: str,
    current_price: float = None,
    competitor_prices: list = None
):
    """Test a specific price optimization scenario"""
    print(f"\n--- Scenario: {scenario_name} ---")
    
    try:
        payload = {
            "merchant_id": merchant_id,
            "time_until_closing_minutes": time_until_closing,
            "item_type": item_type
        }
        
        if current_price:
            payload["current_price"] = current_price
        if competitor_prices:
            payload["competitor_prices"] = competitor_prices
        
        print(f"Request: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BASE_URL}/api/ml/price-optimization",
            json=payload
        )
        
        if response.status_code == 200:
            data = response.json()
            print("\n✓ Price optimization successful!")
            print(f"  Recommended Price: ₹{data['recommended_price']:.2f}")
            print(f"  Confidence: {data['confidence']:.2%}")
            print(f"  Expected Sell-through: {data['expected_sell_through']:.1%}")
            print(f"  Price Range: ₹{data['price_range']['min']:.2f} - ₹{data['price_range']['max']:.2f}")
            print(f"\n  Reasoning:")
            print(f"    • Time Factor: {data['reasoning']['time_factor']}")
            print(f"    • Sell-through: {data['reasoning']['sell_through_impact']}")
            print(f"    • Competitor: {data['reasoning']['competitor_analysis']}")
            print(f"    • Perishability: {data['reasoning']['perishability_factor']}")
        else:
            print(f"\n✗ Price optimization failed!")
            print_response(response)
            
    except Exception as e:
        print(f"\n✗ Error: {e}")


def test_price_optimization():
    """Test price optimization with multiple scenarios"""
    print_section("TEST 4: Price Optimization (Multiple Scenarios)")
    
    # Scenario 1: Perishable items, closing soon, no current price
    test_price_optimization_scenario(
        scenario_name="Perishable, Closing Soon (60 min)",
        merchant_id="merchant_001",
        time_until_closing=60,
        item_type="perishable"
    )
    
    # Scenario 2: Perishable items, more time, with competitor prices
    test_price_optimization_scenario(
        scenario_name="Perishable, Moderate Time (120 min), With Competitors",
        merchant_id="merchant_001",
        time_until_closing=120,
        item_type="perishable",
        competitor_prices=[70, 75, 80]
    )
    
    # Scenario 3: Non-perishable, plenty of time
    test_price_optimization_scenario(
        scenario_name="Non-Perishable, Plenty of Time (240 min)",
        merchant_id="merchant_002",
        time_until_closing=240,
        item_type="non_perishable"
    )
    
    # Scenario 4: Perishable, with current price
    test_price_optimization_scenario(
        scenario_name="Perishable, 90 min, Current Price ₹80",
        merchant_id="merchant_001",
        time_until_closing=90,
        item_type="perishable",
        current_price=80,
        competitor_prices=[65, 70, 75]
    )
    
    # Scenario 5: Non-perishable, closing soon
    test_price_optimization_scenario(
        scenario_name="Non-Perishable, Closing Soon (45 min)",
        merchant_id="merchant_003",
        time_until_closing=45,
        item_type="non_perishable",
        current_price=90
    )


def main():
    """Run all tests"""
    print("\n" + "█" * 80)
    print("  SPARE ML SERVICE - ENDPOINT TESTING")
    print("█" * 80)
    
    print(f"\nBase URL: {BASE_URL}")
    print(f"Image: {IMAGE_PATH}")
    
    # Run all tests
    test_health_check()
    test_food_classification_json()
    test_food_classification_upload()
    test_price_optimization()
    
    # Summary
    print_section("TESTING COMPLETE")
    print("\nAll tests finished!")
    print("\nNote: Make sure the FastAPI server is running:")
    print("  uvicorn ml_service.main:app --reload --port 8000")


if __name__ == "__main__":
    main()
