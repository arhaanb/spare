import React, { useMemo, useState, useRef } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatPickupTime, restaurants } from '../data/mockData';
import { RestaurantCard, ActiveOrderBanner } from '../components';
import BagSelectionModal from '../components/BagSelectionModal';
import ItemSelectionModal from '../components/ItemSelectionModal';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import RegularBagIconLocal from '../../assets/images/assets/bags/regular.svg';
import LargeBagIconLocal from '../../assets/images/assets/bags/large.svg';
import MakeItYourselfIconLocal from '../../assets/images/assets/bags/makeyourown.svg';

import VegIcon from '../../assets/images/assets/foodtype/veg.svg';
import VegIconDark from '../../assets/images/assets/foodtype/veg-dark.svg';
import NonVegIcon from '../../assets/images/assets/foodtype/nonveg.svg';
import NonVegIconDark from '../../assets/images/assets/foodtype/nonveg-dark.svg';
import JainIcon from '../../assets/images/assets/foodtype/jain.svg';
import JainIconDark from '../../assets/images/assets/foodtype/jain-dark.svg';

const PREFERENCES = [
  { id: 'veg', label: 'Veg Only', icon: VegIcon, iconDark: VegIconDark },
  { id: 'nonveg', label: 'Non-Veg Only', icon: NonVegIcon, iconDark: NonVegIconDark },
  { id: 'jain', label: 'Jain Only', icon: JainIcon, iconDark: JainIconDark },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const BagCard = ({ bagOption, onPress, isSelected, selectedPreference }) => {
  const pressed = useSharedValue(1);
  const borderWidth = useSharedValue(isSelected ? 2 : 0);
  const checkmarkScale = useSharedValue(isSelected ? 1 : 0);
  const isUnavailable = bagOption.available === 0;
  const opacity = useSharedValue(isUnavailable ? 0.5 : 1);

  React.useEffect(() => {
    borderWidth.value = withSpring(isSelected ? 2 : 0, { damping: 20, stiffness: 300 });
    checkmarkScale.value = withSpring(isSelected ? 1 : 0, { damping: 20, stiffness: 200 });
  }, [isSelected, borderWidth, checkmarkScale]);

  React.useEffect(() => {
    const targetOpacity = bagOption.available === 0 ? 0.5 : 1;
    opacity.value = withSpring(targetOpacity, {
      damping: 15,
      stiffness: 150,
      mass: 0.8
    });
  }, [bagOption.available, opacity]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
    borderWidth: borderWidth.value,
    borderColor: COLORS.activeCategory,
    opacity: opacity.value,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  // Determine which icon to use based on bag role
  const getBagIcon = () => {
    const role = bagOption.role;

    const configs = {
      regular: { size: 52, marginTop: -16, alignItems: 'center' },
      large: { size: 76, marginTop: -32, alignItems: 'center' },
      diy: { size: 94, marginTop: -42, alignItems: 'flex-end', extraStyle: { marginRight: -20 } },
    };

    const config = configs[role] || configs.regular;

    let icon;
    if (role === 'large') {
      icon = <LargeBagIconLocal height={config.size} />;
    } else if (role === 'diy') {
      icon = <MakeItYourselfIconLocal height={config.size} />;
    } else {
      icon = <RegularBagIconLocal height={config.size} />;
    }

    return { icon, marginTop: config.marginTop, alignItems: config.alignItems, extraStyle: config.extraStyle };
  };

  const { icon, marginTop, alignItems, extraStyle } = getBagIcon();

  return (
    <AnimatedTouchable
      style={[styles.bagCard, cardAnimatedStyle]}
      activeOpacity={isUnavailable ? 1 : 0.9}
      onPress={() => !isUnavailable && onPress(bagOption)}
      disabled={isUnavailable}
      onPressIn={() => {
        if (!isUnavailable) {
          pressed.value = withSpring(0.96, { damping: 20, stiffness: 520, mass: 0.55 });
        }
      }}
      onPressOut={() => {
        if (!isUnavailable) {
          pressed.value = withSequence(
            withSpring(1.02, { damping: 16, stiffness: 620, mass: 0.55 }),
            withSpring(1, { damping: 18, stiffness: 520, mass: 0.55 }),
          );
        }
      }}
    >
      <View style={styles.pillContainer}>
        {isUnavailable ? (
          <View style={[styles.stockPill, { backgroundColor: COLORS.activeCategory }]}>
            <Text style={[styles.stockText, { color: COLORS.background }]}>Unavailable</Text>
          </View>
        ) : bagOption.available < 5 ? (
          <View style={[styles.stockPill, { backgroundColor: COLORS.inactiveCategory }]}>
            <Text style={[styles.stockText, { color: COLORS.activeCategory }]}>Only {bagOption.available} Left</Text>
          </View>
        ) : null}
      </View>

      {/* Selection Checkmark */}
      {isSelected && (
        <Animated.View style={[styles.checkmarkBadge, checkmarkStyle]}>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.activeCategory} />
        </Animated.View>
      )}

      <View style={styles.cardContent}>
        <View style={[styles.bagIconWrap, { marginTop, alignItems }, extraStyle]}>
          {icon}
        </View>

        <View style={styles.bagInfoBottom}>
          {/* <Text style={styles.bagPreference}>
            {selectedPreference === 'veg' ? '🌱 Veg Only' : selectedPreference === 'nonveg' ? '🍖 Non-Veg' : '🙏 Jain Only'}
          </Text> */}
          <Text style={styles.bagTitle} numberOfLines={2}>
            {bagOption.type}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.originalPrice}>₹{bagOption.originalPrice}</Text>
            <Text style={styles.salePrice}>₹{bagOption.price}</Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const PreferenceChip = ({ active, icon: Icon, iconDark: IconDark, label, onPress, count = 0 }) => {
  const pressed = useSharedValue(1);
  const progress = useSharedValue(active ? 1 : 0);
  const badgeScale = useSharedValue(count > 0 ? 1 : 0);
  const selectionScale = useSharedValue(1);

  React.useEffect(() => {
    // Bouncy spring animation for the chip background/border
    progress.value = withSpring(active ? 1 : 0, {
      damping: 15,
      stiffness: 200,
      mass: 0.8
    });
    // Add a subtle bounce when selected
    if (active) {
      selectionScale.value = withSequence(
        withSpring(1.05, { damping: 12, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    }
  }, [active, progress, selectionScale]);

  React.useEffect(() => {
    if (count > 0) {
      badgeScale.value = withSpring(1, {
        damping: 12,
        stiffness: 180,
        mass: 0.8
      });
    } else {
      badgeScale.value = withSpring(0, { damping: 20, stiffness: 200 });
    }
  }, [count, badgeScale]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#134631', COLORS.activeCategory]),
    borderColor: interpolateColor(progress.value, [0, 1], ['#1B6C41', COLORS.activeCategory]),
    transform: [{ scale: pressed.value * selectionScale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [COLORS.activeCategory, COLORS.background]),
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeScale.value,
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
      <View style={styles.chipLabelContainer}>
        <Animated.Text style={[styles.preferenceLabel, labelStyle]} numberOfLines={1}>
          {label}
        </Animated.Text>
      </View>
      {count > 0 && (
        <Animated.View style={[styles.preferenceBadge, badgeStyle]}>
          <Text style={styles.preferenceBadgeText}>{count}</Text>
        </Animated.View>
      )}
    </AnimatedTouchable>
  );
};

const RestaurantDetailScreen = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const { addToCart, removeFromCart, isInCart, getCartItem, getItemCountByPreference, getCartItemCount, items } = useCart();
  const { hasActiveOrder, activeOrder } = useOrder();
  const [selectedPreference, setSelectedPreference] = useState('veg');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBag, setSelectedBag] = useState(null);
  const itemSelectionRef = useRef(null);
  const scrollViewRef = useRef(null);
  const ratingsY = useRef(0);

  const scrollToRatings = () => {
    scrollViewRef.current?.scrollTo({
      y: ratingsY.current,
      animated: true,
    });
  };


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

  const handleLocationPress = () => {
    const query = encodeURIComponent(`${restaurant.name}, ${restaurant.location}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };


  const ingredientSummary = useMemo(() => {
    if (!restaurant.possibleIngredients?.length) {
      return 'A changing mix prepared from the day\'s best surplus items.';
    }
    const asText = restaurant.possibleIngredients.join(', ');
    return `A rotating mix can include ${asText}. Fresh selections vary daily based on surplus availability.`;
  }, [restaurant.possibleIngredients]);

  const similarRestaurants = useMemo(() => {
    return restaurants.filter(r => r.category === restaurant.category && r.id !== restaurant.id);
  }, [restaurant]);

  const handleBagPress = (bagOption) => {
    // Don't open modal for "Make it yourself" - will be handled differently later
    // For "Make it yourself", open the item selection modal
    if (bagOption.role === 'diy') {
      setSelectedBag(bagOption);
      itemSelectionRef.current?.present();
      return;
    }

    setSelectedBag(bagOption);
    setModalVisible(true);
  };

  const handleAddToCart = (quantity) => {
    if (selectedBag) {
      const itemId = `${restaurant.id}-${selectedBag.id || selectedBag.role}-${selectedPreference}`;

      if (quantity === 0) {
        // Remove from cart
        removeFromCart(itemId);
      } else {
        // Add or update cart
        addToCart(selectedBag, quantity, selectedPreference, restaurant);
      }
    }
  };

  const handleDiyAddToCart = (selectedItems, diyPreference) => {
    if (selectedBag) {
      // Create a unique bag option for this specific selection
      // We append a timestamp or random string to ID to allow multiple DIY bags with different items
      const uniqueId = `diy-${Date.now()}`;

      const customBag = {
        ...selectedBag,
        id: uniqueId,
        selectedItems: selectedItems, // Pass the list of selected items
        isCustom: true
      };

      // Use the preference from the modal (allows user to change it within the modal)
      const preferenceToUse = diyPreference || selectedPreference;

      // Add to cart with quantity 1 (since it's a specific custom bag)
      addToCart(customBag, 1, preferenceToUse, restaurant);
    }
  };

  const handlePreferenceChange = (preferenceId) => {
    setSelectedPreference(preferenceId);
  };

  const handleViewCart = () => {
    navigation.navigate('Cart');
  };

  const handleActiveOrderPress = () => {
    if (activeOrder) {
      navigation.navigate('OrderConfirmation', {
        orderCode: activeOrder.orderCode,
        total: activeOrder.total,
        itemCount: activeOrder.itemCount,
        expiresAt: activeOrder.expiresAt.toISOString(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={FadeIn.duration(260)} style={styles.animatedContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerArea}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />

              <View style={styles.heroInfo}>
                <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaAccent}>{restaurant.timeToReach}-{restaurant.timeToReach + 10} mins</Text>
                  <Text style={styles.metaSeparator}>|</Text>
                  <Text style={styles.metaDefault}>{restaurant.distance.toFixed(1)} kms</Text>
                </View>

                <TouchableOpacity
                  style={styles.locationRow}
                  onPress={handleLocationPress}
                  activeOpacity={0.6}
                >
                  <Ionicons name="location-sharp" size={14} color="#E8A7F8" />
                  <Text style={styles.locationText} numberOfLines={1}>{restaurant.location}</Text>
                  <Ionicons name="chevron-forward" size={10} color="#415B50" style={{ marginLeft: 2 }} />
                </TouchableOpacity>

              </View>

              <TouchableOpacity
                style={styles.ratingPill}
                onPress={scrollToRatings}
                activeOpacity={0.7}
              >
                <Text style={styles.ratingValue}>{restaurant.rating.toFixed(1)} <Text style={{ fontSize: 13 }}>★</Text></Text>
                <Text style={styles.ratingCount}>{(restaurant.reviewCount / 100).toFixed(1)}k+ ratings</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickupRow}>
              <Ionicons name="stopwatch-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.pickupLabel}>Pickup window:</Text>
              <Text style={styles.pickupValue}>{pickupWindow}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>Diet Preference</Text>
            <View style={styles.preferenceRow}>
              {PREFERENCES.map((preference) => {
                const isActive = selectedPreference === preference.id;
                const count = getItemCountByPreference(preference.id, restaurant.id);
                return (
                  <PreferenceChip
                    key={preference.id}
                    active={isActive}
                    icon={preference.icon}
                    iconDark={preference.iconDark}
                    label={preference.label}
                    count={count}
                    onPress={() => handlePreferenceChange(preference.id)}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Rescue Bag
            </Text>
            <Text style={styles.sectionSubtitle}>
              {PREFERENCES.find(p => p.id === selectedPreference)?.label || 'Selected'}
            </Text>
            <View style={styles.bagList}>
              {[
                { role: 'regular', label: 'Regular' },
                { role: 'large', label: 'Large' },
                { role: 'diy', label: 'Make it yourself' },
              ].map((config, index) => {
                // Map mock data bagOptions to these roles by index
                // ensuring we always show 3 bags as requested
                const apiData = restaurant.bagOptions?.[index] || {};

                // Compute availability based on preference
                const isUnavailableForPreference = apiData.unavailableFor?.includes(selectedPreference);

                let rawAvailable = apiData.available;
                // Handle both number and object formats for backward compatibility
                if (typeof rawAvailable === 'object' && rawAvailable !== null) {
                  rawAvailable = rawAvailable[selectedPreference] ?? 0;
                }

                const computedAvailable = isUnavailableForPreference ? 0 : (rawAvailable ?? 5);

                const bagData = {
                  ...apiData,
                  role: config.role,
                  type: config.label,
                  // Use provided prices if missing in data
                  price: apiData.price || (config.role === 'regular' ? 79 : config.role === 'large' ? 109 : 129),
                  originalPrice: apiData.originalPrice || (config.role === 'diy' ? 299 : 199),
                  available: computedAvailable,
                };

                const bagId = bagData.id || bagData.role;
                let inCart = false;

                if (config.role === 'diy') {
                  // For DIY, check if ANY item in cart is a custom bag with this preference
                  inCart = items.some(item =>
                    item.bagOption.role === 'diy' &&
                    item.preference === selectedPreference &&
                    item.restaurant.id === restaurant.id
                  );
                } else {
                  inCart = isInCart(restaurant.id, bagId, selectedPreference);
                }

                // Mutual exclusivity logic
                const hasCustomBags = items.some(i => i.restaurant.id === restaurant.id && i.bagOption.role === 'diy');
                const hasRegularBags = items.some(i => i.restaurant.id === restaurant.id && i.bagOption.role !== 'diy');

                let isDisabled = false;
                if (config.role === 'diy' && hasRegularBags) {
                  isDisabled = true;
                } else if (config.role !== 'diy' && hasCustomBags) {
                  isDisabled = true;
                }

                return (
                  <BagCard
                    key={`${config.role}-${selectedPreference}-${isDisabled}`}
                    bagOption={{ ...bagData, available: isDisabled ? 0 : bagData.available }} // Visually disable by setting available to 0 if conflict
                    isSelected={inCart}
                    selectedPreference={selectedPreference}
                    onPress={handleBagPress}
                  />
                );
              })}
            </View>
            <Text style={styles.bagRestrictionCaption}>
              *You can only order Custom Bags OR Regular/Large Bags, not both.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: SPACING.md }]}>What you could get</Text>
            <Text style={styles.description}>{ingredientSummary}</Text>
            <View style={styles.sectionDivider} />
          </View>

          <View
            style={styles.section}
            onLayout={(event) => {
              ratingsY.current = event.nativeEvent.layout.y;
            }}
          >
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

            <View style={{ paddingHorizontal: SPACING.lg }}>
              <Text style={{ fontSize: FONT_SIZES.sm, fontFamily: 'Saans-SemiBold', color: COLORS.textPrimary, marginBottom: SPACING.md, textAlign: 'center' }}>Rating Breakdown</Text>
            </View>

            <View style={styles.breakdownRow}>
              {ratingBreakdown.map((item) => (
                <View key={item.key} style={styles.breakdownCard}>
                  <Text style={styles.breakdownValue}>{item.value.toFixed(1)}</Text>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {similarRestaurants.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }]}>Similar Restaurants</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {similarRestaurants.map((item) => (
                  <RestaurantCard
                    key={item.id}
                    restaurant={item}
                    onPress={(r) => navigation.push('RestaurantDetail', { restaurant: r })}
                  />
                ))}
              </ScrollView>
            </View>
          )}
          {/* Dynamic Bottom Padding to account for CartIndicator and ActiveOrderBanner */}
          <View style={[
            styles.bottomPadding,
            { height: (getCartItemCount() > 0 ? 80 : 0) + (hasActiveOrder ? 80 : 0) + 20 }
          ]} />
        </ScrollView>

        {/* Item Selection Modal for DIY */}
        <ItemSelectionModal
          sheetRef={itemSelectionRef}
          bagOption={selectedBag}
          restaurant={restaurant}
          selectedPreference={selectedPreference}
          onAddToCart={handleDiyAddToCart}
        />

        {/* Bag Selection Modal */}
        <BagSelectionModal
          visible={modalVisible}
          bagOption={selectedBag}
          restaurant={restaurant}
          preference={selectedPreference}
          onClose={() => setModalVisible(false)}
          onAddToCart={handleAddToCart}
          initialQuantity={selectedBag ? (getCartItem(restaurant.id, selectedBag.id || selectedBag.role, selectedPreference)?.quantity || 0) : 0}
        />

        {/* Cart Indicator */}
      </Animated.View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Dark green background for entire screen
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
  headerArea: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    ...SHADOWS.sm,
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
    fontFamily: 'Saans-Bold',
    fontSize: 24,
    color: '#0B271A',
    lineHeight: 28,
    marginBottom: 2,
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
    marginHorizontal: 8,
    color: '#E2E8E5',
    fontSize: FONT_SIZES.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Saans',
    color: '#415B50',
    fontSize: FONT_SIZES.sm,
    marginLeft: 4,
    marginRight: 2,
    textDecorationLine: 'none',
  },

  ratingPill: {
    backgroundColor: '#C6F04D',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  ratingValue: {
    fontFamily: 'Saans-Bold',
    fontSize: 16,
    color: '#0A3522',
    lineHeight: 20,
  },
  ratingCount: {
    fontFamily: 'Saans',
    fontSize: 9,
    color: '#35573F',
    marginTop: -2,
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
    marginTop: 42, // Increased gap as requested
    paddingHorizontal: SPACING.lg,
  },
  similarSection: {
    marginTop: 42,
  },
  horizontalScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: 'Gargoyle',
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontFamily: 'Saans',
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.lg,
    opacity: 0.9,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  preferenceChip: {
    flex: 1,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#134631',
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIconContainer: {
    height: '100%',
    marginLeft: -14, // Pull icon towards the edge
    justifyContent: 'center',
  },
  chipLabelContainer: {
    flex: 1,
    paddingRight: 6,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontFamily: 'Gargoyle', // As seen in image
    fontSize: 12,
    textAlign: 'center',
    marginLeft: -18
  },
  preferenceBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF6B6B',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  preferenceBadgeText: {
    fontFamily: 'Saans',
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  preferenceLabelActive: {
    color: COLORS.background,
  },
  bagList: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  bagRestrictionCaption: {
    fontFamily: 'Saans',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  bagCard: {
    flex: 1,
    backgroundColor: '#0B4E2A',
    borderRadius: 10, // Less rounded than xl
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
    paddingTop: 0, // Remove top padding to prevent cutting
    alignItems: 'center',
    minHeight: 140,
    overflow: 'hidden', // Clip icons to card boundaries
  },
  checkmarkBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 10,
  },
  pillContainer: {
    width: '100%',
    height: 24,
    marginTop: 8,
    paddingHorizontal: SPACING.xs,
    marginBottom: 4,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Move items towards top
    width: '100%',
    paddingBottom: SPACING.xs,
  },
  stockPill: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.activeCategory,
    marginLeft: 2, // Move slightly inwards
  },
  stockText: {
    color: COLORS.background,
    fontFamily: 'Saans-SemiBold',
    fontSize: FONT_SIZES.xs,
  },
  bagIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bagInfoBottom: {
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.xs,
  },
  bagPreference: {
    fontFamily: 'Saans-Bold',
    fontSize: 9,
    color: COLORS.activeCategory,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  bagTitle: {
    fontFamily: 'Gargoyle',
    fontSize: 22,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
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
    fontSize: FONT_SIZES.lg,
  },
  description: {
    fontFamily: 'Saans',
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
    opacity: 0.7,
  },
  sectionDivider: {
    // marginTop: SPACING.lg,
    marginVertical: SPACING.md,
    marginTop: 30,
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
    width: 140,
    height: 80,
    opacity: 0.6,
    marginRight: -45,
    transform: [{ rotate: '-10deg' }],
  },
  ratingLeafRight: {
    width: 140,
    height: 80,
    opacity: 0.6,
    marginLeft: -45,
    transform: [{ scaleX: -1 }, { rotate: '-10deg' }],
  },
  bigRating: {
    textAlign: 'center',
    fontFamily: 'Saans-Bold',
    color: '#F2A2ED',
    fontSize: 56,
    lineHeight: 64,
  },
  breakdownRow: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#134631',
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  breakdownValue: {
    fontFamily: 'Saans-Bold',
    fontSize: 24,
    color: '#E8A7F8',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontFamily: 'Saans',
    color: COLORS.activeCategory,
    fontSize: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 110,
  },
});

export default RestaurantDetailScreen;
