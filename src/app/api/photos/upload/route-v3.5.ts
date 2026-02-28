import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// URL del webhook ML Validator
const ML_WEBHOOK_URL = process.env.ML_WEBHOOK_URL || 'http://192.168.1.159:5001/webhook/photo-uploaded';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

/**
 * API v3.5 - Subir fotos de PERFIL con validación ML en segundo plano
 * 
 * POST /api/photos/upload
 * Body: FormData con:
 *   - file: archivo de imagen (File)
 *   - username: nombre de usuario (string)
 *   - isPrincipal: si es foto principal (boolean, opcional)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📸 === UPLOAD FOTO DE PERFIL v3.5 ===');
    
    // 🔐 Autenticación
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Se requiere autenticación' },
        { status: 401 }
      );
    }
    
    const supabase = getSupabaseAdmin();
    
    // Verificar usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // Obtener FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;
    const isPrincipal = formData.get('isPrincipal') === 'true';
    
    if (!file || !username) {
      return NextResponse.json(
        { error: 'Faltan parámetros: file y username son requeridos' },
        { status: 400 }
      );
    }
    
    console.log(`📤 Subiendo foto para usuario: ${username}`);
    console.log(`📏 Tamaño: ${(file.size / 1024).toFixed(2)}KB`);
    console.log(`⭐ Es principal: ${isPrincipal}`);
    
    // Generar nombre único
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${timestamp}.${fileExt}`;
    
    // 1️⃣ SUBIR a photos-pending (nuevo bucket privado)
    console.log(`💾 Subiendo a photos-pending: ${fileName}`);
    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    
    const { error: uploadError } = await supabase.storage
      .from('photos-pending')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Error al subir:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir foto', details: uploadError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Foto subida a Storage');
    
    // 2️⃣ CREAR registro en tabla photos (nueva tabla)
    console.log('💾 Creando registro en tabla photos...');
    
    const { data: photoData, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        photo_type: 'profile',
        storage_path: fileName,
        original_filename: file.name,
        file_size: file.size,
        is_primary: isPrincipal,
        status: 'pending'  // Pendiente de validación
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error al guardar registro:', insertError);
      return NextResponse.json(
        { error: 'Error al guardar registro', details: insertError.message },
        { status: 500 }
      );
    }
    
    console.log('✅ Registro creado en BD:', photoData.id);
    
    // 3️⃣ LLAMAR webhook ML Validator (en segundo plano, NO esperar)
    console.log('🤖 Iniciando validación ML en segundo plano...');
    
    // Llamada asíncrona sin esperar respuesta
    fetch(ML_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photo_id: photoData.id,
        user_id: user.id,
        photo_type: 'profile',
        album_type: null,
        storage_path: fileName
      })
    }).catch(err => {
      console.error('⚠️ Error llamando al webhook ML:', err);
      // No bloquear el upload si el webhook falla
    });
    
    console.log('🚀 Validación ML iniciada en segundo plano');
    
    // 4️⃣ RESPONDER INMEDIATO al usuario (sin esperar validación)
    return NextResponse.json({
      success: true,
      message: 'Foto subida correctamente. Validando en segundo plano...',
      photo: {
        id: photoData.id,
        status: 'pending',
        isPrincipal: isPrincipal,
        createdAt: photoData.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Error en API de upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
