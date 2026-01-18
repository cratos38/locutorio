const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hbzlxwbyxuzdasfaksiy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhiemx4d2J5eHV6ZGFzZmFrc2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDUwNzksImV4cCI6MjA4MzI4MTA3OX0.Oke8nAFHSwgF-S02TRCGCbELMRdZLc_fuXfabp0_QCg'
);

async function checkTables() {
  console.log('=== VERIFICANDO TABLAS EN SUPABASE ===\n');
  
  const tablesToCheck = [
    'users', 'photos', 'albums', 'album_photos', 'friends', 
    'blocks', 'favorites', 'conversations', 'messages', 
    'chat_rooms', 'reports', 'notifications', 'verification_codes'
  ];
  
  for (const table of tablesToCheck) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: NO EXISTE o error - ${error.message}`);
    } else {
      console.log(`✅ ${table}: EXISTE (${count || 0} registros)`);
    }
  }
  
  // Ver datos del usuario admin
  console.log('\n=== DATOS DEL USUARIO ADMIN ===');
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'admin')
    .single();
  
  if (adminError) {
    console.log('Error:', adminError.message);
  } else if (admin) {
    console.log('Campos con datos:');
    Object.entries(admin).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`  ${key}: ${JSON.stringify(value).substring(0, 80)}`);
      }
    });
  }
}

checkTables();
