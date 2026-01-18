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

/**
 * API para iniciar sesión
 * 
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Intentando login: ${email}`);
    
    // 1. Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError.message);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo autenticar el usuario' },
        { status: 401 }
      );
    }
    
    const userId = authData.user.id;
    console.log(`✅ Usuario autenticado: ${userId}`);
    
    // 2. Obtener datos del perfil
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('❌ Error al obtener perfil:', userError.message);
      // El usuario existe en Auth pero no en users table, puede pasar
    }
    
    // 3. Actualizar último login
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        presence_status: 'online'
      })
      .eq('id', userId);
    
    // 4. Responder con sesión
    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: userId,
        email: authData.user.email,
        username: userData?.username || authData.user.user_metadata?.username,
        isAdmin: userData?.is_admin || false,
        emailVerified: authData.user.email_confirmed_at ? true : false,
        phoneVerified: userData?.phone_verified || false,
        idVerified: userData?.id_verified || false,
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      }
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
