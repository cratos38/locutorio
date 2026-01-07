"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel,
  aspectRatio = 10 / 13 // Ratio por defecto 10:13
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: any) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async () => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Establecer tamaño del canvas al área recortada
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Dibujar la imagen recortada
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convertir canvas a blob y luego a URL
      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(croppedImageUrl);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error al recortar imagen:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="bg-connect-bg-dark/80 backdrop-blur-md border-b border-connect-border p-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Ajustar foto de perfil</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-connect-border text-gray-300 hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button
            onClick={createCroppedImage}
            className="bg-neon-green text-connect-bg-dark font-bold hover:brightness-110"
          >
            ✓ Listo
          </Button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          style={{
            containerStyle: {
              backgroundColor: '#0a0a0a',
            },
            cropAreaStyle: {
              border: '2px solid #2bee79',
              boxShadow: '0 0 20px rgba(43, 238, 121, 0.5)',
            },
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-connect-bg-dark/80 backdrop-blur-md border-t border-connect-border p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Zoom slider */}
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-connect-border rounded-lg appearance-none cursor-pointer accent-neon-green"
            />
          </div>

          {/* Instrucciones */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>💡 <strong>Arrastra</strong> la imagen para moverla</p>
            <p>💡 <strong>Usa el slider</strong> o <strong>rueda del ratón</strong> para hacer zoom</p>
            <p>💡 El área verde es lo que se verá en tu perfil</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function para cargar imagen
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}
