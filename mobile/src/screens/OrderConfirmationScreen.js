import React, { useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    Easing,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { CountdownTimer } from '../components/countdown';
import TickIcon from '../../assets/images/tick.svg';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OrderConfirmationScreen = ({ route, navigation }) => {
    const { orderCode: paramCode, total: paramTotal, itemCount: paramCount, expiresAt: paramExpires } = route.params || {};
    const { activeOrder, completeOrder } = useOrder();
    const { clearCart } = useCart();

    // Prioritize activeOrder from context, fallback to params
    const displayData = useMemo(() => {
        if (activeOrder) {
            return {
                orderCode: activeOrder.orderCode,
                total: activeOrder.total,
                itemCount: activeOrder.itemCount,
                expiresAt: activeOrder.expiresAt,
            };
        }
        return {
            orderCode: paramCode,
            total: paramTotal,
            itemCount: paramCount,
            expiresAt: paramExpires ? new Date(paramExpires) : new Date(Date.now() + 2 * 60 * 60 * 1000),
        };
    }, [activeOrder, paramCode, paramTotal, paramCount, paramExpires]);

    const { orderCode, total, itemCount, expiresAt } = displayData;

    const targetDate = expiresAt;

    const checkmarkScale = useSharedValue(0);
    const checkmarkOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const qrScale = useSharedValue(0.8);
    const qrOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(1);

    useEffect(() => {
        // Clear cart on mount to avoid flash on checkout screen
        clearCart();

        // Animate checkmark first
        checkmarkScale.value = withDelay(200, withSpring(1, { damping: 18, stiffness: 120 }));
        checkmarkOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

        // Then fade in content
        contentOpacity.value = withDelay(450, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));

        // Finally animate QR code
        qrScale.value = withDelay(600, withSpring(1, { damping: 20, stiffness: 100 }));
        qrOpacity.value = withDelay(600, withTiming(1, { duration: 280 }));
    }, []);

    const checkmarkStyle = useAnimatedStyle(() => ({
        transform: [{ scale: checkmarkScale.value }],
        opacity: checkmarkOpacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const qrStyle = useAnimatedStyle(() => ({
        transform: [{ scale: qrScale.value }],
        opacity: qrOpacity.value,
    }));

    const buttonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const handleGoHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const handleCountdownFinish = () => {
        // Could show an alert or auto-navigate
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Checkmark */}
                <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
                    <View style={styles.checkmarkCircle}>
                        <TickIcon width={50} height={50} />
                    </View>
                </Animated.View>

                {/* Title & Order ID */}
                <Animated.View style={[styles.textSection, contentStyle]}>
                    <Text style={styles.title}>Order Confirmed!</Text>
                    <Text style={styles.subtitle}>Your rescue bags are reserved</Text>
                </Animated.View>

                {/* QR Code Section */}
                <Animated.View style={[styles.qrSection, qrStyle]}>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={orderCode}
                            size={160}
                            color={COLORS.background}
                            backgroundColor="#FFFFFF"
                        />
                    </View>
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Pickup Code</Text>
                        <Text style={styles.codeValue}>{orderCode}</Text>
                    </View>
                </Animated.View>

                {/* Countdown Timer */}
                <Animated.View style={[styles.countdownSection, contentStyle]}>
                    <Text style={styles.countdownLabel}>Time to collect</Text>
                    <CountdownTimer
                        targetDate={targetDate}
                        size="medium"
                        customization={{
                            numberColor: COLORS.activeCategory,
                            labelColor: COLORS.textSecondary,
                            separatorColor: COLORS.activeCategory,
                            showDays: false,
                            showLabels: true,
                            fontWeight: '700',
                            onFinish: handleCountdownFinish,
                            finishText: 'Expired',
                        }}
                    />
                </Animated.View>

                {/* Back to Home Button */}
                <Animated.View
                    style={styles.buttonContainer}
                    entering={FadeIn.delay(900).duration(300)}
                >
                    <AnimatedTouchable
                        style={[styles.homeButton, buttonStyle]}
                        activeOpacity={0.9}
                        onPressIn={() => {
                            buttonScale.value = withSpring(0.98, { damping: 22, stiffness: 350 });
                        }}
                        onPressOut={() => {
                            buttonScale.value = withSpring(1, { damping: 22, stiffness: 350 });
                        }}
                        onPress={handleGoHome}
                    >
                        <Text style={styles.homeButtonText}>Back to Home</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
                    </AnimatedTouchable>
                </Animated.View>

                {/* Completion Action */}
                <View style={styles.completionSection}>
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={async () => {
                            await completeOrder();
                            navigation.navigate('Home');
                        }}
                    >
                        <Ionicons name="checkmark-done-circle-outline" size={22} color={COLORS.activeCategory} />
                        <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    footerSpacing: {
        height: 40,
    },
    completionSection: {
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.full,
        borderWidth: 1,
        borderColor: 'rgba(198, 240, 77, 0.3)',
        gap: SPACING.sm,
    },
    completeButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.md,
        color: COLORS.activeCategory,
    },
    completionNote: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.sm,
        opacity: 0.6,
        paddingHorizontal: SPACING.xl,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.xl,
    },
    checkmarkContainer: {
        marginBottom: SPACING.lg,
    },
    checkmarkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.activeCategory,
        alignItems: 'center',
        justifyContent: 'center',
        // Elegance: add a subtle outer glow
        shadowColor: COLORS.activeCategory,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    textSection: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    title: {
        fontFamily: 'Gargoyle',
        fontSize: 36,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    qrSection: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    qrContainer: {
        backgroundColor: '#FFFFFF',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.sm,
    },
    codeContainer: {
        alignItems: 'center',
    },
    codeLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    codeValue: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.xl,
        color: COLORS.activeCategory,
        letterSpacing: 2,
    },
    countdownSection: {
        alignItems: 'center',
        marginBottom: SPACING.xxl * 1.5,
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        backgroundColor: '#134631',
        borderRadius: BORDER_RADIUS.xl,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    countdownLabel: {
        fontFamily: 'Saans',
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    buttonContainer: {
        width: '100%',
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.activeCategory,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        gap: SPACING.sm,
    },
    homeButtonText: {
        fontFamily: 'Saans-Bold',
        fontSize: FONT_SIZES.lg,
        color: COLORS.background,
    },
});

export default OrderConfirmationScreen;
