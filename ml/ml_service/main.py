from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import base64
import json

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
    upsert_leftover_items,
    upsert_leftover_items_by_request,
    get_leftover_items,
    get_merchant_menu,
    save_rescue_bags,
    upsert_rescue_bags
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


# ============================================================================
# ML ENDPOINTS (Existing)
# ============================================================================

@app.post("/api/ml/food-extraction")
async def food_extraction_endpoint(request: dict = Body(...)):
    """
    Extract food items from image, save to DB, return saved document.
    
    Required body parameters:
        merchant_id: Merchant UUID
        image_base64: Base64 encoded image string
    
    Returns:
        MongoDB document with leftover items
    """
    merchant_id = request.get("merchant_id")
    image_base64 = request.get("image_base64")
    
    # Call LLM to classify food (pulls menu from DB internally)
    leftover_items = classify_food_from_image(merchant_id=merchant_id, image_base64=image_base64)
    
    # Upsert to DB by merchant_id + date
    saved_doc = upsert_leftover_items(merchant_id, leftover_items)
    
    return saved_doc


@app.post("/api/ml/rescue-bag-creation")
async def rescue_bag_creation_endpoint(request: dict = Body(...)):
    """
    Create rescue bags from leftover food items in DB.
    
    Required body parameter:
        merchant_id: Merchant UUID
    
    Returns:
        MongoDB document with rescue bags
    """
    merchant_id = request.get("merchant_id")
    
    # Pull leftover items from DB
    leftover_items = get_leftover_items(merchant_id)
    
    # Pull menu from DB
    menu = get_merchant_menu(merchant_id)
    
    # Call LLM to create rescue bags
    rescue_bags = rescue_bag_creation(merchant_id=merchant_id, food_classification_output=leftover_items, menu_json=menu)
    
    # Upsert to DB by merchant_id + date
    saved_doc = upsert_rescue_bags(merchant_id, rescue_bags)
    
    return saved_doc


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