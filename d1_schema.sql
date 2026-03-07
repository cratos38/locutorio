-- Cloudflare D1 Schema (SQLite)
-- Convertido desde Supabase PostgreSQL
-- Fecha: 2026-03-07

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  -- Información básica
  nombre TEXT,
  edad INTEGER,
  genero TEXT,
  ciudad TEXT,
  foto_perfil TEXT,
  status_text TEXT,
  presence_status TEXT DEFAULT 'offline',
  
  -- Apariencia física
  altura INTEGER,
  peso INTEGER,
  tipo_cuerpo TEXT,
  color_ojos TEXT,
  color_cabello TEXT,
  
  -- Información personal
  signo_zodiacal TEXT,
  educacion TEXT,
  etnia TEXT,
  vives_en TEXT,
  idiomas TEXT, -- JSON string: ["Español", "Inglés"]
  trabajas TEXT,
  en_que_trabaja TEXT,
  definete_en_frase TEXT,
  cuentanos_algo_tuyo TEXT,
  intereses TEXT, -- JSON string
  primera_cita_ideal TEXT,
  
  -- Familia
  tiene_hijos TEXT,
  situacion_hijos TEXT,
  quiere_tener_hijos TEXT,
  
  -- Relaciones
  estado_civil TEXT,
  que_buscas TEXT,
  razon_principal TEXT,
  tiempo_en_pareja TEXT,
  casarse_importante TEXT,
  duracion_relacion_larga TEXT,
  
  -- Posesiones
  tiene_vehiculo TEXT,
  tiene_mascota TEXT,
  tiene_mascota_otra TEXT,
  
  -- Gustos
  pasatiempos TEXT, -- JSON string
  generos_peliculas TEXT,
  generos_musica TEXT,
  generos_libros TEXT,
  deportes_practica TEXT,
  
  -- Valores y creencias
  ideas_politicas TEXT,
  valores_tradicionales TEXT,
  espiritualidad TEXT,
  religion TEXT,
  convicciones_religiosas TEXT,
  
  -- Habilidades y hábitos
  que_haces TEXT,
  nivel_cocinar TEXT,
  nivel_bailar TEXT,
  nivel_leer TEXT,
  nivel_cine TEXT,
  nivel_viajar TEXT,
  te_ejercitas TEXT,
  eres_ambicioso TEXT,
  
  -- Consumo
  fumas TEXT,
  frecuencia_fumar TEXT,
  saldrias_fumador TEXT,
  bebes_alcohol TEXT,
  frecuencia_beber TEXT,
  saldrias_bebedor TEXT,
  usas_drogas TEXT,
  frecuencia_drogas TEXT,
  dieta_especial TEXT,
  dieta_especial_otra TEXT,
  
  -- Familia y social
  tiempo_con_familia TEXT,
  personalidad_sociable TEXT,
  orden_mantenimiento TEXT,
  escuelas_privadas_publicas TEXT,
  escuelas_privadas_publicas_otra TEXT,
  
  -- Configuración de perfil
  profile_completion INTEGER DEFAULT 0,
  private_completion INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  is_plus INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  carousel_enabled INTEGER DEFAULT 0,
  carousel_interval_type TEXT DEFAULT 'seconds',
  carousel_interval_value INTEGER DEFAULT 5
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ciudad ON users(ciudad);
CREATE INDEX IF NOT EXISTS idx_users_genero ON users(genero);

-- ============================================
-- TABLA: photos
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  album_id TEXT,
  
  -- URLs de las fotos
  storage_url TEXT, -- URL original/large
  cropped_url TEXT, -- URL medium (400x400)
  url_thumbnail TEXT, -- URL thumbnail (96x96) - NUEVO
  
  -- Metadata
  storage_path TEXT,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Estado y visibilidad
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  is_primary INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 0,
  photo_type TEXT DEFAULT 'album', -- profile, album
  
  -- Validación
  validation_result TEXT, -- JSON con detalles de validación
  validation_date TEXT,
  rejection_reason TEXT,
  
  -- Orden y timestamps
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Índices para photos
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
CREATE INDEX IF NOT EXISTS idx_photos_is_primary ON photos(user_id, is_primary) WHERE is_primary = 1;
CREATE INDEX IF NOT EXISTS idx_photos_photo_type ON photos(photo_type);

-- ============================================
-- TABLA: albums
-- ============================================
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Privacidad
  privacy TEXT DEFAULT 'public', -- public, private, password
  password TEXT,
  
  -- Metadata
  cover_photo_url TEXT,
  photo_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para albums
CREATE INDEX IF NOT EXISTS idx_albums_user_id ON albums(user_id);
CREATE INDEX IF NOT EXISTS idx_albums_privacy ON albums(privacy);

-- ============================================
-- TABLA: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- photo_approved, photo_rejected, new_message, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Metadata
  data TEXT, -- JSON con datos adicionales
  link TEXT,
  
  -- Estado
  read INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ============================================
-- TABLA: photo_reports
-- ============================================
CREATE TABLE IF NOT EXISTS photo_reports (
  id TEXT PRIMARY KEY,
  photo_id TEXT NOT NULL,
  reporter_user_id TEXT NOT NULL,
  reported_user_id TEXT NOT NULL,
  
  -- Detalles del reporte
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT, -- JSON array de URLs
  
  -- Estado
  status TEXT DEFAULT 'pending', -- pending, reviewing, resolved, rejected
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para photo_reports
CREATE INDEX IF NOT EXISTS idx_photo_reports_photo_id ON photo_reports(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_reports_status ON photo_reports(status);
CREATE INDEX IF NOT EXISTS idx_photo_reports_reporter ON photo_reports(reporter_user_id);

-- ============================================
-- TABLA: photo_appeals
-- ============================================
CREATE TABLE IF NOT EXISTS photo_appeals (
  id TEXT PRIMARY KEY,
  photo_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Detalles de la apelación
  reason TEXT NOT NULL,
  explanation TEXT,
  evidence_urls TEXT, -- JSON array de URLs
  
  -- Estado
  status TEXT DEFAULT 'pending', -- pending, reviewing, approved, rejected
  resolution TEXT,
  resolved_by TEXT,
  resolved_at TEXT,
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para photo_appeals
CREATE INDEX IF NOT EXISTS idx_photo_appeals_photo_id ON photo_appeals(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_appeals_user_id ON photo_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_appeals_status ON photo_appeals(status);

-- ============================================
-- TABLA: user_profiles (legacy, puede estar vacía)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  data TEXT, -- JSON con datos legacy
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS users_updated_at 
AFTER UPDATE ON users 
BEGIN
  UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS photos_updated_at 
AFTER UPDATE ON photos 
BEGIN
  UPDATE photos SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS albums_updated_at 
AFTER UPDATE ON albums 
BEGIN
  UPDATE albums SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
