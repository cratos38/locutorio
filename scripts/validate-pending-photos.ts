/**
 * Script para validar todas las fotos pendientes
 * Uso: npx tsx scripts/validate-pending-photos.ts
 */

const SUPABASE_URL = 'https://hbzlxwbyxuzdasfaksiy.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SITE_URL = 'https://locutorio.com.ve';

async function validatePendingPhotos() {
  console.log('🔍 Buscando fotos pendientes...');
  
  // Obtener todas las fotos pendientes
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profile_photos?estado=eq.pendiente&select=id,url,user_id,is_principal`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  const photos = await response.json();
  
  if (!photos || photos.length === 0) {
    console.log('✅ No hay fotos pendientes');
    return;
  }
  
  console.log(`📸 Encontradas ${photos.length} fotos pendientes`);
  console.log('🤖 Iniciando validación automática...\n');
  
  let approved = 0;
  let rejected = 0;
  let manual = 0;
  let errors = 0;
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    console.log(`[${i + 1}/${photos.length}] Validando foto ${photo.id}...`);
    
    try {
      // Llamar al endpoint de validación
      const result = await fetch(`${SITE_URL}/api/profile-photos/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          photoId: photo.id,
          photoUrl: photo.url,
          isPrincipal: photo.is_principal
        })
      });
      
      const data = await result.json();
      
      if (data.verdict === 'APPROVE') {
        console.log('  ✅ Aprobada');
        approved++;
      } else if (data.verdict === 'REJECT') {
        console.log(`  ❌ Rechazada: ${data.reason}`);
        rejected++;
      } else if (data.verdict === 'MANUAL_REVIEW') {
        console.log('  ⚠️ Revisión manual');
        manual++;
      }
      
      // Esperar 3 segundos entre fotos para no saturar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error: any) {
      console.error(`  ❌ Error:`, error.message);
      errors++;
    }
  }
  
  console.log('\n📊 RESUMEN:');
  console.log(`  ✅ Aprobadas: ${approved}`);
  console.log(`  ❌ Rechazadas: ${rejected}`);
  console.log(`  ⚠️ Revisión manual: ${manual}`);
  console.log(`  🔴 Errores: ${errors}`);
}

validatePendingPhotos();
