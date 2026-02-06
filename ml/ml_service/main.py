from fastapi import FastAPI, HTTPException, File, UploadFile, Form
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
from .food_classification import classify_food_from_image
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


@app.post(
    "/api/ml/food-classification",
    response_model=FoodClassificationResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def food_classification_endpoint(request: FoodClassificationRequest):
    """
    Classify food items from a base64-encoded image
    
    Args:
        request: FoodClassificationRequest with image_base64 and optional menu_items
        
    Returns:
        FoodClassificationResponse with detected food items
    """
    try:
        result = classify_food_from_image(
            image_base64=request.image_base64,
            menu_items=request.menu_items
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
    menu_items: Optional[str] = Form(None)
):
    """
    Classify food items from an uploaded image file
    
    Args:
        image: Image file upload
        menu_items: Optional JSON string of menu items array
        
    Returns:
        FoodClassificationResponse with detected food items
    """
    try:
        # Read and encode image
        image_bytes = await image.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        
        # Parse menu items if provided
        menu_items_list = None
        if menu_items:
            menu_items_list = json.loads(menu_items)
        
        result = classify_food_from_image(
            image_base64=image_base64,
            menu_items=menu_items_list
        )
        return result
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid menu_items JSON format"
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