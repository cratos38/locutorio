"use client";
import { useMessages } from "@/contexts/MessagesContext";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InternalHeader from "@/components/InternalHeader";
import Link from "next/link";

type Match = {
  id: number;
  userId: number;
  name: string;
  age: number;
  city: string;
  avatar: string;
  matchDate: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadMessages: number;
  online: boolean;
  interests: string[];
};

export default function MatchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { openMessages } = useMessages();
  const [filterType, setFilterType] = useState<"all" | "online" | "new">("all");
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");

  // Lista de matches
  const [matches] = useState<Match[]>([
    {
      id: 1,
      userId: 101,
      name: "Laura",
      age: 25,
      city: "Caracas",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      matchDate: "Hace 2 horas",
      lastMessage: "¡Hola! Me encantó tu perfil 😊",
      lastMessageTime: "Hace 5 min",
      unreadMessages: 2,
      online: true,
      interests: ["Cine", "Viajes", "Fotografía"],
    },
    {
      id: 2,
      userId: 102,
      name: "María",
      age: 24,
      city: "Maracaibo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
      matchDate: "Ayer",
      lastMessage: "¿Te gustaría salir este fin de semana?",
      lastMessageTime: "Hace 2 horas",
      unreadMessages: 0,
      online: true,
      interests: ["Baile", "Fitness", "Playa"],
    },
    {
      id: 3,
      userId: 103,
      name: "Sofia",
      age: 26,
      city: "Barquisimeto",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
      matchDate: "Hace 2 días",
      unreadMessages: 0,
      online: false,
      interests: ["Cocina", "Vino", "Música"],
    },
    {
      id: 4,
      userId: 104,
      name: "Elena",
      age: 22,
      city: "Valencia",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      matchDate: "Hace 5 días",
      lastMessage: "Me encanta la música también!",
      lastMessageTime: "Hace 1 día",
      unreadMessages: 1,
      online: false,
      interests: ["Música", "Arte", "Festivales"],
    },
    {
      id: 5,
      userId: 105,
      name: "Valentina",
      age: 27,
      city: "Mérida",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
      matchDate: "Hace 1 semana",
      unreadMessages: 0,
      online: false,
      interests: ["Lectura", "Café", "Viajes"],
    },
  ]);

  // Filtrar matches
  const filteredMatches = matches.filter(match => {
    // Filtro de búsqueda
    if (searchQuery && !match.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro de tipo
    if (filterType === "online" && !match.online) {
      return false;
    }

    if (filterType === "new" && !match.matchDate.includes("Hace") && !match.matchDate.includes("horas")) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    // Por defecto ordenar por recientes (ya están ordenados)
    return 0;
  });

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display flex flex-col">
      <InternalHeader />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/meetings" className="flex items-center gap-2 text-connect-muted hover:text-primary transition-colors mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Encuentros
              </Link>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">💕</span>
                Tus Matches
              </h1>
              <p className="text-connect-muted mt-2">
                {filteredMatches.length} matches • {filteredMatches.filter(m => m.online).length} en línea
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-connect-card rounded-2xl p-6 mb-6 border border-connect-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar matches..."
                  className="pl-10 bg-connect-bg-dark border-connect-border text-white"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
                className="bg-connect-bg-dark border border-connect-border text-white rounded-xl px-4 py-2"
              >
                <option value="recent">Más recientes</option>
                <option value="name">Por nombre</option>
              </select>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-primary text-connect-bg-dark"
                    : "bg-white/5 text-connect-muted hover:bg-white/10"
                }`}
              >
                Todos ({matches.length})
              </button>
              <button
                onClick={() => setFilterType("online")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "online"
                    ? "bg-primary text-connect-bg-dark"
                    : "bg-white/5 text-connect-muted hover:bg-white/10"
                }`}
              >
                En línea ({matches.filter(m => m.online).length})
              </button>
              <button
                onClick={() => setFilterType("new")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "new"
                    ? "bg-primary text-connect-bg-dark"
                    : "bg-white/5 text-connect-muted hover:bg-white/10"
                }`}
              >
                Nuevos
              </button>
            </div>
          </div>

          {/* Matches Grid */}
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-connect-card rounded-2xl overflow-hidden border border-connect-border hover:border-primary/50 transition-all group"
                >
                  {/* Photo */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={match.avatar}
                      alt={match.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Online indicator */}
                    {match.online && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-white">En línea</span>
                      </div>
                    )}

                    {/* Unread badge */}
                    {match.unreadMessages > 0 && (
                      <div className="absolute top-4 left-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-connect-bg-dark">{match.unreadMessages}</span>
                      </div>
                    )}

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {match.name}, {match.age}
                      </h3>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.city}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Interests */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/5 rounded-full text-xs text-connect-muted"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    {/* Last message */}
                    {match.lastMessage && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-white line-clamp-2 mb-1">{match.lastMessage}</p>
                        <p className="text-xs text-connect-muted">{match.lastMessageTime}</p>
                      </div>
                    )}

                    {/* Match date */}
                    <p className="text-xs text-connect-muted mb-4">
                      Match: {match.matchDate}
                    </p>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Link href={`/perfil/${match.name.toLowerCase()}`}>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent border-connect-border text-white hover:bg-white/5"
                        >
                          Ver perfil
                        </Button>
                      </Link>
                        <Button onClick={() => openMessages()} className="w-full bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
                          Mensaje
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold mb-2">No se encontraron matches</h2>
              <p className="text-connect-muted mb-6">
                Intenta con otros filtros o búsqueda
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
