import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = 'spare.auth.v1';

const AuthContext = createContext({
  signedIn: false,
  onboardingComplete: false,
  authReady: false,
  signIn: () => {},
  signOut: () => {},
  completeOnboarding: () => {},
});

const AuthProvider = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) {
          if (mounted) {
            setAuthReady(true);
          }
          return;
        }

        const parsed = JSON.parse(raw);
        if (mounted) {
          setSignedIn(Boolean(parsed?.signedIn));
          setOnboardingComplete(Boolean(parsed?.onboardingComplete));
          setAuthReady(true);
        }
      } catch (error) {
        if (mounted) {
          setAuthReady(true);
        }
      }
    };

    hydrateAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    AsyncStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        signedIn,
        onboardingComplete,
      }),
    ).catch(() => {});
  }, [signedIn, onboardingComplete, authReady]);

  const value = useMemo(
    () => ({
      signedIn,
      onboardingComplete,
      authReady,
      signIn: () => setSignedIn(true),
      signOut: () => {
        setSignedIn(false);
        setOnboardingComplete(false);
      },
      completeOnboarding: () => setOnboardingComplete(true),
    }),
    [signedIn, onboardingComplete, authReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
