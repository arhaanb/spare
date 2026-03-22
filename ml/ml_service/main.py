from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import base64
import json
import time
import os
import random
from datetime import datetime

from .models import (
    FoodClassificationRequest,
    FoodClassificationResponse,
    PriceOptimizationRequest,
    PriceOptimizationResponse,
    MerchantCreate,
    MerchantLogin,
    MerchantResponse,
    LeftoverItemsRequest,
    LeftoverItemsResponse,
    RescueBagsRequest,
    RescueBagsResponse,
    ErrorResponse
)
from .food_classification import classify_food_from_image, rescue_bag_creation
from .price_optimization import get_price_optimizer
from .db_helper import (
    ensure_indexes,
    create_merchant,
    login_merchant,
    get_merchant_by_id,
    upsert_leftover_items_by_request,
    get_leftover_items,
    get_merchant_menu,
    save_rescue_bags,
    get_rescue_bags_collection
)

# Initialize FastAPI app
app = FastAPI(
    title="Spare ML Service",
    description="ML service for food classification and price optimization",
    version="1.0.0"
)

# Add CORS middleware for React Native integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on startup"""
    ensure_indexes()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Spare ML Service"}


# ============================================================================
# MERCHANT CRUD ENDPOINTS
# ============================================================================

@app.post(
    "/api/merchants",
    response_model=MerchantResponse,
    status_code=201,
    responses={400: {"model": ErrorResponse}}
)
async def create_merchant_endpoint(merchant: MerchantCreate):
    """
    Register a new merchant account
    
    Args:
        merchant: Merchant data including email, password, menu, etc.
        
    Returns:
        Created merchant document (without password)
    """
    try:
        merchant_data = merchant.model_dump()
        result = create_merchant(merchant_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


@app.post(
    "/api/merchants/login",
    response_model=MerchantResponse,
    responses={401: {"model": ErrorResponse}}
)
async def login_merchant_endpoint(credentials: MerchantLogin):
    """
    Authenticate merchant with email and password
    
    Args:
        credentials: Email and password
        
    Returns:
        Merchant document (without password)
    """
    try:
        result = login_merchant(credentials.email, credentials.password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


@app.get(
    "/api/merchants/{merchant_id}",
    response_model=MerchantResponse,
    responses={404: {"model": ErrorResponse}}
)
async def get_merchant_endpoint(merchant_id: str):
    """
    Get merchant by merchant_id
    
    Args:
        merchant_id: Merchant UUID
        
    Returns:
        Merchant document (without password)
    """
    try:
        result = get_merchant_by_id(merchant_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


# ============================================================================
# LEFTOVER ITEMS & RESCUE BAGS ENDPOINTS
# ============================================================================

@app.post(
    "/api/leftover-items",
    response_model=LeftoverItemsResponse,
    responses={400: {"model": ErrorResponse}}
)
async def save_leftover_items_endpoint(request: LeftoverItemsRequest):
    """
    Save or update leftover food items for a merchant on a specific date (UPSERT)
    
    Args:
        request: merchant_id, date, and items array
        
    Returns:
        Success message
    """
    try:
        if not request.merchant_id or not request.date or not request.items:
            raise ValueError("merchant_id, date, and items are required")
        
        items_data = [item.model_dump() for item in request.items]
        result = upsert_leftover_items_by_request(request.merchant_id, request.date, items_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


@app.post(
    "/api/rescue-bags",
    response_model=RescueBagsResponse,
    status_code=201,
    responses={400: {"model": ErrorResponse}}
)
async def save_rescue_bags_endpoint(request: RescueBagsRequest):
    """
    Save generated rescue bags for a merchant (INSERT)
    
    Args:
        request: merchant_id, date, and bags array
        
    Returns:
        Success message
    """
    try:
        if not request.merchant_id or not request.date or not request.bags:
            raise ValueError("merchant_id, date, and bags are required")
        
        bags_data = [bag.model_dump() for bag in request.bags]
        result = save_rescue_bags(request.merchant_id, request.date, bags_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


@app.get("/api/rescue-bags/today")
async def get_todays_rescue_bags_endpoint(merchant_id: str, date: str = None):
    """
    Get today's rescue bags for a merchant
    
    Args:
        merchant_id: Merchant UUID (query parameter)
        date: Optional date (YYYY-MM-DD), defaults to today
        
    Returns:
        Rescue bags data with stats
    """
    try:
        from datetime import datetime as dt
        
        if not date:
            date = dt.now().strftime("%Y-%m-%d")
        
        # Get rescue bags from DB
        rescue_bags_collection = get_rescue_bags_collection()
        doc = rescue_bags_collection.find_one(
            {"merchant_id": merchant_id, "date": date},
            {"_id": 0}
        )
        
        if not doc:
            raise HTTPException(status_code=404, detail={"error": "No rescue bags found for this date"})
        
        bags = doc.get("bags", [])
        
        # Calculate stats (for now, everything is "available" until we have order tracking)
        stats = {
            "available": len(bags),
            "sold": 0,  # TODO: Calculate from orders
            "pending_pickup": 0,  # TODO: Calculate from orders
            "bags": bags
        }
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": f"Internal server error: {str(e)}"})


# ============================================================================
# ML ENDPOINTS (Existing)
# ============================================================================

@app.post("/api/ml/food-extraction")
async def food_extraction_endpoint(request: dict = Body(...)):
    """
    Extract food items from image and return results immediately.
    Does NOT save to database - that happens when user confirms items.
    
    Required body parameters:
        merchant_id: Merchant UUID
        image_base64: Base64 encoded image string
    
    Returns:
        List of extracted food items (direct LLM response)
    """
    merchant_id = request.get("merchant_id")
    
    # Sleep for random 2-5 seconds to simulate processing
    time.sleep(random.uniform(2, 5))
    
    # Load mock data from food_classification_output.json
    mock_json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "food_classification_output.json")
    with open(mock_json_path, "r") as f:
        leftover_items = json.load(f)
    
    # Check if document already exists in MongoDB for this merchant_id
    from .db_helper import get_leftover_items_collection
    collection = get_leftover_items_collection()
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing_doc = collection.find_one({"merchant_id": merchant_id})
    
    # Save to MongoDB if it doesn't already exist for this merchant_id
    if not existing_doc:
        doc = {
            "merchant_id": merchant_id,
            "date": today,
            "items": leftover_items,
            "created_at": datetime.now().isoformat()
        }
        collection.insert_one(doc)
    
    # Return mock data directly
    return {"items": leftover_items}


@app.post("/api/ml/rescue-bag-creation")
async def rescue_bag_creation_endpoint(request: dict = Body(...)):
    """
    Create rescue bags from leftover food items.
    Does NOT save to database - that happens when user confirms bags.
    
    Required body parameters:
        merchant_id: Merchant UUID
        items: List of leftover items (optional - will pull from DB if not provided)
    
    Returns:
        List of suggested rescue bags (direct LLM response)
    """
    merchant_id = request.get("merchant_id")
    time.sleep(random.uniform(2, 5))
    
    
    mock_json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "rescue_bags_creation_output.json")
    with open(mock_json_path, "r") as f:
        rescue_bags = json.load(f)
    
    # Check if document already exists in MongoDB for this merchant_id
    from .db_helper import get_rescue_bags_collection
    collection = get_rescue_bags_collection()
    today = datetime.now().strftime("%Y-%m-%d")
    
    existing_doc = collection.find_one({"merchant_id": merchant_id})
    
    # Save to MongoDB if it doesn't already exist for this merchant_id
    if not existing_doc:
        doc = {
            "merchant_id": merchant_id,
            "date": today,
            "bags": rescue_bags,
            "created_at": datetime.now().isoformat()
        }
        collection.insert_one(doc)
    
    return {"bags": rescue_bags}


@app.post(
    "/api/ml/price-optimization",
    response_model=PriceOptimizationResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def price_optimization_endpoint(request: PriceOptimizationRequest):
    """
    Optimize rescue bag pricing based on multiple factors
    
    Args:
        request: PriceOptimizationRequest with merchant_id, time_until_closing, item_type, etc.
        
    Returns:
        PriceOptimizationResponse with recommended price and reasoning
    """
    try:
        optimizer = get_price_optimizer()
        result = optimizer.optimize_price(
            merchant_id=request.merchant_id,
            time_until_closing_minutes=request.time_until_closing_minutes,
            item_type=request.item_type,
            current_price=request.current_price,
            competitor_prices=request.competitor_prices
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Price optimization failed: {str(e)}"
        )


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Spare ML Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "create_merchant": "POST /api/merchants",
            "login_merchant": "POST /api/merchants/login",
            "get_merchant": "GET /api/merchants/{merchant_id}",
            "save_leftover_items": "POST /api/leftover-items",
            "save_rescue_bags": "POST /api/rescue-bags",
            "food_extraction": "POST /api/ml/food-extraction",
            "rescue_bag_creation": "POST /api/ml/rescue-bag-creation",
            "price_optimization": "POST /api/ml/price-optimization"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # NOTE command to run
    # uvicorn ml_service.main:app --reload --port 8000