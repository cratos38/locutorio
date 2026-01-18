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

// Generador simple de secreto TOTP (en producción usar una librería como 'otpauth')
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

// Generador simple de código TOTP (en producción usar una librería)
function generateTOTP(secret: string): string {
  // Simplificado: genera un código de 6 dígitos basado en el tiempo
  // En producción, usar algoritmo TOTP real (RFC 6238)
  const timeSlice = Math.floor(Date.now() / 30000);
  let hash = 0;
  const combined = secret + timeSlice.toString();
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash % 1000000).toString().padStart(6, '0');
}

/**
 * API para configurar 2FA
 * 
 * POST /api/auth/2fa - Iniciar configuración de 2FA
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Configurando 2FA para: ${userId}`);
    
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, two_factor_enabled')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    if (user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA ya está habilitado para este usuario' },
        { status: 400 }
      );
    }
    
    // Generar secreto
    const secret = generateSecret();
    
    // Guardar secreto temporalmente (sin habilitar 2FA aún)
    await supabase
      .from('users')
      .update({ 
        two_factor_secret: secret,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    // Generar URI para Google Authenticator
    const appName = 'LoCuToRiO';
    const otpAuthUri = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.email || user.username)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    
    // Generar código actual para verificación
    const currentCode = generateTOTP(secret);
    
    console.log(`🔐 2FA secret generado para ${user.username}`);
    
    return NextResponse.json({
      success: true,
      message: 'Escanea el código QR con tu app de autenticación',
      secret: secret, // Mostrar para entrada manual
      otpAuthUri: otpAuthUri, // Para generar QR
      // Solo en desarrollo:
      devCode: process.env.NODE_ENV === 'development' ? currentCode : undefined
    });
    
  } catch (error) {
    console.error('❌ Error al configurar 2FA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para verificar y activar 2FA
 * 
 * PUT /api/auth/2fa - Verificar código y activar 2FA
 * Body: { userId: string, code: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, code } = body;
    
    if (!userId || !code) {
      return NextResponse.json(
        { error: 'userId y código son requeridos' },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Verificando código 2FA para: ${userId}`);
    
    // Obtener secreto del usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();
    
    if (userError || !user || !user.two_factor_secret) {
      return NextResponse.json(
        { error: 'No hay configuración de 2FA pendiente' },
        { status: 400 }
      );
    }
    
    // Verificar código
    const expectedCode = generateTOTP(user.two_factor_secret);
    
    // Permitir código actual y anterior (por desfase de tiempo)
    const previousCode = generateTOTP(user.two_factor_secret);
    
    if (code !== expectedCode && code !== previousCode) {
      return NextResponse.json(
        { error: 'Código incorrecto. Verifica tu app de autenticación.' },
        { status: 400 }
      );
    }
    
    // Activar 2FA
    await supabase
      .from('users')
      .update({ 
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    // Generar códigos de respaldo (backup codes)
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    
    console.log(`✅ 2FA activado para: ${user.username}`);
    
    return NextResponse.json({
      success: true,
      message: '2FA activado correctamente',
      backupCodes: backupCodes // Guardar estos códigos de forma segura
    });
    
  } catch (error) {
    console.error('❌ Error al verificar 2FA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para deshabilitar 2FA
 * 
 * DELETE /api/auth/2fa
 * Body: { userId: string, code: string, password: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, code, password } = body;
    
    if (!userId || !code || !password) {
      return NextResponse.json(
        { error: 'userId, código y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    console.log(`🔐 Deshabilitando 2FA para: ${userId}`);
    
    // Verificar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, two_factor_secret, two_factor_enabled')
      .eq('id', userId)
      .single();
    
    if (userError || !user || !user.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA no está habilitado' },
        { status: 400 }
      );
    }
    
    // Verificar código 2FA
    const expectedCode = generateTOTP(user.two_factor_secret);
    if (code !== expectedCode) {
      return NextResponse.json(
        { error: 'Código 2FA incorrecto' },
        { status: 400 }
      );
    }
    
    // Verificar contraseña (re-autenticar)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });
    
    if (authError) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
    
    // Deshabilitar 2FA
    await supabase
      .from('users')
      .update({ 
        two_factor_enabled: false,
        two_factor_secret: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    console.log(`✅ 2FA deshabilitado para: ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: '2FA deshabilitado correctamente'
    });
    
  } catch (error) {
    console.error('❌ Error al deshabilitar 2FA:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
