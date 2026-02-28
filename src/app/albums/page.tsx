"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from '@supabase/supabase-js';
// ✅ ML Validator v3.5: No necesitamos imports NSFW viejos

// Crear cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función de redimensionamiento de imágenes
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
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
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

// Album carousel component
function AlbumCarousel({ albumId, privacy }: { albumId: number; privacy: string }) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalSpeed, setIntervalSpeed] = useState(3000); // 3 seconds default

  useEffect(() => {
    // Load photos for this album from Supabase
    async function loadPhotos() {
      const { data, error } = await supabase
        .from('album_photos')
        .select('*')
        .eq('album_id', albumId)
        .order('orden', { ascending: true });
      
      if (error) {
        console.error('Error cargando fotos del carrusel:', error);
      } else {
        setPhotos(data || []);
      }
    }
    loadPhotos();
  }, [albumId]);

  useEffect(() => {
    // Auto-rotate photos for public albums only
    if (privacy === "publico" && photos.length > 1 && isPlaying) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
      }, intervalSpeed);
      return () => clearInterval(interval);
    }
  }, [photos.length, privacy, isPlaying, intervalSpeed]);

  if (privacy === "protegido") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-500/20 to-red-500/20">
        <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-orange-300 font-bold text-xs">PROTEGIDO</p>
      </div>
    );
  }

  if (privacy === "amigos") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-blue-300 font-bold text-xs">AMIGOS</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg className="w-16 h-16 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group/carousel">
      {photos.map((photo, index) => (
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.description || `Photo ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
      
      {/* Controls - visible on hover */}
      {photos.length > 1 && (
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10">
          {/* Play/Pause */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition-colors"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {/* Speed control */}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIntervalSpeed(2000);
              }}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                intervalSpeed === 2000 
                  ? 'bg-primary/80 text-connect-bg-dark' 
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Rápido (2s)"
            >
              2s
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIntervalSpeed(3000);
              }}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                intervalSpeed === 3000 
                  ? 'bg-primary/80 text-connect-bg-dark' 
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Normal (3s)"
            >
              3s
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIntervalSpeed(5000);
              }}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
                intervalSpeed === 5000 
                  ? 'bg-primary/80 text-connect-bg-dark' 
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title="Lento (5s)"
            >
              5s
            </button>
          </div>
        </div>
      )}
      
      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium z-10">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

type Album = {
  id: number;
  title: string;
  photos: number;
  privacy: "publico" | "amigos" | "protegido";
  coverImage: string | null;
  lastUpdate: string;
  password?: string;
  description?: string;
  owner: string;
};

export default function AlbumesPage() {
  const { user } = useAuth();
  const currentUser = { 
    id: user?.id || 0, 
    username: user?.username || 'usuario', 
    name: user?.username || 'Usuario' 
  };

  const [selectedFilter, setSelectedFilter] = useState("todo");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [albumName, setAlbumName] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Array<{ id: number; file: File; preview: string; description: string }>
  >([]);
  const [privacyType, setPrivacyType] = useState<"publico" | "amigos" | "protegido">("publico");
  const [albumPassword, setAlbumPassword] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordFieldRef = useRef<HTMLDivElement>(null);

  // Load albums from Supabase
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load albums on mount
  useEffect(() => {
    async function loadAlbums() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error cargando álbumes:', error);
        } else {
          // Transform to match Album type
          const transformedAlbums: Album[] = (data || []).map(album => ({
            id: album.id,
            title: album.title,
            photos: album.photo_count || 0,
            privacy: album.privacy as "publico" | "amigos" | "protegido",
            coverImage: album.cover_photo_url,
            lastUpdate: new Date(album.updated_at).toLocaleDateString(),
            password: album.password,
            description: album.description,
            owner: currentUser.username, // TODO: cargar desde users table
          }));
          setAlbums(transformedAlbums);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (user?.id) {
      loadAlbums();
    }
  }, [user?.id]);

  // Auto-scroll to password field when "Protegido" is selected
  useEffect(() => {
    if (privacyType === "protegido" && passwordFieldRef.current) {
      setTimeout(() => {
        passwordFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [privacyType]);

  const privacyLabels = {
    publico: { label: "Público", icon: "🌍", color: "text-green-400" },
    amigos: { label: "Solo Amigos", icon: "👥", color: "text-blue-400" },
    protegido: { label: "Protegido", icon: "🔒", color: "text-amber-400" },
  };

  const filteredAlbums = albums
    .filter((album) => {
      if (selectedFilter === "todo") return true;
      if (selectedFilter === "publicos") return album.privacy === "publico";
      if (selectedFilter === "amigos") return album.privacy === "amigos";
      if (selectedFilter === "protegidos") return album.privacy === "protegido";
      return true;
    })
    .filter((album) => album.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const optimizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 1200;
          const maxHeight = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const newPhotos = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const preview = await optimizeImage(file);
        newPhotos.push({
          id: Date.now() + i,
          file,
          preview,
          description: "",
        });
      }
    }
    setUploadedPhotos([...uploadedPhotos, ...newPhotos]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (id: number) => {
    setUploadedPhotos(uploadedPhotos.filter((p) => p.id !== id));
  };

  const updatePhotoDescription = (id: number, description: string) => {
    setUploadedPhotos(uploadedPhotos.map((p) => (p.id === id ? { ...p, description } : p)));
  };

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      alert("Por favor ingresa un nombre para el álbum");
      return;
    }
    if (uploadedPhotos.length === 0) {
      alert("Por favor añade al menos una foto");
      return;
    }
    if (privacyType === "protegido" && !albumPassword.trim()) {
      alert("Por favor ingresa una contraseña para el álbum protegido");
      return;
    }
    
    if (!user?.id) {
      alert("Debes iniciar sesión para crear álbumes");
      return;
    }
    
    // Evitar doble click
    if (isCreating) {
      console.log('⚠️ Ya se está creando un álbum, por favor espera...');
      return;
    }

    try {
      setIsCreating(true);
      console.log(`📤 Creando álbum "${albumName}"...`);
      
      // ✅ ML VALIDATOR v3.5: Sin análisis previo
      // Las fotos se suben primero, validación en segundo plano
      console.log('✅ Subida inmediata activa (ML Validator v3.5)');
      
      // 1. Crear el álbum en la BD
      const { data: newAlbum, error: albumError } = await supabase
        .from('albums')
        .insert({
          user_id: user.id,
          title: albumName,
          description: albumDescription,
          privacy: privacyType,
          password: privacyType === "protegido" ? albumPassword : null,
          photo_count: 0,
        })
        .select()
        .single();
      
      if (albumError) {
        console.error('Error creando álbum:', albumError);
        alert('Error al crear el álbum');
        return;
      }
      
      console.log('✅ Álbum creado:', newAlbum);
      
      // 2. Subir las fotos en paralelo (mucho más rápido)
      console.log(`📤 Subiendo ${uploadedPhotos.length} foto(s) en paralelo...`);
      
      const uploadPromises = uploadedPhotos.map(async (photo, i) => {
        try {
          // Redimensionar foto antes de subir
          const resizedFile = await resizeImage(photo.file, 1024, 0.95);
          
          // Generar nombre único
          const fileExt = photo.file.name.split('.').pop();
          const fileName = `${user.id}/${newAlbum.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          // 🆕 v3.5: Subir a bucket photos-pending (nuevo sistema)
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('photos-pending')
            .upload(fileName, resizedFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) throw uploadError;
          
          // Obtener URL pública del storage
          const { data: { publicUrl } } = supabase.storage
            .from('photos-pending')
            .getPublicUrl(fileName);
          
          // 🆕 v3.5: Insertar en tabla 'photos' (nuevo schema)
          const { data: photoData, error: photoError } = await supabase
            .from('photos')
            .insert({
              user_id: user.id,
              photo_type: 'album',
              album_type: privacyType === 'publico' ? 'public' : 'private',
              storage_path: fileName,
              storage_url: publicUrl,
              status: 'pending',
              original_filename: photo.file.name,
              file_size: photo.file.size,
              mime_type: photo.file.type,
              is_visible: false, // Solo visible para el usuario hasta aprobar
              display_order: i
            })
            .select()
            .single();
          
          if (photoError) throw photoError;
          
          // 🆕 v3.5: Llamar al webhook ML Validator en segundo plano
          try {
            fetch('http://192.168.1.159:5001/webhook/photo-uploaded', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photo_id: photoData.id,
                user_id: user.id,
                photo_type: 'album',
                album_type: privacyType === 'publico' ? 'public' : 'private',
                storage_path: fileName
              })
            }).catch(err => console.error('⚠️ Error llamando webhook:', err));
          } catch (err) {
            console.error('⚠️ Error en fetch webhook:', err);
          }
          
          console.log(`📤 Foto ${i + 1}/${uploadedPhotos.length} subida (pendiente validación)`);
          return publicUrl;
        } catch (err) {
          console.error(`❌ Error subiendo foto ${i + 1}:`, err);
          return null;
        }
      });
      
      const uploadedPhotoUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
      
      // 3. Actualizar contador de fotos y portada del álbum
      await supabase
        .from('albums')
        .update({
          photo_count: uploadedPhotoUrls.length,
          cover_photo_url: uploadedPhotoUrls[0] || null,
        })
        .eq('id', newAlbum.id);
      
      // 4. Mostrar mensaje de éxito
      const totalCount = uploadedPhotoUrls.length;
      
      let message = `✅ ¡Álbum "${albumName}" creado!\n\n`;
      message += `📊 Total subidas: ${totalCount} fotos\n`;
      message += `⏳ Estado: Pendientes de validación\n\n`;
      message += `🔬 ML VALIDATOR v3.5 (en segundo plano):\n`;
      message += `- Las fotos están siendo validadas automáticamente\n`;
      message += `- Recibirás notificaciones cuando sean aprobadas/rechazadas\n`;
      message += `- Mientras tanto, solo tú puedes verlas\n`;
      
      alert(message);
      
      // 5. Recargar lista de álbumes
      const { data: allAlbums } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allAlbums) {
        const transformedAlbums: Album[] = allAlbums.map(album => ({
          id: album.id,
          title: album.title,
          photos: album.photo_count || 0,
          privacy: album.privacy as "publico" | "amigos" | "protegido",
          coverImage: album.cover_photo_url,
          lastUpdate: new Date(album.updated_at).toLocaleDateString(),
          password: album.password,
          description: album.description,
          owner: currentUser.username,
        }));
        setAlbums(transformedAlbums);
      }
      
      // Reset
      setAlbumName("");
      setAlbumDescription("");
      setUploadedPhotos([]);
      setPrivacyType("publico");
      setAlbumPassword("");
      setShowCreateModal(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear el álbum');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Álbumes de Fotos</h1>
          <p className="text-connect-muted text-sm max-w-3xl">
            Gestiona tus recuerdos: <span className="text-primary font-semibold">públicos</span>, <span className="text-blue-400 font-semibold">solo amigos</span> o <span className="text-orange-400 font-semibold">con contraseña</span>
          </p>
        </div>

        {/* Search Bar + Filters + Create Button */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar álbumes..."
              className="pl-12 bg-connect-card border-connect-border text-white placeholder-connect-muted rounded-xl h-12"
            />
          </div>

          {/* Filter Tabs + Create Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar flex-1">
          <button
            onClick={() => setSelectedFilter("todo")}
            className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedFilter === "todo" ? "bg-primary text-connect-bg-dark" : "bg-connect-card text-connect-muted hover:bg-white/5"
            }`}
          >
            <span className="mr-2">📂</span>
            Todo
          </button>
          <button
            onClick={() => setSelectedFilter("publicos")}
            className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedFilter === "publicos" ? "bg-primary text-connect-bg-dark" : "bg-connect-card text-connect-muted hover:bg-white/5"
            }`}
          >
            <span className="mr-2">🌍</span>
            Públicos
          </button>
          <button
            onClick={() => setSelectedFilter("amigos")}
            className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedFilter === "amigos" ? "bg-primary text-connect-bg-dark" : "bg-connect-card text-connect-muted hover:bg-white/5"
            }`}
          >
            <span className="mr-2">👥</span>
            Solo Amigos
          </button>
          <button
            onClick={() => setSelectedFilter("protegidos")}
            className={`px-6 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              selectedFilter === "protegidos" ? "bg-primary text-connect-bg-dark" : "bg-connect-card text-connect-muted hover:bg-white/5"
            }`}
          >
            <span className="mr-2">🔒</span>
            Protegidos
          </button>
            </div>

            {/* Create Album Button */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold shadow-[0_0_20px_rgba(43,238,121,0.3)] flex items-center gap-2 px-6 py-3 text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Álbum
            </Button>
          </div>
        </div>

        {/* Albums Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Mis Álbumes ({filteredAlbums.length})</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {/* Album Cards */}
            {filteredAlbums.map((album) => {
              const privacy = privacyLabels[album.privacy];
              return (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  prefetch={false}
                  className="group relative overflow-hidden rounded-xl bg-connect-card p-2 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-connect-bg-dark">
                    <AlbumCarousel albumId={album.id} privacy={album.privacy} />

                    {/* Privacy Badge - Only for restricted albums */}
                    {album.privacy !== 'publico' && (
                      <div className={`absolute top-2 right-2 rounded-lg px-3 py-1.5 text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg z-10 ${
                        album.privacy === 'amigos' ? 'bg-blue-500/90 text-white border border-blue-400/50' :
                        'bg-orange-500/90 text-white border border-orange-400/50'
                      }`}>
                        <span className="text-base">{privacy.icon}</span>
                        <span className="hidden sm:inline">{privacy.label}</span>
                      </div>
                    )}

                    {/* Lock Overlay for Protected */}
                    {album.privacy === "protegido" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{album.title}</h3>
                    <p className="text-xs text-connect-muted">
                      {album.photos} fotos
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredAlbums.length === 0 && albums.length > 0 && (
            <div className="text-center py-12">
              <p className="text-connect-muted">No se encontraron álbumes con este filtro.</p>
            </div>
          )}
        </section>
      </div>

      {/* Create Album Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border border-connect-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-connect-card border-b border-connect-border p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold">Crear Nuevo Álbum</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-connect-muted hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Nombre del Álbum <span className="text-primary">*</span>
                </label>
                <Input
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  placeholder="Ej: Vacaciones 2024"
                  className="bg-connect-bg-dark border-connect-border text-white"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Descripción (opcional)</label>
                <textarea
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="Añade una descripción..."
                  className="w-full bg-connect-bg-dark border border-connect-border rounded-xl px-4 py-3 text-white placeholder-connect-muted resize-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Fotos <span className="text-primary">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging ? "border-primary bg-primary/10" : "border-connect-border hover:border-primary/50 hover:bg-white/5"
                  }`}
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
                  <svg className="w-16 h-16 mx-auto mb-4 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-white font-bold mb-1">Arrastra fotos aquí o haz clic para seleccionar</p>
                  <p className="text-sm text-connect-muted">PNG, JPG, WEBP - Optimización automática</p>
                  {privacyType === 'publico' && (
                    <p className="text-xs text-amber-400 mt-2 flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Las fotos públicas serán validadas automáticamente (ML Validator v3.5)
                    </p>
                  )}
                </div>
              </div>

              {uploadedPhotos.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-3">Fotos añadidas ({uploadedPhotos.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img src={photo.preview} alt="Preview" className="w-full aspect-square object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <Input
                          value={photo.description}
                          onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
                          placeholder="Descripción (opcional)"
                          className="mt-2 bg-connect-bg-dark border-connect-border text-white text-sm"
                          maxLength={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-3">
                  Privacidad <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setPrivacyType("publico")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      privacyType === "publico" ? "border-green-500 bg-green-500/10" : "border-connect-border hover:border-green-500/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">🌍</div>
                    <p className="font-bold text-white">Público</p>
                    <p className="text-xs text-connect-muted mt-1">Visible para todos</p>
                  </button>

                  <button
                    onClick={() => setPrivacyType("amigos")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      privacyType === "amigos" ? "border-blue-500 bg-blue-500/10" : "border-connect-border hover:border-blue-500/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">👥</div>
                    <p className="font-bold text-white">Solo Amigos</p>
                    <p className="text-xs text-connect-muted mt-1">Solo tus amigos pueden ver</p>
                  </button>

                  <button
                    onClick={() => setPrivacyType("protegido")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      privacyType === "protegido" ? "border-orange-500 bg-orange-500/10" : "border-connect-border hover:border-orange-500/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">🔒</div>
                    <p className="font-bold text-white">Protegido</p>
                    <p className="text-xs text-connect-muted mt-1">Requiere contraseña</p>
                  </button>
                </div>
              </div>

              {privacyType === "protegido" && (
                <div ref={passwordFieldRef}>
                  <label className="block text-sm font-bold mb-2">
                    Contraseña <span className="text-primary">*</span>
                  </label>
                  <Input
                    type="password"
                    value={albumPassword}
                    onChange={(e) => setAlbumPassword(e.target.value)}
                    placeholder="Ingresa una contraseña segura (mínimo 6 caracteres)"
                    className="bg-connect-bg-dark border-connect-border text-white"
                    minLength={6}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-connect-card border-t border-connect-border p-6">
              {/* Validation Messages */}
              <div className="mb-4 space-y-2">
                {!albumName.trim() && (
                  <p className="text-xs text-orange-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Debes ingresar un nombre para el álbum
                  </p>
                )}
                {uploadedPhotos.length === 0 && (
                  <p className="text-xs text-orange-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Debes añadir al menos una foto
                  </p>
                )}
                {privacyType === "protegido" && !albumPassword.trim() && (
                  <p className="text-xs text-orange-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Debes ingresar una contraseña para el álbum protegido
                  </p>
                )}
                {privacyType === "protegido" && albumPassword.trim() && albumPassword.length < 6 && (
                  <p className="text-xs text-orange-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    La contraseña debe tener al menos 6 caracteres (actual: {albumPassword.length})
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="bg-transparent border-connect-border text-white hover:bg-white/5">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateAlbum} 
                  disabled={!albumName.trim() || uploadedPhotos.length === 0 || (privacyType === "protegido" && (!albumPassword.trim() || albumPassword.length < 6)) || isCreating}
                  className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Subiendo fotos...
                    </span>
                  ) : (
                    "Crear Álbum"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
