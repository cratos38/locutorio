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

    // 2. Obtener fotos aprobadas del usuario
    const { data: photosData, error: photosError } = await supabase
      .from('profile_photos')
      .select('id, url, url_medium, url_thumbnail, is_principal, estado, orden, created_at')
      .eq('user_id', userData.id)
      .eq('estado', 'aprobada')
      .order('is_principal', { ascending: false })
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false });

    // Mapear fotos al formato esperado
    const fotos = (photosData || []).map(photo => ({
      id: photo.id,
      url: photo.url,
      url_medium: photo.url_medium,
      url_thumbnail: photo.url_thumbnail,
      esPrincipal: photo.is_principal,
      estado: photo.estado as 'pendiente' | 'aprobada' | 'rechazada',
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
