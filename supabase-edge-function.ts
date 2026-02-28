// ============================================================================
// SUPABASE EDGE FUNCTION - Photo Validation
// ============================================================================
// Ruta: supabase/functions/validate-photo/index.ts
// 
// Esta función se activa cuando se sube una nueva foto y llama al ML Validator
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ML_VALIDATOR_URL = Deno.env.get('ML_VALIDATOR_URL') || 'http://192.168.1.159:5000'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    // Crear cliente de Supabase con permisos de admin
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Obtener datos del request
    const { record } = await req.json()
    const photoId = record.id
    const userId = record.user_id
    const photoType = record.photo_type
    const storagePath = record.storage_path

    console.log(`📸 Procesando foto: ${photoId} (tipo: ${photoType})`)

    // 1. Obtener URL con firma temporal del storage
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('photos-pending')
      .createSignedUrl(storagePath, 3600) // 1 hora de validez

    if (signedUrlError) {
      console.error('❌ Error obteniendo URL:', signedUrlError)
      throw new Error(`Error obteniendo URL: ${signedUrlError.message}`)
    }

    const photoUrl = signedUrlData.signedUrl

    // 2. Obtener edad del perfil del usuario (para validaciones)
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('age, gender')
      .eq('id', userId)
      .single()

    // 3. Llamar al ML Validator
    console.log(`🤖 Llamando a ML Validator: ${ML_VALIDATOR_URL}/validate`)
    
    const validationResponse = await fetch(`${ML_VALIDATOR_URL}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photoUrl: photoUrl,
        type: photoType,
        userId: userId,
        userAge: userProfile?.age,
        userGender: userProfile?.gender
      }),
    })

    if (!validationResponse.ok) {
      throw new Error(`ML Validator error: ${validationResponse.statusText}`)
    }

    const validationResult = await validationResponse.json()
    console.log(`✅ Resultado: ${validationResult.verdict}`)

    // 4. Procesar resultado
    const verdict = validationResult.verdict
    let newStatus: string
    let rejectionReason: string | null = null
    let croppedImageBase64: string | null = null

    switch (verdict) {
      case 'APPROVE':
        newStatus = 'approved'
        croppedImageBase64 = validationResult.cropped_image_base64
        break
      
      case 'MANUAL_REVIEW':
        newStatus = 'manual_review'
        rejectionReason = validationResult.message
        croppedImageBase64 = validationResult.cropped_image_base64
        break
      
      case 'REJECT':
        newStatus = 'rejected'
        rejectionReason = validationResult.message
        break
      
      case 'ERROR':
        newStatus = 'rejected'
        rejectionReason = `Error de procesamiento: ${validationResult.message}`
        break
      
      default:
        newStatus = 'rejected'
        rejectionReason = 'Resultado desconocido'
    }

    // 5. Si fue aprobada, subir imagen recortada al storage público
    let croppedUrl: string | null = null
    
    if (croppedImageBase64 && newStatus === 'approved') {
      try {
        // Convertir base64 a blob
        const base64Data = croppedImageBase64.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        // Nombre del archivo recortado
        const croppedPath = `${userId}/${photoType}/${photoId}_cropped.jpg`
        
        // Subir a storage público
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('photos-cropped')
          .upload(croppedPath, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadError) {
          console.error('⚠️ Error subiendo imagen recortada:', uploadError)
        } else {
          // Obtener URL pública
          const { data: publicUrlData } = supabaseAdmin
            .storage
            .from('photos-cropped')
            .getPublicUrl(croppedPath)
          
          croppedUrl = publicUrlData.publicUrl
          console.log(`✅ Imagen recortada guardada: ${croppedUrl}`)
        }
      } catch (uploadErr) {
        console.error('⚠️ Error procesando imagen recortada:', uploadErr)
      }
    }

    // 6. Actualizar registro en la base de datos
    const updateData: any = {
      status: newStatus,
      validation_result: validationResult,
      rejection_reason: rejectionReason,
      processed_at: new Date().toISOString(),
      cropped_url: croppedUrl
    }

    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString()
      updateData.is_visible = true
      
      // Si es foto de perfil y es la primera aprobada, marcarla como principal
      const { count } = await supabaseAdmin
        .from('photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('photo_type', 'profile')
        .eq('status', 'approved')
      
      if (count === 0) {
        updateData.is_primary = true
      }
    } else if (newStatus === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
      // expires_at se establece automáticamente por el trigger
    }

    const { error: updateError } = await supabaseAdmin
      .from('photos')
      .update(updateData)
      .eq('id', photoId)

    if (updateError) {
      console.error('❌ Error actualizando foto:', updateError)
      throw new Error(`Error actualizando foto: ${updateError.message}`)
    }

    console.log(`✅ Foto ${photoId} actualizada: ${newStatus}`)

    // 7. Responder
    return new Response(
      JSON.stringify({
        success: true,
        photoId: photoId,
        status: newStatus,
        message: `Foto procesada: ${newStatus}`,
        validationResult: validationResult
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error en Edge Function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
