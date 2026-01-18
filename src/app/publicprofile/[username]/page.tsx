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

  // =====================================================
  // MAPEO DE VALORES INTERNOS A ETIQUETAS LEGIBLES
  // =====================================================
  const labelMaps: Record<string, Record<string, string>> = {
    // Tipo de cuerpo
    tipo_cuerpo: {
      'prefiero-no-decir': 'Prefiero no decir',
      'delgado': 'Delgado/a',
      'atletico': 'Atlético/a',
      'punto-medio': 'Punto medio',
      'curvas-extra': 'Algunas curvas extra',
      'talla-grande': 'De talla grande',
      'grande-robusto': 'Grande y robusto/a',
    },
    // Color de ojos
    color_ojos: {
      'negros': 'Negros', 'marrones': 'Marrones', 'azules': 'Azules',
      'verdes': 'Verdes', 'grises': 'Grises', 'otro': 'Otro',
    },
    // Color de cabello
    color_cabello: {
      'negro': 'Negro', 'castano': 'Castaño', 'rubio': 'Rubio',
      'pelirrojo': 'Pelirrojo', 'gris': 'Gris/Blanco', 'otro': 'Otro',
    },
    // Signo zodiacal
    signo_zodiacal: {
      'aries': 'Aries', 'tauro': 'Tauro', 'geminis': 'Géminis', 'cancer': 'Cáncer',
      'leo': 'Leo', 'virgo': 'Virgo', 'libra': 'Libra', 'escorpio': 'Escorpio',
      'sagitario': 'Sagitario', 'capricornio': 'Capricornio', 'acuario': 'Acuario', 'piscis': 'Piscis',
    },
    // Educación
    educacion: {
      'primario': 'Primario', 'secundario': 'Secundario',
      'algunos-terciarios': 'Algunos estudios terciarios', 'graduado-terciario': 'Graduado terciario',
      'algunos-universitarios': 'Algunos estudios universitarios', 'graduado-universitario': 'Graduado universitario',
      'posgrado-universitario': 'Posgrado universitario', 'otro': 'Otros',
    },
    // Etnia
    etnia: {
      'blanco': 'Blanco/a (Caucásico/a)', 'afro': 'Afro/Negro/a', 'asiatico': 'Asiático/a',
      'mestizo': 'Mestizo/a', 'indigena': 'Indígena', 'arabe': 'Árabe/Turco/a', 'otro': 'Otro',
    },
    // Vives en
    vives_en: { 'ciudad': 'Ciudad', 'campo': 'Campo' },
    // Estado civil
    estado_civil: {
      'no-respondo': 'Prefiero no responder', 'soltero': 'Soltero/a', 'divorciado': 'Divorciado/a',
      'separado': 'Separado/a', 'viudo': 'Viudo/a', 'en-relacion': 'En relación',
      'viviendo-pareja': 'Viviendo en pareja', 'casado': 'Casado/a',
    },
    // Quiere tener hijos
    quiere_tener_hijos: {
      'no': 'No', 'si': 'Sí', 'no-seguro': 'No estoy seguro/a',
      'lo-pensaria': 'Lo pensaría / Abierto a futuro', 'adoptados': 'Sí, aunque serían adoptados',
      'no-puedo': 'No puedo tener hijos',
    },
    // Razón principal
    razon_principal: {
      'familia-futuro': 'Formar una familia y planear un futuro',
      'acompanado': 'Sentirme acompañado/a y pasarla bien',
      'no-seguro': 'No estoy seguro/a',
    },
    // Casarse importante
    casarse_importante: {
      'si-importante': 'Sí, me gustaría casarme',
      'no-tan-importante': 'No es tan importante, vivir juntos sería suficiente',
      'futuro-dira': 'El futuro lo dirá',
    },
    // Duración relación larga
    duracion_relacion_larga: {
      'menos-1': 'Menos de 1 año', 'mas-1': 'Más de 1 año', 'mas-2': 'Más de 2 años',
      'mas-3': 'Más de 3 años', 'mas-4': 'Más de 4 años', 'mas-5': 'Más de 5 años',
      'mas-6': 'Más de 6 años', 'mas-7': 'Más de 7 años', 'mas-8': 'Más de 8 años',
      'mas-9': 'Más de 9 años', 'mas-10': 'Más de 10 años',
    },
    // Tiene mascota
    tiene_mascota: {
      'no': 'No', 'perro': 'Perro', 'gato': 'Gato', 'perro-gato': 'Perro y gato',
      'pajaro': 'Pájaro', 'otro': 'Otro',
    },
    // Ejercicio
    te_ejercitas: {
      'nunca': 'Nunca', 'ocasionalmente': 'Ocasionalmente', 'semanalmente': 'Semanalmente',
      'diariamente': 'Diariamente',
    },
    // Dieta especial
    dieta_especial: {
      'ninguna': 'Ninguna', 'sin-lactosa': 'Sin lactosa', 'sin-azucar': 'Sin azúcar',
      'sin-gluten': 'Sin gluten (celíaca)', 'diabetes': 'Diabetes', 'vegetariana': 'Vegetariana',
      'vegana': 'Vegana', 'kosher': 'Kosher', 'halal': 'Halal', 'otra': 'Otra',
    },
    // Tiempo con familia
    tiempo_con_familia: {
      'si-encanta': 'Sí, me encanta, soy súper familiero/a',
      'de-vez-en-cuando': 'De vez en cuando, no necesito tanto',
      'no-mucho': 'No mucho, prefiero mi independencia',
    },
    // Personalidad sociable
    personalidad_sociable: {
      'muy-sociable': 'Muy sociable, me encanta conocer gente',
      'neutro': 'Término medio',
      'introvertido': 'Más bien introvertido/a',
    },
    // Orden y mantenimiento
    orden_mantenimiento: {
      'muy-ordenado': 'Muy ordenado/a, todo en su lugar',
      'normal': 'Normal, ni muy ordenado ni desordenado',
      'muy-relajado': 'Muy relajado/a con el orden',
    },
    // Valores tradicionales
    valores_tradicionales: {
      'mucho': 'Sí, mucho', 'algo': 'Algo', 'poco': 'Poco', 'nada': 'Nada',
    },
    // Espiritualidad
    espiritualidad: {
      'muy-espiritual': 'Muy espiritual', 'algo': 'Algo espiritual',
      'no-mucho': 'No mucho', 'para-nada': 'Para nada',
    },
    // Religión
    religion: {
      'catolico': 'Católico/a', 'cristiano': 'Cristiano/a (no católico)',
      'judio': 'Judío/a', 'musulman': 'Musulmán/a', 'budista': 'Budista',
      'hindu': 'Hindú', 'agnostico': 'Agnóstico/a', 'ateo': 'Ateo/a',
      'no-religioso': 'No religioso/a', 'otro': 'Otro',
    },
    // Convicciones religiosas
    convicciones_religiosas: {
      'muy-religioso': 'Muy religioso/a, practicante activo',
      'bastante-religioso': 'Bastante religioso/a',
      'algo-religioso': 'Algo religioso/a',
      'no-muy-religioso': 'No muy religioso/a',
    },
    // Ambición
    eres_ambicioso: {
      'super-ambicioso': 'Súper ambicioso/a', 'bastante': 'Bastante ambicioso/a',
      'normal': 'Normal', 'poco': 'Poco ambicioso/a', 'nada': 'Nada ambicioso/a',
    },
    // Qué buscas (array)
    que_buscas: {
      'pareja-seria': 'Pareja seria', 'aventuras': 'Aventuras sin compromiso',
      'amistad': 'Amistad', 'charlar-alguien': 'Charlar con alguien',
      'conocer-gente': 'Conocer gente nueva', 'no-seguro': 'No estoy seguro/a',
    },
  };

  // Función para obtener etiqueta legible
  const getLabel = (field: string, value: any, otherField?: string): string => {
    if (value === null || value === undefined || value === '') return '';
    
    // Booleanos
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (value === 'true') return 'Sí';
    if (value === 'false') return 'No';
    
    // Si hay campo "otro" con valor, mostrarlo
    if (otherField && profile?.[otherField]) {
      return profile[otherField];
    }
    
    // Buscar en el mapa
    const map = labelMaps[field];
    if (map && map[value]) {
      return map[value];
    }
    
    // Capitalizar primera letra si no hay mapeo
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
    }
    
    return String(value);
  };

  // Helper: verificar si un valor tiene contenido (array o string)
  const hasContent = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };

  // Función para formatear arrays como tags
  // Maneja casos donde el valor puede ser: array, string JSON, string simple, null, undefined
  const renderTags = (items: string[] | string | null | undefined, color: string = 'primary', field?: string) => {
    // Convertir a array si es necesario
    let itemsArray: string[] = [];
    
    if (!items) {
      return null;
    } else if (Array.isArray(items)) {
      itemsArray = items;
    } else if (typeof items === 'string') {
      // Intentar parsear como JSON (ej: '["item1","item2"]')
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) {
          itemsArray = parsed;
        } else {
          // Es un string simple, convertir a array de un elemento
          itemsArray = [items];
        }
      } catch {
        // No es JSON válido, tratar como string simple
        // Puede ser separado por comas
        if (items.includes(',')) {
          itemsArray = items.split(',').map(s => s.trim()).filter(s => s);
        } else {
          itemsArray = [items];
        }
      }
    }
    
    if (itemsArray.length === 0) return null;
    
    // Mapear valores a etiquetas legibles si hay campo especificado
    if (field && labelMaps[field]) {
      itemsArray = itemsArray.map(item => labelMaps[field][item] || item);
    }
    
    const colorClasses = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };
    return (
      <div className="flex flex-wrap gap-1.5">
        {itemsArray.map((item, idx) => (
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

  // Función para formatear valores con iconos - ahora usa getLabel para mostrar texto legible
  const renderInfoItem = (icon: string, label: string, value: string | number | boolean | null | undefined, field?: string, otherField?: string) => {
    if (value === null || value === undefined || value === '' || value === false || value === 'false') return null;
    
    // Usar getLabel si tenemos el nombre del campo
    const displayValue = field ? getLabel(field, value, otherField) : (
      typeof value === 'boolean' ? (value ? 'Sí' : 'No') : 
      value === 'true' ? 'Sí' : value
    );
    
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
                  {renderInfoItem('🏋️', 'Cuerpo', profile.tipo_cuerpo, 'tipo_cuerpo')}
                  {renderInfoItem('👁️', 'Ojos', profile.color_ojos, 'color_ojos')}
                  {renderInfoItem('💇', 'Cabello', profile.color_cabello, 'color_cabello')}
                  {renderInfoItem('⭐', 'Signo', profile.signo_zodiacal, 'signo_zodiacal')}
                  {renderInfoItem('🎓', 'Educación', profile.educacion, 'educacion')}
                  {renderInfoItem('🌍', 'Etnia', profile.etnia, 'etnia')}
                  {renderInfoItem('🏠', 'Vive en', profile.vives_en, 'vives_en')}
                  {renderInfoItem('💼', 'Trabaja', profile.trabajas)}
                  {renderInfoItem('👔', 'Trabajo', profile.en_que_trabaja)}
                  {renderInfoItem('🚗', 'Vehículo', profile.tiene_vehiculo)}
                  {renderInfoItem('🐾', 'Mascota', profile.tiene_mascota, 'tiene_mascota', 'tiene_mascota_otra')}
                </div>
              </section>

              {/* RELACIONES */}
              {(profile.estado_civil || hasContent(profile.que_buscas) || profile.tiene_hijos !== null) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>💑</span> Relaciones
                  </h2>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {renderInfoItem('💍', 'Estado civil', profile.estado_civil, 'estado_civil')}
                    {renderInfoItem('👶', 'Tiene hijos', profile.tiene_hijos)}
                    {renderInfoItem('🍼', 'Quiere hijos', profile.quiere_tener_hijos, 'quiere_tener_hijos')}
                    {renderInfoItem('💒', 'Casarse', profile.casarse_importante, 'casarse_importante')}
                    {renderInfoItem('⏰', 'Relación más larga', profile.duracion_relacion_larga, 'duracion_relacion_larga')}
                  </div>
                  {hasContent(profile.que_buscas) && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-400 block mb-2">Busca:</span>
                      {renderTags(profile.que_buscas, 'pink', 'que_buscas')}
                    </div>
                  )}
                  {profile.razon_principal && (
                    <p className="text-xs text-gray-400 mt-3">
                      <span className="text-gray-500">Razón principal:</span> {getLabel('razon_principal', profile.razon_principal)}
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
              {(hasContent(profile.pasatiempos) || profile.intereses) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span>🎭</span> Intereses y pasatiempos
                  </h2>
                  {profile.intereses && (
                    <p className="text-gray-300 text-sm mb-3">{profile.intereses}</p>
                  )}
                  {hasContent(profile.pasatiempos) && (
                    <div className="mb-3">
                      {renderTags(profile.pasatiempos, 'primary')}
                    </div>
                  )}
                  
                  {/* Sub-categorías */}
                  {hasContent(profile.generos_peliculas) && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎬 Películas:</span>
                      {renderTags(profile.generos_peliculas, 'blue')}
                    </div>
                  )}
                  {hasContent(profile.generos_musica) && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎵 Música:</span>
                      {renderTags(profile.generos_musica, 'purple')}
                    </div>
                  )}
                  {hasContent(profile.generos_libros) && (
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 block mb-1.5">📚 Libros:</span>
                      {renderTags(profile.generos_libros, 'amber')}
                    </div>
                  )}
                  {hasContent(profile.deportes_practica) && (
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
                    {renderInfoItem('🏋️', 'Ejercicio', profile.te_ejercitas, 'te_ejercitas')}
                    {renderInfoItem('🚬', 'Fuma', profile.fumas)}
                    {renderInfoItem('🍷', 'Bebe', profile.bebes_alcohol)}
                    {renderInfoItem('🥗', 'Dieta', profile.dieta_especial, 'dieta_especial', 'dieta_especial_otra')}
                    {renderInfoItem('👨‍👩‍👧', 'Familia', profile.tiempo_con_familia, 'tiempo_con_familia')}
                    {renderInfoItem('🎭', 'Sociable', profile.personalidad_sociable, 'personalidad_sociable')}
                    {renderInfoItem('🧹', 'Orden', profile.orden_mantenimiento, 'orden_mantenimiento')}
                    {renderInfoItem('🚀', 'Ambición', profile.eres_ambicioso, 'eres_ambicioso')}
                  </div>
                  
                  {hasContent(profile.que_haces) && (
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
                    {renderInfoItem('⛪', 'Religión', profile.religion, 'religion')}
                    {renderInfoItem('🔮', 'Espiritualidad', profile.espiritualidad, 'espiritualidad')}
                    {renderInfoItem('📜', 'Valores tradicionales', profile.valores_tradicionales, 'valores_tradicionales')}
                    {renderInfoItem('🙏', 'Convicción religiosa', profile.convicciones_religiosas, 'convicciones_religiosas')}
                  </div>
                </section>
              )}

              {/* IDIOMAS */}
              {(hasContent(profile.idiomas) || hasContent(profile.habla_otro_idioma)) && (
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
