"use client";

import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCountries } from "../../hooks/useCountries";

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

function CrearPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  const [profileData, setProfileData] = useState({
    nombre: "",
    sexo: "",
    fechaNacimiento: "",
    paisCodigo: "VE", // Código del país donde vive
    paisNombre: "Venezuela",
    ciudad: "",
    estado: "", // Se detecta automáticamente
    queBusca: "",
    // Dónde busca pareja
    buscarParejaPaisCodigo: "", // País donde busca pareja
    buscarParejaPaisNombre: "",
    buscarParejaCiudad: "", // Solo si es el mismo país
    buscarParejaEstado: "", // Solo si es el mismo país
  });

  // Estado para fotos de perfil
  const [fotos, setFotos] = useState<Array<{
    id: string;
    url: string;
    esPrincipal: boolean;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
  }>>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // =================== HANDLER: PROCESAR FOTO ===================
  const handlePhotoUpload = async (file: File) => {
    try {
      // Validar tamaño máximo original (5MB para permitir fotos grandes)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 5MB.");
        return;
      }
      
      // Validar cantidad máxima
      if (fotos.length >= 6) {
        alert("Ya tienes 6 fotos. Elimina una antes de subir otra.");
        return;
      }
      
      // Redimensionar imagen automáticamente
      const resizedFile = await resizeImage(file, 400);
      
      // Verificar tamaño después de redimensionar
      console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)}KB → Tamaño final: ${(resizedFile.size / 1024).toFixed(2)}KB`);
      
      // Crear URL temporal
      const url = URL.createObjectURL(resizedFile);
      const newPhoto = {
        id: Date.now().toString(),
        url: url,
        esPrincipal: fotos.length === 0,
        estado: 'pendiente' as const
      };
      
      setFotos(prev => [...prev, newPhoto]);
      setCurrentPhotoIndex(fotos.length);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen. Inténtalo de nuevo.');
    }
  };

  // Hook para manejar países/ciudades (ubicación actual)
  const { countries, getCities, getStateByCity } = useCountries(profileData.paisCodigo);
  const [availableCities, setAvailableCities] = useState<Array<{name: string; state: string}>>([]);
  
  // Hook para manejar ciudades de búsqueda de pareja
  const { 
    getCities: getBuscarCities, 
    getStateByCity: getBuscarStateByCity 
  } = useCountries(profileData.buscarParejaPaisCodigo);
  const [buscarAvailableCities, setBuscarAvailableCities] = useState<Array<{name: string; state: string}>>([]);

  // Actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (profileData.paisCodigo) {
      const cities = getCities(profileData.paisCodigo);
      setAvailableCities(cities);
      // Reset ciudad y estado al cambiar país
      setProfileData(prev => ({ ...prev, ciudad: "", estado: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.paisCodigo]);

  // Detectar estado cuando se selecciona una ciudad
  useEffect(() => {
    if (profileData.paisCodigo && profileData.ciudad) {
      const state = getStateByCity(profileData.paisCodigo, profileData.ciudad);
      if (state && state !== profileData.estado) {
        setProfileData(prev => ({ ...prev, estado: state }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.paisCodigo, profileData.ciudad]);

  // Actualizar ciudades de búsqueda cuando cambia el país de búsqueda
  useEffect(() => {
    if (profileData.buscarParejaPaisCodigo) {
      const cities = getBuscarCities(profileData.buscarParejaPaisCodigo);
      setBuscarAvailableCities(cities);
      // Reset ciudad y estado de búsqueda al cambiar país
      setProfileData(prev => ({ ...prev, buscarParejaCiudad: "", buscarParejaEstado: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.buscarParejaPaisCodigo]);

  // Detectar estado de búsqueda cuando se selecciona una ciudad
  useEffect(() => {
    if (profileData.buscarParejaPaisCodigo && profileData.buscarParejaCiudad) {
      const state = getBuscarStateByCity(profileData.buscarParejaPaisCodigo, profileData.buscarParejaCiudad);
      if (state && state !== profileData.buscarParejaEstado) {
        setProfileData(prev => ({ ...prev, buscarParejaEstado: state }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.buscarParejaPaisCodigo, profileData.buscarParejaCiudad]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find(c => c.code === selectedCode);
    if (selectedCountry) {
      setProfileData(prev => ({
        ...prev,
        paisCodigo: selectedCode,
        paisNombre: selectedCountry.name,
      }));
    }
  };

  const handleBuscarParejaCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find(c => c.code === selectedCode);
    if (selectedCountry) {
      setProfileData(prev => ({
        ...prev,
        buscarParejaPaisCodigo: selectedCode,
        buscarParejaPaisNombre: selectedCountry.name,
      }));
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar datos básicos en la base de datos
    console.log("Datos básicos guardados:", profileData);
    
    // Redirigir a perfil detallado
    router.push("/ajustes/perfil?from=registro");
  };

  const handleSkip = () => {
    // Guardar datos básicos mínimos si los hay
    console.log("Saltando al inicio:", profileData);
    
    // Redirigir a inicio
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-forest-dark">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
          <p className="text-gray-400">Cuéntanos un poco sobre ti para empezar</p>
        </div>

        {/* Layout con Sidebar + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Sidebar izquierdo con foto */}
          <div className="lg:col-span-1">
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-4 shadow-lg sticky top-24 space-y-4">
              
              {/* =================== FOTO DE PERFIL (EN SIDEBAR) =================== */}
              <div className="space-y-3">
                {/* Carta de foto con proporción 10:13 */}
                <div 
                  className="relative rounded-xl overflow-hidden bg-forest-dark border border-neon-green/20 cursor-pointer"
                  style={{ aspectRatio: '10/13' }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                      handlePhotoUpload(file);
                    } else if (file) {
                      alert("Solo se permiten imágenes JPG o PNG.");
                    }
                  }}
                >
                  {fotos.length > 0 ? (
                    <>
                      {/* Foto actual */}
                      <img 
                        src={fotos[currentPhotoIndex].url} 
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges en esquina superior derecha */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {fotos[currentPhotoIndex].estado === 'pendiente' && (
                          <span className="bg-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            🕐
                          </span>
                        )}
                        {fotos[currentPhotoIndex].estado === 'aprobada' && (
                          <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            ✅
                          </span>
                        )}
                        {fotos[currentPhotoIndex].estado === 'rechazada' && (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            ❌
                          </span>
                        )}
                        {fotos[currentPhotoIndex].esPrincipal && (
                          <span className="bg-neon-green/90 backdrop-blur-sm text-forest-dark text-xs px-2 py-1 rounded-full font-bold">
                            ⭐
                          </span>
                        )}
                      </div>
                      
                      {/* Navegación con flechas */}
                      {fotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCurrentPhotoIndex(prev => 
                              prev === 0 ? fotos.length - 1 : prev - 1
                            )}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentPhotoIndex(prev => 
                              prev === fotos.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                          >
                            ▶
                          </button>
                        </>
                      )}
                      
                      {/* Contador pequeño */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {currentPhotoIndex + 1}/{fotos.length}
                      </div>
                    </>
                  ) : (
                    // Texto de requisitos cuando no hay fotos (se tapa al subir)
                    // Hacer toda la carta clickeable con un label
                    <label className="cursor-pointer block w-full h-full">
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center hover:bg-neon-green/5 transition-all">
                        <div className="text-5xl mb-3">📷</div>
                        <p className="text-neon-green font-medium text-sm mb-2">Subir foto o arrastra aquí</p>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p>JPG, PNG • Máx 5MB</p>
                          <p>Cara visible (50%+)</p>
                          <p>Sin filtros</p>
                          <p>Solo tú en la foto</p>
                          <p className="text-orange-400 mt-2">⏱️ Verificación en máx 24h</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                
                {/* 3 BOTONES */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="cursor-pointer">
                    <div className="bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 py-2 rounded-lg text-center text-xs transition-all font-medium">
                      📤 Subir
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handlePhotoUpload(file);
                        }
                        // Reset input para permitir subir la misma imagen de nuevo
                        e.target.value = '';
                      }}
                    />
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (fotos.length === 0) return;
                      if (confirm('¿Eliminar esta foto?')) {
                        const newFotos = fotos.filter((_, i) => i !== currentPhotoIndex);
                        if (fotos[currentPhotoIndex].esPrincipal && newFotos.length > 0) {
                          newFotos[0].esPrincipal = true;
                        }
                        setFotos(newFotos);
                        setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
                      }
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-center text-xs transition-all"
                    disabled={fotos.length === 0}
                  >
                    🗑️
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (fotos.length === 0) return;
                      setFotos(prev => prev.map((f, i) => ({
                        ...f,
                        esPrincipal: i === currentPhotoIndex
                      })));
                    }}
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 py-2 rounded-lg text-center text-xs transition-all"
                    disabled={fotos.length === 0 || fotos[currentPhotoIndex]?.esPrincipal}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido derecho: Formulario de Datos básicos */}
          <div className="lg:col-span-3">
          <form onSubmit={handleContinue} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={profileData.nombre}
                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                className="bg-forest-dark/80 border-forest-light text-white placeholder:text-gray-500"
                required
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sexo <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Hombre", "Mujer", "Otro"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      profileData.sexo === option.toLowerCase()
                        ? "bg-neon-green/20 border-neon-green text-neon-green"
                        : "bg-forest-dark/60 border-forest-light text-gray-400 hover:border-neon-green/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value={option.toLowerCase()}
                      checked={profileData.sexo === option.toLowerCase()}
                      onChange={(e) => setProfileData({ ...profileData, sexo: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Nacimiento <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={profileData.fechaNacimiento}
                onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                className="bg-forest-dark/80 border-forest-light text-white"
                required
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.paisCodigo}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-2 bg-forest-dark/80 border border-forest-light rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                  required
                >
                  <option value="">Selecciona tu país</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ciudad <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.ciudad}
                  onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                  className="w-full px-4 py-2 bg-forest-dark/80 border border-forest-light rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                  required
                  disabled={!profileData.paisCodigo}
                >
                  <option value="">Selecciona tu ciudad</option>
                  {availableCities.map((city, index) => (
                    <option key={`${city.name}-${index}`} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {profileData.paisCodigo && availableCities.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No hay ciudades disponibles para este país</p>
                )}
              </div>

              {/* Mostrar estado detectado */}
              {profileData.estado && (
                <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    📍 Estado/Departamento: <span className="text-neon-green font-medium">{profileData.estado}</span>
                  </p>
                </div>
              )}
            </div>

            {/* ¿Qué buscas? */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Qué buscas? <span className="text-red-400">*</span>
              </label>
              <select
                value={profileData.queBusca}
                onChange={(e) => setProfileData({ ...profileData, queBusca: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-forest-dark/80 border border-forest-light text-white focus:border-neon-green focus:outline-none"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="pareja">Encontrar pareja</option>
                <option value="amistad">Amistad</option>
                <option value="conversar">Conversar / Chatear</option>
                <option value="aventuras">Aventuras sin compromiso</option>
                <option value="nosé">No sé aún</option>
              </select>
            </div>

            {/* ¿Dónde buscas pareja? */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Dónde buscas pareja? <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.buscarParejaPaisCodigo}
                  onChange={handleBuscarParejaCountryChange}
                  className="w-full px-4 py-2 bg-forest-dark/80 border border-forest-light rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                  required
                >
                  <option value="">Selecciona un país</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar selector de ciudad SOLO si es el mismo país */}
              {profileData.buscarParejaPaisCodigo && profileData.buscarParejaPaisCodigo === profileData.paisCodigo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ¿En qué ciudad?
                    </label>
                    <select
                      value={profileData.buscarParejaCiudad}
                      onChange={(e) => setProfileData({ ...profileData, buscarParejaCiudad: e.target.value })}
                      className="w-full px-4 py-2 bg-forest-dark/80 border border-forest-light rounded-lg text-white focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    >
                      <option value="">Cualquier ciudad</option>
                      {buscarAvailableCities.map((city, index) => (
                        <option key={`${city.name}-${index}`} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mostrar estado detectado para búsqueda */}
                  {profileData.buscarParejaEstado && (
                    <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                      <p className="text-xs text-gray-300">
                        📍 Buscando en: <span className="text-neon-green font-medium">{profileData.buscarParejaEstado}</span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Info cuando busca en otro país */}
              {profileData.buscarParejaPaisCodigo && profileData.buscarParejaPaisCodigo !== profileData.paisCodigo && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    🌍 Buscando pareja en cualquier ciudad de <span className="text-blue-400 font-medium">{profileData.buscarParejaPaisNombre}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-forest-light">
              <Button
                type="submit"
                className="flex-1 bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold py-6 text-base"
              >
                Continuar - Perfil Detallado →
              </Button>
              
              <Button
                type="button"
                onClick={handleSkip}
                variant="ghost"
                className="flex-1 bg-forest-light/30 text-gray-300 hover:bg-forest-light/50 hover:text-white border border-forest-light py-6 text-base"
              >
                Saltar - Llenar luego
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              💡 Puedes completar tu perfil detallado más tarde desde tu espacio personal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearPerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    }>
      <CrearPerfilForm />
    </Suspense>
  );
}
