import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/photo-reports
 * Crear una nueva denuncia para una foto
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
    const { photo_id, album_id, reason, description } = body;
    
    // Validaciones
    if (!photo_id || !album_id || !reason) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: photo_id, album_id, reason' },
        { status: 400 }
      );
    }
    
    // Verificar que la foto existe
    const { data: photo, error: photoError } = await supabase
      .from('album_photos')
      .select('id, album_id')
      .eq('id', photo_id)
      .single();
    
    if (photoError || !photo) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar que no existe una denuncia previa del mismo usuario para esta foto
    const { data: existingReport } = await supabase
      .from('photo_reports')
      .select('id')
      .eq('photo_id', photo_id)
      .eq('reporter_user_id', user.id)
      .single();
    
    if (existingReport) {
      return NextResponse.json(
        { error: 'Ya has denunciado esta foto anteriormente' },
        { status: 409 }
      );
    }
    
    // Crear la denuncia
    const { data: report, error: reportError } = await supabase
      .from('photo_reports')
      .insert({
        photo_id,
        album_id,
        reporter_user_id: user.id,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();
    
    if (reportError) {
      console.error('Error creando denuncia:', reportError);
      return NextResponse.json(
        { error: 'Error al crear la denuncia' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      report,
      message: 'Denuncia enviada. Un administrador la revisará pronto.'
    });
    
  } catch (error) {
    console.error('Error en POST /api/photo-reports:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photo-reports
 * Obtener denuncias del usuario o todas (si es admin)
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
    const status = searchParams.get('status') || 'all';
    
    let query = supabase
      .from('photo_reports')
      .select(`
        *,
        album_photos!inner(id, url, album_id)
      `)
      .order('created_at', { ascending: false });
    
    // Si no es admin, solo ver sus propias denuncias
    if (!isAdmin) {
      query = query.eq('reporter_user_id', user.id);
    }
    
    // Filtrar por foto específica si se solicita
    if (photoId) {
      query = query.eq('photo_id', photoId);
    }
    
    // Filtrar por status
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: reports, error: reportsError } = await query;
    
    if (reportsError) {
      console.error('Error obteniendo denuncias:', reportsError);
      return NextResponse.json(
        { error: 'Error al obtener denuncias' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ reports });
    
  } catch (error) {
    console.error('Error en GET /api/photo-reports:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
