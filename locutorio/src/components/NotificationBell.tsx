"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type NotificationType = "message" | "match" | "visit" | "friend" | "system";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  link?: string;
  time: string;
  isRead: boolean;
};

export default function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "message",
      title: "Nuevo mensaje",
      message: "Javier Solis te envió un mensaje",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ",
      link: "/mensajes",
      time: "Hace 5 min",
      isRead: false,
    },
    {
      id: 2,
      type: "match",
      title: "¡Es un Match!",
      message: "Laura también te dio like",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      link: "/encuentros/matches",
      time: "Hace 15 min",
      isRead: false,
    },
    {
      id: 3,
      type: "visit",
      title: "Visitaron tu perfil",
      message: "Carlos R. visitó tu perfil",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk",
      link: "/perfil",
      time: "Hace 1 hora",
      isRead: true,
    },
    {
      id: 4,
      type: "friend",
      title: "Solicitud de amistad",
      message: "María P. te envió una solicitud de amistad",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB",
      link: "/amigos/solicitudes",
      time: "Hace 2 horas",
      isRead: true,
    },
    {
      id: 5,
      type: "system",
      title: "Bienvenida",
      message: "¡Completa tu perfil para obtener más visitas!",
      link: "/perfil/editar",
      time: "Hace 1 día",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Simular notificaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% de probabilidad cada 30 segundos
      if (Math.random() > 0.9) {
        const newNotification: Notification = {
          id: Date.now(),
          type: ["message", "match", "visit"][Math.floor(Math.random() * 3)] as NotificationType,
          title: "Nueva notificación",
          message: "Tienes una nueva actualización",
          time: "Ahora",
          isRead: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
        playNotificationSound();
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Sonido de notificación
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0vLTgjMGHm7A7+OZSA0PVanm8LJjHwU7k9r0z38uBihyyO3cnEQIEFyt5O+pWBYLTKXh9MBlKAYthMrz16g9CRdxwu7hnUsOElmr5fCyYx8FO5Pa9M5+LgYnccnt3JxECA9dru3+UlP=');
    audio.play().catch(() => {});
  };

  // Marcar como leída
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Eliminar notificación
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Iconos por tipo
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "message":
        return (
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "match":
        return (
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        );
      case "visit":
        return (
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        );
      case "friend":
        return (
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 bg-gray-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-connect-bg-dark">{unreadCount}</span>
          </div>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-connect-card border border-connect-border rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-connect-border flex items-center justify-between shrink-0">
              <h3 className="font-bold text-white">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-connect-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-sm text-connect-muted">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="divide-y divide-connect-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group ${
                        !notification.isRead ? "bg-primary/5" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          getNotificationIcon(notification.type)
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-connect-muted mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-connect-muted">
                              {notification.time}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-connect-muted hover:text-white shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-connect-border shrink-0">
                <Link href="/notificaciones">
                  <button
                    onClick={() => setShowPanel(false)}
                    className="w-full text-center text-sm text-primary hover:underline"
                  >
                    Ver todas las notificaciones
                  </button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
