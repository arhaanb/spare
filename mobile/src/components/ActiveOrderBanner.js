import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useOrder } from '../context/OrderContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ActiveOrderBanner = ({ onPress }) => {
    const { activeOrder, hasActiveOrder } = useOrder();
    const buttonScale = useSharedValue(1);

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    if (!hasActiveOrder) return null;

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
        >
            <AnimatedTouchable
                style={[styles.banner, buttonStyle]}
                activeOpacity={0.95}
                onPressIn={() => {
                    buttonScale.value = withSpring(0.98, { damping: 22, stiffness: 350 });
                }}
                onPressOut={() => {
                    buttonScale.value = withSpring(1, { damping: 22, stiffness: 350 });
                }}
                onPress={onPress}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="receipt-outline" size={20} color={COLORS.background} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Active Order</Text>
                    <Text style={styles.subtitle}>Tap to view pickup code</Text>
                </View>

                <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.background} />
                </View>
            </AnimatedTouchable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.activeCategory,
        borderRadius: BORDER_RADIUS.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: FONT_SIZES.sm,
        color: COLORS.background,
        opacity: 0.8,
    },
    chevronContainer: {
        opacity: 0.7,
    },
});

export default ActiveOrderBanner;
