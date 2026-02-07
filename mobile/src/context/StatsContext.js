import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Load stats from storage on mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const savedStats = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedStats) {
                    const parsed = JSON.parse(savedStats);
                    setStats({ ...DEFAULT_STATS, ...parsed });
                }
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, []);

    // Persist stats to storage
    const persistStats = useCallback(async (newStats) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }, []);

    // Record a new order and update stats
    const recordOrder = useCallback(async (itemCount, totalSpent) => {
        // Calculate estimated original price (totalSpent is the discounted price)
        // If we saved 60%, then totalSpent = 40% of original
        // So original = totalSpent / 0.4
        const estimatedOriginal = totalSpent / (1 - SAVINGS_RATIO);
        const savedAmount = estimatedOriginal - totalSpent;

        const newStats = {
            bagsRescued: stats.bagsRescued + itemCount,
            moneySaved: stats.moneySaved + savedAmount,
            carbonOffset: stats.carbonOffset + (itemCount * CARBON_PER_BAG),
            foodSaved: stats.foodSaved + (itemCount * FOOD_PER_BAG),
            ordersCount: stats.ordersCount + 1,
        };

        setStats(newStats);
        await persistStats(newStats);
    }, [stats, persistStats]);

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
