const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcwNTA3OSwiZXhwIjoyMDgzMjgxMDc5fQ.zAlaqe2gLLOQ1KETVxGwlneuyNt3EXclY9h2G1-op8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  // Verificar estructura de la tabla
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('📋 Detalles:', JSON.stringify(error, null, 2));
  } else {
    console.log('✅ Tabla photos existe');
    console.log('📋 Columnas:', Object.keys(data[0] || {}));
  }
  
  // Intentar insertar un registro de prueba
  const testInsert = {
    user_id: '00000000-0000-0000-0000-000000000000',
    photo_type: 'profile',
    storage_path: 'test/test.jpg',
    storage_url: 'https://test.com/test.jpg',
    status: 'pending',
    is_primary: false,
    is_visible: false,
    original_filename: 'test.jpg',
    file_size: 12345,
    mime_type: 'image/jpeg'
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('photos')
    .insert(testInsert)
    .select();
  
  if (insertError) {
    console.log('\n❌ Error al insertar:', insertError.message);
    console.log('📋 Código:', insertError.code);
    console.log('📋 Detalles:', insertError.details);
  } else {
    console.log('\n✅ Inserción exitosa!');
    // Borrar el registro de prueba
    await supabase.from('photos').delete().eq('id', insertData[0].id);
  }
}

checkTable();
