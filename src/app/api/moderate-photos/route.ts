import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase con permisos de admin (necesita SERVICE_ROLE_KEY)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Threshold para moderación (ajustable)
const NSFW_THRESHOLDS = {
  Porn: 0.60,   // Pornografía explícita (bajado de 0.85)
  Sexy: 0.75,   // Contenido sugestivo
  Hentai: 0.70, // Dibujos explícitos
};

/**
 * Analizar imagen con NSFW.js
 * Nota: Esta función se ejecuta en Node.js (servidor), no en navegador
 */
async function analyzeImageServer(imageUrl: string): Promise<{
  safe: boolean;
  reason?: string;
  score?: number;
}> {
  try {
    // Importar nsfwjs y tensorflow (solo en servidor)
    const nsfwjs = await import('nsfwjs');
    const tf = await import('@tensorflow/tfjs-node');
    
    // Cargar modelo
    const model = await nsfwjs.load();
    
    // Descargar imagen
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Decodificar imagen
    const imageTensor = tf.node.decodeImage(buffer, 3);
    
    // Clasificar
    const predictions = await model.classify(imageTensor as any);
    
    // Limpiar tensor
    imageTensor.dispose();
    
    // Convertir predictions a objeto
    const scores: Record<string, number> = {};
    predictions.forEach(pred => {
      scores[pred.className] = pred.probability;
    });
    
    console.log('🔍 NSFW Analysis:', scores);
    
    // Verificar si contiene contenido explícito
    const pornScore = scores['Porn'] || 0;
    const sexyScore = scores['Sexy'] || 0;
    const hentaiScore = scores['Hentai'] || 0;
    
    if (pornScore > NSFW_THRESHOLDS.Porn) {
      return {
        safe: false,
        reason: `Contenido explícito detectado (${(pornScore * 100).toFixed(0)}% de confianza)`,
        score: pornScore,
      };
    }
    
    if (sexyScore > NSFW_THRESHOLDS.Sexy) {
      return {
        safe: false,
        reason: `Contenido sugestivo detectado (${(sexyScore * 100).toFixed(0)}% de confianza)`,
        score: sexyScore,
      };
    }
    
    if (hentaiScore > NSFW_THRESHOLDS.Hentai) {
      return {
        safe: false,
        reason: `Contenido inapropiado detectado (${(hentaiScore * 100).toFixed(0)}% de confianza)`,
        score: hentaiScore,
      };
    }
    
    return {
      safe: true,
      score: Math.max(pornScore, sexyScore, hentaiScore),
    };
    
  } catch (err) {
    console.error('❌ Error analizando imagen:', err);
    // En caso de error, aprobar por defecto (fail-safe)
    return { safe: true };
  }
}

/**
 * POST /api/moderate-photos
 * Moderar fotos de un álbum en background
 */
export async function POST(request: NextRequest) {
  try {
    const { albumId } = await request.json();
    
    if (!albumId) {
      return NextResponse.json({ error: 'albumId es requerido' }, { status: 400 });
    }
    
    console.log(`🤖 Bot iniciando moderación de álbum ${albumId}...`);
    
    // 1. Verificar que el álbum sea público
    const { data: album } = await supabase
      .from('albums')
      .select('privacy')
      .eq('id', albumId)
      .single();
    
    if (!album) {
      return NextResponse.json({ error: 'Álbum no encontrado' }, { status: 404 });
    }
    
    // Solo moderar álbumes públicos
    if (album.privacy !== 'publico') {
      console.log(`ℹ️ Álbum ${albumId} es privado/protegido - sin moderación`);
      
      // Aprobar todas las fotos automáticamente
      await supabase
        .from('album_photos')
        .update({
          moderation_status: 'approved',
          moderation_reason: 'Álbum privado/protegido - sin moderación',
          moderation_date: new Date().toISOString(),
        })
        .eq('album_id', albumId)
        .eq('moderation_status', 'pending_review');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Álbum privado - todas las fotos aprobadas',
      });
    }
    
    // 2. Obtener fotos pendientes
    const { data: photos, error: fetchError } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', albumId)
      .eq('moderation_status', 'pending_review');
    
    if (fetchError) {
      console.error('❌ Error obteniendo fotos:', fetchError);
      return NextResponse.json({ error: 'Error obteniendo fotos' }, { status: 500 });
    }
    
    if (!photos || photos.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No hay fotos pendientes de moderación',
      });
    }
    
    console.log(`📋 Analizando ${photos.length} foto(s)...`);
    
    let approved = 0;
    let rejected = 0;
    
    // 3. Analizar cada foto (una por una, en background)
    for (const photo of photos) {
      try {
        console.log(`🔍 Analizando foto ${photo.id}...`);
        
        // Analizar con NSFW.js
        const result = await analyzeImageServer(photo.url);
        
        // Decidir estado
        const status = result.safe ? 'approved' : 'rejected';
        
        if (status === 'approved') {
          approved++;
        } else {
          rejected++;
        }
        
        // Actualizar BD
        const { error: updateError } = await supabase
          .from('album_photos')
          .update({
            moderation_status: status,
            moderation_reason: result.reason || null,
            moderation_score: result.score || 0,
            moderation_date: new Date().toISOString(),
          })
          .eq('id', photo.id);
        
        if (updateError) {
          console.error(`❌ Error actualizando foto ${photo.id}:`, updateError);
        } else {
          console.log(`${status === 'approved' ? '✅' : '❌'} Foto ${photo.id}: ${status}`);
        }
        
      } catch (err) {
        console.error(`❌ Error analizando foto ${photo.id}:`, err);
        // Si hay error, aprobar por defecto (fail-safe)
        await supabase
          .from('album_photos')
          .update({ 
            moderation_status: 'approved',
            moderation_reason: 'Error en análisis - aprobado por defecto',
            moderation_date: new Date().toISOString(),
          })
          .eq('id', photo.id);
        approved++;
      }
    }
    
    console.log(`✅ Moderación completada: ${approved} aprobadas, ${rejected} rechazadas`);
    
    return NextResponse.json({ 
      success: true, 
      analyzed: photos.length,
      approved,
      rejected,
    });
    
  } catch (err) {
    console.error('❌ Error en moderación:', err);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}
