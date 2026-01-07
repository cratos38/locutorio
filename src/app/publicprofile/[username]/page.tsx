"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import PhotoManager from "@/components/PhotoManager";

export const runtime = 'edge';

export default function PerfilPage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile?username=${username}`);
        const result = await response.json();
        
        if (result.success) {
          setProfile(result.data);
        } else {
          setError(result.error || 'Usuario no encontrado');
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  // Perfiles similares (simulados por ahora)
  const similarProfiles = [
    { id: 1, name: "Carlos M.", age: 27, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 2, name: "Miguel R.", age: 30, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 3, name: "David L.", age: 26, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 4, name: "Sergio P.", age: 29, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 5, name: "Antonio F.", age: 31, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 6, name: "Pablo G.", age: 27, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
  ];
  
  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
          <p className="text-connect-muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
  // Estado de error
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">❌ {error || 'Usuario no encontrado'}</p>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header Simple */}
      <header className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="size-9 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold font-heading tracking-wide">LoCuToRiO</span>
        </Link>
        <button onClick={() => window.history.back()} className="text-connect-muted hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content - 75% width */}
      <main className="w-[75%] max-w-[1400px] mx-auto px-6 py-8">
        
        {/* Layout: Foto izquierda + Info derecha */}
        <div className="flex gap-8 mb-12">
          
          {/* IZQUIERDA: Foto + % Perfil */}
          <div className="flex-shrink-0 w-[400px]">
            {/* PhotoManager - mismo tamaño y apariencia pero sin edición */}
            <PhotoManager
              username={username}
              initialPhotos={profile.fotos && profile.fotos.length > 0 ? profile.fotos : [
                {
                  id: '1',
                  url: profile.foto_perfil || 'https://via.placeholder.com/400x520?text=Sin+Foto',
                  esPrincipal: true,
                  estado: 'aprobada'
                }
              ]}
              canUpload={false}
              canDelete={false}
              canSetPrincipal={false}
              canToggleCarousel={false}
              showCarousel={true}
              carouselEnabled={profile.carousel_enabled || false}
              carouselIntervalType={profile.carousel_interval_type || 'minutes'}
              carouselIntervalValue={profile.carousel_interval_value || 5}
            />
            
            {/* Barra de % Perfil completado */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-connect-muted">Perfil completado</span>
                <span className="text-primary font-bold">{profile.profile_completion || 0}%</span>
              </div>
              <div className="h-2 bg-connect-bg-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${profile.profile_completion || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* DERECHA: Info del perfil */}
          <div className="flex-1">
            
            {/* Nombre, edad, ciudad - SIN tarjeta, directo en fondo */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold font-heading mb-2">
                {profile.nombre || profile.username}, {profile.edad || '?'}
              </h1>
              <p className="text-lg text-connect-muted flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.ciudad || 'Ciudad no especificada'}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mb-6">
              <Button className="flex-1 bg-primary hover:brightness-110 text-connect-bg-dark font-bold shadow-[0_0_20px_rgba(43,238,121,0.3)] py-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar MP
              </Button>
              <Button variant="outline" className="flex-1 border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500 py-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
                Invitar a Café
              </Button>
              <Button variant="outline" className="flex-1 border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500 py-6">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Agregar Amigo
              </Button>
            </div>

            {/* "¿Qué haces hoy?" - SIN tarjeta, con comillas */}
            {profile.status_text && (
              <div className="mb-6 pl-4 border-l-4 border-primary/50">
                <p className="text-lg text-white italic">
                  "{profile.status_text}"
                </p>
                <p className="text-xs text-connect-muted mt-1">hace 5 min</p>
              </div>
            )}

            {/* Gráfico circular: Velocidad de respuesta */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-24 h-24">
                {/* Círculo de progreso (simplificado) */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgb(43, 238, 121)"
                    strokeWidth="8"
                    strokeDasharray="188.4 251.2"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-primary">15</span>
                  <span className="text-[10px] text-connect-muted">min</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">Velocidad de respuesta</h3>
                <p className="text-xs text-connect-muted">
                  Responde en promedio en 15 minutos
                </p>
              </div>
            </div>

            {/* Bio e intereses */}
            <div className="space-y-4">
              {profile.cuentanos_algo_tuyo && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">Sobre mí</h3>
                  <p className="text-connect-muted leading-relaxed">{profile.cuentanos_algo_tuyo}</p>
                </div>
              )}
              
              {profile.intereses && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">Intereses</h3>
                  <p className="text-connect-muted leading-relaxed">{profile.intereses}</p>
                </div>
              )}
              
              {profile.pasatiempos && profile.pasatiempos.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-primary mb-2">Pasatiempos</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.pasatiempos.map((hobby: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/5 border border-white/10 text-white rounded-full text-sm"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Perfiles Parecidos - Full Width */}
        <div className="border-t border-connect-border pt-8">
          <h2 className="text-2xl font-bold font-heading mb-6">Perfiles Parecidos</h2>
          <div className="grid grid-cols-6 gap-4">
            {similarProfiles.map((user) => (
              <Link
                key={user.id}
                href={`/publicprofile/${user.name.toLowerCase().replace(' ', '-')}`}
                className="group"
              >
                <div className="relative aspect-[10/13] rounded-xl overflow-hidden mb-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <p className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-connect-muted text-center">{user.age} años</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
