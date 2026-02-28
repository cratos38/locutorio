const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🔍 TEST: Insertando foto de prueba para ver si trigger funciona...\n');

(async () => {
  // Insertar foto de prueba
  const { data, error } = await supabase
    .from('photos')
    .insert({
      user_id: 'ae346f5e-4a0e-419f-aa5a-0ecf6ecc9b3c', // user admin
      photo_type: 'profile',
      storage_path: 'test/test.jpg',
      storage_url: 'https://test.com/test.jpg',
      status: 'pending',
      is_visible: false
    })
    .select()
    .single();
  
  if (error) {
    console.log('❌ Error insertando foto:', error.message);
  } else {
    console.log('✅ Foto insertada con ID:', data.id);
    console.log('   Status inicial:', data.status);
    
    // Esperar 2 segundos y ver si cambió
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: updated } = await supabase
      .from('photos')
      .select('status, processed_at')
      .eq('id', data.id)
      .single();
    
    console.log('\n🔄 Después de 2 segundos:');
    console.log('   Status actual:', updated?.status);
    console.log('   Processed_at:', updated?.processed_at);
    
    if (updated?.status === 'processing') {
      console.log('\n✅ TRIGGER FUNCIONA! El status cambió a "processing"');
      console.log('   → El webhook DEBERÍA haberse llamado');
    } else if (updated?.status === 'pending') {
      console.log('\n❌ TRIGGER NO FUNCIONA - Status sigue en "pending"');
      console.log('   → Falta crear el trigger en Supabase');
    }
    
    // Limpiar foto de prueba
    await supabase.from('photos').delete().eq('id', data.id);
    console.log('\n🧹 Foto de prueba eliminada');
  }
})();
