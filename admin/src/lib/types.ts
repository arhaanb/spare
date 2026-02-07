// ===== Spare Restaurant Dashboard - Type Definitions =====

// Rescue Bag Types
export interface RescueBag {
    id: string;
    merchantId: string;
    merchantName: string;
    name: string;
    category: BagCategory;
    price: number;
    originalValue: number;
    quantity: number;
    quantityRemaining: number;
    pickupStart: string;
    pickupEnd: string;
    status: BagStatus;
    createdAt: string;
    description?: string;
}

export type BagCategory =
    | "mixed_bakery"
    | "breads"
    | "pastries"
    | "snacks"
    | "mixed";

export type BagStatus = "available" | "sold_out" | "expired" | "cancelled";

// Order Types
export interface Order {
    id: string;
    consumerId: string;
    consumerName: string;
    merchantId: string;
    merchantName: string;
    bagId: string;
    bagCategory: BagCategory;
    price: number;
    status: OrderStatus;
    pickupTime: string;
    pickupCode: string;
    createdAt: string;
    completedAt?: string;
    rating?: number;
    feedback?: string;
}

export type OrderStatus =
    | "reserved"
    | "confirmed"
    | "picked_up"
    | "cancelled"
    | "no_show"
    | "expired";

// Restaurant Stats
export interface RestaurantStats {
    todayRevenue: number;
    revenueChange: number;
    bagsSoldToday: number;
    bagsChange: number;
    bagsAvailable: number;
    pendingPickups: number;
    averageRating: number;
    ratingChange: number;
    wasteSaved: number;
    wasteChange: number;
    totalBagsSold: number;
    totalRevenue: number;
}

// Daily Stats
export interface DailyStats {
    date: string;
    revenue: number;
    bagsSold: number;
}

// Merchant Types
export interface NutritionalValue {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

export interface MenuItem {
    food_type: string;
    food_name: string;
    non_veg: boolean;
    price: number;
    units?: string;
    nutritional_value: NutritionalValue;
}

export interface BagPricing {
    regular_bag_price: number;
    large_bag_price: number;
}

export interface OperatingHours {
    opening: string;
    closing: string;
}

export interface Contact {
    phone: string;
}

export interface Merchant {
    merchant_id: string;
    merchant_name: string;
    email: string;
    password?: string;
    location: string;
    contact: Contact;
    menu: MenuItem[];
    bag_pricing: BagPricing;
    operating_hours: OperatingHours;
    created_at: string;
    updated_at: string;
}

// ML API Response Types
export interface ExtractedFoodItem {
    type: string;
    quantity: number;
    closest_menu_item: string;
    confidence: number;
    price: number;
    non_veg: boolean;
}

export interface FoodExtractionResponse {
    merchant_id: string;
    date: string;
    items: ExtractedFoodItem[];
    created_at: string;
}

export interface RescueBagItem {
    food_name: string;
    quantity: number;
    unit_price: number;
}

export type BagType = "regular_veg" | "regular_non_veg" | "large_veg" | "large_non_veg";

export interface RescueBagSuggestion {
    bag_type: BagType;
    target_price: number;
    items: RescueBagItem[];
    estimated_total_value: number;
}

export interface RescueBagCreationResponse {
    merchant_id: string;
    date: string;
    bags: RescueBagSuggestion[];
    created_at: string;
}
