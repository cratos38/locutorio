import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pipeline } from '@xenova/transformers';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * VALIDACIÓN CON CLIP (Transformers.js)
 * - Detección de rostros usando clasificación de texto
 * - Validación de tipo de foto (selfie vs cuerpo completo)
 * - 100% JavaScript puro, funciona en Vercel
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

let classifier: any = null;

async function getClassifier() {
  if (classifier) return classifier;
  console.log('🔄 Cargando modelo CLIP...');
  classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
  console.log('✅ Modelo CLIP cargado');
  return classifier;
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function analyzeImage(imageUrl: string) {
  const model = await getClassifier();
  
  // Categorías para clasificar
  const categories = [
    'a clear close-up photo of a single person face',
    'a selfie photo showing one person face clearly',
    'a full body photo of one person standing',
    'a photo with multiple people',
    'a photo with no people',
    'a blurry unclear photo',
    'a photo with sunglasses covering eyes',
    'a photo with text or watermark'
  ];
  
  // CLIP acepta URLs directamente
  const result = await model(imageUrl, categories);
  
  return result;
}

export async function POST(request: NextRequest) {
  let photoId: string | undefined;
  
  try {
    console.log('📸 === VALIDACIÓN CON CLIP ===');
    
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
    photoId = body.photoId;
    const { photoUrl, isPrincipal } = body;
    
    if (!photoId || !photoUrl) {
      return NextResponse.json({ error: 'photoId y photoUrl son requeridos' }, { status: 400 });
    }
    
    console.log(`🔍 Validando foto ${photoId} (principal: ${isPrincipal})`);
    
    // Verificar si es la primera foto
    const { count: approvedCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('estado', 'aprobada');
    
    const isFirstPhoto = (approvedCount || 0) === 0;
    console.log(`📊 Es primera foto: ${isFirstPhoto}`);
    
    const validationData: any = {
      timestamp: new Date().toISOString(),
      is_first_photo: isFirstPhoto,
      is_principal: isPrincipal,
      model: 'CLIP'
    };
    
    // ANÁLISIS CON CLIP (usa la URL directamente)
    console.log('🔍 Analizando con CLIP...');
    const classifications = await analyzeImage(photoUrl);
    
    // Guardar resultados
    const results: any = {};
    classifications.forEach((item: any) => {
      results[item.label] = (item.score * 100).toFixed(2);
    });
    
    validationData.clip_results = results;
    
    console.log('📊 Resultados CLIP:', results);
    
    // Extraer scores
    const closeupScore = parseFloat(results['a clear close-up photo of a single person face'] || 0);
    const selfieScore = parseFloat(results['a selfie photo showing one person face clearly'] || 0);
    const fullBodyScore = parseFloat(results['a full body photo of one person standing'] || 0);
    const multiplePeopleScore = parseFloat(results['a photo with multiple people'] || 0);
    const noPeopleScore = parseFloat(results['a photo with no people'] || 0);
    const blurryScore = parseFloat(results['a blurry unclear photo'] || 0);
    const sunglassesScore = parseFloat(results['a photo with sunglasses covering eyes'] || 0);
    const textScore = parseFloat(results['a photo with text or watermark'] || 0);
    
    // VALIDACIONES
    
    // 1. Rechazar si no hay personas
    if (noPeopleScore > 60) {
      console.log('❌ No se detectó ninguna persona');
      await supabase
        .from('photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'No se detectó ninguna persona en la imagen',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'No se detectó ninguna persona'
      });
    }
    
    // 2. Rechazar si hay múltiples personas
    if (multiplePeopleScore > 50) {
      console.log('❌ Se detectaron múltiples personas');
      await supabase
        .from('photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'Se detectaron múltiples personas (debe haber solo 1)',
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
    
    // 3. Rechazar si está muy borrosa
    if (blurryScore > 60) {
      console.log('❌ Imagen muy borrosa');
      await supabase
        .from('photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'La imagen está muy borrosa o desenfocada',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'Imagen muy borrosa'
      });
    }
    
    // 4. Rechazar si tiene gafas oscuras
    if (sunglassesScore > 60) {
      console.log('❌ Gafas oscuras detectadas');
      await supabase
        .from('photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'No se permiten gafas oscuras que cubran los ojos',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'No se permiten gafas oscuras'
      });
    }
    
    // 5. Rechazar si tiene texto/watermark
    if (textScore > 60) {
      console.log('❌ Texto/watermark detectado');
      await supabase
        .from('photos')
        .update({
          estado: 'rechazada',
          rejection_reason: 'No se permiten fotos con texto o watermarks',
          validation_data: validationData,
          validated_at: new Date().toISOString()
        })
        .eq('id', photoId);
      
      return NextResponse.json({
        success: false,
        verdict: 'REJECT',
        reason: 'No se permiten fotos con texto'
      });
    }
    
    // 6. Validar tipo de foto según si es primera o no
    const faceScore = Math.max(closeupScore, selfieScore);
    
    if (isFirstPhoto || isPrincipal) {
      // Primera foto: debe ser selfie/closeup
      if (faceScore < 40) {
        console.log(`❌ Primera foto debe ser selfie (score: ${faceScore}%)`);
        await supabase
          .from('photos')
          .update({
            estado: 'rechazada',
            rejection_reason: 'Tu primera foto debe ser tipo selfie (rostro claro y cercano)',
            validation_data: validationData,
            validated_at: new Date().toISOString()
          })
          .eq('id', photoId);
        
        return NextResponse.json({
          success: false,
          verdict: 'REJECT',
          reason: 'Primera foto debe ser selfie'
        });
      }
    } else {
      // Fotos adicionales: pueden ser de cuerpo completo
      if (fullBodyScore > 50 && faceScore < 30) {
        console.log('⚠️ Foto de cuerpo completo - revisión manual');
        await supabase
          .from('photos')
          .update({
            estado: 'revision_manual',
            manual_review: true,
            rejection_reason: 'Foto de cuerpo completo - el admin verificará',
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
    }
    
    // ✅ TODO OK - APROBAR
    console.log('✅ FOTO APROBADA');
    await supabase
      .from('photos')
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
    
    // Si tenemos photoId, marcarlo para revisión manual
    if (photoId) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('photos')
          .update({
            estado: 'revision_manual',
            manual_review: true,
            rejection_reason: `Error en validación: ${String(error)}`,
            validated_at: new Date().toISOString()
          })
          .eq('id', photoId);
      } catch (e) {
        console.error('Error al marcar para revisión manual:', e);
      }
    }
    
    return NextResponse.json({
      success: false,
      verdict: 'MANUAL_REVIEW',
      error: String(error)
    }, { status: 500 });
  }
}
