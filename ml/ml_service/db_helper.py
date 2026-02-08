"""
MongoDB helper functions for food extraction and rescue bag operations
"""
import os
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Any, Optional
import bcrypt
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB configuration from environment variables
MONGO_URL = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("MONGODB_DATABASE", "spare")
COLLECTION_MERCHANTS = "merchants"
COLLECTION_LEFTOVER_ITEMS = "leftover_items"
COLLECTION_RESCUE_BAGS = "rescue_bags"


def get_db():
    """Get database instance"""
    client = MongoClient(MONGO_URL)
    return client[DATABASE_NAME]


def get_merchants_collection():
    """Get merchants collection"""
    db = get_db()
    return db[COLLECTION_MERCHANTS]


def get_leftover_items_collection():
    """Get leftover_items collection"""
    db = get_db()
    return db[COLLECTION_LEFTOVER_ITEMS]


def get_rescue_bags_collection():
    """Get rescue_bags collection"""
    db = get_db()
    return db[COLLECTION_RESCUE_BAGS]


def ensure_indexes():
    """Ensure database indexes are created"""
    merchants = get_merchants_collection()
    leftover_items = get_leftover_items_collection()
    rescue_bags = get_rescue_bags_collection()
    
    try:
        # Unique index on email for merchants
        merchants.create_index("email", unique=True)
    except Exception as e:
        print(f"Warning: Could not create email index: {e}")
        print("This is okay if the index already exists")
    
    try:
        # Compound index on merchant_id + date for leftover_items
        leftover_items.create_index([("merchant_id", 1), ("date", 1)], unique=True)
    except Exception as e:
        print(f"Warning: Could not create leftover_items index: {e}")
        print("This is okay if the index already exists")
    
    try:
        # Compound index on merchant_id + date for rescue_bags (prevents duplicates)
        rescue_bags.create_index([("merchant_id", 1), ("date", 1)], unique=True)
    except Exception as e:
        print(f"Warning: Could not create rescue_bags index: {e}")
        print("This is okay if the index already exists")


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_merchant(merchant_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new merchant account
    
    Args:
        merchant_data: Merchant data with password
        
    Returns:
        Created merchant document (without password)
    """
    merchants = get_merchants_collection()
    
    # Check if email already exists
    existing = merchants.find_one({"email": merchant_data["email"]})
    if existing:
        raise ValueError("Email already registered")
    
    # Generate UUID for merchant_id
    merchant_id = str(uuid.uuid4())
    
    # Hash the password
    hashed_password = hash_password(merchant_data["password"])
    
    # Create document
    now = datetime.now().isoformat()
    doc = {
        "merchant_id": merchant_id,
        "merchant_name": merchant_data["merchant_name"],
        "email": merchant_data["email"],
        "password": hashed_password,
        "location": merchant_data["location"],
        "contact": merchant_data["contact"],
        "menu": merchant_data["menu"],
        "bag_pricing": merchant_data["bag_pricing"],
        "operating_hours": merchant_data["operating_hours"],
        "created_at": now,
        "updated_at": now
    }
    
    merchants.insert_one(doc)
    
    # Return without password
    return_doc = doc.copy()
    del return_doc["password"]
    del return_doc["_id"]
    
    return return_doc


def login_merchant(email: str, password: str) -> Dict[str, Any]:
    """
    Login merchant with email and password
    
    Args:
        email: Merchant email
        password: Plain text password
        
    Returns:
        Merchant document (without password)
    """
    merchants = get_merchants_collection()
    
    # Find merchant by email
    merchant = merchants.find_one({"email": email})
    if not merchant:
        raise ValueError("Invalid email or password")
    
    # Verify password
    if not verify_password(password, merchant["password"]):
        raise ValueError("Invalid email or password")
    
    # Return without password
    return_doc = {k: v for k, v in merchant.items() if k not in ["password", "_id"]}
    
    return return_doc


def get_merchant_by_id(merchant_id: str) -> Dict[str, Any]:
    """
    Get merchant by merchant_id
    
    Args:
        merchant_id: Merchant UUID
        
    Returns:
        Merchant document (without password)
    """
    merchants = get_merchants_collection()
    
    merchant = merchants.find_one({"merchant_id": merchant_id})
    if not merchant:
        raise ValueError("Merchant not found")
    
    # Return without password
    return_doc = {k: v for k, v in merchant.items() if k not in ["password", "_id"]}
    
    return return_doc


def get_merchant_menu(merchant_id: str) -> List[Dict[str, Any]]:
    """
    Pull menu from merchants collection by merchant_id
    
    Args:
        merchant_id: Merchant UUID
        
    Returns:
        List of menu items
    """
    merchants = get_merchants_collection()
    merchant = merchants.find_one({"merchant_id": merchant_id})
    
    if not merchant:
        raise Exception(f"Merchant {merchant_id} not found")
    
    return merchant.get("menu", [])


def get_merchant_bag_pricing(merchant_id: str) -> Dict[str, float]:
    """
    Get bag pricing from merchant
    
    Args:
        merchant_id: Merchant UUID
        
    Returns:
        Dict with regular_bag_price and large_bag_price
    """
    merchants = get_merchants_collection()
    merchant = merchants.find_one({"merchant_id": merchant_id})
    
    if not merchant:
        raise Exception(f"Merchant {merchant_id} not found")
    
    return merchant.get("bag_pricing", {"regular_bag_price": 150, "large_bag_price": 450})


def upsert_leftover_items_by_request(merchant_id: str, date: str, items: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Upsert leftover items for merchant by date (from API request)
    
    Args:
        merchant_id: Merchant UUID
        date: Date string (YYYY-MM-DD)
        items: List of leftover food items
        
    Returns:
        Success message
    """
    collection = get_leftover_items_collection()
    
    doc = {
        "merchant_id": merchant_id,
        "date": date,
        "items": items,
        "updated_at": datetime.now().isoformat()
    }
    
    collection.update_one(
        {"merchant_id": merchant_id, "date": date},
        {"$set": doc},
        upsert=True
    )
    
    return {"success": True, "message": "Items saved successfully"}


def upsert_leftover_items(merchant_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Upsert leftover items for merchant by date (for ML flow)
    
    Args:
        merchant_id: Merchant UUID
        items: List of leftover food items
        
    Returns:
        Saved document from DB
    """
    collection = get_leftover_items_collection()
    today = datetime.now().strftime("%Y-%m-%d")
    
    doc = {
        "merchant_id": merchant_id,
        "date": today,
        "items": items,
        "created_at": datetime.now().isoformat()
    }
    
    collection.update_one(
        {"merchant_id": merchant_id, "date": today},
        {"$set": doc},
        upsert=True
    )
    
    return collection.find_one({"merchant_id": merchant_id, "date": today}, {"_id": 0})


def get_leftover_items(merchant_id: str) -> List[Dict[str, Any]]:
    """
    Get leftover items for merchant for today
    
    Args:
        merchant_id: Merchant UUID
        
    Returns:
        List of leftover items
    """
    collection = get_leftover_items_collection()
    today = datetime.now().strftime("%Y-%m-%d")
    
    doc = collection.find_one({"merchant_id": merchant_id, "date": today})
    
    if not doc:
        raise Exception(f"No leftover items found for merchant {merchant_id} on {today}")
    
    return doc.get("items", [])


def save_rescue_bags(merchant_id: str, date: str, bags: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Save rescue bags for merchant (UPSERT - replaces existing bags for the same date)
    
    Args:
        merchant_id: Merchant UUID
        date: Date string (YYYY-MM-DD)
        bags: List of rescue bags
        
    Returns:
        Success message
    """
    collection = get_rescue_bags_collection()
    
    doc = {
        "merchant_id": merchant_id,
        "date": date,
        "bags": bags,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Use upsert to replace existing bags for the same merchant_id + date
    collection.update_one(
        {"merchant_id": merchant_id, "date": date},
        {"$set": doc},
        upsert=True
    )
    
    return {"success": True, "message": "Rescue bags saved successfully"}


def upsert_rescue_bags(merchant_id: str, bags: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Upsert rescue bags for merchant by date (for ML flow)
    
    Args:
        merchant_id: Merchant UUID
        bags: List of rescue bags
        
    Returns:
        Saved document from DB
    """
    collection = get_rescue_bags_collection()
    today = datetime.now().strftime("%Y-%m-%d")
    
    doc = {
        "merchant_id": merchant_id,
        "date": today,
        "bags": bags,
        "created_at": datetime.now().isoformat()
    }
    
    collection.update_one(
        {"merchant_id": merchant_id, "date": today},
        {"$set": doc},
        upsert=True
    )
    
    return collection.find_one({"merchant_id": merchant_id, "date": today}, {"_id": 0})
