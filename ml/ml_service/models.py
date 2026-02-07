from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
from datetime import datetime


# Food Classification Models
class FoodItem(BaseModel):
    type: str = Field(..., description="Type/name of the food item")
    quantity: int = Field(..., description="Quantity of the food item")
    closest_menu_item: str = Field(..., description="Closest matching menu item")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score (0-100)")


class FoodClassificationRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded image")
    menu: Optional[List[dict]] = Field(
        None,
        description="Optional menu as list of items (e.g. from menu.json 'menu' array) for matching and quantification",
    )


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


# Merchant Models
class ContactInfo(BaseModel):
    phone: str


class NutritionalValue(BaseModel):
    calories: int
    protein: int
    fat: int
    carbs: int


class MenuItem(BaseModel):
    food_type: str
    food_name: str
    non_veg: bool
    price: float
    nutritional_value: NutritionalValue


class BagPricing(BaseModel):
    regular_bag_price: float
    large_bag_price: float


class OperatingHours(BaseModel):
    opening: str
    closing: str


class MerchantCreate(BaseModel):
    merchant_name: str
    email: EmailStr
    password: str
    location: str
    contact: ContactInfo
    menu: List[MenuItem]
    bag_pricing: BagPricing
    operating_hours: OperatingHours


class MerchantLogin(BaseModel):
    email: EmailStr
    password: str


class MerchantResponse(BaseModel):
    merchant_id: str
    merchant_name: str
    email: str
    location: str
    contact: ContactInfo
    menu: List[MenuItem]
    bag_pricing: BagPricing
    operating_hours: OperatingHours
    created_at: str
    updated_at: str


# Leftover Items Models
class LeftoverItem(BaseModel):
    type: str
    quantity: int
    closest_menu_item: str
    confidence: int
    price: float
    non_veg: bool


class LeftoverItemsRequest(BaseModel):
    merchant_id: str
    date: str
    items: List[LeftoverItem]


class LeftoverItemsResponse(BaseModel):
    success: bool
    message: str


# Rescue Bags Models
class RescueBagItem(BaseModel):
    food_name: str
    quantity: int
    unit_price: float


class RescueBag(BaseModel):
    bag_type: str
    target_price: float
    items: List[RescueBagItem]
    estimated_total_value: float


class RescueBagsRequest(BaseModel):
    merchant_id: str
    date: str
    bags: List[RescueBag]


class RescueBagsResponse(BaseModel):
    success: bool
    message: str


# Error Models
class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
