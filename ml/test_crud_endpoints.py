"""
Test script for all CRUD endpoints

This script tests:
1. Create Merchant (POST /api/merchants)
2. Login Merchant (POST /api/merchants/login)
3. Get Merchant (GET /api/merchants/{merchant_id})
4. Save Leftover Items (POST /api/leftover-items)
5. Save Rescue Bags (POST /api/rescue-bags)

Run the server first:
    uvicorn ml_service.main:app --reload --port 8000
    
Then run this script:
    python test_crud_endpoints.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_response(response):
    """Print response in a formatted way"""
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_create_merchant():
    """Test 1: Create a new merchant"""
    print_section("TEST 1: Create Merchant")
    
    data = {
        "merchant_name": "Baker's Oven",
        "email": "contact@bakersoven.com",
        "password": "password123",
        "location": "123 Main Street, City, State, Pincode",
        "contact": {
            "phone": "8920328717"
        },
        "menu": [
            {
                "food_type": "bakery",
                "food_name": "Pain Au Chocolate",
                "non_veg": False,
                "price": 95,
                "nutritional_value": {
                    "calories": 320,
                    "protein": 6,
                    "fat": 18,
                    "carbs": 34
                }
            },
            {
                "food_type": "bakery",
                "food_name": "Korean Bun",
                "non_veg": True,
                "price": 72,
                "nutritional_value": {
                    "calories": 300,
                    "protein": 7,
                    "fat": 12,
                    "carbs": 40
                }
            }
        ],
        "bag_pricing": {
            "regular_bag_price": 150,
            "large_bag_price": 450
        },
        "operating_hours": {
            "opening": "08:00",
            "closing": "20:00"
        }
    }
    
    response = requests.post(f"{BASE_URL}/merchants", json=data)
    print_response(response)
    
    if response.status_code == 201:
        merchant_data = response.json()
        merchant_id = merchant_data.get("merchant_id")
        print(f"\n✓ Merchant created successfully!")
        print(f"  Merchant ID: {merchant_id}")
        return merchant_id, data["email"], data["password"]
    else:
        print(f"\n✗ Failed to create merchant")
        return None, None, None

def test_create_duplicate_merchant(email):
    """Test: Try to create duplicate merchant (should fail)"""
    print_section("TEST: Create Duplicate Merchant (Should Fail)")
    
    data = {
        "merchant_name": "Duplicate Bakery",
        "email": email,  # Same email as before
        "password": "password456",
        "location": "456 Other St",
        "contact": {"phone": "1234567890"},
        "menu": [],
        "bag_pricing": {
            "regular_bag_price": 150,
            "large_bag_price": 450
        },
        "operating_hours": {
            "opening": "09:00",
            "closing": "21:00"
        }
    }
    
    response = requests.post(f"{BASE_URL}/merchants", json=data)
    print_response(response)
    
    if response.status_code == 400:
        print(f"\n✓ Correctly rejected duplicate email")
    else:
        print(f"\n✗ Should have rejected duplicate email")

def test_login_merchant(email, password):
    """Test 2: Login with email and password"""
    print_section("TEST 2: Login Merchant")
    
    data = {
        "email": email,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/merchants/login", json=data)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Login successful!")
        return True
    else:
        print(f"\n✗ Login failed")
        return False

def test_login_invalid_credentials():
    """Test: Login with invalid credentials (should fail)"""
    print_section("TEST: Login with Invalid Credentials (Should Fail)")
    
    data = {
        "email": "wrong@example.com",
        "password": "wrongpassword"
    }
    
    response = requests.post(f"{BASE_URL}/merchants/login", json=data)
    print_response(response)
    
    if response.status_code == 401:
        print(f"\n✓ Correctly rejected invalid credentials")
    else:
        print(f"\n✗ Should have rejected invalid credentials")

def test_get_merchant(merchant_id):
    """Test 3: Get merchant by ID"""
    print_section("TEST 3: Get Merchant by ID")
    
    response = requests.get(f"{BASE_URL}/merchants/{merchant_id}")
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Retrieved merchant successfully!")
        return True
    else:
        print(f"\n✗ Failed to retrieve merchant")
        return False

def test_get_nonexistent_merchant():
    """Test: Get nonexistent merchant (should fail)"""
    print_section("TEST: Get Nonexistent Merchant (Should Fail)")
    
    fake_id = "00000000-0000-0000-0000-000000000000"
    response = requests.get(f"{BASE_URL}/merchants/{fake_id}")
    print_response(response)
    
    if response.status_code == 404:
        print(f"\n✓ Correctly returned 404 for nonexistent merchant")
    else:
        print(f"\n✗ Should have returned 404")

def test_save_leftover_items(merchant_id):
    """Test 4: Save leftover items"""
    print_section("TEST 4: Save Leftover Items")
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    data = {
        "merchant_id": merchant_id,
        "date": today,
        "items": [
            {
                "type": "croissant",
                "quantity": 2,
                "closest_menu_item": "Pain Au Chocolate",
                "confidence": 95,
                "price": 95,
                "non_veg": False
            },
            {
                "type": "sandwich",
                "quantity": 3,
                "closest_menu_item": "Chicken Sandwich",
                "confidence": 88,
                "price": 120,
                "non_veg": True
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/leftover-items", json=data)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Leftover items saved successfully!")
        return True
    else:
        print(f"\n✗ Failed to save leftover items")
        return False

def test_update_leftover_items(merchant_id):
    """Test: Update leftover items (upsert on same date)"""
    print_section("TEST: Update Leftover Items (Upsert)")
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    data = {
        "merchant_id": merchant_id,
        "date": today,
        "items": [
            {
                "type": "croissant",
                "quantity": 5,  # Updated quantity
                "closest_menu_item": "Pain Au Chocolate",
                "confidence": 95,
                "price": 95,
                "non_veg": False
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/leftover-items", json=data)
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Leftover items updated successfully (upsert)!")
        return True
    else:
        print(f"\n✗ Failed to update leftover items")
        return False

def test_save_rescue_bags(merchant_id):
    """Test 5: Save rescue bags"""
    print_section("TEST 5: Save Rescue Bags")
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    data = {
        "merchant_id": merchant_id,
        "date": today,
        "bags": [
            {
                "bag_type": "regular_veg",
                "target_price": 150,
                "items": [
                    {
                        "food_name": "Pain Au Chocolate",
                        "quantity": 1,
                        "unit_price": 95
                    },
                    {
                        "food_name": "Croissant",
                        "quantity": 2,
                        "unit_price": 45
                    }
                ],
                "estimated_total_value": 185
            },
            {
                "bag_type": "large_non_veg",
                "target_price": 450,
                "items": [
                    {
                        "food_name": "Chicken Sandwich",
                        "quantity": 3,
                        "unit_price": 120
                    },
                    {
                        "food_name": "Korean Bun",
                        "quantity": 2,
                        "unit_price": 72
                    }
                ],
                "estimated_total_value": 504
            }
        ]
    }
    
    response = requests.post(f"{BASE_URL}/rescue-bags", json=data)
    print_response(response)
    
    if response.status_code == 201:
        print(f"\n✓ Rescue bags saved successfully!")
        return True
    else:
        print(f"\n✗ Failed to save rescue bags")
        return False

def test_health_check():
    """Test: Health check endpoint"""
    print_section("TEST: Health Check")
    
    response = requests.get("http://localhost:8000/health")
    print_response(response)
    
    if response.status_code == 200:
        print(f"\n✓ Server is healthy!")
        return True
    else:
        print(f"\n✗ Server health check failed")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("  SPARE BACKEND API - CRUD ENDPOINTS TEST SUITE")
    print("=" * 80)
    print("\nMake sure the server is running:")
    print("  uvicorn ml_service.main:app --reload --port 8000\n")
    
    # Health check
    if not test_health_check():
        print("\n✗ Server is not running. Please start the server first.")
        return
    
    # Test 1: Create merchant
    merchant_id, email, password = test_create_merchant()
    if not merchant_id:
        print("\n✗ Test suite aborted - could not create merchant")
        return
    
    # Test duplicate merchant creation
    test_create_duplicate_merchant(email)
    
    # Test 2: Login merchant
    test_login_merchant(email, password)
    
    # Test invalid login
    test_login_invalid_credentials()
    
    # Test 3: Get merchant
    test_get_merchant(merchant_id)
    
    # Test get nonexistent merchant
    test_get_nonexistent_merchant()
    
    # Test 4: Save leftover items
    test_save_leftover_items(merchant_id)
    
    # Test upsert (update) leftover items
    test_update_leftover_items(merchant_id)
    
    # Test 5: Save rescue bags
    test_save_rescue_bags(merchant_id)
    
    # Summary
    print_section("TEST SUITE COMPLETE")
    print("\nAll 5 CRUD endpoints have been tested!")
    print("\nEndpoints tested:")
    print("  1. POST /api/merchants - Create merchant")
    print("  2. POST /api/merchants/login - Login merchant")
    print("  3. GET /api/merchants/{id} - Get merchant")
    print("  4. POST /api/leftover-items - Save leftover items (upsert)")
    print("  5. POST /api/rescue-bags - Save rescue bags")
    print("\n" + "=" * 80 + "\n")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to the server.")
        print("   Please make sure the server is running:")
        print("   uvicorn ml_service.main:app --reload --port 8000\n")
    except Exception as e:
        print(f"\n✗ ERROR: {str(e)}\n")
