import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
    Image,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatPickupTime } from '../data/mockData';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const BagSelectionModal = ({ visible, bagOption, restaurant, preference, onClose, onAddToCart, initialQuantity = 0 }) => {
    const backdropOpacity = useSharedValue(0);
    const modalTranslateY = useSharedValue(500);
    const modalScale = useSharedValue(0.9);
    const [quantity, setQuantity] = React.useState(initialQuantity > 0 ? initialQuantity : 1);
    const [isClosing, setIsClosing] = React.useState(false);
    const prevBagOptionRef = React.useRef(null);
    const animationFrameRef = React.useRef(null);
    const shouldAnimateRef = React.useRef(false);
    const buttonScale = useSharedValue(1);
    const minusScale = useSharedValue(1);
    const plusScale = useSharedValue(1);
    const isItemInCart = initialQuantity > 0; // Track if item is already in cart

    useEffect(() => {
        if (visible) {
            // Only reset quantity if it's a different bag
            const bagId = bagOption?.id || bagOption?.role;
            const prevBagId = prevBagOptionRef.current?.id || prevBagOptionRef.current?.role;

            if (bagId !== prevBagId) {
                setQuantity(initialQuantity > 0 ? initialQuantity : 1);
            }

            prevBagOptionRef.current = bagOption;
            shouldAnimateRef.current = true;

            // Reset to initial positions first (synchronously)
            backdropOpacity.value = 0;
            modalTranslateY.value = 500;
            modalScale.value = 0.9;

            // Cancel any pending animation
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Small delay to ensure reset happens before animation
            animationFrameRef.current = requestAnimationFrame(() => {
                if (shouldAnimateRef.current) {
                    // Then animate in - elegant and smooth
                    backdropOpacity.value = withTiming(1, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
                    modalTranslateY.value = withSpring(0, { damping: 28, stiffness: 240, mass: 1 });
                    modalScale.value = withSpring(1, { damping: 26, stiffness: 220, mass: 0.9 });
                }
                animationFrameRef.current = null;
            });
        } else {
            shouldAnimateRef.current = false;
            // Cancel any pending animation when closing
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            // When modal is hidden, reset to closed state
            backdropOpacity.value = 0;
            modalTranslateY.value = 500;
            modalScale.value = 0.9;
        }
    }, [visible, bagOption, backdropOpacity, modalTranslateY, modalScale]);

    // Update quantity when initialQuantity changes (separate effect to avoid reopening modal)
    // Update quantity when initialQuantity changes (separate effect to avoid reopening modal)
    useEffect(() => {
        if (visible) {
            // When preference changes, the initialProperties prop changes, updating initialQuantity
            // We want to force update the local quantity state to match the new initialQuantity
            // This ensures if I select Veg (Qty 2) then Jain (Qty 0), it shows 1 instead of keeping 2
            setQuantity(initialQuantity > 0 ? initialQuantity : 1);
        }
    }, [initialQuantity, visible]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const modalStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: modalTranslateY.value },
            { scale: modalScale.value },
        ],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const minusAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: minusScale.value }],
    }));

    const plusAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: plusScale.value }],
    }));

    const handleBackdropPress = () => {
        backdropOpacity.value = withTiming(0, { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) });
        modalTranslateY.value = withTiming(300, { duration: 240, easing: Easing.bezier(0.4, 0, 0.6, 1) });
        modalScale.value = withTiming(0.95, {
            duration: 220,
            easing: Easing.out(Easing.quad)
        }, (finished) => {
            if (finished) {
                runOnJS(setIsClosing)(false);
                runOnJS(onClose)();
            }
        });
    };

    const handleClose = () => {
        backdropOpacity.value = withTiming(0, { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) });
        modalTranslateY.value = withTiming(300, { duration: 240, easing: Easing.bezier(0.4, 0, 0.6, 1) });
        modalScale.value = withTiming(0.95, {
            duration: 220,
            easing: Easing.out(Easing.quad)
        }, (finished) => {
            if (finished) {
                runOnJS(setIsClosing)(false);
                runOnJS(onClose)();
            }
        });
    };

    const handleAddToCart = () => {
        if (quantity === 0) {
            // Remove from cart
            onAddToCart(0);
        } else {
            onAddToCart(quantity);
        }
        backdropOpacity.value = withTiming(0, { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) });
        modalTranslateY.value = withTiming(300, { duration: 240, easing: Easing.bezier(0.4, 0, 0.6, 1) });
        modalScale.value = withTiming(0.95, {
            duration: 220,
            easing: Easing.out(Easing.quad)
        }, (finished) => {
            if (finished) {
                runOnJS(setIsClosing)(false);
                runOnJS(onClose)();
            }
        });
    };

    const handleIncrement = () => {
        const isDiy = bagOption?.role === 'diy' || bagOption?.type === 'Make it yourself';
        const maxQuantity = isDiy ? 20 : (bagOption?.available || 10);

        if (quantity < maxQuantity) {
            setQuantity(quantity + 1);
            plusScale.value = withSequence(
                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
            );
        }
    };

    const handleDecrement = () => {
        if (isItemInCart && quantity > 0) {
            // If item is in cart, allow going to 0
            setQuantity(quantity - 1);
            minusScale.value = withSequence(
                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
            );
        } else if (!isItemInCart && quantity > 1) {
            // If item is NOT in cart, only allow going down to 1
            setQuantity(quantity - 1);
            minusScale.value = withSequence(
                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
            );
        }
    };

    if (!bagOption) return null;

    const pickupTime = formatPickupTime(bagOption.pickupStart, bagOption.pickupEnd);
    const totalPrice = bagOption.price * quantity;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <AnimatedPressable
                    style={[StyleSheet.absoluteFill, backdropStyle]}
                    onPress={handleBackdropPress}
                >
                    <AnimatedBlurView
                        intensity={20}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                </AnimatedPressable>

                <Animated.View style={[styles.modalContent, modalStyle]}>
                    {/* Header Row: Title + Preference Pill + Close Button */}
                    <View style={styles.headerRow}>
                        <View style={styles.titleRow}>
                            <Text style={styles.bagName}>{bagOption.type}</Text>
                            {preference && (
                                <View style={styles.preferenceIndicator}>
                                    <Text style={styles.preferenceIndicatorText}>
                                        {preference === 'veg' ? 'Veg' : preference === 'nonveg' ? 'Non-Veg' : 'Jain'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
                            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text style={styles.bagDescription} numberOfLines={2}>
                        {bagOption.description}
                    </Text>

                    {/* Pickup Time - Bordered Container */}
                    <View style={styles.pickupContainer}>
                        <View style={styles.pickupRow}>
                            <View style={styles.stopwatchIcon}>
                                <Ionicons name="stopwatch-outline" size={20} color={COLORS.textPrimary} />
                            </View>
                            <Text style={styles.pickupLabel}>Pickup window : </Text>
                            <Text style={styles.pickupTime}>{pickupTime}</Text>
                        </View>
                    </View>

                    {/* Price Section with Label */}
                    <View style={styles.priceSection}>
                        <Text style={styles.priceSectionLabel}>Price</Text>
                        <View style={styles.priceRow}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.salePrice}>₹{bagOption.price}</Text>
                                <Text style={styles.originalPrice}>₹{bagOption.originalPrice}</Text>
                            </View>
                            <View style={styles.savingsBadge}>
                                <Text style={styles.savingsText}>
                                    Save ₹{bagOption.originalPrice - bagOption.price}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quantity Section - Label on left, Counter on right */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Quantity</Text>
                        <View style={styles.counterContainer}>
                            <AnimatedPressable
                                style={[styles.counterButton, minusAnimatedStyle]}
                                onPress={handleDecrement}
                                disabled={isItemInCart ? quantity <= 0 : quantity <= 1}
                            >
                                <Ionicons
                                    name={isItemInCart && quantity === 1 ? "trash-outline" : "remove"}
                                    size={20}
                                    color={
                                        (isItemInCart && quantity <= 0) || (!isItemInCart && quantity <= 1)
                                            ? COLORS.textSecondary
                                            : isItemInCart && quantity === 1
                                                ? '#FF6B6B'
                                                : COLORS.activeCategory
                                    }
                                />
                            </AnimatedPressable>

                            <Text style={styles.quantityValue}>{quantity}</Text>

                            <AnimatedPressable
                                style={[styles.counterButton, plusAnimatedStyle]}
                                onPress={handleIncrement}
                                disabled={quantity >= ((bagOption?.role === 'diy' || bagOption?.type === 'Make it yourself') ? 20 : (bagOption?.available || 10))}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={quantity >= ((bagOption?.role === 'diy' || bagOption?.type === 'Make it yourself') ? 20 : (bagOption?.available || 10)) ? COLORS.textSecondary : COLORS.activeCategory}
                                />
                            </AnimatedPressable>
                        </View>
                    </View>

                    {/* Add to Cart Button */}
                    <AnimatedPressable
                        style={[styles.addButton, buttonAnimatedStyle]}
                        onPressIn={() => {
                            buttonScale.value = withSpring(0.97, { damping: 18, stiffness: 320, mass: 0.7 });
                        }}
                        onPressOut={() => {
                            buttonScale.value = withSequence(
                                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
                            );
                        }}
                        onPress={handleAddToCart}
                    >
                        <Text style={styles.addButtonText}>
                            {quantity === 0
                                ? 'Remove from Cart'
                                : initialQuantity === 0
                                    ? `Add to Cart  •  ₹${totalPrice}`
                                    : `Update Cart  •  ₹${totalPrice}`}
                        </Text>
                    </AnimatedPressable>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: '#0F3A28',
        borderRadius: 24,
        padding: SPACING.xl,
        paddingTop: SPACING.lg,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(198, 240, 77, 0.2)',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: SPACING.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bagName: {
        fontFamily: 'Gargoyle',
        fontSize: 28,
        color: COLORS.textPrimary,
    },
    preferenceIndicator: {
        backgroundColor: 'rgba(198, 240, 77, 0.25)',
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: 16,
        borderColor: 'rgba(198, 240, 77, 1)',
        borderWidth: 1,
    },
    preferenceIndicatorText: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.xs,
        color: '#fff',
    },
    bagDescription: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
        opacity: 0.9,
        lineHeight: 22,
    },
    pickupContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    pickupRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stopwatchIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    pickupLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
    },
    pickupTime: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.activeCategory,
    },
    priceSection: {
        width: '100%',
        marginBottom: SPACING.md,
    },
    priceSectionLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
        opacity: 0.8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: SPACING.sm,
    },
    originalPrice: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    salePrice: {
        fontFamily: 'Saans-Bold',
        fontSize: 32,
        color: '#F2A2ED',
    },
    savingsBadge: {
        backgroundColor: 'rgba(198, 240, 77, 0.25)',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 8,
        borderRadius: 20,
        borderColor: 'rgba(198, 240, 77, 1)',
        borderWidth: 1,
    },
    savingsText: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.sm,
        color: '#fff',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        width: '100%',
        marginVertical: SPACING.lg,
    },
    quantitySection: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    quantityLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textSecondary,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    counterButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(198, 240, 77, 0.4)',
    },
    quantityValue: {
        fontFamily: 'Saans-Bold',
        fontSize: 24,
        color: COLORS.textPrimary,
        minWidth: 40,
        textAlign: 'center',
    },
    addButton: {
        width: '100%',
        backgroundColor: COLORS.activeCategory,
        borderRadius: 16,
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
        textAlign: 'center',
    },
});

export default BagSelectionModal;
