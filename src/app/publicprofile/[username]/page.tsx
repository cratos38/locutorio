"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PerfilPage() {
  const params = useParams();
  const username = params.username as string;

  // 🔗 CONEXIÓN CON DASHBOARD
  // Este perfil muestra datos dinámicos que vienen desde:
  // 1) statusText: "¿Qué estás pensando?" del Dashboard
  // 2) presenceStatus: Online/Ocupado/Invisible del Dashboard
  // TODO: Cuando tengamos backend, obtener de /api/users/[username]
  
  // Simulando datos del perfil (esto vendría de la base de datos)
  const profile = {
    username: username,
    name: "Javier S.",
    age: 28,
    city: "Madrid",
    country: "España",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ",
    
    // 🟢 ESTADO DE PRESENCIA - Conectado desde Dashboard
    presenceStatus: 'online' as 'online' | 'busy' | 'invisible', // TODO: Obtener del backend
    online: true,
    lastSeen: "En línea",
    
    // 💭 ESTADO MENTAL - "¿Qué estás pensando?"
    // Este campo viene del input del Dashboard donde el usuario escribe su estado actual
    statusText: "Disfrutando de un café ☕ mientras planeo mis próximos viajes ✈️",
    
    bio: "Amante de la música, viajes y fotografía. Siempre buscando nuevas aventuras.",
    interests: ["Música", "Viajes", "Fotografía", "Cine", "Deportes"],
    height: "178 cm",
    bodyType: "Atlética",
    looking: "Amistad y quizás algo más",
    photos: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAT9anBwsJWTxsp8zKQ1yfPvO8mByiS-VtEXK9WPBVcMq2QmLs1IqxB0vA9x1dd0JHow5DzqRIQMxoU3NXU8N1qHC2zzfNLDs_YcaG-cyqkOfeq7N6Trfj6tlmMryNEBY88LbSlY852HMmSm_ON-yrT-RuC8SBfxFwokuCgOvoHE4N7KpWl7TkVtmhIMesTDF-06hA6WWQxKxXS_X-OfIHuYb6hLM9JoaxqImezZaDmivLr99Q_R1pNCJg4b_BEH4_8Ob945bspR5EL",
    ],
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide">LoCuToRiO</span>
        </Link>

        <button
          onClick={() => window.close()}
          className="text-connect-muted hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-connect-card border border-connect-border rounded-xl p-6 sticky top-24">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-connect-border"
                  />
                  {/* Indicador de estado de presencia */}
                  {profile.presenceStatus !== 'invisible' && (
                    <span 
                      className={`absolute bottom-2 right-2 w-6 h-6 border-4 border-connect-card rounded-full ${
                        profile.presenceStatus === 'online' 
                          ? 'bg-green-500' 
                          : profile.presenceStatus === 'busy'
                          ? 'bg-orange-500'
                          : 'bg-gray-500'
                      }`}
                      title={
                        profile.presenceStatus === 'online' 
                          ? 'Online' 
                          : profile.presenceStatus === 'busy'
                          ? 'Ocupado'
                          : 'Offline'
                      }
                    ></span>
                  )}
                  {/* Si está invisible, no se muestra nada (aparece como offline) */}
                </div>

                <h1 className="text-2xl font-bold font-heading mb-1">{profile.name}</h1>
                <p className="text-connect-muted mb-2">@{profile.username}</p>
                {/* Texto de estado según presenceStatus */}
                <p className="text-sm mb-4">
                  <span className={`${
                    profile.presenceStatus === 'online' 
                      ? 'text-green-500' 
                      : profile.presenceStatus === 'busy'
                      ? 'text-orange-500'
                      : 'text-gray-400'
                  }`}>
                    {profile.presenceStatus === 'online' && '🟢 En línea'}
                    {profile.presenceStatus === 'busy' && '🟠 Ocupado'}
                    {profile.presenceStatus === 'invisible' && 'Última vez: hace 2 horas'}
                  </span>
                </p>

                <div className="flex gap-2 mb-6">
                  <Button className="flex-1 bg-primary hover:brightness-110 text-connect-bg-dark font-bold shadow-[0_0_20px_rgba(43,238,121,0.3)]">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar MP
                  </Button>
                  <Button variant="outline" className="border-pink-500/50 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </Button>
                </div>

                {/* Quick Info */}
                <div className="text-left space-y-3 border-t border-connect-border pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-connect-muted">{profile.city}, {profile.country}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-connect-muted">{profile.age} años</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-connect-muted">{profile.height} • {profile.bodyType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 💭 Pensando... - Estado actual del usuario */}
            {profile.statusText && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      Pensando...
                      <span className="text-xs text-connect-muted font-normal">hace 5 min</span>
                    </h3>
                    <p className="text-white leading-relaxed">{profile.statusText}</p>
                  </div>
                </div>
              </div>
            )}

            {/* About Me */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Sobre mí
              </h2>
              <p className="text-connect-muted leading-relaxed">{profile.bio}</p>
            </div>

            {/* Interests */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Intereses
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Looking For */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ¿Qué busca?
              </h2>
              <p className="text-connect-muted">{profile.looking}</p>
            </div>

            {/* Photos */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-6">
              <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fotos ({profile.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.photos.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-connect-bg-dark">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
                <div className="aspect-square rounded-lg border-2 border-dashed border-connect-border flex items-center justify-center text-connect-muted hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs">Ver más</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
