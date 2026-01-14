import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

/**
 * API endpoint para mantener Supabase activo
 * 
 * Este endpoint se llama automáticamente cada día desde Vercel Cron
 * para evitar que Supabase pause el proyecto por inactividad.
 * 
 * GET /api/cron/keep-alive
 */
export async function GET(request: Request) {
  try {
    // Verificar que la petición viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Hacer una consulta simple para generar actividad
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Error en keep-alive:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Keep-alive ejecutado correctamente');
    console.log(`📊 Total usuarios: ${count}`);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive ejecutado',
      timestamp: new Date().toISOString(),
      userCount: count
    });
    
  } catch (error) {
    console.error('❌ Error en keep-alive:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
