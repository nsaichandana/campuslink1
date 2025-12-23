import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthState, getUserProfile } from '../services/auth';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Full user data from Firestore
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAnonymous(false);
        
        // Load user profile with retry logic
        try {
          const userDataFromDb = await getUserProfile(firebaseUser.uid);
          console.log('User data loaded:', userDataFromDb); // Debug log
          setUserData(userDataFromDb);
          setProfile(userDataFromDb?.profile || null);
        } catch (error) {
          console.error('Error loading profile:', error);
          setUserData(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const continueAnonymously = () => {
    setIsAnonymous(true);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const userDataFromDb = await getUserProfile(user.uid);
        console.log('Profile refreshed:', userDataFromDb); // Debug log
        setUserData(userDataFromDb);
        setProfile(userDataFromDb?.profile || null);
        return userDataFromDb?.profile || null;
      } catch (error) {
        console.error('Error refreshing profile:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    userData,
    profile,
    loading,
    isAnonymous,
    isAuthenticated: !!user && !isAnonymous,
    isAdmin: userData?.isAdmin || userData?.role === 'admin' || false,
    profileComplete: userData?.profileComplete || false,
    continueAnonymously,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
