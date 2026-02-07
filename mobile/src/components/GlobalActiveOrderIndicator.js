import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Platform, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    FadeInDown,
    FadeOutDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '../navigation/navigationRef';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useOrder } from '../context/OrderContext';

const { width } = Dimensions.get('window');

const GlobalActiveOrderIndicator = ({ currentRouteName }) => {
    const insets = useSafeAreaInsets();
    const { hasActiveOrder, activeOrder } = useOrder();

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
        if (navigationRef.isReady()) {
            navigationRef.navigate('OrderConfirmation');
        }
    };

    // Hide if no active order or if we are on restricted screens
    const isRestrictedScreen = ['Cart', 'OrderConfirmation', 'Login', 'Onboarding'].includes(currentRouteName);
    if (!hasActiveOrder || isRestrictedScreen) return null;

    // Additional check: On RestaurantDetail, only show if it matches the current restaurant
    if (currentRouteName === 'RestaurantDetail' && navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        const currentRestaurantId = route?.params?.restaurant?.id;
        if (currentRestaurantId && activeOrder?.restaurant && activeOrder.restaurant.id !== currentRestaurantId) {
            return null;
        }
    }

    const isTabScreen = ['Home'].includes(currentRouteName);
    let bottomOffset = Platform.OS === 'ios' ? 105 : 85;

    if (!isTabScreen) {
        bottomOffset = insets.bottom + 8;
    }

    return (
        <Animated.View
            entering={FadeInDown.springify().damping(20).stiffness(150)}
            exiting={FadeOutDown}
            style={[styles.container, { bottom: bottomOffset }]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={handlePress}
                onPressIn={() => {
                    scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
                }}
                onPressOut={() => {
                    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
                }}
            >
                <Animated.View style={[styles.banner, animatedStyle]}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="receipt" size={20} color={COLORS.background} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Your Rescue Bag Order</Text>
                            <Text style={styles.subtitle}>Tap to view pickup details & QR code</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.background} />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 105 : 85, // Floating just above the bottom tab bar
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 9999,
    },
    banner: {
        backgroundColor: COLORS.activeCategory,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.md,
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.background,
    },
    subtitle: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.xs,
        color: 'rgba(10, 53, 34, 0.7)',
        marginTop: 1,
    },
});

export default GlobalActiveOrderIndicator;
