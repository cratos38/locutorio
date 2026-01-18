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

  // Perfiles similares
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
  // GENERADORES DE FRASES NATURALES
  // =====================================================
  
  // Helper para convertir booleanos y strings
  const toBool = (val: any): boolean | null => {
    if (val === true || val === 'true' || val === 'si') return true;
    if (val === false || val === 'false' || val === 'no') return false;
    return null;
  };

  // Helper para verificar si hay contenido
  const hasContent = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  };

  // =====================================================
  // GENERADOR: Información Física
  // =====================================================
  const generarDescripcionFisica = (): string[] => {
    if (!profile) return [];
    const frases: string[] = [];
    
    // Altura y peso
    if (profile.altura && profile.peso) {
      frases.push(`Mido ${profile.altura} cm y peso ${profile.peso} kg.`);
    } else if (profile.altura) {
      frases.push(`Mido ${profile.altura} cm.`);
    } else if (profile.peso) {
      frases.push(`Peso ${profile.peso} kg.`);
    }
    
    // Tipo de cuerpo
    const cuerpoFrases: Record<string, string> = {
      'delgado': 'Tengo un cuerpo delgado.',
      'atletico': 'Tengo un cuerpo atlético.',
      'punto-medio': 'Tengo un cuerpo en su punto medio.',
      'curvas-extra': 'Tengo algunas curvas extra.',
      'talla-grande': 'Soy de talla grande.',
      'grande-robusto': 'Soy grande y robusto/a.',
    };
    if (profile.tipo_cuerpo && cuerpoFrases[profile.tipo_cuerpo]) {
      frases.push(cuerpoFrases[profile.tipo_cuerpo]);
    }
    
    // Ojos y cabello
    if (profile.color_ojos && profile.color_cabello) {
      frases.push(`Tengo ojos ${profile.color_ojos} y cabello ${profile.color_cabello}.`);
    } else if (profile.color_ojos) {
      frases.push(`Tengo ojos ${profile.color_ojos}.`);
    } else if (profile.color_cabello) {
      frases.push(`Tengo cabello ${profile.color_cabello}.`);
    }
    
    // Signo zodiacal
    const signoLabels: Record<string, string> = {
      'aries': 'Aries', 'tauro': 'Tauro', 'geminis': 'Géminis', 'cancer': 'Cáncer',
      'leo': 'Leo', 'virgo': 'Virgo', 'libra': 'Libra', 'escorpio': 'Escorpio',
      'sagitario': 'Sagitario', 'capricornio': 'Capricornio', 'acuario': 'Acuario', 'piscis': 'Piscis',
    };
    if (profile.signo_zodiacal && signoLabels[profile.signo_zodiacal]) {
      frases.push(`Soy ${signoLabels[profile.signo_zodiacal]}.`);
    }
    
    return frases;
  };

  // =====================================================
  // GENERADOR: Educación y Trabajo
  // =====================================================
  const generarEducacionTrabajo = (): string[] => {
    if (!profile) return [];
    const frases: string[] = [];
    
    // Educación
    const educacionFrases: Record<string, string> = {
      'primario': 'Tengo estudios primarios.',
      'secundario': 'Tengo estudios secundarios.',
      'algunos-terciarios': 'Tengo algunos estudios terciarios.',
      'graduado-terciario': 'Soy graduado/a terciario.',
      'algunos-universitarios': 'Tengo algunos estudios universitarios.',
      'graduado-universitario': 'Soy graduado/a universitario.',
      'posgrado-universitario': 'Tengo estudios de posgrado universitario.',
    };
    if (profile.educacion && educacionFrases[profile.educacion]) {
      frases.push(educacionFrases[profile.educacion]);
    }
    
    // Trabajo
    const trabaja = toBool(profile.trabajas);
    if (trabaja === true) {
      if (profile.en_que_trabaja) {
        frases.push(`Trabajo como ${profile.en_que_trabaja}.`);
      } else {
        frases.push('Actualmente estoy trabajando.');
      }
    } else if (trabaja === false) {
      frases.push('Actualmente no estoy trabajando.');
    }
    
    // Vive en
    if (profile.vives_en === 'ciudad') {
      frases.push('Vivo en la ciudad.');
    } else if (profile.vives_en === 'campo') {
      frases.push('Vivo en el campo.');
    }
    
    // Etnia
    const etniaFrases: Record<string, string> = {
      'blanco': 'Soy de etnia caucásica.',
      'afro': 'Soy afrodescendiente.',
      'asiatico': 'Soy de origen asiático.',
      'mestizo': 'Soy mestizo/a.',
      'indigena': 'Soy de origen indígena.',
      'arabe': 'Soy de origen árabe.',
    };
    if (profile.etnia && etniaFrases[profile.etnia]) {
      frases.push(etniaFrases[profile.etnia]);
    }
    
    return frases;
  };

  // =====================================================
  // GENERADOR: Relaciones y lo que busca
  // =====================================================
  const generarRelaciones = (): string[] => {
    if (!profile) return [];
    const frases: string[] = [];
    
    // Estado civil
    const estadoCivilFrases: Record<string, string> = {
      'soltero': 'Estoy soltero/a.',
      'divorciado': 'Estoy divorciado/a.',
      'separado': 'Estoy separado/a.',
      'viudo': 'Soy viudo/a.',
      'en-relacion': 'Actualmente estoy en una relación.',
      'viviendo-pareja': 'Vivo con mi pareja.',
      'casado': 'Estoy casado/a.',
    };
    if (profile.estado_civil && estadoCivilFrases[profile.estado_civil]) {
      frases.push(estadoCivilFrases[profile.estado_civil]);
    }
    
    // Hijos
    const tieneHijos = toBool(profile.tiene_hijos);
    if (tieneHijos === true) {
      frases.push('Tengo hijos.');
    } else if (tieneHijos === false) {
      frases.push('No tengo hijos.');
    }
    
    // Quiere tener hijos
    const quiereHijosFrases: Record<string, string> = {
      'si': 'Me gustaría tener hijos en el futuro.',
      'no': 'No quiero tener hijos.',
      'no-seguro': 'No estoy seguro/a si quiero tener hijos.',
      'lo-pensaria': 'Estaría abierto/a a tener hijos, lo pensaría.',
      'adoptados': 'Me gustaría tener hijos, aunque serían adoptados.',
      'no-puedo': 'No puedo tener hijos.',
    };
    if (profile.quiere_tener_hijos && quiereHijosFrases[profile.quiere_tener_hijos]) {
      frases.push(quiereHijosFrases[profile.quiere_tener_hijos]);
    }
    
    // Casarse
    const casarseFrases: Record<string, string> = {
      'si-importante': 'Casarme es importante para mí, me gustaría hacerlo en el futuro.',
      'no-tan-importante': 'Casarme no es tan importante para mí, vivir juntos sería suficiente.',
      'futuro-dira': 'Sobre casarme, el futuro lo dirá.',
    };
    if (profile.casarse_importante && casarseFrases[profile.casarse_importante]) {
      frases.push(casarseFrases[profile.casarse_importante]);
    }
    
    // Duración relación más larga
    const duracionFrases: Record<string, string> = {
      'menos-1': 'Mi relación más larga duró menos de 1 año.',
      'mas-1': 'Mi relación más larga duró más de 1 año.',
      'mas-2': 'Mi relación más larga duró más de 2 años.',
      'mas-3': 'Mi relación más larga duró más de 3 años.',
      'mas-4': 'Mi relación más larga duró más de 4 años.',
      'mas-5': 'Mi relación más larga duró más de 5 años.',
      'mas-6': 'Mi relación más larga duró más de 6 años.',
      'mas-7': 'Mi relación más larga duró más de 7 años.',
      'mas-8': 'Mi relación más larga duró más de 8 años.',
      'mas-9': 'Mi relación más larga duró más de 9 años.',
      'mas-10': 'Mi relación más larga duró más de 10 años.',
    };
    if (profile.duracion_relacion_larga && duracionFrases[profile.duracion_relacion_larga]) {
      frases.push(duracionFrases[profile.duracion_relacion_larga]);
    }
    
    // Razón principal para buscar pareja
    const razonFrases: Record<string, string> = {
      'familia-futuro': 'Busco pareja para formar una familia y planear un futuro juntos.',
      'acompanado': 'Busco pareja para sentirme acompañado/a y pasarla bien.',
      'no-seguro': 'Aún no estoy seguro/a de qué busco exactamente.',
    };
    if (profile.razon_principal && razonFrases[profile.razon_principal]) {
      frases.push(razonFrases[profile.razon_principal]);
    }
    
    return frases;
  };

  // =====================================================
  // GENERADOR: Estilo de vida (fumar, beber, etc.)
  // =====================================================
  const generarEstiloVida = (): string[] => {
    if (!profile) return [];
    const frases: string[] = [];
    
    // Ejercicio
    const ejercicioFrases: Record<string, string> = {
      'diariamente': 'Me ejercito diariamente.',
      'semanalmente': 'Me ejercito semanalmente.',
      'ocasionalmente': 'Me ejercito ocasionalmente.',
      'nunca': 'No suelo hacer ejercicio.',
    };
    if (profile.te_ejercitas && ejercicioFrases[profile.te_ejercitas]) {
      frases.push(ejercicioFrases[profile.te_ejercitas]);
    }
    
    // Fumar + Saldrías con fumador
    const fuma = toBool(profile.fumas);
    const saldriasFumador = profile.saldrias_fumador;
    
    if (fuma === true && saldriasFumador) {
      if (saldriasFumador === 'si' || saldriasFumador === 'me-da-igual') {
        frases.push('Soy fumador/a y no me molestaría salir con alguien que fuma.');
      } else if (saldriasFumador === 'no') {
        frases.push('Soy fumador/a, aunque preferiría que mi pareja no fume.');
      }
    } else if (fuma === true) {
      frases.push('Soy fumador/a.');
    } else if (fuma === false && saldriasFumador) {
      if (saldriasFumador === 'no') {
        frases.push('No fumo y prefiero que mi pareja tampoco fume.');
      } else if (saldriasFumador === 'si') {
        frases.push('No fumo, pero no me molestaría salir con alguien que fuma.');
      } else if (saldriasFumador === 'me-da-igual') {
        frases.push('No fumo, y me da igual si mi pareja fuma o no.');
      }
    } else if (fuma === false) {
      frases.push('No fumo.');
    }
    
    // Beber + Saldrías con bebedor
    const bebe = toBool(profile.bebes_alcohol);
    const saldriasBebedor = profile.saldrias_bebedor;
    
    if (bebe === true && saldriasBebedor) {
      if (saldriasBebedor === 'si' || saldriasBebedor === 'me-da-igual') {
        frases.push('Bebo alcohol y no me molestaría salir con alguien que también bebe.');
      } else if (saldriasBebedor === 'solo-ocasional') {
        frases.push('Bebo alcohol, y preferiría que mi pareja solo beba ocasionalmente.');
      } else if (saldriasBebedor === 'solo-social') {
        frases.push('Bebo alcohol, y preferiría que mi pareja solo beba socialmente.');
      } else if (saldriasBebedor === 'no') {
        frases.push('Bebo alcohol, aunque preferiría que mi pareja no beba.');
      }
    } else if (bebe === true) {
      if (profile.frecuencia_beber) {
        const frecBeber: Record<string, string> = {
          'diariamente': 'Bebo alcohol diariamente.',
          'semanalmente': 'Bebo alcohol semanalmente.',
          'ocasionalmente': 'Bebo alcohol ocasionalmente.',
        };
        if (frecBeber[profile.frecuencia_beber]) {
          frases.push(frecBeber[profile.frecuencia_beber]);
        }
      } else {
        frases.push('Bebo alcohol.');
      }
    } else if (bebe === false && saldriasBebedor) {
      if (saldriasBebedor === 'no') {
        frases.push('No bebo alcohol y prefiero que mi pareja tampoco beba.');
      } else if (saldriasBebedor === 'si' || saldriasBebedor === 'me-da-igual') {
        frases.push('No bebo alcohol, pero no me molesta si mi pareja bebe.');
      } else if (saldriasBebedor === 'solo-ocasional') {
        frases.push('No bebo alcohol, pero aceptaría que mi pareja beba ocasionalmente.');
      } else if (saldriasBebedor === 'solo-social') {
        frases.push('No bebo alcohol, pero aceptaría que mi pareja beba socialmente.');
      }
    } else if (bebe === false) {
      frases.push('No bebo alcohol.');
    }
    
    // Dieta especial
    const dietaFrases: Record<string, string> = {
      'ninguna': 'No sigo ninguna dieta especial.',
      'sin-lactosa': 'Sigo una dieta sin lactosa.',
      'sin-azucar': 'Sigo una dieta sin azúcar.',
      'sin-gluten': 'Sigo una dieta sin gluten.',
      'diabetes': 'Tengo diabetes y sigo una dieta especial.',
      'vegetariana': 'Soy vegetariano/a.',
      'vegana': 'Soy vegano/a.',
      'kosher': 'Sigo una dieta kosher.',
      'halal': 'Sigo una dieta halal.',
      'otra': profile.dieta_especial_otra ? `Sigo una dieta especial: ${profile.dieta_especial_otra}.` : 'Sigo una dieta especial.',
    };
    if (profile.dieta_especial && dietaFrases[profile.dieta_especial]) {
      frases.push(dietaFrases[profile.dieta_especial]);
    }
    
    // Mascota
    const mascotaFrases: Record<string, string> = {
      'no': 'No tengo mascota.',
      'perro': 'Tengo un perro.',
      'gato': 'Tengo un gato.',
      'perro-gato': 'Tengo perro y gato.',
      'pajaro': 'Tengo un pájaro.',
      'otro': profile.tiene_mascota_otra ? `Tengo una mascota: ${profile.tiene_mascota_otra}.` : 'Tengo otra mascota.',
    };
    if (profile.tiene_mascota && mascotaFrases[profile.tiene_mascota]) {
      frases.push(mascotaFrases[profile.tiene_mascota]);
    }
    
    // Vehículo
    const tieneVehiculo = toBool(profile.tiene_vehiculo);
    if (tieneVehiculo === true) {
      frases.push('Tengo vehículo propio.');
    } else if (tieneVehiculo === false) {
      frases.push('No tengo vehículo propio.');
    }
    
    return frases;
  };

  // =====================================================
  // GENERADOR: Personalidad y valores
  // =====================================================
  const generarPersonalidad = (): string[] => {
    if (!profile) return [];
    const frases: string[] = [];
    
    // Tiempo con familia
    const familiaFrases: Record<string, string> = {
      'si-encanta': 'Soy súper familiero/a y me encanta pasar tiempo con mi familia.',
      'de-vez-en-cuando': 'Me gusta pasar tiempo con mi familia de vez en cuando, pero no necesito tanto.',
      'no-mucho': 'Prefiero mi independencia y no paso mucho tiempo con mi familia.',
    };
    if (profile.tiempo_con_familia && familiaFrases[profile.tiempo_con_familia]) {
      frases.push(familiaFrases[profile.tiempo_con_familia]);
    }
    
    // Personalidad sociable
    const sociableFrases: Record<string, string> = {
      'muy-sociable': 'Soy muy sociable y me encanta conocer gente nueva.',
      'neutro': 'En cuanto a socializar, estoy en un término medio.',
      'introvertido': 'Soy más bien introvertido/a.',
    };
    if (profile.personalidad_sociable && sociableFrases[profile.personalidad_sociable]) {
      frases.push(sociableFrases[profile.personalidad_sociable]);
    }
    
    // Orden
    const ordenFrases: Record<string, string> = {
      'muy-ordenado': 'Soy muy ordenado/a, me gusta tener todo en su lugar.',
      'normal': 'Con el orden soy normal, ni muy ordenado ni muy desordenado.',
      'muy-relajado': 'Soy muy relajado/a con el orden.',
    };
    if (profile.orden_mantenimiento && ordenFrases[profile.orden_mantenimiento]) {
      frases.push(ordenFrases[profile.orden_mantenimiento]);
    }
    
    // Ambición
    const ambicionFrases: Record<string, string> = {
      'super-ambicioso': 'Soy súper ambicioso/a.',
      'bastante': 'Soy bastante ambicioso/a.',
      'normal': 'Tengo un nivel de ambición normal.',
      'poco': 'Soy poco ambicioso/a.',
      'nada': 'No soy nada ambicioso/a.',
    };
    if (profile.eres_ambicioso && ambicionFrases[profile.eres_ambicioso]) {
      frases.push(ambicionFrases[profile.eres_ambicioso]);
    }
    
    // Valores tradicionales
    const valoresFrases: Record<string, string> = {
      'mucho': 'Soy una persona de valores muy tradicionales.',
      'algo': 'Tengo algunos valores tradicionales.',
      'poco': 'Tengo pocos valores tradicionales.',
      'nada': 'No me identifico con los valores tradicionales.',
    };
    if (profile.valores_tradicionales && valoresFrases[profile.valores_tradicionales]) {
      frases.push(valoresFrases[profile.valores_tradicionales]);
    }
    
    // Espiritualidad
    const espiritualidadFrases: Record<string, string> = {
      'muy-espiritual': 'Soy muy espiritual.',
      'algo': 'Soy algo espiritual.',
      'no-mucho': 'No soy muy espiritual.',
      'para-nada': 'La espiritualidad no es algo que me interese.',
    };
    if (profile.espiritualidad && espiritualidadFrases[profile.espiritualidad]) {
      frases.push(espiritualidadFrases[profile.espiritualidad]);
    }
    
    // Religión
    const religionFrases: Record<string, string> = {
      'catolico': 'Soy católico/a.',
      'cristiano': 'Soy cristiano/a.',
      'judio': 'Soy judío/a.',
      'musulman': 'Soy musulmán/a.',
      'budista': 'Soy budista.',
      'hindu': 'Soy hindú.',
      'agnostico': 'Soy agnóstico/a.',
      'ateo': 'Soy ateo/a.',
      'no-religioso': 'No soy religioso/a.',
    };
    if (profile.religion && religionFrases[profile.religion]) {
      frases.push(religionFrases[profile.religion]);
    }
    
    return frases;
  };

  // =====================================================
  // GENERADOR: Qué busca (tags)
  // =====================================================
  const generarQueBusca = (): string[] => {
    if (!profile || !profile.que_buscas) return [];
    
    let items: string[] = [];
    if (Array.isArray(profile.que_buscas)) {
      items = profile.que_buscas;
    } else if (typeof profile.que_buscas === 'string') {
      try {
        items = JSON.parse(profile.que_buscas);
      } catch {
        items = [profile.que_buscas];
      }
    }
    
    const labels: Record<string, string> = {
      'pareja-seria': 'una pareja seria',
      'aventuras': 'aventuras sin compromiso',
      'amistad': 'amistad',
      'charlar-alguien': 'alguien con quien charlar',
      'conocer-gente': 'conocer gente nueva',
      'no-seguro': 'aún no estoy seguro/a',
    };
    
    const mapped = items.map(i => labels[i] || i).filter(Boolean);
    if (mapped.length === 0) return [];
    
    if (mapped.length === 1) {
      return [`Estoy buscando ${mapped[0]}.`];
    }
    
    const last = mapped.pop();
    return [`Estoy buscando ${mapped.join(', ')} y ${last}.`];
  };

  // =====================================================
  // RENDER: Tags para arrays
  // =====================================================
  const renderTags = (items: any, color: string = 'primary') => {
    let itemsArray: string[] = [];
    
    if (!items) return null;
    if (Array.isArray(items)) {
      itemsArray = items;
    } else if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        itemsArray = Array.isArray(parsed) ? parsed : [items];
      } catch {
        itemsArray = items.includes(',') ? items.split(',').map((s: string) => s.trim()) : [items];
      }
    }
    
    if (itemsArray.length === 0) return null;
    
    const colorClasses: Record<string, string> = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    };
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {itemsArray.map((item, idx) => (
          <span key={idx} className={`px-2 py-0.5 text-xs rounded-full border capitalize ${colorClasses[color] || colorClasses.primary}`}>
            {item.replace(/-/g, ' ')}
          </span>
        ))}
      </div>
    );
  };
  
  // =====================================================
  // RENDER: Loading y Error
  // =====================================================
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

  // Generar todas las frases
  const frasesFisicas = generarDescripcionFisica();
  const frasesEducacion = generarEducacionTrabajo();
  const frasesRelaciones = generarRelaciones();
  const frasesEstiloVida = generarEstiloVida();
  const frasesPersonalidad = generarPersonalidad();
  const frasesQueBusca = generarQueBusca();

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
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

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          
          {/* SIDEBAR - Foto */}
          <div className="w-64 flex-shrink-0 space-y-4">
            <div className="sticky top-20">
              <PhotoGallery
                photos={profile.fotos && profile.fotos.length > 0 ? profile.fotos : [{
                  id: '1',
                  url: profile.foto_perfil || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
                  esPrincipal: true,
                  estado: 'aprobada'
                }]}
              />
              
              {/* % completado */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-connect-muted">Perfil</span>
                  <span className="text-primary font-bold">{Math.min(100, profile.profile_completion || 0)}%</span>
                </div>
                <div className="h-1.5 bg-connect-bg-dark rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, profile.profile_completion || 0)}%` }}></div>
                </div>
              </div>

              {/* Perfiles similares */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Perfiles similares</h3>
                <div className="grid grid-cols-4 gap-2">
                  {similarProfiles.map((p) => (
                    <Link key={p.id} href={`/publicprofile/${p.name.toLowerCase()}`} className="group text-center">
                      <div className="w-12 h-12 mx-auto rounded-lg overflow-hidden border border-connect-border group-hover:border-primary/50">
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
            {/* Cabecera */}
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
                
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary hover:brightness-110 text-connect-bg-dark font-semibold h-9 px-4">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Mensaje
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 h-9 px-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </Button>
                </div>
              </div>

              {profile.status_text && (
                <div className="bg-connect-card/50 border border-connect-border rounded-lg px-4 py-3">
                  <p className="text-sm text-white italic">"{profile.status_text}"</p>
                </div>
              )}
            </div>

            {/* Secciones */}
            <div className="space-y-4">
              
              {/* SOBRE MÍ */}
              {(profile.cuentanos_algo_tuyo || profile.definete_en_frase) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">👤 Sobre mí</h2>
                  {profile.definete_en_frase && (
                    <p className="text-white font-medium mb-2">"{profile.definete_en_frase}"</p>
                  )}
                  {profile.cuentanos_algo_tuyo && (
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.cuentanos_algo_tuyo}</p>
                  )}
                </section>
              )}

              {/* DESCRIPCIÓN FÍSICA */}
              {frasesFisicas.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">📋 Descripción física</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesFisicas.join(' ')}</p>
                </section>
              )}

              {/* EDUCACIÓN Y TRABAJO */}
              {frasesEducacion.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">🎓 Educación y trabajo</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesEducacion.join(' ')}</p>
                </section>
              )}

              {/* LO QUE BUSCO */}
              {frasesQueBusca.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">💕 Lo que busco</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesQueBusca.join(' ')}</p>
                </section>
              )}

              {/* RELACIONES */}
              {frasesRelaciones.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">💑 Relaciones</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesRelaciones.join(' ')}</p>
                </section>
              )}

              {/* PRIMERA CITA IDEAL */}
              {profile.primera_cita_ideal && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">☕ Mi primera cita ideal</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{profile.primera_cita_ideal}</p>
                </section>
              )}

              {/* ESTILO DE VIDA */}
              {frasesEstiloVida.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">🏃 Mi estilo de vida</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesEstiloVida.join(' ')}</p>
                </section>
              )}

              {/* PERSONALIDAD Y VALORES */}
              {frasesPersonalidad.length > 0 && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">🙏 Mi personalidad y valores</h2>
                  <p className="text-gray-300 text-sm leading-relaxed">{frasesPersonalidad.join(' ')}</p>
                </section>
              )}

              {/* INTERESES Y PASATIEMPOS */}
              {(hasContent(profile.pasatiempos) || hasContent(profile.generos_peliculas) || hasContent(profile.generos_musica) || hasContent(profile.deportes_practica)) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">🎭 Mis intereses</h2>
                  
                  {hasContent(profile.pasatiempos) && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-1.5">Pasatiempos:</span>
                      {renderTags(profile.pasatiempos, 'primary')}
                    </div>
                  )}
                  
                  {hasContent(profile.generos_peliculas) && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎬 Películas que me gustan:</span>
                      {renderTags(profile.generos_peliculas, 'blue')}
                    </div>
                  )}
                  
                  {hasContent(profile.generos_musica) && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-1.5">🎵 Música que escucho:</span>
                      {renderTags(profile.generos_musica, 'purple')}
                    </div>
                  )}
                  
                  {hasContent(profile.generos_libros) && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-1.5">📚 Libros que leo:</span>
                      {renderTags(profile.generos_libros, 'amber')}
                    </div>
                  )}
                  
                  {hasContent(profile.deportes_practica) && (
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block mb-1.5">⚽ Deportes que practico:</span>
                      {renderTags(profile.deportes_practica, 'primary')}
                    </div>
                  )}
                </section>
              )}

              {/* IDIOMAS */}
              {(hasContent(profile.idiomas) || hasContent(profile.habla_otro_idioma)) && (
                <section className="bg-connect-card/30 border border-connect-border rounded-xl p-4">
                  <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-3">🌐 Idiomas que hablo</h2>
                  {renderTags(profile.idiomas || profile.habla_otro_idioma, 'blue')}
                </section>
              )}

              {/* VELOCIDAD DE RESPUESTA */}
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
