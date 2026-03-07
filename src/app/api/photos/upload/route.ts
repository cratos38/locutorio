import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, BUCKETS } from '@/lib/r2';
import { adminAuth } from '@/lib/firebase-admin';
import { executeD1Query } from '@/lib/d1';

// Cambiar a Node.js runtime (más compatible)
export const runtime = 'nodejs';

/**
 * API para subir fotos de perfil a Supabase Storage
 * 
 * POST /api/photos/upload
 * Body: FormData con:
 *   - file: archivo de imagen (File)
 *   - username: nombre de usuario (string)
 *   - isPrincipal: si es foto principal (boolean)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📥 === INICIO SUBIDA DE FOTO ===');
    
    // 🔐 Obtener token de autenticación del header (Firebase)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 Token recibido:', token ? '✅ SÍ' : '❌ NO');
    
    // 🔐 Verificar token de Firebase
    if (!token) {
      console.warn('⚠️ No se recibió token de autenticación');
      return NextResponse.json(
        { error: 'Se requiere autenticación' },
        { status: 401 }
      );
    }
    
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.verifyIdToken(token);
      console.log('✅ Usuario autenticado (Firebase):', firebaseUser.email, '| UID:', firebaseUser.uid);
    } catch (authError) {
      console.error('❌ Token inválido (Firebase):', authError);
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }
    
    // Obtener FormData
    console.log('📦 Obteniendo FormData...');
    const formData = await request.formData();
    const thumbnailFile = formData.get('thumbnail') as File;
    const mediumFile = formData.get('medium') as File;
    const largeFile = formData.get('large') as File;
    const username = formData.get('username') as string;
    const isPrincipal = formData.get('isPrincipal') === 'true';
    
    if (!thumbnailFile || !mediumFile || !largeFile || !username) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (thumbnail, medium, large, username)' },
        { status: 400 }
      );
    }
    
    console.log(`📤 Subiendo 3 versiones para usuario: ${username}`);
    console.log(`📏 Tamaños: thumbnail=${(thumbnailFile.size / 1024).toFixed(2)}KB, medium=${(mediumFile.size / 1024).toFixed(2)}KB, large=${(largeFile.size / 1024).toFixed(2)}KB`);
    
    // Generar nombre único para las fotos
    const timestamp = Date.now();
    const fileExt = largeFile.name.split('.').pop() || 'jpg';
    
    // Nombres de archivos para las 3 versiones
    const thumbnailFileName = `${username}/${timestamp}_thumbnail.${fileExt}`;
    const mediumFileName = `${username}/${timestamp}_medium.${fileExt}`;
    const largeFileName = `${username}/${timestamp}.${fileExt}`;
    
    // 1️⃣ Subir THUMBNAIL (96px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo thumbnail: ${thumbnailFileName}`);
    const thumbnailBuffer = new Uint8Array(await thumbnailFile.arrayBuffer());
    const thumbnailUrl = await uploadToR2(
      thumbnailBuffer,
      thumbnailFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      thumbnailFile.type
    );
    
    if (!thumbnailUrl) {
      console.error('❌ Error al subir thumbnail a R2');
      return NextResponse.json(
        { error: 'Error al subir thumbnail a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    // 2️⃣ Subir MEDIUM (400px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo medium: ${mediumFileName}`);
    const mediumBuffer = new Uint8Array(await mediumFile.arrayBuffer());
    const mediumUrl = await uploadToR2(
      mediumBuffer,
      mediumFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      mediumFile.type
    );
    
    if (!mediumUrl) {
      console.error('❌ Error al subir medium a R2');
      return NextResponse.json(
        { error: 'Error al subir medium a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    // 3️⃣ Subir LARGE (1024px) a Cloudflare R2 - photos-profile-pending
    console.log(`💾 [R2] Subiendo large: ${largeFileName}`);
    const largeBuffer = new Uint8Array(await largeFile.arrayBuffer());
    const photoUrl = await uploadToR2(
      largeBuffer,
      largeFileName,
      BUCKETS.PHOTOS_PROFILE_PENDING,
      largeFile.type
    );
    
    if (!photoUrl) {
      console.error('❌ Error al subir large a R2');
      return NextResponse.json(
        { error: 'Error al subir large a Cloudflare R2' },
        { status: 500 }
      );
    }
    
    console.log(`✅ [R2] 3 versiones subidas exitosamente a Cloudflare R2`);
    console.log(`  - Thumbnail (96px): ${thumbnailUrl}`);
    console.log(`  - Medium (400px): ${mediumUrl}`);
    console.log(`  - Large (1024px): ${photoUrl}`);
    
    // Buscar user_id por username en D1
    console.log('🔍 [D1] Buscando usuario:', username);
    const userResults = await executeD1Query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    
    if (!userResults || userResults.length === 0) {
      console.error('❌ Usuario no encontrado en D1');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    const userId = userResults[0].id;
    console.log('✅ [D1] Usuario encontrado, ID:', userId);
    
    // Si es foto principal, desmarcar las demás en D1
    if (isPrincipal) {
      console.log('⭐ [D1] Desmarcando otras fotos principales...');
      await executeD1Query(
        'UPDATE photos SET is_primary = 0 WHERE user_id = ? AND photo_type = ?',
        [userId, 'profile']
      );
    }
    
    // Guardar registro de la foto en D1
    console.log('💾 [D1] Guardando registro en tabla photos...');
    
    try {
      // INSERT en D1
      await executeD1Query(
        `INSERT INTO photos (
          user_id, photo_type, storage_path, storage_url, cropped_url,
          status, is_primary, is_visible, original_filename, file_size, mime_type,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          userId,
          'profile',
          largeFileName,
          photoUrl,
          mediumUrl,
          'pending',
          isPrincipal ? 1 : 0,
          0, // is_visible = false
          largeFile.name,
          largeFile.size,
          largeFile.type
        ]
      );
      
      // Obtener el ID de la foto recién insertada
      const [lastInsert] = await executeD1Query('SELECT last_insert_rowid() as id');
      const photoId = lastInsert.id;
      
      console.log('✅ [D1] Foto guardada exitosamente, ID:', photoId);
      console.log('📦 Almacenamiento: Cloudflare R2 (bucket: photos-profile-pending)');
      console.log('🗄️ Base de datos: Cloudflare D1 (SQLite)');
      console.log('🔄 Próximo paso: Configurar webhook para validación con ML Validator');
      
      return NextResponse.json({
        success: true,
        photo: {
          id: photoId,
          url: photoUrl,
          isPrincipal: isPrincipal,
          status: 'pending'
        }
      });
    } catch (dbError) {
      console.error('❌ [D1] Error al guardar registro de foto:', dbError);
      return NextResponse.json(
        { error: 'Error al guardar registro de foto en D1', details: String(dbError) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error en API de upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: String(error) },
      { status: 500 }
    );
  }
}
