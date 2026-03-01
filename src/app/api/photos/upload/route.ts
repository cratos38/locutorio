import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    
    // 🔐 Obtener token de autenticación del header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 Token recibido:', token ? '✅ SÍ' : '❌ NO');
    
    // Crear cliente de Supabase ADMIN (con SERVICE_ROLE_KEY)
    const supabase = getSupabaseAdmin();
    
    // 🔐 Verificar que el token sea válido
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error('❌ Token inválido:', authError);
        return NextResponse.json(
          { error: 'Token de autenticación inválido' },
          { status: 401 }
        );
      }
      
      console.log('✅ Usuario autenticado:', user.email);
    } else {
      console.warn('⚠️ No se recibió token de autenticación');
      return NextResponse.json(
        { error: 'Se requiere autenticación' },
        { status: 401 }
      );
    }
    
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
    
    // 1️⃣ Subir THUMBNAIL (96px) - v3.5: photos-pending
    console.log(`💾 Subiendo thumbnail: ${thumbnailFileName}`);
    const thumbnailBuffer = new Uint8Array(await thumbnailFile.arrayBuffer());
    const { error: thumbnailError } = await supabase.storage
      .from('photos-pending')
      .upload(thumbnailFileName, thumbnailBuffer, {
        contentType: thumbnailFile.type,
        upsert: false
      });
    
    if (thumbnailError) {
      console.error('❌ Error al subir thumbnail:', thumbnailError);
      return NextResponse.json(
        { error: 'Error al subir thumbnail', details: thumbnailError.message },
        { status: 500 }
      );
    }
    
    // 2️⃣ Subir MEDIUM (400px) - v3.5: photos-pending
    console.log(`💾 Subiendo medium: ${mediumFileName}`);
    const mediumBuffer = new Uint8Array(await mediumFile.arrayBuffer());
    const { error: mediumError } = await supabase.storage
      .from('photos-pending')
      .upload(mediumFileName, mediumBuffer, {
        contentType: mediumFile.type,
        upsert: false
      });
    
    if (mediumError) {
      console.error('❌ Error al subir medium:', mediumError);
      return NextResponse.json(
        { error: 'Error al subir medium', details: mediumError.message },
        { status: 500 }
      );
    }
    
    // 3️⃣ Subir LARGE (1024px) - v3.5: photos-pending
    console.log(`💾 Subiendo large: ${largeFileName}`);
    const largeBuffer = new Uint8Array(await largeFile.arrayBuffer());
    const { error: largeError } = await supabase.storage
      .from('photos-pending')
      .upload(largeFileName, largeBuffer, {
        contentType: largeFile.type,
        upsert: false
      });
    
    if (largeError) {
      console.error('❌ Error al subir large:', largeError);
      return NextResponse.json(
        { error: 'Error al subir large', details: largeError.message },
        { status: 500 }
      );
    }
    
    // Obtener URLs públicas de las 3 versiones - v3.5: photos-pending
    const { data: thumbnailUrlData } = supabase.storage
      .from('photos-pending')
      .getPublicUrl(thumbnailFileName);
    
    const { data: mediumUrlData } = supabase.storage
      .from('photos-pending')
      .getPublicUrl(mediumFileName);
    
    const { data: largeUrlData } = supabase.storage
      .from('photos-pending')
      .getPublicUrl(largeFileName);
    
    const thumbnailUrl = thumbnailUrlData.publicUrl;
    const mediumUrl = mediumUrlData.publicUrl;
    const photoUrl = largeUrlData.publicUrl;
    
    console.log(`✅ 3 versiones subidas exitosamente`);
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
    
    // Guardar registro de la foto en la base de datos - v4.0: columnas actualizadas
    console.log('💾 Guardando registro en tabla photos (v4.0)...');
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'profile',
        storage_path: largeFileName,
        photo_url: photoUrl,           // Large (1024px) - nombre correcto
        url_medium: mediumUrl,         // Medium (400px) - nombre correcto
        url_thumbnail: thumbnailUrl,   // Thumbnail (96px) - ¡AGREGADO!
        url: photoUrl,                 // Alias para compatibilidad
        status: 'pending',             // Por defecto pendiente de aprobación
        is_principal: isPrincipal,     // Nombre correcto (no is_primary)
        is_visible: false,             // Solo visible para el usuario hasta aprobar
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
    
    console.log('✅ Foto guardada exitosamente en BD');
    console.log('🔄 Trigger de Supabase cambiará status a "processing"');
    console.log('🤖 Supabase Database Webhook llamará al ML Validator automáticamente');
    
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
