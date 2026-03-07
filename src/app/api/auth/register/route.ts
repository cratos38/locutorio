// API Route: Registro de nuevo usuario
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firebase_uid, 
      email, 
      username,
      ciudad,
      edad,
      genero 
    } = body;

    // Validaciones básicas
    if (!firebase_uid || !email || !username) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    console.log('📝 Creando perfil en Supabase para:', { firebase_uid, username, email });

    // Verificar si el username ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    // Crear perfil en Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: firebase_uid, // Usar el UID de Firebase como ID
        email,
        username,
        ciudad: ciudad || null,
        edad: edad || null,
        genero: genero || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando perfil en Supabase:', error);
      return NextResponse.json(
        { error: 'Error al crear perfil', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Perfil creado exitosamente:', data.id);

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
      },
    });

  } catch (error: any) {
    console.error('❌ Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
