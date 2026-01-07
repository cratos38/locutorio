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
 * API para obtener fotos de perfil de un usuario
 * 
 * GET /api/photos?username=<username>
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Falta parámetro username' },
        { status: 400 }
      );
    }
    
    console.log(`📥 Obteniendo fotos para usuario: ${username}`);
    
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
    
    // Obtener fotos del usuario ordenadas
    const { data: photos, error: photosError } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', userId)
      .order('is_principal', { ascending: false }) // Principal primero
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (photosError) {
      console.error('❌ Error al obtener fotos:', photosError);
      return NextResponse.json(
        { error: 'Error al obtener fotos', details: photosError.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ ${photos?.length || 0} fotos encontradas`);
    
    return NextResponse.json({
      success: true,
      photos: photos || []
    });
    
  } catch (error) {
    console.error('❌ Error en API de fotos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
