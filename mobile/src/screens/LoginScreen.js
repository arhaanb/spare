import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Device from 'expo-device';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AnimatedMeshGradient, AppleSignInButton, Button } from '../components';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [isSimulator] = useState(!Device.isDevice);

  const meshColors = useMemo(
    () => [
      { r: 0.08, g: 0.25, b: 0.24 },
      { r: 0.9, g: 0.84, b: 0.45 },
      { r: 0.6, g: 0.86, b: 0.78 },
      { r: 0.05, g: 0.18, b: 0.16 },
    ],
    [],
  );

  useEffect(() => {
    let mounted = true;

    const checkAvailability = async () => {
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (mounted) {
          setAppleAvailable(available);
        }
      } catch (error) {
        if (mounted) {
          setAppleAvailable(false);
        }
      }
    };

    if (Platform.OS === 'ios') {
      checkAvailability();
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleAppleSignIn = async () => {
    try {
      await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      signIn();
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') {
        return;
      }
      console.error('Apple sign-in error', error);
    }
  };

  const showApple = Platform.OS === 'ios' && appleAvailable && !isSimulator;

  return (
    <View style={styles.container}>
      <AnimatedMeshGradient
        colors={meshColors}
        speed={1.15}
        noise={0.2}
        blur={0.55}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />

      <View style={[styles.content, { paddingBottom: insets.bottom + SPACING.xl }]}>
        <View style={styles.brandBlock}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brand}>Spare</Text>
        </View>

        <Animated.View style={styles.card} entering={FadeInUp.duration(500)}>
          <Text style={styles.title}>Let’s get you started</Text>
          <Text style={styles.subtitle}>
            Create your account to discover discounted surplus meals nearby.
          </Text>
          {showApple ? (
            <AppleSignInButton onPress={handleAppleSignIn} />
          ) : (
            <Button
              title={'Continue'}
              onPress={signIn}
              size="large"
              style={styles.primaryButton}
              textStyle={styles.primaryButtonText}
            />
          )}

          <Text style={styles.footnote}>
            By continuing you agree to our Terms & Privacy Policy.
          </Text>
        </Animated.View>
      </View>
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
    backgroundColor: COLORS.overlayStrong,
  },
  brand: {
    fontFamily: COLORS.fontSerif,
    fontSize: 50,
    color: "#BCEB42",
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginTop: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  card: {
    backgroundColor: COLORS.surfaceStrong,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    gap: SPACING.lg,
  },
  title: {
    fontFamily: COLORS.fontSerif,
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.textOnDark,
    textAlign: 'left',
    marginBottom: -10,
  },
  subtitle: {
    fontFamily: COLORS.fontSans,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textOnMuted,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 5,
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
  footnote: {
    fontFamily: COLORS.fontSans,
    color: COLORS.textOnMuted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'left',
  },
});

export default LoginScreen;
