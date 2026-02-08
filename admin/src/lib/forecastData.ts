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

            // Restaurants typically prepare 10-20% more than expected
            const overPrepFactor = 1.1 + Math.random() * 0.15;
            const quantityPrepared = Math.round(actualDemand * overPrepFactor);

            // Actual sold is min of demand and prepared (with some variance)
            const quantitySold = Math.min(quantityPrepared, Math.round(actualDemand * (0.9 + Math.random() * 0.15)));
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
    totalCarbonSaved: number;
    predictionAccuracy: number;
    topWastedItems: Array<{ name: string; wastePercentage: number; quantity: number }>;
    bestPerformingDays: Array<{ day: string; wastePercentage: number }>;
    worstPerformingDays: Array<{ day: string; wastePercentage: number }>;
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

    // Calculate top wasted items
    const itemWaste: Record<string, { total: number; wasted: number }> = {};
    historicalSales.slice(-30 * menuItems.length).forEach(record => {
        if (!itemWaste[record.itemName]) {
            itemWaste[record.itemName] = { total: 0, wasted: 0 };
        }
        itemWaste[record.itemName].total += record.quantityPrepared;
        itemWaste[record.itemName].wasted += record.quantityWasted;
    });

    const topWastedItems = Object.entries(itemWaste)
        .map(([name, data]) => ({
            name,
            wastePercentage: data.total > 0 ? Number(((data.wasted / data.total) * 100).toFixed(1)) : 0,
            quantity: data.wasted,
        }))
        .sort((a, b) => b.wastePercentage - a.wastePercentage)
        .slice(0, 5);

    // Day performance
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayPerformance = dayNames.map((day, i) => {
        const dayData = last30Days.filter(d => d.dayOfWeek === i);
        const avgWaste = dayData.length > 0
            ? dayData.reduce((sum, d) => sum + d.wastePercentage, 0) / dayData.length
            : 0;
        return { day, wastePercentage: Number(avgWaste.toFixed(1)) };
    });

    const sortedByWaste = [...dayPerformance].sort((a, b) => a.wastePercentage - b.wastePercentage);

    return {
        avgWasteReduction: Number(wasteReduction.toFixed(1)),
        totalMoneySaved: Math.round(totalMoneySaved),
        totalCarbonSaved: Number(totalCarbonSaved.toFixed(1)),
        predictionAccuracy: 82 + Math.random() * 8, // Simulated accuracy 82-90%
        topWastedItems,
        bestPerformingDays: sortedByWaste.slice(0, 2),
        worstPerformingDays: sortedByWaste.slice(-2).reverse(),
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

// ===== Waste Heatmap Data =====
export interface HeatmapCell {
    dayOfWeek: number;
    dayName: string;
    hour: number;
    wastePercentage: number;
    intensity: number; // 0-1 for color scaling
}

export const generateWasteHeatmap = (): HeatmapCell[] => {
    const heatmap: HeatmapCell[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let day = 0; day < 7; day++) {
        for (let hour = 7; hour <= 21; hour++) {
            // Generate realistic waste patterns
            let baseWaste = 12; // Base waste percentage

            // Higher waste at end of day
            if (hour >= 19) baseWaste += 8;

            // Higher waste on slower days
            if (day === 1 || day === 2) baseWaste += 4;

            // Lower waste during peak hours
            if (hour >= 8 && hour <= 10) baseWaste -= 3;
            if (hour >= 12 && hour <= 13) baseWaste -= 2;

            // Add random variance
            const variance = (Math.random() - 0.5) * 6;
            const wastePercentage = Math.max(0, Math.min(30, baseWaste + variance));

            heatmap.push({
                dayOfWeek: day,
                dayName: dayNames[day],
                hour,
                wastePercentage: Number(wastePercentage.toFixed(1)),
                intensity: wastePercentage / 30, // Normalize to 0-1
            });
        }
    }

    return heatmap;
};
