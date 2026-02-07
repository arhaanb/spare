import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Placeholder illustrations using emoji for now
const categoryEmojis = {
  breakfast: '🥐',
  dinner: '🥡',
  grocery: '🥬',
  dessert: '🍰',
  desserts: '🍰', // alias for backwards compatibility
};

const CategoryCard = ({ category, isSelected, onPress }) => {
  const emoji = categoryEmojis[category.id] || '🍽️';
  const InactiveSvg = category.iconInactiveSvg;
  const ActiveSvg = category.iconActiveSvg;
  const IconSvg = isSelected ? ActiveSvg : InactiveSvg;
  const iconSize = category.iconSize ?? 96;
  const iconOffsetY = category.iconOffsetY ?? -32;
  const pressed = useSharedValue(1);
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    selectedProgress.value = withTiming(isSelected ? 1 : 0, { duration: 100 });
  }, [isSelected, selectedProgress]);


  const cardAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [COLORS.inactiveCategory, COLORS.activeCategory],
    );
    return {
      backgroundColor,
      transform: [{ scale: pressed.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      selectedProgress.value,
      [0, 1],
      [COLORS.inactiveCategoryText, COLORS.activeCategoryText],
    );
    return { color };
  });

  return (
    <AnimatedTouchable
      style={[styles.categoryCard, cardAnimatedStyle]}
      onPress={() => onPress(category.id)}
      activeOpacity={0.7}
      onPressIn={() => {
        pressed.value = withSpring(0.97, { damping: 20, stiffness: 600, mass: 0.5 });
      }}
      onPressOut={() => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 600, mass: 0.5 });
      }}
    >
      <View style={[styles.imageContainer, { marginTop: iconOffsetY }]}>
        {IconSvg ? (
          <IconSvg width={iconSize} height={iconSize} />
        ) : (
          <Text style={[styles.placeholderEmoji, isSelected && styles.placeholderEmojiSelected]}>{emoji}</Text>
        )}
      </View>
      <Animated.Text
        style={[styles.categoryText, textAnimatedStyle]}
        numberOfLines={1}
        ellipsizeMode="clip"
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        allowFontScaling={false}
      >
        {category.name}
      </Animated.Text>
    </AnimatedTouchable>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardsWrapper}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={onSelectCategory}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  cardsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: SPACING.xs,
    paddingHorizontal: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 70,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 0,
  },
  placeholderEmoji: {
    fontSize: 40,
    opacity: 0.8,
  },
  placeholderEmojiSelected: {
    opacity: 1,
  },
  categoryText: {
    width: '100%',
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    lineHeight: 18,
    fontFamily: 'Gargoyle',
    marginBottom: 4,
    paddingHorizontal: 2,
  },
});

export default CategoryFilter;
