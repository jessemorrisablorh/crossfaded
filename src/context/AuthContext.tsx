import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  authRedirectUrl: string | null;
  setAuthRedirectUrl: (url: string | null) => void;
  openAuthModal: (tab?: 'login' | 'register', redirectUrl?: string) => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, profileData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);

  const openAuthModal = (tab: 'login' | 'register' = 'login', redirectUrl?: string) => {
    setAuthModalTab(tab);
    if (redirectUrl) {
      setAuthRedirectUrl(redirectUrl);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const fetchProfileAndAdmin = async (currentUser: User) => {
    try {
      const [userProf, adminStatus] = await Promise.all([
        firestoreService.getUserProfile(currentUser.uid),
        firestoreService.checkIsAdmin(currentUser.uid),
      ]);
      setProfile(userProf);
      setIsAdmin(adminStatus);
    } catch (e) {
      console.warn('Error fetching profile or admin status:', e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndAdmin(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfileAndAdmin(currentUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<boolean> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      try {
        const [userProf, adminStatus] = await Promise.all([
          firestoreService.getUserProfile(cred.user.uid),
          firestoreService.checkIsAdmin(cred.user.uid),
        ]);
        setProfile(userProf);
        setIsAdmin(adminStatus);
        return adminStatus;
      } catch (e) {
        console.warn('Error fetching admin status on sign in:', e);
        return false;
      }
    }
    return false;
  };

  const signUp = async (email: string, pass: string, profileData: Partial<UserProfile>) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        firstname: profileData.firstname || '',
        lastname: profileData.lastname || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        placename: profileData.placename || profileData.address || '',
        lat: profileData.lat,
        lng: profileData.lng,
        city: profileData.city || '',
        region: profileData.region || '',
        role: 'customer',
      };
      await firestoreService.updateUserProfile(cred.user.uid, newProfile);
      setProfile(newProfile);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isAuthModalOpen,
        authModalTab,
        authRedirectUrl,
        setAuthRedirectUrl,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

