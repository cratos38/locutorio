const fetch = require('node-fetch');

async function testAPI() {
  const username = 'admin';
  const url = `https://locutorio.com.ve/api/photos?username=${username}&showAll=true`;
  
  console.log('🔍 Testing:', url);
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('\n📊 Response:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.photos && data.photos.length > 0) {
    console.log('\n✅ Fotos encontradas:', data.photos.length);
    data.photos.forEach((photo, i) => {
      console.log(`\n📸 Foto ${i + 1}:`);
      console.log('  - ID:', photo.id);
      console.log('  - Status:', photo.status);
      console.log('  - URL:', photo.storage_url);
    });
  } else {
    console.log('\n❌ No se encontraron fotos');
  }
}

testAPI().catch(console.error);
