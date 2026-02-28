const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Listar archivos en el bucket
supabase.storage
  .from('photos-pending')
  .list('admin', { limit: 5 })
  .then(({ data, error }) => {
    if (error) {
      console.error('Error listando archivos:', error);
    } else {
      console.log('Archivos en photos-pending/admin:');
      data.forEach(file => {
        console.log(`- ${file.name}`);
        const publicUrl = supabase.storage.from('photos-pending').getPublicUrl(`admin/${file.name}`);
        console.log(`  URL pública: ${publicUrl.data.publicUrl}`);
      });
    }
    process.exit(0);
  });
