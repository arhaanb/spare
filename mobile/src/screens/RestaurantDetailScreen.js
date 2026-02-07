import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { formatPickupTime } from '../data/mockData';

const PREFERENCES = [
  { id: 'veg', label: 'Veg Only', icon: 'leaf-outline' },
  { id: 'nonveg', label: 'Non-Veg', icon: 'restaurant-outline' },
  { id: 'jain', label: 'Jain Only', icon: 'flower-outline' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const PreferenceChip = ({ active, icon, label, onPress }) => {
  const pressed = useSharedValue(1);
  const progress = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
  }, [active, progress]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#0C4D2A', COLORS.activeCategory]),
    borderColor: interpolateColor(progress.value, [0, 1], ['#1B6C41', COLORS.activeCategory]),
    transform: [{ scale: pressed.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [COLORS.activeCategory, COLORS.background]),
  }));

  const iconAnimatedProps = useAnimatedProps(() => ({
    color: interpolateColor(progress.value, [0, 1], [COLORS.activeCategory, COLORS.background]),
  }));

  return (
    <AnimatedTouchable
      style={[styles.preferenceChip, active && styles.preferenceChipActive, chipStyle]}
      onPress={onPress}
      activeOpacity={0.9}
      onPressIn={() => {
        pressed.value = withSpring(0.965, { damping: 20, stiffness: 520, mass: 0.55 });
      }}
      onPressOut={() => {
        pressed.value = withSequence(
          withSpring(1.02, { damping: 16, stiffness: 620, mass: 0.55 }),
          withSpring(1, { damping: 18, stiffness: 520, mass: 0.55 }),
        );
      }}
    >
      <AnimatedIonicons name={icon} size={16} animatedProps={iconAnimatedProps} />
      <Animated.Text style={[styles.preferenceLabel, active && styles.preferenceLabelActive, labelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedTouchable>
  );
};

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [selectedPreference, setSelectedPreference] = useState(restaurant.vegOnly ? 'veg' : 'nonveg');

  const pickupWindow = useMemo(() => {
    const firstOption = restaurant.bagOptions?.[0];
    if (!firstOption) {
      return 'Today';
    }
    return `Today ${formatPickupTime(firstOption.pickupStart, firstOption.pickupEnd)}`;
  }, [restaurant.bagOptions]);

  const ratingBreakdown = useMemo(
    () => [
      { key: 'fairPortion', label: 'Fair Portion', value: restaurant.reviews?.fairPortion ?? restaurant.rating },
      { key: 'overallHygiene', label: 'Food Quality', value: restaurant.reviews?.overallHygiene ?? restaurant.rating },
      { key: 'freshness', label: 'Freshness', value: restaurant.reviews?.freshness ?? restaurant.rating },
    ],
    [restaurant.reviews, restaurant.rating],
  );

  const ingredientSummary = useMemo(() => {
    if (!restaurant.possibleIngredients?.length) {
      return 'A changing mix prepared from the day\'s best surplus items.';
    }
    const asText = restaurant.possibleIngredients.join(', ');
    return `A rotating mix can include ${asText}. Fresh selections vary daily based on surplus availability.`;
  }, [restaurant.possibleIngredients]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(260)} style={styles.animatedContainer}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />

              <View style={styles.heroInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaAccent}>{restaurant.timeToReach}-{restaurant.timeToReach + 10} mins</Text>
                  <Text style={styles.metaSeparator}>|</Text>
                  <Text style={styles.metaDefault}>{restaurant.distance.toFixed(1)} kms</Text>
                  <Text style={styles.metaSeparator}>|</Text>
                  <Text style={styles.metaDefault}>{restaurant.location}</Text>
                </View>
              </View>

              <View style={styles.ratingPill}>
                <Text style={styles.ratingPillValue}>{restaurant.rating.toFixed(1)} ★</Text>
                <Text style={styles.ratingPillCaption}>{restaurant.reviewCount} ratings</Text>
              </View>
            </View>

            <View style={styles.pickupRow}>
              <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.pickupLabel}>Pickup window:</Text>
              <Text style={styles.pickupValue}>{pickupWindow}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preference for Rescue Bag</Text>
            <View style={styles.preferenceRow}>
              {PREFERENCES.map((preference) => {
                const isActive = selectedPreference === preference.id;
                return (
                  <PreferenceChip
                    key={preference.id}
                    active={isActive}
                    icon={preference.icon}
                    label={preference.label}
                    onPress={() => setSelectedPreference(preference.id)}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rescue Bag</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bagList}>
              {restaurant.bagOptions.map((bagOption) => (
                <TouchableOpacity
                  key={bagOption.id}
                  style={styles.bagCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('Reservation', { restaurant, bagOption })}
                >
                  {bagOption.available <= 2 ? (
                    <View style={styles.stockPill}>
                      <Text style={styles.stockText}>Only {bagOption.available} Left</Text>
                    </View>
                  ) : null}

                  <View style={styles.bagIconWrap}>
                    <Ionicons name="bag-handle" size={72} color={COLORS.activeCategory} />
                  </View>

                  <Text style={styles.bagTitle}>{bagOption.type}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>₹{bagOption.originalPrice}</Text>
                    <Text style={styles.salePrice}> ₹{bagOption.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What you could get</Text>
            <Text style={styles.description}>{ingredientSummary}</Text>
            <View style={styles.sectionDivider} />
          </View>

          <View style={styles.section}>
            <View style={styles.ratingHeroRow}>
              <Image
                source={require('../../assets/images/assets/left_leaf.png')}
                style={styles.ratingLeafLeft}
                resizeMode="contain"
              />
              <Text style={styles.bigRating}>{restaurant.rating.toFixed(1)}/5</Text>
              <Image
                source={require('../../assets/images/assets/left_leaf.png')}
                style={styles.ratingLeafRight}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.ratingHeader}>Community Rating</Text>


            <View style={styles.breakdownRow}>
              {ratingBreakdown.map((item) => (
                <View key={item.key} style={styles.breakdownCard}>
                  <Text style={styles.breakdownValue}>{item.value.toFixed(1)}</Text>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  backButton: {
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  backText: {
    color: COLORS.textPrimary,
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.sm,
    letterSpacing: 0.2,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#F9FBFA',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantImage: {
    width: 62,
    height: 62,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#D1D5DB',
  },
  heroInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  restaurantName: {
    fontFamily: 'Gargoyle',
    fontSize: 30,
    color: '#0B271A',
    lineHeight: 34,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaAccent: {
    fontFamily: 'Saans-SemiBold',
    color: '#E8A7F8',
    fontSize: FONT_SIZES.sm,
  },
  metaDefault: {
    fontFamily: 'Saans',
    color: '#415B50',
    fontSize: FONT_SIZES.sm,
  },
  metaSeparator: {
    marginHorizontal: 6,
    color: '#88A29A',
    fontSize: FONT_SIZES.sm,
  },
  ratingPill: {
    minWidth: 86,
    backgroundColor: COLORS.activeCategory,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  ratingPillValue: {
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.lg,
    color: '#0A3522',
  },
  ratingPillCaption: {
    fontFamily: 'Saans',
    fontSize: 11,
    color: '#35573F',
  },
  pickupRow: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8E5',
    paddingTop: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pickupLabel: {
    fontFamily: 'Saans',
    color: '#4D655C',
    fontSize: FONT_SIZES.sm,
  },
  pickupValue: {
    fontFamily: 'Saans-SemiBold',
    color: '#203A30',
    fontSize: FONT_SIZES.sm,
  },
  section: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: 'Gargoyle',
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  preferenceChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#0C4D2A',
    borderWidth: 1,
    borderColor: '#1B6C41',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  preferenceChipActive: {
    backgroundColor: COLORS.activeCategory,
    borderColor: COLORS.activeCategory,
  },
  preferenceLabel: {
    fontFamily: 'Saans-SemiBold',
    color: COLORS.activeCategory,
    fontSize: FONT_SIZES.sm,
  },
  preferenceLabelActive: {
    color: COLORS.background,
  },
  bagList: {
    paddingRight: SPACING.md,
  },
  bagCard: {
    width: 190,
    backgroundColor: '#0B4E2A',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.md,
    marginRight: SPACING.md,
  },
  stockPill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.activeCategory,
  },
  stockText: {
    color: COLORS.background,
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.xs,
  },
  bagIconWrap: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  bagTitle: {
    fontFamily: 'Gargoyle',
    fontSize: 34,
    color: COLORS.textPrimary,
    lineHeight: 36,
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: '#7C958C',
    fontFamily: 'Saans',
    fontSize: FONT_SIZES.sm,
  },
  salePrice: {
    color: '#F2A2ED',
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.xl,
  },
  description: {
    fontFamily: 'Saans',
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    opacity: 0.7,
  },
  sectionDivider: {
    marginTop: SPACING.lg,
    height: 1,
    backgroundColor: 'rgba(248, 250, 252, 0.16)',
  },
  ratingHeader: {
    fontFamily: 'Saans-SemiBold',
    color: '#8CB69B',
    fontSize: FONT_SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  ratingHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -SPACING.md,
  },
  ratingLeafLeft: {
    width: 170,
    height: 108,
    opacity: 0.72,
    marginRight: -SPACING.xxl,
    transform: [{ translateX: 26 }],
    zIndex: 1,
  },
  ratingLeafRight: {
    width: 170,
    height: 108,
    opacity: 0.72,
    marginLeft: -SPACING.xxl,
    transform: [{ scaleX: -1 }, { translateX: 26 }],
    zIndex: 1,
  },
  bigRating: {
    textAlign: 'center',
    fontFamily: 'Saans-SemiBold',
    color: '#F2A2ED',
    fontSize: 64,
    lineHeight: 66,
    marginHorizontal: 0,
    zIndex: 2,
    elevation: 2,
  },
  breakdownRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#0B4E2A',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  breakdownValue: {
    fontFamily: 'Saans-SemiBold',
    color: '#F2A2ED',
    fontSize: FONT_SIZES.xxl,
    marginBottom: 2,
  },
  breakdownLabel: {
    fontFamily: 'Saans',
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 110,
  },
});

export default RestaurantDetailScreen;
