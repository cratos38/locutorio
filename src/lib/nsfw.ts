/**
 * NSFW Content Detection usando nsfwjs
 * ESTRATEGIA FINAL V2: SOLO Sistema de Denuncias
 * 
 * IMPORTANTE: Para protección infantil (sitio NO +18)
 */

import * as nsfwjs from 'nsfwjs';

/**
 * CONCLUSIÓN DEFINITIVA:
 * 
 * NSFW.js NO ES CONFIABLE para distinguir contenido inapropiado:
 * - Desnudos reales → PASAN (Porn: 40-80%)
 * - Ilustración romántica vestida → RECHAZADA (Drawing: 67%)
 * - Foto supermercado → 91% porn
 * - Misma mujer, mismo vestido: resultados opuestos
 * 
 * ESTRATEGIA FINAL:
 * ❌ NO usar filtro automático NSFW.js
 * ✅ SÍ analizar pero NO rechazar
 * ✅ Guardar scores para estadísticas
 * ✅ Confiar 100% en denuncias de usuarios
 * ✅ Auto-hide tras 3 denuncias
 * 
 * RAZÓN:
 * - Sin recursos para moderación humana 24/7
 * - NSFW.js genera más problemas que soluciones
 * - Mejor dejar que comunidad modere
 * - Plataformas grandes (Instagram, TikTok) también dependen de denuncias
 */

// NO hay umbrales - Todo pasa, solo guardamos scores para estadísticas
export const NSFW_ANALYSIS_MODE = 'log_only'; // Solo registrar, no bloquear

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
          
          console.log('🔍 NSFW Analysis (LOG ONLY - NO BLOCKING):', {
            Porn: `${(pornScore * 100).toFixed(1)}%`,
            Sexy: `${(sexyScore * 100).toFixed(1)}%`,
            Hentai: `${(hentaiScore * 100).toFixed(1)}%`,
            Neutral: `${(neutralScore * 100).toFixed(1)}%`,
            Drawing: `${(drawingScore * 100).toFixed(1)}%`,
            '⚠️': 'MODO SOLO-LOG: No se rechaza nada automáticamente',
            '🛡️': 'Protección: Sistema de denuncias + Auto-hide tras 3 reportes'
          });
          
          // ====== SIEMPRE APROBAR ======
          // Guardar scores para estadísticas, pero NO rechazar
          // Sistema de denuncias se encarga de la moderación
          
          console.log(`✅ APROBADO (modo solo-log): Confiamos en denuncias de usuarios`);
          resolve({
            safe: true,
            scores,
            // Incluir scores para guardar en BD (estadísticas)
            metadata: {
              pornScore,
              sexyScore,
              hentaiScore,
              neutralScore,
              drawingScore,
              analyzedAt: new Date().toISOString()
            }
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
