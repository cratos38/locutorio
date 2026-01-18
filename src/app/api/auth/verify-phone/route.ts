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
 * API para enviar código de verificación de teléfono
 * 
 * POST /api/auth/verify-phone
 * Body: { userId: string, phone: string, countryCode: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { userId, phone, countryCode } = body;
    
    if (!userId || !phone || !countryCode) {
      return NextResponse.json(
        { error: 'userId, phone y countryCode son requeridos' },
        { status: 400 }
      );
    }
    
    const fullPhone = `${countryCode}${phone}`;
    console.log(`📱 Enviando código de verificación a: ${fullPhone}`);
    
    // Verificar que el teléfono no esté registrado por otro usuario
    const { data: existingPhone, error: phoneCheckError } = await supabase
      .from('users')
      .select('id, username')
      .eq('phone', fullPhone)
      .neq('id', userId)
      .single();
    
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Este número de teléfono ya está registrado por otro usuario' },
        { status: 400 }
      );
    }
    
    // Guardar teléfono en el usuario (sin verificar aún)
    await supabase
      .from('users')
      .update({ 
        phone: fullPhone,
        phone_country_code: countryCode
      })
      .eq('id', userId);
    
    // Invalidar códigos anteriores
    await supabase
      .from('verification_codes')
      .update({ is_used: true })
      .eq('user_id', userId)
      .eq('type', 'phone');
    
    // Generar nuevo código de 6 dígitos
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar nuevo código (expira en 5 minutos para SMS)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_id: userId,
        code_hash: newCode, // En producción usar bcrypt
        type: 'phone',
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
    
    // TODO: Integrar con servicio de SMS (Twilio, Vonage, etc.)
    // Por ahora, devolvemos el código en desarrollo
    console.log(`📱 Código de verificación para ${fullPhone}: ${newCode}`);
    
    return NextResponse.json({
      success: true,
      message: 'Código enviado al teléfono',
      phone: `${countryCode}***${phone.slice(-4)}`,
      // Solo en desarrollo:
      devCode: process.env.NODE_ENV === 'development' ? newCode : undefined,
      expiresIn: 300
    });
    
  } catch (error) {
    console.error('❌ Error al enviar código de teléfono:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para verificar código de teléfono
 * 
 * PUT /api/auth/verify-phone
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
    
    console.log(`📱 Verificando código de teléfono para: ${userId}`);
    
    // Buscar el código de verificación
    const { data: verificationData, error: verificationError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'phone')
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
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
    
    // Comparar código
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
        phone_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ Error al actualizar usuario:', updateError.message);
    }
    
    console.log(`✅ Teléfono verificado para usuario: ${userId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Teléfono verificado correctamente. ¡Ganaste 30 días de PLUS gratis!'
    });
    
  } catch (error) {
    console.error('❌ Error en verificación de teléfono:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
