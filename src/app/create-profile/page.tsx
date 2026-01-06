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
  const editMode = searchParams.get("edit") === "true"; // Detectar modo edición
  
  // Simular si el usuario está logueado (en producción, esto vendría de un contexto de autenticación)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Estado de verificación de nombre (apodo)
  const [nombreStatus, setNombreStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [nombreCheckTimeout, setNombreCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
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
  
  // Cargar datos del usuario si está en modo edición
  useEffect(() => {
    // TODO: En producción, verificar si el usuario está logueado
    // const user = getLoggedInUser();
    // setIsLoggedIn(!!user);
    
    // Simular usuario logueado en modo edición
    if (editMode) {
      setIsLoggedIn(true);
      // TODO: Cargar datos del backend
      // const userData = await fetchUserProfile();
      // Simulación de datos pre-cargados
      setProfileData({
        nombre: "Ana_M",
        email: "ana@example.com",
        emailConfirm: "ana@example.com",

        password: "********",
        passwordConfirm: "********",
        sexo: "mujer",
        fechaNacimiento: "2000-05-15",
        paisCodigo: "VE",
        paisNombre: "Venezuela",
        ciudad: "Caracas",
        estado: "Distrito Capital",
        queBusca: "pareja",
        buscarParejaPaisCodigo: "VE",
        buscarParejaPaisNombre: "Venezuela",
        buscarParejaCiudad: "Caracas",
        buscarParejaEstado: "Distrito Capital",
      });
      
      // Simulación de fotos pre-cargadas
      setFotos([
        {
          id: "1",
          url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw",
          esPrincipal: true,
          estado: "aprobada"
        }
      ]);
    }
  }, [editMode]);

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
    console.log(editMode ? "Datos actualizados:" : "Datos básicos guardados:", profileData);
    
    if (editMode) {
      // Modo edición: Volver al perfil del usuario
      alert("Datos básicos actualizados exitosamente");
      router.push("/publicprofile/" + profileData.nombre); // O usar el username real
    } else {
      // Modo registro: Redirigir al dashboard
      alert("¡Registro completado! Bienvenido a LoCuToRiO");
      router.push("/dashboard");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812]">
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
          
          {/* Botón Volver */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link 
              href={isLoggedIn ? "/userprofile" : "/"}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Volver</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {editMode ? "Editar Datos Básicos" : "¡Bienvenido!"}
          </h1>
          <p className="text-gray-400">
            {editMode ? "Actualiza tu información básica" : "Cuéntanos un poco sobre ti para empezar"}
          </p>
        </div>

        {/* Layout con Sidebar + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Sidebar izquierdo con foto */}
          <div className="lg:col-span-1">
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-4 shadow-lg sticky top-24 space-y-4">
              
              {/* =================== FOTO DE PERFIL (EN SIDEBAR) =================== */}
              <div className="space-y-3">
                {/* Carta de foto con proporción 10:13 */}
                <div 
                  className="relative rounded-xl overflow-hidden bg-connect-bg-dark border border-connect-border cursor-pointer"
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
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-2xl p-8 shadow-xl shadow-neon-green/5">
              <form onSubmit={handleContinue} className="space-y-6">
            {/* Nombre (apodo) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre (apodo) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tu apodo (máximo 12 caracteres incluido letras, símbolos, números y espacio)"
                  value={profileData.nombre}
                  maxLength={12}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setProfileData({ ...profileData, nombre: newName });
                    
                    // Limpiar timeout anterior
                    if (nombreCheckTimeout) clearTimeout(nombreCheckTimeout);
                    
                    if (newName.length >= 3 && !editMode) {
                      setNombreStatus("checking");
                      
                      // Verificar disponibilidad después de 500ms
                      const timeout = setTimeout(async () => {
                        try {
                          const response = await fetch(`/api/check-username?username=${encodeURIComponent(newName)}`);
                          const data = await response.json();
                          setNombreStatus(data.available ? "available" : "taken");
                        } catch (err) {
                          setNombreStatus("idle");
                        }
                      }, 500);
                      
                      setNombreCheckTimeout(timeout);
                    } else {
                      setNombreStatus("idle");
                    }
                  }}
                  className={`bg-connect-bg-dark/80 text-white placeholder:text-gray-500 transition-all ${
                    nombreStatus === "available" ? "border-2 border-green-500" :
                    nombreStatus === "taken" ? "border-2 border-orange-500" :
                    "border border-connect-border"
                  }`}
                  required
                  disabled={editMode}
                />
                {/* Icono de estado */}
                {nombreStatus !== "idle" && !editMode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nombreStatus === "checking" && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    )}
                    {nombreStatus === "available" && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                    {nombreStatus === "taken" && (
                      <span className="text-orange-500 text-xl">!</span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-400">
                  💡 No es necesario poner tu nombre verdadero. Elige un apodo que te guste.
                </p>
                {nombreStatus === "available" && !editMode && (
                  <p className="text-xs text-green-400">
                    ✅ Este nick está disponible
                  </p>
                )}
                {nombreStatus === "taken" && !editMode && (
                  <p className="text-xs text-orange-400">
                    ⚠️ Este nick ya está en uso. Elige otro.
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                required
                disabled={editMode}
              />
              {!editMode && (
                <p className="text-xs text-orange-400 mt-2">
                  ⚠️ Solo puedes registrar <strong>un nick</strong> a <strong>un email</strong>. No se permiten múltiples cuentas.
                </p>
              )}
            </div>

            {/* Confirmar Email */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar correo electrónico <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Repite tu correo"
                  value={profileData.emailConfirm}
                  onChange={(e) => setProfileData({ ...profileData, emailConfirm: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
              </div>
            )}


            {/* Contraseña */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Debe incluir al menos mayúsculas, minúsculas y números
                </p>
              </div>
            )}

            {/* Confirmar Contraseña */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={profileData.passwordConfirm}
                  onChange={(e) => setProfileData({ ...profileData, passwordConfirm: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
              </div>
            )}

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
                        : "bg-connect-bg-dark/60 border-connect-border text-gray-400 hover:border-neon-green/50"
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
                className="bg-connect-bg-dark/80 border-connect-border text-white"
                required
              />
              <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-xs text-orange-300">
                  ⚠️ <strong>Por favor, pon tu fecha de nacimiento real.</strong> Luego se puede cambiar solo <strong>una vez</strong>. 
                  En caso de verificación de perfil con ID, no sería posible verificar con fecha de nacimiento incorrecta.
                </p>
              </div>
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
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
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
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
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
                className="w-full px-4 py-2 rounded-lg bg-connect-bg-dark/80 border border-connect-border text-white focus:border-primary/50 focus:outline-none"
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
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
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
                      className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
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
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-connect-border">
              {editMode ? (
                <Button
                  type="submit"
                  className="flex-1 bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold py-6 text-base"
                >
                  💾 Guardar Cambios
                </Button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Crear cuenta y redirigir a /dashboard
                      alert("Crear y Empezar → /dashboard");
                    }}
                    className="flex-1 bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] font-bold py-6 text-base rounded-lg transition-all"
                  >
                    Crear y Empezar
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Crear cuenta y redirigir a /userprofile
                      alert("Crear y Completar Perfil → /userprofile");
                    }}
                    className="flex-1 bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] py-6 text-base font-semibold rounded-lg transition-all"
                  >
                    Crear y Completar Perfil
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Info */}
          {!editMode && (
            <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <p className="text-xs text-gray-300 text-center">
                💡 Al crear tu cuenta, aceptas nuestros <a href="/about/terminos" className="text-neon-green hover:brightness-110">Términos y condiciones</a> y <a href="/about/proteccion-datos" className="text-neon-green hover:brightness-110">Política de privacidad</a>
              </p>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearPerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    }>
      <CrearPerfilForm />
    </Suspense>
  );
}
