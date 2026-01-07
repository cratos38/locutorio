import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Crear cliente de Supabase
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

/**
 * API para registrar un nuevo usuario
 * 
 * POST /api/auth/register
 * Body: {
 *   nombre: string (username/apodo)
 *   email: string
 *   password: string
 *   sexo?: string
 *   fechaNacimiento?: string
 *   paisCodigo?: string
 *   paisNombre?: string
 *   ciudad?: string
 *   estado?: string
 *   queBusca?: string
 *   buscarParejaPaisCodigo?: string
 *   buscarParejaPaisNombre?: string
 *   buscarParejaCiudad?: string
 *   buscarParejaEstado?: string
 *   foto?: File (opcional, si hay foto en el registro)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Leer el body como JSON
    const body = await request.json();
    const {
      nombre, // username/apodo
      email,
      password,
      sexo,
      fechaNacimiento,
      paisCodigo,
      paisNombre,
      ciudad,
      estado,
      queBusca,
      buscarParejaPaisCodigo,
      buscarParejaPaisNombre,
      buscarParejaCiudad,
      buscarParejaEstado,
    } = body;
    
    // Validar campos obligatorios
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: nombre, email, password' },
        { status: 400 }
      );
    }
    
    console.log(`📝 Registrando usuario: ${nombre} (${email})`);
    
    // 1. CREAR USUARIO EN SUPABASE AUTH
    // Nota: Supabase Auth usa el email como identificador único
    // NO podemos usar el "nombre" (username) directamente en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: nombre, // Guardar username en metadata
        }
      }
    });
    
    if (authError) {
      console.error('❌ Error al crear usuario en Auth:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      );
    }
    
    const userId = authData.user.id;
    console.log(`✅ Usuario creado en Auth: ${userId}`);
    
    // 2. CALCULAR EDAD (si hay fecha de nacimiento)
    let edad = null;
    if (fechaNacimiento) {
      const birthDate = new Date(fechaNacimiento);
      const today = new Date();
      edad = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        edad--;
      }
    }
    
    // 3. GUARDAR PERFIL EN TABLA USERS
    const profileData = {
      id: userId, // Usar el mismo ID de Auth
      username: nombre,
      email,
      nombre,
      edad,
      genero: sexo,
      ciudad,
      vives_en: estado,
      // Guardar datos de búsqueda de pareja si existen
      que_buscas: queBusca,
      // TODO: Guardar país de búsqueda (necesitaríamos campos adicionales en la tabla)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([profileData])
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Error al guardar perfil:', userError);
      
      // Si falla guardar el perfil, eliminar el usuario de Auth
      // (para mantener consistencia)
      await supabase.auth.admin.deleteUser(userId);
      
      return NextResponse.json(
        { error: 'Error al guardar el perfil: ' + userError.message },
        { status: 500 }
      );
    }
    
    console.log(`✅ Perfil guardado en DB: ${userData.username}`);
    
    // 4. ENVIAR EMAIL DE VERIFICACIÓN (opcional, Supabase lo hace automáticamente)
    // Supabase Auth envía el email de verificación automáticamente si está configurado
    
    // 5. RESPONDER CON ÉXITO
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: userId,
        username: nombre,
        email,
        emailVerified: false, // Por defecto no verificado
      },
      // Nota: El frontend debe llamar a signIn después de esto
      // O podemos auto-loguear al usuario aquí
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
