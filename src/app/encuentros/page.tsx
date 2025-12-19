"use client";
import { useMessages } from "@/contexts/MessagesContext";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InternalHeader from "@/components/InternalHeader";
import Link from "next/link";

type CoffeeInvitation = {
  id: number;
  userId: number;
  name: string;
  age: number;
  city: string;
  avatar: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
  type: "received" | "sent";
  message?: string;
};

export default function EncuentrosPage() {
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "accepted" | "rejected">("received");
  const { openMessages } = useMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const [historyAccepted, setHistoryAccepted] = useState<any[]>([]);
  const [historyRejected, setHistoryRejected] = useState<any[]>([]);

  // Cargar historial desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const accepted = JSON.parse(localStorage.getItem('coffeeAccepted') || '[]');
      const rejected = JSON.parse(localStorage.getItem('coffeeRejected') || '[]');
      setHistoryAccepted(accepted);
      setHistoryRejected(rejected);
    }
  }, []);

  // Datos de invitaciones
  const [invitations] = useState<CoffeeInvitation[]>([
    {
      id: 1,
      userId: 101,
      name: "Laura",
      age: 25,
      city: "Caracas",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      date: "Hace 2 horas",
      status: "pending",
      type: "received",
      message: "Hola! Me gustaría conocerte, ¿tomamos un café?",
    },
    {
      id: 2,
      userId: 102,
      name: "María",
      age: 24,
      city: "Maracaibo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      date: "Ayer",
      status: "pending",
      type: "received",
      message: "Me pareció interesante tu perfil 😊",
    },
    {
      id: 3,
      userId: 103,
      name: "Sofia",
      age: 26,
      city: "Valencia",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
      date: "Hace 3 días",
      status: "accepted",
      type: "received",
    },
    {
      id: 4,
      userId: 104,
      name: "Elena",
      age: 22,
      city: "Barquisimeto",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      date: "Hace 1 semana",
      status: "rejected",
      type: "received",
    },
    {
      id: 5,
      userId: 105,
      name: "Carlos",
      age: 28,
      city: "Mérida",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      date: "Hace 1 día",
      status: "pending",
      type: "sent",
      message: "Hola, me gustaría conocerte mejor!",
    },
    {
      id: 6,
      userId: 106,
      name: "Diego",
      age: 30,
      city: "Caracas",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
      date: "Hace 2 días",
      status: "accepted",
      type: "sent",
    },
  ]);

  // Filtrar invitaciones
  const filteredInvitations = invitations.filter(inv => {
    // Filtro por tab
    if (activeTab === "received" && inv.type !== "received") return false;
    if (activeTab === "sent" && inv.type !== "sent") return false;
    if (activeTab === "accepted" && inv.status !== "accepted") return false;
    if (activeTab === "rejected" && inv.status !== "rejected") return false;

    // Filtro por búsqueda
    if (searchQuery && !inv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Estadísticas
  const stats = {
    received: invitations.filter(i => i.type === "received" && i.status === "pending").length,
    sent: invitations.filter(i => i.type === "sent" && i.status === "pending").length,
    accepted: invitations.filter(i => i.status === "accepted").length,
    rejected: invitations.filter(i => i.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display flex flex-col">
      <InternalHeader />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
              <span className="text-5xl">☕</span>
              Encuentros
            </h1>
            <p className="text-connect-muted text-lg">
              Gestiona tus invitaciones para encuentros en persona
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                {stats.received > 0 && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{stats.received}</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{invitations.filter(i => i.type === "received").length}</h3>
              <p className="text-sm text-connect-muted">Invitaciones Recibidas</p>
            </div>

            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                {stats.sent > 0 && (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{stats.sent}</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{invitations.filter(i => i.type === "sent").length}</h3>
              <p className="text-sm text-connect-muted">Invitaciones Enviadas</p>
            </div>

            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.accepted}</h3>
              <p className="text-sm text-connect-muted">Aceptadas</p>
            </div>

            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.rejected}</h3>
              <p className="text-sm text-connect-muted">Rechazadas</p>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-connect-card rounded-2xl p-6 mb-6 border border-connect-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="pl-10 bg-connect-bg-dark border-connect-border text-white"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <button
                  onClick={() => setActiveTab("received")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "received"
                      ? "bg-primary text-connect-bg-dark"
                      : "bg-white/5 text-connect-muted hover:bg-white/10"
                  }`}
                >
                  Recibidas ({invitations.filter(i => i.type === "received").length})
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "sent"
                      ? "bg-primary text-connect-bg-dark"
                      : "bg-white/5 text-connect-muted hover:bg-white/10"
                  }`}
                >
                  Enviadas ({invitations.filter(i => i.type === "sent").length})
                </button>
                <button
                  onClick={() => setActiveTab("accepted")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "accepted"
                      ? "bg-primary text-connect-bg-dark"
                      : "bg-white/5 text-connect-muted hover:bg-white/10"
                  }`}
                >
                  Aceptadas ({stats.accepted})
                </button>
                <button
                  onClick={() => setActiveTab("rejected")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === "rejected"
                      ? "bg-primary text-connect-bg-dark"
                      : "bg-white/5 text-connect-muted hover:bg-white/10"
                  }`}
                >
                  Rechazadas ({stats.rejected})
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Respuestas */}
          {(historyAccepted.length > 0 || historyRejected.length > 0) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de Respuestas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aceptadas */}
                {historyAccepted.length > 0 && (
                  <div className="bg-connect-card border border-connect-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      Aceptadas ({historyAccepted.length})
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {historyAccepted.slice(-5).reverse().map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.name}, {item.age}</p>
                            <p className="text-xs text-connect-muted">{item.city}</p>
                            <p className="text-xs text-primary mt-1">
                              {new Date(item.acceptedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rechazadas */}
                {historyRejected.length > 0 && (
                  <div className="bg-connect-card border border-connect-border rounded-xl p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      Rechazadas ({historyRejected.length})
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {historyRejected.slice(-5).reverse().map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover opacity-60"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white/70 truncate">{item.name}, {item.age}</p>
                            <p className="text-xs text-connect-muted">{item.city}</p>
                            <p className="text-xs text-red-400 mt-1">
                              {new Date(item.rejectedAt).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de invitaciones */}
          {filteredInvitations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-connect-card rounded-2xl overflow-hidden border border-connect-border hover:border-primary/50 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={invitation.avatar}
                        alt={invitation.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {invitation.name}, {invitation.age}
                        </h3>
                        <p className="text-sm text-connect-muted flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {invitation.city}
                        </p>
                      </div>
                    </div>

                    {invitation.message && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-white">{invitation.message}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-connect-muted mb-4">
                      <span>{invitation.date}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        invitation.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        invitation.status === "accepted" ? "bg-primary/20 text-primary" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {invitation.status === "pending" ? "Pendiente" :
                         invitation.status === "accepted" ? "Aceptada" : "Rechazada"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link href={`/perfil/${invitation.name.toLowerCase()}`}>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent border-connect-border text-white hover:bg-white/5"
                        >
                          Ver perfil
                        </Button>
                      </Link>
                      {invitation.status === "pending" && invitation.type === "received" ? (
                        <Button className="w-full bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
                          Aceptar
                        </Button>
                      ) : invitation.status === "accepted" ? (
                          <Button onClick={() => openMessages()} className="w-full bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
                            Mensaje
                          </Button>
                      ) : (
                        <Button
                          variant="outline"
                          disabled
                          className="w-full bg-transparent border-connect-border text-connect-muted cursor-not-allowed"
                        >
                          {invitation.status === "rejected" ? "Rechazada" : "Pendiente"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">☕</div>
              <h2 className="text-2xl font-bold mb-2">No hay invitaciones</h2>
              <p className="text-connect-muted mb-6">
                {activeTab === "received" && "No has recibido invitaciones aún"}
                {activeTab === "sent" && "No has enviado invitaciones aún"}
                {activeTab === "accepted" && "No tienes invitaciones aceptadas"}
                {activeTab === "rejected" && "No tienes invitaciones rechazadas"}
              </p>
              <Link href="/personas">
                <Button className="bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
                  Buscar personas
                </Button>
              </Link>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-white font-bold mb-1">💡 ¿Qué es "Tomar Café"?</p>
                <p className="text-sm text-blue-400">
                  Es una invitación para conocerse en persona, reunirse en vivo a tomar un café y charlar.
                  Puedes enviar hasta <strong>3 invitaciones por día</strong> desde la página de Personas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
