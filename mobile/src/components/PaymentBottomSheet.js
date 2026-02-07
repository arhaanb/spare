import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

// Mock payment methods
const MOCK_PAYMENT_METHODS = [
    { id: '1', type: 'card', label: 'Visa •••• 4242', icon: 'card' },
    { id: '2', type: 'card', label: 'Mastercard •••• 8888', icon: 'card-outline' },
    { id: '3', type: 'upi', label: 'UPI - arhaanb@upi', icon: 'phone-portrait-outline' },
];

const PaymentItem = ({ label, icon, isDefault }) => (
    <View style={[styles.paymentItem, isDefault && styles.paymentItemDefault]}>
        <View style={[styles.iconBox, isDefault && styles.iconBoxDefault]}>
            <Ionicons
                name={icon}
                size={22}
                color={isDefault ? COLORS.background : COLORS.activeCategory}
            />
        </View>
        <View style={styles.paymentInfo}>
            <Text style={[styles.paymentLabel, isDefault && styles.paymentLabelDefault]}>{label}</Text>
            {isDefault && <Text style={styles.defaultText}>Default</Text>}
        </View>
        {isDefault && (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.activeCategory} />
        )}
    </View>
);

const PaymentBottomSheet = React.forwardRef((props, ref) => {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['50%', '70%'], []);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
            >
                <BlurView
                    intensity={40}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                />
            </BottomSheetBackdrop>
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.indicator}
        >
            <BottomSheetView style={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Payment Methods</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <Text style={styles.sectionTitle}>Saved Cards & UPI</Text>
                    {MOCK_PAYMENT_METHODS.map((method) => (
                        <PaymentItem
                            key={method.id}
                            label={method.label}
                            icon={method.icon}
                            isDefault={method.isDefault}
                        />
                    ))}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Other Options</Text>
                    <View style={styles.paymentItem}>
                        <View style={styles.iconBox}>
                            <Ionicons name="cash-outline" size={22} color={COLORS.activeCategory} />
                        </View>
                        <View style={styles.paymentInfo}>
                            <Text style={styles.paymentLabel}>Cash on Pickup</Text>
                        </View>
                    </View>

                </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: 'rgba(15, 58, 40, 0.95)',
        borderTopLeftRadius: BORDER_RADIUS.xxl,
        borderTopRightRadius: BORDER_RADIUS.xxl,
    },
    indicator: {
        backgroundColor: COLORS.borderLight,
        width: 40,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    title: {
        fontSize: FONT_SIZES.xl,
        fontFamily: 'Gargoyle',
        color: COLORS.textPrimary,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.sm,
        fontFamily: 'Saans-SemiBold',
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    paymentItemDefault: {
        borderColor: COLORS.activeCategory,
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(198, 240, 77, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    iconBoxDefault: {
        backgroundColor: COLORS.activeCategory,
    },
    paymentInfo: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    paymentLabel: {
        fontSize: FONT_SIZES.md,
        fontFamily: 'Saans-Bold',
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    paymentLabelDefault: {
        color: COLORS.activeCategory,
    },
    defaultText: {
        fontSize: FONT_SIZES.xs,
        fontFamily: 'Saans',
        color: COLORS.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: SPACING.sm,
        marginBottom: SPACING.md,
    },
});

export default PaymentBottomSheet;
