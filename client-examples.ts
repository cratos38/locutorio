// ============================================================================
// EJEMPLOS DE USO - Cliente de App (JavaScript/TypeScript)
// ============================================================================
// Ejemplos de cómo usar el sistema de validación desde tu app
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxxxx.supabase.co',
  'tu-anon-key-aquí'
)

// ============================================================================
// 1. SUBIR FOTO DE PERFIL
// ============================================================================

async function uploadProfilePhoto(userId: string, file: File) {
  try {
    console.log('📤 Subiendo foto de perfil...')
    
    // 1. Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}.${fileExt}`
    const storagePath = `${userId}/profile/${fileName}`
    
    // 2. Subir a Supabase Storage (bucket privado 'photos-pending')
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos-pending')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Error subiendo foto:', uploadError)
      throw uploadError
    }
    
    console.log('✅ Foto subida a storage:', storagePath)
    
    // 3. Crear registro en la tabla 'photos'
    // Esto dispara automáticamente el webhook de validación
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'profile',
        storage_path: storagePath,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()
    
    if (photoError) {
      console.error('❌ Error creando registro:', photoError)
      throw photoError
    }
    
    console.log('✅ Registro creado:', photoData.id)
    console.log('⏳ Foto en proceso de validación...')
    
    return {
      success: true,
      photoId: photoData.id,
      message: 'Foto subida. Validando...'
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 2. SUBIR FOTO DE ÁLBUM
// ============================================================================

async function uploadAlbumPhoto(userId: string, file: File, displayOrder: number = 0) {
  try {
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}.${fileExt}`
    const storagePath = `${userId}/album/${fileName}`
    
    // Subir a storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos-pending')
      .upload(storagePath, file)
    
    if (uploadError) throw uploadError
    
    // Crear registro
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'album',
        storage_path: storagePath,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        display_order: displayOrder
      })
      .select()
      .single()
    
    if (photoError) throw photoError
    
    return {
      success: true,
      photoId: photoData.id
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 3. VERIFICAR IDENTIDAD (Selfie con ID)
// ============================================================================

async function verifyIdentity(userId: string, profileAge: number, file: File) {
  try {
    console.log('🆔 Iniciando verificación de identidad...')
    
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `verification_${timestamp}.${fileExt}`
    const storagePath = `${userId}/verification/${fileName}`
    
    // Subir selfie con ID
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('photos-pending')
      .upload(storagePath, file)
    
    if (uploadError) throw uploadError
    
    // Crear registro de verificación
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'verification',
        storage_path: storagePath,
        original_filename: file.name
      })
      .select()
      .single()
    
    if (photoError) throw photoError
    
    console.log('✅ Selfie subido. Verificando identidad...')
    console.log('⚠️ IMPORTANTE: La foto se borrará automáticamente después de la verificación')
    
    return {
      success: true,
      photoId: photoData.id,
      message: 'Verificando identidad...'
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 4. ESCUCHAR ESTADO DE VALIDACIÓN EN TIEMPO REAL
// ============================================================================

function subscribeToPhotoStatus(photoId: string, callback: (status: string, data: any) => void) {
  console.log('👂 Escuchando cambios en foto:', photoId)
  
  const subscription = supabase
    .channel('photo-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'photos',
        filter: `id=eq.${photoId}`
      },
      (payload) => {
        const newRecord = payload.new
        console.log('📡 Estado actualizado:', newRecord.status)
        
        callback(newRecord.status, newRecord)
        
        // Si llegó a un estado final, desuscribirse
        if (['approved', 'rejected', 'manual_review'].includes(newRecord.status)) {
          subscription.unsubscribe()
        }
      }
    )
    .subscribe()
  
  return subscription
}

// Uso:
/*
const photoId = await uploadProfilePhoto(userId, file)

subscribeToPhotoStatus(photoId, (status, data) => {
  switch (status) {
    case 'processing':
      showMessage('⏳ Validando foto...')
      break
    
    case 'approved':
      showMessage('✅ ¡Foto aprobada!')
      // Actualizar UI con foto aprobada
      updateProfilePhoto(data.cropped_url)
      break
    
    case 'rejected':
      showMessage(`❌ Foto rechazada: ${data.rejection_reason}`)
      // Mostrar botón para subir otra foto
      showUploadButton()
      break
    
    case 'manual_review':
      showMessage('⚠️ Tu foto está en revisión manual')
      break
  }
})
*/


// ============================================================================
// 5. OBTENER FOTOS DEL USUARIO
// ============================================================================

async function getUserPhotos(userId: string) {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .eq('is_visible', true)
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true })
    
    if (error) throw error
    
    return {
      success: true,
      photos: data
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 6. ESTABLECER FOTO PRINCIPAL
// ============================================================================

async function setPrimaryPhoto(userId: string, photoId: string) {
  try {
    // Primero, quitar is_primary de todas las fotos del usuario
    await supabase
      .from('photos')
      .update({ is_primary: false })
      .eq('user_id', userId)
      .eq('photo_type', 'profile')
    
    // Luego, marcar la foto seleccionada como principal
    const { data, error } = await supabase
      .from('photos')
      .update({ is_primary: true })
      .eq('id', photoId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .select()
      .single()
    
    if (error) throw error
    
    return {
      success: true,
      photo: data
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 7. ELIMINAR FOTO RECHAZADA
// ============================================================================

async function deleteRejectedPhoto(userId: string, photoId: string) {
  try {
    // Obtener info de la foto
    const { data: photoData, error: fetchError } = await supabase
      .from('photos')
      .select('storage_path, status')
      .eq('id', photoId)
      .eq('user_id', userId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Verificar que está rechazada
    if (photoData.status !== 'rejected') {
      throw new Error('Solo se pueden eliminar fotos rechazadas')
    }
    
    // Eliminar del storage
    await supabase
      .storage
      .from('photos-pending')
      .remove([photoData.storage_path])
    
    // Eliminar registro
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId)
    
    if (deleteError) throw deleteError
    
    return {
      success: true,
      message: 'Foto eliminada'
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 8. OBTENER NOTIFICACIONES
// ============================================================================

async function getNotifications(userId: string, unreadOnly: boolean = false) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (unreadOnly) {
      query = query.eq('read', false)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return {
      success: true,
      notifications: data
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 9. MARCAR NOTIFICACIÓN COMO LEÍDA
// ============================================================================

async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 10. ESCUCHAR NOTIFICACIONES EN TIEMPO REAL
// ============================================================================

function subscribeToNotifications(userId: string, callback: (notification: any) => void) {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const notification = payload.new
        console.log('🔔 Nueva notificación:', notification.title)
        callback(notification)
      }
    )
    .subscribe()
  
  return subscription
}

// Uso:
/*
subscribeToNotifications(userId, (notification) => {
  // Mostrar notificación push o toast
  showNotification({
    title: notification.title,
    message: notification.message,
    type: notification.type
  })
  
  // Actualizar badge de notificaciones
  updateNotificationBadge()
})
*/


// ============================================================================
// 11. OBTENER ESTADÍSTICAS DEL USUARIO
// ============================================================================

async function getUserStats(userId: string) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('total_photos, approved_photos, rejected_photos, verified')
      .eq('id', userId)
      .single()
    
    if (profileError) throw profileError
    
    const { count: pendingCount } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
    
    return {
      success: true,
      stats: {
        total: profile.total_photos,
        approved: profile.approved_photos,
        rejected: profile.rejected_photos,
        pending: pendingCount,
        verified: profile.verified
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}


// ============================================================================
// 12. COMPONENTE REACT EJEMPLO
// ============================================================================

/*
import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth' // Tu hook de autenticación

function PhotoUploader() {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    if (user) {
      loadPhotos()
      
      // Suscribirse a notificaciones
      const subscription = subscribeToNotifications(user.id, (notification) => {
        if (notification.type === 'photo_approved') {
          loadPhotos() // Recargar fotos
        }
        
        // Mostrar notificación
        alert(notification.title + ': ' + notification.message)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadPhotos = async () => {
    const result = await getUserPhotos(user.id)
    if (result.success) {
      setPhotos(result.photos)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setStatus('Subiendo...')

    const result = await uploadProfilePhoto(user.id, file)
    
    if (result.success) {
      setStatus('Validando...')
      
      // Escuchar cambios
      subscribeToPhotoStatus(result.photoId, (newStatus, data) => {
        switch (newStatus) {
          case 'approved':
            setStatus('¡Aprobada!')
            loadPhotos()
            break
          case 'rejected':
            setStatus(`Rechazada: ${data.rejection_reason}`)
            break
          case 'manual_review':
            setStatus('En revisión manual')
            break
        }
        setUploading(false)
      })
    } else {
      setStatus('Error: ' + result.error)
      setUploading(false)
    }
  }

  return (
    <div>
      <h2>Mis Fotos</h2>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {status && <p>{status}</p>}
      
      <div className="photos-grid">
        {photos.map(photo => (
          <img
            key={photo.id}
            src={photo.cropped_url || photo.storage_url}
            alt="Foto de perfil"
            className={photo.is_primary ? 'primary' : ''}
          />
        ))}
      </div>
    </div>
  )
}

export default PhotoUploader
*/


// ============================================================================
// 13. EJEMPLO COMPLETO: Verificación de Identidad
// ============================================================================

/*
function IdentityVerification() {
  const { user, profile } = useAuth()
  const [file, setFile] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState('')

  const handleVerify = async () => {
    if (!file) {
      alert('Por favor selecciona una foto con tu ID')
      return
    }

    setVerifying(true)
    setStatus('Subiendo selfie con ID...')

    const result = await verifyIdentity(user.id, profile.age, file)
    
    if (result.success) {
      setStatus('Verificando identidad...')
      
      // Escuchar resultado
      subscribeToPhotoStatus(result.photoId, (newStatus, data) => {
        if (newStatus === 'approved') {
          setStatus('✅ ¡Identidad verificada!')
          // Actualizar perfil
          window.location.reload()
        } else if (newStatus === 'rejected') {
          setStatus(`❌ Verificación fallida: ${data.rejection_reason}`)
        }
        setVerifying(false)
      })
    } else {
      setStatus('Error: ' + result.error)
      setVerifying(false)
    }
  }

  if (profile?.verified) {
    return (
      <div className="verified-badge">
        ✅ Cuenta Verificada
      </div>
    )
  }

  return (
    <div className="identity-verification">
      <h3>🆔 Verificar Identidad</h3>
      <p>Toma un selfie sosteniendo tu ID/Cédula al lado de tu cara</p>
      
      <ul>
        <li>✅ Tu rostro debe estar claramente visible</li>
        <li>✅ La foto del ID debe ser legible</li>
        <li>✅ La fecha de nacimiento debe ser visible</li>
        <li>🔒 Tu privacidad está protegida - la foto se borra inmediatamente</li>
      </ul>
      
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={verifying}
      />
      
      <button onClick={handleVerify} disabled={!file || verifying}>
        {verifying ? 'Verificando...' : '📸 Verificar mi Identidad'}
      </button>
      
      {status && <p>{status}</p>}
    </div>
  )
}
*/


// ============================================================================
// EXPORTAR FUNCIONES
// ============================================================================

export {
  uploadProfilePhoto,
  uploadAlbumPhoto,
  verifyIdentity,
  subscribeToPhotoStatus,
  getUserPhotos,
  setPrimaryPhoto,
  deleteRejectedPhoto,
  getNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
  getUserStats
}
