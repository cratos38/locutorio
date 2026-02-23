import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as faceapi from '@vladmandic/face-api';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import * as canvas from 'canvas';
import * as tf from '@tensorflow/tfjs';

// Configurar canvas para face-api
const { Canvas, Image, ImageData } = canvas;
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

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

// Inicializar modelos de face-api (una sola vez)
let modelsLoaded = false;
async function loadModels() {
  if (modelsLoaded) return;
  
  try {
    console.log('🔄 Cargando modelos de face-api...');
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('✅ Modelos cargados correctamente');
  } catch (error) {
    console.error('❌ Error cargando modelos:', error);
    throw error;
  }
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
 * Detecta rostros y extrae información (sexo, edad, landmarks)
 */
async function detectFaces(imageBuffer: Buffer) {
  const img = await canvas.loadImage(imageBuffer);
  
  const detections = await faceapi
    .detectAllFaces(img as any, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withAgeAndGender();
  
  return detections;
}

/**
 * Detecta texto en la imagen usando OCR
 */
async function detectText(imageBuffer: Buffer): Promise<string> {
  try {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'spa+eng', {
      logger: () => {} // Silenciar logs
    });
    return text.trim();
  } catch (error) {
    console.error('Error en OCR:', error);
    return '';
  }
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
 * Endpoint principal de validación
 * POST /api/profile-photos/analyze
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📸 === INICIO VALIDACIÓN DE FOTO DE PERFIL ===');
    
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
    
    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('sexo, fecha_nacimiento')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Error obteniendo datos del usuario:', userError);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    const userSex = userData.sexo; // "Hombre" o "Mujer"
    const userAge = userData.fecha_nacimiento 
      ? Math.floor((Date.now() - new Date(userData.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;
    
    console.log(`👤 Usuario: sexo=${userSex}, edad=${userAge}`);
    
    // Descargar imagen
    console.log('⬇️ Descargando imagen...');
    const imageBuffer = await downloadImage(photoUrl);
    
    // Cargar modelos si no están cargados
    await loadModels();
    
    // 1️⃣ DETECTAR ROSTROS + SEXO + EDAD
    console.log('🔍 Detectando rostros...');
    const faces = await detectFaces(imageBuffer);
    
    const validationData: any = {
      timestamp: new Date().toISOString(),
      faces_detected: faces.length,
      checks: {}
    };
    
    // Validación: Número de rostros
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
    
    const face = faces[0];
    const faceBox = face.detection.box;
    
    // Calcular metadata básica de la imagen
    const imageMetadata = await sharp(imageBuffer).metadata();
    const imageWidth = imageMetadata.width || 1;
    const imageHeight = imageMetadata.height || 1;
    const imageArea = imageWidth * imageHeight;
    const faceArea = faceBox.width * faceBox.height;
    const facePercent = (faceArea / imageArea) * 100;
    
    validationData.face_area_percent = facePercent.toFixed(2);
    validationData.detected_gender = face.gender;
    validationData.gender_confidence = face.genderProbability.toFixed(2);
    validationData.detected_age = Math.round(face.age);
    validationData.user_age = userAge;
    validationData.age_difference = userAge ? Math.abs(userAge - Math.round(face.age)) : null;
    
    console.log(`👤 Rostro detectado:`);
    console.log(`   - Área del rostro: ${facePercent.toFixed(2)}%`);
    console.log(`   - Sexo detectado: ${face.gender} (${(face.genderProbability * 100).toFixed(1)}%)`);
    console.log(`   - Edad detectada: ${Math.round(face.age)} años`);
    
    // Validación: Tamaño del rostro
    // FILOSOFÍA:
    // - Primera foto del usuario: DEBE ser selfie (rostro > 30%)
    // - Fotos adicionales: Pueden ser casuales/cuerpo completo (rostro > 5%)
    
    let minFacePercent: number;
    let rejectMessage: string;
    
    if (isFirstPhoto || isPrincipal) {
      // Primera foto O marcada como principal: Requerir selfie
      minFacePercent = 30;
      rejectMessage = 'Tu primera foto debe ser tipo selfie (rostro claro, mínimo 30% de la imagen)';
    } else {
      // Fotos adicionales: Muy flexible
      minFacePercent = 5;
      rejectMessage = 'Tu rostro debe ser visible (al menos 5% de la imagen)';
    }
    
    if (facePercent < minFacePercent) {
      console.log(`❌ Rostro muy pequeño (${facePercent.toFixed(2)}%, mínimo requerido: ${minFacePercent}%)`);
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
    
    // Validación: Sexo biológico
    const detectedSex = face.gender === 'male' ? 'Hombre' : 'Mujer';
    const genderConfidence = face.genderProbability;
    
    if (genderConfidence < 0.7) {
      console.log(`⚠️ Baja confianza en detección de sexo (${(genderConfidence * 100).toFixed(1)}%)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'revision_manual',
          manual_review: true,
          rejection_reason: 'Baja confianza en detección de sexo - requiere revisión manual',
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'MANUAL_REVIEW',
        reason: 'Baja confianza en detección de sexo'
      });
    }
    
    if (detectedSex !== userSex) {
      console.log(`❌ Sexo no coincide: Usuario=${userSex}, Detectado=${detectedSex}`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: `El sexo detectado (${detectedSex}) no coincide con tu perfil (${userSex})`,
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'El sexo detectado no coincide con tu perfil'
      });
    }
    
    // Validación: Edad aproximada
    if (userAge && validationData.age_difference) {
      if (validationData.age_difference > 15) {
        console.log(`⚠️ Diferencia de edad muy grande (${validationData.age_difference} años)`);
        await supabase
          .from('profile_photos')
          .update({
            estado: 'revision_manual',
            manual_review: true,
            rejection_reason: `Gran diferencia de edad detectada (${validationData.age_difference} años) - requiere revisión manual`,
            validation_data: validationData
          })
          .eq('id', photoId);
        
        return NextResponse.json({
          success: false,
          verdict: 'MANUAL_REVIEW',
          reason: 'Gran diferencia de edad detectada'
        });
      }
    }
    
    // 2️⃣ DETECTAR TEXTO (OCR)
    console.log('🔍 Detectando texto...');
    const detectedText = await detectText(imageBuffer);
    const textLength = detectedText.replace(/\s/g, '').length;
    validationData.text_detected = textLength > 0;
    validationData.text_length = textLength;
    
    if (textLength > 10) {
      console.log(`❌ Texto detectado en la imagen (${textLength} caracteres)`);
      await supabase
        .from('profile_photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'La foto contiene texto o marcas de agua (no permitido)',
          validation_data: validationData
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'La foto contiene texto o marcas de agua'
      });
    }
    
    // 3️⃣ CALIDAD DE IMAGEN
    console.log('🔍 Analizando calidad de imagen...');
    const quality = await analyzeImageQuality(imageBuffer);
    validationData.image_quality = quality;
    
    if (quality.isLowQuality) {
      console.log(`❌ Calidad de imagen muy baja (${quality.width}x${quality.height}, entropía: ${quality.entropy.toFixed(2)})`);
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
    
    // ✅ TODO CORRECTO - APROBAR
    console.log('✅ FOTO APROBADA - Todas las validaciones pasaron');
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
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: String(error)
    }, { status: 500 });
  }
}
