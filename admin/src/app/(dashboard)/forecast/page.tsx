"use client";

import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    menuItems,
    dailyStats,
    generate7DayForecast,
    calculateForecastStats,
    calculateMaterialForecast,
    generateWasteHeatmap,
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
    const stats = useMemo(() => calculateForecastStats(), []);
    const materials = useMemo(() => calculateMaterialForecast(), []);
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
                                    <p className="text-2xl font-bold text-accent">
                                        {stats.avgWasteReduction > 0 ? '+' : ''}{stats.avgWasteReduction}%
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">vs last month</p>
                                </div>
                                <div className="p-2 bg-accent/20 rounded-lg">
                                    <Leaf className="w-5 h-5 text-accent" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Money Saved</p>
                                    <p className="text-2xl font-bold text-pink">
                                        {formatCurrency(stats.totalMoneySaved)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">last 30 days</p>
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
                                    <p className="text-sm text-muted-foreground font-serif mb-2">Prediction Accuracy</p>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.predictionAccuracy.toFixed(0)}%
                                    </p>
                                    <p className="text-xs text-accent mt-2">ML model confidence</p>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Target className="w-5 h-5 text-white" />
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
                                    <Calendar className="w-4 h-4 text-accent" />
                                    7-Day Demand Forecast
                                </CardTitle>
                                <Badge className={`border-0 text-xs ${trend.direction === 'up' ? 'bg-accent/20 text-accent' : trend.direction === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'}`}>
                                    <TrendIcon className="w-3 h-3 mr-1" />
                                    {trend.direction === 'stable' ? 'Stable' : trend.slope > 0 ? `+${trend.slope}` : trend.slope}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-end justify-between gap-2" style={{ height: '180px' }}>
                                {forecast.map((day, idx) => {
                                    const maxDemand = Math.max(...forecast.map(f => f.upperBound));
                                    const heightPercent = (day.predictedDemand / maxDemand) * 100;
                                    const barHeight = Math.max((heightPercent / 100) * 140, 20);
                                    const confHeight = ((day.upperBound - day.lowerBound) / maxDemand) * 140;

                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-2 h-full group">
                                            <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-white font-medium block">
                                                    {day.predictedDemand}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    ±{Math.round((day.upperBound - day.lowerBound) / 2)}
                                                </span>
                                            </div>
                                            <div className="relative w-full flex justify-center">
                                                {/* Confidence interval */}
                                                <div
                                                    className="absolute bg-accent/10 rounded-md w-3/4"
                                                    style={{
                                                        height: `${confHeight}px`,
                                                        bottom: `${barHeight - confHeight / 2}px`,
                                                    }}
                                                />
                                                {/* Main bar */}
                                                <div
                                                    className="w-full bg-gradient-to-t from-leaf-dark to-accent rounded-md transition-all hover:scale-105 relative z-10"
                                                    style={{ height: `${barHeight}px` }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs text-white font-medium">{day.dayName}</span>
                                                <span className="text-[10px] text-muted-foreground block">
                                                    {day.confidence}%
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
                                30-Day Historical Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-end justify-between gap-0.5" style={{ height: '180px' }}>
                                {last30Days.map((day, idx) => {
                                    const maxRevenue = Math.max(...last30Days.map(d => d.totalRevenue));
                                    const heightPercent = (day.totalRevenue / maxRevenue) * 100;
                                    const barHeight = Math.max((heightPercent / 100) * 140, 4);
                                    const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

                                    return (
                                        <div
                                            key={day.date}
                                            className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                                            title={`${day.date}: ₹${day.totalRevenue} | Waste: ${day.wastePercentage}%`}
                                        >
                                            <div
                                                className={`w-full rounded-sm transition-all group-hover:opacity-80 ${isWeekend ? 'bg-gradient-to-t from-pink/60 to-pink' : 'bg-gradient-to-t from-pink/40 to-pink/80'}`}
                                                style={{ height: `${barHeight}px` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
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
                                Waste Heatmap (Day × Hour)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-1">
                                {/* Hour labels */}
                                <div className="flex gap-1 ml-12">
                                    {[7, 9, 11, 13, 15, 17, 19, 21].map(hour => (
                                        <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground">
                                            {hour}:00
                                        </div>
                                    ))}
                                </div>

                                {/* Heatmap grid */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dayIdx) => (
                                    <div key={dayName} className="flex gap-1 items-center">
                                        <span className="w-10 text-xs text-muted-foreground text-right pr-2">{dayName}</span>
                                        <div className="flex-1 flex gap-0.5">
                                            {heatmap
                                                .filter(h => h.dayOfWeek === dayIdx)
                                                .map((cell, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex-1 h-6 rounded-sm cursor-pointer transition-all hover:scale-105"
                                                        style={{
                                                            backgroundColor: `rgba(220, 38, 38, ${0.15 + cell.intensity * 0.6})`,
                                                        }}
                                                        title={`${cell.dayName} ${cell.hour}:00 - ${cell.wastePercentage}% waste`}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Legend */}
                                <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                                    <span>Less waste</span>
                                    <div className="flex gap-0.5">
                                        {[0.15, 0.3, 0.45, 0.6, 0.75].map((opacity, i) => (
                                            <div
                                                key={i}
                                                className="w-4 h-4 rounded-sm"
                                                style={{ backgroundColor: `rgba(220, 38, 38, ${opacity})` }}
                                            />
                                        ))}
                                    </div>
                                    <span>More waste</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Wasted Items */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                Top Wasted Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-3">
                                {stats.topWastedItems.map((item, idx) => (
                                    <div key={item.name} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-white truncate max-w-[140px]">{item.name}</span>
                                                <span className="text-xs text-red-400">{item.wastePercentage}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                                    style={{ width: `${item.wastePercentage * 3}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5">
                                <p className="text-xs text-muted-foreground mb-2">Best Performing Days</p>
                                {stats.bestPerformingDays.map(day => (
                                    <div key={day.day} className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-3 h-3 text-accent" />
                                        <span className="text-white">{day.day}</span>
                                        <span className="text-muted-foreground text-xs">({day.wastePercentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Raw Materials Forecast */}
                <Card className="bg-spare-bg-light border-white/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-accent" />
                                Raw Materials Forecast (Next 7 Days)
                            </CardTitle>
                            <Badge className="bg-accent/20 text-accent border-0 text-xs">
                                {materials.filter(m => m.needsReorder).length} items need reorder
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Material</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Current Stock</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">7-Day Usage</th>
                                        <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Cost</th>
                                        <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.slice(0, 10).map((material) => (
                                        <tr key={material.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                                            <td className="px-6 py-3">
                                                <span className="text-sm text-white">{material.name}</span>
                                            </td>
                                            <td className="text-right px-4 py-3">
                                                <span className="text-sm text-muted-foreground">
                                                    {material.currentStock.toLocaleString()} {material.unit}
                                                </span>
                                            </td>
                                            <td className="text-right px-4 py-3">
                                                <span className="text-sm text-white">
                                                    {material.forecastedUsage7Days.toLocaleString()} {material.unit}
                                                </span>
                                            </td>
                                            <td className="text-right px-4 py-3">
                                                <span className="text-sm text-pink">{formatCurrency(material.costFor7Days)}</span>
                                            </td>
                                            <td className="text-center px-4 py-3">
                                                {material.needsReorder ? (
                                                    <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">
                                                        <ArrowDownRight className="w-3 h-3 mr-1" />
                                                        Reorder
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-accent/20 text-accent border-0 text-xs">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        OK
                                                    </Badge>
                                                )}
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
