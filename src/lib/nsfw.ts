/**
 * NSFW Content Detection usando nsfwjs
 * Configuración AFLOJADA para evitar falsos positivos
 */

import * as nsfwjs from 'nsfwjs';

// Threshold para detección (ajustable)
// 0.5 = MÁS ESTRICTO (más detecciones)
// 0.60 = EQUILIBRADO (recomendado)
// 0.85 = MÁS PERMISIVO (solo muy explícito)
export const NSFW_PORN_THRESHOLD = 0.60;

let model: nsfwjs.NSFWJS | null = null;

/**
 * Cargar modelo NSFW (solo una vez)
 */
export async function loadNSFWModel(): Promise<nsfwjs.NSFWJS> {
  if (model) return model;
  
  try {
    console.log('🤖 Cargando modelo NSFW...');
    model = await nsfwjs.load();
    console.log('✅ Modelo NSFW cargado');
    return model;
  } catch (err) {
    console.error('❌ Error cargando modelo NSFW:', err);
    throw err;
  }
}

/**
 * Analizar una imagen para detectar contenido NSFW
 * @param file - Archivo de imagen a analizar
 * @returns true si es segura, false si contiene contenido explícito
 */
export async function isImageSafe(file: File): Promise<{
  safe: boolean;
  reason?: string;
  scores?: any;
}> {
  try {
    // Cargar modelo si no está cargado
    const nsfwModel = await loadNSFWModel();
    
    // Crear elemento de imagen
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          // Analizar imagen
          const predictions = await nsfwModel.classify(img);
          
          // Limpiar URL
          URL.revokeObjectURL(imageUrl);
          
          // Convertir predictions a objeto
          const scores: any = {};
          predictions.forEach(pred => {
            scores[pred.className] = pred.probability;
          });
          
          console.log('🔍 NSFW Analysis:', scores);
          
          // Verificar si contiene contenido explícito
          const pornScore = scores['Porn'] || 0;
          
          if (pornScore > NSFW_PORN_THRESHOLD) {
            resolve({
              safe: false,
              reason: `Contenido explícito detectado (${(pornScore * 100).toFixed(0)}% de confianza)`,
              scores
            });
          } else {
            resolve({
              safe: true,
              scores
            });
          }
        } catch (err) {
          console.error('Error analizando imagen:', err);
          // En caso de error, permitir la imagen (fail-safe)
          resolve({ safe: true });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        // En caso de error, permitir la imagen (fail-safe)
        resolve({ safe: true });
      };
      
      img.src = imageUrl;
    });
  } catch (err) {
    console.error('Error en isImageSafe:', err);
    // En caso de error, permitir la imagen (fail-safe)
    return { safe: true };
  }
}

/**
 * Analizar múltiples imágenes
 * @param files - Array de archivos a analizar
 * @returns Array con resultados
 */
export async function analyzeImages(files: File[]): Promise<Array<{
  file: File;
  safe: boolean;
  reason?: string;
}>> {
  const results = [];
  
  for (const file of files) {
    const result = await isImageSafe(file);
    results.push({
      file,
      safe: result.safe,
      reason: result.reason
    });
  }
  
  return results;
}
