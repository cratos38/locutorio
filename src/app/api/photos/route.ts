import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

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
 * GET /api/photos?username=<username>&showAll=<true|false>
 * 
 * Parámetros:
 * - username: nombre de usuario (requerido)
 * - showAll: si es 'true', muestra TODAS las fotos (incluso pendientes)
 *            si es 'false' o no se proporciona, solo muestra aprobadas
 * 
 * Uso:
 * - Para perfil público: /api/photos?username=anam (solo aprobadas)
 * - Para dueño del perfil: /api/photos?username=anam&showAll=true (todas)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    console.log(`⏱️ [${Date.now() - startTime}ms] 🔥 API /api/photos v3.5 - NUEVA TABLA PHOTOS`);
    
    const supabase = getSupabaseClient();
    console.log(`⏱️ [${Date.now() - startTime}ms] Cliente Supabase creado`);
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const showAll = searchParams.get('showAll') === 'true';
    
    if (!username) {
      return NextResponse.json(
        { error: 'Falta parámetro username' },
        { status: 400 }
      );
    }
    
    console.log(`⏱️ [${Date.now() - startTime}ms] 📥 Obteniendo fotos para usuario: ${username} (showAll: ${showAll})`);
    
    // Buscar user_id por username
    const userStartTime = Date.now();
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    console.log(`⏱️ [${Date.now() - startTime}ms] Query users tardó: ${Date.now() - userStartTime}ms`);
    
    if (userError || !userData) {
      console.error('❌ Usuario no encontrado:', userError);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    const userId = userData.id;
    console.log(`⏱️ [${Date.now() - startTime}ms] User ID encontrado: ${userId}`);
    
    // Construir query de fotos
    let query = supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('photo_type', 'profile'); // Solo fotos de perfil
    
    // Si NO showAll, filtrar solo aprobadas
    if (!showAll) {
      query = query.eq('status', 'approved'); // Campo nuevo: 'status'
    }
    
    // Ordenar: principal primero, luego por display_order, luego por fecha
    const photosStartTime = Date.now();
    const { data: photos, error: photosError } = await query
      .order('is_primary', { ascending: false }) // Campo nuevo: 'is_primary'
      .order('display_order', { ascending: true }) // Campo nuevo: 'display_order'
      .order('created_at', { ascending: false });
    console.log(`⏱️ [${Date.now() - startTime}ms] Query photos tardó: ${Date.now() - photosStartTime}ms`);
    
    if (photosError) {
      console.error('❌ Error al obtener fotos:', photosError);
      return NextResponse.json(
        { error: 'Error al obtener fotos', details: photosError.message },
        { status: 500 }
      );
    }
    
    console.log(`⏱️ [${Date.now() - startTime}ms] ✅ ${photos?.length || 0} fotos encontradas - TOTAL: ${Date.now() - startTime}ms`);
    
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
