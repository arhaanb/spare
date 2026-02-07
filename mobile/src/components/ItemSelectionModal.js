import React, { useMemo, useCallback } from 'react';
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
} from 'react-native-reanimated';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

const ItemSelectionModal = ({ sheetRef, bagOption, restaurant, onDismiss, onAddToCart }) => {
    const [selectedItems, setSelectedItems] = React.useState({});

    // Minimum items required for a custom bag
    const MIN_ITEMS = 3;

    const rescueItems = restaurant?.rescueItems || [];

    // Calculate total selected items
    const totalItems = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
    const isValid = totalItems >= MIN_ITEMS;

    // Reset selection when sheet is opened (optional, or keep state)
    // For now, we'll keep it simple and reset when bagOption changes significantly or manual reset needed
    // But since this is a controlled modal, we rely on parent to handle visibility.
    // We can use onDismiss to reset if needed.

    const snapPoints = useMemo(() => ['60%', '90%'], []);

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

        onAddToCart(itemsList);
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
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.indicator}
            onDismiss={handleSheetDismiss}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Build Your Bag</Text>
                        <Text style={styles.subtitle}>
                            Select at least {MIN_ITEMS} items • Fixed Price ₹{bagOption?.price || 129}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <BottomSheetFlatList
                    data={rescueItems}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <ItemRow
                            item={item}
                            quantity={selectedItems[item.id] || 0}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

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
            </View>
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
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
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100, // Space for footer
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: '#0F3A28',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
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
