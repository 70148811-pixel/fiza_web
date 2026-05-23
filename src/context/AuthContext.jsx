import React, { createContext, useContext, useState, useEffect } from "react";
import { isDemoMode, auth } from "../firebase/config";
import { 
  loginUser, 
  registerUser, 
  loginWithGoogle, 
  logoutUser, 
  resetUserPassword,
  deleteUserAccount,
  getUserProfile 
} from "../firebase/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and listen to Auth Changes
  useEffect(() => {
    if (isDemoMode) {
      // Simulate initial session load
      const activeUser = sessionStorage.getItem("nexus_active_user");
      if (activeUser) {
        const parsedUser = JSON.parse(activeUser);
        setUser(parsedUser);
        setUserProfile(parsedUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    } else {
      // Real Firebase onAuthStateChanged listener
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const profile = await getUserProfile(firebaseUser.uid);
            setUser(firebaseUser);
            setUserProfile(profile);
          } catch (error) {
            console.error("Failed to load Firebase user profile:", error);
            setUser(firebaseUser);
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || "Anonymous",
              role: "user", // Fallback
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=U`
            });
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Action methods
  const signin = async (email, password) => {
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      // In demo mode we get custom mock user, in live we get firebase credentials
      if (isDemoMode) {
        setUser(result.user);
        setUserProfile(result.user);
      } else {
        setUser(result.user);
        setUserProfile(result.profile);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, displayName, role) => {
    setLoading(true);
    try {
      const result = await registerUser(email, password, displayName, role);
      if (isDemoMode) {
        setUser(result.user);
        setUserProfile(result.user);
      } else {
        setUser(result.user);
        setUserProfile(result.profile);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const googleSignin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (isDemoMode) {
        setUser(result.user);
        setUserProfile(result.user);
      } else {
        setUser(result.user);
        setUserProfile(result.profile);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await resetUserPassword(email);
  };

  const deleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const uid = user.uid;
      await deleteUserAccount(uid);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signin,
    signup,
    googleSignin,
    logout,
    resetPassword,
    deleteAccount,
    isDemo: isDemoMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
