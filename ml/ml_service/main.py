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
async def food_extraction_endpoint(image_base64: str = Body(...), menu: list = Body(...)):
    """
    Extract food items from image with prices from menu.
    
    Required body parameters:
        image_base64: Base64 encoded image string
        menu: Full menu JSON list (e.g. from menu.json "menu" array) with food_name, price, etc.
    
    Returns:
        List of detected food items with type, quantity, closest_menu_item, confidence, price
    """
    result = classify_food_from_image(image_base64=image_base64, menu_json=menu)
    return result


@app.post("/api/ml/rescue-bag-creation")
async def rescue_bag_creation_endpoint(leftover_food_items: list = Body(...)):
    """
    Create rescue bags from leftover food items.
    
    Required body parameter:
        leftover_food_items: List of items with closest_menu_item, quantity, price
    
    Returns:
        List of rescue bags with bag_type, target_price, items, estimated_total_value
    """
    result = rescue_bag_creation(food_classification_output=leftover_food_items)
    return result


@app.post(
    "/api/ml/food-classification",
    response_model=FoodClassificationResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def food_classification_endpoint(request: FoodClassificationRequest):
    """
    Classify food items from a base64-encoded image

    Args:
        request: FoodClassificationRequest with image_base64 and optional menu (JSON list)

    Returns:
        FoodClassificationResponse with detected food items
    """
    try:
        result = classify_food_from_image(
            image_base64=request.image_base64,
            menu_json=request.menu,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Food classification failed: {str(e)}"
        )


@app.post(
    "/api/ml/food-classification/upload",
    response_model=FoodClassificationResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def food_classification_upload_endpoint(
    image: UploadFile = File(...),
    menu: Optional[str] = Form(None),
):
    """
    Classify food items from an uploaded image file.

    Args:
        image: Image file upload
        menu: Optional JSON string: either {"menu": [...]} or direct array [...]

    Returns:
        FoodClassificationResponse with detected food items
    """
    try:
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        menu_json = None
        if menu:
            parsed = json.loads(menu)
            menu_json = parsed.get("menu", parsed) if isinstance(parsed, dict) else parsed

        result = classify_food_from_image(
            image_base64=image_base64,
            menu_json=menu_json,
        )
        return result
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid menu JSON format",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Food classification failed: {str(e)}"
        )


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