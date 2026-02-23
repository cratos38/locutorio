"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";

export default function InternalHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const { openMessages, getUnreadCount } = useMessages();
  const { user, logout } = useAuth();
  
  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  const getUserDisplayName = () => {
    return user?.username || 'Usuario';
  };
  
  const getUserEmail = () => {
    return user?.email || 'usuario@ejemplo.com';
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback: limpiar localStorage y redirigir
      localStorage.clear();
      router.push("/");
    }
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-connect-bg-dark/80 border-b border-connect-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">LoCuToRiO</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {/* Solo mostrar "Mi Espacio" si NO estás en /dashboard */}
            {pathname !== '/dashboard' && (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
              >
                Mi Espacio
              </Link>
            )}
            <Link 
              href="/usuarios" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/usuarios' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-white hover:text-primary hover:bg-white/5'
              }`}
            >
              Usuarios
            </Link>
            <button 
              onClick={() => openMessages()} 
              className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors relative"
            >
              Mensajes
              {getUnreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-connect-bg-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getUnreadCount()}
                </span>
              )}
            </button>
            <Link 
              href="/chat" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/chat' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-white hover:text-primary hover:bg-white/5'
              }`}
            >
              Chat
            </Link>
            <Link 
              href="/albums" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/albums' || pathname?.startsWith('/albums/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-white hover:text-primary hover:bg-white/5'
              }`}
            >
              Álbumes
            </Link>
            <Link 
              href="/meetings" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/meetings' || pathname?.startsWith('/meetings/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-white hover:text-primary hover:bg-white/5'
              }`}
            >
              Encuentros
            </Link>
            <Link 
              href="/tutorial" 
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/tutorial' || pathname?.startsWith('/tutorial/') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-white hover:text-primary hover:bg-white/5'
              }`}
            >
              Tutoriales
            </Link>
            {/* Botón Admin - solo visible para administradores */}
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  pathname === '/admin' 
                    ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30' 
                    : 'text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/30'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 relative" ref={menuRef}>
            <NotificationBell />
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-2 border-primary/50 cursor-pointer flex items-center justify-center text-sm font-bold ml-2 hover:brightness-110 transition-all"
            >
              {getUserInitials()}
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-14 right-0 w-56 bg-connect-card border border-connect-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-connect-border">
                  <p className="text-sm font-bold text-white">{getUserDisplayName()}</p>
                  <p className="text-xs text-connect-muted">{getUserEmail()}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/userprofile"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Mi Perfil
                  </Link>
                  <Link
                    href={`/publicprofile/${user?.username || 'demo'}`}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Mi Perfil Público
                  </Link>
                  <Link
                    href="/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </Link>
                </div>
                <div className="border-t border-connect-border py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
