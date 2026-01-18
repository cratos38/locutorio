"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";
import { useMessages } from "@/contexts/MessagesContext";
import { useAuth } from "@/contexts/AuthContext";
import FloatingMessagesWindow from "@/components/FloatingMessagesWindow";

type Friend = {
  id: string;
  friendshipId: string;
  username: string;
  name: string;
  age: number | null;
  city: string;
  gender: "H" | "M" | "O";
  avatar: string;
  status: "online" | "away" | "offline";
  statusText?: string;
  lastSeen?: string;
  isBestFriend?: boolean;
  mutualFriends?: number;
  addedDate: string;
};

type FriendRequest = {
  id: string;
  requesterId: string;
  username: string;
  name: string;
  age: number | null;
  city: string;
  gender: "H" | "M" | "O";
  avatar: string;
  requestDate: string;
  mutualFriends: number;
};

type BlockedUser = {
  id: string;
  blockedUserId: string;
  username: string;
  name: string;
  blockedDate: string;
};

export default function AmigosPage() {
  const { user } = useAuth();
  const { openMessages } = useMessages();
  
  const [activeTab, setActiveTab] = useState<"todos" | "online" | "solicitudes" | "bloqueados">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "online">("name");
  
  // Estados con datos reales
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos desde la API
  const loadFriends = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends?userId=${user.id}&type=friends`);
      const data = await response.json();
      
      if (data.success) {
        setFriends(data.friends);
      } else {
        console.error('Error cargando amigos:', data.error);
      }
    } catch (err) {
      console.error('Error de red cargando amigos:', err);
    }
  }, [user?.id]);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends?userId=${user.id}&type=requests`);
      const data = await response.json();
      
      if (data.success) {
        setFriendRequests(data.requests);
      }
    } catch (err) {
      console.error('Error cargando solicitudes:', err);
    }
  }, [user?.id]);

  const loadBlocked = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/friends?userId=${user.id}&type=blocked`);
      const data = await response.json();
      
      if (data.success) {
        setBlockedUsers(data.blocked);
      }
    } catch (err) {
      console.error('Error cargando bloqueados:', err);
    }
  }, [user?.id]);

  // Cargar todos los datos al inicio
  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([loadFriends(), loadRequests(), loadBlocked()]);
      } catch (err) {
        setError('Error al cargar datos');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllData();
  }, [user?.id, loadFriends, loadRequests, loadBlocked]);

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
               friend.city?.toLowerCase().includes(query);
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
  const handleAcceptRequest = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          friendshipId: requestId,
          action: 'accept'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Recargar datos
        await loadFriends();
        await loadRequests();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error aceptando solicitud:', err);
      alert('Error al aceptar la solicitud');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          friendshipId: requestId,
          action: 'reject'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error rechazando solicitud:', err);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user?.id) return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar a este amigo?")) {
      return;
    }
    
    try {
      const response = await fetch(
        `/api/friends?userId=${user.id}&targetUserId=${friendId}&action=remove_friend`,
        { method: 'DELETE' }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setFriends(prev => prev.filter(f => f.id !== friendId));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error eliminando amigo:', err);
    }
  };

  const handleToggleBestFriend = async (friendId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          targetUserId: friendId,
          action: 'toggle_best_friend'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFriends(prev => prev.map(f => 
          f.id === friendId ? { ...f, isBestFriend: data.isBestFriend } : f
        ));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error actualizando favorito:', err);
    }
  };

  const handleUnblock = async (blockedUserId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `/api/friends?userId=${user.id}&targetUserId=${blockedUserId}&action=unblock`,
        { method: 'DELETE' }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setBlockedUsers(prev => prev.filter(b => b.blockedUserId !== blockedUserId));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error('Error desbloqueando usuario:', err);
    }
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
      case "online": return "En línea";
      case "away": return "Ausente";
      case "offline": return "Desconectado";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white font-display">
        <InternalHeader />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">Mis Amigos</h1>
            <p className="text-connect-muted">
              {totalFriends} amigos en total - {onlineCount} en línea ahora
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
                <p className="text-xs text-connect-muted">En Línea</p>
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
            En Línea
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
              <option value="recent">Más recientes</option>
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
                      {friend.gender} - {friend.age || '?'} - {friend.city || 'Sin ciudad'}
                    </p>
                  </div>
                </div>

                {/* Status Text */}
                <div className="mb-4">
                  <p className={`text-xs font-medium ${
                    friend.status === "online" ? "text-primary" : 
                    friend.status === "away" ? "text-orange-400" : "text-gray-500"
                  }`}>
                    {friend.statusText || (friend.lastSeen ? `Visto ${formatDate(friend.lastSeen)}` : getStatusText(friend.status))}
                  </p>
                  {friend.mutualFriends && friend.mutualFriends > 0 && (
                    <p className="text-xs text-connect-muted mt-1">
                      {friend.mutualFriends} amigos en común
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
                <h3 className="text-lg font-bold mb-2">
                  {searchQuery ? 'No se encontraron amigos' : 'Aún no tienes amigos'}
                </h3>
                <p className="text-connect-muted text-sm mb-4">
                  {searchQuery ? 'Intenta con otra búsqueda' : 'Empieza a conectar con personas'}
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
                  className="bg-connect-card border border-connect-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
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
                      {request.gender} - {request.age || '?'} - {request.city || 'Sin ciudad'}
                    </p>
                    <p className="text-xs text-connect-muted">
                      {request.mutualFriends > 0 && `${request.mutualFriends} amigos en común - `}
                      {formatDate(request.requestDate)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 sm:flex-none bg-primary hover:brightness-110 text-connect-bg-dark font-bold"
                    >
                      Aceptar
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(request.id)}
                      variant="outline"
                      className="flex-1 sm:flex-none border-connect-border text-white hover:bg-white/5"
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
                  Cuando alguien quiera ser tu amigo, aparecerá aquí
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blocked Users */}
        {activeTab === "bloqueados" && (
          <div className="space-y-4">
            {blockedUsers.length > 0 ? (
              blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="bg-connect-card border border-connect-border rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white">{blocked.name}</h3>
                    <p className="text-sm text-connect-muted">@{blocked.username}</p>
                    <p className="text-xs text-connect-muted">
                      Bloqueado {formatDate(blocked.blockedDate)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleUnblock(blocked.blockedUserId)}
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
                  Los usuarios que bloquees aparecerán aquí
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
