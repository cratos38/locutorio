-- ============================================================================
-- LOCUTORIO - ESQUEMA COMPLETO DE BASE DE DATOS
-- ============================================================================
-- Ejecutar este script en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Pegar y ejecutar
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR USUARIO ANA M (HARDCODEADO)
-- ============================================================================
DELETE FROM public.users WHERE username = 'anam' OR nombre ILIKE '%Ana M%';

-- ============================================================================
-- PASO 2: AGREGAR COLUMNAS FALTANTES A TABLA USERS (si no existen)
-- ============================================================================

-- Columnas de verificación
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(5);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS edad_cambio_permitido BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);

-- Columnas de ubicación adicionales
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pais_codigo VARCHAR(5);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pais_nombre VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS estado VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS buscar_pareja_pais_codigo VARCHAR(5);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS buscar_pareja_pais_nombre VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS buscar_pareja_ciudad VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS buscar_pareja_estado VARCHAR(100);

-- Columnas de estado de cuenta
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- ============================================================================
-- PASO 3: CREAR TABLA DE FOTOS DE PERFIL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT,
    is_principal BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para photos
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_approval_status ON public.photos(approval_status);

-- ============================================================================
-- PASO 4: CREAR TABLA DE ALBUMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    privacy VARCHAR(20) DEFAULT 'public', -- public, friends, private, password
    password_hash TEXT, -- para albums con password
    cover_photo_id UUID,
    photo_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de fotos de album
CREATE TABLE IF NOT EXISTS public.album_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes de fotos de album
CREATE TABLE IF NOT EXISTS public.album_photo_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES public.album_photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, user_id)
);

-- Comentarios de fotos de album
CREATE TABLE IF NOT EXISTS public.album_photo_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID NOT NULL REFERENCES public.album_photos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 5: CREAR TABLA DE VERIFICACION DE CODIGOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL, -- Codigo hasheado con bcrypt
    type VARCHAR(20) NOT NULL, -- 'email', 'phone', '2fa', 'password_reset'
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_user_type ON public.verification_codes(user_id, type);

-- ============================================================================
-- PASO 6: CREAR TABLA DE VERIFICACION DE IDENTIDAD (ID + FOTO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    id_document_url TEXT NOT NULL, -- URL de la foto del documento
    selfie_url TEXT NOT NULL, -- URL de la selfie
    id_document_type VARCHAR(50), -- 'cedula', 'pasaporte', 'licencia'
    id_document_number VARCHAR(50),
    full_name_on_id VARCHAR(200),
    birth_date_on_id DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    ai_confidence_score DECIMAL(5,2), -- Score de IA (0-100)
    ai_face_match BOOLEAN, -- Si la IA detectó match entre selfie e ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 7: CREAR TABLA DE AMIGOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    is_favorite BOOLEAN DEFAULT FALSE,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);

-- ============================================================================
-- PASO 8: CREAR TABLA DE BLOQUEOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- ============================================================================
-- PASO 9: CREAR TABLA DE CONVERSACIONES (MENSAJES PRIVADOS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_message_id UUID,
    last_message_at TIMESTAMPTZ,
    participant1_unread INTEGER DEFAULT 0,
    participant2_unread INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, audio, video
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);

-- ============================================================================
-- PASO 10: CREAR TABLAS DE CHAT ROOMS (SALAS DE CHAT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_type VARCHAR(20) DEFAULT 'temporary', -- temporary, permanent
    is_plus_only BOOLEAN DEFAULT FALSE,
    is_18_plus BOOLEAN DEFAULT FALSE,
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, moderator, member
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, system
    is_bot_message BOOLEAN DEFAULT FALSE,
    reply_to_id UUID REFERENCES public.room_messages(id),
    reactions JSONB DEFAULT '{}', -- {"emoji": ["user_id1", "user_id2"]}
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_messages_room ON public.room_messages(room_id);

-- Tabla de salas favoritas
CREATE TABLE IF NOT EXISTS public.room_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, room_id)
);

-- ============================================================================
-- PASO 11: CREAR TABLA DE DENUNCIAS/REPORTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reported_message_id UUID,
    reported_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE SET NULL,
    reported_photo_id UUID,
    report_type VARCHAR(50) NOT NULL, -- 'harassment', 'spam', 'fake_profile', 'inappropriate_content', 'underage', 'other'
    description TEXT,
    evidence_urls TEXT[], -- URLs de capturas de pantalla
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
    priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
    resolution TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);

-- ============================================================================
-- PASO 12: CREAR TABLA DE VISITAS DE PERFIL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    visited_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    visited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_visited ON public.visits(visited_id);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON public.visits(visitor_id);

-- ============================================================================
-- PASO 13: CREAR TABLA DE FAVORITOS DE USUARIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    favorite_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, favorite_id)
);

-- ============================================================================
-- PASO 14: CREAR TABLA DE NOTIFICACIONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'new_message', 'friend_request', 'profile_visit', 'photo_approved', 'verification_complete', etc.
    title VARCHAR(200),
    content TEXT,
    data JSONB, -- Datos adicionales (IDs, URLs, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

-- ============================================================================
-- PASO 15: CREAR TABLA DE ACCIONES DE ADMIN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action_type VARCHAR(50) NOT NULL, -- 'ban_user', 'unban_user', 'approve_photo', 'reject_photo', 'delete_message', 'resolve_report', etc.
    target_user_id UUID REFERENCES public.users(id),
    target_entity_type VARCHAR(50), -- 'user', 'photo', 'message', 'report', 'room'
    target_entity_id UUID,
    reason TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON public.admin_actions(target_user_id);

-- ============================================================================
-- PASO 16: CREAR TABLA DE ENCUENTROS/MEETINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(500),
    coordinates POINT,
    meeting_date TIMESTAMPTZ NOT NULL,
    max_participants INTEGER DEFAULT 10,
    is_public BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, ongoing, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, declined
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id)
);

-- ============================================================================
-- PASO 17: CREAR TABLA DE SESIONES 2FA
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.two_factor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_info TEXT,
    ip_address VARCHAR(45),
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASO 18: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.two_factor_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 19: CREAR POLITICAS RLS
-- ============================================================================

-- Politicas para users (ya deberia existir, pero por si acaso)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politicas para photos
DROP POLICY IF EXISTS "Anyone can view approved photos" ON public.photos;
CREATE POLICY "Anyone can view approved photos" ON public.photos
    FOR SELECT USING (is_approved = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own photos" ON public.photos;
CREATE POLICY "Users can insert own photos" ON public.photos
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own photos" ON public.photos;
CREATE POLICY "Users can update own photos" ON public.photos
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own photos" ON public.photos;
CREATE POLICY "Users can delete own photos" ON public.photos
    FOR DELETE USING (user_id = auth.uid());

-- Politicas para friends
DROP POLICY IF EXISTS "Users can see own friendships" ON public.friends;
CREATE POLICY "Users can see own friendships" ON public.friends
    FOR SELECT USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friend requests" ON public.friends;
CREATE POLICY "Users can create friend requests" ON public.friends
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own friendships" ON public.friends;
CREATE POLICY "Users can update own friendships" ON public.friends
    FOR UPDATE USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own friendships" ON public.friends;
CREATE POLICY "Users can delete own friendships" ON public.friends
    FOR DELETE USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Politicas para messages
DROP POLICY IF EXISTS "Users can see own messages" ON public.messages;
CREATE POLICY "Users can see own messages" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (c.participant1_id = auth.uid() OR c.participant2_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Politicas para conversations
DROP POLICY IF EXISTS "Users can see own conversations" ON public.conversations;
CREATE POLICY "Users can see own conversations" ON public.conversations
    FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Politicas para notifications
DROP POLICY IF EXISTS "Users can see own notifications" ON public.notifications;
CREATE POLICY "Users can see own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Politicas para chat_rooms (publicas)
DROP POLICY IF EXISTS "Anyone can view active chat rooms" ON public.chat_rooms;
CREATE POLICY "Anyone can view active chat rooms" ON public.chat_rooms
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update chat rooms" ON public.chat_rooms;
CREATE POLICY "Owners can update chat rooms" ON public.chat_rooms
    FOR UPDATE USING (owner_id = auth.uid());

-- Politicas para room_messages
DROP POLICY IF EXISTS "Anyone can view room messages" ON public.room_messages;
CREATE POLICY "Anyone can view room messages" ON public.room_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms r
            WHERE r.id = room_id AND r.is_active = true
        )
    );

DROP POLICY IF EXISTS "Users can send room messages" ON public.room_messages;
CREATE POLICY "Users can send room messages" ON public.room_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Politicas para reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can see own reports" ON public.reports;
CREATE POLICY "Users can see own reports" ON public.reports
    FOR SELECT USING (reporter_id = auth.uid());

-- Politicas para visits
DROP POLICY IF EXISTS "Users can see who visited them" ON public.visits;
CREATE POLICY "Users can see who visited them" ON public.visits
    FOR SELECT USING (visited_id = auth.uid() OR visitor_id = auth.uid());

DROP POLICY IF EXISTS "Users can create visits" ON public.visits;
CREATE POLICY "Users can create visits" ON public.visits
    FOR INSERT WITH CHECK (visitor_id = auth.uid());

-- Politicas para verification_codes (solo el usuario puede ver sus codigos)
DROP POLICY IF EXISTS "Users can see own verification codes" ON public.verification_codes;
CREATE POLICY "Users can see own verification codes" ON public.verification_codes
    FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- PASO 20: CREAR FUNCIONES AUXILIARES
-- ============================================================================

-- Funcion para obtener el conteo de no leidos
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(
            CASE 
                WHEN participant1_id = p_user_id THEN participant1_unread
                WHEN participant2_id = p_user_id THEN participant2_unread
                ELSE 0
            END
        ), 0)
        FROM public.conversations
        WHERE participant1_id = p_user_id OR participant2_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Funcion para calcular edad
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$ LANGUAGE plpgsql;

-- Funcion para actualizar last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PASO 21: CREAR STORAGE BUCKETS
-- ============================================================================
-- Nota: Esto debe ejecutarse por separado o desde la UI de Supabase Storage

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES 
--     ('profile-photos', 'profile-photos', true),
--     ('album-photos', 'album-photos', true),
--     ('identity-documents', 'identity-documents', false),
--     ('chat-media', 'chat-media', true)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================
-- Ejecutar para verificar que todas las tablas se crearon correctamente:

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
