import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Crear cliente de Supabase (compatible con Edge Runtime)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const data = await request.json();
    
    console.log('📥 API recibió datos:', Object.keys(data));
    
    // Calcular porcentaje de completado del perfil
    const totalFields = 50; // Aproximado de campos importantes
    let filledFields = 0;
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        if (Array.isArray(value) && value.length > 0) filledFields++;
        else if (value !== null && value !== undefined && value !== '') filledFields++;
      }
    });
    
    const profileCompletion = Math.round((filledFields / totalFields) * 100);
    
    console.log(`📊 Perfil completado: ${profileCompletion}% (${filledFields}/${totalFields} campos)`);
    
    // Insertar o actualizar en Supabase
    console.log('💾 Guardando en Supabase...');
    const { data: result, error } = await supabase
      .from('users')
      .upsert({
        ...data,
        profile_completion: profileCompletion,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'username'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ 
        success: false,
        error: `Supabase error: ${error.message}`,
        details: error 
      }, { status: 400 });
    }
    
    console.log('✅ Perfil guardado exitosamente');
    return NextResponse.json({ success: true, data: result, profileCompletion });
  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error al guardar el perfil: ${error.message}`,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username requerido' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Error al obtener el perfil' }, { status: 500 });
  }
}
