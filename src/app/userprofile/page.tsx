"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PhotoManager, { Photo } from "@/components/PhotoManager";
import { useAuth } from "@/contexts/AuthContext";

// =================== UTILIDAD: REDIMENSIONAR IMAGEN ===================
/**
 * Redimensiona una imagen manteniendo proporción 10:13 y reduce el tamaño
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo (por defecto 400px)
 * @returns Promise con el archivo redimensionado
 */
async function resizeImage(file: File, maxWidth: number = 400): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        // Calcular dimensiones manteniendo proporción 10:13
        const targetWidth = maxWidth;
        const targetHeight = Math.round(targetWidth * 1.3); // 130% del ancho
        
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Calcular crop para mantener proporción
        const sourceRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;
        
        if (sourceRatio > targetRatio) {
          // Imagen muy ancha, recortar los lados
          sourceWidth = img.height * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          // Imagen muy alta, recortar arriba/abajo
          sourceHeight = img.width / targetRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetWidth, targetHeight
        );
        
        // Convertir a Blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo crear el blob'));
              return;
            }
            
            // Crear nuevo archivo con el blob
            const resizedFile = new File(
              [blob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            
            resolve(resizedFile);
          },
          'image/jpeg',
          0.85 // Calidad 85% para reducir tamaño
        );
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
}

type CategoryType = "algo-sobre-mi" | "relaciones" | "cultura" | "estilo-vida" | "informacion-privada";

// Tipo para respuestas Sí/No/No respondo
type YesNoResponse = "no-respondo" | "no" | "si" | "";

function AjustesPerfilContent() {
  // Hook de autenticación
  const { user } = useAuth();
  
  // 🔍 RASTREADOR DE USUARIO
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('📍 PÁGINA: /userprofile');
    console.log('👤 Usuario actual:', user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    } : '❌ NO AUTENTICADO');
    console.log('═══════════════════════════════════════');
  }, [user]);
  
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CategoryType | null;
  
  const [activeCategory, setActiveCategory] = useState<CategoryType>(
    tabParam || "algo-sobre-mi"
  );
  
  // Cambiar categoría si cambia el parámetro tab
  useEffect(() => {
    if (tabParam && tabParam !== activeCategory) {
      setActiveCategory(tabParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabParam, activeCategory]);
  
  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.username) return;
      
      try {
        console.log('🔄 Cargando perfil de:', user.username);
        
        // Cargar datos del perfil
        const response = await fetch(`/api/profile?username=${user.username}`);
        
        if (!response.ok) {
          console.warn('⚠️ Usuario no tiene perfil guardado aún');
          return; // Usuario nuevo, usar valores por defecto
        }
        
        const data = await response.json();
        console.log('✅ Perfil cargado:', data);
        
        // Actualizar formData con los datos del usuario
        setFormData(prev => ({
          ...prev,
          nombre: data.nombre || user.username,
          edad: data.edad?.toString() || '',
          genero: data.genero || '',
          ciudad: data.ciudad || '',
          fotoPerfil: data.foto_perfil || '',
          statusText: data.status_text || '',
          altura: data.altura?.toString() || '',
          peso: data.peso?.toString() || '',
          tipoCuerpo: data.tipo_cuerpo || '',
          colorOjos: data.color_ojos || '',
          colorCabello: data.color_cabello || '',
          signoZodiacal: data.signo_zodiacal || '',
          educacion: data.educacion || '',
          etnia: data.etnia || '',
          vivesEn: data.vives_en || '',
          idiomas: data.idiomas || [],
          trabajas: data.trabajas || false,
          enQueTrabaja: data.en_que_trabaja || '',
          // ... agregar más campos según necesites
        }));
        
        // Cargar fotos del usuario
        const photosResponse = await fetch(`/api/photos?username=${user.username}&showAll=true`);
        
        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          console.log('✅ Fotos cargadas:', photosData.photos?.length || 0);
          
          if (photosData.photos && photosData.photos.length > 0) {
            const mappedPhotos = photosData.photos.map((photo: any) => ({
              id: photo.id.toString(),
              url: photo.url,
              esPrincipal: photo.is_principal || false,
              estado: photo.estado as 'pendiente' | 'aprobada' | 'rechazada'
            }));
            
            setFormData(prev => ({
              ...prev,
              fotos: mappedPhotos
            }));
          }
        }
        
      } catch (error) {
        console.error('❌ Error al cargar perfil:', error);
      }
    };
    
    loadUserProfile();
  }, [user]);
  
  // Función para cambiar de categoría y hacer scroll al inicio
  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // ===== ALGO SOBRE MÍ =====
    altura: "",
    peso: "",
    tipoCuerpo: "atletico",
    tipoCuerpoOtro: "", // Si selecciona "otro"
    colorOjos: "marrones",
    colorOjosOtro: "", // Si selecciona "otro"
    colorCabello: "negro",
    colorCabelloOtro: "", // Si selecciona "otro"
    signoZodiacal: "",
    educacion: "universitaria",
    educacionOtra: "", // Si selecciona "otros"
    etnia: "mestizo",
    etniaOtra: "", // Si selecciona "otro"
    idiomas: [] as string[],
    vivesEn: "ciudad",
    
    // Trabajo
    trabajas: "" as YesNoResponse,
    enQueTrabaja: "", // Solo si "trabajas" = "si"
    
    defineteEnFrase: "",
    cuentanosAlgoTuyo: "",
    intereses: "",
    primeraCitaIdeal: "",
    
    // ===== RELACIONES =====
    // Hijos
    tieneHijos: "" as YesNoResponse,
    situacionHijos: "", // "no-viven" | "viven-conmigo" | "ya-adultos" | "no-seguro"
    quiereTenerHijos: "", // "no" | "si" | "no-seguro" | "lo-pensaria" | "adoptados" | "no-puedo"
    
    estadoCivil: "",
    queBuscas: [] as string[], // + "charlar-alguien"
    razonPrincipal: "",
    tiempoEnPareja: "",
    casarseImportante: "",
    duracionRelacionLarga: "", // NUEVO
    
    // Vehículo
    tieneVehiculo: "" as YesNoResponse,
    
    // Mascotas - NUEVO
    tieneMascota: "", // "no" | "perro" | "gato" | "perro-gato" | "pajaro" | "otro"
    tieneMascotaOtra: "", // Si selecciona "otro"
    
    // Idiomas - NUEVO
    hablaOtroIdioma: [] as string[],
    
    // ===== CULTURA =====
    // Pasatiempos (checkboxes múltiples) - AMPLIADO
    pasatiempos: [] as string[], // 30+ actividades
    generosPeliculas: [] as string[], // 16 géneros
    generosMusica: [] as string[], // 30 géneros
    generosLibros: [] as string[], // 18 tipos
    deportesPractica: [] as string[], // 30 deportes (MOVIDO AQUÍ desde estilo de vida)
    
    ideasPoliticas: "",
    valoresTradicionales: "",
    espiritualidad: "",
    religion: "",
    religionOtra: "", // Si selecciona "otro"
    conviccionesReligiosas: "",
    
    // ===== ESTILO DE VIDA =====
    // Qué haces normalmente
    queHaces: [] as string[], // ["cocinar", "deporte", "bailar", etc.]
    nivelCocinar: "", // Solo si marcó "cocinar"
    nivelBailar: "", // Solo si marcó "bailar"
    nivelLeer: "", // Solo si marcó "leer"
    nivelCine: "", // Solo si marcó "cine"
    nivelViajar: "", // Solo si marcó "viajar"
    
    teEjercitas: "",
    eresAmbicioso: "", // NUEVO: super-ambicioso | ambicioso | algo-ambicioso | no-ambicioso
    
    // Fumas
    fumas: "" as YesNoResponse,
    frecuenciaFumar: "", // Solo si "fumas" = "si"
    
    // Saldrías con fumador - MOVIDO AQUÍ
    saldriasFumador: "",
    
    // Bebes alcohol
    bebesAlcohol: "" as YesNoResponse,
    frecuenciaBeber: "", // Solo si "bebesAlcohol" = "si"
    
    // Saldrías con bebedor - NUEVO
    saldriasBebedor: "",
    
    // Usas drogas
    usasDrogas: "" as YesNoResponse,
    frecuenciaDrogas: "", // Solo si "usasDrogas" = "si"
    
    dietaEspecial: "", // ACTUALIZADO: separar alimentación vs dietas
    dietaEspecialOtra: "", // Si selecciona "otro"
    tiempoConFamilia: "",
    personalidadSociable: "",
    ordenMantenimiento: "",
    
    // ===== INFORMACIÓN PRIVADA =====
    escuelasPrivadasPublicas: "",
    escuelasPrivadasPublicasOtra: "", // Si selecciona "alternativa"
    tusPadresEstan: "",
    economicamenteIndependiente: "",
    nivelIngresos: "",
    importaNivelIngresosPareja: "",
    origenGeograficoPrivado: "", // "pueblo" | "ciudad"
    claseSocioeconomica: "", // "humilde" | "media" | "media-alta" | "alta"
    numeroHijos: "",
    ordenNacimiento: "",
    saldriasMasKilos: "",
    saldriasConHijos: "",
    
    // ===== FOTOS =====
    fotos: [] as { id: string; url: string; esPrincipal: boolean; estado: 'pendiente' | 'aprobada' | 'rechazada' }[],
    
    // Configuración de carrusel de fotos
    carouselEnabled: false,
    carouselIntervalType: 'minutes' as 'minutes' | 'hours' | 'days',
    carouselIntervalValue: 5, // 5 minutos por defecto
  });

  const categories = [
    { id: "algo-sobre-mi" as CategoryType, label: "Algo sobre mí", icon: "👤" },
    { id: "relaciones" as CategoryType, label: "Relaciones", icon: "💑" },
    { id: "cultura" as CategoryType, label: "Intereses", icon: "🎭" },
    { id: "estilo-vida" as CategoryType, label: "Estilo de vida", icon: "🏃" },
    { id: "informacion-privada" as CategoryType, label: "Información privada", icon: "🔒" },
  ];

  // ===== HANDLERS =====
  
  const handleYesNoChange = (field: keyof typeof formData, value: YesNoResponse) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields if changing to "no" or "no-respondo"
      ...(value !== "si" && {
        // Reset related fields based on the field being changed
        ...(field === "tieneHijos" && { situacionHijos: "" }),
        ...(field === "trabajas" && { enQueTrabaja: "" }),
        ...(field === "fumas" && { frecuenciaFumar: "" }),
        ...(field === "bebesAlcohol" && { frecuenciaBeber: "" }),
        ...(field === "usasDrogas" && { frecuenciaDrogas: "" }),
      })
    }));
  };

  const handleCheckboxChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value),
          // Reset dependent fields when unchecking
          ...(field === "pasatiempos" && value === "peliculas" && { generosPeliculas: [] }),
          ...(field === "pasatiempos" && value === "musica" && { generosMusica: [] }),
          ...(field === "pasatiempos" && value === "leer" && { generosLibros: [] }),
          ...(field === "pasatiempos" && value === "deporte" && { deportesPractica: [] }),
          ...(field === "queHaces" && value === "cocinar" && { nivelCocinar: "" }),
          ...(field === "queHaces" && value === "bailar" && { nivelBailar: "" }),
          ...(field === "queHaces" && value === "leer" && { nivelLeer: "" }),
          ...(field === "queHaces" && value === "cine" && { nivelCine: "" }),
          ...(field === "queHaces" && value === "viajar" && { nivelViajar: "" }),
        };
      }
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ===== RENDER HELPERS =====

  // TIPO A: Pregunta Sí/No/No respondo + Selector condicional
  const renderYesNoField = (
    label: string,
    field: keyof typeof formData,
    selectorContent?: React.ReactNode
  ) => {
    const value = formData[field] as YesNoResponse;
    
    return (
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-300 mb-3">{label}</p>
        <div className="flex gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "no-respondo"}
              onChange={() => handleYesNoChange(field, "no-respondo")}
              className="w-4 h-4 text-neon-green bg-connect-bg-dark border-connect-border focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">No respondo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "no"}
              onChange={() => handleYesNoChange(field, "no")}
              className="w-4 h-4 text-neon-green bg-connect-bg-dark border-connect-border focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "si"}
              onChange={() => handleYesNoChange(field, "si")}
              className="w-4 h-4 text-neon-green bg-connect-bg-dark border-connect-border focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">Sí</span>
          </label>
        </div>
        
        {/* Selector condicional aparece solo si "Sí" */}
        {value === "si" && selectorContent && (
          <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-3">
            {selectorContent}
          </div>
        )}
      </div>
    );
  };

  // TIPO B: Selector directo (sin Sí/No)
  const renderSelectField = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[],
    otroField?: keyof typeof formData // Campo para "Otro" descripción
  ) => {
    const value = formData[field] as string;
    const otroValue = otroField ? (formData[otroField] as string) : "";
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-primary/50 focus:outline-none"
        >
          <option value="">Selecciona una opción</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        {/* Input de texto si selecciona "otro" o "otra" */}
        {(value === "otro" || value === "otra") && otroField && (
          <div className="mt-3">
            <Input
              type="text"
              value={otroValue}
              onChange={(e) => handleInputChange(otroField, e.target.value)}
              placeholder="Especifica..."
              className="w-full bg-connect-bg-dark border border-neon-green/50 text-gray-200 focus:border-neon-green"
            />
          </div>
        )}
      </div>
    );
  };

  // TIPO C: Checkboxes múltiples
  const renderCheckboxes = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => {
    const values = formData[field] as string[];
    
    return (
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-300 mb-3">{label}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.includes(opt.value)}
                onChange={(e) => handleCheckboxChange(field, opt.value, e.target.checked)}
                className="w-4 h-4 text-neon-green bg-connect-bg-dark border-connect-border rounded focus:ring-neon-green"
              />
              <span className="text-sm text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // TIPO D: Input numérico o textarea
  const renderInputField = (
    label: string,
    field: keyof typeof formData,
    type: "number" | "text" | "textarea" = "text",
    placeholder?: string,
    suffix?: string
  ) => {
    const value = formData[field] as string;
    
    // Handler especial para campos numéricos (comportamiento tipo Excel)
    const handleNumericFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === "number") {
        e.target.select(); // Selecciona todo el texto al hacer foco
      }
    };
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        {type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px] bg-connect-bg-dark border border-connect-border text-gray-200 focus:border-neon-green"
            rows={4}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              type={type}
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              onFocus={handleNumericFocus}
              placeholder={placeholder}
              className="flex-1 bg-connect-bg-dark border border-connect-border text-gray-200 focus:border-neon-green"
            />
            {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
          </div>
        )}
      </div>
    );
  };

  // TIPO E: Multi-select (selector con múltiples opciones usando Ctrl/Cmd)
  const renderMultiSelect = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => {
    const values = formData[field] as string[];
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        <select
          multiple
          value={values}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            handleInputChange(field, selectedOptions);
          }}
          className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green min-h-[200px]"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          💡 Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios idiomas
        </p>
        
        {/* Mostrar seleccionados */}
        {values.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-400 mb-2">Idiomas seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {values.map(val => {
                const option = options.find(opt => opt.value === val);
                return option ? (
                  <span key={val} className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm border border-neon-green/30">
                    {option.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER CONTENT POR CATEGORÍA =====

  const renderContent = () => {
    switch (activeCategory) {
      case "algo-sobre-mi":
        return (
          <div className="space-y-6">
            {/* Apariencia física */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Apariencia física</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("Altura", "altura", "number", "Ej: 175", "cm")}
                {renderInputField("Peso", "peso", "number", "Ej: 70", "kg")}
              </div>

              {renderSelectField("Tipo de cuerpo", "tipoCuerpo", [
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "delgado", label: "Delgado/a" },
                { value: "atletico", label: "Atlético/a" },
                { value: "punto-medio", label: "Punto medio" },
                { value: "curvas-extra", label: "Algunas curvas extra" },
                { value: "talla-grande", label: "De talla grande" },
                { value: "grande-robusto", label: "Grande y robusto/a" },
              ], "tipoCuerpoOtro")}

              {renderSelectField("Color de ojos", "colorOjos", [
                { value: "negros", label: "Negros" },
                { value: "marrones", label: "Marrones" },
                { value: "azules", label: "Azules" },
                { value: "verdes", label: "Verdes" },
                { value: "grises", label: "Grises" },
                { value: "otro", label: "Otro" },
              ], "colorOjosOtro")}

              {renderSelectField("Color de cabello", "colorCabello", [
                { value: "negro", label: "Negro" },
                { value: "castano", label: "Castaño" },
                { value: "rubio", label: "Rubio" },
                { value: "pelirrojo", label: "Pelirrojo" },
                { value: "gris", label: "Gris/Blanco" },
                { value: "otro", label: "Otro" },
              ], "colorCabelloOtro")}

              {renderSelectField("Signo zodiacal", "signoZodiacal", [
                { value: "aries", label: "Aries" },
                { value: "tauro", label: "Tauro" },
                { value: "geminis", label: "Géminis" },
                { value: "cancer", label: "Cáncer" },
                { value: "leo", label: "Leo" },
                { value: "virgo", label: "Virgo" },
                { value: "libra", label: "Libra" },
                { value: "escorpio", label: "Escorpio" },
                { value: "sagitario", label: "Sagitario" },
                { value: "capricornio", label: "Capricornio" },
                { value: "acuario", label: "Acuario" },
                { value: "piscis", label: "Piscis" },
              ])}
            </div>

            {/* Educación y trabajo */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Educación y trabajo</h3>

              {renderSelectField("Educación", "educacion", [
                { value: "primario", label: "Primario" },
                { value: "secundario", label: "Secundario" },
                { value: "algunos-terciarios", label: "Algunos estudios terciarios" },
                { value: "graduado-terciario", label: "Graduado terciario" },
                { value: "algunos-universitarios", label: "Algunos estudios universitarios" },
                { value: "graduado-universitario", label: "Graduado universitario" },
                { value: "posgrado-universitario", label: "Posgrado universitario" },
                { value: "otro", label: "Otros" },
              ], "educacionOtra")}

              {renderYesNoField(
                "¿Trabajas?",
                "trabajas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿En qué trabajas?</p>
                  <Input
                    type="text"
                    value={formData.enQueTrabaja}
                    onChange={(e) => handleInputChange("enQueTrabaja", e.target.value)}
                    placeholder="Ej: Ingeniero de software, Profesor, Comerciante..."
                    className="w-full bg-connect-bg-dark border border-connect-border text-gray-200 focus:border-neon-green"
                  />
                </>
              )}
            </div>

            {/* Origen */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Origen</h3>

              {renderSelectField("Etnia", "etnia", [
                { value: "blanco", label: "Blanco/a (Caucásico/a)" },
                { value: "afro", label: "Afro/Negro/a" },
                { value: "asiatico", label: "Asiático/a" },
                { value: "mestizo", label: "Mestizo/a" },
                { value: "indigena", label: "Indígena" },
                { value: "arabe", label: "Árabe/Turco/a" },
                { value: "otro", label: "Otro" },
              ], "etniaOtra")}

              {renderSelectField("¿Vives en ciudad o campo?", "vivesEn", [
                { value: "ciudad", label: "Ciudad" },
                { value: "campo", label: "Campo" },
              ])}
            </div>

            {/* Presentación personal */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Presentación personal</h3>

              {renderInputField("Defínete en una frase", "defineteEnFrase", "textarea", "Ej: Una persona sincera, alegre y aventurera")}
              {renderInputField("Cuéntanos algo tuyo", "cuentanosAlgoTuyo", "textarea", "Comparte algo interesante sobre ti...")}
              {renderInputField("¿Cómo sería tu primera cita ideal?", "primeraCitaIdeal", "textarea", "Describe tu cita ideal...")}
            </div>
          </div>
        );

      case "relaciones":
        return (
          <div className="space-y-6">
            {/* Hijos */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Hijos</h3>

              {renderYesNoField(
                "¿Tienes hijos?",
                "tieneHijos",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">Especifica tu situación:</p>
                  <select
                    value={formData.situacionHijos}
                    onChange={(e) => handleInputChange("situacionHijos", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="no-viven">Sí, pero no viven en mi casa</option>
                    <option value="viven-conmigo">Sí, y viven conmigo en la casa</option>
                    <option value="ya-adultos">Sí, pero ya son adultos</option>
                    <option value="no-seguro">No estoy seguro</option>
                  </select>
                </>
              )}

              {renderSelectField(
                formData.tieneHijos === "si" ? "¿Quieres tener más hijos?" : "¿Quieres tener hijos?",
                "quiereTenerHijos",
                [
                  { value: "no", label: "No" },
                  { value: "si", label: "Sí" },
                  { value: "no-seguro", label: "No estoy seguro" },
                  { value: "lo-pensaria", label: "Lo pensaría / Abierto a futuro" },
                  { value: "adoptados", label: "Sí, aunque serían adoptados" },
                  { value: "no-puedo", label: "No puedo tener hijos" },
                ]
              )}
            </div>

            {/* Estado civil */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Estado civil</h3>

              {renderSelectField("Estado civil", "estadoCivil", [
                { value: "no-respondo", label: "Prefiero no responder" },
                { value: "soltero", label: "Soltero/a" },
                { value: "divorciado", label: "Divorciado/a" },
                { value: "separado", label: "Separado/a" },
                { value: "viudo", label: "Viudo/a" },
                { value: "en-relacion", label: "En relación" },
                { value: "viviendo-pareja", label: "Viviendo en pareja" },
                { value: "casado", label: "Casado/a" },
              ])}
            </div>

            {/* Expectativas */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Expectativas</h3>

              {renderCheckboxes("¿Qué estás buscando? (puedes marcar varios)", "queBuscas", [
                { value: "pareja-seria", label: "Pareja seria" },
                { value: "aventuras", label: "Aventuras sin compromiso" },
                { value: "amistad", label: "Amistad" },
                { value: "charlar-alguien", label: "Charlar con alguien" },
                { value: "conocer-gente", label: "Conocer gente nueva" },
                { value: "no-seguro", label: "No estoy seguro" },
              ])}

              {renderSelectField("¿Razón PRINCIPAL por la que quieres tener pareja?", "razonPrincipal", [
                { value: "familia-futuro", label: "Para formar una familia y planear un futuro" },
                { value: "acompanado", label: "Para sentirme acompañado/a y pasarla bien" },
                { value: "no-seguro", label: "No estoy seguro / No sé muy bien para qué" },
              ])}

              {renderSelectField("¿Cómo te gusta administrar tu tiempo en pareja?", "tiempoEnPareja", [
                { value: "mayoria-compania", label: "Me encanta pasar la mayoría del tiempo en compañía de mi pareja" },
                { value: "equilibrio", label: "Necesito mi espacio y que negociemos un equilibrio entre tiempo en pareja y tiempo personal" },
              ])}

              {renderSelectField("¿Casarse es importante?", "casarseImportante", [
                { value: "si-importante", label: "Sí, es importante, me gustaría casarme en el futuro" },
                { value: "no-tan-importante", label: "No es tan importante, vivir juntos sería suficiente" },
                { value: "futuro-dira", label: "Futuro lo dirá" },
              ])}

              {renderSelectField("¿Cuánto duró la relación más larga que has tenido?", "duracionRelacionLarga", [
                { value: "menos-1", label: "Menos de 1 año" },
                { value: "mas-1", label: "Más de 1 año" },
                { value: "mas-2", label: "Más de 2 años" },
                { value: "mas-3", label: "Más de 3 años" },
                { value: "mas-4", label: "Más de 4 años" },
                { value: "mas-5", label: "Más de 5 años" },
                { value: "mas-6", label: "Más de 6 años" },
                { value: "mas-7", label: "Más de 7 años" },
                { value: "mas-8", label: "Más de 8 años" },
                { value: "mas-9", label: "Más de 9 años" },
                { value: "mas-10", label: "Más de 10 años" },
              ])}
            </div>

            {/* Otros */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Otros</h3>

              {renderYesNoField("¿Tienes vehículo propio?", "tieneVehiculo")}

              {renderSelectField("¿Tienes mascota?", "tieneMascota", [
                { value: "no", label: "No" },
                { value: "perro", label: "Perro" },
                { value: "gato", label: "Gato" },
                { value: "perro-gato", label: "Perro y gato" },
                { value: "pajaro", label: "Pájaro" },
                { value: "otro", label: "Otro" },
              ], "tieneMascotaOtra")}

              {renderMultiSelect("¿Hablas otro idioma?", "hablaOtroIdioma", [
                { value: "ninguno", label: "Ningún otro idioma" },
                { value: "arabe", label: "Árabe" },
                { value: "chino", label: "Chino" },
                { value: "holandes", label: "Holandés" },
                { value: "ingles", label: "Inglés" },
                { value: "frances", label: "Francés" },
                { value: "aleman", label: "Alemán" },
                { value: "hebreo", label: "Hebreo" },
                { value: "hindi", label: "Hindi" },
                { value: "italiano", label: "Italiano" },
                { value: "japones", label: "Japonés" },
                { value: "noruego", label: "Noruego" },
                { value: "portugues", label: "Portugués" },
                { value: "ruso", label: "Ruso" },
                { value: "espanol", label: "Español" },
                { value: "sueco", label: "Sueco" },
                { value: "tagalog", label: "Tagalog" },
                { value: "urdu", label: "Urdu" },
                { value: "otro", label: "Otro" },
              ])}
            </div>
          </div>
        );

      case "cultura":
        return (
          <div className="space-y-6">
            {/* Pasatiempos */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">¿Cuáles son tus pasatiempos?</h3>

              {renderCheckboxes("Marca los que te gusten:", "pasatiempos", [
                { value: "peliculas", label: "Películas" },
                { value: "musica", label: "Música" },
                { value: "leer", label: "Leer" },
                { value: "deporte", label: "Deporte" },
                { value: "arquitectura", label: "Arquitectura" },
                { value: "tuning-coches", label: "Tuning de coches" },
                { value: "viajes", label: "Viajes" },
                { value: "automovilismo", label: "Automovilismo deportivo" },
                { value: "historia", label: "Historia" },
                { value: "teatro", label: "Teatro" },
                { value: "fotografia", label: "Fotografía" },
                { value: "juegos", label: "Juegos (PC, PS, Xbox)" },
                { value: "cria-animales", label: "Cría de animales" },
                { value: "cine", label: "Cine" },
                { value: "conciertos", label: "Conciertos" },
                { value: "pintura", label: "Pintura" },
                { value: "modelismo", label: "Modelismo" },
                { value: "moda", label: "Moda" },
                { value: "monumentos", label: "Monumentos" },
                { value: "museos", label: "Museos" },
                { value: "caza", label: "Caza" },
                { value: "pesca", label: "Pesca" },
                { value: "canto", label: "Canto" },
                { value: "costura", label: "Costura" },
                { value: "ganchillo", label: "Ganchillo" },
                { value: "baile", label: "Baile" },
                { value: "senderismo", label: "Senderismo" },
                { value: "cocina-reposteria", label: "Cocina-repostería" },
                { value: "jardineria", label: "Jardinería-cultivo" },
                { value: "vida-saludable", label: "Estilo de vida saludable" },
                { value: "otros", label: "Otros" },
              ])}

              {/* Expansión para Películas */}
              {formData.pasatiempos.includes("peliculas") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de películas te gustan?</p>
                  {renderCheckboxes("", "generosPeliculas", [
                    { value: "accion", label: "Acción" },
                    { value: "alternativa", label: "Alternativa" },
                    { value: "documentales", label: "Documentales" },
                    { value: "animacion", label: "Animación" },
                    { value: "drama", label: "Drama" },
                    { value: "historia", label: "Historia" },
                    { value: "horror", label: "Horror" },
                    { value: "comedia", label: "Comedia" },
                    { value: "misterio", label: "Misterio" },
                    { value: "romantico", label: "Romántico" },
                    { value: "scifi", label: "Sci-Fi" },
                    { value: "fantasy", label: "Fantasy" },
                    { value: "guerra", label: "Guerra" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}

              {/* Expansión para Música */}
              {formData.pasatiempos.includes("musica") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué géneros musicales te gustan?</p>
                  {renderCheckboxes("", "generosMusica", [
                    { value: "ambient", label: "Ambient" },
                    { value: "blues", label: "Blues" },
                    { value: "disko", label: "Disko" },
                    { value: "drum-n-bass", label: "Drum n Bass" },
                    { value: "electro", label: "Electro" },
                    { value: "folk-country", label: "Folk & Country" },
                    { value: "funky", label: "Funky" },
                    { value: "house", label: "House" },
                    { value: "chill-out", label: "Chill-out" },
                    { value: "indie", label: "Indie" },
                    { value: "jazz", label: "Jazz" },
                    { value: "clasica", label: "Clásica" },
                    { value: "metal", label: "Metal" },
                    { value: "new-age", label: "New Age" },
                    { value: "salsa", label: "Salsa" },
                    { value: "bachata", label: "Bachata" },
                    { value: "folclorica", label: "Música folclórica" },
                    { value: "pop", label: "Pop" },
                    { value: "punk", label: "Punk" },
                    { value: "rap", label: "Rap" },
                    { value: "rb", label: "R&B" },
                    { value: "soul", label: "Soul" },
                    { value: "hip-hop", label: "Hip-hop" },
                    { value: "reggae", label: "Reggae" },
                    { value: "rock", label: "Rock" },
                    { value: "techno", label: "Techno" },
                    { value: "trance", label: "Trance" },
                    { value: "otro", label: "Otro" },
                  ])}
                </div>
              )}

              {/* Expansión para Leer */}
              {formData.pasatiempos.includes("leer") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de libros lees?</p>
                  {renderCheckboxes("", "generosLibros", [
                    { value: "policiacas", label: "Novelas policíacas" },
                    { value: "viajes", label: "Libros de viajes" },
                    { value: "idiomas-extranjeros", label: "Literatura en idiomas extranjeros" },
                    { value: "fantasia", label: "Fantasía" },
                    { value: "historico", label: "Novelas históricas" },
                    { value: "terror", label: "Terror" },
                    { value: "humor", label: "Humor" },
                    { value: "satira", label: "Sátira" },
                    { value: "motivacional", label: "Literatura motivacional" },
                    { value: "cocina", label: "Cocina" },
                    { value: "especializada", label: "Literatura especializada" },
                    { value: "poesia", label: "Poesía" },
                    { value: "mujeres", label: "Para mujeres" },
                    { value: "cuentos", label: "Cuentos" },
                    { value: "ciencia-ficcion", label: "Ciencia ficción" },
                    { value: "thriller", label: "Thriller" },
                    { value: "biografias", label: "Biografías" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}

              {/* Expansión para Deporte */}
              {formData.pasatiempos.includes("deporte") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué deportes practicas?</p>
                  {renderCheckboxes("", "deportesPractica", [
                    { value: "aerobic", label: "Aerobic" },
                    { value: "combate", label: "Deportes de combate" },
                    { value: "ciclismo", label: "Ciclismo" },
                    { value: "extremos", label: "Deportes extremos" },
                    { value: "fitness", label: "Fitness" },
                    { value: "futbol", label: "Fútbol" },
                    { value: "baloncesto", label: "Baloncesto" },
                    { value: "voleibol", label: "Voleibol" },
                    { value: "badminton", label: "Bádminton" },
                    { value: "hockey", label: "Hockey" },
                    { value: "natacion", label: "Natación" },
                    { value: "patinaje", label: "Patinaje" },
                    { value: "yoga", label: "Yoga" },
                    { value: "running", label: "Running" },
                    { value: "escalada", label: "Escalada" },
                    { value: "senderismo", label: "Senderismo" },
                    { value: "snowboard", label: "Snowboard" },
                    { value: "esqui", label: "Esquí" },
                    { value: "ping-pong", label: "Ping-pong" },
                    { value: "tenis", label: "Tenis" },
                    { value: "golf", label: "Golf" },
                    { value: "padel", label: "Pádel" },
                    { value: "balonmano", label: "Balonmano" },
                    { value: "remo", label: "Remo" },
                    { value: "buceo", label: "Buceo" },
                    { value: "squash", label: "Squash" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}
            </div>

            {/* Ideas y valores */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Ideas y valores</h3>

              {renderSelectField("¿Eres una persona de valores tradicionales?", "valoresTradicionales", [
                { value: "bastante", label: "Bastante, me gusta aferrarme a las tradiciones" },
                { value: "tradicional-abierto", label: "Soy tradicional, pero de mente abierta" },
                { value: "poco", label: "Poco tradicional... prefiero mi propio camino" },
              ])}

              {renderSelectField("¿Te interesa la espiritualidad?", "espiritualidad", [
                { value: "si-bastante", label: "Sí, bastante" },
                { value: "mas-o-menos", label: "Más o menos" },
                { value: "muy-poco", label: "Muy poco" },
                { value: "para-nada", label: "Para nada" },
              ])}
            </div>

            {/* Religión */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Religión</h3>

              {renderSelectField("Religión", "religion", [
                { value: "cristiano", label: "Cristiano" },
                { value: "budista", label: "Budista" },
                { value: "catolico", label: "Católico" },
                { value: "protestante", label: "Protestante" },
                { value: "evangelista", label: "Evangelista" },
                { value: "judio", label: "Judío" },
                { value: "musulman", label: "Musulmán" },
                { value: "hindu", label: "Hindú" },
                { value: "taoismo", label: "Taoísmo" },
                { value: "wiccan", label: "Wiccan" },
                { value: "satanista", label: "Satanista" },
                { value: "no-religioso", label: "No religioso/a" },
                { value: "mormon", label: "Mormón" },
                { value: "espiritualista", label: "Espiritualista" },
                { value: "bautista", label: "Bautista" },
                { value: "metodista", label: "Metodista" },
                { value: "ortodoxo", label: "Ortodoxo" },
                { value: "pentecostes", label: "Pentecostés" },
                { value: "quaquero", label: "Quáquero" },
                { value: "adventista", label: "Adventista" },
                { value: "jainismo", label: "Jainismo" },
                { value: "iskcon", label: "Iskcon" },
                { value: "sintoismo", label: "Sintoísmo" },
                { value: "sijista", label: "Sijista" },
                { value: "caodaismo", label: "Caodaismo" },
                { value: "otra", label: "Otra religión" },
              ], "religionOtra")}

              {renderSelectField("Convicciones religiosas", "conviccionesReligiosas", [
                { value: "bastante-religioso", label: "Me considero bastante religioso" },
                { value: "creyente-relajado", label: "Creyente... pero relajado" },
                { value: "no-creyente", label: "No soy creyente, ni religioso" },
              ])}
            </div>
          </div>
        );

      case "estilo-vida":
        return (
          <div className="space-y-6">
            {/* Actividades en tiempo libre */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Actividades en tiempo libre</h3>

              {renderCheckboxes("Marca tus actividades:", "queHaces", [
                { value: "cocinar", label: "Cocinar" },
                { value: "bailar", label: "Bailar" },
                { value: "leer", label: "Leer" },
                { value: "cine", label: "Ir al cine" },
                { value: "viajar", label: "Viajar" },
              ])}

              {/* Expansión para Cocinar */}
              {formData.queHaces.includes("cocinar") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Cuánto te gusta cocinar?</p>
                  <select
                    value={formData.nivelCocinar}
                    onChange={(e) => handleInputChange("nivelCocinar", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="odio-cocinar">Odio cocinar</option>
                    <option value="no-se-pero-tengo">No sé pero tengo que comer</option>
                    <option value="solo-necesario">Solo lo necesario</option>
                    <option value="me-gusta">Me gusta</option>
                    <option value="me-encanta">Me encanta</option>
                    <option value="chef">Soy chef / Profesional</option>
                  </select>
                </div>
              )}

              {/* Expansión para Bailar */}
              {formData.queHaces.includes("bailar") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Cuánto te gusta bailar?</p>
                  <select
                    value={formData.nivelBailar}
                    onChange={(e) => handleInputChange("nivelBailar", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="me-encanta">Me encanta</option>
                    <option value="frecuentemente">Frecuentemente</option>
                    <option value="de-vez-cuando">De vez en cuando</option>
                    <option value="no-bailo">No bailo, no me gusta bailar</option>
                  </select>
                </div>
              )}

              {/* Expansión para Leer */}
              {formData.queHaces.includes("leer") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Cuánto te gusta leer?</p>
                  <select
                    value={formData.nivelLeer}
                    onChange={(e) => handleInputChange("nivelLeer", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="no-se-leer">Ni sé leer</option>
                    <option value="nunca-leo">Nunca leo nada</option>
                    <option value="esporadicamente">Leo esporádicamente</option>
                    <option value="bastante">Leo bastante</option>
                    <option value="frecuentemente">Leo frecuentemente en todos sitios</option>
                    <option value="adicto">Estoy adicto a la lectura</option>
                  </select>
                </div>
              )}

              {/* Expansión para Ir al cine */}
              {formData.queHaces.includes("cine") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tal el cine?</p>
                  <select
                    value={formData.nivelCine}
                    onChange={(e) => handleInputChange("nivelCine", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="odio-salas">Odio salas llenas de gente</option>
                    <option value="claustrofobia">Voy pero tengo claustrofobia</option>
                    <option value="prefiero-no">Si no es obligatorio, prefiero no ir</option>
                    <option value="a-veces">A veces</option>
                    <option value="sin-problema">Sí, voy sin problema</option>
                    <option value="solo-buenas">Voy solo si hay buena premiere</option>
                    <option value="frecuentemente">Voy al cine frecuentemente y solo</option>
                    <option value="fanatico">Soy fanático de cine, películas y todo ese rollo</option>
                  </select>
                </div>
              )}

              {/* Expansión para Viajar */}
              {formData.queHaces.includes("viajar") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tal viajar?</p>
                  <select
                    value={formData.nivelViajar}
                    onChange={(e) => handleInputChange("nivelViajar", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="odio-viajar">Odio viajar</option>
                    <option value="solo-necesario">Viajo solo si es absolutamente necesario</option>
                    <option value="cortas-distancias">Viajo, pero solo cortas distancias</option>
                    <option value="viajo">Viajo</option>
                    <option value="mucho-trabajo-no-gusta">Viajo mucho porque es parte de mi trabajo y no me gusta</option>
                    <option value="mucho-trabajo-gusta">Viajo mucho porque es parte de mi trabajo y me gusta</option>
                    <option value="mucho-quisiera-mas">Viajo mucho y desearía viajar más</option>
                    <option value="viajero-nato">Estoy un viajero nato, quisiera ir a cada rincón del mundo</option>
                  </select>
                </div>
              )}
            </div>

            {/* Salud y hábitos */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Salud y hábitos</h3>

              {renderSelectField("¿Te ejercitas físicamente?", "teEjercitas", [
                { value: "diariamente", label: "Diariamente" },
                { value: "semanalmente", label: "Semanalmente" },
                { value: "rara-vez", label: "Rara vez" },
                { value: "nunca", label: "Nunca" },
              ])}

              {renderYesNoField(
                "¿Fumas?",
                "fumas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaFumar}
                    onChange={(e) => handleInputChange("frecuenciaFumar", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="diariamente">Diariamente</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="socialmente">Socialmente</option>
                  </select>
                </>
              )}

              {renderYesNoField(
                "¿Bebes alcohol?",
                "bebesAlcohol",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaBeber}
                    onChange={(e) => handleInputChange("frecuenciaBeber", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="diariamente">Diariamente</option>
                    <option value="semanalmente">Semanalmente</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="socialmente">Socialmente</option>
                  </select>
                </>
              )}

              {renderYesNoField(
                "¿Usas drogas?",
                "usasDrogas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaDrogas}
                    onChange={(e) => handleInputChange("frecuenciaDrogas", e.target.value)}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="regularmente">Regularmente</option>
                  </select>
                </>
              )}

              {renderSelectField("¿Saldrías con alguien que fuma?", "saldriasFumador", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Saldrías con alguien que bebe?", "saldriasBebedor", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "solo-ocasional", label: "Solo si bebe ocasionalmente" },
                { value: "solo-social", label: "Solo si bebe socialmente" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Dieta o alimentación especial?", "dietaEspecial", [
                { value: "ninguna", label: "Ninguna" },
                { value: "sin-lactosa", label: "Sin lactosa" },
                { value: "sin-azucar", label: "Sin azúcar" },
                { value: "sin-gluten", label: "Sin gluten (celíaca)" },
                { value: "diabetes", label: "Diabetes" },
                { value: "vegetariana", label: "Vegetariana" },
                { value: "vegana", label: "Vegana" },
                { value: "kosher", label: "Kosher" },
                { value: "halal", label: "Halal" },
                { value: "otra", label: "Otra" },
              ], "dietaEspecialOtra")}
            </div>

            {/* Personalidad y costumbres */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Personalidad y costumbres</h3>

              {renderSelectField("¿Te gusta pasar tiempo con familiares?", "tiempoConFamilia", [
                { value: "si-encanta", label: "Sí, me encanta, soy súper familiero/a" },
                { value: "ocasionalmente", label: "Ocasionalmente, de vez en cuando" },
                { value: "no-familiero", label: "Francamente... no soy muy familiero" },
              ])}

              {renderSelectField("¿Eres de personalidad sociable?", "personalidadSociable", [
                { value: "extrovertido", label: "Sí, soy bastante extrovertido y sociable" },
                { value: "algo-timido", label: "Soy algo tímido/a, pero igual me gusta socializar" },
                { value: "neutro", label: "No lo busco específicamente, pero si me topo con algo así, lo paso sin problema" },
                { value: "desgastante", label: "Me resulta desgastante... odio hacer sociales o hablar con gente que apenas conozco" },
              ])}

              {renderSelectField("¿Eres ambicioso?", "eresAmbicioso", [
                { value: "super-ambicioso", label: "Super ambicioso" },
                { value: "ambicioso", label: "Ambicioso" },
                { value: "algo-ambicioso", label: "Algo ambicioso" },
                { value: "no-ambicioso", label: "No soy ambicioso" },
              ])}

              {renderSelectField("Orden y mantenimiento", "ordenMantenimiento", [
                { value: "impecable", label: "Me encanta mantener todo lo más impecable posible" },
                { value: "orden-sin-exagerar", label: "Me gusta mantener el orden, pero sin exagerar" },
                { value: "relajado", label: "Soy relajado, ordeno ocasionalmente" },
                { value: "muy-relajado", label: "Soy muy relajado, no ordeno casi nunca" },
              ])}
            </div>
          </div>
        );

      case "informacion-privada":
        return (
          <div className="space-y-6">
            {/* Banner informativo */}
            <div className="bg-connect-bg-dark/80 backdrop-blur-sm border border-neon-green/30 rounded-xl p-6 shadow-xl shadow-neon-green/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🔒</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neon-green mb-3">Información privada</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>Esta información es <strong className="text-neon-green">completamente opcional y privada</strong>:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>No es obligatorio completar este formulario</li>
                      <li>No se muestra públicamente en tu perfil</li>
                      <li>No se usa para fines comerciales</li>
                      <li>No se comparte con terceros</li>
                      <li>Solo se utiliza para mejorar las búsquedas automáticas y sugerencias personalizadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ideas políticas */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Ideas políticas</h3>
              </div>

              {renderSelectField("Ideas políticas", "ideasPoliticas", [
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "ultra-conservador", label: "Ultra Conservador" },
                { value: "conservador", label: "Conservador" },
                { value: "centro", label: "Centro" },
                { value: "liberal", label: "Liberal" },
                { value: "muy-liberal", label: "Muy Liberal" },
                { value: "otro", label: "Otro punto de vista" },
              ])}
            </div>

            {/* Tipo de educación */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Tipo de educación</h3>
              </div>

              {renderSelectField("¿Estudiaste en escuelas privadas o públicas?", "escuelasPrivadasPublicas", [
                { value: "publicas", label: "Escuelas públicas" },
                { value: "privadas", label: "Escuelas privadas" },
                { value: "mezcla", label: "Mezcla de públicas y privadas" },
                { value: "en-casa", label: "Educación en casa" },
                { value: "alternativa", label: "Educación alternativa" },
              ], "escuelasPrivadasPublicasOtra")}
            </div>

            {/* Familia */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Familia</h3>
              </div>

              {renderSelectField("Tus padres están...", "tusPadresEstan", [
                { value: "aun-casados", label: "Aún casados" },
                { value: "divorciados", label: "Divorciados" },
                { value: "separados", label: "Separados" },
                { value: "uno-muerto", label: "Uno ha muerto" },
                { value: "ambos-murieron", label: "Ambos murieron" },
                { value: "no-estan-juntos", label: "No están juntos" },
              ])}

              {renderSelectField("Orden de nacimiento", "ordenNacimiento", [
                { value: "primero", label: "Primero" },
                { value: "segundo", label: "Segundo" },
                { value: "tercero", label: "Tercero" },
                { value: "cuarto", label: "Cuarto" },
                { value: "quinto-mas", label: "Quinto o más" },
                { value: "unico", label: "Único hijo" },
              ])}
            </div>

            {/* Situación económica */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Situación económica</h3>
              </div>

              {renderSelectField("¿Eres económicamente independiente?", "economicamenteIndependiente", [
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
                { value: "mas-o-menos", label: "Más o menos" },
              ])}

              {renderSelectField("¿Cuál es tu nivel de ingresos actual?", "nivelIngresos", [
                { value: "no-tengo", label: "No tengo ingresos" },
                { value: "menores", label: "Ingresos menores que un salario básico" },
                { value: "similares", label: "Ingresos similares que un salario básico" },
                { value: "mayores", label: "Ingresos mayores que un salario básico" },
                { value: "mucho-mayores", label: "Ingresos mucho mayores que un salario básico" },
              ])}

              {renderSelectField("¿Es importante que tu pareja tenga tu mismo nivel de ingresos?", "importaNivelIngresosPareja", [
                { value: "no-importante", label: "No es importante" },
                { value: "escalon-cercano", label: "Es importante que al menos esté en un escalón cercano" },
                { value: "mismo-nivel", label: "Tiene que estar en el mismo nivel o más que yo" },
              ])}
            </div>

            {/* Orígenes */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Orígenes</h3>
              </div>

              {renderSelectField("¿De dónde provienes?", "origenGeograficoPrivado", [
                { value: "pueblo", label: "Vida de pueblo" },
                { value: "ciudad", label: "Vida de ciudad" },
              ])}

              {renderSelectField("¿Cuáles son tus orígenes socio-económicos?", "claseSocioeconomica", [
                { value: "clase-humilde", label: "Provengo de una familia de clase humilde" },
                { value: "clase-media", label: "Provengo de una familia de clase media" },
                { value: "clase-media-alta", label: "Provengo de una familia de clase media-alta" },
                { value: "clase-alta", label: "Provengo de una familia de clase alta" },
              ])}
            </div>

            {/* Saldrías con alguien que... (privado) */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Saldrías con alguien que...</h3>
              </div>

              {renderSelectField("¿Saldrías con alguien con unos kilos de más o de talla grande?", "saldriasMasKilos", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "si-prefiero", label: "Sí, y prefiero que sea así" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Saldrías con alguien que tiene hijos?", "saldriasConHijos", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "depende-cuantos", label: "Depende cuántos" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSaveAll = async () => {
    try {
      // Obtener datos del usuario autenticado
      if (!user) {
        alert('Debes iniciar sesión para guardar cambios');
        return;
      }
      
      const username = user.username;
      const email = user.email;
      
      const profileData = {
        username,
        email,
        nombre: formData.nombre || username,
        edad: formData.edad || null,
        genero: formData.genero || null,
        ciudad: formData.ciudad || null,
        foto_perfil: formData.fotoPerfil || null,
        status_text: formData.statusText || null,
        presence_status: 'online',
        
        // ALGO SOBRE MÍ
        altura: formData.altura || null,
        peso: formData.peso || null,
        tipo_cuerpo: formData.tipoCuerpo || null,
        color_ojos: formData.colorOjos || null,
        color_cabello: formData.colorCabello || null,
        signo_zodiacal: formData.signoZodiacal || null,
        educacion: formData.educacion || null,
        etnia: formData.etnia || null,
        vives_en: formData.vivesEn || null,
        idiomas: formData.idiomas || [],
        
        // TRABAJO
        trabajas: formData.trabajas || false,
        en_que_trabaja: formData.enQueTrabaja || null,
        definete_en_frase: formData.defineteEnFrase || null,
        cuentanos_algo_tuyo: formData.cuentanosAlgoTuyo || null,
        intereses: formData.intereses || null,
        primera_cita_ideal: formData.primeraCitaIdeal || null,
        
        // RELACIONES
        tiene_hijos: formData.tieneHijos || false,
        situacion_hijos: formData.situacionHijos || null,
        quiere_tener_hijos: formData.quiereTenerHijos || null,
        estado_civil: formData.estadoCivil || null,
        que_buscas: formData.queBuscas || null,
        razon_principal: formData.razonPrincipal || null,
        tiempo_en_pareja: formData.tiempoEnPareja || null,
        casarse_importante: formData.casarseImportante || null,
        duracion_relacion_larga: formData.duracionRelacionLarga || null,
        
        // VEHÍCULO
        tiene_vehiculo: formData.tieneVehiculo || false,
        
        // MASCOTA
        tiene_mascota: formData.tieneMascota || null,
        tiene_mascota_otra: formData.tieneMascotaOtra || null,
        
        // CULTURA
        pasatiempos: formData.pasatiempos || [],
        generos_peliculas: formData.generosPeliculas || [],
        generos_musica: formData.generosMusica || [],
        generos_libros: formData.generosLibros || [],
        deportes_practica: formData.deportesPractica || [],
        ideas_politicas: formData.ideasPoliticas || null,
        escuelas_privadas_publicas: formData.escuelasPrivadasPublicas || null,
        escuelas_privadas_publicas_otra: formData.escuelasPrivadasPublicasOtra || null,
        valores_tradicionales: formData.valoresTradicionales || null,
        espiritualidad: formData.espiritualidad || null,
        religion: formData.religion || null,
        convicciones_religiosas: formData.conviccionesReligiosas || null,
        
        // ESTILO DE VIDA
        que_haces: formData.queHaces || null,
        nivel_cocinar: formData.nivelCocinar || null,
        nivel_bailar: formData.nivelBailar || null,
        nivel_leer: formData.nivelLeer || null,
        nivel_cine: formData.nivelCine || null,
        nivel_viajar: formData.nivelViajar || null,
        te_ejercitas: formData.teEjercitas || null,
        eres_ambicioso: formData.eresAmbicioso || null,
        
        // Fumar
        fumas: formData.fumas || null,
        frecuencia_fumar: formData.frecuenciaFumar || null,
        saldrias_fumador: formData.saldriasFumador || false,
        
        // Beber
        bebes_alcohol: formData.bebesAlcohol || null,
        frecuencia_beber: formData.frecuenciaBeber || null,
        saldrias_bebedor: formData.saldriasBebedor || false,
        
        // Drogas
        usas_drogas: formData.usasDrogas || null,
        frecuencia_drogas: formData.frecuenciaDrogas || null,
        
        // Otros
        dieta_especial: formData.dietaEspecial || null,
        dieta_especial_otra: formData.dietaEspecialOtra || null,
        tiempo_con_familia: formData.tiempoConFamilia || null,
        personalidad_sociable: formData.personalidadSociable || null,
        orden_mantenimiento: formData.ordenMantenimiento || null,
        
        // CONFIGURACIÓN DE CARRUSEL DE FOTOS
        carousel_enabled: formData.carouselEnabled || false,
        carousel_interval_type: formData.carouselIntervalType || 'minutes',
        carousel_interval_value: formData.carouselIntervalValue || 5,
      };
      
      console.log('📤 Enviando datos del perfil:', profileData);
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      console.log('📥 Respuesta del servidor:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        alert(`❌ Error del servidor (${response.status})\n\n${errorText.substring(0, 200)}`);
        return;
      }
      
      const result = await response.json();
      console.log('✅ Resultado:', result);
      
      if (result.success) {
        alert(`✅ Perfil guardado correctamente!\n\nPerfil completado: ${result.profileCompletion}%`);
      } else {
        alert(`❌ Error al guardar: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Error al guardar perfil:', error);
      alert(`❌ Error al guardar el perfil:\n\n${error.message}\n\nRevisa la consola para más detalles.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812]">
      {/* Header */}
      <header className="bg-connect-bg-dark/80 backdrop-blur-md border-b border-connect-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-10 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">LoCuToRiO</span>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-neon-green transition-colors">
                Mi Espacio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Editar Perfil Detallado</h1>
            <p className="text-gray-400">Completa tu perfil para mejorar tus conexiones</p>
          </div>
          
          {/* Botón Editar Datos Básicos */}
          <Link
            href="/create-profile?edit=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-connect-primary hover:bg-connect-primary-hover text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Datos Básicos</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Tarjeta de foto */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-4 shadow-lg">
              <PhotoManager
                username={user?.username || 'demo'}
                initialPhotos={formData.fotos}
                canUpload={true}
                canDelete={true}
                canSetPrincipal={true}
                canToggleCarousel={true}
                onPhotosChange={(photos) => {
                  setFormData(prev => ({ ...prev, fotos: photos }));
                }}
                showCarousel={true}
                carouselEnabled={formData.carouselEnabled}
                carouselIntervalType={formData.carouselIntervalType}
                carouselIntervalValue={formData.carouselIntervalValue}
                onCarouselChange={(config) => {
                  setFormData(prev => ({
                    ...prev,
                    carouselEnabled: config.enabled,
                    carouselIntervalType: config.intervalType,
                    carouselIntervalValue: config.intervalValue,
                  }));
                }}
              />
            </div>

            {/* Tarjeta de navegación */}
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-4 shadow-lg">
              {/* Nav de categorías */}
              <nav className="space-y-2">
                {/* Botón Datos básicos - Redirige a /create-profile */}
                <Link
                  href="/create-profile"
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent"
                >
                  <span className="text-xl">📝</span>
                  <span className="text-sm font-medium">Datos básicos</span>
                </Link>
                
                {/* Botón Seguridad - Redirige a /security */}
                <Link
                  href="/security?tab=seguridad"
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent"
                >
                  <span className="text-xl">🔒</span>
                  <span className="text-sm font-medium">Seguridad y Configuración</span>
                </Link>
                
                {/* Botón Cómo me ven - Ver perfil público */}
                <Link
                  href={`/publicprofile/${user?.username || 'demo'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent"
                >
                  <span className="text-xl">👁️</span>
                  <span className="text-sm font-medium">Cómo me ven</span>
                </Link>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? "bg-transparent border border-[#2BEE79]/50 text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>

              {/* Botón Guardar Todo */}
              <div className="mt-6">
                <button
                  onClick={handleSaveAll}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)]"
                >
                  💾 Guardar todo
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AjustesPerfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-connect-bg-dark flex items-center justify-center"><div className="text-white">Cargando...</div></div>}>
      <AjustesPerfilContent />
    </Suspense>
  );
}
