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
 * NOTA: La moderación ahora se hace en el CLIENTE (navegador)
 * Este endpoint solo recibe los resultados del análisis y los guarda en la BD
 */

/**
 * POST /api/moderate-photos
 * Endpoint simplificado: solo aprueba fotos de álbumes privados
 * Las fotos públicas se analizan en el CLIENTE (navegador) antes de subir
 */
export async function POST(request: NextRequest) {
  try {
    const { albumId } = await request.json();
    
    if (!albumId) {
      return NextResponse.json({ error: 'albumId es requerido' }, { status: 400 });
    }
    
    console.log(`🤖 Procesando álbum ${albumId}...`);
    
    // 1. Verificar que el álbum sea público
    const { data: album } = await supabase
      .from('albums')
      .select('privacy')
      .eq('id', albumId)
      .single();
    
    if (!album) {
      return NextResponse.json({ error: 'Álbum no encontrado' }, { status: 404 });
    }
    
    // Solo aprobar automáticamente álbumes privados/protegidos
    if (album.privacy !== 'publico') {
      console.log(`ℹ️ Álbum ${albumId} es privado/protegido - aprobando todas las fotos`);
      
      // Aprobar todas las fotos automáticamente
      await supabase
        .from('photos')
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
    
    // Para álbumes públicos, las fotos ya deberían estar analizadas en el cliente
    // Este endpoint solo confirma que están listas
    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId);
    
    const approved = photos?.filter(p => p.moderation_status === 'approved').length || 0;
    const rejected = photos?.filter(p => p.moderation_status === 'rejected').length || 0;
    const pending = photos?.filter(p => p.moderation_status === 'pending_review').length || 0;
    
    console.log(`✅ Álbum público ${albumId}: ${approved} aprobadas, ${rejected} rechazadas, ${pending} pendientes`);
    
    return NextResponse.json({ 
      success: true, 
      analyzed: photos?.length || 0,
      approved,
      rejected,
      pending,
    });
    
  } catch (err) {
    console.error('❌ Error en moderación:', err);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}
