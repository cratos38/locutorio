// Hook de autenticación con Firebase
'use client';

import { useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async (): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return firebaseSignOut(auth);
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth not initialized');
    return sendPasswordResetEmail(auth, email);
  };

  const verifyEmail = async (): Promise<void> => {
    if (!auth || !user) throw new Error('No user logged in');
    return sendEmailVerification(user);
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyEmail,
    getToken,
  };
}
