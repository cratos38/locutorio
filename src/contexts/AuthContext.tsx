'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Contexto de Autenticación
 * 
 * Proporciona información del usuario actual en toda la aplicación
 */

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('🔍 Verificando sesión...');
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('📋 Sesión:', {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      
      if (session?.user) {
        console.log('👤 Cargando datos del usuario:', session.user.id);
        await loadUserData(session.user.id);
      } else {
        console.log('❌ No hay sesión activa');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      console.log('📡 Buscando usuario en tabla users:', userId);
      
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
    } catch (error) {
      console.error('❌ Error al cargar datos del usuario:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // EXCEPCIÓN ESPECIAL: Si es admin con password corto, probar con sufijo
      const isAdminLogin = email === 'admin@admin.com';
      let finalPassword = password;
      
      if (isAdminLogin && password.length < 6) {
        finalPassword = password + '123'; // "admin" → "admin123"
        console.log('🔧 Admin detectado: usando password extendido');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: finalPassword,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserData(data.user.id);
      }
    } catch (error) {
      console.error('Error al hacer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error al hacer logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
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
