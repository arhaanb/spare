import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';

import { navigationRef } from '../navigation/navigationRef';
import { useOrder } from '../context/OrderContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CartIndicator = ({ currentRouteName }) => {
    const insets = useSafeAreaInsets();
    const { items, cartRestaurant, getCartTotal, getCartItemCount, clearCart } = useCart();
    const { hasActiveOrder } = useOrder();

    const translateY = useSharedValue(200);
    const scale = useSharedValue(1);
    const priceOpacity = useSharedValue(1);
    const countOpacity = useSharedValue(1);
    const countScale = useSharedValue(1);
    const priceScale = useSharedValue(1);
    const buttonScale = useSharedValue(1);

    const itemCount = getCartItemCount();
    const total = getCartTotal();
    const hasItems = itemCount > 0;

    // Slide up when items added - elegant entry
    useEffect(() => {
        if (hasItems) {
            translateY.value = withSpring(0, { damping: 24, stiffness: 200, mass: 1 });
        } else {
            translateY.value = withTiming(200, { duration: 280, easing: Easing.bezier(0.4, 0, 0.6, 1) });
        }
    }, [hasItems, translateY]);

    // Just update without bounce
    useEffect(() => {
        if (hasItems) {
            scale.value = 1;
            countOpacity.value = 1;
            countScale.value = 1;
        }
    }, [itemCount, scale, countOpacity, countScale]);

    // Update price without animation
    useEffect(() => {
        if (hasItems) {
            priceOpacity.value = 1;
            priceScale.value = 1;
        }
    }, [total, priceOpacity, priceScale, hasItems]);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const priceStyle = useAnimatedStyle(() => ({
        opacity: priceOpacity.value,
        transform: [{ scale: priceScale.value }],
    }));

    const countStyle = useAnimatedStyle(() => ({
        opacity: countOpacity.value,
        transform: [{ scale: countScale.value }],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    // Hide if no items or if on checkout/cart screens
    const isHiddenScreen = ['Cart', 'OrderConfirmation', 'Login', 'Onboarding'].includes(currentRouteName);
    if (!hasItems || isHiddenScreen) return null;

    // Additional check: On RestaurantDetail, only show if it matches the current restaurant
    if (currentRouteName === 'RestaurantDetail' && navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        const currentRestaurantId = route?.params?.restaurant?.id;
        if (currentRestaurantId && cartRestaurant && cartRestaurant.id !== currentRestaurantId) {
            return null;
        }
    }

    // Determine bottom offset
    // If on Home (tab bar present), lift higher.
    // If GlobalActiveOrderIndicator is present, lift even higher to stack.
    const isTabScreen = ['Home'].includes(currentRouteName);
    let bottomOffset = insets.bottom + 8;

    if (isTabScreen) {
        bottomOffset = Platform.OS === 'ios' ? 105 : 85;
    }

    // Stack above Active Order Indicator if both visible
    if (hasActiveOrder) {
        bottomOffset += 72; // Height of banner + small gap
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { bottom: bottomOffset },
                containerStyle,
            ]}
        >
            <View style={styles.content}>
                {/* Item Count Badge */}
                <View style={styles.badge}>
                    <Animated.Text style={[styles.badgeText, countStyle]}>{itemCount}</Animated.Text>
                </View>

                {/* Total Price & Restaurant */}
                <View style={styles.priceContainer}>
                    {cartRestaurant && (
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {cartRestaurant.name}
                        </Text>
                    )}
                    <View style={styles.totalRow}>
                        {/* <Text style={styles.priceLabel}>Total: </Text> */}
                        <Animated.Text style={[styles.priceValue, priceStyle]}>
                            ₹{total}
                        </Animated.Text>
                    </View>
                </View>

                {/* Action Section: View Cart + Clear */}
                <View style={styles.actionSection}>
                    {/* Clear Button */}
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearCart}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-circle" size={28} color="rgba(10, 53, 34, 0.4)" />
                    </TouchableOpacity>


                    {/* View Cart Button */}
                    <AnimatedTouchable
                        style={[styles.button, buttonAnimatedStyle]}
                        activeOpacity={0.9}
                        onPressIn={() => {
                            buttonScale.value = withSpring(0.97, { damping: 18, stiffness: 320, mass: 0.7 });
                        }}
                        onPressOut={() => {
                            buttonScale.value = withSequence(
                                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
                            );
                        }}
                        onPress={() => {
                            if (navigationRef.isReady()) {
                                navigationRef.navigate('Cart');
                            }
                        }}
                    >
                        <Text style={styles.buttonText}>View Cart</Text>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
                    </AnimatedTouchable>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 9999, // Lower than active order but high enough
    },
    content: {
        backgroundColor: COLORS.activeCategory,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        ...SHADOWS.lg,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.activeCategory,
    },
    priceContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    restaurantName: {
        fontFamily: 'Saans',
        fontSize: 14,
        color: COLORS.background,
        opacity: 0.7,
        marginTop: -1,
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    priceLabel: {
        fontFamily: 'Saans-Bold',
        fontSize: 10,
        color: COLORS.background,
        opacity: 0.5,
        // letterSpacing: 1,
    },
    priceValue: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.xl,
        color: COLORS.background,
    },
    actionSection: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    clearButton: {
        padding: 2,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS.lg,
    },
    buttonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
    },
});

export default CartIndicator;
