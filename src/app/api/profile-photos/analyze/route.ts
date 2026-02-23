import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * ⚠️ SOLUCIÓN TEMPORAL: VALIDACIÓN BÁSICA CON SHARP
 * 
 * Por ahora validamos solo calidad de imagen.
 * Todas las fotos pasan a REVISIÓN MANUAL para que el admin las apruebe.
 * 
 * En FASE 2 (servidor dedicado) se agregarán:
 * - Detección de rostros
 * - Validación de sexo y edad
 * - Detección de texto/logos
 * - Detección de celebridades/IA
 */

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

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function analyzeImageQuality(imageBuffer: Buffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const stats = await sharp(imageBuffer).stats();
  
  const entropy = stats.channels.reduce((sum, channel) => sum + (channel.entropy || 0), 0) / stats.channels.length;
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    entropy: entropy,
    format: metadata.format,
    isLowQuality: (metadata.width || 0) < 400 || (metadata.height || 0) < 400 || entropy < 4.0
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📸 === VALIDACIÓN BÁSICA (solo calidad) ===');
    
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
    
    const body = await request.json();
    const { photoId, photoUrl } = body;
    
    if (!photoId || !photoUrl) {
      return NextResponse.json({ error: 'photoId y photoUrl son requeridos' }, { status: 400 });
    }
    
    console.log(`🔍 Validando foto ${photoId}`);
    
    const imageBuffer = await downloadImage(photoUrl);
    const quality = await analyzeImageQuality(imageBuffer);
    
    const validationData: any = {
      timestamp: new Date().toISOString(),
      image_quality: quality,
      validation_method: 'basic_quality_only'
    };
    
    // Si calidad muy baja → rechazar
    if (quality.isLowQuality) {
      console.log(`❌ Calidad muy baja`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'Calidad de imagen muy baja (resolución < 400px o imagen borrosa)',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'Calidad muy baja'
      });
    }
    
    // Si calidad OK → enviar a revisión manual
    console.log('✅ Calidad OK → revisión manual');
    await supabase
      .from('profile_photos')
      .update({
        estado: 'revision_manual',
        manual_review: true,
        rejection_reason: 'Pendiente de revisión por admin',
        validation_data: validationData,
        validated_at: new Date().toISOString()
      })
      .eq('id', photoId);
    
    return NextResponse.json({
      success: true,
      verdict: 'MANUAL_REVIEW',
      reason: 'Foto enviada a revisión manual',
      validationData
    });
    
  } catch (error) {
    console.error('❌ Error en validación:', error);
    
    try {
      const body = await request.json();
      const { photoId } = body;
      const supabase = getSupabaseAdmin();
      
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'Error en validación - requiere revisión manual'
        })
        .eq('id', photoId);
    } catch (e) {
      console.error('Error al marcar para revisión manual:', e);
    }
    
    return NextResponse.json({
      success: false,
      verdict: 'MANUAL_REVIEW',
      error: String(error)
    }, { status: 500 });
  }
}
