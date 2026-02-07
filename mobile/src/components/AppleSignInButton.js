import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const AppleSignInButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Ionicons name="logo-apple" size={20} color={COLORS.background} />
        <Text style={styles.text}>Continue with Apple</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    width: '100%',
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: COLORS.textOnDark,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontFamily: COLORS.fontSansSemiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.background,
  },
});

export default AppleSignInButton;
