-- ============================================================================
-- EJECUTAR ESTE SQL EN SUPABASE DASHBOARD > SQL EDITOR
-- ============================================================================

-- 1️⃣ Crear función del trigger
CREATE OR REPLACE FUNCTION trigger_photo_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Álbumes privados: auto-aprobar
    IF NEW.photo_type = 'album' AND NEW.album_type = 'private' THEN
        NEW.status = 'approved';
        NEW.is_visible = true;
        NEW.processed_at = NOW();
        NEW.approved_at = NOW();
    ELSE
        -- Otras fotos: marcar como 'processing'
        NEW.status = 'processing';
        NEW.processed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2️⃣ Crear trigger
DROP TRIGGER IF EXISTS trigger_new_photo ON photos;

CREATE TRIGGER trigger_new_photo
BEFORE INSERT ON photos
FOR EACH ROW
EXECUTE FUNCTION trigger_photo_validation();

-- 3️⃣ Verificar
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'photos';
