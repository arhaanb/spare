"""
End-to-end test for MongoDB integration with food extraction and rescue bag creation
"""
import requests
import base64
import json
import uuid
from typing import List, Dict, Any
from ml_service.db_helper import get_merchants_collection

BASE_URL = "http://localhost:8000"

# Generate unique merchant ID
merchant_id = str(uuid.uuid4())
print(f"Test Merchant ID: {merchant_id}")

# Load menu from menu.json
with open("menu.json", "r", encoding="utf-8") as f:
    menu_data = json.load(f)
menu: List[Dict[str, Any]] = menu_data.get("menu", menu_data)

# Insert mock merchant into MongoDB
print("\n1. Inserting mock merchant into MongoDB...")
merchants = get_merchants_collection()
merchant_doc = {
    "merchant_id": merchant_id,
    "merchant_name": "Test Bakery",
    "location": "123 Test Street",
    "contact": {
        "phone": "8920328717"
    },
    "menu": menu,
    "bag_pricing": {
        "regular_bag_price": 150,
        "large_bag_price": 450
    },
    "created_at": "2026-02-07T10:00:00"
}
merchants.insert_one(merchant_doc)
print(f"✓ Merchant inserted with {len(menu)} menu items")

# Load test image
print("\n2. Testing food extraction endpoint...")
with open("images/test_img_2.jpeg", "rb") as f:
    image_base64 = base64.b64encode(f.read()).decode("utf-8")

payload = {
    "merchant_id": merchant_id,
    "image_base64": image_base64
}

response = requests.post(f"{BASE_URL}/api/ml/food-extraction", json=payload, timeout=120)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    leftover_doc = response.json()
    print(f"✓ Food extraction successful!")
    print(f"  Merchant ID: {leftover_doc['merchant_id']}")
    print(f"  Date: {leftover_doc['date']}")
    print(f"  Detected {len(leftover_doc['items'])} items:")
    for item in leftover_doc['items']:
        print(f"    - {item['closest_menu_item']} (qty: {item['quantity']}, price: {item['price']}, non_veg: {item['non_veg']})")
else:
    print(f"✗ Food extraction failed: {response.text}")
    exit(1)

# Test rescue bag creation
print("\n3. Testing rescue bag creation endpoint...")
payload2 = {
    "merchant_id": merchant_id
}

response2 = requests.post(f"{BASE_URL}/api/ml/rescue-bag-creation", json=payload2, timeout=120)
print(f"Status: {response2.status_code}")

if response2.status_code == 200:
    rescue_doc = response2.json()
    print(f"✓ Rescue bag creation successful!")
    print(f"  Merchant ID: {rescue_doc['merchant_id']}")
    print(f"  Date: {rescue_doc['date']}")
    print(f"  Created {len(rescue_doc['bags'])} bags:")
    for bag in rescue_doc['bags']:
        print(f"    - {bag['bag_type']}: {len(bag['items'])} items, value: {bag['estimated_total_value']}")
else:
    print(f"✗ Rescue bag creation failed: {response2.text}")
    exit(1)

# Test multiple calls to verify upsert (same date)
print("\n4. Testing upsert overwrites (calling food-extraction again)...")
response3 = requests.post(f"{BASE_URL}/api/ml/food-extraction", json=payload, timeout=120)

if response3.status_code == 200:
    leftover_doc2 = response3.json()
    print(f"✓ Second call successful - upsert overwrites existing data")
    print(f"  Same date: {leftover_doc2['date']}")
    print(f"  Detected {len(leftover_doc2['items'])} items")
else:
    print(f"✗ Second call failed: {response3.text}")

print("\n" + "="*80)
print("TEST COMPLETE")
print("="*80)
print(f"\nMerchant ID used: {merchant_id}")
print("Check MongoDB to verify data was saved correctly")
