/**
 * NSFW Content Detection usando nsfwjs
 * ESTRATEGIA FINAL: Solo bloquear PORN alto + Sistema de Denuncias
 * 
 * IMPORTANTE: Para protección infantil (sitio NO +18)
 */

import * as nsfwjs from 'nsfwjs';

/**
 * CONCLUSIONES FINALES:
 * 
 * 1. "Sexy" NO es pornografía → NO rechazar por Sexy
 *    - Mujer linda vestida = Sexy ✅
 *    - Mujer con ropa ajustada = Sexy ✅
 *    - Sexy es SUBJETIVO y cultural
 * 
 * 2. NSFW.js es INCONSISTENTE:
 *    - Misma mujer, mismo vestido:
 *      * Espalda (nalgas visibles) → PASA
 *      * Frente (nada visible) → RECHAZADA
 *    - NO se puede confiar 100%
 * 
 * 3. Sin recursos para moderación humana:
 *    - Sin dinero para moderadores
 *    - Sin tiempo para revisión manual
 *    - Solución: Filtro BÁSICO + Denuncias
 * 
 * ESTRATEGIA FINAL:
 * - Solo bloquear Porn MUY alto (>85%)
 * - Ignorar Sexy (es subjetivo)
 * - Hentai en dibujos (caso especial)
 * - Denuncias de usuarios para el resto
 */

// Umbrales SOLO para contenido obviamente pornográfico
export const NSFW_THRESHOLDS = {
  Porn: 0.85,    // >85% = muy probablemente pornografía explícita
  Hentai: 0.80,  // >80% = hentai (solo en dibujos)
};

// Casos especiales
export const SPECIAL_THRESHOLDS = {
  Drawing: 0.60,           // Si >60% dibujo
  HentaiInDrawing: 0.30,   // Y Hentai >30% → probablemente hentai
};

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
          
          console.log('🔍 NSFW Analysis:', {
            Porn: `${(pornScore * 100).toFixed(1)}%`,
            Sexy: `${(sexyScore * 100).toFixed(1)}%`,
            Hentai: `${(hentaiScore * 100).toFixed(1)}%`,
            Neutral: `${(neutralScore * 100).toFixed(1)}%`,
            Drawing: `${(drawingScore * 100).toFixed(1)}%`,
          });
          
          // ====== LÓGICA SIMPLIFICADA ======
          
          // REGLA 1: Solo rechazar Porn MUY alto
          if (pornScore > NSFW_THRESHOLDS.Porn) {
            console.log(`❌ RECHAZADO: Porn ${(pornScore * 100).toFixed(1)}% > ${(NSFW_THRESHOLDS.Porn * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido pornográfico detectado (${(pornScore * 100).toFixed(0)}%)`,
              scores
            });
            return;
          }
          
          // REGLA 2: Hentai en dibujos (caso especial)
          if (drawingScore > SPECIAL_THRESHOLDS.Drawing && 
              hentaiScore > SPECIAL_THRESHOLDS.HentaiInDrawing) {
            console.log(`❌ RECHAZADO: Hentai en dibujo (Drawing:${(drawingScore * 100).toFixed(1)}%, Hentai:${(hentaiScore * 100).toFixed(1)}%)`);
            resolve({
              safe: false,
              reason: `Contenido hentai detectado (${(hentaiScore * 100).toFixed(0)}%)`,
              scores
            });
            return;
          }
          
          // REGLA 3: Por defecto APROBAR
          // Sexy NO se considera (es subjetivo)
          // Sistema de denuncias maneja el resto
          console.log(`✅ APROBADO: Porn ${(pornScore * 100).toFixed(1)}% < ${(NSFW_THRESHOLDS.Porn * 100)}%`);
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
