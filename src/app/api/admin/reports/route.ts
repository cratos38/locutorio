import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

async function verifyAdmin(supabase: any, adminId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', adminId)
    .single();
  
  return data?.is_admin === true;
}

/**
 * API para gestionar denuncias/reportes (ADMIN)
 * 
 * GET /api/admin/reports - Listar reportes
 * Query params:
 *   - adminId: ID del admin
 *   - status: 'pending', 'reviewing', 'resolved', 'dismissed', 'all'
 *   - priority: 'low', 'normal', 'high', 'urgent', 'all'
 *   - type: tipo de reporte
 *   - page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const adminId = searchParams.get('adminId');
    const status = searchParams.get('status') || 'pending';
    const priority = searchParams.get('priority') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!adminId) {
      return NextResponse.json({ error: 'adminId requerido' }, { status: 400 });
    }
    
    const isAdmin = await verifyAdmin(supabase, adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Construir query
    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id(id, username, email),
        reported_user:reported_user_id(id, username, email, is_banned)
      `, { count: 'exact' });
    
    // Filtros
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    if (type !== 'all') {
      query = query.eq('report_type', type);
    }
    
    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false })
      .order('priority', { ascending: false });
    
    const { data: reports, error, count } = await query;
    
    if (error) {
      console.error('Error al obtener reportes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Estadísticas
    const { data: stats } = await supabase
      .from('reports')
      .select('status, priority')
      .then(({ data }) => {
        const pendingCount = data?.filter(r => r.status === 'pending').length || 0;
        const urgentCount = data?.filter(r => r.priority === 'urgent' && r.status === 'pending').length || 0;
        const highCount = data?.filter(r => r.priority === 'high' && r.status === 'pending').length || 0;
        
        return {
          data: { pendingCount, urgentCount, highCount }
        };
      });
    
    return NextResponse.json({
      success: true,
      reports,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error en API admin/reports GET:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * API para actualizar reporte (ADMIN)
 * 
 * PUT /api/admin/reports
 * Body: { adminId, reportId, action, resolution, banUser, banDuration }
 * Actions: 'review', 'resolve', 'dismiss'
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { adminId, reportId, action, resolution, banUser, banDuration } = body;
    
    if (!adminId || !reportId || !action) {
      return NextResponse.json(
        { error: 'adminId, reportId y action son requeridos' },
        { status: 400 }
      );
    }
    
    const isAdmin = await verifyAdmin(supabase, adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    console.log(`👮 Admin ${adminId} procesando reporte ${reportId}: ${action}`);
    
    // Obtener reporte
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }
    
    let updateData: any = { updated_at: new Date().toISOString() };
    
    switch (action) {
      case 'review':
        updateData.status = 'reviewing';
        break;
        
      case 'resolve':
        updateData.status = 'resolved';
        updateData.resolution = resolution || 'Resuelto por administrador';
        updateData.resolved_by = adminId;
        updateData.resolved_at = new Date().toISOString();
        
        // Si se debe banear al usuario reportado
        if (banUser && report.reported_user_id) {
          await supabase
            .from('users')
            .update({
              is_banned: true,
              ban_reason: `Baneado por reporte: ${report.report_type}`,
              banned_at: new Date().toISOString(),
              banned_until: banDuration 
                ? new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000).toISOString()
                : null
            })
            .eq('id', report.reported_user_id);
          
          // Registrar acción
          await supabase
            .from('admin_actions')
            .insert({
              admin_id: adminId,
              action_type: 'ban_user',
              target_user_id: report.reported_user_id,
              target_entity_type: 'user',
              target_entity_id: report.reported_user_id,
              reason: `Baneado por reporte #${reportId}: ${report.report_type}`,
              details: { report_id: reportId, ban_duration: banDuration }
            });
        }
        break;
        
      case 'dismiss':
        updateData.status = 'dismissed';
        updateData.resolution = resolution || 'Reporte descartado - no se encontró violación';
        updateData.resolved_by = adminId;
        updateData.resolved_at = new Date().toISOString();
        break;
        
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    
    // Actualizar reporte
    const { error: updateError } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId);
    
    if (updateError) {
      console.error('Error al actualizar reporte:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Registrar acción
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: `report_${action}`,
        target_entity_type: 'report',
        target_entity_id: reportId,
        reason: resolution,
        details: { ban_user: banUser, ban_duration: banDuration }
      });
    
    console.log(`✅ Reporte ${reportId} ${action === 'resolve' ? 'resuelto' : action === 'dismiss' ? 'descartado' : 'en revisión'}`);
    
    return NextResponse.json({
      success: true,
      message: `Reporte ${action === 'resolve' ? 'resuelto' : action === 'dismiss' ? 'descartado' : 'marcado en revisión'} correctamente`
    });
    
  } catch (error) {
    console.error('Error en API admin/reports PUT:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * API para crear reporte (usuarios)
 * 
 * POST /api/admin/reports
 * Body: { reporterId, reportedUserId, reportType, description, evidenceUrls }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { 
      reporterId, 
      reportedUserId, 
      reportedMessageId,
      reportedRoomId,
      reportedPhotoId,
      reportType, 
      description, 
      evidenceUrls 
    } = body;
    
    if (!reporterId || !reportType) {
      return NextResponse.json(
        { error: 'reporterId y reportType son requeridos' },
        { status: 400 }
      );
    }
    
    // Determinar prioridad automática
    let priority = 'normal';
    if (['underage', 'harassment', 'threats'].includes(reportType)) {
      priority = 'high';
    }
    if (reportType === 'underage') {
      priority = 'urgent';
    }
    
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reported_message_id: reportedMessageId,
        reported_room_id: reportedRoomId,
        reported_photo_id: reportedPhotoId,
        report_type: reportType,
        description,
        evidence_urls: evidenceUrls || [],
        priority,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error al crear reporte:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log(`📝 Nuevo reporte creado: ${report.id} (${reportType})`);
    
    return NextResponse.json({
      success: true,
      message: 'Reporte enviado correctamente. Será revisado por un administrador.',
      reportId: report.id
    });
    
  } catch (error) {
    console.error('Error en API admin/reports POST:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
