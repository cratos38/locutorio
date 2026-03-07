/**
 * Script para crear usuario admin en Cloudflare D1
 * 
 * Este script crea el usuario admin directamente en D1 usando el UID de Firebase.
 * 
 * Uso: node create-admin-d1.js
 */

const CLOUDFLARE_ACCOUNT_ID = '130f04e76a4e3a1c4ce2b048a4422ee7';
const CLOUDFLARE_D1_DATABASE_ID = '689222cb-b8eb-4c77-8638-4b0a58fd66e9';
const CLOUDFLARE_API_TOKEN = '8RkPrPyEkel9OdZW8aOBxs7TtDALH1_-XmxHl4gy';

// Datos del admin (usar el mismo UID de Firebase)
const ADMIN_UID = 'QmfCvo271ZbKmNbPOHgCGSHcQ9t1'; // UID del admin en Firebase
const ADMIN_EMAIL = 'admin@locutorio.com.ve';
const ADMIN_USERNAME = 'admin';

async function executeD1Query(sql, params = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_D1_DATABASE_ID}/query`;

  console.log('🔍 Ejecutando query:', sql);
  console.log('📊 Parámetros:', params);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sql,
      params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`D1 API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
  }

  return data.result[0]?.results || [];
}

async function createAdmin() {
  console.log('👤 Creando usuario admin en Cloudflare D1...\n');

  try {
    // 1. Verificar si el admin ya existe
    console.log('🔍 Verificando si el admin ya existe...');
    const existingUsers = await executeD1Query(
      'SELECT id, username, email FROM users WHERE id = ? OR username = ? OR email = ? LIMIT 1',
      [ADMIN_UID, ADMIN_USERNAME, ADMIN_EMAIL]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  El usuario admin ya existe en D1:');
      console.log('   - ID:', existingUsers[0].id);
      console.log('   - Username:', existingUsers[0].username);
      console.log('   - Email:', existingUsers[0].email);
      console.log('\n✅ No es necesario crear el admin nuevamente.');
      return;
    }

    // 2. Crear el usuario admin
    console.log('📝 Creando usuario admin...');
    await executeD1Query(
      `INSERT INTO users (
        id, email, username, 
        nombre, edad, genero, ciudad,
        is_admin, is_verified, is_plus,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        ADMIN_UID,
        ADMIN_EMAIL,
        ADMIN_USERNAME,
        'Administrador',
        30,
        'masculino',
        'Bogotá',
        1, // is_admin = true
        1, // is_verified = true
        1  // is_plus = true
      ]
    );

    console.log('✅ Usuario admin creado exitosamente!\n');

    // 3. Verificar la creación
    const [admin] = await executeD1Query(
      'SELECT id, username, email, nombre, is_admin FROM users WHERE id = ?',
      [ADMIN_UID]
    );

    console.log('📊 Datos del admin en D1:');
    console.log('   - ID (Firebase UID):', admin.id);
    console.log('   - Username:', admin.username);
    console.log('   - Email:', admin.email);
    console.log('   - Nombre:', admin.nombre);
    console.log('   - Is Admin:', admin.is_admin === 1 ? '✅ Sí' : '❌ No');
    console.log('\n🎉 Admin creado correctamente en Cloudflare D1!');
    console.log('\n🔑 Credenciales de login:');
    console.log('   - Email:', ADMIN_EMAIL);
    console.log('   - Password: Admin123!@#');
    console.log('   - URL: https://locutorio.com.ve/login');

  } catch (error) {
    console.error('❌ Error creando admin:', error);
    throw error;
  }
}

// Ejecutar
createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
