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
 * API para verificar código de email
 * 
 * POST /api/auth/verify-email
 * Body: { userId: string, code: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, code, email } = body;
    
    if (!code || (!userId && !email)) {
      return NextResponse.json(
        { error: 'Código y usuario son requeridos' },
        { status: 400 }
      );
    }
    
    console.log(`📧 Verificando código de email para: ${userId || email}`);
    
    // Buscar el código de verificación
    let query = supabase
      .from('verification_codes')
      .select('*')
      .eq('type', 'email')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: verificationData, error: verificationError } = await query.single();
    
    if (verificationError || !verificationData) {
      console.error('❌ Código no encontrado o expirado');
      return NextResponse.json(
        { error: 'Código no válido o expirado. Solicita uno nuevo.' },
        { status: 400 }
      );
    }
    
    // Verificar intentos
    if (verificationData.attempts >= verificationData.max_attempts) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Solicita un nuevo código.' },
        { status: 429 }
      );
    }
    
    // Comparar código (en producción, esto debería ser bcrypt)
    // Por ahora usamos comparación simple
    const isCodeValid = verificationData.code_hash === code;
    
    if (!isCodeValid) {
      // Incrementar intentos
      await supabase
        .from('verification_codes')
        .update({ attempts: verificationData.attempts + 1 })
        .eq('id', verificationData.id);
      
      const attemptsLeft = verificationData.max_attempts - verificationData.attempts - 1;
      
      return NextResponse.json(
        { 
          error: `Código incorrecto. Te quedan ${attemptsLeft} intentos.`,
          attemptsLeft 
        },
        { status: 400 }
      );
    }
    
    // Código correcto - marcar como usado
    await supabase
      .from('verification_codes')
      .update({ is_used: true })
      .eq('id', verificationData.id);
    
    // Actualizar usuario como verificado
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationData.user_id);
    
    if (updateError) {
      console.error('❌ Error al actualizar usuario:', updateError.message);
    }
    
    console.log(`✅ Email verificado para usuario: ${verificationData.user_id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Email verificado correctamente',
      userId: verificationData.user_id
    });
    
  } catch (error) {
    console.error('❌ Error en verificación de email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para reenviar código de verificación de email
 * 
 * PUT /api/auth/verify-email
 * Body: { userId: string } o { email: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, email } = body;
    
    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Se requiere userId o email' },
        { status: 400 }
      );
    }
    
    // Buscar usuario
    let userQuery = supabase.from('users').select('id, email, username');
    
    if (userId) {
      userQuery = userQuery.eq('id', userId);
    } else {
      userQuery = userQuery.eq('email', email);
    }
    
    const { data: user, error: userError } = await userQuery.single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Invalidar códigos anteriores
    await supabase
      .from('verification_codes')
      .update({ is_used: true })
      .eq('user_id', user.id)
      .eq('type', 'email');
    
    // Generar nuevo código de 6 dígitos
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar nuevo código (expira en 60 segundos)
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: user.id,
        code_hash: newCode, // En producción usar bcrypt
        type: 'email',
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 3
      });
    
    if (insertError) {
      console.error('❌ Error al guardar código:', insertError.message);
      return NextResponse.json(
        { error: 'Error al generar código' },
        { status: 500 }
      );
    }
    
    // TODO: Enviar email con el código
    // Por ahora, devolvemos el código en desarrollo
    console.log(`📧 Nuevo código de verificación para ${user.email}: ${newCode}`);
    
    return NextResponse.json({
      success: true,
      message: 'Código reenviado correctamente',
      // Solo en desarrollo:
      devCode: process.env.NODE_ENV === 'development' ? newCode : undefined,
      expiresIn: 60
    });
    
  } catch (error) {
    console.error('❌ Error al reenviar código:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
