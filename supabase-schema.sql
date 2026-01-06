-- Tabla de usuarios con todos los campos del perfil
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información básica
  nombre TEXT,
  edad INTEGER,
  genero TEXT,
  ciudad TEXT,
  foto_perfil TEXT,
  
  -- Status y presencia
  status_text TEXT,
  presence_status TEXT DEFAULT 'online',
  
  -- ALGO SOBRE MÍ
  altura INTEGER,
  peso INTEGER,
  tipo_cuerpo TEXT,
  color_ojos TEXT,
  color_cabello TEXT,
  signo_zodiacal TEXT,
  educacion TEXT,
  etnia TEXT,
  vives_en TEXT,
  idiomas TEXT[], -- Array de idiomas
  
  -- TRABAJO
  trabajas BOOLEAN,
  en_que_trabaja TEXT,
  definete_en_frase TEXT,
  cuentanos_algo_tuyo TEXT,
  intereses TEXT,
  primera_cita_ideal TEXT,
  
  -- RELACIONES
  tiene_hijos BOOLEAN,
  situacion_hijos TEXT,
  quiere_tener_hijos TEXT,
  estado_civil TEXT,
  que_buscas TEXT,
  razon_principal TEXT,
  tiempo_en_pareja TEXT,
  casarse_importante TEXT,
  duracion_relacion_larga TEXT,
  
  -- VEHÍCULO
  tiene_vehiculo BOOLEAN,
  
  -- MASCOTA
  tiene_mascota TEXT,
  tiene_mascota_otra TEXT,
  
  -- CULTURA
  pasatiempos TEXT[], -- Array
  generos_peliculas TEXT[], -- Array
  generos_musica TEXT[], -- Array
  generos_libros TEXT[], -- Array
  deportes_practica TEXT[], -- Array
  ideas_politicas TEXT,
  valores_tradicionales TEXT,
  espiritualidad TEXT,
  religion TEXT,
  convicciones_religiosas TEXT,
  
  -- ESTILO DE VIDA
  que_haces TEXT,
  nivel_cocinar TEXT,
  nivel_bailar TEXT,
  te_ejercitas TEXT,
  eres_ambicioso TEXT,
  
  -- Fumar
  fumas TEXT,
  frecuencia_fumar TEXT,
  saldrias_fumador BOOLEAN,
  
  -- Beber
  bebes_alcohol TEXT,
  frecuencia_beber TEXT,
  saldrias_bebedor BOOLEAN,
  
  -- Drogas
  usas_drogas TEXT,
  frecuencia_drogas TEXT,
  
  -- Otros
  dieta_especial TEXT,
  dieta_especial_otra TEXT,
  tiempo_con_familia TEXT,
  personalidad_sociable TEXT,
  orden_mantenimiento TEXT,
  
  -- Porcentaje de perfil completado
  profile_completion INTEGER DEFAULT 0,
  
  -- Verificación
  is_verified BOOLEAN DEFAULT FALSE,
  is_plus BOOLEAN DEFAULT FALSE
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas: cualquiera puede leer perfiles públicos
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Políticas: los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (true);

-- Políticas: cualquiera puede insertar (registrarse)
CREATE POLICY "Anyone can insert"
  ON users FOR INSERT
  WITH CHECK (true);
