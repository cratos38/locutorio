/**
 * NSFW Content Detection usando nsfwjs
 * SISTEMA INTELIGENTE: Compara categorías entre sí
 * 
 * IMPORTANTE: Para protección infantil (sitio NO +18)
 */

import * as nsfwjs from 'nsfwjs';

/**
 * NUEVO ALGORITMO INTELIGENTE:
 * 
 * No solo miramos si Porn > umbral, sino que comparamos:
 * - Si Neutral > Porn/Sexy/Hentai → APROBAR ✅
 * - Si Porn/Sexy/Hentai > Neutral → RECHAZAR ❌
 * 
 * Ejemplo:
 * ✅ Porn:0.74, Neutral:0.90 → APROBAR (neutral gana)
 * ❌ Porn:0.85, Neutral:0.10 → RECHAZAR (porno gana)
 */

// Umbrales mínimos absolutos (solo para casos obvios)
export const NSFW_ABSOLUTE_THRESHOLDS = {
  Porn: 0.90,   // >90% = obviamente porno
  Sexy: 0.95,   // >95% = obviamente sexual
  Hentai: 0.90, // >90% = obviamente hentai
};

// Margen de diferencia para comparación relativa
export const NEUTRAL_MARGIN = 0.15; // Neutral debe ganar por al menos 15%

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
          
          // Extraer puntuaciones
          const pornScore = scores['Porn'] || 0;
          const sexyScore = scores['Sexy'] || 0;
          const hentaiScore = scores['Hentai'] || 0;
          const neutralScore = scores['Neutral'] || 0;
          const drawingScore = scores['Drawing'] || 0;
          
          // Calcular puntuación máxima de contenido inapropiado
          const maxNSFWScore = Math.max(pornScore, sexyScore, hentaiScore);
          const nsfwType = pornScore === maxNSFWScore ? 'Porn' : 
                          sexyScore === maxNSFWScore ? 'Sexy' : 'Hentai';
          
          console.log('🔍 NSFW Analysis:', {
            Neutral: `${(neutralScore * 100).toFixed(1)}%`,
            Porn: `${(pornScore * 100).toFixed(1)}%`,
            Sexy: `${(sexyScore * 100).toFixed(1)}%`,
            Hentai: `${(hentaiScore * 100).toFixed(1)}%`,
            Drawing: `${(drawingScore * 100).toFixed(1)}%`,
            '---': '---',
            MaxNSFW: `${(maxNSFWScore * 100).toFixed(1)}% (${nsfwType})`,
            Decision: neutralScore > maxNSFWScore + NEUTRAL_MARGIN ? '✅ SAFE' : 
                     maxNSFWScore > NSFW_ABSOLUTE_THRESHOLDS[nsfwType as keyof typeof NSFW_ABSOLUTE_THRESHOLDS] ? '❌ UNSAFE (Absoluto)' :
                     maxNSFWScore > neutralScore ? '❌ UNSAFE (Relativo)' : '✅ SAFE'
          });
          
          // REGLA 1: Si cualquier categoría NSFW supera umbral absoluto → RECHAZAR
          if (pornScore > NSFW_ABSOLUTE_THRESHOLDS.Porn) {
            resolve({
              safe: false,
              reason: `Contenido explícito detectado (${(pornScore * 100).toFixed(0)}% pornografía - ABSOLUTO)`,
              scores
            });
            return;
          }
          
          if (sexyScore > NSFW_ABSOLUTE_THRESHOLDS.Sexy) {
            resolve({
              safe: false,
              reason: `Contenido sexual detectado (${(sexyScore * 100).toFixed(0)}% sexual - ABSOLUTO)`,
              scores
            });
            return;
          }
          
          if (hentaiScore > NSFW_ABSOLUTE_THRESHOLDS.Hentai) {
            resolve({
              safe: false,
              reason: `Contenido inapropiado detectado (${(hentaiScore * 100).toFixed(0)}% hentai - ABSOLUTO)`,
              scores
            });
            return;
          }
          
          // REGLA 2: Comparación relativa - Neutral debe ganar por margen
          if (neutralScore > maxNSFWScore + NEUTRAL_MARGIN) {
            // Neutral gana claramente → APROBAR
            resolve({
              safe: true,
              scores
            });
            return;
          }
          
          // REGLA 3: Si NSFW supera a Neutral → RECHAZAR
          if (maxNSFWScore > neutralScore) {
            resolve({
              safe: false,
              reason: `Contenido inapropiado (${nsfwType}: ${(maxNSFWScore * 100).toFixed(0)}% vs Neutral: ${(neutralScore * 100).toFixed(0)}%)`,
              scores
            });
            return;
          }
          
          // REGLA 4: Por defecto, si están muy cerca, aprobar (beneficio de la duda)
          resolve({
            safe: true,
            scores
          });
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
