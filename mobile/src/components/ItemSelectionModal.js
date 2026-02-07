import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    interpolateColor,
} from 'react-native-reanimated';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

import VegIcon from '../../assets/images/assets/foodtype/veg.svg';
import VegIconDark from '../../assets/images/assets/foodtype/veg-dark.svg';
import NonVegIcon from '../../assets/images/assets/foodtype/nonveg.svg';
import NonVegIconDark from '../../assets/images/assets/foodtype/nonveg-dark.svg';
import JainIcon from '../../assets/images/assets/foodtype/jain.svg';
import JainIconDark from '../../assets/images/assets/foodtype/jain-dark.svg';

const PREFERENCES = [
    { id: 'veg', label: 'Veg', icon: VegIcon, iconDark: VegIconDark },
    { id: 'nonveg', label: 'Non-Veg', icon: NonVegIcon, iconDark: NonVegIconDark },
    { id: 'jain', label: 'Jain', icon: JainIcon, iconDark: JainIconDark },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PreferenceChip = ({ active, icon: Icon, iconDark: IconDark, label, onPress }) => {
    const pressed = useSharedValue(1);
    const progress = useSharedValue(active ? 1 : 0);
    const selectionScale = useSharedValue(1);

    useEffect(() => {
        progress.value = withSpring(active ? 1 : 0, {
            damping: 15,
            stiffness: 200,
            mass: 0.8
        });
        if (active) {
            selectionScale.value = withSequence(
                withSpring(1.05, { damping: 12, stiffness: 400 }),
                withSpring(1, { damping: 15, stiffness: 300 })
            );
        }
    }, [active, progress, selectionScale]);

    const chipStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(255,255,255,0.08)', COLORS.activeCategory]),
        borderColor: interpolateColor(progress.value, [0, 1], ['rgba(255,255,255,0.15)', COLORS.activeCategory]),
        transform: [{ scale: pressed.value * selectionScale.value }],
    }));

    const labelStyle = useAnimatedStyle(() => ({
        color: interpolateColor(progress.value, [0, 1], [COLORS.textPrimary, COLORS.background]),
    }));

    return (
        <AnimatedTouchable
            style={[styles.preferenceChip, chipStyle]}
            onPress={onPress}
            activeOpacity={0.9}
            onPressIn={() => {
                pressed.value = withSpring(0.98, { damping: 25, stiffness: 400, mass: 0.8 });
            }}
            onPressOut={() => {
                pressed.value = withSpring(1, { damping: 22, stiffness: 380, mass: 0.8 });
            }}
        >
            <View style={styles.chipIconContainer}>
                {active ? <IconDark height="100%" /> : <Icon height="100%" />}
            </View>
            <Animated.Text style={[styles.preferenceLabel, labelStyle]} numberOfLines={1}>
                {label}
            </Animated.Text>
        </AnimatedTouchable>
    );
};

const ItemRow = ({ item, quantity, onIncrement, onDecrement }) => {
    const minusScale = useSharedValue(1);
    const plusScale = useSharedValue(1);

    const minusStyle = useAnimatedStyle(() => ({
        transform: [{ scale: minusScale.value }],
    }));

    const plusStyle = useAnimatedStyle(() => ({
        transform: [{ scale: plusScale.value }],
    }));

    const handleIncrement = () => {
        plusScale.value = withSequence(
            withSpring(1.2, { damping: 10, stiffness: 300 }),
            withSpring(1, { damping: 12, stiffness: 300 })
        );
        onIncrement(item);
    };

    const handleDecrement = () => {
        minusScale.value = withSequence(
            withSpring(0.8, { damping: 10, stiffness: 300 }),
            withSpring(1, { damping: 12, stiffness: 300 })
        );
        onDecrement(item);
    };

    return (
        <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
            </View>

            <View style={styles.counterContainer}>
                {quantity > 0 && (
                    <>
                        <AnimatedPressable
                            style={[styles.counterButton, styles.minusButton, minusStyle]}
                            onPress={handleDecrement}
                        >
                            <Ionicons name="remove" size={16} color={COLORS.activeCategory} />
                        </AnimatedPressable>
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </>
                )}

                <AnimatedPressable
                    style={[styles.counterButton, plusStyle]}
                    onPress={handleIncrement}
                >
                    <Ionicons name="add" size={16} color={COLORS.background} />
                </AnimatedPressable>
            </View>
        </View>
    );
};

// Default rescue items for restaurants that don't have custom ones
const DEFAULT_RESCUE_ITEMS = {
    veg: [
        { id: 'default-v1', name: 'Paneer Sandwich', category: 'Savory', price: 80 },
        { id: 'default-v2', name: 'Veg Puff', category: 'Savory', price: 60 },
        { id: 'default-v3', name: 'Cheese Toast', category: 'Savory', price: 70 },
        { id: 'default-v4', name: 'Veggie Wrap', category: 'Savory', price: 90 },
        { id: 'default-v5', name: 'Samosa', category: 'Snack', price: 40 },
        { id: 'default-v6', name: 'Aloo Paratha', category: 'Indian', price: 85 },
    ],
    nonveg: [
        { id: 'default-nv1', name: 'Chicken Sandwich', category: 'Savory', price: 100 },
        { id: 'default-nv2', name: 'Chicken Puff', category: 'Savory', price: 70 },
        { id: 'default-nv3', name: 'Egg Roll', category: 'Savory', price: 80 },
        { id: 'default-nv4', name: 'Chicken Wrap', category: 'Savory', price: 110 },
        { id: 'default-nv5', name: 'Mutton Samosa', category: 'Snack', price: 60 },
        { id: 'default-nv6', name: 'Keema Paratha', category: 'Indian', price: 95 },
    ],
    jain: [
        { id: 'default-j1', name: 'Dry Fruit Sandwich', category: 'Savory', price: 90 },
        { id: 'default-j2', name: 'Plain Puff', category: 'Savory', price: 55 },
        { id: 'default-j3', name: 'Cheese Toast', category: 'Savory', price: 65 },
        { id: 'default-j4', name: 'Fruit Bowl', category: 'Fresh', price: 80 },
        { id: 'default-j5', name: 'Sabudana Vada', category: 'Snack', price: 50 },
    ],
};

const ItemSelectionModal = ({ sheetRef, bagOption, restaurant, selectedPreference: initialPreference, onDismiss, onAddToCart }) => {
    const [selectedItems, setSelectedItems] = useState({});
    const [preference, setPreference] = useState(initialPreference || 'veg');

    // Update preference when initial preference changes
    useEffect(() => {
        if (initialPreference) {
            setPreference(initialPreference);
        }
    }, [initialPreference]);

    // Minimum items required for a custom bag
    const MIN_ITEMS = 3;

    // Get rescue items based on preference
    const rescueItems = useMemo(() => {
        const items = restaurant?.rescueItems;

        // If items is an object with preference keys (new format)
        if (items && typeof items === 'object' && !Array.isArray(items)) {
            return items[preference] || DEFAULT_RESCUE_ITEMS[preference] || [];
        }

        // If items is an array (old format) or doesn't exist, use defaults
        return DEFAULT_RESCUE_ITEMS[preference] || [];
    }, [restaurant?.rescueItems, preference]);

    // Calculate total selected items
    const totalItems = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
    const isValid = totalItems >= MIN_ITEMS;

    // Reset selection when preference changes
    useEffect(() => {
        setSelectedItems({});
    }, [preference]);

    const snapPoints = useMemo(() => ['90%', '90%'], []);

    const handleIncrement = (item) => {
        setSelectedItems(prev => ({
            ...prev,
            [item.id]: (prev[item.id] || 0) + 1
        }));
    };

    const handleDecrement = (item) => {
        setSelectedItems(prev => {
            const newQty = (prev[item.id] || 0) - 1;
            if (newQty <= 0) {
                const { [item.id]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [item.id]: newQty };
        });
    };

    const handleAdd = () => {
        if (!isValid) return;

        // Convert map to list for cart
        const itemsList = Object.entries(selectedItems).map(([id, qty]) => {
            const item = rescueItems.find(i => i.id === id);
            return { ...item, quantity: qty };
        });

        onAddToCart(itemsList, preference);
        sheetRef.current?.dismiss();
    };

    const handleSheetDismiss = useCallback(() => {
        setSelectedItems({});
        onDismiss?.();
    }, [onDismiss]);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                opacity={0.5}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            enableDynamicSizing
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.indicator}
            onDismiss={handleSheetDismiss}
        >
            <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Build Your Bag</Text>
                        <Text style={styles.subtitle}>
                            Select at least {MIN_ITEMS} items • Fixed Price ₹{bagOption?.price || 129}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.itemsContainer}>
                    {rescueItems.map((item) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            quantity={selectedItems[item.id] || 0}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.addButton, !isValid && styles.addButtonDisabled]}
                        onPress={handleAdd}
                        disabled={!isValid}
                    >
                        <Text style={[styles.addButtonText, !isValid && styles.addButtonTextDisabled]}>
                            {isValid
                                ? `Add to Cart • ₹${bagOption?.price || 129}`
                                : `Select ${Math.max(0, MIN_ITEMS - totalItems)} more items`
                            }
                        </Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#0F3A28',
    },
    indicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontFamily: 'Gargoyle',
        fontSize: 24,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.activeCategory,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: SPACING.sm,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    itemsContainer: {
        paddingHorizontal: SPACING.lg,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontFamily: 'Saans-Medium',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    itemCategory: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    counterButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.activeCategory,
        alignItems: 'center',
        justifyContent: 'center',
    },
    minusButton: {
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
        borderWidth: 1,
        borderColor: COLORS.activeCategory,
    },
    quantityText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        minWidth: 20,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    addButton: {
        backgroundColor: COLORS.activeCategory,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    addButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.background,
    },
    addButtonTextDisabled: {
        color: COLORS.textSecondary,
    },
});

export default ItemSelectionModal;
