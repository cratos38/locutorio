"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import InternalHeader from "@/components/InternalHeader";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// Crear cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =================== FUNCIÓN DE REDIMENSIONAMIENTO ===================
/**
 * Redimensiona una imagen manteniendo su aspect ratio
 * El lado más largo se limita a maxSize (1024px por defecto)
 * Calidad: 0.95 (95%) para pérdida mínima imperceptible
 */
async function resizeImage(
  file: File, 
  maxSize: number = 1024,
  quality: number = 0.95
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular dimensiones manteniendo aspect ratio
        // Solo redimensionar si algún lado es mayor a maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            // Foto horizontal: limitar ancho
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            // Foto vertical: limitar alto
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        // Si ambos lados son ≤ maxSize, mantener tamaño original
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('No se pudo crear el blob'));
            return;
          }
          const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
          console.log(`📏 Redimensionado: ${img.width}×${img.height} → ${width.toFixed(0)}×${height.toFixed(0)} (${(blob.size / 1024).toFixed(2)} KB)`);
          resolve(resizedFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const albumId = Number(params.id);

  const [album, setAlbum] = useState<any>(null);
  const [albumOwnerUsername, setAlbumOwnerUsername] = useState<string>("");
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // New states for editing
  const [showEditAlbumModal, setShowEditAlbumModal] = useState(false);
  const [showDeleteAlbumModal, setShowDeleteAlbumModal] = useState(false);
  const [showAddPhotosModal, setShowAddPhotosModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState("");
  const [editAlbumDescription, setEditAlbumDescription] = useState("");
  const [editAlbumPrivacy, setEditAlbumPrivacy] = useState("");
  const [editAlbumPassword, setEditAlbumPassword] = useState("");
  const [editPhotoDescription, setEditPhotoDescription] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoDescription, setNewPhotoDescription] = useState("");
  const [photoLikes, setPhotoLikes] = useState<Record<number, number>>({});
  const [userLikes, setUserLikes] = useState<Set<number>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  
  // Comments and statistics
  const [photoComments, setPhotoComments] = useState<Record<number, any[]>>({});
  const [newComment, setNewComment] = useState("");
  const [commentPrivacy, setCommentPrivacy] = useState<"public" | "private">("public");
  const [photoViews, setPhotoViews] = useState<Record<number, any[]>>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedPhotoStats, setSelectedPhotoStats] = useState<number | null>(null);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);

  // Usuario dinámico desde AuthContext
  const currentUser = { 
    id: user?.id || 0, 
    username: user?.username || 'usuario', 
    name: user?.username || 'Usuario', 
    avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'U') + '&background=10b981&color=fff', 
    friends: [] as number[] // TODO: Cargar amigos desde la base de datos
  };

  // Load data from Supabase
  useEffect(() => {
    setIsMounted(true);
    
    async function loadAlbumData() {
      try {
        setIsLoadingAlbum(true);
        // Cargar álbum desde Supabase
        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .eq('id', albumId)
          .single();
        
        if (albumError) {
          console.error('Error cargando álbum:', albumError);
          setAlbum(null);
          return;
        }
        
        setAlbum(albumData);
        if (albumData) {
          setEditAlbumTitle(albumData.title);
          setEditAlbumDescription(albumData.description || "");
          setEditAlbumPrivacy(albumData.privacy);
          setEditAlbumPassword(albumData.password || "");
          
          // Cargar username del dueño del álbum
          if (albumData.user_id) {
            const { data: ownerData } = await supabase
              .from('users')
              .select('username')
              .eq('id', albumData.user_id)
              .single();
            
            if (ownerData) {
              setAlbumOwnerUsername(ownerData.username);
            }
          }
        }
        
        // Cargar fotos desde Supabase
        setIsLoadingPhotos(true);
        const { data: photosData, error: photosError } = await supabase
          .from('album_photos')
          .select('*')
          .eq('album_id', albumId)
          .order('orden', { ascending: true });
        
        if (photosError) {
          console.error('Error cargando fotos:', photosError);
        } else {
          setPhotos(photosData || []);
        }
        setIsLoadingPhotos(false);
        
        // Load likes, comments, views from localStorage (temporal)
        const likesData = localStorage.getItem(`album_${albumId}_likes`);
        if (likesData) {
          setPhotoLikes(JSON.parse(likesData));
        }
        
        const userLikesData = localStorage.getItem(`album_${albumId}_user_likes`);
        if (userLikesData) {
          setUserLikes(new Set(JSON.parse(userLikesData)));
        }
        
        const commentsData = localStorage.getItem(`album_${albumId}_comments`);
        if (commentsData) {
          setPhotoComments(JSON.parse(commentsData));
        }
        
        const viewsData = localStorage.getItem(`album_${albumId}_views`);
        if (viewsData) {
          setPhotoViews(JSON.parse(viewsData));
        }
      } catch (err) {
        console.error('Error general:', err);
      } finally {
        setIsLoadingAlbum(false);
      }
    }
    
    loadAlbumData();
  }, [albumId]);

  // Register photo view when opened
  useEffect(() => {
    if (selectedPhoto !== null && photos[selectedPhoto]) {
      const photoId = photos[selectedPhoto].id;
      const newPhotoViews = { ...photoViews };
      
      if (!newPhotoViews[photoId]) {
        newPhotoViews[photoId] = [];
      }
      
      // Check if user already viewed this photo
      const existingView = newPhotoViews[photoId].find((v: any) => v.userId === currentUser.id);
      
      if (existingView) {
        // Increment view count
        existingView.count += 1;
        existingView.lastView = new Date().toISOString();
      } else {
        // Add new view
        newPhotoViews[photoId].push({
          userId: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          avatar: currentUser.avatar,
          count: 1,
          firstView: new Date().toISOString(),
          lastView: new Date().toISOString(),
        });
      }
      
      setPhotoViews(newPhotoViews);
      localStorage.setItem(`album_${albumId}_views`, JSON.stringify(newPhotoViews));
    }
  }, [selectedPhoto]);

  // Check access when album loads
  useEffect(() => {
    if (!album) return;

    if (album.privacy === "publico") {
      setHasAccess(true);
      setShowPasswordModal(false);
    } else if (album.user_id === user?.id) {
      // Si eres el dueño del álbum, SIEMPRE tienes acceso
      setHasAccess(true);
      setShowPasswordModal(false);
    } else if (album.privacy === "amigos") {
      // Si NO eres el dueño y el álbum es privado (solo amigos)
      // Verificar si eres amigo del dueño
      // TODO: implementar lógica de amistad desde la BD
      setHasAccess(false);
      setShowPasswordModal(false);
    } else if (album.privacy === "protegido") {
      setShowPasswordModal(true);
      setHasAccess(false);
    }
  }, [album, user]);

  const handlePasswordSubmit = () => {
    if (passwordInput === album.password) {
      setHasAccess(true);
      setShowPasswordModal(false);
      setPasswordError("");
    } else {
      setPasswordError("Contraseña incorrecta");
      setPasswordInput("");
    }
  };

  // Edit Album
  const handleEditAlbum = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .update({
          title: editAlbumTitle,
          description: editAlbumDescription,
          privacy: editAlbumPrivacy,
          password: editAlbumPrivacy === "protegido" ? editAlbumPassword : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', albumId)
        .select()
        .single();
      
      if (error) {
        console.error('Error actualizando álbum:', error);
        alert('Error al actualizar el álbum');
        return;
      }
      
      setAlbum(data);
      setShowEditAlbumModal(false);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al actualizar el álbum');
    }
  };

  // Delete Album
  const handleDeleteAlbum = async () => {
    try {
      // Primero eliminar todas las fotos del Storage
      const { data: photosToDelete } = await supabase
        .from('album_photos')
        .select('url')
        .eq('album_id', albumId);
      
      if (photosToDelete && photosToDelete.length > 0) {
        const filePaths = photosToDelete.map(photo => {
          const url = new URL(photo.url);
          return url.pathname.split('/').slice(-1)[0]; // Extraer solo el nombre del archivo
        });
        
        await supabase.storage
          .from('album-photos')
          .remove(filePaths);
      }
      
      // Eliminar álbum (las fotos se eliminan automáticamente por CASCADE)
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);
      
      if (error) {
        console.error('Error eliminando álbum:', error);
        alert('Error al eliminar el álbum');
        return;
      }
      
      // Limpiar localStorage
      localStorage.removeItem(`album_${albumId}_likes`);
      localStorage.removeItem(`album_${albumId}_user_likes`);
      localStorage.removeItem(`album_${albumId}_comments`);
      localStorage.removeItem(`album_${albumId}_views`);
      
      router.push("/albums");
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el álbum');
    }
  };

  // Add Photos
  const handleAddPhoto = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      console.log(`📤 Subiendo ${selectedFiles.length} foto(s) a Supabase...`);
      
      const uploadedPhotos = [];
      
      for (const file of selectedFiles) {
        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${albumId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Subir archivo a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('album-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error subiendo foto:', uploadError);
          continue;
        }
        
        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('album-photos')
          .getPublicUrl(fileName);
        
        console.log('✅ Foto subida:', publicUrl);
        
        // Guardar referencia en la base de datos
        const { data: photoData, error: photoError } = await supabase
          .from('album_photos')
          .insert({
            album_id: albumId,
            url: publicUrl,
            description: newPhotoDescription,
            orden: photos.length + uploadedPhotos.length,
          })
          .select()
          .single();
        
        if (photoError) {
          console.error('Error guardando foto en BD:', photoError);
          continue;
        }
        
        uploadedPhotos.push(photoData);
      }
      
      // Actualizar lista de fotos
      const updatedPhotos = [...photos, ...uploadedPhotos];
      setPhotos(updatedPhotos);
      
      // Actualizar contador de fotos y cover del álbum
      const updateData: any = {
        photo_count: updatedPhotos.length,
        updated_at: new Date().toISOString(),
      };
      
      // Si es la primera foto, establecerla como portada
      if (photos.length === 0 && uploadedPhotos.length > 0) {
        updateData.cover_photo_url = uploadedPhotos[0].url;
      }
      
      await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId);
      
      // Limpiar estado
      setSelectedFiles([]);
      setUploadPreviews([]);
      setNewPhotoDescription("");
      setShowAddPhotosModal(false);
      
      console.log(`✅ ${uploadedPhotos.length} foto(s) agregada(s) exitosamente`);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al agregar fotos');
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // Process files
  const handleFiles = async (files: File[]) => {
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    
    console.log(`📤 Procesando ${imageFiles.length} imagen(es)...`);
    
    // Redimensionar todas las imágenes a máximo 1024px (lado más largo)
    const resizedImages = await Promise.all(
      imageFiles.map(file => resizeImage(file, 1024, 0.95))
    );
    
    setSelectedFiles(prev => [...prev, ...resizedImages]);
    
    // Create previews
    resizedImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove file from selection
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Add comment
  const handleAddComment = (photoIndex: number) => {
    if (!newComment.trim()) return;
    
    const photoId = photos[photoIndex].id;
    const newPhotoComments = { ...photoComments };
    
    if (!newPhotoComments[photoId]) {
      newPhotoComments[photoId] = [];
    }
    
    const comment = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      avatar: currentUser.avatar,
      text: newComment,
      privacy: commentPrivacy,
      timestamp: new Date().toISOString(),
    };
    
    newPhotoComments[photoId].push(comment);
    setPhotoComments(newPhotoComments);
    localStorage.setItem(`album_${albumId}_comments`, JSON.stringify(newPhotoComments));
    
    setNewComment("");
    setCommentPrivacy("public");
  };

  // Delete comment
  const handleDeleteComment = (photoId: number, commentId: number) => {
    const newPhotoComments = { ...photoComments };
    if (newPhotoComments[photoId]) {
      newPhotoComments[photoId] = newPhotoComments[photoId].filter((c: any) => c.id !== commentId);
      setPhotoComments(newPhotoComments);
      localStorage.setItem(`album_${albumId}_comments`, JSON.stringify(newPhotoComments));
    }
  };

  // Get visible comments (public + user's private)
  const getVisibleComments = (photoId: number) => {
    const comments = photoComments[photoId] || [];
    return comments.filter((c: any) => 
      c.privacy === "public" || c.userId === currentUser.id
    );
  };

  // Get unique viewers for a photo
  const getPhotoViewers = (photoId: number) => {
    return photoViews[photoId] || [];
  };

  // Get total view count for a photo
  const getTotalViews = (photoId: number) => {
    const viewers = getPhotoViewers(photoId);
    return viewers.reduce((sum: number, v: any) => sum + v.count, 0);
  };

  // Delete Photo
  const handleDeletePhoto = async () => {
    if (editingPhotoIndex === null) return;
    
    try {
      const photoToDelete = photos[editingPhotoIndex];
      
      // Extraer el path del archivo del Storage
      const url = new URL(photoToDelete.url);
      const filePath = url.pathname.split('/storage/v1/object/public/album-photos/')[1] || 
                       url.pathname.split('/').slice(-3).join('/'); // user_id/album_id/filename
      
      // Eliminar del Storage
      const { error: storageError } = await supabase.storage
        .from('album-photos')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error eliminando foto del storage:', storageError);
      }
      
      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('album_photos')
        .delete()
        .eq('id', photoToDelete.id);
      
      if (dbError) {
        console.error('Error eliminando foto de BD:', dbError);
        alert('Error al eliminar la foto');
        return;
      }
      
      // Actualizar lista local
      const updatedPhotos = photos.filter((_, index) => index !== editingPhotoIndex);
      setPhotos(updatedPhotos);
      
      // Actualizar contador en el álbum
      const updateData: any = {
        photo_count: updatedPhotos.length,
        updated_at: new Date().toISOString(),
      };
      
      // Si la foto eliminada era la portada, actualizar
      if (album?.cover_photo_url === photoToDelete.url && updatedPhotos.length > 0) {
        updateData.cover_photo_url = updatedPhotos[0].url;
      }
      
      await supabase
        .from('albums')
        .update(updateData)
        .eq('id', albumId);
      
      setShowDeletePhotoModal(false);
      setEditingPhotoIndex(null);
      
      console.log('✅ Foto eliminada exitosamente');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar la foto');
    }
  };

  // Edit Photo Description
  const handleEditPhotoDescription = async () => {
    if (editingPhotoIndex === null) return;
    
    try {
      const photoToEdit = photos[editingPhotoIndex];
      
      const { error } = await supabase
        .from('album_photos')
        .update({ description: editPhotoDescription })
        .eq('id', photoToEdit.id);
      
      if (error) {
        console.error('Error actualizando descripción:', error);
        alert('Error al actualizar la descripción');
        return;
      }
      
      // Actualizar lista local
      const updatedPhotos = [...photos];
      updatedPhotos[editingPhotoIndex].description = editPhotoDescription;
      setPhotos(updatedPhotos);
      
      setShowEditPhotoModal(false);
      setEditingPhotoIndex(null);
      setEditPhotoDescription("");
      
      console.log('✅ Descripción actualizada');
    } catch (err) {
      console.error('Error:', err);
      alert('Error al actualizar la descripción');
    }
  };

  // Set Cover Photo
  // Toggle Like
  const handleToggleLike = (photoIndex: number) => {
    const photoId = photos[photoIndex].id;
    const newUserLikes = new Set(userLikes);
    const newPhotoLikes = { ...photoLikes };
    
    if (newUserLikes.has(photoId)) {
      newUserLikes.delete(photoId);
      newPhotoLikes[photoId] = Math.max(0, (newPhotoLikes[photoId] || 0) - 1);
    } else {
      newUserLikes.add(photoId);
      newPhotoLikes[photoId] = (newPhotoLikes[photoId] || 0) + 1;
    }
    
    setUserLikes(newUserLikes);
    setPhotoLikes(newPhotoLikes);
    
    localStorage.setItem(`album_${albumId}_likes`, JSON.stringify(newPhotoLikes));
    localStorage.setItem(`album_${albumId}_user_likes`, JSON.stringify(Array.from(newUserLikes)));
  };

  // Download Photo
  const handleDownloadPhoto = async (photoUrl: string, photoIndex: number) => {
    try {
      // Fetch la imagen como blob para evitar problemas de CORS
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      
      // Crear URL local del blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Crear link de descarga
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photo_${albumId}_${photoIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL del blob
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error descargando foto:', err);
      alert('Error al descargar la foto. Intenta con click derecho → Guardar imagen.');
    }
  };

  const privacyLabels = {
    publico: { label: "Público", icon: "🌍", color: "text-green-400" },
    amigos: { label: "Solo Amigos", icon: "👥", color: "text-blue-400" },
    protegido: { label: "Protegido", icon: "🔒", color: "text-amber-400" },
  };

  if (!isMounted || isLoadingAlbum) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white font-display">
        <InternalHeader />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-connect-bg-dark text-white font-display">
        <InternalHeader />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto bg-connect-card rounded-2xl p-12 text-center border-2 border-connect-border">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Álbum no encontrado</h2>
            <p className="text-connect-muted mb-6">El álbum que buscas no existe o ha sido eliminado.</p>
            <button 
              onClick={() => router.push("/albums")} 
              className="px-6 py-3 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all font-medium"
            >
              Volver a Álbumes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const privacy = privacyLabels[album.privacy as keyof typeof privacyLabels];

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-connect-muted hover:text-primary transition-colors mb-8">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Álbumes
        </button>

        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">{album.title}</h1>
              {album.description && <p className="text-lg text-connect-muted">{album.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-md flex items-center gap-2 border border-white/10">
                <span className={privacy.color}>{privacy.icon}</span>
                {privacy.label}
              </div>
              {album.user_id === user?.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEditAlbumModal(true)}
                    className="px-4 py-2 bg-transparent border border-transparent text-gray-400 hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteAlbumModal(true)}
                    className="px-4 py-2 bg-transparent border border-transparent text-gray-400 hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] rounded-lg transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-connect-muted">
              <span>{photos.length} fotos</span>
              <span>•</span>
              <span>{album.lastUpdate}</span>
            </div>
            {album.user_id === user?.id && hasAccess && (
              <button
                onClick={() => setShowAddPhotosModal(true)}
                className="px-4 py-2 bg-transparent border border-transparent text-gray-400 hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Fotos
              </button>
            )}
          </div>
        </div>

        {/* Content based on access */}
        {hasAccess ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos && photos.length > 0 ? (
              photos.map((photo: any, index: number) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden group bg-connect-card cursor-pointer"
                  onClick={() => setSelectedPhoto(index)}
                >
                  <img 
                    src={photo.url} 
                    alt={photo.description} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Like button - top right, always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleLike(index);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full transition-all hover:bg-black/80 z-10"
                  >
                    <svg 
                      className={`w-4 h-4 ${userLikes.has(photo.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                      fill={userLikes.has(photo.id) ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  
                  {/* Like count - top left */}
                  {photoLikes[photo.id] > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs flex items-center gap-1">
                      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      {photoLikes[photo.id]}
                    </div>
                  )}
                  
                  {/* Owner controls - bottom, only visible on hover */}
                  {album.user_id === user?.id && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhotoIndex(index);
                          setEditPhotoDescription(photo.description || "");
                          setShowEditPhotoModal(true);
                        }}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
                        title="Editar descripción"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPhotoIndex(index);
                          setShowDeletePhotoModal(true);
                        }}
                        className="p-1.5 bg-red-500/30 hover:bg-red-500/40 rounded-lg transition-colors backdrop-blur-sm"
                        title="Eliminar foto"
                      >
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Remove Cover indicator - no longer needed */}
                </div>
              ))
            ) : isLoadingPhotos ? (
              <div className="col-span-full text-center py-12">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-connect-muted">Cargando fotos...</p>
                </div>
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-connect-muted">Este álbum no tiene fotos.</p>
              </div>
            )}
          </div>
        ) : album.privacy === "amigos" ? (
          <div className="max-w-2xl mx-auto bg-connect-card rounded-2xl p-12 text-center border-2 border-connect-border">
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Álbum Solo para Amigos</h2>
            <p className="text-connect-muted mb-6">Necesitas ser amigo de {albumOwnerUsername || 'este usuario'} para ver este contenido.</p>
          </div>
        ) : null}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-orange-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Álbum Protegido</h2>
            <p className="text-connect-muted text-center mb-6">Ingresa la contraseña para ver el contenido.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="Ingresa la contraseña..."
                  className="bg-connect-bg-dark border-connect-border text-white"
                  autoFocus
                />
              </div>

              {passwordError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400">{passwordError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => router.back()} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handlePasswordSubmit} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Acceder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {selectedPhoto !== null && hasAccess && photos && photos[selectedPhoto] && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSelectedPhoto(null);
              setIsPhotoExpanded(false);
            }
            if (e.key === 'ArrowLeft') setSelectedPhoto(Math.max(0, selectedPhoto - 1));
            if (e.key === 'ArrowRight') setSelectedPhoto(Math.min(photos.length - 1, selectedPhoto + 1));
          }}
          tabIndex={0}
        >
          {/* Main image area */}
          <div className="flex-1 flex items-center justify-center p-4 relative">
            {/* Close button */}
            <button 
              onClick={() => {
                setSelectedPhoto(null);
                setIsPhotoExpanded(false);
              }} 
              className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-red-400 hover:bg-red-500/20 transition-all z-10"
              title="Cerrar (Esc)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Top bar with actions */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {/* Like button */}
              <button
                onClick={() => handleToggleLike(selectedPhoto)}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full transition-all hover:bg-black/80"
                title={userLikes.has(photos[selectedPhoto].id) ? 'Quitar like' : 'Me gusta'}
              >
                <svg 
                  className={`w-6 h-6 ${userLikes.has(photos[selectedPhoto].id) ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                  fill={userLikes.has(photos[selectedPhoto].id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              {/* Expand/Collapse button */}
              <button
                onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-primary hover:bg-black/80 transition-all"
                title={isPhotoExpanded ? 'Reducir tamaño' : 'Ver tamaño real'}
              >
                {isPhotoExpanded ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              
              {/* Download button */}
              <button
                onClick={() => handleDownloadPhoto(photos[selectedPhoto].url, selectedPhoto)}
                className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-primary hover:bg-black/80 transition-all"
                title="Descargar foto"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              
              {/* Like count */}
              {photoLikes[photos[selectedPhoto].id] > 0 && (
                <div className="px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{photoLikes[photos[selectedPhoto].id]}</span>
                </div>
              )}
            </div>
            
            {/* Previous button */}
            <button
              onClick={() => setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-primary hover:bg-black/80 transition-all"
              title="Anterior (←)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Image */}
            <div className={`flex flex-col items-center transition-all ${isPhotoExpanded ? 'max-w-none w-full overflow-auto max-h-screen' : 'max-w-4xl'}`}>
              <img 
                src={photos[selectedPhoto].url} 
                alt={photos[selectedPhoto].description} 
                className={`rounded-xl shadow-2xl transition-all ${
                  isPhotoExpanded 
                    ? 'w-auto h-auto max-w-none' 
                    : 'max-w-full max-h-[70vh] object-contain'
                }`}
              />
              />
              {photos[selectedPhoto].description && (
                <p className="mt-4 text-white text-center max-w-2xl">{photos[selectedPhoto].description}</p>
              )}
              <div className="mt-3 flex items-center gap-3 text-sm">
                <p className="text-connect-muted">
                  Foto {selectedPhoto + 1} de {photos.length}
                </p>
                {photos[selectedPhoto].uploadDate && (
                  <>
                    <span className="text-connect-muted">•</span>
                    <p className="text-connect-muted">{photos[selectedPhoto].uploadDate}</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Next button */}
            <button
              onClick={() => setSelectedPhoto((selectedPhoto + 1) % photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-sm rounded-full text-white hover:text-primary hover:bg-black/80 transition-all"
              title="Siguiente (→)"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Right sidebar - Comments & Stats */}
          <div className="w-96 bg-connect-card border-l border-connect-border flex flex-col max-h-screen overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-connect-border">
              <h3 className="font-bold text-lg mb-2">Detalles de la Foto</h3>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-connect-muted">
                <button
                  onClick={() => {
                    setSelectedPhotoStats(selectedPhoto);
                    setShowStatsModal(true);
                  }}
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{getTotalViews(photos[selectedPhoto].id)} vistas</span>
                </button>
                <span>•</span>
                <span>{getVisibleComments(photos[selectedPhoto].id).length} comentarios</span>
              </div>
              
              {/* Viewers avatars */}
              {getPhotoViewers(photos[selectedPhoto].id).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-connect-muted mb-2">Visto por:</p>
                  <div className="flex -space-x-2">
                    {getPhotoViewers(photos[selectedPhoto].id).slice(0, 5).map((viewer: any, index: number) => (
                      <img
                        key={viewer.userId}
                        src={viewer.avatar}
                        alt={viewer.name}
                        className="w-8 h-8 rounded-full border-2 border-connect-card"
                        title={`${viewer.name} (${viewer.count} ${viewer.count === 1 ? 'vez' : 'veces'})`}
                      />
                    ))}
                    {getPhotoViewers(photos[selectedPhoto].id).length > 5 && (
                      <button
                        onClick={() => {
                          setSelectedPhotoStats(selectedPhoto);
                          setShowStatsModal(true);
                        }}
                        className="w-8 h-8 rounded-full border-2 border-connect-card bg-connect-bg-dark flex items-center justify-center text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                      >
                        +{getPhotoViewers(photos[selectedPhoto].id).length - 5}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {getVisibleComments(photos[selectedPhoto].id).length > 0 ? (
                getVisibleComments(photos[selectedPhoto].id).map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.name}
                      className="w-10 h-10 rounded-full shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-connect-bg-dark rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-medium text-sm">{comment.name}</p>
                            <p className="text-xs text-connect-muted">
                              {new Date(comment.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {comment.userId === currentUser.id && (
                            <button
                              onClick={() => handleDeleteComment(photos[selectedPhoto].id, comment.id)}
                              className="p-1 text-connect-muted hover:text-red-400 transition-colors"
                              title="Eliminar comentario"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-sm">{comment.text}</p>
                        {comment.privacy === "private" && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Privado (solo tú lo ves)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-connect-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No hay comentarios aún</p>
                  <p className="text-xs mt-1">Sé el primero en comentar</p>
                </div>
              )}
            </div>
            
            {/* Comment input */}
            <div className="p-4 border-t border-connect-border">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  rows={2}
                  className="flex-1 px-3 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-white text-sm focus:border-primary/50 focus:outline-none focus:shadow-[0_0_10px_rgba(43,238,121,0.3)] transition-all resize-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(selectedPhoto);
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCommentPrivacy("public")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      commentPrivacy === "public"
                        ? 'bg-primary/20 text-primary border border-primary/50'
                        : 'bg-connect-bg-dark text-connect-muted border border-connect-border hover:border-primary/30'
                    }`}
                  >
                    🌍 Público
                  </button>
                  <button
                    onClick={() => setCommentPrivacy("private")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      commentPrivacy === "private"
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'bg-connect-bg-dark text-connect-muted border border-connect-border hover:border-amber-500/30'
                    }`}
                  >
                    🔒 Privado
                    <span className="text-[10px] px-1 py-0.5 bg-amber-500/30 rounded">PLUS+</span>
                  </button>
                </div>
                
                <button
                  onClick={() => handleAddComment(selectedPhoto)}
                  disabled={!newComment.trim()}
                  className="px-4 py-1.5 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_10px_rgba(43,238,121,0.3)] rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Album Modal */}
      {showEditAlbumModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Editar Álbum</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título del álbum</label>
                <Input
                  type="text"
                  value={editAlbumTitle}
                  onChange={(e) => setEditAlbumTitle(e.target.value)}
                  placeholder="Mi álbum..."
                  className="bg-connect-bg-dark border-connect-border text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={editAlbumDescription}
                  onChange={(e) => setEditAlbumDescription(e.target.value)}
                  placeholder="Describe tu álbum..."
                  rows={3}
                  className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(43,238,121,0.4),0_0_5px_rgba(43,238,121,0.3)] transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Privacidad</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'publico', label: 'Público', icon: '🌍', desc: 'Todos pueden ver' },
                    { value: 'amigos', label: 'Solo Amigos', icon: '👥', desc: 'Solo tus amigos' },
                    { value: 'protegido', label: 'Protegido', icon: '🔒', desc: 'Requiere contraseña' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setEditAlbumPrivacy(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        editAlbumPrivacy === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-connect-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="font-bold text-sm mb-1">{option.label}</div>
                      <div className="text-xs text-connect-muted">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {editAlbumPrivacy === 'protegido' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña del álbum</label>
                  <Input
                    type="text"
                    value={editAlbumPassword}
                    onChange={(e) => setEditAlbumPassword(e.target.value)}
                    placeholder="Contraseña..."
                    className="bg-connect-bg-dark border-connect-border text-white"
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowEditAlbumModal(false)} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleEditAlbum} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Album Modal */}
      {showDeleteAlbumModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-red-500/30 rounded-2xl w-full max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Eliminar Álbum</h2>
            <p className="text-connect-muted text-center mb-6">
              ¿Estás seguro de que deseas eliminar este álbum? Esta acción no se puede deshacer y se eliminarán todas las {photos.length} fotos.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteAlbumModal(false)} 
                className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteAlbum} 
                className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] rounded-lg transition-all"
              >
                Eliminar Álbum
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Photos Modal */}
      {showAddPhotosModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Agregar Fotos</h2>
            
            <div className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-connect-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="w-20 h-20 mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <p className="text-lg font-medium mb-2 text-white">
                    {isDragging ? '¡Suelta las fotos aquí!' : 'Arrastra fotos aquí o haz clic para buscar'}
                  </p>
                  <p className="text-sm text-connect-muted">
                    Soporta JPG, PNG, GIF, WebP (máximo 10 fotos a la vez)
                  </p>
                </label>
              </div>
              
              {/* Selected Files Preview */}
              {uploadPreviews.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      {uploadPreviews.length} foto{uploadPreviews.length !== 1 ? 's' : ''} seleccionada{uploadPreviews.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFiles([]);
                        setUploadPreviews([]);
                      }}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Limpiar todo
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                    {uploadPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                          <p className="text-xs text-white truncate">
                            {selectedFiles[index]?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description for all photos */}
              {uploadPreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción para todas las fotos (opcional)
                  </label>
                  <textarea
                    value={newPhotoDescription}
                    onChange={(e) => setNewPhotoDescription(e.target.value)}
                    placeholder="Añade una descripción que se aplicará a todas las fotos..."
                    rows={3}
                    className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(43,238,121,0.4),0_0_5px_rgba(43,238,121,0.3)] transition-all"
                  />
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowAddPhotosModal(false);
                    setSelectedFiles([]);
                    setUploadPreviews([]);
                    setNewPhotoDescription("");
                  }} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddPhoto} 
                  disabled={selectedFiles.length === 0}
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Photo Description Modal */}
      {showEditPhotoModal && editingPhotoIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Editar Descripción</h2>
            
            <div className="space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-connect-bg-dark mb-4">
                <img 
                  src={photos[editingPhotoIndex].url} 
                  alt="Foto" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={editPhotoDescription}
                  onChange={(e) => setEditPhotoDescription(e.target.value)}
                  placeholder="Describe esta foto..."
                  rows={3}
                  className="w-full px-4 py-2 bg-connect-bg-dark border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none focus:shadow-[0_0_15px_rgba(43,238,121,0.4),0_0_5px_rgba(43,238,121,0.3)] transition-all"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setShowEditPhotoModal(false);
                    setEditingPhotoIndex(null);
                    setEditPhotoDescription("");
                  }} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleEditPhotoDescription} 
                  className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Photo Modal */}
      {showDeletePhotoModal && editingPhotoIndex !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-red-500/30 rounded-2xl w-full max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Eliminar Foto</h2>
            <p className="text-connect-muted text-center mb-6">
              ¿Estás seguro de que deseas eliminar esta foto? Esta acción no se puede deshacer.
            </p>
            
            <div className="relative aspect-video rounded-xl overflow-hidden bg-connect-bg-dark mb-6">
              <img 
                src={photos[editingPhotoIndex].url} 
                alt="Foto a eliminar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeletePhotoModal(false);
                  setEditingPhotoIndex(null);
                }} 
                className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeletePhoto} 
                className="flex-1 px-4 py-2 bg-transparent border border-transparent text-white hover:text-red-400 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] rounded-lg transition-all"
              >
                Eliminar Foto
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Photo Statistics Modal */}
      {showStatsModal && selectedPhotoStats !== null && photos[selectedPhotoStats] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Estadísticas de la Foto</h2>
                <p className="text-connect-muted">
                  {getTotalViews(photos[selectedPhotoStats].id)} vistas totales por {getPhotoViewers(photos[selectedPhotoStats].id).length} {getPhotoViewers(photos[selectedPhotoStats].id).length === 1 ? 'persona' : 'personas'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedPhotoStats(null);
                }}
                className="p-2 text-connect-muted hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-connect-bg-dark mb-6">
              <img 
                src={photos[selectedPhotoStats].url} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Viewers list */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-connect-muted uppercase tracking-wider">Visto por:</h3>
              
              {getPhotoViewers(photos[selectedPhotoStats].id).length > 0 ? (
                getPhotoViewers(photos[selectedPhotoStats].id)
                  .sort((a: any, b: any) => b.count - a.count)
                  .map((viewer: any) => (
                    <div 
                      key={viewer.userId}
                      className="flex items-center justify-between p-3 bg-connect-bg-dark rounded-xl hover:bg-connect-bg-dark/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={viewer.avatar}
                          alt={viewer.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{viewer.name}</p>
                          <p className="text-sm text-connect-muted">@{viewer.username}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {viewer.count} {viewer.count === 1 ? 'vez' : 'veces'}
                        </p>
                        <p className="text-xs text-connect-muted">
                          Última vez: {new Date(viewer.lastView).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-connect-muted">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p className="text-sm">Nadie ha visto esta foto aún</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-connect-border">
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setSelectedPhotoStats(null);
                }}
                className="w-full px-4 py-2 bg-transparent border border-transparent text-white hover:text-[#2BEE79] hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
