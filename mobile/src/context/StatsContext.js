import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { useAuth } from './AuthContext';

const StatsContext = createContext();

const STORAGE_KEY = '@user_stats';

// Default stats for new users
const DEFAULT_STATS = {
    bagsRescued: 0,
    moneySaved: 0,      // in rupees
    carbonOffset: 0,    // in kg CO2
    foodSaved: 0,       // in kg
    ordersCount: 0,
};

// Estimation constants (per bag)
const CARBON_PER_BAG = 0.5;  // kg CO2 saved per bag
const FOOD_PER_BAG = 0.1;    // kg food saved per bag
const SAVINGS_RATIO = 0.6;   // 60% savings on original price

export const useStats = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
};

export const StatsProvider = ({ children }) => {
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [isLoading, setIsLoading] = useState(true);
    const { signedIn } = useAuth(); // We need auth state

    // Load stats from storage OR API on mount/login
    useEffect(() => {
        const loadStats = async () => {
            try {
                // 1. Load local first (fast)
                const savedStats = await AsyncStorage.getItem(STORAGE_KEY);
                let localStats = DEFAULT_STATS;
                if (savedStats) {
                    localStats = JSON.parse(savedStats);
                    setStats(localStats); // Optimistic load
                }

                // 2. Load from API if signed in (source of truth)
                if (signedIn) {
                    try {
                        const { data } = await client.get('/user/stats');
                        if (data.success && data.data) {
                            // Merge logic: server usually wins, or max?
                            // Let's trust server if it has data.
                            // Actually, simplistic approach: Server is master.
                            // If server is 0 and local is > 0, we might want to push local to server?
                            // For now, let's assume server sync.
                            // But if server is empty (0) and we have local data from offline usage, 
                            // we should probably keep local.

                            const serverStats = data.data;
                            if (serverStats.ordersCount >= localStats.ordersCount) {
                                setStats(serverStats);
                                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverStats));
                            } else {
                                // Local is ahead (e.g. offline orders), push to server?
                                // For simplicity, let's just stick with local and push it next time an order happens, 
                                // OR push it right now.
                                syncStatsToApi(localStats);
                            }
                        }
                    } catch (apiErr) {
                        console.log('API Stats fetch failed, using local', apiErr);
                    }
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [signedIn]);

    // Helper to sync to API
    const syncStatsToApi = async (currentStats) => {
        if (!signedIn) return;
        try {
            await client.post('/user/stats', currentStats);
        } catch (error) {
            console.error('Error syncing stats to API:', error);
        }
    };

    // Persist stats to storage
    const persistStats = useCallback(async (newStats) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
            // Also sync to API
            syncStatsToApi(newStats);
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }, [signedIn]);

    // Record a new order and update stats
    const recordOrder = useCallback(async (itemCount, totalSpent) => {
        // Calculate estimated original price (totalSpent is the discounted price)
        // If we saved 60%, then totalSpent = 40% of original
        // So original = totalSpent / 0.4
        const estimatedOriginal = totalSpent / (1 - SAVINGS_RATIO);
        const savedAmount = estimatedOriginal - totalSpent;

        setStats(prevStats => {
            const newStats = {
                bagsRescued: prevStats.bagsRescued + itemCount,
                moneySaved: prevStats.moneySaved + savedAmount,
                carbonOffset: prevStats.carbonOffset + (itemCount * CARBON_PER_BAG),
                foodSaved: prevStats.foodSaved + (itemCount * FOOD_PER_BAG),
                ordersCount: prevStats.ordersCount + 1,
            };

            // Persist (and sync)
            persistStats(newStats);

            return newStats;
        });
    }, [persistStats]);

    // Reset all stats (for logout)
    const resetStats = useCallback(async () => {
        setStats(DEFAULT_STATS);
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error resetting stats:', error);
        }
    }, []);

    // Format money saved for display
    const formatMoneySaved = useCallback(() => {
        if (stats.moneySaved >= 1000) {
            return `₹${(stats.moneySaved / 1000).toFixed(1)}k`;
        }
        return `₹${Math.round(stats.moneySaved)}`;
    }, [stats.moneySaved]);

    const value = {
        stats,
        isLoading,
        recordOrder,
        resetStats,
        formatMoneySaved,
    };

    return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};
