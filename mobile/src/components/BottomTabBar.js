import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

const tabs = [
  { id: 'explore', label: 'Explore', icon: 'bag-handle-outline', activeIcon: 'bag-handle' },
  { id: 'favourites', label: 'Favourites', icon: 'heart-outline', activeIcon: 'heart' },
  { id: 'profile', label: 'Profile', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabItem = ({ tab, isActive, onPress }) => {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isActive, progress]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.98 + progress.value * 0.06 }],
    opacity: 0.78 + progress.value * 0.22,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [COLORS.tabBarInactive, COLORS.tabBarActive]),
    opacity: 0.75 + progress.value * 0.25,
  }));

  return (
    <AnimatedTouchable style={styles.tab} onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={iconStyle}>
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={24}
          color={isActive ? COLORS.tabBarActive : COLORS.tabBarInactive}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, labelStyle, isActive && styles.tabLabelActive]}>
        {tab.label}
      </Animated.Text>
    </AnimatedTouchable>
  );
};

const BottomTabBar = ({ activeTab = 'explore', onTabPress }) => {
  const blurFlash = useSharedValue(0);

  const blurFlashStyle = useAnimatedStyle(() => ({
    opacity: blurFlash.value,
    transform: [{ scale: 0.985 + blurFlash.value * 0.015 }],
  }));

  const handleTabPress = (tabId) => {
    blurFlash.value = 0;
    blurFlash.value = withTiming(0.85, { duration: 110, easing: Easing.out(Easing.quad) }, () => {
      blurFlash.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) });
    });
    onTabPress?.(tabId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Animated.View pointerEvents="none" style={[styles.blurFlash, blurFlashStyle]} />
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => handleTabPress(tab.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBarBackground,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.tabBarBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    width: '100%',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  blurFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BORDER_RADIUS.full,
  },
  tab: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  tabLabel: {
    marginTop: 7,
    minHeight: FONT_SIZES.md + 2,
    minWidth: 70,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    fontFamily: 'Saans',
  },
  tabLabelActive: {
    fontWeight: '600',
  },
});

export default BottomTabBar;
