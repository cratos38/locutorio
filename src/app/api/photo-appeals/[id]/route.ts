import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Crear cliente de Supabase con auth token del request
const getSupabaseClient = (request: NextRequest) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  // Obtener token de autorización del header
  const authHeader = request.headers.get('authorization');
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
};

/**
 * PATCH /api/photo-appeals/[id]
 * Aprobar o rechazar una reclamación (solo admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient(request);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // Verificar que el usuario es admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = userData?.is_admin === true;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden revisar reclamaciones.' },
        { status: 403 }
      );
    }
    
    const appealId = params.id;
    const body = await request.json();
    const { action, admin_notes } = body;
    
    // Validar acción
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "approve" o "reject"' },
        { status: 400 }
      );
    }
    
    // Obtener la reclamación
    const { data: appeal, error: appealError } = await supabase
      .from('photo_appeals')
      .select('*, album_photos!inner(id, album_id, moderation_status)')
      .eq('id', appealId)
      .single();
    
    if (appealError || !appeal) {
      return NextResponse.json(
        { error: 'Reclamación no encontrada' },
        { status: 404 }
      );
    }
    
    if (appeal.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta reclamación ya ha sido revisada' },
        { status: 400 }
      );
    }
    
    const photo = appeal.album_photos;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    console.log('📸 Procesando appeal:', {
      appealId,
      action,
      photoId: photo?.id,
      currentStatus: photo?.moderation_status,
      newAppealStatus: newStatus
    });
    
    // Actualizar la reclamación
    const { error: updateAppealError } = await supabase
      .from('photo_appeals')
      .update({
        status: newStatus,
        admin_notes: admin_notes || null,
        admin_user_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', appealId);
    
    if (updateAppealError) {
      console.error('Error actualizando reclamación:', updateAppealError);
      return NextResponse.json(
        { error: 'Error al actualizar la reclamación' },
        { status: 500 }
      );
    }
    
    // Si se aprueba la reclamación, desbloquear la foto
    if (action === 'approve') {
      console.log('✅ Aprobando foto:', photo.id);
      
      const { data: updatedPhoto, error: updatePhotoError } = await supabase
        .from('album_photos')
        .update({
          moderation_status: 'approved',
          moderation_reason: 'Foto aprobada tras revisión manual por administrador',
          moderation_date: new Date().toISOString(),
        })
        .eq('id', photo.id)
        .select()
        .single();
      
      if (updatePhotoError) {
        console.error('❌ Error desbloqueando foto:', updatePhotoError);
        return NextResponse.json(
          { error: 'Error al desbloquear la foto' },
          { status: 500 }
        );
      }
      
      console.log('✅ Foto desbloqueada exitosamente:', updatedPhoto);
      
      // Si la foto estaba rechazada, incrementar contador del álbum
      if (photo.moderation_status === 'rejected') {
        const { data: album } = await supabase
          .from('albums')
          .select('photo_count')
          .eq('id', photo.album_id)
          .single();
        
        if (album) {
          await supabase
            .from('albums')
            .update({ photo_count: (album.photo_count || 0) + 1 })
            .eq('id', photo.album_id);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: action === 'approve' 
        ? 'Reclamación aprobada. La foto ha sido desbloqueada.'
        : 'Reclamación rechazada. La foto permanece bloqueada.',
      appeal: {
        id: appealId,
        status: newStatus,
        photo_updated: action === 'approve',
      }
    });
    
  } catch (error) {
    console.error('Error en PATCH /api/photo-appeals/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photo-appeals/[id]
 * Obtener detalles de una reclamación específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient(request);
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const appealId = params.id;
    
    const { data: appeal, error: appealError } = await supabase
      .from('photo_appeals')
      .select(`
        *,
        album_photos!inner(id, url, album_id, moderation_reason, moderation_status, moderation_score)
      `)
      .eq('id', appealId)
      .single();
    
    if (appealError || !appeal) {
      return NextResponse.json(
        { error: 'Reclamación no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar autorización
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = userData?.is_admin === true;
    const isOwner = appeal.user_id === user.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ appeal });
    
  } catch (error) {
    console.error('Error en GET /api/photo-appeals/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
