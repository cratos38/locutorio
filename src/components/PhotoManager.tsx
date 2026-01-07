"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ImageCropper from "@/components/ImageCropper";

// =================== TIPOS ===================
export interface Photo {
  id: string;
  url: string;
  esPrincipal: boolean;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  file?: File; // Para guardar el archivo antes de subirlo
}

interface PhotoManagerProps {
  mode: 'editable' | 'readonly';
  username?: string; // Para cargar fotos desde BD en modo editable
  initialPhotos?: Photo[]; // Para create-profile sin username
  onPhotosChange?: (photos: Photo[]) => void; // Callback cuando cambian las fotos
  showCarousel?: boolean; // Mostrar configuración de carrusel
  carouselEnabled?: boolean;
  carouselIntervalType?: 'minutes' | 'hours' | 'days';
  carouselIntervalValue?: number;
  onCarouselChange?: (config: {
    enabled: boolean;
    intervalType: 'minutes' | 'hours' | 'days';
    intervalValue: number;
  }) => void;
}

// =================== UTILIDAD: REDIMENSIONAR IMAGEN ===================
async function resizeImage(file: File, maxWidth: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('No se pudo crear el blob'));
            return;
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// =================== COMPONENTE PRINCIPAL ===================
export default function PhotoManager({
  mode,
  username,
  initialPhotos = [],
  onPhotosChange,
  showCarousel = false,
  carouselEnabled = false,
  carouselIntervalType = 'minutes',
  carouselIntervalValue = 5,
  onCarouselChange,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCarouselMenu, setShowCarouselMenu] = useState(false);
  const [carouselOrder, setCarouselOrder] = useState<'sequential' | 'random'>('sequential');

  // Slider intervals: 0=auto(5seg), 1=10min, 2=30min, 3=1h, 4=5h, 5=10h, 6=24h
  const intervalOptions = [
    { label: 'Auto (5s)', minutes: 0.083 }, // 5 segundos = 0.083 minutos
    { label: '10 min', minutes: 10 },
    { label: '30 min', minutes: 30 },
    { label: '1 hora', minutes: 60 },
    { label: '5 horas', minutes: 300 },
    { label: '10 horas', minutes: 600 },
    { label: '24 horas', minutes: 1440 },
  ];

  const getSliderValue = () => {
    if (!carouselIntervalType || !carouselIntervalValue) return 0;
    const totalMinutes = carouselIntervalType === 'minutes' ? carouselIntervalValue :
                         carouselIntervalType === 'hours' ? carouselIntervalValue * 60 :
                         carouselIntervalValue * 1440;
    
    for (let i = intervalOptions.length - 1; i >= 0; i--) {
      if (totalMinutes >= intervalOptions[i].minutes) return i;
    }
    return 0;
  };

  const handleSliderChange = (sliderValue: number) => {
    const option = intervalOptions[sliderValue];
    const minutes = option.minutes;
    
    let intervalType: 'minutes' | 'hours' | 'days';
    let intervalValue: number;
    
    if (minutes < 60) {
      intervalType = 'minutes';
      intervalValue = minutes;
    } else if (minutes < 1440) {
      intervalType = 'hours';
      intervalValue = minutes / 60;
    } else {
      intervalType = 'days';
      intervalValue = minutes / 1440;
    }
    
    onCarouselChange?.({
      enabled: carouselEnabled,
      intervalType,
      intervalValue,
    });
  };

  // Cargar fotos desde BD si hay username
  useEffect(() => {
    if (mode === 'editable' && username) {
      loadPhotosFromDB();
    }
  }, [mode, username]);

  // Notificar cambios a componente padre
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(photos);
    }
  }, [photos]);

  // =================== CARGAR FOTOS DESDE BD ===================
  const loadPhotosFromDB = async () => {
    if (!username) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/profile?username=${username}`);
      
      if (!response.ok) {
        console.error('Error al cargar perfil');
        return;
      }
      
      const result = await response.json();
      
      // TODO: Cuando tengamos la tabla profile_photos, cargar desde ahí
      // Por ahora, simular con foto_perfil
      if (result.data?.foto_perfil) {
        setPhotos([{
          id: '1',
          url: result.data.foto_perfil,
          esPrincipal: true,
          estado: 'aprobada'
        }]);
      }
    } catch (error) {
      console.error('Error al cargar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  // =================== SUBIR FOTO ===================
  const handlePhotoUpload = async (file: File) => {
    if (mode === 'readonly') return;

    try {
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 5MB.");
        return;
      }

      // Abrir editor de recorte
      const url = URL.createObjectURL(file);
      setImageToCrop(url);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen. Inténtalo de nuevo.');
    }
  };

  // =================== COMPLETAR RECORTE ===================
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      // Convertir blob URL a File
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

      // Redimensionar
      const resizedFile = await resizeImage(file, 400);
      console.log(`Tamaño final: ${(resizedFile.size / 1024).toFixed(2)}KB`);

      // Crear nueva foto
      const url = URL.createObjectURL(resizedFile);
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: url,
        esPrincipal: photos.length === 0,
        estado: 'pendiente',
        file: resizedFile,
      };

      setPhotos(prev => [...prev, newPhoto]);
      setCurrentPhotoIndex(photos.length);
      setImageToCrop(null);
    } catch (error) {
      console.error('Error al procesar la imagen recortada:', error);
      alert('Error al procesar la imagen. Inténtalo de nuevo.');
    }
  };

  // =================== CANCELAR RECORTE ===================
  const handleCropCancel = () => {
    setImageToCrop(null);
  };

  // =================== MARCAR COMO PRINCIPAL ===================
  const handleSetPrincipal = () => {
    if (photos.length === 0) return;
    
    setPhotos(prev => prev.map((photo, i) => ({
      ...photo,
      esPrincipal: i === currentPhotoIndex
    })));
  };

  // =================== ELIMINAR FOTO ===================
  const handleDeletePhoto = () => {
    if (photos.length === 0) return;
    
    if (!confirm('¿Eliminar esta foto?')) return;

    const newPhotos = photos.filter((_, i) => i !== currentPhotoIndex);
    
    // Si la foto eliminada era la principal y quedan fotos, hacer la primera principal
    if (photos[currentPhotoIndex].esPrincipal && newPhotos.length > 0) {
      newPhotos[0].esPrincipal = true;
    }
    
    setPhotos(newPhotos);
    setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
  };

  // =================== NAVEGACIÓN ===================
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  // =================== RENDER ===================
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Cargando fotos...</div>
      </div>
    );
  }

  return (
    <div className={mode === 'editable' ? 'space-y-3' : ''}>
      {/* =================== FOTO PRINCIPAL =================== */}
      <div 
        className="relative rounded-xl overflow-hidden bg-connect-bg-dark border border-connect-border cursor-pointer group"
        style={{ aspectRatio: '10/13' }}
        onMouseEnter={() => setShowCarouselMenu(true)}
        onMouseLeave={() => setShowCarouselMenu(false)}
        onDragOver={(e) => {
          if (mode === 'readonly') return;
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          if (mode === 'readonly') return;
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
        {photos.length > 0 ? (
          <>
            {/* Foto actual */}
            <img 
              src={photos[currentPhotoIndex].url} 
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
            
            {/* Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {photos[currentPhotoIndex].estado === 'pendiente' && (
                <span className="bg-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  🕐
                </span>
              )}
              {photos[currentPhotoIndex].estado === 'aprobada' && (
                <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  ✅
                </span>
              )}
              {photos[currentPhotoIndex].estado === 'rechazada' && (
                <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                  ❌
                </span>
              )}
              {photos[currentPhotoIndex].esPrincipal && (
                <span className="bg-neon-green/90 backdrop-blur-sm text-forest-dark text-xs px-2 py-1 rounded-full font-bold">
                  ⭐
                </span>
              )}
            </div>
            
            {/* Navegación */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Contador */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
              Foto {currentPhotoIndex + 1} de {photos.length}
            </div>
          </>
        ) : (
          <div 
            className="flex flex-col items-center justify-center h-full p-4 text-center cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => {
              if (mode === 'readonly') return;
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/png';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handlePhotoUpload(file);
              };
              input.click();
            }}
          >
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-400 text-sm mb-1">
              {mode === 'readonly' ? 'Sin fotos' : 'Subir foto o arrastra aquí'}
            </p>
            {mode === 'editable' && (
              <p className="text-gray-500 text-xs">
                JPG o PNG • Máx. 5 MB
              </p>
            )}
          </div>
        )}
      </div>

      {/* =================== CONTROLES (SOLO EN MODO EDITABLE) =================== */}
      {mode === 'editable' && (
        <>
          {/* Controles de carrusel (entre foto y botones) */}
          {photos.length >= 1 && (
            <div className="flex items-center gap-3 py-2 px-1 min-h-[40px]">
              {/* Toggle ON/OFF */}
              <div className="relative group flex items-center">
                <button
                  onClick={() => onCarouselChange?.({
                    enabled: !carouselEnabled,
                    intervalType: carouselIntervalType,
                    intervalValue: carouselIntervalValue,
                  })}
                  className={`w-10 h-5 rounded-full border transition-all ${
                    carouselEnabled 
                      ? 'bg-emerald-950/50 border-neon-green shadow-[0_0_10px_rgba(43,238,121,0.5)]' 
                      : 'bg-gray-900/50 border-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform shadow-lg ${
                    carouselEnabled 
                      ? 'translate-x-5 bg-neon-green shadow-[0_0_8px_rgba(43,238,121,0.8)]' 
                      : 'translate-x-0.5 bg-gray-600'
                  }`} />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
                  {carouselEnabled ? 'Carrusel ON' : 'Carrusel OFF'}
                </span>
              </div>

              {/* Slider de intervalo */}
              {carouselEnabled && (
                <>
                  <div className="w-32 relative group flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="6"
                      step="1"
                      value={getSliderValue()}
                      onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-transparent rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-green [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(43,238,121,0.8)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-runnable-track]:bg-neon-green/30 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:shadow-[0_0_6px_rgba(43,238,121,0.4)]"
                      style={{
                        background: `linear-gradient(to right, #2bee79 0%, #2bee79 ${(getSliderValue() / 6) * 100}%, rgba(43,238,121,0.2) ${(getSliderValue() / 6) * 100}%, rgba(43,238,121,0.2) 100%)`
                      }}
                    />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
                      {intervalOptions[getSliderValue()].label}
                    </span>
                  </div>

                  {/* Toggle Orden/Aleatorio */}
                  <div className="relative group flex items-center">
                    <button
                      onClick={() => setCarouselOrder(carouselOrder === 'sequential' ? 'random' : 'sequential')}
                      className={`w-10 h-5 rounded-full border transition-all ${
                        carouselOrder === 'random'
                          ? 'bg-emerald-950/50 border-neon-green shadow-[0_0_10px_rgba(43,238,121,0.5)]'
                          : 'bg-emerald-950/50 border-neon-green/50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full transition-transform shadow-lg ${
                        carouselOrder === 'random'
                          ? 'translate-x-5 bg-neon-green shadow-[0_0_8px_rgba(43,238,121,0.8)]'
                          : 'translate-x-0.5 bg-neon-green/60'
                      }`} />
                    </button>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/20">
                      {carouselOrder === 'sequential' ? 'En orden' : 'Aleatorio'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="grid grid-cols-3 gap-2">
            {/* Subir */}
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/jpeg,image/png';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handlePhotoUpload(file);
                };
                input.click();
              }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all border text-[#2BEE79] border-[#2BEE79]/50 shadow-[0_0_10px_rgba(43,238,121,0.2)] hover:border-[#2BEE79] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)]"
            >
              Subir
            </button>
            
            {/* Eliminar */}
            <button
              onClick={handleDeletePhoto}
              className="text-xs px-3 py-1.5 rounded-lg transition-all border text-[#2BEE79] border-[#2BEE79]/50 shadow-[0_0_10px_rgba(43,238,121,0.2)] hover:border-[#2BEE79] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)]"
            >
              Eliminar
            </button>
            
            {/* Marcar como principal */}
            <button
              onClick={handleSetPrincipal}
              className="text-xs px-3 py-1.5 rounded-lg transition-all border text-[#2BEE79] border-[#2BEE79]/50 shadow-[0_0_10px_rgba(43,238,121,0.2)] hover:border-[#2BEE79] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)]"
            >
              Principal
            </button>
          </div>
        </>
      )}

      {/* =================== IMAGE CROPPER MODAL =================== */}
      {imageToCrop && typeof window !== 'undefined' && createPortal(
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={10 / 13}
        />,
        document.body
      )}
    </div>
  );
}
