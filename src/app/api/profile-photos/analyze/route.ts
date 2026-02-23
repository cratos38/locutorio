import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-node';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 segundos para procesar

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

// Detector de rostros (se carga una sola vez)
let detector: faceDetection.FaceDetector | null = null;

async function getDetector() {
  if (detector) return detector;
  
  console.log('🔄 Cargando modelo MediaPipe FaceDetection...');
  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
    runtime: 'tfjs',
    maxFaces: 5, // Detectar hasta 5 rostros
  };
  
  detector = await faceDetection.createDetector(model, detectorConfig);
  console.log('✅ Modelo cargado');
  return detector;
}

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
 * Detecta rostros en la imagen
 */
async function detectFaces(imageBuffer: Buffer) {
  const detector = await getDetector();
  
  // Convertir buffer a formato que TensorFlow.js entiende
  const image = sharp(imageBuffer);
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Crear tensor de imagen
  const tensor = {
    data: new Uint8Array(data),
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
  
  // Detectar rostros
  const faces = await detector.estimateFaces(tensor as any);
  return { faces, imageWidth: info.width, imageHeight: info.height };
}

/**
 * Analiza la calidad de la imagen
 */
async function analyzeImageQuality(imageBuffer: Buffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const stats = await sharp(imageBuffer).stats();
  
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
 * Endpoint de validación con TensorFlow.js
 * POST /api/profile-photos/analyze
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📸 === INICIO VALIDACIÓN CON TENSORFLOW.JS ===');
    
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
      tensorflow_js: true
    };
    
    // 1️⃣ VALIDACIÓN: Calidad de imagen
    console.log('🔍 Analizando calidad...');
    const quality = await analyzeImageQuality(imageBuffer);
    validationData.image_quality = quality;
    
    if (quality.isLowQuality) {
      console.log(`❌ Calidad muy baja`);
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
    
    // 2️⃣ VALIDACIÓN: Detección de rostros
    console.log('🔍 Detectando rostros...');
    const { faces, imageWidth, imageHeight } = await detectFaces(imageBuffer);
    
    console.log(`👥 Rostros detectados: ${faces.length}`);
    validationData.faces_detected = faces.length;
    
    // Validar número de rostros
    if (faces.length === 0) {
      console.log('❌ No se detectó ningún rostro');
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'No se detectó ningún rostro en la imagen',
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'No se detectó ningún rostro'
      });
    }
    
    if (faces.length > 1) {
      console.log(`❌ Se detectaron ${faces.length} rostros (debe haber solo 1)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: `Se detectaron ${faces.length} personas en la foto (debe haber solo 1)`,
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'Debe haber solo 1 persona en la foto'
      });
    }
    
    // Calcular área del rostro
    const face = faces[0];
    const box = face.box;
    const faceArea = box.width * box.height;
    const imageArea = imageWidth * imageHeight;
    const facePercent = (faceArea / imageArea) * 100;
    
    console.log(`📏 Área del rostro: ${facePercent.toFixed(2)}%`);
    validationData.face_area_percent = facePercent.toFixed(2);
    
    // 3️⃣ VALIDACIÓN: Tamaño del rostro según filosofía
    let minFacePercent: number;
    let rejectMessage: string;
    
    if (isFirstPhoto || isPrincipal) {
      // Primera foto: Debe ser selfie
      minFacePercent = 30;
      rejectMessage = 'Tu primera foto debe ser tipo selfie (rostro claro, mínimo 30%)';
    } else {
      // Fotos adicionales: Muy flexible
      minFacePercent = 5;
      rejectMessage = 'Tu rostro debe ser visible (al menos 5% de la imagen)';
    }
    
    if (facePercent < minFacePercent) {
      console.log(`❌ Rostro muy pequeño (${facePercent.toFixed(2)}%, mínimo: ${minFacePercent}%)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: rejectMessage,
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: rejectMessage
      });
    }
    
    // Si es foto adicional con rostro pequeño (5-15%), enviar a revisión manual
    if (!isFirstPhoto && !isPrincipal && facePercent >= 5 && facePercent < 15) {
      console.log(`⚠️ Foto adicional con rostro pequeño (${facePercent.toFixed(2)}%) - revisión manual`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'Foto de cuerpo completo - el admin verificará que cumpla las reglas',
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'MANUAL_REVIEW',
        reason: 'Foto de cuerpo completo - revisión manual'
      });
    }
    
    // ✅ TODO CORRECTO - APROBAR
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
      validationData: validationData
    });
    
  } catch (error) {
    console.error('❌ Error en validación:', error);
    
    // En caso de error, enviar a revisión manual
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
      success: false,
      verdict: 'MANUAL_REVIEW',
      message: 'Error en validación - enviado a revisión manual',
      error: String(error)
    }, { status: 500 });
  }
}
