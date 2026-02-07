import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedRe, {
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedMeshGradient, Button } from '../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  {
    key: 'save',
    title: 'Save meals,\nnot moments',
    subtitle:
      'Reserve surplus dishes from top kitchens and enjoy great food at lower prices.',
    accent: 'Save up to 60%',
  },
  {
    key: 'nearby',
    title: 'Pick up\nnear you',
    subtitle:
      'Fresh offers nearby, updated daily so you can grab a deal on your way home.',
    accent: 'Local & affordable',
  },
  {
    key: 'impact',
    title: 'Do good\nwith every bite',
    subtitle:
      'Every order keeps food in circulation and supports a more sustainable city.',
    accent: 'Sustainable choices',
  },
];

const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAuth();
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const transitionOpacity = useSharedValue(0);

  const meshColors = useMemo(
    () => [
      { r: 0.05, g: 0.28, b: 0.3 },
      { r: 0.92, g: 0.86, b: 0.55 },
      { r: 0.6, g: 0.82, b: 0.72 },
      { r: 0.08, g: 0.2, b: 0.18 },
    ],
    [],
  );

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: transitionOpacity.value,
  }));

  const finishOnboarding = () => {
    transitionOpacity.value = withTiming(1, { duration: 450 }, () => {
      runOnJS(completeOnboarding)();
    });
  };

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <View style={styles.container}>
      <AnimatedMeshGradient
        colors={meshColors}
        speed={1.15}
        noise={0.2}
        blur={0.5}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.lg }]}>
        <Text style={styles.brand}>Spare</Text>
        <Pressable onPress={finishOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Animated.FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}> 
              <AnimatedRe.View style={styles.slideCard} entering={FadeInUp.duration(450)}>
                <Text style={styles.accent}>{item.accent}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </AnimatedRe.View>
            </View>
          )}
        />

        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={`dot-${index}`}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.xl }]}>
        <Button
          title={activeIndex === SLIDES.length - 1 ? 'Start Exploring' : 'Next'}
          onPress={() => {
            if (activeIndex === SLIDES.length - 1) {
              finishOnboarding();
            } else {
              const nextIndex = activeIndex + 1;
              const offset = nextIndex * width;
              listRef.current?.scrollToOffset({ offset, animated: true });
            }
          }}
          size="large"
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
        />
        <Text style={styles.footerText}>Great food, less waste. Always.</Text>
      </View>

      <AnimatedRe.View pointerEvents="none" style={[styles.transitionOverlay, overlayStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlaySoft,
  },
  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: COLORS.fontSerif,
    fontSize: 28,
    color: COLORS.textOnDark,
    letterSpacing: 0.4,
  },
  skipButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
  },
  skipText: {
    fontFamily: COLORS.fontSansMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textOnDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  slideCard: {
    backgroundColor: COLORS.surfaceStrong,
    borderRadius: BORDER_RADIUS.xxl,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  accent: {
    fontFamily: COLORS.fontSansMedium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.activeCategory,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: COLORS.fontSerif,
    fontSize: FONT_SIZES.display,
    color: COLORS.textOnDark,
    lineHeight: 44,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontFamily: COLORS.fontSans,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textOnMuted,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: COLORS.textOnDark,
    marginHorizontal: 6,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.activeCategory,
  },
  primaryButtonText: {
    fontFamily: COLORS.fontSansSemiBold,
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
  },
  footerText: {
    textAlign: 'center',
    fontFamily: COLORS.fontSans,
    color: COLORS.textOnMuted,
    fontSize: FONT_SIZES.sm,
  },
});

export default OnboardingScreen;
