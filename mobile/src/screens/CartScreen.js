import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeIn,
    FadeOut,
    Layout,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import RegularBagIcon from '../../assets/images/assets/bags/regular.svg';
import LargeBagIcon from '../../assets/images/assets/bags/large.svg';
import SustainabilityBadges from '../components/SustainabilityBadges';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PREFERENCE_LABELS = {
    veg: { label: 'Veg', emoji: '🌱', color: '#22C55E' },
    nonveg: { label: 'Non-Veg', emoji: '🍖', color: '#EF4444' },
    jain: { label: 'Jain', emoji: '🙏', color: '#F59E0B' },
};

const CartItemCard = ({ item, onIncrement, onDecrement, onRemove }) => {
    const minusScale = useSharedValue(1);
    const plusScale = useSharedValue(1);

    const minusStyle = useAnimatedStyle(() => ({
        transform: [{ scale: minusScale.value }],
    }));

    const plusStyle = useAnimatedStyle(() => ({
        transform: [{ scale: plusScale.value }],
    }));

    const handleIncrement = () => {
        plusScale.value = withSpring(1.05, { damping: 20, stiffness: 350 });
        onIncrement();
    };

    const handleDecrement = () => {
        minusScale.value = withSpring(1.05, { damping: 20, stiffness: 350 });
        if (item.quantity === 1) {
            onRemove();
        } else {
            onDecrement();
        }
    };

    const preference = PREFERENCE_LABELS[item.preference];
    const isRegular = item.bagOption.role === 'regular';
    const BagIcon = isRegular ? RegularBagIcon : LargeBagIcon;

    return (
        <Animated.View
            style={styles.cartItemCard}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify().damping(18).stiffness(180)}
        >
            {/* Bag Icon */}
            <View style={styles.bagIconContainer}>
                <BagIcon height={isRegular ? 40 : 52} />
            </View>

            {/* Item Details */}
            <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                    <Text style={styles.bagType}>
                        {item.bagOption.type === 'Make it yourself'
                            ? 'Custom Rescue Bag'
                            : `${item.bagOption.type} Rescue Bag`}
                    </Text>
                    {/* <View style={[styles.preferenceBadge, { backgroundColor: `${preference.color}20` }]}>
                        <Text style={[styles.preferenceText, { color: preference.color }]}>
                            {preference.emoji} {preference.label}
                        </Text>
                    </View> */}
                </View>
                <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.restaurant.name}
                </Text>

                {/* DIY Items List */}
                {item.bagOption.isCustom && item.bagOption.selectedItems ? (
                    <View style={styles.selectedItemsContainer}>
                        {item.bagOption.selectedItems.map((selectedItem, index) => (
                            <Text key={index} style={styles.selectedItemText}>
                                {selectedItem.quantity}x {selectedItem.name}
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.categoryText}>{preference.label}</Text>
                )}
            </View>

            {/* Price & Quantity */}
            <View style={styles.priceQuantitySection}>
                <Text style={styles.itemPrice}>₹{item.bagOption.price * item.quantity}</Text>

                {/* Quantity Controls */}
                <View style={styles.quantityControls}>
                    <AnimatedTouchable
                        style={[styles.quantityButton, minusStyle]}
                        onPress={handleDecrement}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                            size={16}
                            color={item.quantity === 1 ? '#FF6B6B' : COLORS.activeCategory}
                        />
                    </AnimatedTouchable>

                    <Text style={styles.quantityText}>{item.quantity}</Text>

                    {!item.bagOption.isCustom && (
                        <AnimatedTouchable
                            style={[styles.quantityButton, plusStyle]}
                            onPress={handleIncrement}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={16} color={COLORS.activeCategory} />
                        </AnimatedTouchable>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const EmptyCart = ({ onBrowse }) => (
    <Animated.View
        style={styles.emptyContainer}
        entering={FadeIn.duration(300)}
    >
        <View style={styles.emptyIconContainer}>
            <Ionicons name="bag-outline" size={80} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
            Add rescue bags from restaurants to get started
        </Text>
        <TouchableOpacity style={styles.browseButton} onPress={onBrowse} activeOpacity={0.85}>
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
        </TouchableOpacity>
    </Animated.View>
);

const CartScreen = ({ navigation }) => {
    const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { createOrder } = useOrder();
    const insets = useSafeAreaInsets();
    const buttonScale = useSharedValue(1);

    const total = getCartTotal();
    const savings = items.reduce((acc, item) => {
        return acc + ((item.bagOption.originalPrice - item.bagOption.price) * item.quantity);
    }, 0);

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleIncrement = (itemId, currentQty) => {
        updateQuantity(itemId, currentQty + 1);
    };

    const handleDecrement = (itemId, currentQty) => {
        updateQuantity(itemId, currentQty - 1);
    };

    const handleRemove = (itemId) => {
        removeFromCart(itemId);
    };

    const handleCheckout = async () => {
        // Generate a random order code
        const orderCode = `SP${Date.now().toString(36).toUpperCase()}`;

        // Create persistent order
        await createOrder(orderCode, total, items.length, items[0]?.restaurant);

        navigation.navigate('OrderConfirmation', {
            orderCode,
            total,
            itemCount: items.length,
        });
    };

    const handleBrowse = () => {
        navigation.goBack();
    };

    // Group items by restaurant
    const groupedItems = items.reduce((acc, item) => {
        const restaurantId = item.restaurant.id;
        if (!acc[restaurantId]) {
            acc[restaurantId] = {
                restaurant: item.restaurant,
                items: [],
            };
        }
        acc[restaurantId].items.push(item);
        return acc;
    }, {});

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Cart</Text>
                <View style={styles.headerSpacer} />
            </View>

            {items.length === 0 ? (
                <EmptyCart onBrowse={handleBrowse} />
            ) : (
                <>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {Object.values(groupedItems).map(({ restaurant, items: restaurantItems }) => (
                            <Animated.View
                                key={restaurant.id}
                                style={styles.restaurantGroup}
                                layout={Layout.springify().damping(18).stiffness(180)}
                            >
                                {/* Restaurant Header */}
                                <View style={styles.restaurantHeader}>
                                    <Image
                                        source={{ uri: restaurant.image }}
                                        style={styles.restaurantImage}
                                    />
                                    <View style={styles.restaurantInfo}>
                                        <Text style={styles.restaurantGroupName}>{restaurant.name}</Text>
                                        <Text style={styles.restaurantLocation}>{restaurant.location}</Text>
                                    </View>
                                </View>

                                {/* Items */}
                                {restaurantItems.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        onIncrement={() => handleIncrement(item.id, item.quantity)}
                                        onDecrement={() => handleDecrement(item.id, item.quantity)}
                                        onRemove={() => handleRemove(item.id)}
                                    />
                                ))}
                            </Animated.View>
                        ))}

                        {/* Savings Banner */}
                        {savings > 0 && (
                            <Animated.View
                                style={styles.savingsBanner}
                                entering={FadeIn.delay(200).duration(300)}
                            >
                                <Ionicons name="leaf" size={20} color={COLORS.activeCategory} />
                                <Text style={styles.savingsText}>
                                    You're saving ₹{savings} on this order!
                                </Text>
                            </Animated.View>
                        )}

                        {/* Sustainability Badges */}
                        <View style={styles.sustainabilitySection}>
                            <SustainabilityBadges
                                moneySaved={savings}
                                carbonOffset={items.reduce((acc, item) => acc + (item.quantity * 0.8), 0)}
                                foodSaved={items.reduce((acc, item) => {
                                    const baseWeight = item.bagOption.role === 'large' ? 1.2 : 0.8;
                                    return acc + (item.quantity * baseWeight);
                                }, 0)}
                            />
                        </View>

                        <View style={styles.bottomPadding} />
                    </ScrollView>

                    {/* Checkout Footer */}
                    <Animated.View
                        style={[
                            styles.checkoutFooter,
                            { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.md }
                        ]}
                        entering={FadeIn.delay(100).duration(250)}
                    >
                        <View style={styles.totalSection}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total}</Text>
                        </View>

                        <AnimatedTouchable
                            style={[styles.checkoutButton, buttonStyle]}
                            activeOpacity={0.9}
                            onPressIn={() => {
                                buttonScale.value = withSpring(0.98, { damping: 22, stiffness: 350 });
                            }}
                            onPressOut={() => {
                                buttonScale.value = withSpring(1, { damping: 22, stiffness: 350 });
                            }}
                            onPress={handleCheckout}
                        >
                            <Text style={styles.checkoutButtonText}>Complete Payment</Text>
                            <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
                        </AnimatedTouchable>
                    </Animated.View>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontFamily: 'Gargoyle',
        fontSize: 28,
        color: COLORS.textPrimary,
    },
    headerSpacer: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    restaurantGroup: {
        marginBottom: SPACING.xl,
    },
    restaurantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    restaurantImage: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: '#D1D5DB',
    },
    restaurantInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    restaurantGroupName: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
    },
    restaurantLocation: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cartItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#134631',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    bagIconContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    itemDetails: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: 2,
    },
    bagType: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
    },
    preferenceBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    preferenceText: {
        fontFamily: 'Saans',
        fontSize: 10,
        fontWeight: '600',
    },
    restaurantName: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    categoryText: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    selectedItemsContainer: {
        marginTop: 4,
    },
    selectedItemText: {
        fontFamily: 'Saans',
        fontSize: 12,
        color: COLORS.textSecondary,
        opacity: 0.9,
    },
    priceQuantitySection: {
        alignItems: 'flex-end',
    },
    itemPrice: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: '#F2A2ED',
        marginBottom: SPACING.xs,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#0F3A28',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        minWidth: 28,
        textAlign: 'center',
    },
    savingsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(198, 240, 77, 0.2)',
    },
    savingsText: {
        fontFamily: 'Saans-SemiBold',
        fontSize: FONT_SIZES.sm,
        color: COLORS.activeCategory,
        flex: 1,
    },
    sustainabilitySection: {
        marginTop: SPACING.lg,
    },
    bottomPadding: {
        height: 120,
    },
    checkoutFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0F3A28',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.lg,
    },
    totalSection: {
        flex: 1,
    },
    totalLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    totalValue: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.xxl,
        color: COLORS.textPrimary,
    },
    checkoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.activeCategory,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    checkoutButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xxxl,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        fontFamily: 'Gargoyle',
        fontSize: 28,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    browseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.activeCategory,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    browseButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
    },
});

export default CartScreen;
