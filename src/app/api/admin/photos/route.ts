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
        albums!inner(
          id, 
          title, 
          privacy, 
          user_id,
          users!inner(id, username, email, nombre)
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

    const { data: photos, error } = await query;

    if (error) throw error;

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
      photos: photos || [],
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

    // Obtener info de la foto
    const { data: photo, error: photoError } = await getSupabaseAdmin()
      .from('user_photos')
      .select('id, user_id, url')
      .eq('id', photoId)
      .single();

    if (photoError || !photo) {
      return NextResponse.json({ success: false, error: 'Foto no encontrada' }, { status: 404 });
    }

    if (action === 'approve') {
      // Aprobar foto
      const { error } = await getSupabaseAdmin()
        .from('user_photos')
        .update({
          is_approved: true,
          is_rejected: false,
          rejection_reason: null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', photoId);

      if (error) throw error;

      // Crear notificación al usuario
      await getSupabaseAdmin().from('notifications').insert({
        user_id: photo.albums.users.id,
        type: 'photo_approved',
        title: 'Foto aprobada',
        message: 'Tu foto ha sido aprobada y ya es visible en tu perfil',
        reference_id: photoId,
        reference_type: 'photo'
      });

      // Registrar acción de admin
      await getSupabaseAdmin().from('admin_actions').insert({
        admin_id: adminId,
        action_type: 'approve_photo',
        target_type: 'photo',
        target_id: photoId,
        details: { user_id: photo.albums.users.id, username: photo.albums.users.username }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Foto aprobada correctamente' 
      });

    } else if (action === 'reject') {
      // Rechazar foto
      const { error } = await getSupabaseAdmin()
        .from('user_photos')
        .update({
          is_approved: false,
          is_rejected: true,
          rejection_reason: rejectionReason || 'No cumple con las normas de la comunidad',
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminId
        })
        .eq('id', photoId);

      if (error) throw error;

      // Crear notificación al usuario
      await getSupabaseAdmin().from('notifications').insert({
        user_id: photo.albums.users.id,
        type: 'photo_rejected',
        title: 'Foto rechazada',
        message: rejectionReason || 'Tu foto no cumple con las normas de la comunidad',
        reference_id: photoId,
        reference_type: 'photo'
      });

      // Registrar acción de admin
      await getSupabaseAdmin().from('admin_actions').insert({
        admin_id: adminId,
        action_type: 'reject_photo',
        target_type: 'photo',
        target_id: photoId,
        details: { user_id: photo.albums.users.id, username: photo.albums.users.username, reason: rejectionReason }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Foto rechazada' 
      });

    } else if (action === 'delete') {
      // Eliminar foto completamente
      const { error } = await getSupabaseAdmin()
        .from('user_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      // Registrar acción
      await getSupabaseAdmin().from('admin_actions').insert({
        admin_id: adminId,
        action_type: 'delete_photo',
        target_type: 'photo',
        target_id: photoId,
        details: { user_id: photo.albums.users.id, username: photo.albums.users.username, url: photo.url }
      });

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
            .from('user_photos')
            .update({
              is_approved: true,
              is_rejected: false,
              reviewed_at: new Date().toISOString(),
              reviewed_by: adminId
            })
            .eq('id', photoId);
        } else if (action === 'reject') {
          await getSupabaseAdmin()
            .from('user_photos')
            .update({
              is_approved: false,
              is_rejected: true,
              rejection_reason: rejectionReason || 'No cumple con las normas',
              reviewed_at: new Date().toISOString(),
              reviewed_by: adminId
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
