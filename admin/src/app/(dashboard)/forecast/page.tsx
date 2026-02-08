"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    menuItems,
    dailyStats,
    generate7DayForecast,
    generateXGBoostWasteForecast,
    calculateForecastStats,
    calculateMaterialForecast,
    generateWasteHeatmap,
    generateWorstPerformingItems,
    calculateTrend,
    dayOfWeekMultipliers,
} from "@/lib/forecastData";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Leaf,
    DollarSign,
    Target,
    Package,
    AlertTriangle,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Clock,
} from "lucide-react";
import { useMemo } from "react";

export default function ForecastPage() {
    // Memoize expensive calculations
    const forecast = useMemo(() => generate7DayForecast(), []);
    const wasteForecast = useMemo(() => generateXGBoostWasteForecast(), []);
    const stats = useMemo(() => calculateForecastStats(), []);
    const worstItems = useMemo(() => generateWorstPerformingItems(), []);
    const heatmap = useMemo(() => generateWasteHeatmap(), []);
    const trend = useMemo(() => calculateTrend(), []);

    const last7Days = dailyStats.slice(-7);
    const last30Days = dailyStats.slice(-30);

    // Format currency helper
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
        }).format(amount);

    // Trend icon helper
    const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Minus;

    return (
        <>
            <Header
                title="Demand Forecast"
                subtitle="AI-powered predictions to reduce food waste"
            />

            <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Waste Reduction</p>
                                    <p className={`text-2xl font-bold ${stats.avgWasteReduction > 0 ? 'text-accent' : 'text-red-400'}`}>
                                        {stats.avgWasteReduction > 0 ? '+' : ''}{stats.avgWasteReduction}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        {stats.avgWasteReduction > 0 ? (
                                            <>
                                                <TrendingUp className="w-3 h-3 text-accent" />
                                                <span>vs last 30 days</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="w-3 h-3 text-red-400" />
                                                <span>vs last 30 days</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${stats.avgWasteReduction > 0 ? 'bg-accent/20' : 'bg-red-500/20'}`}>
                                    <Leaf className={`w-5 h-5 ${stats.avgWasteReduction > 0 ? 'text-accent' : 'text-red-400'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Money Saved</p>
                                    <p className="text-2xl font-bold text-pink">
                                        {formatCurrency(stats.totalMoneySaved)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {stats.bagsCreated} bags
                                        </span>
                                        <span>•</span>
                                        <span>{formatCurrency(stats.avgMoneyPerDay)}/day</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-pink/20 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-pink" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Bags Sold</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.bagsSold}
                                    </p>
                                    <p className="text-xs text-accent mt-2">{stats.bagsCreated} bags created</p>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Carbon Offset</p>
                                    <p className="text-2xl font-bold text-leaf-light">
                                        {stats.totalCarbonSaved} kg
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">CO₂ equivalent saved</p>
                                </div>
                                <div className="p-2 bg-leaf-light/20 rounded-lg">
                                    <Leaf className="w-5 h-5 text-leaf-light" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 7-Day Forecast */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                    <Package className="w-4 h-4 text-orange-400" />
                                    14-Day Rescue Bags Forecast
                                </CardTitle>
                                <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                                    ~{wasteForecast.reduce((sum, f) => sum + f.predictedBagCount, 0)} bags total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex items-end justify-between gap-2" style={{ height: '180px' }}>
                                {wasteForecast.map((day, idx) => {
                                    const maxBags = Math.max(...wasteForecast.map(f => f.predictedBagCount));
                                    const heightPercent = (day.predictedBagCount / maxBags) * 100;
                                    const barHeight = Math.max((heightPercent / 100) * 130, 40);

                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                                            {/* Bag count on top of bar */}
                                            <div className="text-center mb-1">
                                                <span className="text-sm text-white font-medium">
                                                    {day.predictedBagCount}
                                                </span>
                                            </div>
                                            {/* Bar */}
                                            <div className="relative w-full flex flex-col items-center justify-end">
                                                <div
                                                    className="w-full bg-gradient-to-t from-leaf-dark to-accent rounded-lg"
                                                    style={{ height: `${barHeight}px` }}
                                                />
                                            </div>
                                            {/* Day label */}
                                            <div className="text-center mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {forecast[idx % 7].dayName}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Historical Trend */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-pink" />
                                Past 30 Days Rescue Bags Made
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex gap-2">
                                {/* Y-axis - 0 to 10 in increments of 2 */}
                                <div className="flex flex-col justify-between text-right pr-2" style={{ height: '180px' }}>
                                    {[10, 8, 6, 4, 2, 0].map((value, i) => (
                                        <span key={i} className="text-[10px] text-muted-foreground leading-none">
                                            {value}
                                        </span>
                                    ))}
                                </div>
                                {/* Chart area with grid lines */}
                                <div className="flex-1 relative">
                                    {/* Horizontal grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="border-t border-white/5" />
                                        ))}
                                    </div>
                                    {/* Bars */}
                                    <div className="relative flex items-end justify-between gap-0.5" style={{ height: '180px' }}>
                                        {last30Days.map((day, idx) => {
                                            // Max scale is 10
                                            const maxScale = 10;
                                            const clampedBags = Math.min(day.bagsCreated, maxScale);
                                            const heightPercent = (clampedBags / maxScale) * 100;
                                            const barHeight = Math.max((heightPercent / 100) * 180, 4);
                                            const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                                            return (
                                                <div
                                                    key={day.date}
                                                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                                                    title={`${day.date}: ${day.bagsCreated} bags | Waste: ${day.wastePercentage}%`}
                                                >
                                                    <div
                                                        className={`w-full rounded-sm transition-all group-hover:opacity-80 ${isWeekend ? 'bg-gradient-to-t from-pink/60 to-pink' : 'bg-gradient-to-t from-pink/40 to-pink/80'}`}
                                                        style={{ height: `${barHeight}px` }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 ml-8 text-xs text-muted-foreground">
                                <span>30 days ago</span>
                                <span>Today</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Waste Heatmap & Top Items */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Waste Heatmap */}
                    <Card className="bg-spare-bg-light border-white/5 lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                Waste Heatmap (Last 4 Weeks)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-1">
                                {/* Day labels */}
                                <div className="flex gap-1 ml-16">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <div key={day} className="flex-1 text-center text-[10px] text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Heatmap grid */}
                                {[1, 2, 3, 4].map((week) => (
                                    <div key={week} className="flex gap-1 items-center">
                                        <span className="w-14 text-xs text-muted-foreground text-right pr-2">Week {week}</span>
                                        <div className="flex-1 flex gap-0.5">
                                            {heatmap
                                                .filter(h => h.week === week)
                                                .map((cell, idx) => {
                                                    // 3-color system with equal divisions - full opacity:
                                                    // Low (0-0.33): Yellow #CEB810
                                                    // Medium (0.33-0.66): Orange #CE7F10
                                                    // High (0.66-1.0): Red #CE3310
                                                    let bgColor;
                                                    if (cell.intensity < 0.33) {
                                                        // Yellow - low waste
                                                        bgColor = '#CEB810';
                                                    } else if (cell.intensity < 0.66) {
                                                        // Orange - medium waste
                                                        bgColor = '#CE7F10';
                                                    } else {
                                                        // Red - high waste
                                                        bgColor = '#CE3310';
                                                    }
                                                    
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="flex-1 h-12 rounded-sm cursor-pointer transition-all hover:scale-105 hover:ring-2 hover:ring-orange-400"
                                                            style={{
                                                                backgroundColor: bgColor,
                                                            }}
                                                            title={`Week ${cell.week} ${cell.dayName} - ${cell.wastePercentage}% waste`}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}

                                {/* Legend */}
                                <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                                    <span>Less waste</span>
                                    <div className="flex gap-0.5">
                                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#CEB810' }} />
                                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#CE7F10' }} />
                                        <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#CE3310' }} />
                                    </div>
                                    <span>More waste</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Surplus Items */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-orange-400" />
                                Top Surplus Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-3">
                                {stats.topWastedItems.map((item, idx) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-white truncate max-w-[120px]">{item.name}</span>
                                                <span className="text-xs text-red-400">{item.wastePercentage}%</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                                <span>{item.occurrences} times in 30 days</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                                    style={{ width: `${item.wastePercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Worst Performing Items */}
                <Card className="bg-spare-bg-light border-white/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                Worst Performing Items
                            </CardTitle>
                            <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                                Last 30 days
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Item</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Loss (INR)</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Wasted %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {worstItems.map((item) => (
                                        <tr key={item.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                            <td className="px-6 py-3">
                                                <div>
                                                    <span className="text-sm text-white block">{item.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{item.occurrences} times in 30 days</span>
                                                </div>
                                            </td>
                                            <td className="text-right px-4 py-3">
                                                <span className="text-sm text-red-400">{formatCurrency(item.lossAmount)}</span>
                                            </td>
                                            <td className="text-right px-4 py-3">
                                                <span className="text-sm text-orange-400">{item.wastedPercentage}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Day of Week Pattern */}
                <Card className="bg-spare-bg-light border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-white">Day of Week Demand Pattern</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="grid grid-cols-7 gap-3">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                                const multiplier = dayOfWeekMultipliers[idx];
                                const isHigh = multiplier >= 1.2;
                                const isLow = multiplier <= 0.9;

                                return (
                                    <div key={day} className="text-center">
                                        <div
                                            className={`rounded-lg p-4 mb-2 transition-all ${isHigh ? 'bg-accent/20' : isLow ? 'bg-red-500/10' : 'bg-white/5'}`}
                                        >
                                            <span className={`text-2xl font-bold ${isHigh ? 'text-accent' : isLow ? 'text-red-400' : 'text-white'}`}>
                                                {(multiplier * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{day}</span>
                                        {isHigh && <ArrowUpRight className="w-4 h-4 text-accent mx-auto mt-1" />}
                                        {isLow && <ArrowDownRight className="w-4 h-4 text-red-400 mx-auto mt-1" />}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Relative demand compared to weekly average. Plan prep quantities accordingly.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
