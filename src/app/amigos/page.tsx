"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";
import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";
import FloatingMessagesWindow from "@/components/FloatingMessagesWindow";

type Friend = {
  id: number;
  username: string;
  name: string;
  age: number;
  city: string;
  gender: "H" | "M";
  avatar: string;
  status: "online" | "away" | "offline";
  statusText?: string;
  lastSeen?: string;
  isBestFriend?: boolean;
  mutualFriends?: number;
  addedDate: string;
};

type FriendRequest = {
  id: number;
  username: string;
  name: string;
  age: number;
  city: string;
  gender: "H" | "M";
  avatar: string;
  requestDate: string;
  mutualFriends: number;
};

export default function AmigosPage() {
  const { user } = useAuth();
  const { openMessages } = useMessages();
  
  const [activeTab, setActiveTab] = useState<"todos" | "online" | "solicitudes" | "bloqueados">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "online">("name");
  
  // Datos de ejemplo - En produccion vendran de la base de datos
  const [friends, setFriends] = useState<Friend[]>([
    { 
      id: 1, 
      username: "javier_s", 
      name: "Javier Solis", 
      age: 28, 
      city: "Caracas", 
      gender: "H",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ",
      status: "online",
      statusText: "Disponible para chatear",
      isBestFriend: true,
      mutualFriends: 12,
      addedDate: "2024-01-15"
    },
    { 
      id: 2, 
      username: "laura_g", 
      name: "Laura Garcia", 
      age: 25, 
      city: "Valencia", 
      gender: "M",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic",
      status: "away",
      statusText: "Ocupada",
      mutualFriends: 8,
      addedDate: "2024-02-20"
    },
    { 
      id: 3, 
      username: "carlos_m", 
      name: "Carlos Martinez", 
      age: 30, 
      city: "Maracaibo", 
      gender: "H",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk",
      status: "offline",
      lastSeen: "Hace 3 horas",
      mutualFriends: 5,
      addedDate: "2024-03-10"
    },
    { 
      id: 4, 
      username: "maria_p", 
      name: "Maria Perez", 
      age: 27, 
      city: "Barquisimeto", 
      gender: "M",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB",
      status: "online",
      statusText: "Explorando",
      isBestFriend: true,
      mutualFriends: 15,
      addedDate: "2023-12-05"
    },
    { 
      id: 5, 
      username: "sofia_v", 
      name: "Sofia Vargas", 
      age: 24, 
      city: "Merida", 
      gender: "M",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop",
      status: "online",
      mutualFriends: 3,
      addedDate: "2024-04-01"
    },
    { 
      id: 6, 
      username: "pedro_l", 
      name: "Pedro Lopez", 
      age: 32, 
      city: "Barcelona", 
      gender: "H",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      status: "away",
      statusText: "Trabajando",
      mutualFriends: 7,
      addedDate: "2024-01-28"
    },
  ]);
  
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    {
      id: 101,
      username: "elena_g",
      name: "Elena Gonzalez",
      age: 26,
      city: "Caracas",
      gender: "M",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      requestDate: "Hace 2 horas",
      mutualFriends: 4
    },
    {
      id: 102,
      username: "diego_r",
      name: "Diego Rodriguez",
      age: 29,
      city: "Valencia",
      gender: "H",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      requestDate: "Ayer",
      mutualFriends: 2
    }
  ]);
  
  const [blockedUsers] = useState([
    { id: 201, username: "user_blocked", name: "Usuario Bloqueado", blockedDate: "2024-03-15" }
  ]);

  // Filtrar amigos
  const filteredFriends = friends
    .filter(friend => {
      // Filtro por tab
      if (activeTab === "online" && friend.status !== "online") return false;
      
      // Filtro por busqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return friend.name.toLowerCase().includes(query) || 
               friend.username.toLowerCase().includes(query) ||
               friend.city.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "online") {
        const statusOrder = { online: 0, away: 1, offline: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (sortBy === "recent") {
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
      }
      return 0;
    });

  // Stats
  const onlineCount = friends.filter(f => f.status === "online").length;
  const totalFriends = friends.length;
  const bestFriendsCount = friends.filter(f => f.isBestFriend).length;

  // Handlers
  const handleAcceptRequest = (requestId: number) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      const newFriend: Friend = {
        id: request.id,
        username: request.username,
        name: request.name,
        age: request.age,
        city: request.city,
        gender: request.gender,
        avatar: request.avatar,
        status: "offline",
        mutualFriends: request.mutualFriends,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setFriends([...friends, newFriend]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: number) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = (friendId: number) => {
    if (confirm("¿Estas seguro de que quieres eliminar a este amigo?")) {
      setFriends(friends.filter(f => f.id !== friendId));
    }
  };

  const handleToggleBestFriend = (friendId: number) => {
    setFriends(friends.map(f => 
      f.id === friendId ? { ...f, isBestFriend: !f.isBestFriend } : f
    ));
  };

  const getStatusColor = (status: Friend["status"]) => {
    switch (status) {
      case "online": return "bg-primary";
      case "away": return "bg-orange-500";
      case "offline": return "bg-gray-500";
    }
  };

  const getStatusText = (status: Friend["status"]) => {
    switch (status) {
      case "online": return "En linea";
      case "away": return "Ausente";
      case "offline": return "Desconectado";
    }
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">Mis Amigos</h1>
            <p className="text-connect-muted">
              {totalFriends} amigos en total - {onlineCount} en linea ahora
            </p>
          </div>
          
          <Link href="/usuarios">
            <Button className="bg-primary hover:brightness-110 text-connect-bg-dark font-bold">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Buscar Personas
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-connect-card border border-connect-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalFriends}</p>
                <p className="text-xs text-connect-muted">Total Amigos</p>
              </div>
            </div>
          </div>

          <div className="bg-connect-card border border-connect-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{onlineCount}</p>
                <p className="text-xs text-connect-muted">En Linea</p>
              </div>
            </div>
          </div>

          <div className="bg-connect-card border border-connect-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{bestFriendsCount}</p>
                <p className="text-xs text-connect-muted">Mejores Amigos</p>
              </div>
            </div>
          </div>

          <div className="bg-connect-card border border-connect-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{friendRequests.length}</p>
                <p className="text-xs text-connect-muted">Solicitudes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-connect-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("todos")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "todos"
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "todos" ? 'bg-primary/20 text-primary' : 'bg-white/10'
            }`}>{totalFriends}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("online")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "online"
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            En Linea
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "online" ? 'bg-primary/20 text-primary' : 'bg-white/10'
            }`}>{onlineCount}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("solicitudes")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "solicitudes"
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solicitudes
            {friendRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "solicitudes" ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-400'
              }`}>{friendRequests.length}</span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab("bloqueados")}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === "bloqueados"
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bloqueados
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "bloqueados" ? 'bg-primary/20 text-primary' : 'bg-white/10'
            }`}>{blockedUsers.length}</span>
          </button>
        </div>

        {/* Search and Sort */}
        {(activeTab === "todos" || activeTab === "online") && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar amigos por nombre, usuario o ciudad..."
                className="pl-12 bg-connect-card border-connect-border text-white placeholder-connect-muted"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-connect-card border border-connect-border rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="online">Ordenar por estado</option>
              <option value="recent">Mas recientes</option>
            </select>
          </div>
        )}

        {/* Content */}
        {(activeTab === "todos" || activeTab === "online") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-connect-card border border-connect-border rounded-xl p-4 hover:border-primary/30 transition-all group"
              >
                {/* Avatar and Status */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(friend.status)} border-2 border-connect-card rounded-full`}></div>
                    {friend.isBestFriend && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-connect-bg-dark" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white truncate">{friend.name}</h3>
                    <p className="text-sm text-connect-muted">@{friend.username}</p>
                    <p className="text-xs text-connect-muted mt-1">
                      {friend.gender} - {friend.age} - {friend.city}
                    </p>
                  </div>
                </div>

                {/* Status Text */}
                <div className="mb-4">
                  <p className={`text-xs font-medium ${
                    friend.status === "online" ? "text-primary" : 
                    friend.status === "away" ? "text-orange-400" : "text-gray-500"
                  }`}>
                    {friend.statusText || friend.lastSeen || getStatusText(friend.status)}
                  </p>
                  {friend.mutualFriends && friend.mutualFriends > 0 && (
                    <p className="text-xs text-connect-muted mt-1">
                      {friend.mutualFriends} amigos en comun
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openMessages(friend.id)}
                    className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Mensaje
                  </button>
                  
                  <Link
                    href={`/publicprofile/${friend.username}`}
                    target="_blank"
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                  >
                    Ver
                  </Link>
                  
                  <div className="relative group/menu">
                    <button className="py-2 px-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-connect-card border border-connect-border rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button
                        onClick={() => handleToggleBestFriend(friend.id)}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors flex items-center gap-2 rounded-t-xl"
                      >
                        <svg className={`w-4 h-4 ${friend.isBestFriend ? 'text-yellow-500' : 'text-connect-muted'}`} fill={friend.isBestFriend ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {friend.isBestFriend ? 'Quitar de favoritos' : 'Marcar favorito'}
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 rounded-b-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                        Eliminar amigo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFriends.length === 0 && (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-bold mb-2">No se encontraron amigos</h3>
                <p className="text-connect-muted text-sm mb-4">
                  {searchQuery ? 'Intenta con otra busqueda' : 'Empieza a conectar con personas'}
                </p>
                <Link href="/usuarios">
                  <Button className="bg-primary hover:brightness-110 text-connect-bg-dark font-bold">
                    Buscar Personas
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === "solicitudes" && (
          <div className="space-y-4">
            {friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-connect-card border border-connect-border rounded-xl p-4 flex items-center gap-4"
                >
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{request.name}</h3>
                    <p className="text-sm text-connect-muted">@{request.username}</p>
                    <p className="text-xs text-connect-muted mt-1">
                      {request.gender} - {request.age} - {request.city}
                    </p>
                    <p className="text-xs text-connect-muted">
                      {request.mutualFriends} amigos en comun - {request.requestDate}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-primary hover:brightness-110 text-connect-bg-dark font-bold"
                    >
                      Aceptar
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(request.id)}
                      variant="outline"
                      className="border-connect-border text-white hover:bg-white/5"
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <h3 className="text-lg font-bold mb-2">No hay solicitudes pendientes</h3>
                <p className="text-connect-muted text-sm">
                  Cuando alguien quiera ser tu amigo, aparecera aqui
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blocked Users */}
        {activeTab === "bloqueados" && (
          <div className="space-y-4">
            {blockedUsers.length > 0 ? (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-connect-card border border-connect-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-connect-muted">Bloqueado el {user.blockedDate}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-connect-border text-white hover:bg-white/5"
                  >
                    Desbloquear
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <h3 className="text-lg font-bold mb-2">No hay usuarios bloqueados</h3>
                <p className="text-connect-muted text-sm">
                  Los usuarios que bloquees apareceran aqui
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Messages Window */}
      <FloatingMessagesWindow />
    </div>
  );
}
