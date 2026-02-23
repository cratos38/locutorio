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

// Cliente admin para operaciones sin RLS
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
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
    const photoId = appeal.photo_id; // Usar photo_id directo de la reclamación
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    console.log('📸 Procesando reclamación:', {
      appealId,
      action,
      photoId: photoId,
      photoFromJoin: photo?.id,
      currentPhotoStatus: photo?.moderation_status,
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
      console.log('🔓 Intentando desbloquear foto ID:', photoId);
      
      // Usar cliente admin para saltarse RLS
      const supabaseAdmin = getSupabaseAdmin();
      
      // Verificar estado actual de la foto
      const { data: currentPhoto, error: fetchError } = await supabaseAdmin
        .from('album_photos')
        .select('id, moderation_status, album_id')
        .eq('id', photoId)
        .single();
      
      console.log('📷 Foto actual antes de actualizar:', currentPhoto);
      
      if (fetchError) {
        console.error('❌ Error al obtener foto:', fetchError);
        return NextResponse.json(
          { error: 'Error al verificar la foto' },
          { status: 500 }
        );
      }
      
      if (!currentPhoto) {
        console.error('❌ Foto no encontrada con ID:', photoId);
        return NextResponse.json(
          { error: 'Foto no encontrada' },
          { status: 404 }
        );
      }
      
      // Actualizar la foto usando admin client
      const { data: updatedPhoto, error: updatePhotoError } = await supabaseAdmin
        .from('album_photos')
        .update({
          moderation_status: 'approved',
          moderation_reason: 'Foto aprobada tras revisión manual por administrador',
          moderation_date: new Date().toISOString(),
        })
        .eq('id', photoId)
        .select()
        .single();
      
      if (updatePhotoError) {
        console.error('❌ Error desbloqueando foto:', updatePhotoError);
        return NextResponse.json(
          { error: 'Error al desbloquear la foto: ' + updatePhotoError.message },
          { status: 500 }
        );
      }
      
      console.log('✅ Foto desbloqueada exitosamente:', updatedPhoto);
      
      // Si la foto estaba rechazada, incrementar contador del álbum
      if (currentPhoto.moderation_status === 'rejected') {
        const { data: album } = await supabaseAdmin
          .from('albums')
          .select('photo_count')
          .eq('id', currentPhoto.album_id)
          .single();
        
        if (album) {
          const { error: updateAlbumError } = await supabaseAdmin
            .from('albums')
            .update({ photo_count: (album.photo_count || 0) + 1 })
            .eq('id', currentPhoto.album_id);
          
          if (updateAlbumError) {
            console.error('⚠️ Error actualizando contador álbum:', updateAlbumError);
          } else {
            console.log('✅ Contador de álbum incrementado');
          }
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
