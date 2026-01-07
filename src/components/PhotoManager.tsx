"use client";

import { useState, useEffect } from "react";
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
    <div className="space-y-3">
      {/* =================== FOTO PRINCIPAL =================== */}
      <div 
        className="relative rounded-xl overflow-hidden bg-connect-bg-dark border border-connect-border cursor-pointer"
        style={{ aspectRatio: '10/13' }}
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
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
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
              className="bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 py-2 rounded-lg text-center text-xs transition-all"
            >
              📤
            </button>
            
            {/* Eliminar */}
            <button
              onClick={handleDeletePhoto}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-center text-xs transition-all"
              disabled={photos.length === 0}
            >
              🗑️
            </button>
            
            {/* Marcar como principal */}
            <button
              onClick={handleSetPrincipal}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 py-2 rounded-lg text-center text-xs transition-all"
              disabled={photos.length === 0 || photos[currentPhotoIndex]?.esPrincipal}
            >
              ⭐
            </button>
          </div>

          {/* Configuración del carrusel */}
          {showCarousel && photos.length > 1 && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-neon-green/20">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={carouselEnabled}
                  onChange={(e) => onCarouselChange?.({
                    enabled: e.target.checked,
                    intervalType: carouselIntervalType,
                    intervalValue: carouselIntervalValue,
                  })}
                  className="w-4 h-4 rounded border-gray-600 text-neon-green focus:ring-neon-green focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">
                  🎠 Cambiar foto principal automáticamente
                </span>
              </label>
              
              {carouselEnabled && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={carouselIntervalValue}
                      onChange={(e) => onCarouselChange?.({
                        enabled: carouselEnabled,
                        intervalType: carouselIntervalType,
                        intervalValue: Math.max(1, parseInt(e.target.value) || 1),
                      })}
                      className="flex-1 px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                      onFocus={(e) => e.target.select()}
                    />
                    <select
                      value={carouselIntervalType}
                      onChange={(e) => onCarouselChange?.({
                        enabled: carouselEnabled,
                        intervalType: e.target.value as 'minutes' | 'hours' | 'days',
                        intervalValue: carouselIntervalValue,
                      })}
                      className="px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white text-sm focus:border-neon-green focus:ring-1 focus:ring-neon-green"
                    >
                      <option value="minutes">minutos</option>
                      <option value="hours">horas</option>
                      <option value="days">días</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">
                    La foto principal rotará cada {carouselIntervalValue}{' '}
                    {carouselIntervalType === 'minutes' ? 'minuto(s)' : 
                     carouselIntervalType === 'hours' ? 'hora(s)' : 'día(s)'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* =================== IMAGE CROPPER MODAL =================== */}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={10 / 13}
        />
      )}
    </div>
  );
}
