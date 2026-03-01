import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Crear cliente de Supabase (compatible con Edge Runtime)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const data = await request.json();
    
    console.log('📥 API recibió datos:', Object.keys(data));
    
    // ========================================================================
    // CÁLCULO DE PORCENTAJE DE PERFIL
    // ========================================================================
    // IMPORTANTE: Solo los campos PÚBLICOS cuentan para el porcentaje visible
    // Los campos PRIVADOS (información-privada) se guardan pero NO suman al %
    // porque esa sección es opcional y no se muestra en el perfil público
    // ========================================================================
    
    // CAMPOS PÚBLICOS - Datos reales del perfil (NO fotos ni estados temporales)
    const publicFields = [
      // Básicos
      'nombre', 'edad', 'genero', 'ciudad',
      // Sobre mí - Información física y básica
      'altura', 'peso', 'tipo_cuerpo', 'color_ojos', 'color_cabello',
      'signo_zodiacal', 'educacion', 'etnia', 'vives_en', 'trabajas',
      // Presentación - Textos descriptivos
      'definete_en_frase', 'cuentanos_algo_tuyo', 'primera_cita_ideal',
      // Relaciones - Lo que busca
      'tiene_hijos', 'quiere_tener_hijos', 'estado_civil', 'que_buscas', 
      'razon_principal', 'casarse_importante', 'duracion_relacion_larga',
      // Cultura/Intereses - Gustos
      'pasatiempos', 'generos_peliculas', 'generos_musica', 'generos_libros',
      'deportes_practica', 'valores_tradicionales', 'espiritualidad', 'religion',
      // Estilo de vida
      'te_ejercitas', 'fumas', 'bebes_alcohol',
      'dieta_especial', 'personalidad_sociable', 'orden_mantenimiento',
      // Extras
      'tiene_vehiculo', 'tiene_mascota', 'idiomas'
    ];
    // NOTA: foto_perfil y status_text NO cuentan - no son datos de perfil
    // NOTA: que_haces eliminado - no existe en el formulario visible
    
    // CAMPOS PRIVADOS - NO se muestran públicamente, solo para algoritmo de búsqueda
    // Estos NO cuentan para el porcentaje visible
    const privateFields = [
      'ideas_politicas',
      'escuelas_privadas_publicas',
      'tus_padres_estan',
      'orden_nacimiento', 
      'economicamente_independiente',
      'nivel_ingresos',
      'importa_nivel_ingresos_pareja',
      'origen_geografico_privado',
      'clase_socioeconomica',
      'saldrias_mas_kilos',
      'saldrias_con_hijos'
    ];
    
    // Función helper para contar campos llenos
    const countFilledFields = (fields: string[]) => {
      let count = 0;
      fields.forEach(field => {
        const value = data[field];
        if (Array.isArray(value) && value.length > 0) {
          count++;
        } else if (value !== null && value !== undefined && value !== '' && value !== false) {
          count++;
        }
      });
      return count;
    };
    
    // Calcular porcentaje PÚBLICO (lo que se muestra al usuario)
    const filledPublicFields = countFilledFields(publicFields);
    const totalPublicFields = publicFields.length;
    const profileCompletion = Math.min(100, Math.round((filledPublicFields / totalPublicFields) * 100));
    
    // Calcular porcentaje PRIVADO (solo para uso interno/algoritmo)
    const filledPrivateFields = countFilledFields(privateFields);
    const totalPrivateFields = privateFields.length;
    const privateCompletion = Math.round((filledPrivateFields / totalPrivateFields) * 100);
    
    console.log(`📊 Perfil PÚBLICO: ${profileCompletion}% (${filledPublicFields}/${totalPublicFields} campos)`);
    console.log(`🔒 Perfil PRIVADO: ${privateCompletion}% (${filledPrivateFields}/${totalPrivateFields} campos) - No visible`);
    
    // Insertar o actualizar en Supabase
    console.log('💾 Guardando en Supabase...');
    const { data: result, error } = await supabase
      .from('users')
      .upsert({
        ...data,
        profile_completion: profileCompletion, // Solo campos públicos
        private_completion: privateCompletion, // Campos privados (para algoritmo de búsqueda)
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'username'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ 
        success: false,
        error: `Supabase error: ${error.message}`,
        details: error 
      }, { status: 400 });
    }
    
    console.log('✅ Perfil guardado exitosamente');
    return NextResponse.json({ success: true, data: result, profileCompletion });
  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json({ 
      success: false,
      error: `Error al guardar el perfil: ${error.message}`,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const showAllPhotos = searchParams.get('showAllPhotos') === 'true';
    
    if (!username) {
      return NextResponse.json({ error: 'Username requerido' }, { status: 400 });
    }
    
    // 1. Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (userError) {
      console.error('Supabase error:', userError);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // 2. Obtener fotos del usuario
    let photosQuery = supabase
      .from('photos')
      .select('id, storage_url, cropped_url, is_primary, status, created_at')
      .eq('user_id', userData.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false});
    
    // Si no es showAllPhotos, solo mostrar aprobadas
    if (!showAllPhotos) {
      photosQuery = photosQuery.eq('status', 'approved');
    }
    
    const { data: photosData, error: photosError } = await photosQuery;
    
    if (photosError) {
      console.warn('Error al cargar fotos:', photosError);
    }
    
    // 3. Regenerar URLs firmadas para fotos en buckets privados
    const fotosConUrls = await Promise.all((photosData || []).map(async (photo) => {
      try {
        // Determinar bucket según storage_url
        let bucket = 'photos-pending';
        if (photo.storage_url && photo.storage_url.includes('/photos-approved/')) {
          bucket = 'photos-approved';
        } else if (photo.storage_url && photo.storage_url.includes('/photos-rejected/')) {
          bucket = 'photos-rejected';
        }
        
        // Si está en bucket privado, regenerar URLs firmadas
        if (bucket === 'photos-pending' || bucket === 'photos-rejected') {
          const path = photo.storage_path;
          
          // Regenerar storage_url
          if (path) {
            const { data: signedData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(path, 3600); // 1 hora
            
            if (signedData) {
              photo.storage_url = signedData.signedUrl;
            }
          }
          
          // Regenerar cropped_url
          if (path) {
            const croppedPath = path.replace(/\.(jpg|png)$/, '_medium.$1');
            const { data: signedData } = await supabase.storage
              .from(bucket)
              .createSignedUrl(croppedPath, 3600);
            
            if (signedData) {
              photo.cropped_url = signedData.signedUrl;
            }
          }
        }
      } catch (err) {
        console.error('Error regenerando URLs:', err);
      }
      return photo;
    }));
    
    // 4. Mapear fotos al formato esperado - usar columnas reales de Supabase
    const fotos = fotosConUrls.map(photo => ({
      id: photo.id,
      url: photo.storage_url,
      url_medium: photo.cropped_url,
      url_thumbnail: photo.cropped_url, // Usar cropped como thumbnail temporalmente
      cropped_url: photo.cropped_url,
      storage_url: photo.storage_url,
      esPrincipal: photo.is_primary,
      is_principal: photo.is_primary,
      estado: photo.status === 'approved' ? 'aprobada' : 
              photo.status === 'rejected' ? 'rechazada' : 'pendiente'
    }));
    
    // 5. Combinar datos
    const profileWithPhotos = {
      ...userData,
      fotos: fotos
    };
    
    console.log(`📥 Perfil cargado: ${username} con ${fotos.length} fotos`);
    
    return NextResponse.json({ success: true, data: profileWithPhotos });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Error al obtener el perfil' }, { status: 500 });
  }
}
