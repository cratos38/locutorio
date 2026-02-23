import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para análisis completo

// Cliente admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * POST /api/profile-photo/analyze
 * Analiza una foto de perfil con validaciones automáticas GRATUITAS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, photoUrl, userId, userSex, userAge } = body;
    
    console.log('🔍 Iniciando análisis de foto de perfil:', {
      photoId,
      userId,
      userSex,
      userAge
    });
    
    // 1. Descargar imagen
    console.log('📥 Descargando imagen...');
    const imageResponse = await fetch(photoUrl);
    if (!imageResponse.ok) {
      throw new Error('No se pudo descargar la imagen');
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // 2. ANÁLISIS DE CALIDAD
    console.log('📊 Analizando calidad de imagen...');
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();
    
    if (!metadata.width || !metadata.height) {
      return rejectPhoto(photoId, 'No se pudo leer la imagen');
    }
    
    if (metadata.width < 400 || metadata.height < 400) {
      return rejectPhoto(photoId, 'Resolución muy baja (mínimo 400x400px)');
    }
    
    // Verificar si es muy borrosa (usando entropy)
    const isBlurry = stats.entropy < 5;
    if (isBlurry) {
      return rejectPhoto(photoId, 'La imagen está muy borrosa o desenfocada');
    }
    
    console.log('✅ Calidad de imagen: OK', {
      width: metadata.width,
      height: metadata.height,
      entropy: stats.entropy.toFixed(2)
    });
    
    // 3. ANÁLISIS NSFW (usando modelo ya existente)
    console.log('🔞 Analizando contenido NSFW...');
    
    // Cargar imagen para TensorFlow
    const image = await sharp(imageBuffer)
      .resize(224, 224)
      .raw()
      .toBuffer();
    
    // Crear tensor
    const tensor = tf.tensor3d(
      new Uint8Array(image),
      [224, 224, 3]
    ).toFloat().div(255.0).expandDims(0);
    
    // Cargar modelo NSFW
    const model = await nsfwjs.load();
    const predictions = await model.classify(tensor as any);
    
    tensor.dispose();
    
    // Calcular scores
    const nsfwScore = predictions.find(p => p.className === 'Porn')?.probability || 0;
    const sexyScore = predictions.find(p => p.className === 'Sexy')?.probability || 0;
    const hentaiScore = predictions.find(p => p.className === 'Hentai')?.probability || 0;
    
    const totalNSFW = nsfwScore + sexyScore + hentaiScore;
    
    console.log('🔞 Resultado NSFW:', {
      porn: nsfwScore.toFixed(3),
      sexy: sexyScore.toFixed(3),
      hentai: hentaiScore.toFixed(3),
      total: totalNSFW.toFixed(3)
    });
    
    // Rechazar si es demasiado explícito
    if (nsfwScore > 0.6 || totalNSFW > 0.75) {
      return rejectPhoto(photoId, 
        `Contenido inapropiado detectado (${(totalNSFW * 100).toFixed(0)}% explícito)`
      );
    }
    
    // 4. TODO: DETECCIÓN FACIAL (próximo paso)
    // - Número de caras (debe ser 1)
    // - Tamaño del rostro (>30%)
    // - Sexo biológico
    // - Edad aproximada
    
    // Por ahora, si pasó NSFW y calidad → aprobar
    console.log('✅ Foto aprobada automáticamente');
    
    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateError } = await supabaseAdmin
      .from('profile_photos')
      .update({
        estado: 'aprobada',
        moderation_notes: 'Aprobada automáticamente - análisis básico OK',
        updated_at: new Date().toISOString()
      })
      .eq('id', photoId);
    
    if (updateError) {
      console.error('❌ Error actualizando estado:', updateError);
      throw updateError;
    }
    
    return NextResponse.json({
      success: true,
      decision: 'approved',
      message: 'Foto aprobada automáticamente',
      analysis: {
        quality: {
          resolution: `${metadata.width}x${metadata.height}`,
          entropy: stats.entropy.toFixed(2)
        },
        nsfw: {
          porn: nsfwScore.toFixed(3),
          sexy: sexyScore.toFixed(3),
          total: totalNSFW.toFixed(3)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en análisis:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

// Helper para rechazar foto
async function rejectPhoto(photoId: string, reason: string) {
  console.log('❌ Rechazando foto:', reason);
  
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from('profile_photos')
    .update({
      estado: 'rechazada',
      moderation_notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', photoId);
  
  if (error) {
    console.error('Error actualizando estado:', error);
  }
  
  return NextResponse.json({
    success: true,
    decision: 'rejected',
    message: reason
  });
}
