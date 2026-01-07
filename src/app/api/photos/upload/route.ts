import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Crear cliente de Supabase
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
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
    const supabase = getSupabaseClient();
    
    // Obtener FormData
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
