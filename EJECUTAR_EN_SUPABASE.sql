-- ============================================================================
-- SCRIPT SIMPLIFICADO PARA VALIDACIÓN AUTOMÁTICA DE FOTOS
-- ============================================================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1️⃣ FUNCIÓN: Cambia status a 'processing' cuando se sube foto
CREATE OR REPLACE FUNCTION trigger_photo_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Álbumes privados: aprobar automáticamente
    IF NEW.photo_type = 'album' AND NEW.album_type = 'private' THEN
        NEW.status = 'approved';
        NEW.is_visible = true;
        NEW.processed_at = NOW();
        NEW.approved_at = NOW();
    ELSE
        -- Otras fotos: cambiar a 'processing' para validación
        NEW.status = 'processing';
        NEW.processed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2️⃣ TRIGGER: Se ejecuta ANTES de insertar foto
DROP TRIGGER IF EXISTS trigger_new_photo ON photos;

CREATE TRIGGER trigger_new_photo
BEFORE INSERT ON photos
FOR EACH ROW
EXECUTE FUNCTION trigger_photo_validation();

-- 3️⃣ VERIFICAR: Mostrar el trigger creado
SELECT 
    trigger_name, 
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'photos';

-- 4️⃣ CREAR FUNCIÓN: Notificaciones
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
    INSERT INTO notifications (user_id, type, title, message, photo_id, created_at, is_read)
    VALUES (p_user_id, p_type, p_title, p_message, p_photo_id, NOW(), false)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$;

-- ============================================================================
-- LISTO! Ahora las fotos tendrán status='processing' automáticamente
-- ============================================================================
