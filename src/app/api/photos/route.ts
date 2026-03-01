import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Cliente ADMIN para queries (bypassing RLS)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 
                      process.env.SUPABASE_SERVICE_ROLE_KEY ||
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
};

// Cliente ANON para validar tokens de usuario
const getSupabaseAuth = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
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
    
    const supabaseAdmin = getSupabaseAdmin(); // Para queries
    const supabaseAuth = getSupabaseAuth();   // Para validar token
    console.log(`⏱️ [${Date.now() - startTime}ms] Clientes Supabase creados`);
    
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
    
    // Buscar user_id por username (usando ADMIN client)
    const userStartTime = Date.now();
    const { data: userData, error: userError } = await supabaseAdmin
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
    
    // Verificar si el usuario logueado es el DUEÑO del perfil (usando AUTH client)
    const authHeader = request.headers.get('authorization');
    let isOwner = false;
    
    console.log(`⏱️ [${Date.now() - startTime}ms] 🔐 Authorization header: ${authHeader ? 'presente' : 'ausente'}`);
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log(`⏱️ [${Date.now() - startTime}ms] 🔑 Token extraído (primeros 20 chars): ${token.substring(0, 20)}...`);
      
      // CAMBIO: Usar AUTH client para validar token
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      console.log(`⏱️ [${Date.now() - startTime}ms] 👤 Usuario del token: ${user?.id || 'NULL'}`);
      console.log(`⏱️ [${Date.now() - startTime}ms] 👤 Usuario del perfil: ${userId}`);
      
      if (authError) {
        console.log(`⏱️ [${Date.now() - startTime}ms] ❌ Error de autenticación: ${authError.message}`);
      }
      
      if (user && user.id === userId) {
        isOwner = true;
        console.log(`⏱️ [${Date.now() - startTime}ms] ✅ Usuario autenticado es el DUEÑO`);
      } else {
        console.log(`⏱️ [${Date.now() - startTime}ms] ℹ️ Usuario visitante o no autenticado (user=${!!user}, match=${user?.id === userId})`);
      }
    }
    
    // Construir query de fotos (usando ADMIN client para bypassear RLS)
    let query = supabaseAdmin
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('photo_type', 'profile'); // Solo fotos de perfil
    
    // LÓGICA CORRECTA:
    // - Si es el DUEÑO con showAll=true → Mostrar TODAS (pending, approved, rejected)
    // - Si NO es el dueño O showAll=false → Solo approved
    if (isOwner && showAll) {
      console.log(`⏱️ [${Date.now() - startTime}ms] 👤 Dueño ve TODAS sus fotos (pending, approved, rejected)`);
      // No filtrar por status - mostrar todo
    } else {
      console.log(`⏱️ [${Date.now() - startTime}ms] 👁️ Visitante ve solo fotos APROBADAS`);
      query = query.eq('status', 'approved');
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
    
    // Generar URLs correctas según el bucket
    const photosWithCorrectUrls = await Promise.all((photos || []).map(async (photo) => {
      try {
        // Determinar bucket según el storage_url
        let bucket = 'photos-pending';
        if (photo.storage_url && photo.storage_url.includes('/photos-approved/')) {
          bucket = 'photos-approved';
        } else if (photo.storage_url && photo.storage_url.includes('/photos-rejected/')) {
          bucket = 'photos-rejected';
        }
        
        // Si está en bucket público (photos-approved), la URL ya es pública
        if (bucket === 'photos-approved') {
          // No hacer nada, la URL ya es correcta
          return photo;
        }
        
        // Si está en bucket privado (photos-pending o photos-rejected), generar URL firmada
        const path = photo.storage_path;
        
        // storage_url (original)
        if (photo.storage_url && (bucket === 'photos-pending' || bucket === 'photos-rejected')) {
          const { data: signedData, error: signError } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, 3600); // válida por 1 hora
          
          if (!signError && signedData) {
            photo.storage_url = signedData.signedUrl;
          }
        }
        
        // cropped_url (medium)
        if (photo.cropped_url && (bucket === 'photos-pending' || bucket === 'photos-rejected')) {
          const croppedPath = path.replace(/\.(jpg|png)$/, '_medium.$1');
          const { data: signedData, error: signError } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(croppedPath, 3600);
          
          if (!signError && signedData) {
            photo.cropped_url = signedData.signedUrl;
          }
        }
        
        // thumbnail_url
        if (photo.thumbnail_url && (bucket === 'photos-pending' || bucket === 'photos-rejected')) {
          const thumbnailPath = path.replace(/\.(jpg|png)$/, '_thumbnail.$1');
          const { data: signedData, error: signError } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(thumbnailPath, 3600);
          
          if (!signError && signedData) {
            photo.thumbnail_url = signedData.signedUrl;
          }
        }
      } catch (err) {
        console.error('Error generando URLs:', err);
      }
      return photo;
    }));
    
    return NextResponse.json({
      success: true,
      photos: photosWithCorrectUrls
    });
    
  } catch (error) {
    console.error('❌ Error en API de fotos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
