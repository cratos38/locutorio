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

// Middleware para verificar si es admin
async function verifyAdmin(supabase: any, adminId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', adminId)
    .single();
  
  return data?.is_admin === true;
}

/**
 * API para gestionar usuarios (ADMIN)
 * 
 * GET /api/admin/users - Listar usuarios con filtros
 * Query params: 
 *   - page: número de página
 *   - limit: usuarios por página
 *   - search: búsqueda por username/email
 *   - status: 'all', 'active', 'banned', 'unverified'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const adminId = searchParams.get('adminId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    
    if (!adminId) {
      return NextResponse.json({ error: 'adminId requerido' }, { status: 400 });
    }
    
    // Verificar que es admin
    const isAdmin = await verifyAdmin(supabase, adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Construir query
    let query = supabase
      .from('users')
      .select('id, username, email, nombre, edad, genero, ciudad, created_at, is_banned, is_verified, is_plus, email_verified, phone_verified, id_verified, presence_status, last_login', { count: 'exact' });
    
    // Filtro de búsqueda
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,nombre.ilike.%${search}%`);
    }
    
    // Filtro de estado
    switch (status) {
      case 'active':
        query = query.eq('is_banned', false);
        break;
      case 'banned':
        query = query.eq('is_banned', true);
        break;
      case 'unverified':
        query = query.eq('email_verified', false);
        break;
    }
    
    // Paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order('created_at', { ascending: false });
    
    const { data: users, error, count } = await query;
    
    if (error) {
      console.error('Error al obtener usuarios:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error en API admin/users:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * API para modificar usuario (ADMIN)
 * 
 * PUT /api/admin/users
 * Body: { adminId, userId, action, reason }
 * Actions: 'ban', 'unban', 'verify', 'make_admin', 'remove_admin'
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { adminId, userId, action, reason, duration } = body;
    
    if (!adminId || !userId || !action) {
      return NextResponse.json(
        { error: 'adminId, userId y action son requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar que es admin
    const isAdmin = await verifyAdmin(supabase, adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    console.log(`👮 Admin ${adminId} ejecutando: ${action} en usuario ${userId}`);
    
    let updateData: any = { updated_at: new Date().toISOString() };
    let actionType = '';
    
    switch (action) {
      case 'ban':
        updateData.is_banned = true;
        updateData.ban_reason = reason || 'Violación de términos de servicio';
        updateData.banned_at = new Date().toISOString();
        if (duration) {
          // duration en días
          updateData.banned_until = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
        }
        actionType = 'ban_user';
        break;
        
      case 'unban':
        updateData.is_banned = false;
        updateData.ban_reason = null;
        updateData.banned_at = null;
        updateData.banned_until = null;
        actionType = 'unban_user';
        break;
        
      case 'verify':
        updateData.is_verified = true;
        updateData.id_verified = true;
        actionType = 'verify_user';
        break;
        
      case 'make_admin':
        updateData.is_admin = true;
        actionType = 'make_admin';
        break;
        
      case 'remove_admin':
        updateData.is_admin = false;
        actionType = 'remove_admin';
        break;
        
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    
    // Actualizar usuario
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error al actualizar usuario:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Registrar acción de admin
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: actionType,
        target_user_id: userId,
        target_entity_type: 'user',
        target_entity_id: userId,
        reason: reason,
        details: { duration }
      });
    
    console.log(`✅ Acción ${action} completada en usuario ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: `Usuario ${action === 'ban' ? 'baneado' : action === 'unban' ? 'desbaneado' : 'actualizado'} correctamente`
    });
    
  } catch (error) {
    console.error('Error en API admin/users PUT:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * API para eliminar usuario (ADMIN)
 * 
 * DELETE /api/admin/users
 * Body: { adminId, userId, reason }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { adminId, userId, reason } = body;
    
    if (!adminId || !userId) {
      return NextResponse.json(
        { error: 'adminId y userId son requeridos' },
        { status: 400 }
      );
    }
    
    // Verificar que es admin
    const isAdmin = await verifyAdmin(supabase, adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    console.log(`👮 Admin ${adminId} eliminando usuario ${userId}`);
    
    // Obtener datos del usuario antes de eliminar
    const { data: user } = await supabase
      .from('users')
      .select('username, email')
      .eq('id', userId)
      .single();
    
    // Eliminar usuario de la tabla users
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteError) {
      console.error('Error al eliminar usuario:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
    
    // Registrar acción de admin
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'delete_user',
        target_user_id: userId,
        target_entity_type: 'user',
        target_entity_id: userId,
        reason: reason,
        details: { deleted_user: user }
      });
    
    console.log(`✅ Usuario ${userId} eliminado`);
    
    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error en API admin/users DELETE:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
