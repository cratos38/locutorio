import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * VALIDACIÓN AUTOMÁTICA CON TENSORFLOW.JS + BLAZEFACE
 * - Detección de rostros (debe haber exactamente 1)
 * - Tamaño del rostro (mínimo 30% para selfie, 5% para otras)
 * - Sin detección de género/edad por ahora (requiere modelos adicionales)
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

let faceModel: any = null;

async function loadFaceModel() {
  if (faceModel) return faceModel;
  console.log('🔄 Cargando modelo BlazeFace...');
  faceModel = await blazeface.load();
  console.log('✅ Modelo BlazeFace cargado');
  return faceModel;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function detectFaces(imageBuffer: Buffer) {
  const model = await loadFaceModel();
  
  // Convertir imagen a formato para TensorFlow
  const metadata = await sharp(imageBuffer).metadata();
  const { data, info } = await sharp(imageBuffer)
    .resize(512, 512, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Crear array de píxeles RGB
  const pixels = new Uint8Array(data);
  const imageData = {
    data: pixels,
    width: info.width,
    height: info.height
  };
  
  // Detectar rostros
  const predictions = await model.estimateFaces(imageData as any, false);
  
  return {
    faces: predictions,
    originalWidth: metadata.width || info.width,
    originalHeight: metadata.height || info.height,
    imageWidth: info.width,
    imageHeight: info.height
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📸 === VALIDACIÓN CON BLAZEFACE ===');
    
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
    const { photoId, photoUrl, isPrincipal } = body;
    
    if (!photoId || !photoUrl) {
      return NextResponse.json({ error: 'photoId y photoUrl son requeridos' }, { status: 400 });
    }
    
    console.log(`🔍 Validando foto ${photoId} (principal: ${isPrincipal})`);
    
    // Verificar si es la primera foto
    const { count: approvedCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('estado', 'aprobada');
    
    const isFirstPhoto = (approvedCount || 0) === 0;
    console.log(`📊 Es primera foto: ${isFirstPhoto}`);
    
    const imageBuffer = await downloadImage(photoUrl);
    
    const validationData: any = {
      timestamp: new Date().toISOString(),
      is_first_photo: isFirstPhoto,
      is_principal: isPrincipal
    };
    
    // DETECCIÓN DE ROSTROS
    console.log('🔍 Detectando rostros...');
    const { faces, originalWidth, originalHeight, imageWidth, imageHeight } = await detectFaces(imageBuffer);
    
    console.log(`👥 Rostros detectados: ${faces.length}`);
    validationData.faces_detected = faces.length;
    
    // VALIDAR: Debe haber exactamente 1 rostro
    if (faces.length === 0) {
      console.log('❌ No se detectó ningún rostro');
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'No se detectó ningún rostro en la imagen',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'No se detectó ningún rostro'
      });
    }
    
    if (faces.length > 1) {
      console.log(`❌ Se detectaron ${faces.length} rostros`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: `Se detectaron ${faces.length} personas (debe haber solo 1)`,
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'Debe haber solo 1 persona en la foto'
      });
    }
    
    // CALCULAR ÁREA DEL ROSTRO
    const face = faces[0];
    const faceBox = face.topLeft && face.bottomRight ? {
      x1: face.topLeft[0],
      y1: face.topLeft[1],
      x2: face.bottomRight[0],
      y2: face.bottomRight[1]
    } : null;
    
    if (!faceBox) {
      console.log('⚠️ No se pudo determinar el área del rostro');
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'No se pudo determinar el tamaño del rostro',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'MANUAL_REVIEW',
        reason: 'Revisión manual requerida'
      });
    }
    
    const faceWidth = faceBox.x2 - faceBox.x1;
    const faceHeight = faceBox.y2 - faceBox.y1;
    const faceArea = faceWidth * faceHeight;
    const imageArea = imageWidth * imageHeight;
    const facePercent = (faceArea / imageArea) * 100;
    
    console.log(`📏 Área del rostro: ${facePercent.toFixed(2)}%`);
    validationData.face_area_percent = facePercent.toFixed(2);
    
    // VALIDAR TAMAÑO DEL ROSTRO
    let minFacePercent: number;
    let rejectMessage: string;
    
    if (isFirstPhoto || isPrincipal) {
      minFacePercent = 30;
      rejectMessage = 'Tu primera foto debe ser tipo selfie (rostro claro, mínimo 30%)';
    } else {
      minFacePercent = 5;
      rejectMessage = 'Tu rostro debe ser visible (al menos 5% de la imagen)';
    }
    
    if (facePercent < minFacePercent) {
      console.log(`❌ Rostro muy pequeño (${facePercent.toFixed(2)}% < ${minFacePercent}%)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: rejectMessage,
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: rejectMessage
      });
    }
    
    // Si es foto adicional con rostro pequeño (5-15%), revisión manual
    if (!isFirstPhoto && !isPrincipal && facePercent >= 5 && facePercent < 15) {
      console.log(`⚠️ Foto adicional con rostro pequeño (${facePercent.toFixed(2)}%)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'Foto de cuerpo completo - revisión manual',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'MANUAL_REVIEW',
        reason: 'Foto de cuerpo completo - revisión manual'
      });
    }
    
    // ✅ TODO OK - APROBAR
    console.log('✅ FOTO APROBADA');
    await supabase
      .from('profile_photos')
      .update({
        estado: 'aprobada',
        validation_data: validationData,
        validated_at: new Date().toISOString()
      })
      .eq('id', photoId);
    
    return NextResponse.json({
      success: true,
      verdict: 'APPROVE',
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
          rejection_reason: 'Error en validación - requiere revisión manual',
          validated_at: new Date().toISOString()
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
