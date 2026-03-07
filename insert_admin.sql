-- Crear usuario admin en Cloudflare D1
INSERT INTO users (
  id, email, username, 
  nombre, edad, genero, ciudad,
  is_admin, is_verified, is_plus,
  created_at, updated_at
) VALUES (
  'QmfCvo271ZbKmNbPOHgCGSHcQ9t1',
  'admin@locutorio.com.ve',
  'admin',
  'Administrador',
  30,
  'masculino',
  'Bogotá',
  1,
  1,
  1,
  datetime('now'),
  datetime('now')
);

-- Verificar que se creó
SELECT id, username, email, nombre, is_admin FROM users WHERE username = 'admin';
