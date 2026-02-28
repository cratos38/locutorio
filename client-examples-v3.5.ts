// ============================================================================
// EJEMPLOS DE CÓDIGO CLIENTE - ML VALIDATOR v3.5 + SUPABASE
// ============================================================================
// Ejemplos en TypeScript/JavaScript para React, Next.js, Vue, etc.

import { createClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SUPABASE_URL = 'https://tu-proyecto.supabase.co'
const SUPABASE_ANON_KEY = 'tu_anon_key'
const WEBHOOK_URL = 'http://192.168.1.159:5001/webhook/photo-uploaded' // Tu servidor

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ============================================================================
// 1. SUBIR FOTO DE PERFIL
// ============================================================================

export async function uploadProfilePhoto(file: File, userId: string) {
  try {
    console.log('📸 Subiendo foto de perfil...')
    
    // 1. Validar archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('El archivo no puede superar 10 MB')
    }
    
    // 2. Generar nombre único
    const timestamp = Date.now()
    const filename = `${userId}/${timestamp}_${file.name}`
    
    // 3. Subir a Storage (bucket privado)
    console.log('📤 Subiendo a Storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos-pending')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    console.log('✅ Foto subida a Storage')
    
    // 4. Insertar registro en tabla photos
    console.log('💾 Guardando en base de datos...')
    const { data: photoData, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'profile',
        storage_path: filename,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    
    console.log('✅ Registro creado en BD')
    
    // 5. Llamar al webhook para iniciar validación
    console.log('🔗 Llamando al webhook...')
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photo_id: photoData.id,
        user_id: userId,
        photo_type: 'profile',
        storage_path: filename
      })
    })
    
    if (!webhookResponse.ok) {
      throw new Error('Error al llamar al webhook')
    }
    
    const webhookResult = await webhookResponse.json()
    console.log('✅ Webhook llamado:', webhookResult)
    
    return {
      success: true,
      photoId: photoData.id,
      status: 'processing',
      message: 'Foto subida correctamente. Validando...'
    }
    
  } catch (error) {
    console.error('❌ Error subiendo foto:', error)
    throw error
  }
}

// ============================================================================
// 2. SUBIR FOTO DE ÁLBUM PÚBLICO
// ============================================================================

export async function uploadAlbumPhoto(
  file: File, 
  userId: string, 
  isPublic: boolean = true
) {
  try {
    const albumType = isPublic ? 'public' : 'private'
    console.log(`📸 Subiendo foto de álbum ${albumType}...`)
    
    // 1. Validar
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }
    
    // 2. Generar nombre
    const timestamp = Date.now()
    const filename = `${userId}/albums/${timestamp}_${file.name}`
    
    // 3. Bucket según tipo
    const bucket = isPublic ? 'photos-pending' : 'albums-private'
    
    // 4. Subir a Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file)
    
    if (uploadError) throw uploadError
    
    // 5. Insertar en BD
    const { data: photoData, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: userId,
        photo_type: 'album',
        album_type: albumType,
        storage_path: filename,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    
    // 6. Si es álbum privado, se aprueba automáticamente (ver trigger SQL)
    // Si es público, llamar webhook
    if (isPublic) {
      console.log('🔗 Llamando al webhook para álbum público...')
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_id: photoData.id,
          user_id: userId,
          photo_type: 'album',
          album_type: 'public',
          storage_path: filename
        })
      })
    }
    
    return {
      success: true,
      photoId: photoData.id,
      status: isPublic ? 'processing' : 'approved',
      message: isPublic 
        ? 'Foto pública subida. Validando...' 
        : 'Foto privada subida y aprobada automáticamente'
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// ============================================================================
// 3. VERIFICAR IDENTIDAD CON ID
// ============================================================================

export async function verifyIdentity(
  selfieFile: File,
  userId: string,
  profileAge: number
) {
  try {
    console.log('🆔 Iniciando verificación de identidad...')
    
    // 1. Subir selfie con ID
    const timestamp = Date.now()
    const filename = `${userId}/verification/${timestamp}_id_verification.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos-pending')
      .upload(filename, selfieFile)
    
    if (uploadError) throw uploadError
    
    // 2. Obtener URL temporal
    const { data: urlData } = await supabase.storage
      .from('photos-pending')
      .createSignedUrl(filename, 3600) // 1 hora
    
    if (!urlData) throw new Error('Error generando URL')
    
    // 3. Llamar al endpoint de verificación
    const ML_VALIDATOR_URL = 'http://192.168.1.159:5000'
    
    const response = await fetch(`${ML_VALIDATOR_URL}/verify-identity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selfieUrl: urlData.signedUrl,
        userId: userId,
        profileAge: profileAge
      })
    })
    
    const result = await response.json()
    
    // 4. Actualizar perfil si verificado
    if (result.verdict === 'VERIFIED') {
      await supabase
        .from('user_profiles')
        .update({
          verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
    
    // 5. Eliminar selfie con ID (ya no se necesita)
    await supabase.storage
      .from('photos-pending')
      .remove([filename])
    
    return result
    
  } catch (error) {
    console.error('❌ Error verificando identidad:', error)
    throw error
  }
}

// ============================================================================
// 4. ESCUCHAR CAMBIOS EN FOTOS (Realtime)
// ============================================================================

export function subscribeToPhotoUpdates(
  userId: string,
  onUpdate: (photo: any) => void
) {
  console.log('👂 Escuchando cambios en fotos...')
  
  const channel = supabase
    .channel('photo-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'photos',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('📸 Foto actualizada:', payload.new)
        onUpdate(payload.new)
      }
    )
    .subscribe()
  
  // Retornar función para cancelar suscripción
  return () => {
    console.log('👋 Cancelando suscripción')
    channel.unsubscribe()
  }
}

// ============================================================================
// 5. OBTENER NOTIFICACIONES
// ============================================================================

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) throw error
  
  return data
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  
  if (error) throw error
}

// ============================================================================
// 6. OBTENER FOTOS DEL USUARIO
// ============================================================================

export async function getUserPhotos(userId: string, photoType?: string) {
  let query = supabase
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (photoType) {
    query = query.eq('photo_type', photoType)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  return data
}

// ============================================================================
// 7. ELIMINAR FOTO RECHAZADA
// ============================================================================

export async function deleteRejectedPhoto(photoId: string, userId: string) {
  try {
    // 1. Obtener datos de la foto
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('id', photoId)
      .eq('user_id', userId)
      .eq('status', 'rejected')
      .single()
    
    if (fetchError) throw fetchError
    
    // 2. Eliminar de Storage
    const { error: storageError } = await supabase.storage
      .from('photos-pending')
      .remove([photo.storage_path])
    
    if (storageError) throw storageError
    
    // 3. Eliminar registro de BD
    const { error: deleteError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', userId)
    
    if (deleteError) throw deleteError
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error eliminando foto:', error)
    throw error
  }
}

// ============================================================================
// 8. MOVER FOTO A ÁLBUM PRIVADO
// ============================================================================

export async function moveToPrivateAlbum(photoId: string, userId: string) {
  try {
    // Cambiar tipo a álbum privado
    const { error } = await supabase
      .from('photos')
      .update({
        album_type: 'private',
        status: 'approved',  // Álbumes privados se aprueban automáticamente
        is_visible: true
      })
      .eq('id', photoId)
      .eq('user_id', userId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Error moviendo foto:', error)
    throw error
  }
}

// ============================================================================
// EJEMPLO DE USO EN COMPONENTE REACT
// ============================================================================

/*
import React, { useState, useEffect } from 'react'

export function PhotoUploader({ userId }) {
  const [uploading, setUploading] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  useEffect(() => {
    // Suscribirse a actualizaciones
    const unsubscribe = subscribeToPhotoUpdates(userId, (photo) => {
      if (photo.status === 'approved') {
        alert('✅ Tu foto fue aprobada!')
      } else if (photo.status === 'rejected') {
        alert(`❌ Tu foto fue rechazada: ${photo.rejection_reason}`)
      }
    })
    
    // Cargar notificaciones
    getNotifications(userId).then(setNotifications)
    
    return unsubscribe
  }, [userId])
  
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    
    try {
      await uploadProfilePhoto(file, userId)
      alert('Foto subida! Validando...')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Subiendo...</p>}
      
      <div>
        <h3>Notificaciones</h3>
        {notifications.map(notif => (
          <div key={notif.id}>
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
*/

// ============================================================================
// TIPOS TYPESCRIPT
// ============================================================================

export interface Photo {
  id: string
  user_id: string
  photo_type: 'profile' | 'album' | 'verification'
  album_type?: 'public' | 'private'
  storage_path: string
  storage_url?: string
  cropped_url?: string
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'manual_review' | 'auto_deleted'
  validation_result?: any
  rejection_reason?: string
  auto_delete: boolean
  is_visible: boolean
  is_primary: boolean
  created_at: string
  processed_at?: string
  approved_at?: string
  rejected_at?: string
  expires_at?: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'photo_approved' | 'photo_rejected' | 'photo_expiring' | 'photo_auto_deleted' | 'identity_verified'
  title: string
  message: string
  photo_id?: string
  read: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  username?: string
  display_name?: string
  bio?: string
  verified: boolean
  verified_at?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  total_photos: number
  approved_photos: number
  rejected_photos: number
  auto_deleted_photos: number
  created_at: string
  updated_at: string
}
