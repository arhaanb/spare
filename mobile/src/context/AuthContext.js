import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext({
  signedIn: false,
  onboardingComplete: false,
  signIn: () => {},
  signOut: () => {},
  completeOnboarding: () => {},
});

const AuthProvider = ({ children }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const value = useMemo(
    () => ({
      signedIn,
      onboardingComplete,
      signIn: () => setSignedIn(true),
      signOut: () => {
        setSignedIn(false);
        setOnboardingComplete(false);
      },
      completeOnboarding: () => setOnboardingComplete(true),
    }),
    [signedIn, onboardingComplete],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
