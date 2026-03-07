// API Route: Registro de nuevo usuario
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server';
import { executeD1Query } from '@/lib/d1';

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

    console.log('📝 [D1] Creando perfil para:', { firebase_uid, username, email });

    // Verificar si el username ya existe
    const existingUsers = await executeD1Query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (existingUsers && existingUsers.length > 0) {
      console.log('❌ [D1] Username ya existe:', username);
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    // Crear perfil en D1
    try {
      await executeD1Query(
        `INSERT INTO users (
          id, email, username, ciudad, edad, genero,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          firebase_uid, // Usar el UID de Firebase como ID
          email,
          username,
          ciudad || null,
          edad || null,
          genero || null
        ]
      );

      console.log('✅ [D1] Perfil creado exitosamente:', firebase_uid);

      return NextResponse.json({
        success: true,
        user: {
          id: firebase_uid,
          username: username,
          email: email,
        },
      });
    } catch (dbError) {
      console.error('❌ [D1] Error creando perfil:', dbError);
      return NextResponse.json(
        { error: 'Error al crear perfil en D1', details: String(dbError) },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
