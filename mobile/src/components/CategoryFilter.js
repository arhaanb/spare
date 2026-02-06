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
  const pressed = useSharedValue(1);
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    selectedProgress.value = withTiming(isSelected ? 1 : 0, { duration: 160 });
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
        pressed.value = withSpring(0.96, { damping: 20, stiffness: 520, mass: 0.55 });
      }}
      onPressOut={() => {
        pressed.value = withSequence(
          withSpring(1.02, { damping: 16, stiffness: 620, mass: 0.55 }),
          withSpring(1, { damping: 18, stiffness: 520, mass: 0.55 }),
        );
      }}
    >
      <View style={styles.imageContainer}>
        <Text style={[styles.placeholderEmoji, isSelected && styles.placeholderEmojiSelected]}>{emoji}</Text>
      </View>
      <Animated.Text style={[styles.categoryText, textAnimatedStyle]}>{category.name}</Animated.Text>
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
    width: '23%', // Roughly 4 cards per row
    aspectRatio: 0.85,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    opacity: 0.8,
  },
  placeholderEmojiSelected: {
    opacity: 1,
  },
  categoryText: {
    fontSize: FONT_SIZES.md,
    fontFamily: 'Gargoyle',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
});

export default CategoryFilter;
