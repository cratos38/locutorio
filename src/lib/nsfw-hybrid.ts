/**
 * Sistema Híbrido de Detección NSFW
 * ARQUITECTURA: 4 Capas independientes + puntuación combinada
 * 
 * Diseñado para ser 100% GRATUITO y ejecutar en navegador
 * 
 * CAPAS:
 * 1. Detección de piel (Skin Color Detection)
 * 2. Análisis NSFW.js mejorado (con lógica ponderada)
 * 3. Detección de formas/contornos (Shape Detection)
 * 4. Heurísticas contextuales (ilustraciones vs. fotos)
 * 
 * PUNTUACIÓN FINAL: Combinación ponderada de las 4 capas
 */

import * as nsfwjs from 'nsfwjs';

let model: nsfwjs.NSFWJS | null = null;

/**
 * Configuración de umbrales - Ajustable según feedback
 */
export const HYBRID_CONFIG = {
  // Capa 1: Detección de piel
  skinDetection: {
    enabled: true,
    thresholdPercentage: 40, // % de píxeles color piel para considerar sospechoso
    weight: 0.25 // Peso en puntuación final
  },
  
  // Capa 2: NSFW.js mejorado
  nsfwjs: {
    enabled: true,
    // Neutral debe ser significativamente mayor que NSFW para aprobar
    neutralMargin: 0.20, // Neutral debe superar maxNSFW en 20%
    pornThreshold: 0.60, // ⬇️ BAJADO de 0.75 a 0.60 (rechazar desnudos aprobados)
    weight: 0.50 // ⬆️ AUMENTADO de 0.40 a 0.50 (más peso a NSFW.js)
  },
  
  // Capa 3: Detección de formas
  shapeDetection: {
    enabled: true,
    suspiciousShapeThreshold: 0.30,
    weight: 0.10 // ⬇️ REDUCIDO de 0.20 a 0.10 (no discrimina bien)
  },
  
  // Capa 4: Heurísticas contextuales
  contextual: {
    enabled: true,
    drawingHentaiRule: true, // Ilustraciones requieren análisis adicional
    weight: 0.15 // Sin cambio por ahora
  },
  
  // Umbral final para rechazar (0-1)
  finalRejectThreshold: 0.65
};

/**
 * Cargar modelo NSFW
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
 * CAPA 1: Detección de piel mediante análisis de color
 */
function analyzeSkinContent(imageData: ImageData): {
  skinPercentage: number;
  suspiciousScore: number;
} {
  const data = imageData.data;
  let skinPixels = 0;
  const totalPixels = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Múltiples rangos de color piel (diferentes etnias)
    const isSkin = (
      // Tonos claros
      (r > 95 && g > 40 && b > 20 && 
       r > g && r > b && 
       Math.abs(r - g) > 15) ||
      // Tonos medios
      (r > 80 && g > 50 && b > 30 &&
       r > g && r > b) ||
      // Tonos oscuros
      (r > 60 && g > 40 && b > 20 &&
       r > g && r > b)
    );
    
    if (isSkin) skinPixels++;
  }
  
  const skinPercentage = (skinPixels / totalPixels) * 100;
  
  // Puntuar: 0% piel = 0.0, 40% piel = 0.5, 80%+ piel = 1.0
  const suspiciousScore = Math.min(skinPercentage / 80, 1.0);
  
  return { skinPercentage, suspiciousScore };
}

/**
 * CAPA 2: NSFW.js con lógica mejorada
 */
function analyzeNSFWScores(scores: any, skinPercentage: number): {
  decision: 'SAFE' | 'SUSPICIOUS' | 'UNSAFE';
  reason: string;
  suspiciousScore: number;
} {
  const pornScore = scores['Porn'] || 0;
  const sexyScore = scores['Sexy'] || 0;
  const hentaiScore = scores['Hentai'] || 0;
  const neutralScore = scores['Neutral'] || 0;
  const drawingScore = scores['Drawing'] || 0;
  
  // Calcular máximo NSFW
  const maxNSFW = Math.max(pornScore, sexyScore, hentaiScore);
  
  // REGLA ABSOLUTA: Porn muy alto
  if (pornScore > HYBRID_CONFIG.nsfwjs.pornThreshold) {
    return {
      decision: 'UNSAFE',
      reason: `Porn score muy alto: ${(pornScore * 100).toFixed(1)}%`,
      suspiciousScore: 1.0
    };
  }
  
  // 🆕 NUEVA REGLA: Combo Porn+Hentai alto
  if (pornScore + hentaiScore > 0.90) {
    return {
      decision: 'UNSAFE',
      reason: `Combo Porn+Hentai alto: ${(pornScore * 100).toFixed(1)}% + ${(hentaiScore * 100).toFixed(1)}% = ${((pornScore + hentaiScore) * 100).toFixed(1)}%`,
      suspiciousScore: 1.0
    };
  }
  
  // 🆕 NUEVA REGLA: Sexy muy alto PERO piel baja (fotos vestidas)
  // Si Sexy > 80% pero Piel < 35% y Porn < 25% → probablemente vestido sexy, no pornografía
  if (sexyScore > 0.80 && skinPercentage < 35 && pornScore < 0.25) {
    return {
      decision: 'SAFE',
      reason: `Sexy alto (${(sexyScore * 100).toFixed(1)}%) pero piel baja (${skinPercentage.toFixed(1)}%) → probablemente vestido`,
      suspiciousScore: sexyScore * 0.5 // Reducir peso de Sexy a la mitad
    };
  }
  
  // REGLA DE NEUTRAL: Neutral debe superar maxNSFW significativamente
  const neutralAdvantage = neutralScore - maxNSFW;
  if (neutralAdvantage > HYBRID_CONFIG.nsfwjs.neutralMargin) {
    return {
      decision: 'SAFE',
      reason: `Neutral domina (${(neutralScore * 100).toFixed(1)}% vs ${(maxNSFW * 100).toFixed(1)}%)`,
      suspiciousScore: maxNSFW // Usar maxNSFW como score
    };
  }
  
  // REGLA DE EMPATE: Si están parejos, consideramos sospechoso
  if (Math.abs(neutralScore - maxNSFW) < 0.10) {
    return {
      decision: 'SUSPICIOUS',
      reason: `Empate Neutral (${(neutralScore * 100).toFixed(1)}%) vs NSFW (${(maxNSFW * 100).toFixed(1)}%)`,
      suspiciousScore: 0.6
    };
  }
  
  // NSFW domina
  return {
    decision: 'UNSAFE',
    reason: `NSFW domina: Porn ${(pornScore * 100).toFixed(1)}%, Sexy ${(sexyScore * 100).toFixed(1)}%, Hentai ${(hentaiScore * 100).toFixed(1)}%`,
    suspiciousScore: maxNSFW
  };
}

/**
 * CAPA 3: Detección de formas/contornos
 * Simplificado: análisis de gradientes y áreas uniformes
 */
function analyzeShapes(imageData: ImageData): {
  suspiciousShapes: number;
  suspiciousScore: number;
} {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let largeUniformAreas = 0;
  let strongEdges = 0;
  
  // Análisis simplificado de uniformidad (regiones de piel grandes)
  for (let y = 0; y < height - 10; y += 10) {
    for (let x = 0; x < width - 10; x += 10) {
      const idx = (y * width + x) * 4;
      const idx2 = ((y + 10) * width + (x + 10)) * 4;
      
      // Comparar píxeles distantes
      const dr = Math.abs(data[idx] - data[idx2]);
      const dg = Math.abs(data[idx + 1] - data[idx2 + 1]);
      const db = Math.abs(data[idx + 2] - data[idx2 + 2]);
      
      // Área uniforme (posible piel)
      if (dr < 20 && dg < 20 && db < 20) {
        largeUniformAreas++;
      }
    }
  }
  
  const totalSamples = ((height / 10) * (width / 10));
  const uniformPercentage = (largeUniformAreas / totalSamples) * 100;
  
  // Puntuar: >30% áreas uniformes = sospechoso
  const suspiciousScore = Math.min(uniformPercentage / 60, 1.0);
  
  return {
    suspiciousShapes: uniformPercentage,
    suspiciousScore
  };
}

/**
 * CAPA 4: Heurísticas contextuales
 */
function analyzeContext(
  scores: any,
  skinPercentage: number
): {
  isDrawing: boolean;
  contextScore: number;
  reason: string;
} {
  const drawingScore = scores['Drawing'] || 0;
  const hentaiScore = scores['Hentai'] || 0;
  const sexyScore = scores['Sexy'] || 0;
  
  const isDrawing = drawingScore > 0.50;
  
  if (isDrawing) {
    // Ilustraciones: Aplicar reglas más estrictas
    if (hentaiScore > 0.25 || sexyScore > 0.90) {
      return {
        isDrawing: true,
        contextScore: 0.8,
        reason: `Ilustración con contenido sugestivo (Hentai: ${(hentaiScore * 100).toFixed(1)}%, Sexy: ${(sexyScore * 100).toFixed(1)}%)`
      };
    }
    
    // Ilustración normal
    return {
      isDrawing: true,
      contextScore: 0.2,
      reason: 'Ilustración normal sin contenido explícito'
    };
  }
  
  // Foto real: confiar más en detección de piel
  if (skinPercentage > 50) {
    return {
      isDrawing: false,
      contextScore: 0.7,
      reason: `Foto real con mucha piel visible (${skinPercentage.toFixed(1)}%)`
    };
  }
  
  return {
    isDrawing: false,
    contextScore: 0.1,
    reason: 'Foto real sin contenido sospechoso'
  };
}

/**
 * Función principal: Analizar imagen con sistema híbrido
 */
export async function analyzeImageHybrid(file: File): Promise<{
  safe: boolean;
  finalScore: number;
  reason: string;
  details: {
    layer1_skin: any;
    layer2_nsfwjs: any;
    layer3_shapes: any;
    layer4_context: any;
  };
}> {
  try {
    // Cargar modelo NSFW.js
    const nsfwModel = await loadNSFWModel();
    
    // Crear imagen y canvas
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const imageUrl = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          // Preparar canvas
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Obtener datos de píxeles
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // === CAPA 1: Detección de piel ===
          const skinAnalysis = HYBRID_CONFIG.skinDetection.enabled
            ? analyzeSkinContent(imageData)
            : { skinPercentage: 0, suspiciousScore: 0 };
          
          // === CAPA 2: NSFW.js ===
          const nsfwPredictions = await nsfwModel.classify(img);
          const nsfwScores: any = {};
          nsfwPredictions.forEach(pred => {
            nsfwScores[pred.className] = pred.probability;
          });
          
          const nsfwAnalysis = HYBRID_CONFIG.nsfwjs.enabled
            ? analyzeNSFWScores(nsfwScores, skinAnalysis.skinPercentage)
            : { decision: 'SAFE', reason: 'Desactivado', suspiciousScore: 0 };
          
          // === CAPA 3: Detección de formas ===
          const shapeAnalysis = HYBRID_CONFIG.shapeDetection.enabled
            ? analyzeShapes(imageData)
            : { suspiciousShapes: 0, suspiciousScore: 0 };
          
          // === CAPA 4: Heurísticas contextuales ===
          const contextAnalysis = HYBRID_CONFIG.contextual.enabled
            ? analyzeContext(nsfwScores, skinAnalysis.skinPercentage)
            : { isDrawing: false, contextScore: 0, reason: 'Desactivado' };
          
          // === CALCULAR PUNTUACIÓN FINAL ===
          const finalScore = (
            (skinAnalysis.suspiciousScore * HYBRID_CONFIG.skinDetection.weight) +
            (nsfwAnalysis.suspiciousScore * HYBRID_CONFIG.nsfwjs.weight) +
            (shapeAnalysis.suspiciousScore * HYBRID_CONFIG.shapeDetection.weight) +
            (contextAnalysis.contextScore * HYBRID_CONFIG.contextual.weight)
          );
          
          const safe = finalScore < HYBRID_CONFIG.finalRejectThreshold;
          
          // ====== LOGS SIMPLIFICADOS SIN PREVIEW ======
          console.log('🔬 === ANÁLISIS HÍBRIDO NSFW ===');
          
          console.log('📊 Capa 1 - Detección de Piel:', {
            skinPercentage: `${skinAnalysis.skinPercentage.toFixed(1)}%`,
            suspiciousScore: skinAnalysis.suspiciousScore.toFixed(3),
            weight: HYBRID_CONFIG.skinDetection.weight,
            contribution: (skinAnalysis.suspiciousScore * HYBRID_CONFIG.skinDetection.weight).toFixed(3)
          });
          console.log('🤖 Capa 2 - NSFW.js:', {
            scores: {
              Porn: `${((nsfwScores['Porn'] || 0) * 100).toFixed(1)}%`,
              Sexy: `${((nsfwScores['Sexy'] || 0) * 100).toFixed(1)}%`,
              Hentai: `${((nsfwScores['Hentai'] || 0) * 100).toFixed(1)}%`,
              Neutral: `${((nsfwScores['Neutral'] || 0) * 100).toFixed(1)}%`,
              Drawing: `${((nsfwScores['Drawing'] || 0) * 100).toFixed(1)}%`
            },
            decision: nsfwAnalysis.decision,
            reason: nsfwAnalysis.reason,
            suspiciousScore: nsfwAnalysis.suspiciousScore.toFixed(3),
            weight: HYBRID_CONFIG.nsfwjs.weight,
            contribution: (nsfwAnalysis.suspiciousScore * HYBRID_CONFIG.nsfwjs.weight).toFixed(3)
          });
          console.log('🔍 Capa 3 - Detección de Formas:', {
            suspiciousShapes: `${shapeAnalysis.suspiciousShapes.toFixed(1)}%`,
            suspiciousScore: shapeAnalysis.suspiciousScore.toFixed(3),
            weight: HYBRID_CONFIG.shapeDetection.weight,
            contribution: (shapeAnalysis.suspiciousScore * HYBRID_CONFIG.shapeDetection.weight).toFixed(3)
          });
          console.log('🎯 Capa 4 - Contexto:', {
            isDrawing: contextAnalysis.isDrawing,
            reason: contextAnalysis.reason,
            contextScore: contextAnalysis.contextScore.toFixed(3),
            weight: HYBRID_CONFIG.contextual.weight,
            contribution: (contextAnalysis.contextScore * HYBRID_CONFIG.contextual.weight).toFixed(3)
          });
          console.log('⚖️ RESULTADO FINAL:', {
            finalScore: finalScore.toFixed(3),
            threshold: HYBRID_CONFIG.finalRejectThreshold,
            decision: safe ? '✅ APROBADO' : '❌ RECHAZADO',
            breakdown: {
              skin: (skinAnalysis.suspiciousScore * HYBRID_CONFIG.skinDetection.weight).toFixed(3),
              nsfw: (nsfwAnalysis.suspiciousScore * HYBRID_CONFIG.nsfwjs.weight).toFixed(3),
              shapes: (shapeAnalysis.suspiciousScore * HYBRID_CONFIG.shapeDetection.weight).toFixed(3),
              context: (contextAnalysis.contextScore * HYBRID_CONFIG.contextual.weight).toFixed(3),
              total: finalScore.toFixed(3)
            }
          });
          
          // Limpiar
          URL.revokeObjectURL(imageUrl);
          
          // Construir razón detallada
          let reason = '';
          if (!safe) {
            reason = `Rechazado (score: ${finalScore.toFixed(2)}). `;
            reason += `Skin: ${skinAnalysis.skinPercentage.toFixed(1)}%, `;
            reason += `NSFW: ${nsfwAnalysis.reason}, `;
            reason += `Context: ${contextAnalysis.reason}`;
          } else {
            reason = `Aprobado (score: ${finalScore.toFixed(2)})`;
          }
          
          resolve({
            safe,
            finalScore,
            reason,
            details: {
              layer1_skin: skinAnalysis,
              layer2_nsfwjs: {
                scores: nsfwScores,
                decision: nsfwAnalysis.decision,
                reason: nsfwAnalysis.reason
              },
              layer3_shapes: shapeAnalysis,
              layer4_context: contextAnalysis
            }
          });
        } catch (err) {
          console.error('Error en análisis híbrido:', err);
          URL.revokeObjectURL(imageUrl);
          // Fail-safe: aprobar en caso de error
          resolve({
            safe: true,
            finalScore: 0,
            reason: 'Error en análisis - aprobado por defecto',
            details: {
              layer1_skin: {},
              layer2_nsfwjs: {},
              layer3_shapes: {},
              layer4_context: {}
            }
          });
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          safe: true,
          finalScore: 0,
          reason: 'Error cargando imagen - aprobado por defecto',
          details: {
            layer1_skin: {},
            layer2_nsfwjs: {},
            layer3_shapes: {},
            layer4_context: {}
          }
        });
      };
      
      img.src = imageUrl;
    });
  } catch (err) {
    console.error('Error en analyzeImageHybrid:', err);
    return {
      safe: true,
      finalScore: 0,
      reason: 'Error general - aprobado por defecto',
      details: {
        layer1_skin: {},
        layer2_nsfwjs: {},
        layer3_shapes: {},
        layer4_context: {}
      }
    };
  }
}

/**
 * Analizar múltiples imágenes
 */
export async function analyzeImagesHybrid(files: File[]): Promise<Array<{
  file: File;
  safe: boolean;
  finalScore: number;
  reason: string;
}>> {
  const results = [];
  
  console.log(`🚀 Iniciando análisis híbrido de ${files.length} imágenes...`);
  console.log(`═══════════════════════════════════════════════════════\n`);
  
  for (let i = 0; i < files.length; i++) {
    const photoNumber = i + 1;
    console.log(`\n╔══════════════════════════════════════════════════════╗`);
    console.log(`║  📷 FOTO #${photoNumber}/${files.length}: ${files[i].name.substring(0, 30)}...`);
    console.log(`╚══════════════════════════════════════════════════════╝`);
    
    const result = await analyzeImageHybrid(files[i]);
    results.push({
      file: files[i],
      safe: result.safe,
      finalScore: result.finalScore,
      reason: result.reason
    });
    
    // Resumen de la foto
    const statusIcon = result.safe ? '✅' : '❌';
    const statusText = result.safe ? 'APROBADA' : 'RECHAZADA';
    console.log(`\n${statusIcon} FOTO #${photoNumber}: ${statusText} (Score: ${result.finalScore.toFixed(3)})`);
    console.log(`═══════════════════════════════════════════════════════\n`);
  }
  
  console.log('\n\n🎉 ═══════════════════════════════════════════════════════');
  console.log('✅ ANÁLISIS COMPLETADO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 Aprobadas: ${results.filter(r => r.safe).length}`);
  console.log(`📊 Rechazadas: ${results.filter(r => !r.safe).length}`);
  
  // Crear tabla de resultados exportable
  console.log('\n\n📋 TABLA DE RESULTADOS (COPIABLE):');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let tableText = 'Foto#\tEstado\tScore\tNombre\n';
  tableText += '─────\t──────\t─────\t──────\n';
  
  results.forEach((r, i) => {
    const photoNumber = i + 1;
    const status = r.safe ? 'APROBADA' : 'RECHAZADA';
    const score = r.finalScore.toFixed(3);
    const name = r.file.name.substring(0, 30);
    tableText += `#${photoNumber}\t${status}\t${score}\t${name}\n`;
  });
  
  console.log(tableText);
  
  // Guardar en variable global para acceso fácil
  (window as any).nsfwResults = {
    total: results.length,
    approved: results.filter(r => r.safe).length,
    rejected: results.filter(r => !r.safe).length,
    details: results.map((r, i) => ({
      number: i + 1,
      name: r.file.name,
      safe: r.safe,
      score: r.finalScore,
      status: r.safe ? 'APROBADA' : 'RECHAZADA'
    })),
    tableText // Para copiar fácilmente
  };
  
  console.log('\n💾 Resultados guardados en: window.nsfwResults');
  console.log('📝 Para copiar tabla: copy(window.nsfwResults.tableText)');
  console.log('🔍 Ver rechazadas: window.nsfwResults.details.filter(d => !d.safe)');
  console.log('═══════════════════════════════════════════════════════\n\n');
  
  return results;
}
