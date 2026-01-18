const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hbzlxwbyxuzdasfaksiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDUwNzksImV4cCI6MjA4MzI4MTA3OX0.Oke8nAFHSwgF-S02TRCGCbELMRdZLc_fuXfabp0_QCg'
);

async function checkStorage() {
  console.log('=== VERIFICANDO STORAGE DE SUPABASE ===\n');
  
  // Listar buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.log('Error listando buckets:', bucketsError.message);
  } else {
    console.log('BUCKETS ENCONTRADOS:', buckets.length);
    
    for (const bucket of buckets) {
      console.log(`\n📁 Bucket: ${bucket.name} (public: ${bucket.public})`);
      
      // Listar archivos en cada bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 100 });
      
      if (filesError) {
        console.log(`   Error: ${filesError.message}`);
      } else if (files && files.length > 0) {
        console.log(`   Archivos/Carpetas:`);
        for (const file of files) {
          if (file.id) {
            // Es un archivo
            const { data: urlData } = supabase.storage.from(bucket.name).getPublicUrl(file.name);
            console.log(`   - ${file.name} (${file.metadata?.size || 'archivo'}) - URL: ${urlData.publicUrl}`);
          } else {
            // Es una carpeta, listar contenido
            console.log(`   📂 Carpeta: ${file.name}`);
            const { data: subFiles } = await supabase.storage
              .from(bucket.name)
              .list(file.name, { limit: 10 });
            if (subFiles) {
              for (const sf of subFiles) {
                if (sf.name) {
                  const { data: urlData } = supabase.storage.from(bucket.name).getPublicUrl(`${file.name}/${sf.name}`);
                  console.log(`      - ${sf.name} - URL: ${urlData.publicUrl}`);
                }
              }
            }
          }
        }
      } else {
        console.log(`   (vacío)`);
      }
    }
  }
  
  // Verificar tabla photos
  console.log('\n=== VERIFICANDO TABLA PHOTOS ===');
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .limit(10);
    
  if (photosError) {
    console.log('Error:', photosError.message);
  } else {
    console.log('Fotos en tabla photos:', photos?.length || 0);
    if (photos && photos.length > 0) {
      photos.forEach(p => {
        console.log(`  - ID: ${p.id}, user_id: ${p.user_id}, URL: ${p.url}, Principal: ${p.is_principal}, Estado: ${p.approval_status}`);
      });
    }
  }
}

checkStorage();
