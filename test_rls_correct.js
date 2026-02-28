const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDUwNzksImV4cCI6MjA4MzI4MTA3OX0.Oke8nAFHSwgF-S02TRCGCbELMRdZLc_fuXfabp0_QCg';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';

const userId = 'ae346f5e-4a0e-419f-aa5a-0ecf6ecc9b3c';

console.log('🔍 TESTING RLS POLICIES (Keys correctas)\n');

(async () => {
  // TEST 1: Con ANON KEY (como el frontend)
  console.log('📌 TEST 1: Con ANON KEY (como en producción)');
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  
  const { data: photosAnon, error: errorAnon } = await supabaseAnon
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .eq('photo_type', 'profile');
  
  console.log('   Fotos encontradas:', photosAnon?.length || 0);
  if (errorAnon) console.log('   ❌ Error:', errorAnon.message);
  
  // TEST 2: Con SERVICE KEY
  console.log('\n📌 TEST 2: Con SERVICE KEY (bypassing RLS)');
  const supabaseService = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
  
  const { data: photosService, error: errorService } = await supabaseService
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .eq('photo_type', 'profile');
  
  console.log('   Fotos encontradas:', photosService?.length || 0);
  if (errorService) console.log('   ❌ Error:', errorService.message);
  
  // Mostrar detalles
  if (photosService && photosService.length > 0) {
    console.log('\n📸 Detalles de las fotos en BD:');
    photosService.forEach((p, i) => {
      console.log(`   Foto ${i+1}:`);
      console.log(`      ID: ${p.id}`);
      console.log(`      Status: ${p.status}`);
      console.log(`      is_visible: ${p.is_visible}`);
      console.log(`      is_primary: ${p.is_primary}`);
    });
  }
  
  console.log('\n🎯 CONCLUSIÓN:');
  if (photosAnon?.length === 0 && photosService?.length > 0) {
    console.log('   🔴 PROBLEMA ENCONTRADO: RLS bloquea acceso con ANON KEY');
    console.log('   📋 Las fotos EXISTEN en BD pero ANON KEY no puede verlas');
    console.log('   💡 SOLUCIÓN: Configurar políticas RLS correctamente');
  } else if (photosAnon?.length > 0) {
    console.log('   ✅ RLS funciona - ANON KEY puede leer las fotos');
  } else {
    console.log('   ⚠️  No hay fotos en BD (problema diferente)');
  }
})();
