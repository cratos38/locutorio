import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToR2, BUCKETS } from '@/lib/r2';
import { adminAuth } from '@/lib/firebase-admin';

// Cambiar a Node.js runtime (más compatible)
export const runtime = 'nodejs';

// Crear cliente de Supabase con SERVICE_ROLE_KEY para operaciones administrativas
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  // Intentar obtener SERVICE_ROLE_KEY de diferentes fuentes
  // WORKAROUND: Vercel solo pasa variables con NEXT_PUBLIC_ prefix
  const supabaseServiceKey = 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||  // Workaround para Vercel
    process.env.SUPABASE_SERVICE_KEY ||              // Nombre corto
    process.env.SUPABASE_SERVICE_ROLE_KEY ||         // Nombre largo
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||     // Fallback
    '';
  
  console.log('🔧 Configurando Supabase Admin...');
  console.log('📍 URL:', supabaseUrl ? '✅ OK' : '❌ MISSING');
  console.log('🔑 NEXT_PUBLIC_SUPABASE_SERVICE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? '✅ OK' : '❌ MISSING');
  console.log('🔑 SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ OK' : '❌ MISSING');
  console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ OK' : '❌ MISSING');
  console.log('🔑 Using key from:', 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? 'NEXT_PUBLIC_SUPABASE_SERVICE_KEY (workaround)' :
    process.env.SUPABASE_SERVICE_KEY ? 'SUPABASE_SERVICE_KEY' :
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY' :
    'ANON_KEY (fallback)'
  );
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * API para subir fotos de perfil a Supabase Storage
 * 
 * POST /api/photos/upload
 * Body: FormData con:
 *   - file: archivo de imagen (File)
 *   - username: nombre de usuario (string)
 *   - isPrincipal: si es foto principal (boolean)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 === INICIO SUBIDA DE FOTO ===');
    
    // 🔐 Obtener token de autenticación del header (Firebase)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 Token recibido:', token ? '✅ SÍ' : '❌ NO');
    
    // 🔐 Verificar token de Firebase
    if (!token) {
      console.warn('⚠️ No se recibió token de autenticación');
      return NextResponse.json(
        { error: 'Se requiere autenticación' },
        { status: 401 }
      );
    }
    
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.verifyIdToken(token);
      console.log('✅ Usuario autenticado (Firebase):', firebaseUser.email, '| UID:', firebaseUser.uid);
    } catch (authError) {
      console.error('❌ Token inválido (Firebase):', authError);
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }
    
    // Crear cliente de Supabase ADMIN (solo para consultas a la BD)
    const supabase = getSupabaseAdmin();
    
    // Obtener FormData
    console.log('📦 Obteniendo FormData...');
    const formData = await request.formData();
    const thumbnailFile = formData.get('thumbnail') as File;
    const mediumFile = formData.get('medium') as File;
    const largeFile = formData.get('large') as File;
    const username = formData.get('username') as string;
    const isPrincipal = formData.get('isPrincipal') === 'true';
    
    if (!thumbnailFile || !mediumFile || !largeFile || !username) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (thumbnail, medium, large, username)' },
        { status: 400 }
      );
    }
    
    console.log(`📤 Subiendo 3 versiones para usuario: ${username}`);
    console.log(`📏 Tamaños: thumbnail=${(thumbnailFile.size / 1024).toFixed(2)}KB, medium=${(mediumFile.size / 1024).toFixed(2)}KB, large=${(largeFile.size / 1024).toFixed(2)}KB`);
    
    // Generar nombre único para las fotos
    const timestamp = Date.now();
    const fileExt = largeFile.name.split('.').pop() || 'jpg';
    
    // Nombres de archivos para las 3 versiones
    const thumbnailFileName = `${username}/${timestamp}_thumbnail.${fileExt}`;
    const mediumFileName = `${username}/${timestamp}_medium.${fileExt}`;
    const largeFileName = `${username}/${timestamp}.${fileExt}`;
    
    // 1️⃣ Subir THUMBNAIL (96px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo thumbnail: ${thumbnailFileName}`);
    const thumbnailBuffer = new Uint8Array(await thumbnailFile.arrayBuffer());
    const thumbnailUrl = await uploadToR2(
      thumbnailBuffer,
      thumbnailFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      thumbnailFile.type
    );
    
    if (!thumbnailUrl) {
      console.error('❌ Error al subir thumbnail a R2');
      return NextResponse.json(
        { error: 'Error al subir thumbnail a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    // 2️⃣ Subir MEDIUM (400px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo medium: ${mediumFileName}`);
    const mediumBuffer = new Uint8Array(await mediumFile.arrayBuffer());
    const mediumUrl = await uploadToR2(
      mediumBuffer,
      mediumFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      mediumFile.type
    );
    
    if (!mediumUrl) {
      console.error('❌ Error al subir medium a R2');
      return NextResponse.json(
        { error: 'Error al subir medium a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    // 3️⃣ Subir LARGE (1024px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo large: ${largeFileName}`);
    const largeBuffer = new Uint8Array(await largeFile.arrayBuffer());
    const photoUrl = await uploadToR2(
      largeBuffer,
      largeFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      largeFile.type
    );
    
    if (!photoUrl) {
      console.error('❌ Error al subir large a R2');
      return NextResponse.json(
        { error: 'Error al subir large a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    console.log(`✅ [R2] 3 versiones subidas exitosamente a Cloudflare R2`);
    console.log(`  - Thumbnail (96px): ${thumbnailUrl}`);
    console.log(`  - Medium (400px): ${mediumUrl}`);
    console.log(`  - Large (1024px): ${photoUrl}`);
    
    // Buscar user_id por username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (userError || !userData) {
      console.error('❌ Usuario no encontrado:', userError);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    const userId = userData.id;
    
    // Si es foto principal, desmarcar las demás - v3.5: tabla photos
    if (isPrincipal) {
      console.log('⭐ Desmarcando otras fotos principales...');
      await supabase
        .from('photos')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('photo_type', 'profile');
    }
    
    // Guardar registro de la foto en la base de datos - v3.5: tabla photos
    console.log('💾 Guardando registro en tabla photos (v3.5)...');
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'profile',
        storage_path: largeFileName,
        storage_url: photoUrl,      // Large (1024px)
        cropped_url: mediumUrl,     // Medium (400px)
        // url_thumbnail: thumbnailUrl, // COMENTADO temporalmente hasta agregar columna
        status: 'pending',          // Por defecto pendiente de aprobación
        is_primary: isPrincipal,
        is_visible: false,          // Solo visible para el usuario hasta aprobar
        original_filename: largeFile.name,
        file_size: largeFile.size,
        mime_type: largeFile.type
      })
      .select()
      .single();
    
    if (photoError) {
      console.error('❌ Error al guardar registro de foto:', photoError);
      return NextResponse.json(
        { error: 'Error al guardar registro de foto', details: photoError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Foto guardada exitosamente en BD (Supabase)');
    console.log('📦 Almacenamiento: Cloudflare R2 (bucket: photos-profile-pending)');
    console.log('🔄 Próximo paso: Configurar webhook para validación con ML Validator');
    
    return NextResponse.json({
      success: true,
      photo: {
        id: photoData.id,
        url: photoUrl,
        isPrincipal: isPrincipal,
        status: 'pending'
      }
    });
    
  } catch (error) {
    console.error('❌ Error en API de upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
