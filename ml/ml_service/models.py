from pydantic import BaseModel, Field
from typing import List, Optional, Literal


# Food Classification Models
class FoodItem(BaseModel):
    type: str = Field(..., description="Type/name of the food item")
    quantity: int = Field(..., description="Quantity of the food item")
    closest_menu_item: str = Field(..., description="Closest matching menu item")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score (0-100)")


class FoodClassificationRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")
    menu_items: Optional[List[str]] = Field(None, description="Optional list of menu items for matching")


class FoodClassificationResponse(BaseModel):
    items: List[FoodItem]
    total_items: int
    processing_time_ms: float


# Price Optimization Models
class PriceOptimizationRequest(BaseModel):
    merchant_id: str = Field(..., description="Merchant identifier")
    time_until_closing_minutes: int = Field(..., ge=0, description="Minutes until closing time")
    item_type: Literal["perishable", "non_perishable"] = Field(..., description="Whether items are perishable")
    current_price: Optional[float] = Field(None, ge=0, description="Current price (optional)")
    competitor_prices: Optional[List[float]] = Field(None, description="List of competitor prices (optional)")


class PriceReasoning(BaseModel):
    time_factor: str
    sell_through_impact: str
    competitor_analysis: str
    perishability_factor: str


class PriceRange(BaseModel):
    min: float
    max: float


class PriceOptimizationResponse(BaseModel):
    recommended_price: float
    confidence: float = Field(..., ge=0, le=1)
    reasoning: PriceReasoning
    price_range: PriceRange
    expected_sell_through: float = Field(..., ge=0, le=1)


# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
