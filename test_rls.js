const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MzcxNjgsImV4cCI6MjA1MTQxMzE2OH0.7hCmkvzqDM0bZqhj0-rFe5tVn69_cZYQaM2GYYv7mmU';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgzNzE2OCwiZXhwIjoyMDUxNDEzMTY4fQ.qv2B3SBqaK7SG4RwxBQqMzWNBh4RvOvg9AqnCh_jbEM';

const userId = 'ae346f5e-4a0e-419f-aa5a-0ecf6ecc9b3c';

console.log('🔍 TESTING RLS POLICIES\n');

(async () => {
  // TEST 1: Con ANON KEY (como el frontend)
  console.log('📌 TEST 1: Con ANON KEY (como en el navegador)');
  const supabaseAnon = createClient(supabaseUrl, anonKey);
  
  const { data: photosAnon, error: errorAnon } = await supabaseAnon
    .from('photos')
    .select('id, status, is_visible, user_id')
    .eq('user_id', userId)
    .eq('photo_type', 'profile');
  
  console.log('   Fotos encontradas:', photosAnon?.length || 0);
  if (errorAnon) console.log('   ❌ Error:', errorAnon.message);
  if (photosAnon) console.log('   ✅ Datos:', photosAnon);
  
  console.log('\n📌 TEST 2: Con SERVICE KEY (bypassing RLS)');
  const supabaseService = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });
  
  const { data: photosService, error: errorService } = await supabaseService
    .from('photos')
    .select('id, status, is_visible, user_id')
    .eq('user_id', userId)
    .eq('photo_type', 'profile');
  
  console.log('   Fotos encontradas:', photosService?.length || 0);
  if (errorService) console.log('   ❌ Error:', errorService.message);
  if (photosService) console.log('   ✅ Datos:', photosService);
  
  console.log('\n🎯 CONCLUSIÓN:');
  if (photosAnon?.length === 0 && photosService?.length > 0) {
    console.log('   🔴 PROBLEMA: RLS está bloqueando el acceso con ANON KEY');
    console.log('   💡 SOLUCIÓN: Agregar política RLS para lectura pública');
  } else if (photosAnon?.length > 0) {
    console.log('   ✅ RLS funciona correctamente');
  }
})();
