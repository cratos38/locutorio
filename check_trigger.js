const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

console.log('🔍 Verificando si hay trigger/webhook configurado...\n');

(async () => {
  // Check si el trigger existe
  const { data, error } = await supabase
    .rpc('exec', {
      query: `
        SELECT 
          trigger_name,
          event_manipulation,
          event_object_table,
          action_statement
        FROM information_schema.triggers
        WHERE event_object_table = 'photos'
      `
    })
    .catch(e => ({ error: e }));
  
  if (error) {
    console.log('❌ No se pudo consultar triggers (esto es normal)');
    console.log('   Verifica manualmente en Supabase Dashboard > Database > Triggers');
  } else if (data) {
    console.log('✅ Triggers encontrados:', data);
  }
  
  // Check las últimas fotos
  const { data: photos } = await supabase
    .from('photos')
    .select('id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('\n📸 Últimas 3 fotos en BD:');
  if (photos && photos.length > 0) {
    photos.forEach((p, i) => {
      console.log(`   ${i+1}. Status: ${p.status}, Created: ${p.created_at}`);
    });
  } else {
    console.log('   (sin fotos)');
  }
  
  console.log('\n💡 DIAGNÓSTICO:');
  console.log('   Si todas las fotos tienen status="pending":');
  console.log('   → El TRIGGER NO está creado en Supabase');
  console.log('   → Necesitas ejecutar el SQL del trigger');
})();
