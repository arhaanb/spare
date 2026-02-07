import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { FavoritesProvider } from './src/context/FavoritesContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

import {
  HomeScreen,
  RestaurantDetailScreen,
  ReservationScreen,
  OnboardingScreen,
  LoginScreen,
} from './src/screens';
import { COLORS } from './src/constants/theme';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'fade',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'fade',
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen
      name="RestaurantDetail"
      component={RestaurantDetailScreen}
    />
    <Stack.Screen name="Reservation" component={ReservationScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { signedIn, onboardingComplete, authReady } = useAuth();
  if (!authReady) {
    return null;
  }
  if (!signedIn) {
    return <AuthStack />;
  }
  if (!onboardingComplete) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      </Stack.Navigator>
    );
  }
  return <AppStack />;
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Gargoyle: require('./src/fonts/gargoyle/OPTIGargoyle-Normal.otf'),
    'Gargoyle-Italic': require('./src/fonts/gargoyle/OPTIGargoyle-Italic.otf'),
    Saans: require('./src/fonts/saans/Saans-TRIAL-Regular.otf'),
    'Saans-Bold': require('./src/fonts/saans/Saans-TRIAL-Bold.otf'),
    'Saans-Medium': require('./src/fonts/saans/Saans-TRIAL-Medium.otf'),
    'Saans-SemiBold': require('./src/fonts/saans/Saans-TRIAL-SemiBold.otf'),
    'Saans-Light': require('./src/fonts/saans/Saans-TRIAL-Light.otf'),
  });

  React.useEffect(() => {
    if (fontError) {
      console.error('Error loading fonts:', fontError);
    }
  }, [fontError]);

  const onLayoutRootView = React.useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <SafeAreaProvider onLayout={onLayoutRootView}>
            <NavigationContainer>
              <StatusBar style="light" />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
