// Demand Forecasting Mock Data
// Based on Blue Tokai menu items with raw materials and historical patterns

// ===== Menu Items with Raw Materials =====
export interface RawMaterial {
    name: string;
    unit: string;
    quantityPerItem: number;
    costPerUnit: number;
    shelfLifeDays: number;
}

export interface MenuItem {
    id: string;
    name: string;
    category: 'bakery' | 'beverage' | 'dessert' | 'savory' | 'cookie';
    price: number;
    costToMake: number;
    isVeg: boolean;
    shelfLifeHours: number;
    rawMaterials: RawMaterial[];
    avgDailyDemand: number;
    demandVariance: number; // % variance for realistic patterns
}

export const menuItems: MenuItem[] = [
    // Bakery Items
    {
        id: 'bt-001',
        name: 'Pain Au Chocolat',
        category: 'bakery',
        price: 95,
        costToMake: 35,
        isVeg: true,
        shelfLifeHours: 24,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 80, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 45, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Dark Chocolate', unit: 'g', quantityPerItem: 30, costPerUnit: 0.25, shelfLifeDays: 365 },
            { name: 'Sugar', unit: 'g', quantityPerItem: 15, costPerUnit: 0.04, shelfLifeDays: 730 },
            { name: 'Eggs', unit: 'pcs', quantityPerItem: 0.5, costPerUnit: 8, shelfLifeDays: 21 },
        ],
        avgDailyDemand: 18,
        demandVariance: 25,
    },
    {
        id: 'bt-002',
        name: 'Pistachio Croissant',
        category: 'bakery',
        price: 118,
        costToMake: 48,
        isVeg: true,
        shelfLifeHours: 24,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 85, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 50, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Pistachios', unit: 'g', quantityPerItem: 25, costPerUnit: 1.5, shelfLifeDays: 180 },
            { name: 'Almond Paste', unit: 'g', quantityPerItem: 20, costPerUnit: 0.8, shelfLifeDays: 90 },
            { name: 'Sugar', unit: 'g', quantityPerItem: 20, costPerUnit: 0.04, shelfLifeDays: 730 },
        ],
        avgDailyDemand: 12,
        demandVariance: 30,
    },
    {
        id: 'bt-003',
        name: 'Butter Croissant',
        category: 'bakery',
        price: 64,
        costToMake: 22,
        isVeg: true,
        shelfLifeHours: 18,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 80, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 55, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Sugar', unit: 'g', quantityPerItem: 10, costPerUnit: 0.04, shelfLifeDays: 730 },
            { name: 'Salt', unit: 'g', quantityPerItem: 2, costPerUnit: 0.02, shelfLifeDays: 1825 },
        ],
        avgDailyDemand: 28,
        demandVariance: 20,
    },
    {
        id: 'bt-004',
        name: 'Almond Croissant',
        category: 'bakery',
        price: 142,
        costToMake: 55,
        isVeg: true,
        shelfLifeHours: 24,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 85, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 50, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Almonds', unit: 'g', quantityPerItem: 35, costPerUnit: 1.2, shelfLifeDays: 180 },
            { name: 'Almond Paste', unit: 'g', quantityPerItem: 25, costPerUnit: 0.8, shelfLifeDays: 90 },
            { name: 'Powdered Sugar', unit: 'g', quantityPerItem: 10, costPerUnit: 0.06, shelfLifeDays: 730 },
        ],
        avgDailyDemand: 15,
        demandVariance: 28,
    },
    {
        id: 'bt-005',
        name: 'Chocolate Hazelnut Croissant',
        category: 'bakery',
        price: 149,
        costToMake: 58,
        isVeg: true,
        shelfLifeHours: 24,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 85, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 50, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Hazelnuts', unit: 'g', quantityPerItem: 25, costPerUnit: 1.8, shelfLifeDays: 180 },
            { name: 'Nutella', unit: 'g', quantityPerItem: 30, costPerUnit: 0.5, shelfLifeDays: 365 },
            { name: 'Dark Chocolate', unit: 'g', quantityPerItem: 20, costPerUnit: 0.25, shelfLifeDays: 365 },
        ],
        avgDailyDemand: 14,
        demandVariance: 25,
    },
    // Savory Items
    {
        id: 'bt-006',
        name: 'Mushroom Cream Cheese Croissata',
        category: 'savory',
        price: 88,
        costToMake: 38,
        isVeg: true,
        shelfLifeHours: 12,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 75, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 40, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Mushrooms', unit: 'g', quantityPerItem: 50, costPerUnit: 0.3, shelfLifeDays: 5 },
            { name: 'Cream Cheese', unit: 'g', quantityPerItem: 35, costPerUnit: 0.4, shelfLifeDays: 14 },
            { name: 'Herbs', unit: 'g', quantityPerItem: 5, costPerUnit: 0.8, shelfLifeDays: 7 },
        ],
        avgDailyDemand: 10,
        demandVariance: 35,
    },
    {
        id: 'bt-007',
        name: 'Roasted Tomato Croissata',
        category: 'savory',
        price: 105,
        costToMake: 42,
        isVeg: true,
        shelfLifeHours: 12,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 75, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 40, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Cherry Tomatoes', unit: 'g', quantityPerItem: 60, costPerUnit: 0.2, shelfLifeDays: 7 },
            { name: 'Mozzarella', unit: 'g', quantityPerItem: 30, costPerUnit: 0.6, shelfLifeDays: 14 },
            { name: 'Basil', unit: 'g', quantityPerItem: 5, costPerUnit: 1.0, shelfLifeDays: 5 },
        ],
        avgDailyDemand: 8,
        demandVariance: 40,
    },
    // Desserts
    {
        id: 'bt-008',
        name: 'Mocha Brownie',
        category: 'dessert',
        price: 130,
        costToMake: 45,
        isVeg: true,
        shelfLifeHours: 48,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 40, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 60, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Dark Chocolate', unit: 'g', quantityPerItem: 50, costPerUnit: 0.25, shelfLifeDays: 365 },
            { name: 'Espresso Powder', unit: 'g', quantityPerItem: 8, costPerUnit: 2.0, shelfLifeDays: 365 },
            { name: 'Sugar', unit: 'g', quantityPerItem: 50, costPerUnit: 0.04, shelfLifeDays: 730 },
            { name: 'Eggs', unit: 'pcs', quantityPerItem: 1, costPerUnit: 8, shelfLifeDays: 21 },
        ],
        avgDailyDemand: 20,
        demandVariance: 22,
    },
    // Cookies
    {
        id: 'bt-009',
        name: 'Brownie Crinkle Cookie',
        category: 'cookie',
        price: 58,
        costToMake: 18,
        isVeg: true,
        shelfLifeHours: 72,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 30, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 25, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Cocoa Powder', unit: 'g', quantityPerItem: 15, costPerUnit: 0.4, shelfLifeDays: 365 },
            { name: 'Powdered Sugar', unit: 'g', quantityPerItem: 20, costPerUnit: 0.06, shelfLifeDays: 730 },
        ],
        avgDailyDemand: 25,
        demandVariance: 18,
    },
    // Beverages
    {
        id: 'bt-010',
        name: 'Cold Brew Coffee',
        category: 'beverage',
        price: 83,
        costToMake: 25,
        isVeg: true,
        shelfLifeHours: 168, // 7 days when canned
        rawMaterials: [
            { name: 'Coffee Beans', unit: 'g', quantityPerItem: 25, costPerUnit: 0.8, shelfLifeDays: 60 },
            { name: 'Filtered Water', unit: 'ml', quantityPerItem: 300, costPerUnit: 0.002, shelfLifeDays: 1 },
        ],
        avgDailyDemand: 35,
        demandVariance: 15,
    },
    {
        id: 'bt-011',
        name: 'Bottled Juice',
        category: 'beverage',
        price: 47,
        costToMake: 15,
        isVeg: true,
        shelfLifeHours: 72,
        rawMaterials: [
            { name: 'Fresh Fruits', unit: 'g', quantityPerItem: 200, costPerUnit: 0.06, shelfLifeDays: 7 },
            { name: 'Sugar', unit: 'g', quantityPerItem: 15, costPerUnit: 0.04, shelfLifeDays: 730 },
        ],
        avgDailyDemand: 22,
        demandVariance: 30,
    },
    {
        id: 'bt-012',
        name: 'Korean Bun',
        category: 'bakery',
        price: 72,
        costToMake: 28,
        isVeg: false,
        shelfLifeHours: 18,
        rawMaterials: [
            { name: 'Flour', unit: 'g', quantityPerItem: 70, costPerUnit: 0.05, shelfLifeDays: 180 },
            { name: 'Butter', unit: 'g', quantityPerItem: 30, costPerUnit: 0.12, shelfLifeDays: 30 },
            { name: 'Eggs', unit: 'pcs', quantityPerItem: 0.5, costPerUnit: 8, shelfLifeDays: 21 },
            { name: 'Cream', unit: 'g', quantityPerItem: 25, costPerUnit: 0.15, shelfLifeDays: 10 },
        ],
        avgDailyDemand: 16,
        demandVariance: 25,
    },
];

// ===== Day of Week Demand Multipliers =====
export const dayOfWeekMultipliers: Record<number, number> = {
    0: 1.35, // Sunday - high
    1: 0.85, // Monday - low
    2: 0.90, // Tuesday
    3: 0.95, // Wednesday
    4: 1.05, // Thursday
    5: 1.15, // Friday
    6: 1.40, // Saturday - highest
};

// ===== Time of Day Patterns =====
export const timeOfDayPatterns = {
    morning: { start: 7, end: 11, multiplier: 1.4, label: 'Morning Rush' },
    lunch: { start: 11, end: 14, multiplier: 1.2, label: 'Lunch' },
    afternoon: { start: 14, end: 17, multiplier: 0.7, label: 'Afternoon Lull' },
    evening: { start: 17, end: 21, multiplier: 1.1, label: 'Evening' },
};

// ===== Historical Data Types =====
export interface DailySalesRecord {
    date: string;
    dayOfWeek: number;
    itemId: string;
    itemName: string;
    category: string;
    quantityPrepared: number;
    quantitySold: number;
    quantityWasted: number;
    revenue: number;
    costOfWaste: number;
    wastePercentage: number;
}

export interface DailyAggregates {
    date: string;
    dayOfWeek: number;
    totalRevenue: number;
    totalItemsSold: number;
    totalItemsWasted: number;
    wastePercentage: number;
    costOfWaste: number;
    moneySaved: number; // From selling discounted rescue bags
    carbonSaved: number; // kg CO2 equivalent
    bagsCreated: number; // Number of rescue bags created
}

// ===== Generate Historical Data (last 90 days) =====
const generateHistoricalData = (): {
    salesRecords: DailySalesRecord[];
    dailyAggregates: DailyAggregates[];
} => {
    const salesRecords: DailySalesRecord[] = [];
    const dailyAggregates: DailyAggregates[] = [];

    const today = new Date();

    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const dayMultiplier = dayOfWeekMultipliers[dayOfWeek];

        // Add some seasonal variation (winter = more hot beverages, etc.)
        const monthMultiplier = 1 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.1;

        // Random daily variance
        const dailyVariance = 0.85 + Math.random() * 0.3;

        let dayRevenue = 0;
        let dayItemsSold = 0;
        let dayItemsWasted = 0;
        let dayCostOfWaste = 0;

        for (const item of menuItems) {
            // Calculate expected demand with multipliers
            const baseDemand = item.avgDailyDemand * dayMultiplier * monthMultiplier * dailyVariance;
            const variance = (Math.random() - 0.5) * 2 * (item.demandVariance / 100) * baseDemand;
            const actualDemand = Math.max(0, Math.round(baseDemand + variance));

            // Restaurants prepare 10-25% more than expected, but with variation
            // Some items are harder to predict, leading to more frequent waste
            const overPrepFactor = 1.05 + Math.random() * 0.25; // 5-30% over-prep
            
            // Some items just don't sell well on certain days (skip prep sometimes)
            // Increased to 40-50% chance to skip, so items appear ~50-60% of days
            const skipPrepChance = Math.random();
            const shouldSkipPrep = skipPrepChance > 0.55; // 45% chance to not prep this item today
            
            const quantityPrepared = shouldSkipPrep ? 0 : Math.round(actualDemand * overPrepFactor);

            // Actual sold is min of demand and prepared (with more variance)
            const soldMultiplier = 0.85 + Math.random() * 0.20; // 85%-105% of demand
            const quantitySold = Math.min(quantityPrepared, Math.round(actualDemand * soldMultiplier));
            const quantityWasted = Math.max(0, quantityPrepared - quantitySold);

            const revenue = quantitySold * item.price;
            const costOfWaste = quantityWasted * item.costToMake;
            const wastePercentage = quantityPrepared > 0 ? (quantityWasted / quantityPrepared) * 100 : 0;

            salesRecords.push({
                date: dateStr,
                dayOfWeek,
                itemId: item.id,
                itemName: item.name,
                category: item.category,
                quantityPrepared,
                quantitySold,
                quantityWasted,
                revenue,
                costOfWaste,
                wastePercentage,
            });

            dayRevenue += revenue;
            dayItemsSold += quantitySold;
            dayItemsWasted += quantityWasted;
            dayCostOfWaste += costOfWaste;
        }

        // Calculate rescue bag savings (assume 30-50% of waste is rescued)
        const rescueRate = 0.3 + Math.random() * 0.2;
        const moneySaved = dayCostOfWaste * rescueRate * 0.7; // 70% recovery through rescue bags
        const carbonSaved = dayItemsWasted * rescueRate * 0.25; // ~0.25kg CO2 per food item
        
        // Calculate bags created with realistic variation and weekend spikes
        // Range: 2-10 bags per day with more natural distribution
        const itemsPerBag = 8 + Math.random() * 4; // 8-12 items per bag
        const baseWasteForBags = dayItemsWasted * rescueRate;
        
        // Weekend spike: Much stronger on Saturdays and Sundays
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isFriday = dayOfWeek === 5;
        
        // Base bags calculation - adjusted to not constantly hit 10
        let baseBags = (baseWasteForBags / itemsPerBag) * 2.0; // Reduced from 2.5
        
        // Day-of-week patterns - more moderate
        if (isWeekend) {
            baseBags *= 1.8 + Math.random() * 0.5; // Weekends: 1.8-2.3x (reduced from 2.2-2.8x)
        } else if (isFriday) {
            baseBags *= 1.4 + Math.random() * 0.3; // Friday: 1.4-1.7x (reduced from 1.6-1.9x)
        } else {
            baseBags *= 0.7 + Math.random() * 0.5; // Weekdays: 0.7-1.2x
        }
        
        // Add daily variation
        baseBags *= 0.8 + Math.random() * 0.4; // 80%-120% variation
        
        // Occasional special event days (reduced from 8% to 5%)
        if (Math.random() > 0.95) {
            baseBags *= 1.2 + Math.random() * 0.3; // 1.2-1.5x spike (reduced)
        }
        
        // Clamp to 2-10 range (more often in 3-8 range)
        const bagsCreated = Math.max(2, Math.min(10, Math.round(baseBags)));

        dailyAggregates.push({
            date: dateStr,
            dayOfWeek,
            totalRevenue: Math.round(dayRevenue),
            totalItemsSold: dayItemsSold,
            totalItemsWasted: dayItemsWasted,
            wastePercentage: dayItemsSold + dayItemsWasted > 0
                ? Number(((dayItemsWasted / (dayItemsSold + dayItemsWasted)) * 100).toFixed(1))
                : 0,
            costOfWaste: Math.round(dayCostOfWaste),
            moneySaved: Math.round(moneySaved),
            carbonSaved: Number(carbonSaved.toFixed(1)),
            bagsCreated,
        });
    }

    return { salesRecords, dailyAggregates };
};

export const { salesRecords: historicalSales, dailyAggregates: dailyStats } = generateHistoricalData();

// ===== Simple ML Predictions =====

// Moving Average Forecast (7-day rolling)
export const movingAverageForecast = (days: number = 7): number => {
    const recentDays = dailyStats.slice(-days);
    const avgDemand = recentDays.reduce((sum, day) => sum + day.totalItemsSold, 0) / days;
    return Math.round(avgDemand);
};

// Day-of-Week Based Prediction
export const dayOfWeekForecast = (targetDayOfWeek: number): number => {
    const sameDayData = dailyStats.filter(d => d.dayOfWeek === targetDayOfWeek);
    if (sameDayData.length === 0) return movingAverageForecast();
    const avgDemand = sameDayData.reduce((sum, day) => sum + day.totalItemsSold, 0) / sameDayData.length;
    return Math.round(avgDemand);
};

// Linear Trend Detection
export const calculateTrend = (): { slope: number; direction: 'up' | 'down' | 'stable' } => {
    const last30Days = dailyStats.slice(-30);
    const n = last30Days.length;

    const sumX = last30Days.reduce((sum, _, i) => sum + i, 0);
    const sumY = last30Days.reduce((sum, day) => sum + day.totalItemsSold, 0);
    const sumXY = last30Days.reduce((sum, day, i) => sum + i * day.totalItemsSold, 0);
    const sumX2 = last30Days.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return {
        slope: Number(slope.toFixed(2)),
        direction: slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable',
    };
};

// Generate 7-day forecast
export interface ForecastDay {
    date: string;
    dayOfWeek: number;
    dayName: string;
    predictedDemand: number;
    confidence: number;
    lowerBound: number;
    upperBound: number;
}

export interface WasteForecast {
    date: string;
    dayOfWeek: number;
    predictedWasteQuantity: number; // Total items expected to be wasted
    predictedBagCount: number; // Number of rescue bags
    confidence: number; // 0-100
}

export const generateXGBoostWasteForecast = (): WasteForecast[] => {
    const forecast: WasteForecast[] = [];
    const today = new Date();
    
    // XGBoost features (mocked):
    // 1. Day-of-week patterns
    // 2. Historical 7-day rolling average waste
    // 3. Trend (increasing/decreasing)
    // 4. Seasonal multiplier
    
    const last7Days = dailyStats.slice(-7);
    const avgWaste = last7Days.reduce((sum, d) => sum + d.totalItemsWasted, 0) / 7;
    const trend = calculateTrend();
    
    for (let i = 1; i <= 14; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(forecastDate.getDate() + i);
        const dayOfWeek = forecastDate.getDay();
        
        // Feature: Day-of-week multiplier
        const dowMultiplier = dayOfWeekMultipliers[dayOfWeek];
        
        // Feature: Trend adjustment (more waste if demand is increasing)
        const trendImpact = trend.slope * i * 0.15;
        
        // Feature: Seasonal (simulate winter = less waste due to preservation)
        const seasonalMultiplier = 1 + Math.sin((forecastDate.getMonth() / 12) * Math.PI * 2) * 0.12;
        
        // XGBoost prediction (mock formula combining features)
        const baseWaste = avgWaste * dowMultiplier * seasonalMultiplier;
        const predictedWaste = Math.round(baseWaste + trendImpact + (Math.random() - 0.5) * 5);
        
        // Convert to rescue bags (assume 8-12 items per bag)
        const itemsPerBag = 10;
        const bagCount = Math.max(1, Math.round(predictedWaste / itemsPerBag));
        
        forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            dayOfWeek,
            predictedWasteQuantity: predictedWaste,
            predictedBagCount: bagCount,
            confidence: 88 - i * 3, // Confidence decreases over time
        });
    }
    
    return forecast;
};

export const generate7DayForecast = (): ForecastDay[] => {
    const forecast: ForecastDay[] = [];
    const today = new Date();
    const trend = calculateTrend();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 1; i <= 7; i++) {
        const forecastDate = new Date(today);
        forecastDate.setDate(forecastDate.getDate() + i);
        const dayOfWeek = forecastDate.getDay();

        // Combine moving average with day-of-week pattern
        const maForecast = movingAverageForecast();
        const dowForecast = dayOfWeekForecast(dayOfWeek);
        const trendAdjustment = trend.slope * i;

        const basePrediction = (maForecast * 0.4 + dowForecast * 0.6) + trendAdjustment;
        const variance = basePrediction * 0.15; // 15% confidence interval

        forecast.push({
            date: forecastDate.toISOString().split('T')[0],
            dayOfWeek,
            dayName: dayNames[dayOfWeek],
            predictedDemand: Math.round(basePrediction),
            confidence: 85 - i * 2, // Confidence decreases over time
            lowerBound: Math.round(basePrediction - variance),
            upperBound: Math.round(basePrediction + variance),
        });
    }

    return forecast;
};

// ===== Aggregated Stats for Dashboard =====
export interface ForecastStats {
    avgWasteReduction: number; // % reduction vs baseline
    totalMoneySaved: number;
    bagsCreated: number;
    bagsSold: number;
    avgMoneyPerDay: number;
    totalCarbonSaved: number;
    topWastedItems: Array<{ name: string; wastePercentage: number; quantity: number; occurrences: number }>;
}

export const calculateForecastStats = (): ForecastStats => {
    const last30Days = dailyStats.slice(-30);
    const previous30Days = dailyStats.slice(-60, -30);

    // Calculate waste reduction
    const currentWaste = last30Days.reduce((sum, d) => sum + d.wastePercentage, 0) / last30Days.length;
    const previousWaste = previous30Days.reduce((sum, d) => sum + d.wastePercentage, 0) / previous30Days.length;
    const wasteReduction = previousWaste > 0 ? ((previousWaste - currentWaste) / previousWaste) * 100 : 0;

    // Total savings
    const totalMoneySaved = last30Days.reduce((sum, d) => sum + d.moneySaved, 0);
    const totalCarbonSaved = last30Days.reduce((sum, d) => sum + d.carbonSaved, 0);
    
    // Calculate bags created (estimate 1-3 bags per day based on waste levels)
    const bagsCreated = last30Days.reduce((sum, d) => {
        const dailyBags = Math.round(1 + (d.wastePercentage / 10)); // More waste = more bags
        return sum + Math.min(3, dailyBags); // Max 3 bags per day
    }, 0);
    
    const avgMoneyPerDay = Math.round(totalMoneySaved / last30Days.length);

    // Calculate top wasted items with occurrences
    const itemWaste: Record<string, { total: number; wasted: number; days: number }> = {};
    const last30Records = historicalSales.slice(-30 * menuItems.length);
    
    last30Records.forEach(record => {
        if (!itemWaste[record.itemName]) {
            itemWaste[record.itemName] = { total: 0, wasted: 0, days: 0 };
        }
        itemWaste[record.itemName].total += record.quantityPrepared;
        itemWaste[record.itemName].wasted += record.quantityWasted;
        if (record.quantityWasted > 0) {
            itemWaste[record.itemName].days += 1;
        }
    });

    const topWastedItems = Object.entries(itemWaste)
        .map(([name, data]) => ({
            name,
            wastePercentage: Number(((data.days / 30) * 100).toFixed(1)), // % of 30 days item appeared as waste
            quantity: data.wasted,
            occurrences: data.days, // Number of days this item appeared as waste
        }))
        .sort((a, b) => b.occurrences - a.occurrences)
        .slice(0, 5);

    // Calculate bags sold (assume 80-95% of bags created are sold)
    const bagsSold = Math.round(bagsCreated * (0.8 + Math.random() * 0.15));

    return {
        avgWasteReduction: Number(wasteReduction.toFixed(1)),
        totalMoneySaved: Math.round(totalMoneySaved),
        bagsCreated,
        bagsSold,
        avgMoneyPerDay,
        totalCarbonSaved: Number(totalCarbonSaved.toFixed(1)),
        topWastedItems,
    };
};

// ===== Raw Material Forecast =====
export interface MaterialForecast {
    name: string;
    unit: string;
    currentStock: number; // Mock current stock
    forecastedUsage7Days: number;
    reorderPoint: number;
    needsReorder: boolean;
    costFor7Days: number;
}

export const calculateMaterialForecast = (): MaterialForecast[] => {
    const forecast = generate7DayForecast();
    const totalPredictedDemand = forecast.reduce((sum, f) => sum + f.predictedDemand, 0);
    const avgDemandPerItem = totalPredictedDemand / menuItems.length;

    // Aggregate materials across all items
    const materialUsage: Record<string, { unit: string; totalUsage: number; costPerUnit: number }> = {};

    menuItems.forEach(item => {
        const itemDemand = avgDemandPerItem * (item.avgDailyDemand / menuItems.reduce((sum, m) => sum + m.avgDailyDemand, 0) * menuItems.length);

        item.rawMaterials.forEach(material => {
            if (!materialUsage[material.name]) {
                materialUsage[material.name] = { unit: material.unit, totalUsage: 0, costPerUnit: material.costPerUnit };
            }
            materialUsage[material.name].totalUsage += material.quantityPerItem * itemDemand * 7;
        });
    });

    return Object.entries(materialUsage)
        .map(([name, data]) => {
            const usage = Math.round(data.totalUsage);
            const reorderPoint = Math.round(usage * 1.2); // 20% buffer
            const currentStock = Math.round(usage * (0.5 + Math.random() * 1.5)); // Random current stock

            return {
                name,
                unit: data.unit,
                currentStock,
                forecastedUsage7Days: usage,
                reorderPoint,
                needsReorder: currentStock < reorderPoint,
                costFor7Days: Math.round(usage * data.costPerUnit),
            };
        })
        .sort((a, b) => b.costFor7Days - a.costFor7Days);
};

// ===== Worst Performing Rescue Bag Items =====
export interface WorstPerformingItem {
    name: string;
    occurrences: number; // Number of times appeared in rescue bags
    lossAmount: number; // Loss in INR
    wastedPercentage: number; // % of times unsold in rescue bags
}

export const generateWorstPerformingItems = (): WorstPerformingItem[] => {
    // Generate realistic worst performing items from menu with high variance
    const worstItems: WorstPerformingItem[] = [
        {
            name: 'Pain Au Chocolat',
            occurrences: Math.round(18 + Math.random() * 15), // 18-33 times
            lossAmount: Math.round(2400 + Math.random() * 1200), // ₹2,400-3,600
            wastedPercentage: Number((23 + Math.random() * 19).toFixed(1)), // 23-42%
        },
        {
            name: 'Pistachio Croissant',
            occurrences: Math.round(14 + Math.random() * 18), // 14-32 times
            lossAmount: Math.round(2800 + Math.random() * 1500), // ₹2,800-4,300
            wastedPercentage: Number((27 + Math.random() * 21).toFixed(1)), // 27-48%
        },
        {
            name: 'Mocha Brownie',
            occurrences: Math.round(22 + Math.random() * 12), // 22-34 times
            lossAmount: Math.round(1800 + Math.random() * 1100), // ₹1,800-2,900
            wastedPercentage: Number((19 + Math.random() * 17).toFixed(1)), // 19-36%
        },
        {
            name: 'Almond Croissant',
            occurrences: Math.round(16 + Math.random() * 16), // 16-32 times
            lossAmount: Math.round(3200 + Math.random() * 1600), // ₹3,200-4,800
            wastedPercentage: Number((31 + Math.random() * 23).toFixed(1)), // 31-54%
        },
        {
            name: 'Chocolate Hazelnut Croissant',
            occurrences: Math.round(19 + Math.random() * 14), // 19-33 times
            lossAmount: Math.round(2900 + Math.random() * 1400), // ₹2,900-4,300
            wastedPercentage: Number((28 + Math.random() * 20).toFixed(1)), // 28-48%
        },
        {
            name: 'Korean Bun',
            occurrences: Math.round(25 + Math.random() * 10), // 25-35 times
            lossAmount: Math.round(1500 + Math.random() * 900), // ₹1,500-2,400
            wastedPercentage: Number((15 + Math.random() * 15).toFixed(1)), // 15-30%
        },
        {
            name: 'Mushroom Cream Cheese Croissata',
            occurrences: Math.round(20 + Math.random() * 13), // 20-33 times
            lossAmount: Math.round(2100 + Math.random() * 1200), // ₹2,100-3,300
            wastedPercentage: Number((21 + Math.random() * 18).toFixed(1)), // 21-39%
        },
        {
            name: 'Roasted Tomato Croissata',
            occurrences: Math.round(17 + Math.random() * 15), // 17-32 times
            lossAmount: Math.round(2300 + Math.random() * 1300), // ₹2,300-3,600
            wastedPercentage: Number((24 + Math.random() * 19).toFixed(1)), // 24-43%
        },
    ];

    // Return top 5 sorted by loss amount
    return worstItems.sort((a, b) => b.lossAmount - a.lossAmount).slice(0, 5);
};

// ===== Waste Heatmap Data =====
export interface HeatmapCell {
    week: number; // 1-4
    dayOfWeek: number; // 0-6 (Mon=0, Sun=6)
    dayName: string;
    wastePercentage: number;
    intensity: number; // 0-1 for color scaling
}

export const generateWasteHeatmap = (): HeatmapCell[] => {
    const heatmap: HeatmapCell[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Generate 28 days with GitHub-style variation
    for (let week = 0; week < 4; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            // Base waste with high variance (5-35%)
            let baseWaste = 8 + Math.random() * 15; // 8-23% base
            
            // Weekend pattern (Sat/Sun have higher waste)
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            if (isWeekend) {
                baseWaste += 5 + Math.random() * 10; // +5-15% on weekends
            }
            
            // Random "hot spots" like GitHub (some days just have way more waste)
            const hotSpotChance = Math.random();
            if (hotSpotChance > 0.85) {
                // 15% chance of high waste day
                baseWaste += 10 + Math.random() * 15; // Spike
            } else if (hotSpotChance < 0.15) {
                // 15% chance of very low waste day
                baseWaste = 3 + Math.random() * 5; // Very low
            }
            
            // Mid-week dip (Wed-Thu sometimes lower)
            if (dayOfWeek === 2 || dayOfWeek === 3) {
                if (Math.random() > 0.6) {
                    baseWaste *= 0.7; // 40% chance of reduction
                }
            }
            
            // Occasional "dead days" with minimal waste
            if (Math.random() > 0.92) {
                baseWaste = 2 + Math.random() * 3; // Very minimal waste
            }
            
            // Clamp to reasonable range
            const wastePercentage = Math.max(2, Math.min(40, baseWaste));

            heatmap.push({
                week: week + 1,
                dayOfWeek,
                dayName: dayNames[dayOfWeek],
                wastePercentage: Number(wastePercentage.toFixed(1)),
                intensity: Math.min(wastePercentage / 40, 1), // Normalize to 0-1, max at 40%
            });
        }
    }

    return heatmap;
};
