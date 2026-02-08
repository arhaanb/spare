"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    mockRestaurantStats,
    mockDailyStats,
    mockOrders,
    formatCurrency,
    getCategoryLabel
} from "@/lib/mockData";
import {
    TrendingUp,
    Clock,
    ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getTodaysRescueBags, TodaysRescueBagsStats } from "@/lib/api/backend-api";

export default function DashboardPage() {
    const { user } = useAuth();
    const stats = mockRestaurantStats;
    const recentOrders = mockOrders.slice(0, 5);
    
    const [rescueBagsData, setRescueBagsData] = useState<TodaysRescueBagsStats | null>(null);
    const [isLoadingBags, setIsLoadingBags] = useState(true);

    useEffect(() => {
        if (user?.merchantId) {
            loadTodaysRescueBags();
        }
    }, [user]);

    const loadTodaysRescueBags = async () => {
        if (!user?.merchantId) return;
        
        setIsLoadingBags(true);
        try {
            const data = await getTodaysRescueBags(user.merchantId);
            setRescueBagsData(data);
        } catch (error) {
            console.error('Failed to load rescue bags:', error);
            // Set empty data on error
            setRescueBagsData({
                available: 0,
                sold: 0,
                pending_pickup: 0,
                bags: []
            });
        } finally {
            setIsLoadingBags(false);
        }
    };

    const getBagTypeLabel = (bagType: string): string => {
        const labels: Record<string, string> = {
            'regular_veg': 'Regular Veg',
            'regular_non_veg': 'Regular Non-Veg',
            'large_veg': 'Large Veg',
            'large_non_veg': 'Large Non-Veg'
        };
        return labels[bagType] || bagType;
    };

    const countItemsInBag = (bag: any): number => {
        return bag.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    };

    return (
        <>
            <Header
                title="Dashboard"
                subtitle="Today's overview for your restaurant"
            />

            <div className="p-6 space-y-6">
                {/* Stats Grid - Consistent serif labels, sans values */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground font-serif mb-2">Today's Revenue</p>
                            <p className="text-2xl font-bold text-pink">
                                {formatCurrency(stats.todayRevenue)}
                            </p>
                            <p className="text-xs text-accent mt-2">
                                +{stats.revenueChange}% from yesterday
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground font-serif mb-2">Bags Sold Today</p>
                            <p className="text-2xl font-bold text-white">{stats.bagsSoldToday}</p>
                            <p className="text-xs text-accent mt-2">
                                +{stats.bagsChange}% from yesterday
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground font-serif mb-2">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-400">{stats.averageRating.toFixed(1)}</p>
                            <p className="text-xs text-accent mt-2">
                                +{stats.ratingChange} this week
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-spare-bg-light border-white/5">
                        <CardContent className="p-5">
                            <p className="text-sm text-muted-foreground font-serif mb-2">Waste Saved</p>
                            <p className="text-2xl font-bold text-accent">{stats.wasteSaved} kg</p>
                            <p className="text-xs text-accent mt-2">
                                +{stats.wasteChange}% this week
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section - Improved layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-white">Revenue (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="flex items-end justify-between gap-2" style={{ height: '160px' }}>
                                {mockDailyStats.map((stat) => {
                                    const maxRevenue = Math.max(...mockDailyStats.map(s => s.revenue));
                                    const heightPercent = (stat.revenue / maxRevenue) * 100;
                                    const barHeight = Math.max((heightPercent / 100) * 120, 8); // 120px max bar height, 8px min
                                    return (
                                        <div key={stat.date} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                ₹{stat.revenue.toLocaleString()}
                                            </span>
                                            <div
                                                className="w-full bg-gradient-to-t from-leaf-dark to-accent rounded-md transition-all hover:opacity-80 hover:scale-105"
                                                style={{ height: `${barHeight}px` }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(stat.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Bags - Real data from MongoDB */}
                    <Card className="bg-spare-bg-light border-white/5">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-medium text-white">Today's Rescue Bags</CardTitle>
                                <Link
                                    href="/rescue-flow"
                                    className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
                                >
                                    Manage <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {isLoadingBags ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </div>
                            ) : rescueBagsData ? (
                                <>
                                    {/* Summary stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/5">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-accent">{rescueBagsData.available}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Available</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-pink">{rescueBagsData.sold}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Sold</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-yellow-500">{rescueBagsData.pending_pickup}</p>
                                            <p className="text-xs text-muted-foreground mt-1">Pending Pickup</p>
                                        </div>
                                    </div>

                                    {/* Available bags list */}
                                    <div className="space-y-2">
                                        {rescueBagsData.bags.length > 0 ? (
                                            rescueBagsData.bags.slice(0, 3).map((bag, index) => (
                                                <div key={index} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{getBagTypeLabel(bag.bag_type)}</p>
                                                        <p className="text-xs text-muted-foreground">{countItemsInBag(bag)} items</p>
                                                    </div>
                                                    <Badge className="bg-accent/20 text-accent border-0 text-xs">
                                                        ₹{bag.target_price}
                                                    </Badge>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-muted-foreground mb-2">No bags created yet</p>
                                                <Link
                                                    href="/rescue-flow"
                                                    className="text-xs text-accent hover:text-accent-hover"
                                                >
                                                    Create your first rescue bags →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Failed to load rescue bags</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card className="bg-spare-bg-light border-white/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium text-white">Recent Pickups</CardTitle>
                            <Link href="/orders" className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 transition-colors">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink/20 to-accent/20 flex items-center justify-center">
                                            <span className="text-sm font-medium text-accent">
                                                {order.consumerName.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-white text-sm">{order.consumerName}</p>
                                            <p className="text-xs text-pink">{getCategoryLabel(order.bagCategory)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            <p className="font-semibold text-accent text-sm">{formatCurrency(order.price)}</p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.pickupTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <Badge
                                            className={
                                                order.status === 'picked_up' ? 'bg-green-500/20 text-green-500 border-0 text-xs' :
                                                    order.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-500 border-0 text-xs' :
                                                        order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-500 border-0 text-xs' :
                                                            'bg-gray-500/20 text-gray-500 border-0 text-xs'
                                            }
                                        >
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
