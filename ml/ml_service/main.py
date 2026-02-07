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
    ErrorResponse
)
from .food_classification import classify_food_from_image, rescue_bag_creation
from .price_optimization import get_price_optimizer
from .db_helper import (
    upsert_leftover_items,
    get_leftover_items,
    get_merchant_menu,
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


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Spare ML Service"}


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
            "food_extraction": "/api/ml/food-extraction",
            "rescue_bag_creation": "/api/ml/rescue-bag-creation",
            "food_classification": "/api/ml/food-classification",
            "food_classification_upload": "/api/ml/food-classification/upload",
            "price_optimization": "/api/ml/price-optimization"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    # NOTE command to run
    # uvicorn ml_service.main:app --reload --port 8000