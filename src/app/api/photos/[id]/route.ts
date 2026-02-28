import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

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

/**
 * DELETE /api/photos/[id]
 * Elimina una foto de perfil (de BD y Storage)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🗑️ === INICIO DELETE FOTO ===');
    console.log('📍 Photo ID:', params.id);
    
    const supabase = getSupabaseAdmin();
    
    // 1. Intentar obtener de tabla NUEVA (photos)
    let { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', params.id)
      .single();
    
    let tableName = 'photos';
    let bucketName = 'photos-pending';
    
    // 2. Si no existe en tabla nueva, buscar en tabla VIEJA (profile_photos)
    if (fetchError || !photo) {
      console.log('⚠️ No encontrada en tabla nueva, buscando en tabla vieja...');
      const { data: oldPhoto, error: oldFetchError } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (oldFetchError || !oldPhoto) {
        console.error('❌ Foto no encontrada en ninguna tabla:', oldFetchError);
        return NextResponse.json(
          { error: 'Foto no encontrada' },
          { status: 404 }
        );
      }
      
      photo = oldPhoto;
      tableName = 'profile_photos';
      bucketName = 'profile-photos';
      console.log('✅ Foto encontrada en tabla vieja');
    }
    
    console.log('📸 Foto encontrada en tabla:', tableName);
    console.log('📍 Storage path:', photo.url || photo.storage_path);
    
    // 3. Eliminar de Storage
    const storagePath = photo.storage_path || photo.url;
    if (storagePath) {
      // Extraer solo el path (remover dominio si existe)
      const pathOnly = storagePath.includes('supabase.co') 
        ? storagePath.split('/').slice(-2).join('/')
        : storagePath;
      
      console.log('🗑️ Eliminando de Storage:', bucketName, '/', pathOnly);
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([pathOnly]);
      
      if (storageError) {
        console.warn('⚠️ Error eliminando de Storage (puede no existir):', storageError);
      } else {
        console.log('✅ Eliminado de Storage');
      }
    }
    
    // 4. Eliminar de la base de datos
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq('id', params.id);
    
    if (deleteError) {
      console.error('❌ Error eliminando de BD:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar de la base de datos' },
        { status: 500 }
      );
    }
    
    console.log('✅ Foto eliminada exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Foto eliminada correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error en DELETE:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
