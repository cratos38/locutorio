import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization para evitar errores en build time
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * API de Administración de Fotos
 * 
 * GET - Obtener fotos pendientes de aprobación
 * PUT - Aprobar o rechazar foto
 */

// GET - Obtener fotos pendientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!adminId) {
      return NextResponse.json({ success: false, error: 'adminId requerido' }, { status: 400 });
    }

    // Verificar que es admin
    const { data: adminUser, error: adminError } = await getSupabaseAdmin()
      .from('users')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser?.is_admin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    // Obtener fotos según status
    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('album_photos')
      .select(`
        id,
        url,
        description,
        album_id,
        moderation_status,
        moderation_reason,
        moderation_score,
        moderation_date,
        created_at,
        albums!album_photos_album_id_fkey(
          id, 
          title, 
          privacy, 
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // IMPORTANTE: Siempre filtrar por status específico
    if (status === 'pending') {
      query = query.eq('moderation_status', 'pending_review');
    } else if (status === 'approved') {
      query = query.eq('moderation_status', 'approved');
    } else if (status === 'rejected') {
      query = query.eq('moderation_status', 'rejected');
    } else {
      // Si status es 'all' o cualquier otro, mostrar solo pending por defecto
      query = query.eq('moderation_status', 'pending_review');
    }
    
    // IMPORTANTE: Solo mostrar fotos de álbumes PÚBLICOS (privacy = 'public')
    // Los álbumes privados NO necesitan aprobación
    query = query.eq('albums.privacy', 'public');

    const { data: photos, error } = await query;

    if (error) throw error;

    // Obtener datos de usuarios para cada foto
    const photosWithUsers = await Promise.all((photos || []).map(async (photo: any) => {
      if (photo.albums && photo.albums.user_id) {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id, username, email, nombre')
          .eq('id', photo.albums.user_id)
          .single();
        
        return {
          ...photo,
          user: userData || null
        };
      }
      return { ...photo, user: null };
    }));

    // Contar estadísticas
    const { count: pendingCount } = await supabaseAdmin
      .from('album_photos')
      .select('id', { count: 'exact', head: true })
      .eq('moderation_status', 'pending_review');

    const { count: approvedCount } = await supabaseAdmin
      .from('album_photos')
      .select('id', { count: 'exact', head: true })
      .eq('moderation_status', 'approved');

    const { count: rejectedCount } = await supabaseAdmin
      .from('album_photos')
      .select('id', { count: 'exact', head: true })
      .eq('moderation_status', 'rejected');

    return NextResponse.json({
      success: true,
      photos: photosWithUsers || [],
      stats: {
        pendingCount: pendingCount || 0,
        approvedCount: approvedCount || 0,
        rejectedCount: rejectedCount || 0
      }
    });

  } catch (error) {
    console.error('Error en GET /api/admin/photos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}

// PUT - Aprobar o rechazar foto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, photoId, action, rejectionReason } = body;

    if (!adminId || !photoId || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'adminId, photoId y action son requeridos' 
      }, { status: 400 });
    }

    // Verificar que es admin
    const { data: adminUser, error: adminError } = await getSupabaseAdmin()
      .from('users')
      .select('is_admin, username')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser?.is_admin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    // Obtener info de la foto CON su álbum y usuario
    const { data: photo, error: photoError } = await getSupabaseAdmin()
      .from('album_photos')
      .select(`
        id, 
        url, 
        album_id,
        albums!album_photos_album_id_fkey(
          id,
          user_id
        )
      `)
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json({ success: false, error: 'Foto no encontrada' }, { status: 404 });
    }

    if (action === 'approve') {
      // Aprobar foto
      const { error } = await getSupabaseAdmin()
        .from('album_photos')
        .update({
          moderation_status: 'approved',
          moderation_reason: 'Aprobada por administrador',
          moderation_date: new Date().toISOString()
        })
        .eq('id', photoId);

      if (error) throw error;

      // Incrementar contador de fotos del álbum si estaba rechazada
      const { data: currentPhoto } = await getSupabaseAdmin()
        .from('album_photos')
        .select('moderation_status')
        .eq('id', photoId)
        .single();

      if (currentPhoto?.moderation_status === 'rejected') {
        await getSupabaseAdmin()
          .from('albums')
          .update({ photo_count: getSupabaseAdmin().rpc('increment_photo_count', { album_id: photo.album_id }) })
          .eq('id', photo.album_id);
      }

      console.log(`✅ Foto ${photoId} aprobada por admin ${adminId}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Foto aprobada correctamente' 
      });

    } else if (action === 'reject') {
      // Rechazar foto
      const { error } = await getSupabaseAdmin()
        .from('album_photos')
        .update({
          moderation_status: 'rejected',
          moderation_reason: rejectionReason || 'No cumple con las normas de la comunidad',
          moderation_date: new Date().toISOString()
        })
        .eq('id', photoId);

      if (error) throw error;

      console.log(`❌ Foto ${photoId} rechazada por admin ${adminId}: ${rejectionReason}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Foto rechazada correctamente' 
      });

    } else if (action === 'delete') {
      // Eliminar foto completamente
      const { error } = await getSupabaseAdmin()
        .from('album_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      console.log(`🗑️ Foto ${photoId} eliminada por admin ${adminId}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Foto eliminada permanentemente' 
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en PUT /api/admin/photos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}

// POST - Aprobar/rechazar múltiples fotos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, photoIds, action, rejectionReason } = body;

    if (!adminId || !photoIds || !Array.isArray(photoIds) || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'adminId, photoIds (array) y action son requeridos' 
      }, { status: 400 });
    }

    // Verificar que es admin
    const { data: adminUser, error: adminError } = await getSupabaseAdmin()
      .from('users')
      .select('is_admin')
      .eq('id', adminId)
      .single();

    if (adminError || !adminUser?.is_admin) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    let processedCount = 0;

    for (const photoId of photoIds) {
      try {
        if (action === 'approve') {
          await getSupabaseAdmin()
            .from('album_photos')
            .update({
              moderation_status: 'approved',
              moderation_reason: 'Aprobada por administrador',
              moderation_date: new Date().toISOString()
            })
            .eq('id', photoId);
        } else if (action === 'reject') {
          await getSupabaseAdmin()
            .from('album_photos')
            .update({
              moderation_status: 'rejected',
              moderation_reason: rejectionReason || 'No cumple con las normas',
              moderation_date: new Date().toISOString()
            })
            .eq('id', photoId);
        }
        processedCount++;
      } catch (err) {
        console.error(`Error procesando foto ${photoId}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${processedCount} fotos procesadas correctamente`,
      processedCount
    });

  } catch (error) {
    console.error('Error en POST /api/admin/photos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}
