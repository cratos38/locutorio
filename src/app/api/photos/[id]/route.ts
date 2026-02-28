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
    
    // 1. Obtener datos de la foto (para saber qué archivos borrar)
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !photo) {
      console.error('❌ Foto no encontrada:', fetchError);
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }
    
    console.log('📸 Foto encontrada:', photo.storage_path);
    
    // 2. Eliminar de Storage (bucket photos-pending)
    if (photo.storage_path) {
      console.log('🗑️ Eliminando de Storage:', photo.storage_path);
      const { error: storageError } = await supabase.storage
        .from('photos-pending')
        .remove([photo.storage_path]);
      
      if (storageError) {
        console.warn('⚠️ Error eliminando de Storage (puede no existir):', storageError);
      } else {
        console.log('✅ Eliminado de Storage');
      }
    }
    
    // 3. Eliminar de la base de datos
    const { error: deleteError } = await supabase
      .from('photos')
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
