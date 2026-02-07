import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CartIndicator = ({ onPress }) => {
    const insets = useSafeAreaInsets();
    const { items, getCartTotal, getCartItemCount } = useCart();

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

    if (!hasItems) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { bottom: insets.bottom + SPACING.md },
                containerStyle,
            ]}
        >
            <View style={styles.content}>
                {/* Item Count Badge */}
                <View style={styles.badge}>
                    <Animated.Text style={[styles.badgeText, countStyle]}>{itemCount}</Animated.Text>
                </View>

                {/* Total Price */}
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Total</Text>
                    <Animated.Text style={[styles.priceValue, priceStyle]}>
                        ₹{total}
                    </Animated.Text>
                </View>

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
                    onPress={onPress}
                >
                    <Text style={styles.buttonText}>View Cart</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
                </AnimatedTouchable>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 1000,
    },
    content: {
        backgroundColor: COLORS.activeCategory,
        borderRadius: BORDER_RADIUS.xl,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        ...SHADOWS.lg,
        elevation: 8,
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
    },
    priceLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.xs,
        color: COLORS.background,
        opacity: 0.8,
    },
    priceValue: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.xl,
        color: COLORS.background,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    buttonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
    },
});

export default CartIndicator;
