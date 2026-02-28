import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import PublicProfileClient from './PublicProfileClient';

// ✅ ESTO SE EJECUTA EN EL SERVIDOR (SSR)
export default async function PublicProfilePage({ 
  params 
}: { 
  params: { username: string } 
}) {
  // Crear cliente Supabase con Service Role Key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Obtener datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', params.username)
      .single();

    if (userError || !userData) {
      console.error('Usuario no encontrado:', params.username);
      notFound();
    }

    // 2. Obtener fotos del usuario
    // PERFIL PÚBLICO: Solo mostrar fotos APROBADAS y VISIBLES
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('id, storage_url, cropped_url, is_primary, status, display_order, created_at')
      .eq('user_id', userData.id)
      .eq('photo_type', 'profile')
      .eq('status', 'approved')  // Solo fotos aprobadas
      .eq('is_visible', true)     // Solo fotos visibles
      .order('is_primary', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    // Mapear fotos al formato esperado
    const fotos = (photosData || []).map(photo => ({
      id: photo.id,
      url: photo.storage_url,           // Campo nuevo: storage_url
      url_medium: photo.cropped_url,    // Campo nuevo: cropped_url  
      url_thumbnail: photo.cropped_url, // Usar mismo cropped para thumbnail
      esPrincipal: photo.is_primary,    // Campo nuevo: is_primary
      estado: photo.status as 'pending' | 'approved' | 'rejected', // Campo nuevo: status
    }));

    // 3. Construir objeto de perfil
    const profile = {
      ...userData,
      fotos,
      foto_perfil: fotos.find(f => f.esPrincipal)?.url || fotos[0]?.url || null,
    };

    // 4. Pasar datos pre-cargados al componente cliente
    return <PublicProfileClient profile={profile} username={params.username} />;

  } catch (error) {
    console.error('Error al cargar perfil:', error);
    notFound();
  }
}
