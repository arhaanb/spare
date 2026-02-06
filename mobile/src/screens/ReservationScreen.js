import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Button } from '../components';
import { formatPickupTime, calculateSavingsPercent } from '../data/mockData';

const ReservationScreen = ({ route, navigation }) => {
  const { restaurant, bagOption } = route.params;

  const pickupCode = useMemo(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  const pickupTime = formatPickupTime(bagOption.pickupStart, bagOption.pickupEnd);
  const savings = bagOption.originalPrice - bagOption.price;
  const savingsPercent = calculateSavingsPercent(bagOption.originalPrice, bagOption.price);

  const handleDone = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeInUp.duration(280)} style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>Bag Reserved!</Text>
        <Text style={styles.subtitle}>
          Show this code when you pick up your rescue bag
        </Text>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Your Pickup Code</Text>
          <Text style={styles.pickupCode}>{pickupCode}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Restaurant</Text>
            <Text style={styles.detailValue}>{restaurant.name}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bag Type</Text>
            <Text style={styles.detailValue}>{bagOption.type}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{restaurant.location}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Time</Text>
            <Text style={styles.detailValueHighlight}>{pickupTime}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={styles.detailValuePrice}>₹{bagOption.price}</Text>
          </View>
        </View>

        <View style={styles.savingsContainer}>
          <Text style={styles.savingsText}>
            🎉 You saved ₹{savings} ({savingsPercent}% off)
          </Text>
        </View>

        <View style={styles.reminderContainer}>
          <Text style={styles.reminderIcon}>⏰</Text>
          <Text style={styles.reminderText}>
            Remember to pick up your bag during the pickup window. 
            Late pickups may not be honored.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          title="Done"
          onPress={handleDone}
          variant="primary"
          size="large"
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  checkmark: {
    fontSize: 40,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  codeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  pickupCode: {
    fontSize: FONT_SIZES.display,
    fontWeight: '700',
    color: COLORS.primaryAccent,
    letterSpacing: 4,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailValueHighlight: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primaryAccent,
    fontWeight: '600',
  },
  detailValuePrice: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primaryAccent,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  savingsContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryAccent,
  },
  savingsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primaryAccent,
    fontWeight: '600',
    textAlign: 'center',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
  },
  reminderIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  reminderText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  doneButton: {
    width: '100%',
  },
});

export default ReservationScreen;
