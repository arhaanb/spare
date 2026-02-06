import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatPickupTime } from '../data/mockData';
import { useFavorites } from '../context/FavoritesContext';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RestaurantCard = ({ restaurant, onPress, variant = 'default' }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(restaurant.id);
  const likedProgress = useSharedValue(favorite ? 1 : 0);
  const heartScale = useSharedValue(1);
  const glowPulse = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const firstBag = restaurant.bagOptions?.[0];
  const pickupTimeDisplay = firstBag
    ? formatPickupTime(firstBag.pickupStart, firstBag.pickupEnd)
    : 'Check availability';

  const lowestPrice = restaurant.bagOptions
    ? Math.min(...restaurant.bagOptions.map(b => b.price))
    : 0;

  const originalPrice = restaurant.bagOptions
    ? Math.min(...restaurant.bagOptions.map(b => b.originalPrice))
    : 0;

  const handleFavoritePress = (e) => {
    e.stopPropagation();
    toggleFavorite(restaurant.id);

    // Animate immediately (optimistic) so it feels responsive.
    likedProgress.value = withTiming(favorite ? 0 : 1, { duration: 110 });
    heartScale.value = withSpring(1.18, { damping: 10, stiffness: 280 }, () => {
      heartScale.value = withSpring(1, { damping: 12, stiffness: 280 });
    });

    // Glow only when adding to favourites (not when removing).
    if (!favorite) {
      glowPulse.value = withTiming(1, { duration: 70 }, () => {
        glowPulse.value = withTiming(0, { duration: 240 });
      });
    } else {
      glowPulse.value = 0;
    }
  };

  // Keep animation state in sync if favorites change externally.
  React.useEffect(() => {
    likedProgress.value = withTiming(favorite ? 1 : 0, { duration: 110 });
  }, [favorite, likedProgress]);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  // Gradient burst: only shows during the tap animation.
  // Important: animate the React Native wrapper (not Skia props),
  // otherwise Skia will receive objects instead of numbers.
  const glowWrapAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: 0.9 + glowPulse.value * 0.5 }],
  }));

  const heartFilledStyle = useAnimatedStyle(() => ({
    opacity: likedProgress.value,
  }));

  const heartOutlineStyle = useAnimatedStyle(() => ({
    opacity: 1 - likedProgress.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        variant === 'large' && styles.containerLarge,
        variant === 'grid' && styles.containerGrid,
        cardAnimatedStyle,
      ]}
      onPress={() => onPress(restaurant)}
      activeOpacity={0.8}
      onPressIn={() => {
        cardScale.value = withSpring(0.97, { damping: 18, stiffness: 320, mass: 0.7 });
      }}
      onPressOut={() => {
        cardScale.value = withSequence(
          withSpring(1.02, { damping: 14, stiffness: 360, mass: 0.7 }),
          withSpring(1, { damping: 16, stiffness: 300, mass: 0.7 }),
        );
      }}
    >
      {/* Image with overlays */}
      <View style={[
        styles.imageContainer,
        (variant === 'large' || variant === 'grid') && styles.imageContainerLarge
      ]}>
        <Image
          source={{ uri: restaurant.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View pointerEvents="none" style={styles.imageOverlay} />

        {/* Price Badge - Top Left */}
        <View style={styles.priceBadge}>
          <Text style={styles.originalPrice}>₹{originalPrice}</Text>
          <Text style={styles.discountedPrice}>₹{lowestPrice}</Text>
        </View>

        {/* Favorite Heart - Top Right */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <Animated.View style={heartAnimatedStyle}>
            <View style={styles.heartIconWrap}>
              <Animated.View pointerEvents="none" style={[styles.heartGlowWrap, glowWrapAnimatedStyle]}>
                <Canvas style={styles.heartGlowCanvas}>
                  <Circle cx={19} cy={19} r={18}>
                    <RadialGradient
                      c={vec(19, 19)}
                      r={18}
                      colors={[
                        'rgba(226, 150, 215, 0.55)',
                        'rgba(226, 150, 215, 0.22)',
                        'rgba(226, 150, 215, 0.0)',
                      ]}
                      positions={[0, 0.55, 1]}
                    />
                  </Circle>
                </Canvas>
              </Animated.View>
              <Animated.View style={[styles.heartLayer, heartOutlineStyle]}>
                <Ionicons name="heart-outline" size={18} color={COLORS.highlightPink} />
              </Animated.View>
              <Animated.View style={[styles.heartLayer, heartFilledStyle]}>
                <Ionicons name="heart" size={18} color={COLORS.highlightPink} />
              </Animated.View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
            <Text style={styles.starIcon}>★</Text>
          </View>
        </View>

        <Text style={styles.infoText} numberOfLines={1}>
          {restaurant.distance} kms  |  Pickup: {pickupTimeDisplay.toLowerCase()}
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 170,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginRight: SPACING.md,
    ...SHADOWS.md,
  },
  containerLarge: {
    width: '100%',
    marginRight: 0,
  },
  containerGrid: {
    width: '100%',
    marginRight: 0,
  },
  imageContainer: {
    height: 100,
    position: 'relative',
    backgroundColor: COLORS.border,
  },
  imageContainerLarge: {
    height: undefined,
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Subtle dark overlay so top-right icon stays visible.
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
  },
  priceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryAccent,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  originalPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    textDecorationLine: 'line-through',
    marginRight: SPACING.xs,
    opacity: 0.8,
  },
  discountedPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.background,
    fontFamily: 'Saans-Bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    overflow: 'visible',
  },
  heartIconWrap: {
    width: 38,
    height: 38,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartGlowCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 38,
    height: 38,
  },
  heartGlowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 38,
    height: 38,
  },
  heartLayer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  restaurantName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: SPACING.xs,
    fontFamily: 'Gargoyle',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.starActive,
    fontFamily: 'Saans-Medium',
    marginRight: 2,
  },
  starIcon: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.starActive,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary, // Changed to grey
    fontFamily: 'Saans',
    opacity: 0.7, // Reduced opacity
  },
});

export default RestaurantCard;
