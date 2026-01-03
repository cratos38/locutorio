"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "./NotificationBell";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/contexts/MessagesContext";

export default function InternalHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { openMessages, getUnreadCount } = useMessages();

  const handleLogout = () => {
    // Aquí iría la lógica de logout (limpiar sesión, tokens, etc.)
    localStorage.clear();
    router.push("/");
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
            <Link href="/personas" className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              Personas
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
            <Link href="/chat" className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              Chat
            </Link>
            <Link href="/albumes" className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              Álbumes
            </Link>
            <Link href="/encuentros" className="px-4 py-2 text-sm font-medium text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
              Encuentros
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 relative" ref={menuRef}>
            <NotificationBell />
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-2 border-primary/50 cursor-pointer flex items-center justify-center text-sm font-bold ml-2 hover:brightness-110 transition-all"
            >
              A
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-14 right-0 w-56 bg-connect-card border border-connect-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-connect-border">
                  <p className="text-sm font-bold text-white">Ana M.</p>
                  <p className="text-xs text-connect-muted">ana.m@ejemplo.com</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/perfil"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi Perfil
                  </Link>
                  <Link
                    href="/configuracion"
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
