import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    // Add or update item in cart (preference-based)
    const addToCart = useCallback((bagOption, quantity, preference, restaurant) => {
        // Include preference in item ID to allow multiple preferences
        const itemId = `${restaurant.id}-${bagOption.id || bagOption.role}-${preference}`;

        setItems((prevItems) => {
            // Enforce single restaurant: if adding from a different restaurant, clear first
            if (prevItems.length > 0 && prevItems[0].restaurant.id !== restaurant.id) {
                return [
                    {
                        id: itemId,
                        bagOption,
                        quantity,
                        preference,
                        restaurant,
                        addedAt: Date.now(),
                    },
                ];
            }

            const existingIndex = prevItems.findIndex((item) => item.id === itemId);

            if (existingIndex >= 0) {
                // Update existing item
                const updated = [...prevItems];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity,
                    preference,
                };
                return updated;
            } else {
                // Add new item
                return [
                    ...prevItems,
                    {
                        id: itemId,
                        bagOption,
                        quantity,
                        preference,
                        restaurant,
                        addedAt: Date.now(),
                    },
                ];
            }
        });
    }, []);

    // Remove item from cart
    const removeFromCart = useCallback((itemId) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }, []);

    // Update item quantity
    const updateQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeFromCart]);

    // Clear entire cart
    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    // Get cart total
    const getCartTotal = useCallback(() => {
        return items.reduce((total, item) => {
            return total + (item.bagOption.price * item.quantity);
        }, 0);
    }, [items]);

    // Get total item count
    const getCartItemCount = useCallback(() => {
        return items.reduce((count, item) => count + item.quantity, 0);
    }, [items]);

    // Check if item is in cart (with preference)
    const isInCart = useCallback((restaurantId, bagOptionId, preference) => {
        const itemId = `${restaurantId}-${bagOptionId}-${preference}`;
        return items.some((item) => item.id === itemId);
    }, [items]);

    // Get item from cart (with preference)
    const getCartItem = useCallback((restaurantId, bagOptionId, preference) => {
        const itemId = `${restaurantId}-${bagOptionId}-${preference}`;
        return items.find((item) => item.id === itemId);
    }, [items]);

    // Get count of items for a specific preference (optionally filtered by restaurant)
    const getItemCountByPreference = useCallback((preference, restaurantId = null) => {
        return items
            .filter((item) => {
                const preferenceMatch = item.preference === preference;
                const restaurantMatch = restaurantId ? item.restaurant.id === restaurantId : true;
                return preferenceMatch && restaurantMatch;
            })
            .reduce((count, item) => count + item.quantity, 0);
    }, [items]);

    const value = {
        items,
        cartRestaurant: items[0]?.restaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isInCart,
        getCartItem,
        getItemCountByPreference,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
