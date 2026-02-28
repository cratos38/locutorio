const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // 1. Buscar usuario admin
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', 'admin')
    .single();
  
  if (userError) {
    console.log('❌ Usuario admin no encontrado:', userError.message);
    return;
  }
  
  console.log('✅ Usuario admin encontrado:');
  console.log('   - ID:', user.id);
  console.log('   - Username:', user.username);
  
  // 2. Buscar fotos de ese usuario
  const { data: photos, error: photosError } = await supabase
    .from('photos')
    .select('*')
    .eq('user_id', user.id)
    .eq('photo_type', 'profile');
  
  if (photosError) {
    console.log('\n❌ Error buscando fotos:', photosError.message);
    return;
  }
  
  console.log(`\n📸 Fotos encontradas: ${photos?.length || 0}`);
  
  if (photos && photos.length > 0) {
    photos.forEach((photo, i) => {
      console.log(`\nFoto ${i + 1}:`);
      console.log('   - ID:', photo.id);
      console.log('   - Status:', photo.status);
      console.log('   - is_visible:', photo.is_visible);
      console.log('   - is_primary:', photo.is_primary);
      console.log('   - storage_url:', photo.storage_url?.substring(0, 50) + '...');
    });
  }
}

check();
