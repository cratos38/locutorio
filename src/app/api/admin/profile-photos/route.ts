import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * GET /api/admin/profile-photos
 * Obtiene fotos de perfil para revisión
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pendiente';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const supabase = getSupabaseAdmin();
    
    // Obtener fotos según estado
    let query = supabase
      .from('profile_photos')
      .select(`
        id,
        user_id,
        url,
        url_thumbnail,
        url_medium,
        is_principal,
        estado,
        rejection_reason,
        manual_review,
        validation_data,
        validated_at,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Filtrar por estado
    if (status !== 'all') {
      query = query.eq('estado', status);
    }
    
    const { data: photos, error } = await query;
    
    if (error) throw error;
    
    // Enriquecer con datos de usuario
    const enrichedPhotos = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: userData } = await supabase
          .from('users')
          .select('id, username, email, nombre')
          .eq('id', photo.user_id)
          .single();
        
        return {
          ...photo,
          user: userData || null
        };
      })
    );
    
    // Contar estadísticas
    const { count: pendingCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');
    
    const { count: approvedCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobada');
    
    const { count: rejectedCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'rechazada');
    
    const { count: manualReviewCount } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('manual_review', true)
      .eq('estado', 'revision_manual');
    
    return NextResponse.json({
      success: true,
      photos: enrichedPhotos,
      stats: {
        pendingCount: pendingCount || 0,
        approvedCount: approvedCount || 0,
        rejectedCount: rejectedCount || 0,
        manualReviewCount: manualReviewCount || 0
      }
    });
    
  } catch (error) {
    console.error('Error en GET /api/admin/profile-photos:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: String(error)
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/profile-photos
 * Aprobar o rechazar una foto de perfil manualmente
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { photoId, action, reason } = body;
    
    if (!photoId || !action) {
      return NextResponse.json({ error: 'photoId y action son requeridos' }, { status: 400 });
    }
    
    const supabase = getSupabaseAdmin();
    
    let updateData: any = {};
    
    if (action === 'approve') {
      updateData = {
        estado: 'aprobada',
        rejection_reason: null,
        manual_review: false,
        validated_at: new Date().toISOString()
      };
    } else if (action === 'reject') {
      updateData = {
        estado: 'rechazada',
        rejection_reason: reason || 'Rechazada manualmente por el administrador',
        validated_at: new Date().toISOString()
      };
    } else {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('profile_photos')
      .update(updateData)
      .eq('id', photoId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Foto aprobada' : 'Foto rechazada'
    });
    
  } catch (error) {
    console.error('Error en PUT /api/admin/profile-photos:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: String(error)
    }, { status: 500 });
  }
}
