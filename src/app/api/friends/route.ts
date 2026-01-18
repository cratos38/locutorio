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
 * API de Amigos
 * 
 * GET - Obtener lista de amigos, solicitudes o bloqueados
 * POST - Enviar solicitud de amistad
 * PUT - Aceptar/rechazar solicitud, marcar favorito
 * DELETE - Eliminar amigo o desbloquear usuario
 */

// GET - Obtener amigos, solicitudes o bloqueados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'friends'; // friends, requests, blocked
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    if (type === 'friends') {
      // Obtener amigos (relaciones aceptadas)
      const { data: friendships, error } = await getSupabaseAdmin()
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_id,
          is_best_friend,
          created_at,
          friend:users!friendships_friend_id_fkey(
            id, username, nombre, edad, genero, ciudad, 
            avatar_url, presence_status, status_text, last_seen
          ),
          user:users!friendships_user_id_fkey(
            id, username, nombre, edad, genero, ciudad,
            avatar_url, presence_status, status_text, last_seen
          )
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Transformar datos para devolver siempre el "otro" usuario
      const friends = friendships?.map(f => {
        const isUser = f.user_id === userId;
        const friendData = isUser ? f.friend : f.user;
        
        return {
          id: friendData?.id,
          friendshipId: f.id,
          username: friendData?.username,
          name: friendData?.nombre || friendData?.username,
          age: friendData?.edad,
          city: friendData?.ciudad,
          gender: friendData?.genero === 'masculino' ? 'H' : friendData?.genero === 'femenino' ? 'M' : 'O',
          avatar: friendData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendData?.username}`,
          status: friendData?.presence_status || 'offline',
          statusText: friendData?.status_text,
          lastSeen: friendData?.last_seen,
          isBestFriend: f.is_best_friend,
          addedDate: f.created_at
        };
      }) || [];

      return NextResponse.json({ success: true, friends });

    } else if (type === 'requests') {
      // Obtener solicitudes pendientes recibidas
      const { data: requests, error } = await getSupabaseAdmin()
        .from('friendships')
        .select(`
          id,
          user_id,
          created_at,
          requester:users!friendships_user_id_fkey(
            id, username, nombre, edad, genero, ciudad,
            avatar_url
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      const friendRequests = requests?.map(r => ({
        id: r.id,
        requesterId: r.requester?.id,
        username: r.requester?.username,
        name: r.requester?.nombre || r.requester?.username,
        age: r.requester?.edad,
        city: r.requester?.ciudad,
        gender: r.requester?.genero === 'masculino' ? 'H' : r.requester?.genero === 'femenino' ? 'M' : 'O',
        avatar: r.requester?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.requester?.username}`,
        requestDate: r.created_at,
        mutualFriends: 0 // TODO: calcular amigos en común
      })) || [];

      return NextResponse.json({ success: true, requests: friendRequests });

    } else if (type === 'blocked') {
      // Obtener usuarios bloqueados
      const { data: blocked, error } = await getSupabaseAdmin()
        .from('blocked_users')
        .select(`
          id,
          blocked_user_id,
          created_at,
          blocked:users!blocked_users_blocked_user_id_fkey(
            id, username, nombre
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const blockedUsers = blocked?.map(b => ({
        id: b.id,
        blockedUserId: b.blocked?.id,
        username: b.blocked?.username,
        name: b.blocked?.nombre || b.blocked?.username,
        blockedDate: b.created_at
      })) || [];

      return NextResponse.json({ success: true, blocked: blockedUsers });
    }

    return NextResponse.json({ success: false, error: 'Tipo no válido' }, { status: 400 });

  } catch (error) {
    console.error('Error en GET /api/friends:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}

// POST - Enviar solicitud de amistad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetUserId, action } = body;

    if (!userId || !targetUserId) {
      return NextResponse.json({ success: false, error: 'userId y targetUserId requeridos' }, { status: 400 });
    }

    if (action === 'send_request') {
      // Verificar que no exista ya una relación
      const { data: existing } = await getSupabaseAdmin()
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return NextResponse.json({ success: false, error: 'Ya son amigos' }, { status: 400 });
        }
        if (existing.status === 'pending') {
          return NextResponse.json({ success: false, error: 'Ya hay una solicitud pendiente' }, { status: 400 });
        }
      }

      // Verificar que no esté bloqueado
      const { data: blocked } = await getSupabaseAdmin()
        .from('blocked_users')
        .select('id')
        .or(`and(user_id.eq.${userId},blocked_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},blocked_user_id.eq.${userId})`)
        .single();

      if (blocked) {
        return NextResponse.json({ success: false, error: 'No puedes enviar solicitud a este usuario' }, { status: 400 });
      }

      // Crear solicitud
      const { error } = await getSupabaseAdmin()
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      // Crear notificación
      await getSupabaseAdmin().from('notifications').insert({
        user_id: targetUserId,
        type: 'friend_request',
        title: 'Nueva solicitud de amistad',
        message: 'Alguien quiere ser tu amigo',
        reference_id: userId,
        reference_type: 'user'
      });

      return NextResponse.json({ success: true, message: 'Solicitud enviada' });

    } else if (action === 'block') {
      // Bloquear usuario
      // Primero eliminar cualquier amistad existente
      await getSupabaseAdmin()
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`);

      // Crear registro de bloqueo
      const { error } = await getSupabaseAdmin()
        .from('blocked_users')
        .insert({
          user_id: userId,
          blocked_user_id: targetUserId
        });

      if (error && !error.message.includes('duplicate')) throw error;

      return NextResponse.json({ success: true, message: 'Usuario bloqueado' });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en POST /api/friends:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}

// PUT - Aceptar/rechazar solicitud o marcar favorito
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, friendshipId, action, targetUserId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requerido' }, { status: 400 });
    }

    if (action === 'accept' && friendshipId) {
      // Aceptar solicitud de amistad
      const { error } = await getSupabaseAdmin()
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId)
        .eq('friend_id', userId); // Solo el receptor puede aceptar

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Solicitud aceptada' });

    } else if (action === 'reject' && friendshipId) {
      // Rechazar solicitud de amistad
      const { error } = await getSupabaseAdmin()
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .eq('friend_id', userId);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Solicitud rechazada' });

    } else if (action === 'toggle_best_friend' && targetUserId) {
      // Alternar estado de mejor amigo
      const { data: friendship } = await getSupabaseAdmin()
        .from('friendships')
        .select('id, is_best_friend')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`)
        .eq('status', 'accepted')
        .single();

      if (!friendship) {
        return NextResponse.json({ success: false, error: 'Amistad no encontrada' }, { status: 404 });
      }

      const { error } = await getSupabaseAdmin()
        .from('friendships')
        .update({ is_best_friend: !friendship.is_best_friend })
        .eq('id', friendship.id);

      if (error) throw error;

      return NextResponse.json({ 
        success: true, 
        message: friendship.is_best_friend ? 'Quitado de favoritos' : 'Agregado a favoritos',
        isBestFriend: !friendship.is_best_friend
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en PUT /api/friends:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}

// DELETE - Eliminar amigo o desbloquear usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const targetUserId = searchParams.get('targetUserId');
    const action = searchParams.get('action') || 'remove_friend';

    if (!userId || !targetUserId) {
      return NextResponse.json({ success: false, error: 'userId y targetUserId requeridos' }, { status: 400 });
    }

    if (action === 'remove_friend') {
      // Eliminar amistad
      const { error } = await getSupabaseAdmin()
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Amigo eliminado' });

    } else if (action === 'unblock') {
      // Desbloquear usuario
      const { error } = await getSupabaseAdmin()
        .from('blocked_users')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', targetUserId);

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Usuario desbloqueado' });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en DELETE /api/friends:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error interno' 
    }, { status: 500 });
  }
}
