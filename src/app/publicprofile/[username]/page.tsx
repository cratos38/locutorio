"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import PhotoGallery, { Photo } from "@/components/PhotoGallery";
import { useAuth } from "@/contexts/AuthContext";

export const runtime = 'edge';

export default function PerfilPage() {
  const params = useParams();
  const username = params.username as string;
  const { user } = useAuth();
  
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

  // Perfiles similares (más pequeños)
  const similarProfiles = [
    { id: 1, name: "Carlos", age: 27, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
    { id: 2, name: "Miguel", age: 30, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel" },
    { id: 3, name: "David", age: 26, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { id: 4, name: "Sergio", age: 29, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sergio" },
    { id: 5, name: "Antonio", age: 31, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio" },
    { id: 6, name: "Pablo", age: 27, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pablo" },
    { id: 7, name: "Ana", age: 25, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
    { id: 8, name: "Laura", age: 28, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laura" },
  ];

  // Función para formatear arrays como tags
  const renderTags = (items: string[] | null | undefined, color: string = 'primary') => {
    if (!items || items.length === 0) return null;
    const colorClasses = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className={`px-2 py-0.5 text-xs rounded-full border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Función para formatear valores con iconos
  const renderInfoItem = (icon: string, label: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined || value === '' || value === false) return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-base">{icon}</span>
        <span className="text-gray-400">{label}:</span>
        <span className="text-white">{displayValue}</span>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-connect-muted">Cargando perfil...</p>
        </div>
      </div>
    );
  }
  
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
      {/* Header compacto */}
      <header className="h-14 bg-connect-card/80 backdrop-blur-sm border-b border-connect-border flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-lg font-bold font-heading">LoCuToRiO</span>
        </Link>
        <button onClick={() => window.history.back()} className="text-connect-muted hover:text-white transition-colors p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Contenido con scroll */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Grid principal: sidebar izquierdo + contenido */}
        <div className="flex gap-6">
          
          {/* SIDEBAR IZQUIERDO - Foto + Perfiles similares */}
          <div className="w-64 flex-shrink-0 space-y-4">
            {/* Foto - más pequeña */}
            <div className="sticky top-20">
              <PhotoGallery
                photos={profile.fotos && profile.fotos.length > 0 ? profile.fotos : [
                  {
                    id: '1',
                    url: profile.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                    esPrincipal: true,
                    estado: 'aprobada'
                  }
                ]}
              />
              
              {/* Barra de % completado */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-connect-muted">Perfil</span>
                  <span className="text-primary font-bold">{Math.min(100, profile.profile_completion || 0)}%</span>
                </div>
                <div className="h-1.5 bg-connect-bg-dark rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, profile.profile_completion || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Perfiles similares - muy compactos */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Perfiles similares</h3>
                <div className="grid grid-cols-4 gap-2">
                  {similarProfiles.map((p) => (
                    <Link
                      key={p.id}
                      href={`/publicprofile/${p.name.toLowerCase()}`}
                      className="group text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-connect-border group-hover:border-primary/50 transition-colors">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 truncate group-hover:text-primary">{p.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 min-w-0">
            {/* Cabecera: Nombre y botones */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold font-heading">
                    {profile.nombre || profile.username}, {profile.edad || '?'}
                  </h1>
                  <p className="text-sm text-connect-muted flex items-center gap-1.5 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.ciudad || 'Sin especificar'}
                  </p>
                </div>
                
                {/* Botones de acción - más finos */}
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary hover:brightness-110 text-connect-bg-dark font-semibold h-9 px-4">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Mensaje
                  </Button>
                  <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 h-9 px-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-9 px-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Status del usuario */}
              {profile.status_text && (
                <div className="bg-connect-card/50 border border-connect-border rounded-lg px-4 py-3">
                  <p className="text-sm text-white italic">"{profile.status_text}"</p>
                </div>
              )}
            </div>

            {/* Grid de secciones */}
            <div className="space-y-4">
              
              {/* SOBRE MÍ */}
              {(profile.cuentanos_algo_tuyo || profile.definete_en_frase) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>👤</span> Sobre mí
                  </h2>
                  {profile.definete_en_frase && (
                    <p className="text-white font-medium mb-2">"{profile.definete_en_frase}"</p>
                  )}
                  {profile.cuentanos_algo_tuyo && (
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.cuentanos_algo_tuyo}</p>
                  )}
                </section>
              )}

              {/* INFORMACIÓN BÁSICA */}
              <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span>📋</span> Información
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {renderInfoItem('📏', 'Altura', profile.altura ? `${profile.altura} cm` : null)}
                  {renderInfoItem('⚖️', 'Peso', profile.peso ? `${profile.peso} kg` : null)}
                  {renderInfoItem('🏋️', 'Cuerpo', profile.tipo_cuerpo)}
                  {renderInfoItem('👁️', 'Ojos', profile.color_ojos)}
                  {renderInfoItem('💇', 'Cabello', profile.color_cabello)}
                  {renderInfoItem('⭐', 'Signo', profile.signo_zodiacal)}
                  {renderInfoItem('🎓', 'Educación', profile.educacion)}
                  {renderInfoItem('🌍', 'Etnia', profile.etnia)}
                  {renderInfoItem('🏠', 'Vive en', profile.vives_en)}
                  {renderInfoItem('💼', 'Trabaja', profile.trabajas)}
                  {renderInfoItem('👔', 'Trabajo', profile.en_que_trabaja)}
                  {renderInfoItem('🚗', 'Vehículo', profile.tiene_vehiculo)}
                  {renderInfoItem('🐾', 'Mascota', profile.tiene_mascota)}
                </div>
              </section>

              {/* RELACIONES */}
              {(profile.estado_civil || profile.que_buscas || profile.tiene_hijos !== null) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>💑</span> Relaciones
                  </h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {renderInfoItem('💍', 'Estado civil', profile.estado_civil)}
                    {renderInfoItem('👶', 'Tiene hijos', profile.tiene_hijos)}
                    {renderInfoItem('🍼', 'Quiere hijos', profile.quiere_tener_hijos)}
                    {renderInfoItem('💒', 'Casarse', profile.casarse_importante)}
                    {renderInfoItem('⏰', 'Relación larga', profile.duracion_relacion_larga)}
                  </div>
                  {profile.que_buscas && profile.que_buscas.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-400 block mb-2">Busca:</span>
                      {renderTags(profile.que_buscas, 'pink')}
                    </div>
                  )}
                  {profile.razon_principal && (
                    <p className="text-xs text-gray-400 mt-3">
                      <span className="text-gray-500">Razón principal:</span> {profile.razon_principal}
                    </p>
                  )}
                </section>
              )}

              {/* PRIMERA CITA IDEAL */}
              {profile.primera_cita_ideal && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>☕</span> Primera cita ideal
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{profile.primera_cita_ideal}</p>
                </section>
              )}

              {/* PASATIEMPOS E INTERESES */}
              {(profile.pasatiempos?.length > 0 || profile.intereses) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🎭</span> Intereses y pasatiempos
                  </h2>
                  {profile.intereses && (
                    <p className="text-gray-300 text-sm mb-3">{profile.intereses}</p>
                  )}
                  {profile.pasatiempos && profile.pasatiempos.length > 0 && (
                    <div className="mb-3">
                      {renderTags(profile.pasatiempos, 'primary')}
                    </div>
                  )}
                  
                  {/* Sub-categorías */}
                  {profile.generos_peliculas?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎬 Películas:</span>
                      {renderTags(profile.generos_peliculas, 'blue')}
                    </div>
                  )}
                  {profile.generos_musica?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎵 Música:</span>
                      {renderTags(profile.generos_musica, 'purple')}
                    </div>
                  )}
                  {profile.generos_libros?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">📚 Libros:</span>
                      {renderTags(profile.generos_libros, 'amber')}
                    </div>
                  )}
                  {profile.deportes_practica?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">⚽ Deportes:</span>
                      {renderTags(profile.deportes_practica, 'primary')}
                    </div>
                  )}
                </section>
              )}

              {/* ESTILO DE VIDA */}
              {(profile.fumas !== null || profile.bebes_alcohol !== null || profile.te_ejercitas || profile.dieta_especial) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🏃</span> Estilo de vida
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {renderInfoItem('🏋️', 'Ejercicio', profile.te_ejercitas)}
                    {renderInfoItem('🚬', 'Fuma', profile.fumas)}
                    {renderInfoItem('🍷', 'Bebe', profile.bebes_alcohol)}
                    {renderInfoItem('🥗', 'Dieta', profile.dieta_especial)}
                    {renderInfoItem('👨‍👩‍👧', 'Familia', profile.tiempo_con_familia)}
                    {renderInfoItem('🎭', 'Sociable', profile.personalidad_sociable)}
                    {renderInfoItem('🧹', 'Orden', profile.orden_mantenimiento)}
                    {renderInfoItem('🚀', 'Ambición', profile.eres_ambicioso)}
                  </div>
                  
                  {profile.que_haces?.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">Actividades:</span>
                      {renderTags(profile.que_haces, 'primary')}
                    </div>
                  )}
                </section>
              )}

              {/* VALORES Y CREENCIAS */}
              {(profile.religion || profile.espiritualidad || profile.valores_tradicionales) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🙏</span> Valores y creencias
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {renderInfoItem('⛪', 'Religión', profile.religion)}
                    {renderInfoItem('🔮', 'Espiritualidad', profile.espiritualidad)}
                    {renderInfoItem('📜', 'Valores', profile.valores_tradicionales)}
                    {renderInfoItem('🙏', 'Convicción', profile.convicciones_religiosas)}
                  </div>
                </section>
              )}

              {/* IDIOMAS */}
              {(profile.idiomas?.length > 0 || profile.habla_otro_idioma?.length > 0) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🌐</span> Idiomas
                  </h2>
                  {renderTags(profile.idiomas || profile.habla_otro_idioma, 'blue')}
                </section>
              )}

              {/* Velocidad de respuesta */}
              <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(43, 238, 121)" strokeWidth="8" strokeDasharray="188.4 251.2" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm font-bold text-primary">15</span>
                      <span className="text-[8px] text-connect-muted">min</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Velocidad de respuesta</h3>
                    <p className="text-xs text-connect-muted">Responde en promedio en 15 minutos</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
