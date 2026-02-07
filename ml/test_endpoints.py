import requests
import base64
import json

# Load image
with open("images/test_img_2.jpeg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

# Load menu
with open("menu.json", "r", encoding="utf-8") as f:
    menu_data = json.load(f)
menu = menu_data.get("menu", menu_data)

# Test food extraction
payload = {
    "image_base64": image_base64,
    "menu": menu
}

response = requests.post("http://localhost:8000/api/ml/food-extraction", json=payload, timeout=120)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    food_items = response.json()
    print(f"Detected {len(food_items)} items")
    
    # Test rescue bag creation
    payload2 = {
        "leftover_food_items": food_items,
        "menu": menu
    }
    
    print("making rescue bag creation request")
    response2 = requests.post("http://localhost:8000/api/ml/rescue-bag-creation", json=payload2, timeout=120)
    print(f"\nRescue Bag Status: {response2.status_code}")
    
    if response2.status_code == 200:
        rescue_bags = response2.json()
        print(f"Created {len(rescue_bags)} bags")
        
    else:
        print(response2.text)
else:
    print(response.text)
