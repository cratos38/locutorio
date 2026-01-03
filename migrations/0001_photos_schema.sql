-- ==========================================
-- ESQUEMA DE FOTOS DE PERFIL
-- ==========================================

-- Tabla de fotos de usuario
CREATE TABLE IF NOT EXISTS user_photos (
  id TEXT PRIMARY KEY,  -- UUID
  user_id TEXT NOT NULL,  -- ID del usuario propietario
  
  -- URLs de las diferentes versiones
  url_original TEXT NOT NULL,  -- URL de la foto original subida
  url_avatar TEXT,  -- Avatar pequeño (ej: 100x100px) para Mi Espacio
  url_profile TEXT,  -- Perfil mediano (ej: 400x400px) para búsqueda
  url_thumbnail TEXT,  -- Miniatura (ej: 50x50px) para chat/mensajería
  
  -- Metadata
  is_principal BOOLEAN DEFAULT FALSE,  -- ¿Es la foto principal?
  estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'aprobada', 'rechazada')),
  
  -- Información de verificación
  fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_verificacion DATETIME,
  verificado_por TEXT,  -- ID del admin que verificó
  motivo_rechazo TEXT,  -- Razón del rechazo si aplica
  
  -- Orden de visualización
  orden INTEGER DEFAULT 0,  -- Para ordenar las fotos (0 = primera)
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_principal ON user_photos(user_id, is_principal);
CREATE INDEX IF NOT EXISTS idx_photos_estado ON user_photos(estado);
CREATE INDEX IF NOT EXISTS idx_photos_verificacion ON user_photos(estado, fecha_subida);

-- ==========================================
-- TRIGGERS PARA MANTENER SOLO UNA FOTO PRINCIPAL
-- ==========================================

-- Trigger para asegurar que solo haya una foto principal por usuario
CREATE TRIGGER IF NOT EXISTS ensure_single_principal
AFTER INSERT ON user_photos
WHEN NEW.is_principal = TRUE
BEGIN
  UPDATE user_photos 
  SET is_principal = FALSE
  WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_principal = TRUE;
END;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER IF NOT EXISTS update_photo_timestamp
AFTER UPDATE ON user_photos
BEGIN
  UPDATE user_photos 
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista de fotos aprobadas con información del usuario
CREATE VIEW IF NOT EXISTS v_photos_approved AS
SELECT 
  p.id,
  p.user_id,
  p.url_avatar,
  p.url_profile,
  p.url_thumbnail,
  p.is_principal,
  p.orden,
  p.fecha_subida
FROM user_photos p
WHERE p.estado = 'aprobada'
ORDER BY p.user_id, p.is_principal DESC, p.orden ASC;

-- Vista de fotos pendientes para moderación
CREATE VIEW IF NOT EXISTS v_photos_pending AS
SELECT 
  p.id,
  p.user_id,
  p.url_original,
  p.fecha_subida,
  ROUND((julianday('now') - julianday(p.fecha_subida)) * 24, 2) as horas_esperando
FROM user_photos p
WHERE p.estado = 'pendiente'
ORDER BY p.fecha_subida ASC;

-- ==========================================
-- FUNCIONES AUXILIARES (mediante consultas preparadas)
-- ==========================================

-- Obtener foto principal de un usuario
-- SELECT * FROM user_photos WHERE user_id = ? AND is_principal = TRUE AND estado = 'aprobada' LIMIT 1;

-- Obtener todas las fotos aprobadas de un usuario
-- SELECT * FROM user_photos WHERE user_id = ? AND estado = 'aprobada' ORDER BY is_principal DESC, orden ASC;

-- Contar fotos de un usuario
-- SELECT COUNT(*) as total FROM user_photos WHERE user_id = ?;

-- Marcar foto como principal (desmarcar las demás)
-- BEGIN TRANSACTION;
-- UPDATE user_photos SET is_principal = FALSE WHERE user_id = ?;
-- UPDATE user_photos SET is_principal = TRUE WHERE id = ?;
-- COMMIT;
