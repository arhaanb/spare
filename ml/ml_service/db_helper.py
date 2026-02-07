"""
MongoDB helper functions for food extraction and rescue bag operations
"""
import configparser
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Any, Optional

# Load config
config = configparser.ConfigParser()
config.read("config.ini")

MONGO_URL = config["MONGODB"]["mongo_url"]
DATABASE_NAME = config["MONGODB"]["database"]
COLLECTION_MERCHANTS = config["MONGODB"]["collection_merchants"]
COLLECTION_LEFTOVER_ITEMS = config["MONGODB"]["collection_leftover_items"]
COLLECTION_RESCUE_BAGS = config["MONGODB"]["collection_rescue_bags"]


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


def upsert_leftover_items(merchant_id: str, items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Upsert leftover items for merchant by date
    
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


def upsert_rescue_bags(merchant_id: str, bags: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Upsert rescue bags for merchant by date
    
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
