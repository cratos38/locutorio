"use client";

import { useState, useEffect } from "react";

/**
 * =============================================================================
 * PhotoGallery - La "Pantalla del TV"
 * =============================================================================
 * 
 * PROPÓSITO:
 * Este componente es SOLO la visualización de fotos, sin controles ni marcos.
 * Es como la pantalla de un televisor que muestra el contenido.
 * 
 * ANALOGÍA DEL TV:
 * - PhotoGallery = Pantalla del TV (solo muestra imagen)
 * - PhotoManager = TV completo (pantalla + marco + controles remotos)
 * 
 * QUÉ MUESTRA:
 * - ✅ Foto actual en ratio 10:13
 * - ✅ Badges de estado (⭐ principal, 🕐 pendiente, ✅ aprobada, ❌ rechazada)
 * - ✅ Navegación con flechas (‹ ›) si hay múltiples fotos
 * - ✅ Contador "Foto X de Y"
 * 
 * QUÉ NO TIENE:
 * - ❌ Tarjeta contenedora (sin borde, sin fondo, sin padding)
 * - ❌ Botones de acción (Subir, Eliminar, Principal)
 * - ❌ Controles de carrusel
 * - ❌ Editor de recorte
 * 
 * USO:
 * - publicprofile: usa SOLO este componente (pantalla sin marco)
 * - create-profile, userprofile, mi-espacio: usan PhotoManager completo
 * 
 * PROPS:
 * - photos: array de fotos a mostrar
 * - currentIndex: índice de la foto actual
 * - onIndexChange: callback cuando cambia el índice
 * - onClick: callback al hacer click en la foto (opcional)
 * =============================================================================
 */

// =================== TIPOS ===================
export interface Photo {
  id: string;
  url: string; // URL original (1024px) para ver completa
  url_medium?: string; // URL medium (400px) para galería
  url_thumbnail?: string; // URL thumbnail (96px) para miniatura
  esPrincipal: boolean;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  rejection_reason?: string | null; // Motivo de rechazo del ML Validator
}

interface PhotoGalleryProps {
  photos: Photo[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  onClick?: () => void;
  className?: string; // Para permitir estilos adicionales desde fuera
}

// =================== COMPONENTE ===================
export default function PhotoGallery({
  photos,
  currentIndex = 0,
  onIndexChange,
  onClick,
  className = "",
}: PhotoGalleryProps) {
  const [localIndex, setLocalIndex] = useState(currentIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Usar índice controlado o local
  const activeIndex = onIndexChange ? currentIndex : localIndex;
  
  // Reset loading state cuando cambia la foto
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [activeIndex, photos]);
  
  // =================== HANDLERS DE NAVEGACIÓN ===================
  /**
   * Navegar a la foto anterior
   * Si está en la primera, va a la última (comportamiento circular)
   */
  const handlePrev = () => {
    const newIndex = activeIndex === 0 ? photos.length - 1 : activeIndex - 1;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setLocalIndex(newIndex);
    }
  };

  /**
   * Navegar a la foto siguiente
   * Si está en la última, va a la primera (comportamiento circular)
   */
  const handleNext = () => {
    const newIndex = activeIndex === photos.length - 1 ? 0 : activeIndex + 1;
    if (onIndexChange) {
      onIndexChange(newIndex);
    } else {
      setLocalIndex(newIndex);
    }
  };

  // =================== RENDER ===================
  // Si no hay fotos, mostrar placeholder
  if (photos.length === 0) {
    return (
      <div 
        className={`relative w-full rounded-xl overflow-hidden bg-connect-bg-dark/30 border-2 border-dashed border-connect-border flex items-center justify-center ${className}`}
        style={{ aspectRatio: '10/13' }}
      >
        <div className="text-center p-8">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-400 text-sm">Sin fotos</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[activeIndex];

  return (
    <div 
      className={`relative w-full rounded-xl overflow-hidden shadow-2xl cursor-pointer group ${className}`}
      style={{ aspectRatio: '10/13' }}
      onClick={onClick}
    >
      {/* =================== FOTO ACTUAL =================== */}
      {/**
        * Usa url_medium (400px) para mostrar en galería
        * Si no existe, usa url (original)
        */}
      
      {/* Skeleton/placeholder mientras carga la imagen */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-connect-bg-dark/50 animate-pulse flex items-center justify-center">
          <div className="text-4xl">📸</div>
        </div>
      )}
      
      {/* Imagen real */}
      <img 
        src={currentPhoto.url_medium || currentPhoto.url} 
        alt={`Foto ${activeIndex + 1} de ${photos.length}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setImageLoaded(true);
        }}
      />
      
      {/* Mostrar placeholder si falla la carga */}
      {imageError && (
        <div className="absolute inset-0 bg-connect-bg-dark/50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-gray-400 text-sm">Error al cargar imagen</p>
          </div>
        </div>
      )}
      
      {/* =================== BADGES DE ESTADO =================== */}
      {/**
        * Badges en esquina superior derecha que indican:
        * - ⭐ Esta es la foto principal
        * - 🕐 Foto pendiente de aprobación
        * - ✅ Foto aprobada
        * - ❌ Foto rechazada
        */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {currentPhoto.estado === 'pendiente' && (
          <span className="bg-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            🕐
          </span>
        )}
        {currentPhoto.estado === 'aprobada' && (
          <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            ✅
          </span>
        )}
        {currentPhoto.estado === 'rechazada' && (
          <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            ❌
          </span>
        )}
        {currentPhoto.esPrincipal && (
          <span className="bg-neon-green/90 backdrop-blur-sm text-forest-dark text-xs px-2 py-1 rounded-full font-bold">
            ⭐
          </span>
        )}
      </div>
      
      {/* =================== NAVEGACIÓN (FLECHAS) =================== */}
      {/**
        * Flechas para navegar entre fotos
        * Solo se muestran si hay más de una foto
        * Comportamiento circular: última ← → primera
        */}
      {photos.length > 1 && (
        <>
          {/* Flecha izquierda (foto anterior) */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evitar que se dispare el onClick del contenedor
              handlePrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm z-10"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          
          {/* Flecha derecha (foto siguiente) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm z-10"
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </>
      )}
      
      {/* =================== CONTADOR DE FOTOS =================== */}
      {/**
        * Muestra "Foto X de Y" en la parte inferior central
        * Ejemplo: "Foto 2 de 5"
        */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
        Foto {activeIndex + 1} de {photos.length}
      </div>
    </div>
  );
}
