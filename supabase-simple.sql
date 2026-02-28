-- ============================================================================
-- ML VALIDATOR v3.5 - SCHEMA SIMPLE (SIN ERRORES)
-- ============================================================================
-- Copiar y pegar TODO este archivo en Supabase SQL Editor

-- 1. TABLA DE FOTOS
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    photo_type TEXT NOT NULL,
    album_type TEXT DEFAULT 'public',
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    cropped_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    validation_result JSONB,
    rejection_reason TEXT,
    auto_delete BOOLEAN DEFAULT false,
    original_filename TEXT,
    file_size INTEGER,
    is_visible BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- 2. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    age INTEGER,
    gender TEXT,
    total_photos INTEGER DEFAULT 0,
    approved_photos INTEGER DEFAULT 0,
    rejected_photos INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    photo_id UUID,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- 5. HABILITAR RLS (Row Level Security)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS BÁSICAS
CREATE POLICY "Users can view own photos" ON photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos" ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- LISTO! Ahora crea los buckets de storage manualmente:
-- Ve a Storage → Create bucket:
--   1. photos-pending (private)
--   2. photos-approved (public)
--   3. albums-private (private)
-- ============================================================================
