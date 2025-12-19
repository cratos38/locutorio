"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";

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
  const currentUser = { id: 1, username: "ana-m", name: "Ana M." };

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

  // Load albums from localStorage - client side only
  const [albums, setAlbums] = useState<Album[]>([]);

  // Load albums on mount
  useEffect(() => {
    const saved = localStorage.getItem("albums");
    if (saved) {
      const parsedAlbums = JSON.parse(saved);
      // Actualizar álbumes de Elena a Ana M.
      const updatedAlbums = parsedAlbums.map((album: Album) => {
        if (album.owner === "elena") {
          return { ...album, owner: "ana-m" };
        }
        return album;
      });
      setAlbums(updatedAlbums);
      // Guardar los cambios
      if (JSON.stringify(parsedAlbums) !== JSON.stringify(updatedAlbums)) {
        localStorage.setItem("albums", JSON.stringify(updatedAlbums));
      }
    }
  }, []);

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

  const handleCreateAlbum = () => {
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

    const albumId = Date.now();
    const photosList = uploadedPhotos.map((photo, index) => ({
      id: index + 1,
      url: photo.preview,
      description: photo.description || `Foto ${index + 1}`,
    }));

    const newAlbum: Album = {
      id: albumId,
      title: albumName,
      photos: uploadedPhotos.length,
      privacy: privacyType,
      coverImage: uploadedPhotos[0]?.preview || null,
      lastUpdate: "Ahora mismo",
      password: privacyType === "protegido" ? albumPassword : undefined,
      description: albumDescription,
      owner: currentUser.username,
    };

    const updatedAlbums = [newAlbum, ...albums];
    setAlbums(updatedAlbums);
    localStorage.setItem("albums", JSON.stringify(updatedAlbums));
    localStorage.setItem(`album_${albumId}_photos`, JSON.stringify(photosList));

    alert(`¡Álbum "${albumName}" creado exitosamente!`);

    // Reset
    setAlbumName("");
    setAlbumDescription("");
    setUploadedPhotos([]);
    setPrivacyType("publico");
    setAlbumPassword("");
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      <InternalHeader />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-3">Álbumes de Fotos</h1>
            <p className="text-connect-muted text-lg max-w-2xl">
              Gestiona tus recuerdos con total control. Crea álbumes{" "}
              <span className="text-primary font-semibold">públicos</span> para todos, compártelos{" "}
              <span className="text-blue-400 font-semibold">solo con amigos</span> o protégelos con{" "}
              <span className="text-orange-400 font-semibold">contraseña</span> para máxima privacidad.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold shadow-[0_0_20px_rgba(43,238,121,0.3)] flex items-center gap-2 px-6 py-6 text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Álbum
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
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
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-10 hide-scrollbar">
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

        {/* Albums Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Mis Álbumes ({filteredAlbums.length})</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Album Cards */}
            {filteredAlbums.map((album) => {
              const privacy = privacyLabels[album.privacy];
              return (
                <Link
                  key={album.id}
                  href={`/albumes/${album.id}`}
                  prefetch={false}
                  className="group relative overflow-hidden rounded-2xl bg-connect-card p-3 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-connect-bg-dark">
                    {album.privacy === "protegido" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-orange-500/20 to-red-500/20">
                        <svg className="w-20 h-20 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-orange-300 font-bold text-sm">ÁLBUM PROTEGIDO</p>
                      </div>
                    ) : album.coverImage ? (
                      <>
                        <img
                          src={album.coverImage}
                          alt={album.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Privacy Badge */}
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                      <span className={privacy.color}>{privacy.icon}</span> {privacy.label}
                    </div>

                    {/* Lock Overlay for Protected */}
                    {album.privacy === "protegido" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">{album.title}</h3>
                    <p className="text-sm text-connect-muted">
                      {album.photos} fotos • {album.lastUpdate}
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
            <div className="sticky bottom-0 bg-connect-card border-t border-connect-border p-6 flex gap-3 justify-end">
              <Button onClick={() => setShowCreateModal(false)} variant="outline" className="bg-transparent border-connect-border text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAlbum} 
                disabled={!albumName.trim() || uploadedPhotos.length === 0 || (privacyType === "protegido" && (!albumPassword.trim() || albumPassword.length < 6))}
                className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Álbum
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
