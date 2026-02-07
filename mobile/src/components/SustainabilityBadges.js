import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import MoneySavedBadge from '../../assets/images/badges/money_saved.svg';
import CarbonBadge from '../../assets/images/badges/ca.svg';
import FoodSavedBadge from '../../assets/images/badges/food_saved.svg';

const BADGE_SIZE = 100;
const PINK_BADGE_SIZE = 95;

// Colors from the reference design
const COLORS = {
    background: '#0A3522',  // Dark green background
    textPrimary: '#FFFFFF', // White for values
    textSecondary: 'rgba(255, 255, 255, 0.7)', // Muted white for labels
};

const BadgeItem = ({ icon: Icon, value, label, size = BADGE_SIZE }) => (
    <View style={styles.badgeItem}>
        <Icon width={size} height={size * 0.93} />
        <Text style={styles.badgeValue}>{value}</Text>
        <Text style={styles.badgeLabel}>{label}</Text>
    </View>
);

/**
 * SustainabilityBadges Component
 * Shows money saved, carbon offset, and food saved metrics
 * 
 * @param {Object} props
 * @param {number} props.moneySaved - Amount saved in rupees
 * @param {number} props.carbonOffset - Carbon offset in kg
 * @param {number} props.foodSaved - Food saved in kg
 */
const SustainabilityBadges = ({ moneySaved = 0, carbonOffset = 0, foodSaved = 0 }) => {
    // Format values
    const formatMoney = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const formatWeight = (kg) => {
        return `${kg.toFixed(1)}kg`;
    };

    return (
        <Animated.View
            style={styles.container}
            entering={FadeIn.duration(400)}
        >
            {/* Top row - Money Saved and Carbon Offset */}
            <View style={styles.topRow}>
                <BadgeItem
                    icon={MoneySavedBadge}
                    value={formatMoney(moneySaved)}
                    label="saved on spare"
                />
                <BadgeItem
                    icon={CarbonBadge}
                    value={formatWeight(carbonOffset)}
                    label="carbon offset"
                    size={PINK_BADGE_SIZE}
                />
            </View>

            {/* Bottom row - Food Saved */}
            <View style={styles.bottomRow}>
                <BadgeItem
                    icon={FoodSavedBadge}
                    value={formatWeight(foodSaved)}
                    label="food saved"
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingVertical: 28,
        paddingHorizontal: 20,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    bottomRow: {
        alignItems: 'center',
    },
    badgeItem: {
        alignItems: 'center',
    },
    badgeValue: {
        fontFamily: 'Gargoyle',
        fontSize: 28,
        color: COLORS.textPrimary,
        marginTop: 10,
    },
    badgeLabel: {
        fontFamily: 'Saans',
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});

export default SustainabilityBadges;
