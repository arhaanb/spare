import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const OrderContext = createContext();

const STORAGE_KEY = '@active_order';

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

// Order pickup window is 2 hours
const PICKUP_WINDOW_MS = 2 * 60 * 60 * 1000;

export const OrderProvider = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load order from storage on mount
    useEffect(() => {
        const loadOrder = async () => {
            try {
                const savedOrder = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedOrder) {
                    const parsed = JSON.parse(savedOrder);
                    // Reconstitute Date object
                    parsed.expiresAt = new Date(parsed.expiresAt);

                    // Check if already expired
                    if (Date.now() < parsed.expiresAt.getTime()) {
                        setActiveOrder(parsed);
                    } else {
                        await AsyncStorage.removeItem(STORAGE_KEY);
                    }
                }
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrder();
    }, []);

    // Create a new active order
    const createOrder = useCallback(async (orderCode, total, itemCount, restaurant, items) => {
        const now = Date.now();
        const expiresAt = new Date(now + PICKUP_WINDOW_MS);

        const newOrder = {
            orderCode,
            total,
            itemCount,
            restaurant,
            createdAt: now,
            expiresAt,
            status: 'active'
        };

        setActiveOrder(newOrder);

        try {
            // Save locally
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));

            // Send to API
            await client.post('/user/orders', {
                orderCode,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                items, // Pass the cart items
                total,
                itemCount,
                expiresAt: expiresAt.toISOString()
            });

        } catch (error) {
            console.error('Error creating order:', error);
            // We still proceed locally
        }
    }, []);

    // Mark order as complete/collected
    const completeOrder = useCallback(async () => {
        setActiveOrder(null);
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            // Optionally notify API of completion if endpoint existed
        } catch (error) {
            console.error('Error removing order:', error);
        }
    }, []);

    // Check if order has expired
    const isOrderExpired = useCallback(() => {
        if (!activeOrder) return false;
        return Date.now() > activeOrder.expiresAt.getTime();
    }, [activeOrder]);

    // Get time remaining until expiry
    const getTimeRemaining = useCallback(() => {
        if (!activeOrder) return 0;
        const remaining = activeOrder.expiresAt.getTime() - Date.now();
        return Math.max(0, remaining);
    }, [activeOrder]);

    const value = {
        activeOrder,
        isLoading,
        createOrder,
        completeOrder,
        isOrderExpired,
        getTimeRemaining,
        hasActiveOrder: !!activeOrder,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
