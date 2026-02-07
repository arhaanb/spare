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

const BagSelectionModal = ({ visible, bagOption, restaurant, onClose, onAddToCart, initialQuantity = 1 }) => {
    const backdropOpacity = useSharedValue(0);
    const modalTranslateY = useSharedValue(500);
    const modalScale = useSharedValue(0.9);
    const [quantity, setQuantity] = React.useState(initialQuantity);
    const [isClosing, setIsClosing] = React.useState(false);
    const buttonScale = useSharedValue(1);
    const minusScale = useSharedValue(1);
    const plusScale = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            setQuantity(initialQuantity);
            setIsClosing(false);
            // Entry animation - elegant and smooth
            backdropOpacity.value = withTiming(1, { duration: 350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
            modalTranslateY.value = withSpring(0, { damping: 28, stiffness: 240, mass: 1 });
            modalScale.value = withSpring(1, { damping: 26, stiffness: 220, mass: 0.9 });
        } else if (isClosing) {
            // Exit animation - quick and clean
            backdropOpacity.value = withTiming(0, { duration: 220, easing: Easing.bezier(0.4, 0, 1, 1) });
            modalTranslateY.value = withTiming(300, { duration: 240, easing: Easing.bezier(0.4, 0, 0.6, 1) });
            modalScale.value = withTiming(0.95, { duration: 220, easing: Easing.out(Easing.quad) });
        }
    }, [visible, isClosing, initialQuantity, backdropOpacity, modalTranslateY, modalScale]);

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
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleAddToCart = () => {
        if (quantity === 0) {
            // Remove from cart
            onAddToCart(0);
        } else {
            onAddToCart(quantity);
        }
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleIncrement = () => {
        if (quantity < 10) {
            setQuantity(quantity + 1);
            plusScale.value = withSequence(
                withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
                withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 })
            );
        }
    };

    const handleDecrement = () => {
        if (quantity > 0) {
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
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
                        <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    {/* Bag Icon/Image */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconEmoji}>🛍️</Text>
                        </View>
                    </View>

                    {/* Bag Details */}
                    <Text style={styles.bagName}>{bagOption.type}</Text>
                    <Text style={styles.bagDescription} numberOfLines={2}>
                        {bagOption.description}
                    </Text>

                    {/* Pickup Time */}
                    <View style={styles.pickupRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.activeCategory} />
                        <Text style={styles.pickupText}>Pickup: {pickupTime}</Text>
                    </View>

                    {/* Price Display */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.originalPrice}>₹{bagOption.originalPrice}</Text>
                        <Text style={styles.salePrice}>₹{bagOption.price}</Text>
                        <View style={styles.savingsBadge}>
                            <Text style={styles.savingsText}>
                                Save ₹{bagOption.originalPrice - bagOption.price}
                            </Text>
                        </View>
                    </View>

                    {/* Quantity Counter */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Quantity</Text>
                        <View style={styles.counterContainer}>
                            <AnimatedPressable
                                style={[styles.counterButton, minusAnimatedStyle]}
                                onPress={handleDecrement}
                                disabled={quantity <= 0}
                            >
                                <Ionicons
                                    name={quantity === 1 ? "trash-outline" : "remove"}
                                    size={20}
                                    color={quantity <= 0 ? COLORS.textSecondary : quantity === 1 ? '#FF6B6B' : COLORS.activeCategory}
                                />
                            </AnimatedPressable>

                            <Text style={styles.quantityValue}>{quantity}</Text>

                            <AnimatedPressable
                                style={[styles.counterButton, plusAnimatedStyle]}
                                onPress={handleIncrement}
                                disabled={quantity >= 10}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={quantity >= 10 ? COLORS.textSecondary : COLORS.activeCategory}
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
                        <Text style={styles.addButtonText}>{quantity === 0 ? 'Remove from Cart' : 'Add to Cart'}</Text>
                        {quantity > 0 && <Text style={styles.addButtonPrice}>₹{totalPrice}</Text>}
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
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(198, 240, 77, 0.2)',
    },
    closeButton: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    iconContainer: {
        marginBottom: SPACING.md,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(198, 240, 77, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: 40,
    },
    bagName: {
        fontFamily: 'Gargoyle',
        fontSize: 26,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    bagDescription: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.md,
        opacity: 0.8,
    },
    pickupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.lg,
    },
    pickupText: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.sm,
        color: COLORS.activeCategory,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    originalPrice: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    salePrice: {
        fontFamily: 'Saans-Bold',
        fontSize: 28,
        color: '#F2A2ED',
    },
    savingsBadge: {
        backgroundColor: 'rgba(198, 240, 77, 0.2)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    savingsText: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.xs,
        color: COLORS.activeCategory,
    },
    quantitySection: {
        width: '100%',
        marginBottom: SPACING.xl,
    },
    quantityLabel: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.lg,
    },
    counterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#134631',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(198, 240, 77, 0.3)',
    },
    quantityValue: {
        fontFamily: 'Saans-Bold',
        fontSize: 32,
        color: COLORS.textPrimary,
        minWidth: 50,
        textAlign: 'center',
    },
    addButton: {
        width: '100%',
        backgroundColor: COLORS.activeCategory,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
    },
    addButtonPrice: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
    },
});

export default BagSelectionModal;
