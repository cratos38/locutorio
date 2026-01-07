import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cambiar a Node.js runtime (más compatible)
export const runtime = 'nodejs';

// Crear cliente de Supabase con SERVICE_ROLE_KEY para operaciones administrativas
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  // TEMPORAL: Usar SERVICE_ROLE_KEY directo (solo para testing)
  // TODO: Esto debería venir de variables de entorno
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';
  
  const supabaseServiceKey = serviceRoleKey;
  
  console.log('🔧 Configurando Supabase Admin...');
  console.log('📍 URL:', supabaseUrl ? '✅ OK' : '❌ MISSING');
  console.log('🔑 SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ OK (hardcoded)' : '❌ MISSING');
  
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
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;
    const isPrincipal = formData.get('isPrincipal') === 'true';
    
    if (!file || !username) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (file, username)' },
        { status: 400 }
      );
    }
    
    console.log(`📤 Subiendo foto para usuario: ${username}`);
    console.log(`📏 Tamaño del archivo: ${(file.size / 1024).toFixed(2)}KB`);
    
    // Generar nombre único para la foto
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${username}/${timestamp}.${fileExt}`;
    
    // Convertir File a ArrayBuffer para Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Subir foto a Supabase Storage (bucket: profile-photos)
    console.log(`💾 Subiendo a Storage: ${fileName}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Error al subir foto a Storage:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir foto a Storage', details: uploadError.message },
        { status: 500 }
      );
    }
    
    // Obtener URL pública de la foto
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);
    
    const photoUrl = urlData.publicUrl;
    console.log(`✅ Foto subida exitosamente: ${photoUrl}`);
    
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
    
    // Si es foto principal, desmarcar las demás
    if (isPrincipal) {
      console.log('⭐ Desmarcando otras fotos principales...');
      await supabase
        .from('profile_photos')
        .update({ is_principal: false })
        .eq('user_id', userId);
    }
    
    // Guardar registro de la foto en la base de datos
    console.log('💾 Guardando registro en profile_photos...');
    const { data: photoData, error: photoError } = await supabase
      .from('profile_photos')
      .insert({
        user_id: userId,
        url: photoUrl,
        is_principal: isPrincipal,
        estado: 'pendiente', // Por defecto pendiente de aprobación
        orden: 0
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
    
    return NextResponse.json({
      success: true,
      photo: {
        id: photoData.id,
        url: photoUrl,
        isPrincipal: isPrincipal,
        estado: 'pendiente'
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
