import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/photo-reports/[id]
 * Procesar una denuncia (solo admin)
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
    
    // Verificar que el usuario es admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    const isAdmin = userData?.is_admin === true;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado. Solo administradores pueden procesar denuncias.' },
        { status: 403 }
      );
    }
    
    const reportId = params.id;
    const body = await request.json();
    const { action, admin_notes } = body;
    
    // Validar acción
    if (!['resolve', 'dismiss', 'remove_photo'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "resolve", "dismiss" o "remove_photo"' },
        { status: 400 }
      );
    }
    
    // Obtener la denuncia
    const { data: report, error: reportError } = await supabase
      .from('photo_reports')
      .select('*, album_photos!inner(id, album_id)')
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Denuncia no encontrada' },
        { status: 404 }
      );
    }
    
    if (report.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta denuncia ya ha sido procesada' },
        { status: 400 }
      );
    }
    
    const photo = report.album_photos;
    
    // Determinar el nuevo estado
    let newStatus = 'resolved';
    if (action === 'dismiss') {
      newStatus = 'dismissed';
    } else if (action === 'remove_photo') {
      newStatus = 'resolved';
    }
    
    // Actualizar la denuncia
    const { error: updateReportError } = await supabase
      .from('photo_reports')
      .update({
        status: newStatus,
        admin_notes: admin_notes || null,
        admin_user_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);
    
    if (updateReportError) {
      console.error('Error actualizando denuncia:', updateReportError);
      return NextResponse.json(
        { error: 'Error al actualizar la denuncia' },
        { status: 500 }
      );
    }
    
    // Si se decide eliminar la foto
    if (action === 'remove_photo') {
      // Marcar como rechazada
      const { error: updatePhotoError } = await supabase
        .from('album_photos')
        .update({
          moderation_status: 'rejected',
          moderation_reason: 'Foto reportada por usuarios y removida por administrador',
          moderation_date: new Date().toISOString(),
        })
        .eq('id', photo.id);
      
      if (updatePhotoError) {
        console.error('Error rechazando foto:', updatePhotoError);
        return NextResponse.json(
          { error: 'Error al rechazar la foto' },
          { status: 500 }
        );
      }
    }
    
    const messages = {
      resolve: 'Denuncia marcada como resuelta.',
      dismiss: 'Denuncia descartada. La foto permanece visible.',
      remove_photo: 'Denuncia resuelta. La foto ha sido bloqueada.',
    };
    
    return NextResponse.json({
      success: true,
      message: messages[action as keyof typeof messages],
      report: {
        id: reportId,
        status: newStatus,
        photo_updated: action === 'remove_photo',
      }
    });
    
  } catch (error) {
    console.error('Error en PATCH /api/photo-reports/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photo-reports/[id]
 * Obtener detalles de una denuncia específica
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
    
    const reportId = params.id;
    
    const { data: report, error: reportError } = await supabase
      .from('photo_reports')
      .select(`
        *,
        album_photos!inner(id, url, album_id)
      `)
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Denuncia no encontrada' },
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
    const isReporter = report.reporter_user_id === user.id;
    
    if (!isAdmin && !isReporter) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ report });
    
  } catch (error) {
    console.error('Error en GET /api/photo-reports/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
