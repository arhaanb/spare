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
    const [lockedPreference, setLockedPreference] = useState(null);

    // Add or update item in cart
    const addToCart = useCallback((bagOption, quantity, preference, restaurant) => {
        const itemId = `${restaurant.id}-${bagOption.id || bagOption.role}`;

        setItems((prevItems) => {
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

        // Lock preference on first item
        if (!lockedPreference) {
            setLockedPreference(preference);
        }
    }, [lockedPreference]);

    // Remove item from cart
    const removeFromCart = useCallback((itemId) => {
        setItems((prevItems) => {
            const filtered = prevItems.filter((item) => item.id !== itemId);

            // Unlock preference if cart becomes empty
            if (filtered.length === 0) {
                setLockedPreference(null);
            }

            return filtered;
        });
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
        setLockedPreference(null);
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

    // Check if item is in cart
    const isInCart = useCallback((restaurantId, bagOptionId) => {
        const itemId = `${restaurantId}-${bagOptionId}`;
        return items.some((item) => item.id === itemId);
    }, [items]);

    // Get item from cart
    const getCartItem = useCallback((restaurantId, bagOptionId) => {
        const itemId = `${restaurantId}-${bagOptionId}`;
        return items.find((item) => item.id === itemId);
    }, [items]);

    const value = {
        items,
        lockedPreference,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        isInCart,
        getCartItem,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
