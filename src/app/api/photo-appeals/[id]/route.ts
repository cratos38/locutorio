import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/photo-appeals/[id]
 * Aprobar o rechazar una reclamación (solo admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    // TODO: Verificar que el usuario es admin
    // Por ahora verificar si el user_role === 'admin' o similar
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.user_role === 'admin';
    
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
      const { error: updatePhotoError } = await supabase
        .from('album_photos')
        .update({
          moderation_status: 'approved',
          moderation_reason: 'Foto aprobada tras revisión manual por administrador',
          moderation_date: new Date().toISOString(),
        })
        .eq('id', photo.id);
      
      if (updatePhotoError) {
        console.error('Error desbloqueando foto:', updatePhotoError);
        return NextResponse.json(
          { error: 'Error al desbloquear la foto' },
          { status: 500 }
        );
      }
      
      // Actualizar contador de fotos del álbum si es necesario
      // (solo si la foto pasó de rejected a approved)
      if (photo.moderation_status === 'rejected') {
        await supabase.rpc('increment_album_photo_count', { 
          album_id: photo.album_id 
        });
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
    const supabase = createClient();
    
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
        album_photos!inner(id, url, album_id, moderation_reason, moderation_status, moderation_score),
        profiles!photo_appeals_user_id_fkey(username, full_name),
        admin_profiles:profiles!photo_appeals_admin_user_id_fkey(username, full_name)
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.user_role === 'admin';
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
