"use client";

import { useState } from "react";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";

export default function VisitasPage() {
  const [activeTab, setActiveTab] = useState<"me-vieron" | "he-visitado" | "fotos">("me-vieron");
  const [activeFilter, setActiveFilter] = useState<"today" | "week" | "month" | "all">("today");

  // Mock data - Me vieron
  const visitors = [
    { id: 1, username: "javier-s", name: "Javier S.", age: 28, city: "Madrid", gender: "H", time: "Hace 5 min", avatar: "https://ui-avatars.com/api/?name=Javier+S&background=10b981&color=fff", online: true },
    { id: 2, username: "laura-g", name: "Laura G.", age: 25, city: "Barcelona", gender: "M", time: "Hace 12 min", avatar: "https://ui-avatars.com/api/?name=Laura+G&background=10b981&color=fff", online: false },
    { id: 3, username: "maria-p", name: "Maria P.", age: 27, city: "Valencia", gender: "M", time: "Hace 23 min", avatar: "https://ui-avatars.com/api/?name=Maria+P&background=10b981&color=fff", online: true },
    { id: 4, username: "carlos-r", name: "Carlos R.", age: 30, city: "Sevilla", gender: "H", time: "Hace 45 min", avatar: "https://ui-avatars.com/api/?name=Carlos+R&background=10b981&color=fff", online: true },
    { id: 5, username: "sofia-v", name: "Sofía V.", age: 26, city: "Madrid", gender: "M", time: "Hace 1 hora", avatar: "https://ui-avatars.com/api/?name=Sofia+V&background=10b981&color=fff", online: false },
    { id: 6, username: "pedro-l", name: "Pedro L.", age: 32, city: "Málaga", gender: "H", time: "Hace 2 horas", avatar: "https://ui-avatars.com/api/?name=Pedro+L&background=10b981&color=fff", online: true },
  ];

  // Mock data - He visitado
  const visited = [
    { id: 1, username: "sofia-m", name: "Sofía M.", age: 24, city: "Madrid", gender: "M", time: "Hace 3 min", avatar: "https://ui-avatars.com/api/?name=Sofia+M&background=10b981&color=fff", online: true },
    { id: 2, username: "pablo-r", name: "Pablo R.", age: 29, city: "Barcelona", gender: "H", time: "Hace 15 min", avatar: "https://ui-avatars.com/api/?name=Pablo+R&background=10b981&color=fff", online: false },
    { id: 3, username: "elena-g", name: "Elena G.", age: 26, city: "Valencia", gender: "M", time: "Hace 32 min", avatar: "https://ui-avatars.com/api/?name=Elena+G&background=10b981&color=fff", online: true },
    { id: 4, username: "diego-s", name: "Diego S.", age: 31, city: "Sevilla", gender: "H", time: "Hace 1 hora", avatar: "https://ui-avatars.com/api/?name=Diego+S&background=10b981&color=fff", online: false },
  ];

  // Mock data - Fotos vistas
  const photoViews = [
    { 
      id: 1, 
      albumTitle: "Vacaciones en Bali", 
      photoUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", 
      viewerName: "Javier S.",
      viewerUsername: "javier-s",
      viewerAvatar: "https://ui-avatars.com/api/?name=Javier+S&background=10b981&color=fff",
      viewCount: 5,
      lastView: "Hace 10 min"
    },
    { 
      id: 2, 
      albumTitle: "Fiesta de cumpleaños", 
      photoUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400", 
      viewerName: "Laura G.",
      viewerUsername: "laura-g",
      viewerAvatar: "https://ui-avatars.com/api/?name=Laura+G&background=10b981&color=fff",
      viewCount: 3,
      lastView: "Hace 25 min"
    },
    { 
      id: 3, 
      albumTitle: "Naturaleza", 
      photoUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", 
      viewerName: "Maria P.",
      viewerUsername: "maria-p",
      viewerAvatar: "https://ui-avatars.com/api/?name=Maria+P&background=10b981&color=fff",
      viewCount: 12,
      lastView: "Hace 1 hora"
    },
  ];

  const tabs = [
    { id: "me-vieron" as const, label: "Quién me ha visto", icon: "👁️", count: 28 },
    { id: "he-visitado" as const, label: "A quién he visto", icon: "🔍", count: 12 },
    { id: "fotos" as const, label: "Mis fotos vistas", icon: "📸", count: 47 },
  ];

  const filters = [
    { id: "today" as const, label: "Hoy", count: { "me-vieron": 28, "he-visitado": 12, "fotos": 15 } },
    { id: "week" as const, label: "Esta semana", count: { "me-vieron": 142, "he-visitado": 45, "fotos": 89 } },
    { id: "month" as const, label: "Este mes", count: { "me-vieron": 1256, "he-visitado": 289, "fotos": 523 } },
    { id: "all" as const, label: "Todas", count: { "me-vieron": null, "he-visitado": null, "fotos": null } },
  ];

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading mb-2">Visitas y Estadísticas</h1>
          <p className="text-connect-muted">Gestiona quién ve tu perfil y tus fotos</p>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-3 mb-6 border-b border-connect-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-[#2BEE79] border-b-2 border-[#2BEE79]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === tab.id 
                  ? 'bg-[#2BEE79]/20 text-[#2BEE79]' 
                  : 'bg-white/10 text-connect-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                activeFilter === filter.id
                  ? 'bg-[#2BEE79]/20 text-[#2BEE79] border border-[#2BEE79]/50'
                  : 'bg-transparent text-gray-400 hover:text-white border border-transparent hover:border-connect-border'
              }`}
            >
              {filter.label}
              {filter.count[activeTab] && ` (${filter.count[activeTab]})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "me-vieron" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Quiénes me visitaron</h2>
              <p className="text-connect-muted text-sm">
                {filters.find(f => f.id === activeFilter)?.count["me-vieron"] || 0} personas visitaron tu perfil
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {visitors.map((visitor) => (
                <Link
                  key={visitor.id}
                  href={`/publicprofile/${visitor.username}`}
                  target="_blank"
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 cursor-pointer">
                    <img
                      src={visitor.avatar}
                      alt={visitor.name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    {visitor.online && (
                      <span className="absolute bottom-2 right-2 w-3 h-3 bg-primary border-2 border-connect-card rounded-full"></span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                      {visitor.name}
                    </p>
                    <p className="text-xs text-connect-muted">
                      {visitor.gender} • {visitor.age} • {visitor.city}
                    </p>
                    <p className="text-[10px] text-connect-muted mt-0.5">{visitor.time}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="px-6 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all">
                Cargar más
              </button>
            </div>
          </div>
        )}

        {activeTab === "he-visitado" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Perfiles que he visitado</h2>
              <p className="text-connect-muted text-sm">
                Has visitado {filters.find(f => f.id === activeFilter)?.count["he-visitado"] || 0} perfiles
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {visited.map((user) => (
                <Link
                  key={user.id}
                  href={`/publicprofile/${user.username}`}
                  target="_blank"
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2 cursor-pointer">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                    {user.online && (
                      <span className="absolute bottom-2 right-2 w-3 h-3 bg-primary border-2 border-connect-card rounded-full"></span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-connect-muted">
                      {user.gender} • {user.age} • {user.city}
                    </p>
                    <p className="text-[10px] text-connect-muted mt-0.5">{user.time}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="px-6 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all">
                Cargar más
              </button>
            </div>
          </div>
        )}

        {activeTab === "fotos" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">Quién ha visto mis fotos</h2>
              <p className="text-connect-muted text-sm">
                Tus fotos han sido vistas {filters.find(f => f.id === activeFilter)?.count["fotos"] || 0} veces
              </p>
            </div>

            <div className="space-y-4">
              {photoViews.map((view) => (
                <div
                  key={view.id}
                  className="bg-connect-card rounded-xl p-4 border border-connect-border hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Photo thumbnail */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={view.photoUrl}
                        alt={view.albumTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg mb-1">{view.albumTitle}</h3>
                      <p className="text-sm text-connect-muted mb-3">
                        Vista {view.viewCount} {view.viewCount === 1 ? 'vez' : 'veces'} • {view.lastView}
                      </p>

                      {/* Viewer */}
                      <Link
                        href={`/publicprofile/${view.viewerUsername}`}
                        target="_blank"
                        className="inline-flex items-center gap-3 p-2 bg-connect-bg-dark rounded-lg hover:bg-connect-bg-dark/60 transition-colors group"
                      >
                        <img
                          src={view.viewerAvatar}
                          alt={view.viewerName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {view.viewerName}
                          </p>
                          <p className="text-xs text-connect-muted">@{view.viewerUsername}</p>
                        </div>
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        className="p-2 bg-connect-bg-dark hover:bg-primary/20 rounded-lg transition-colors"
                        title="Ver álbum"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        className="p-2 bg-connect-bg-dark hover:bg-primary/20 rounded-lg transition-colors"
                        title="Ver estadísticas"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="px-6 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all">
                Cargar más
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
