/**
 * Script para verificar y configurar Supabase
 * 
 * Este script:
 * 1. Verifica que las tablas de fotos existan
 * 2. Verifica que el bucket de storage exista
 * 3. Lista las políticas de seguridad
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  console.error('   Asegúrate de que .env.local existe y contiene:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('\n📋 Verificando tablas...\n');
  
  const tables = ['profile_photos', 'profile_photo_carousel', 'photo_albums', 'album_photos'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla '${table}' NO existe o tiene problemas`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ Tabla '${table}' existe y es accesible`);
      }
    } catch (err) {
      console.log(`❌ Error al verificar tabla '${table}':`, err);
    }
  }
}

async function checkBucket() {
  console.log('\n🪣 Verificando buckets de storage...\n');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Error al listar buckets:', error.message);
      return;
    }
    
    console.log('📦 Buckets disponibles:');
    data.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`);
    });
    
    const profilePhotos = data.find(b => b.name === 'profile-photos');
    if (profilePhotos) {
      console.log('\n✅ Bucket "profile-photos" existe');
    } else {
      console.log('\n❌ Bucket "profile-photos" NO existe');
      console.log('\n📝 Para crearlo, ejecuta en Supabase Dashboard:');
      console.log('   1. Ve a Storage');
      console.log('   2. Create bucket');
      console.log('   3. Nombre: profile-photos');
      console.log('   4. Public: true');
      console.log('   5. Allowed MIME types: image/jpeg, image/png');
      console.log('   6. Max file size: 5MB');
    }
  } catch (err) {
    console.log('❌ Error al verificar buckets:', err);
  }
}

async function checkUsers() {
  console.log('\n👥 Verificando usuarios...\n');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, nombre, apellido, created_at')
      .limit(5);
    
    if (error) {
      console.log('❌ Error al obtener usuarios:', error.message);
      return;
    }
    
    console.log(`✅ Encontrados ${data.length} usuarios (máximo 5 mostrados):`);
    data.forEach(user => {
      console.log(`  - ${user.username} (${user.nombre} ${user.apellido})`);
    });
  } catch (err) {
    console.log('❌ Error al verificar usuarios:', err);
  }
}

async function main() {
  console.log('🚀 VERIFICACIÓN DE SUPABASE');
  console.log('='.repeat(50));
  
  await checkTables();
  await checkBucket();
  await checkUsers();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Verificación completa\n');
}

main().catch(console.error);
