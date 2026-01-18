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
 * API para verificación de identidad (ID + selfie)
 * 
 * POST /api/auth/verify-identity
 * Body: FormData con:
 *   - idDocument: File (foto del documento)
 *   - selfie: File (selfie del usuario)
 *   - documentType: string (cedula, pasaporte, licencia)
 *   - userId: string
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as string;
    const idDocument = formData.get('idDocument') as File | null;
    const selfie = formData.get('selfie') as File | null;
    
    if (!userId || !documentType || !idDocument || !selfie) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos: userId, documentType, idDocument, selfie' },
        { status: 400 }
      );
    }
    
    console.log(`🆔 Iniciando verificación de identidad para: ${userId}`);
    console.log(`📄 Tipo de documento: ${documentType}`);
    
    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, fecha_nacimiento')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar si ya tiene una solicitud pendiente
    const { data: existingVerification } = await supabase
      .from('identity_verifications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();
    
    if (existingVerification) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud de verificación pendiente' },
        { status: 400 }
      );
    }
    
    // Subir archivos a Supabase Storage
    const timestamp = Date.now();
    
    // Subir documento de identidad
    const idDocBuffer = await idDocument.arrayBuffer();
    const idDocPath = `identity/${userId}/${timestamp}_id.${idDocument.name.split('.').pop()}`;
    
    const { data: idUpload, error: idUploadError } = await supabase.storage
      .from('identity-documents')
      .upload(idDocPath, idDocBuffer, {
        contentType: idDocument.type,
        upsert: true
      });
    
    if (idUploadError) {
      console.error('❌ Error al subir documento:', idUploadError.message);
      return NextResponse.json(
        { error: 'Error al subir el documento de identidad' },
        { status: 500 }
      );
    }
    
    // Subir selfie
    const selfieBuffer = await selfie.arrayBuffer();
    const selfiePath = `identity/${userId}/${timestamp}_selfie.${selfie.name.split('.').pop()}`;
    
    const { data: selfieUpload, error: selfieUploadError } = await supabase.storage
      .from('identity-documents')
      .upload(selfiePath, selfieBuffer, {
        contentType: selfie.type,
        upsert: true
      });
    
    if (selfieUploadError) {
      console.error('❌ Error al subir selfie:', selfieUploadError.message);
      return NextResponse.json(
        { error: 'Error al subir la selfie' },
        { status: 500 }
      );
    }
    
    // Obtener URLs
    const { data: idUrl } = supabase.storage
      .from('identity-documents')
      .getPublicUrl(idDocPath);
    
    const { data: selfieUrl } = supabase.storage
      .from('identity-documents')
      .getPublicUrl(selfiePath);
    
    // Crear registro de verificación
    const { data: verification, error: verificationError } = await supabase
      .from('identity_verifications')
      .insert({
        user_id: userId,
        id_document_url: idUrl.publicUrl,
        selfie_url: selfieUrl.publicUrl,
        id_document_type: documentType,
        status: 'pending',
        // TODO: Integrar con servicio de IA para verificación automática
        ai_confidence_score: null,
        ai_face_match: null
      })
      .select()
      .single();
    
    if (verificationError) {
      console.error('❌ Error al crear verificación:', verificationError.message);
      return NextResponse.json(
        { error: 'Error al crear la solicitud de verificación' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Solicitud de verificación creada: ${verification.id}`);
    
    // TODO: Aquí se integraría con un servicio de IA para:
    // 1. OCR del documento (extraer nombre, fecha de nacimiento)
    // 2. Comparación facial (selfie vs foto del documento)
    // 3. Verificación de autenticidad del documento
    
    // Por ahora, la verificación es manual
    
    return NextResponse.json({
      success: true,
      message: 'Solicitud de verificación enviada. Será revisada en las próximas 24-48 horas.',
      verificationId: verification.id,
      status: 'pending'
    });
    
  } catch (error) {
    console.error('❌ Error en verificación de identidad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * API para obtener estado de verificación de identidad
 * 
 * GET /api/auth/verify-identity?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }
    
    const { data: verification, error } = await supabase
      .from('identity_verifications')
      .select('id, status, rejection_reason, created_at, reviewed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !verification) {
      return NextResponse.json({
        success: true,
        hasVerification: false,
        message: 'No hay solicitud de verificación'
      });
    }
    
    return NextResponse.json({
      success: true,
      hasVerification: true,
      verification: {
        id: verification.id,
        status: verification.status,
        rejectionReason: verification.rejection_reason,
        createdAt: verification.created_at,
        reviewedAt: verification.reviewed_at
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener verificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
