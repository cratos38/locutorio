import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const runtime = 'nodejs';

// Cliente admin de Supabase
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * Descarga una imagen desde una URL
 */
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Analiza la calidad de la imagen
 */
async function analyzeImageQuality(imageBuffer: Buffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const stats = await sharp(imageBuffer).stats();
  
  // Calcular entropía (claridad)
  const entropy = stats.channels.reduce((sum, channel) => sum + (channel.entropy || 0), 0) / stats.channels.length;
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    entropy: entropy,
    format: metadata.format,
    isLowQuality: (metadata.width || 0) < 400 || (metadata.height || 0) < 400 || entropy < 5.0
  };
}

/**
 * Endpoint simplificado de validación
 * POST /api/profile-photos/analyze
 * 
 * NOTA: Versión simplificada sin face-api por problemas de compatibilidad con Vercel.
 * Solo valida calidad de imagen. Validaciones avanzadas (rostros, sexo, edad) 
 * se realizarán en Fase 2 con servidor dedicado.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📸 === INICIO VALIDACIÓN SIMPLIFICADA DE FOTO DE PERFIL ===');
    
    // Autenticar
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }
    
    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    
    // Obtener datos de la solicitud
    const body = await request.json();
    const { photoId, photoUrl, isPrincipal } = body;
    
    if (!photoId || !photoUrl) {
      return NextResponse.json({ error: 'photoId y photoUrl son requeridos' }, { status: 400 });
    }
    
    console.log(`🔍 Validando foto ${photoId} de usuario ${user.id} (principal: ${isPrincipal})`);
    
    // Verificar cuántas fotos APROBADAS tiene el usuario
    const { count: approvedPhotosCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('estado', 'aprobada');
    
    const isFirstPhoto = (approvedPhotosCount || 0) === 0;
    console.log(`📊 Usuario tiene ${approvedPhotosCount || 0} fotos aprobadas (¿Primera foto? ${isFirstPhoto})`);
    
    // Descargar imagen
    console.log('⬇️ Descargando imagen...');
    const imageBuffer = await downloadImage(photoUrl);
    
    const validationData: any = {
      timestamp: new Date().toISOString(),
      simplified_validation: true,
      note: 'Validación simplificada - validaciones avanzadas en Fase 2'
    };
    
    // VALIDACIÓN BÁSICA: Calidad de imagen
    console.log('🔍 Analizando calidad de imagen...');
    const quality = await analyzeImageQuality(imageBuffer);
    validationData.image_quality = quality;
    
    console.log(`📊 Calidad: ${quality.width}x${quality.height}, entropía: ${quality.entropy.toFixed(2)}`);
    
    if (quality.isLowQuality) {
      console.log(`❌ Calidad de imagen muy baja`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'Calidad de imagen muy baja (resolución o nitidez insuficiente)',
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'Calidad de imagen muy baja'
      });
    }
    
    // POR AHORA: Enviar todas las fotos a revisión manual
    // En Fase 2 (con servidor dedicado) se harán validaciones avanzadas automáticas
    console.log('⚠️ Enviando a revisión manual (validaciones avanzadas pendientes)');
    await supabase
      .from('profile_photos')
      .update({
        estado: 'revision_manual',
        manual_review: true,
        rejection_reason: isFirstPhoto 
          ? 'Primera foto - requiere revisión manual del admin'
          : 'Foto adicional - requiere revisión manual del admin',
        validation_data: validationData,
        validated_at: new Date().toISOString()
      })
      .eq('id', photoId);
    
    return NextResponse.json({
      success: true,
      verdict: 'MANUAL_REVIEW',
      message: 'Foto enviada a revisión manual',
      note: 'Validaciones avanzadas (rostros, sexo, edad) se implementarán en Fase 2'
    });
    
  } catch (error) {
    console.error('❌ Error en validación:', error);
    
    // En caso de error, aprobar temporalmente
    // (mejor experiencia de usuario mientras se implementa Fase 2)
    try {
      const body = await request.json();
      const { photoId } = body;
      const supabase = getSupabaseAdmin();
      
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'Error en validación automática - requiere revisión manual',
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
    } catch (e) {
      console.error('Error al marcar para revisión manual:', e);
    }
    
    return NextResponse.json({
      success: true,
      verdict: 'MANUAL_REVIEW',
      message: 'Foto enviada a revisión manual por error en validación automática',
      error: String(error)
    });
  }
}
