import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/photo-appeals
 * Crear una nueva reclamación para una foto rechazada
 */
export async function POST(request: NextRequest) {
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
    
    const body = await request.json();
    const { photo_id, reason, description } = body;
    
    // Validaciones
    if (!photo_id || !reason || !description) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: photo_id, reason, description' },
        { status: 400 }
      );
    }
    
    if (description.trim().length < 20) {
      return NextResponse.json(
        { error: 'La descripción debe tener al menos 20 caracteres' },
        { status: 400 }
      );
    }
    
    // Verificar que la foto existe y está rechazada
    const { data: photo, error: photoError } = await supabase
      .from('album_photos')
      .select('id, album_id, moderation_status')
      .eq('id', photo_id)
      .single();
    
    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }
    
    if (photo.moderation_status !== 'rejected') {
      return NextResponse.json(
        { error: 'Solo puedes reclamar fotos que hayan sido rechazadas' },
        { status: 400 }
      );
    }
    
    // Verificar que el usuario es el dueño del álbum
    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('user_id')
      .eq('id', photo.album_id)
      .single();
    
    if (albumError || !album) {
      return NextResponse.json(
        { error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }
    
    if (album.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Solo el propietario del álbum puede reclamar fotos' },
        { status: 403 }
      );
    }
    
    // Verificar que no existe una reclamación previa
    const { data: existingAppeal } = await supabase
      .from('photo_appeals')
      .select('id')
      .eq('photo_id', photo_id)
      .eq('user_id', user.id)
      .single();
    
    if (existingAppeal) {
      return NextResponse.json(
        { error: 'Ya has reclamado esta foto anteriormente' },
        { status: 409 }
      );
    }
    
    // Crear la reclamación
    const { data: appeal, error: appealError } = await supabase
      .from('photo_appeals')
      .insert({
        photo_id,
        user_id: user.id,
        reason,
        description,
        status: 'pending',
      })
      .select()
      .single();
    
    if (appealError) {
      console.error('Error creando reclamación:', appealError);
      return NextResponse.json(
        { error: 'Error al crear la reclamación' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      appeal,
      message: 'Reclamación enviada. Un administrador la revisará en 24-48 horas.'
    });
    
  } catch (error) {
    console.error('Error en POST /api/photo-appeals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photo-appeals
 * Obtener reclamaciones del usuario o todas (si es admin)
 */
export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photo_id');
    const isAdmin = searchParams.get('admin') === 'true';
    
    let query = supabase
      .from('photo_appeals')
      .select(`
        *,
        album_photos!inner(id, url, album_id, moderation_reason),
        profiles!photo_appeals_user_id_fkey(username, full_name)
      `)
      .order('created_at', { ascending: false });
    
    // Si no es admin, solo ver sus propias reclamaciones
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    
    // Filtrar por foto específica si se solicita
    if (photoId) {
      query = query.eq('photo_id', photoId);
    }
    
    const { data: appeals, error: appealsError } = await query;
    
    if (appealsError) {
      console.error('Error obteniendo reclamaciones:', appealsError);
      return NextResponse.json(
        { error: 'Error al obtener reclamaciones' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ appeals });
    
  } catch (error) {
    console.error('Error en GET /api/photo-appeals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
