-- ============================================================================
-- SUPABASE SCHEMA - ML PHOTO VALIDATOR v3.5
-- ============================================================================
-- CAMBIOS v3.5:
-- - Soporte para 3 tipos de fotos: profile, album_public, album_private
-- - Auto-eliminación de armas/drogas sin esperar 24h
-- - Campo album_type para distinguir público/privado
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE FOTOS (actualizada para v3.5)
-- ============================================================================

CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo de foto (actualizado v3.5)
    photo_type TEXT NOT NULL CHECK (photo_type IN ('profile', 'album', 'verification')),
    
    -- Nuevo v3.5: Tipo de álbum (solo para album)
    album_type TEXT CHECK (album_type IN ('public', 'private')) DEFAULT 'public',
    
    -- URLs de storage
    storage_path TEXT NOT NULL, -- Ruta en Supabase Storage
    storage_url TEXT, -- URL pública (si está aprobada)
    cropped_url TEXT, -- URL de la foto recortada (solo para perfil)
    
    -- Estado de validación
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'manual_review', 'auto_deleted')),
    
    -- Resultados de validación
    validation_result JSONB, -- Resultado completo del ML Validator
    rejection_reason TEXT,
    auto_delete BOOLEAN DEFAULT false, -- Nuevo v3.5: Si debe borrarse automáticamente (armas/drogas)
    
    -- Metadatos
    original_filename TEXT,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    
    -- Orden (para fotos de álbum)
    display_order INTEGER DEFAULT 0,
    
    -- Visibilidad
    is_visible BOOLEAN DEFAULT false, -- Solo visible si está aprobada
    is_primary BOOLEAN DEFAULT false, -- Foto principal del perfil
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ, -- Nuevo v3.5: Cuando fue auto-eliminada
    expires_at TIMESTAMPTZ -- Para auto-eliminar fotos rechazadas después de 24h (solo si auto_delete=false)
);

-- Constraint único para foto principal (fuera de la tabla)
CREATE UNIQUE INDEX unique_user_primary_photo 
ON photos(user_id, is_primary) 
WHERE (is_primary = true AND status = 'approved');

-- Índices para búsquedas rápidas
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_status ON photos(status);
CREATE INDEX idx_photos_type ON photos(photo_type);
CREATE INDEX idx_photos_album_type ON photos(album_type) WHERE photo_type = 'album';
CREATE INDEX idx_photos_expires_at ON photos(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_photos_pending ON photos(user_id, status) WHERE status = 'pending';
CREATE INDEX idx_photos_auto_delete ON photos(auto_delete) WHERE auto_delete = true;


-- ============================================================================
-- 2. TABLA DE USUARIOS (extensión)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información básica
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    
    -- Verificación de identidad
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    -- Edad declarada (para verificación)
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    
    -- Estadísticas de fotos
    total_photos INTEGER DEFAULT 0,
    approved_photos INTEGER DEFAULT 0,
    rejected_photos INTEGER DEFAULT 0,
    auto_deleted_photos INTEGER DEFAULT 0, -- Nuevo v3.5
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- 3. TABLA DE NOTIFICACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo de notificación (actualizado v3.5)
    type TEXT NOT NULL CHECK (type IN (
        'photo_approved', 
        'photo_rejected', 
        'photo_expiring', 
        'photo_auto_deleted',  -- Nuevo v3.5
        'identity_verified'
    )),
    
    -- Contenido
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Relacionado con foto (opcional)
    photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
    
    -- Estado
    read BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);


-- ============================================================================
-- 4. SUPABASE STORAGE BUCKETS
-- ============================================================================

-- Bucket para fotos pendientes (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos-pending',
    'photos-pending',
    false, -- Privado
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos aprobadas (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos-approved',
    'photos-approved',
    true, -- Público
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para fotos recortadas (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos-cropped',
    'photos-cropped',
    true, -- Público
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para álbumes privados (privado)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'albums-private',
    'albums-private',
    false, -- Privado
    10485760, -- 10 MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para PHOTOS
-- Usuarios solo pueden ver sus propias fotos + fotos aprobadas de otros (públicas)
CREATE POLICY "Users can view own photos" ON photos
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view approved public photos" ON photos
    FOR SELECT
    USING (status = 'approved' AND is_visible = true AND (photo_type = 'profile' OR album_type = 'public'));

CREATE POLICY "Users can insert own photos" ON photos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending photos" ON photos
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending', 'rejected'));

CREATE POLICY "Users can delete own rejected photos" ON photos
    FOR DELETE
    USING (auth.uid() = user_id AND status = 'rejected');

-- Políticas para USER_PROFILES
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON user_profiles
    FOR SELECT
    USING (true); -- Todos pueden ver perfiles básicos

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);


-- ============================================================================
-- 6. FUNCIONES
-- ============================================================================

-- Función: Crear notificación
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_photo_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, photo_id)
    VALUES (p_user_id, p_type, p_title, p_message, p_photo_id)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;


-- Función: Actualizar estadísticas del usuario
CREATE OR REPLACE FUNCTION update_user_photo_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE user_profiles
    SET
        total_photos = (SELECT COUNT(*) FROM photos WHERE user_id = p_user_id),
        approved_photos = (SELECT COUNT(*) FROM photos WHERE user_id = p_user_id AND status = 'approved'),
        rejected_photos = (SELECT COUNT(*) FROM photos WHERE user_id = p_user_id AND status = 'rejected'),
        auto_deleted_photos = (SELECT COUNT(*) FROM photos WHERE user_id = p_user_id AND status = 'auto_deleted'),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;


-- Función v3.5: Auto-eliminar foto con armas/drogas (inmediato)
CREATE OR REPLACE FUNCTION auto_delete_photo_immediate(
    p_photo_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_photo_record RECORD;
BEGIN
    -- Obtener información de la foto
    SELECT id, user_id, storage_path, photo_type, album_type
    INTO v_photo_record
    FROM photos
    WHERE id = p_photo_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Eliminar del storage
    PERFORM storage.fns.delete_object('photos-pending', v_photo_record.storage_path);
    
    -- Actualizar registro (marcar como auto-eliminada)
    UPDATE photos
    SET 
        status = 'auto_deleted',
        deleted_at = NOW(),
        rejection_reason = p_reason
    WHERE id = p_photo_id;
    
    -- Crear notificación
    PERFORM create_notification(
        v_photo_record.user_id,
        'photo_auto_deleted',
        '🗑️ Foto eliminada automáticamente',
        'Tu foto fue eliminada automáticamente por violar nuestras políticas: ' || p_reason || 
        '. Este tipo de contenido no está permitido.',
        p_photo_id
    );
    
    -- Actualizar estadísticas
    PERFORM update_user_photo_stats(v_photo_record.user_id);
    
    RETURN TRUE;
END;
$$;


-- Función: Limpiar fotos rechazadas expiradas (ejecutar cada hora)
CREATE OR REPLACE FUNCTION cleanup_expired_rejected_photos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_photo_record RECORD;
BEGIN
    -- Encontrar fotos rechazadas expiradas (solo las que NO tienen auto_delete=true)
    FOR v_photo_record IN
        SELECT id, user_id, storage_path
        FROM photos
        WHERE status = 'rejected'
        AND auto_delete = false
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
    LOOP
        -- Eliminar del storage
        PERFORM storage.fns.delete_object('photos-pending', v_photo_record.storage_path);
        
        -- Eliminar registro
        DELETE FROM photos WHERE id = v_photo_record.id;
        
        v_deleted_count := v_deleted_count + 1;
        
        -- Crear notificación
        PERFORM create_notification(
            v_photo_record.user_id,
            'photo_expiring',
            '⏰ Foto eliminada por expiración',
            'Tu foto rechazada fue eliminada automáticamente después de 24 horas sin acción.',
            v_photo_record.id
        );
    END LOOP;
    
    -- Actualizar estadísticas de usuarios afectados
    IF v_deleted_count > 0 THEN
        PERFORM update_user_photo_stats(user_id)
        FROM (SELECT DISTINCT user_id FROM photos WHERE status = 'rejected' AND expires_at < NOW()) AS affected_users;
    END IF;
    
    RETURN v_deleted_count;
END;
$$;


-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

-- Trigger: Cuando se aprueba una foto, crear notificación
CREATE OR REPLACE FUNCTION notify_photo_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        PERFORM create_notification(
            NEW.user_id,
            'photo_approved',
            '✅ Foto aprobada',
            CASE NEW.photo_type
                WHEN 'profile' THEN 'Tu foto de perfil fue aprobada y ya es visible.'
                WHEN 'album' THEN 
                    CASE NEW.album_type
                        WHEN 'public' THEN 'Tu foto de álbum público fue aprobada.'
                        WHEN 'private' THEN 'Tu foto de álbum privado fue añadida.'
                    END
                WHEN 'verification' THEN 'Tu verificación de identidad fue exitosa. ¡Ahora tienes el badge verificado!'
            END,
            NEW.id
        );
        
        -- Actualizar estadísticas
        PERFORM update_user_photo_stats(NEW.user_id);
        
        -- Si es verificación, marcar usuario como verificado
        IF NEW.photo_type = 'verification' THEN
            UPDATE user_profiles
            SET verified = true, verified_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_photo_approved
AFTER UPDATE ON photos
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
EXECUTE FUNCTION notify_photo_approved();


-- Trigger v3.5: Cuando se rechaza una foto, decidir entre auto-delete o expiración
CREATE OR REPLACE FUNCTION notify_photo_rejected()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        -- Si es auto_delete (armas/drogas), eliminar inmediatamente
        IF NEW.auto_delete = true THEN
            -- Llamar función de auto-eliminación
            PERFORM auto_delete_photo_immediate(NEW.id, NEW.rejection_reason);
            
            -- Cambiar estado a auto_deleted
            NEW.status = 'auto_deleted';
            NEW.deleted_at = NOW();
        ELSE
            -- Establecer expiración en 24 horas (rechazo normal)
            NEW.expires_at = NOW() + INTERVAL '24 hours';
            
            PERFORM create_notification(
                NEW.user_id,
                'photo_rejected',
                '❌ Foto rechazada',
                'Tu foto fue rechazada: ' || COALESCE(NEW.rejection_reason, 'Motivo no especificado') || 
                '. Por favor, modifícala, muévela a álbum privado o elimínala. Si no haces nada en 24 horas, se eliminará automáticamente.',
                NEW.id
            );
        END IF;
        
        -- Actualizar estadísticas
        PERFORM update_user_photo_stats(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_photo_rejected
BEFORE UPDATE ON photos
FOR EACH ROW
WHEN (NEW.status = 'rejected' AND OLD.status != 'rejected')
EXECUTE FUNCTION notify_photo_rejected();


-- Trigger: Cuando se sube una foto, llamar a webhook para validación
CREATE OR REPLACE FUNCTION trigger_photo_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Álbumes privados: aprobar automáticamente sin validar
    IF NEW.photo_type = 'album' AND NEW.album_type = 'private' THEN
        NEW.status = 'approved';
        NEW.is_visible = true;
        NEW.processed_at = NOW();
        NEW.approved_at = NOW();
    ELSE
        -- Otras fotos: cambiar estado a 'processing'
        NEW.status = 'processing';
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_new_photo
BEFORE INSERT ON photos
FOR EACH ROW
EXECUTE FUNCTION trigger_photo_validation();


-- ============================================================================
-- 8. CRON JOB (pg_cron) - Limpiar fotos expiradas cada hora
-- ============================================================================

-- Habilitar pg_cron si no está habilitado
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar limpieza cada hora
SELECT cron.schedule(
    'cleanup-expired-photos',
    '0 * * * *', -- Cada hora en el minuto 0
    $$SELECT cleanup_expired_rejected_photos()$$
);


-- ============================================================================
-- 9. VISTAS ÚTILES
-- ============================================================================

-- Vista: Fotos públicas aprobadas
CREATE OR REPLACE VIEW public_photos AS
SELECT 
    p.id,
    p.user_id,
    u.username,
    u.display_name,
    u.verified,
    p.photo_type,
    p.album_type,
    p.storage_url,
    p.cropped_url,
    p.is_primary,
    p.display_order,
    p.approved_at,
    p.created_at
FROM photos p
JOIN user_profiles u ON u.id = p.user_id
WHERE p.status = 'approved'
AND p.is_visible = true
AND (p.photo_type = 'profile' OR (p.photo_type = 'album' AND p.album_type = 'public'))
ORDER BY p.approved_at DESC;


-- Vista: Estadísticas de validación
CREATE OR REPLACE VIEW validation_stats AS
SELECT 
    photo_type,
    album_type,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as avg_processing_time_seconds
FROM photos
WHERE processed_at IS NOT NULL
GROUP BY photo_type, album_type, status;


-- ============================================================================
-- FIN DEL SCHEMA v3.5
-- ============================================================================

-- Para crear la integración completa, también necesitas:
-- 1. Webhook Python (supabase_webhook.py) - escucha eventos de Supabase
-- 2. Edge Function (opcional) - alternativa al webhook
-- Ver archivos: supabase_webhook_v3.5.py
