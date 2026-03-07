'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

/**
 * Contexto de Autenticación con Firebase
 * 
 * Proporciona información del usuario actual en toda la aplicación
 * - Autenticación: Firebase Auth
 * - Datos de perfil: Supabase (temporalmente, luego será Cloudflare D1)
 */

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión de Firebase al cargar
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    console.log('🔥 Iniciando listener de Firebase Auth...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase Auth state changed:', {
        exists: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
      });

      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Usuario logueado en Firebase → cargar datos del perfil
        await loadUserData(firebaseUser.uid);
      } else {
        // No hay sesión en Firebase
        console.log('❌ No hay sesión activa en Firebase');
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      console.log('📡 Cargando datos del usuario desde Supabase:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, is_admin')
        .eq('id', userId)
        .single();

      console.log('📥 Resultado de la consulta:', {
        found: !!data,
        data,
        error: error?.message,
      });

      if (error) {
        console.error('❌ Error en consulta:', error);
        
        // Si el usuario no existe en Supabase, puede ser nuevo
        // Crear perfil básico
        if (error.code === 'PGRST116' && firebaseUser) {
          console.log('👤 Usuario no encontrado en Supabase, creando perfil básico...');
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              username: firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.slice(0, 8)}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error creando perfil:', insertError);
            throw insertError;
          }

          console.log('✅ Perfil creado:', newUser);
          
          const userData = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.is_admin || false,
          };
          
          setUser(userData);
          setLoading(false);
          return;
        }
        
        throw error;
      }

      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        isAdmin: data.is_admin || false,
      };
      
      console.log('✅ Usuario cargado:', userData);
      setUser(userData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      console.log('🔥 Iniciando login con Firebase Auth...');
      console.log('📧 Email:', email);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('✅ Login exitoso en Firebase');
      console.log('👤 UID:', userCredential.user.uid);

      // El listener de onAuthStateChanged se encargará de cargar los datos
    } catch (error: any) {
      console.error('❌ Error en login de Firebase:', error);
      
      // Mensajes de error más amigables
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Email o contraseña incorrectos');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('Usuario no encontrado');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos fallidos. Intenta más tarde.');
      } else {
        throw new Error(error.message || 'Error al iniciar sesión');
      }
    }
  };

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      console.log('🔥 Cerrando sesión en Firebase...');
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated: !!user && !!firebaseUser,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
