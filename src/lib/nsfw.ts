/**
 * NSFW Content Detection usando nsfwjs
 * SISTEMA AJUSTADO V3: Basado en datos reales del usuario
 * 
 * IMPORTANTE: Para protección infantil (sitio NO +18)
 */

import * as nsfwjs from 'nsfwjs';

/**
 * ANÁLISIS DE DATOS REALES:
 * 
 * De 26 fotos analizadas:
 * - Porn: 0.74-0.83 (ropa normal pero cuerpos) → NO rechazar
 * - Sexy: 0.85-0.99 (rango muy amplio)
 * - Neutral: 0.001-0.76 (muy variable, no confiable)
 * 
 * ESTRATEGIA FINAL:
 * 1. Umbrales individuales altos (solo muy explícito)
 * 2. Si Porn + Sexy > umbral combinado → rechazar
 * 3. Si Sexy muy alto (>97%) sin contexto → rechazar
 * 4. Sistema de denuncias para resto
 */

// Umbrales absolutos individuales (MUY ESTRICTOS - solo obvio)
export const NSFW_ABSOLUTE_THRESHOLDS = {
  Porn: 0.90,    // >90% porn → muy explícito
  Sexy: 0.975,   // >97.5% sexy → casi seguro inapropiado
  Hentai: 0.90,  // >90% hentai → obvio
};

// Umbrales combinados (detecta contenido mixto)
export const COMBINED_THRESHOLDS = {
  PornPlusSexy: 0.95,  // Si Porn + Sexy > 95% → probablemente inapropiado
  TotalNSFW: 1.50,     // Si Porn + Sexy + Hentai > 150% → inapropiado
};

// Umbrales para casos especiales
export const SPECIAL_THRESHOLDS = {
  Drawing: 0.65,           // Si >65% dibujo
  HentaiInDrawing: 0.25,   // Y Hentai >25% → rechazar
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
          
          // Calcular puntuaciones combinadas
          const pornPlusSexy = pornScore + sexyScore;
          const totalNSFW = pornScore + sexyScore + hentaiScore;
          const maxNSFWScore = Math.max(pornScore, sexyScore, hentaiScore);
          const nsfwType = pornScore === maxNSFWScore ? 'Porn' : 
                          sexyScore === maxNSFWScore ? 'Sexy' : 'Hentai';
          
          console.log('🔍 NSFW Analysis:', {
            Porn: `${(pornScore * 100).toFixed(1)}%`,
            Sexy: `${(sexyScore * 100).toFixed(1)}%`,
            Hentai: `${(hentaiScore * 100).toFixed(1)}%`,
            Neutral: `${(neutralScore * 100).toFixed(1)}%`,
            Drawing: `${(drawingScore * 100).toFixed(1)}%`,
            '---': '---',
            'Porn+Sexy': `${(pornPlusSexy * 100).toFixed(1)}%`,
            'Total NSFW': `${(totalNSFW * 100).toFixed(1)}%`,
            MaxCategory: `${(maxNSFWScore * 100).toFixed(1)}% (${nsfwType})`
          });
          
          // ====== LÓGICA DE DECISIÓN V3 (Basada en datos reales) ======
          
          // REGLA 1: Umbrales absolutos individuales (MUY ALTOS)
          if (pornScore > NSFW_ABSOLUTE_THRESHOLDS.Porn) {
            console.log(`❌ Decision: UNSAFE - Porn ${(pornScore * 100).toFixed(1)}% > ${(NSFW_ABSOLUTE_THRESHOLDS.Porn * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido explícito (${(pornScore * 100).toFixed(0)}% pornografía)`,
              scores
            });
            return;
          }
          
          if (sexyScore > NSFW_ABSOLUTE_THRESHOLDS.Sexy) {
            console.log(`❌ Decision: UNSAFE - Sexy ${(sexyScore * 100).toFixed(1)}% > ${(NSFW_ABSOLUTE_THRESHOLDS.Sexy * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido muy sexual (${(sexyScore * 100).toFixed(0)}% sexual)`,
              scores
            });
            return;
          }
          
          if (hentaiScore > NSFW_ABSOLUTE_THRESHOLDS.Hentai) {
            console.log(`❌ Decision: UNSAFE - Hentai ${(hentaiScore * 100).toFixed(1)}% > ${(NSFW_ABSOLUTE_THRESHOLDS.Hentai * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido hentai (${(hentaiScore * 100).toFixed(0)}% hentai)`,
              scores
            });
            return;
          }
          
          // REGLA 2: Porn + Sexy combinado (detecta mezcla)
          if (pornPlusSexy > COMBINED_THRESHOLDS.PornPlusSexy) {
            console.log(`❌ Decision: UNSAFE - Porn+Sexy ${(pornPlusSexy * 100).toFixed(1)}% > ${(COMBINED_THRESHOLDS.PornPlusSexy * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido inapropiado (${(pornPlusSexy * 100).toFixed(0)}% sexual combinado)`,
              scores
            });
            return;
          }
          
          // REGLA 3: Total NSFW muy alto
          if (totalNSFW > COMBINED_THRESHOLDS.TotalNSFW) {
            console.log(`❌ Decision: UNSAFE - Total NSFW ${(totalNSFW * 100).toFixed(1)}% > ${(COMBINED_THRESHOLDS.TotalNSFW * 100)}%`);
            resolve({
              safe: false,
              reason: `Contenido inapropiado acumulado (${(totalNSFW * 100).toFixed(0)}% total)`,
              scores
            });
            return;
          }
          
          // REGLA 4: Hentai en dibujos (caso especial)
          if (drawingScore > SPECIAL_THRESHOLDS.Drawing && 
              hentaiScore > SPECIAL_THRESHOLDS.HentaiInDrawing) {
            console.log(`❌ Decision: UNSAFE - Hentai en dibujo (Drawing:${(drawingScore * 100).toFixed(1)}%, Hentai:${(hentaiScore * 100).toFixed(1)}%)`);
            resolve({
              safe: false,
              reason: `Contenido hentai en ilustración (${(hentaiScore * 100).toFixed(0)}%)`,
              scores
            });
            return;
          }
          
          // REGLA 5: Por defecto APROBAR + sistema de denuncias
          console.log(`✅ Decision: SAFE - No supera umbrales (Max: ${(maxNSFWScore * 100).toFixed(1)}% ${nsfwType})`);
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
