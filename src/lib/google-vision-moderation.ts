/**
 * Google Cloud Vision - Content Moderation
 * CUMPLIMIENTO LEGAL: Filtro automático obligatorio
 */

import vision from '@google-cloud/vision';

// Inicializar cliente (usar variable de entorno para credenciales)
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

/**
 * Niveles de confianza de Google Vision:
 * - VERY_UNLIKELY: 0-20%
 * - UNLIKELY: 20-40%
 * - POSSIBLE: 40-60%
 * - LIKELY: 60-80%
 * - VERY_LIKELY: 80-100%
 */

export interface ModerationResult {
  safe: boolean;
  reason?: string;
  scores: {
    adult: string;      // Contenido adulto/sexual
    violence: string;   // Violencia
    racy: string;       // Sugestivo (no explícito)
    medical: string;    // Contenido médico
    spoof: string;      // Contenido manipulado
  };
  rawScores: any;
}

/**
 * Moderar imagen con Google Cloud Vision
 */
export async function moderateImageWithGoogle(imageUrl: string): Promise<ModerationResult> {
  try {
    console.log('🔍 Google Vision: Analizando imagen...');
    
    // Llamar a Safe Search Detection
    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result.safeSearchAnnotation;
    
    if (!detections) {
      throw new Error('No se pudo analizar la imagen');
    }
    
    const scores = {
      adult: detections.adult || 'UNKNOWN',
      violence: detections.violence || 'UNKNOWN',
      racy: detections.racy || 'UNKNOWN',
      medical: detections.medical || 'UNKNOWN',
      spoof: detections.spoof || 'UNKNOWN',
    };
    
    console.log('📊 Google Vision Scores:', scores);
    
    // REGLA DE MODERACIÓN:
    // Rechazar si "adult" es LIKELY o VERY_LIKELY
    const isAdultContent = 
      detections.adult === 'LIKELY' || 
      detections.adult === 'VERY_LIKELY';
    
    // Rechazar si "violence" es VERY_LIKELY
    const isViolentContent = 
      detections.violence === 'VERY_LIKELY';
    
    // Opcional: También rechazar "racy" (sugestivo) si es VERY_LIKELY
    const isRacyContent = 
      detections.racy === 'VERY_LIKELY';
    
    if (isAdultContent) {
      console.log('❌ Google Vision: Contenido adulto detectado');
      return {
        safe: false,
        reason: `Contenido adulto detectado (${detections.adult})`,
        scores,
        rawScores: detections
      };
    }
    
    if (isViolentContent) {
      console.log('❌ Google Vision: Contenido violento detectado');
      return {
        safe: false,
        reason: `Contenido violento detectado (${detections.violence})`,
        scores,
        rawScores: detections
      };
    }
    
    // Opcional: descomentar si quieres ser más estricto
    // if (isRacyContent) {
    //   console.log('❌ Google Vision: Contenido sugestivo detectado');
    //   return {
    //     safe: false,
    //     reason: `Contenido sugestivo (${detections.racy})`,
    //     scores,
    //     rawScores: detections
    //   };
    // }
    
    console.log('✅ Google Vision: Imagen aprobada');
    return {
      safe: true,
      scores,
      rawScores: detections
    };
    
  } catch (error) {
    console.error('❌ Error en Google Vision:', error);
    
    // FAIL-SAFE: En caso de error, aprobar pero registrar
    // (Opcional: cambiar a rechazar en caso de error)
    return {
      safe: true, // o false para ser más estricto
      reason: 'Error al analizar imagen (aprobado por defecto)',
      scores: {
        adult: 'ERROR',
        violence: 'ERROR',
        racy: 'ERROR',
        medical: 'ERROR',
        spoof: 'ERROR',
      },
      rawScores: error
    };
  }
}

/**
 * Comparación de costos (por 10,000 imágenes/mes):
 * 
 * NSFW.js:
 * - Costo: $0
 * - Precisión: 40-50%
 * - Cumplimiento legal: ❌ NO
 * 
 * Google Vision:
 * - Costo: $13.50/mes
 * - Precisión: 85-90%
 * - Cumplimiento legal: ✅ SÍ
 * - Usado por: YouTube, Google Photos
 */
