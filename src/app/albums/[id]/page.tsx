"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import InternalHeader from "@/components/InternalHeader";

export default function AlbumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const albumId = Number(params.id);

  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const currentUser = { id: 1, username: "ana-m", name: "Ana M.", friends: [2, 4, 5] };

  // Load data only on client
  useEffect(() => {
    setIsMounted(true);
    const albumsData = localStorage.getItem("albums");
    if (albumsData) {
      const albums = JSON.parse(albumsData);
      const foundAlbum = albums.find((a: any) => a.id === albumId);
      setAlbum(foundAlbum || null);
    }
    const photosData = localStorage.getItem(`album_${albumId}_photos`);
    if (photosData) {
      setPhotos(JSON.parse(photosData));
    }
  }, [albumId]);

  // Check access when album loads
  useEffect(() => {
    if (!album) return;

    if (album.privacy === "publico") {
      setHasAccess(true);
      setShowPasswordModal(false);
    } else if (album.owner === currentUser.username) {
      setHasAccess(true);
      setShowPasswordModal(false);
    } else if (album.privacy === "amigos") {
      const ownerId = album.owner === "ana-m" ? 1 : 2;
      setHasAccess(currentUser.friends.includes(ownerId));
      setShowPasswordModal(false);
    } else if (album.privacy === "protegido") {
      setShowPasswordModal(true);
      setHasAccess(false);
    }
  }, [album]);

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

  const privacyLabels = {
    publico: { label: "Público", icon: "🌍", color: "text-green-400" },
    amigos: { label: "Solo Amigos", icon: "👥", color: "text-blue-400" },
    protegido: { label: "Protegido", icon: "🔒", color: "text-amber-400" },
  };

  // Don't render until mounted on client to avoid hydration errors
  if (!isMounted) {
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
            <Button onClick={() => router.push("/albums")} className="bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
              Volver a Álbumes
            </Button>
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
            <div className="rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white backdrop-blur-md flex items-center gap-2 border border-white/10">
              <span className={privacy.color}>{privacy.icon}</span>
              {privacy.label}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-connect-muted">
            <span>{photos.length} fotos</span>
            <span>•</span>
            <span>{album.lastUpdate}</span>
          </div>
        </div>

        {/* Content based on access */}
        {hasAccess ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos && photos.length > 0 ? (
              photos.map((photo: any, index: number) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(index)}
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-connect-card"
                >
                  <img src={photo.url} alt={photo.description} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </button>
              ))
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
            <p className="text-connect-muted mb-6">Necesitas ser amigo de {album.owner} para ver este contenido.</p>
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
                <Button onClick={() => router.back()} variant="outline" className="flex-1 bg-transparent border-connect-border text-white hover:bg-white/5">
                  Cancelar
                </Button>
                <Button onClick={handlePasswordSubmit} className="flex-1 bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold">
                  Acceder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer */}
      {selectedPhoto !== null && hasAccess && photos && photos[selectedPhoto] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 text-white hover:text-primary">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => setSelectedPhoto(Math.max(0, selectedPhoto - 1))}
            disabled={selectedPhoto === 0}
            className="absolute left-4 text-white hover:text-primary disabled:opacity-30"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img src={photos[selectedPhoto].url} alt={photos[selectedPhoto].description} className="max-w-full max-h-[80vh] object-contain rounded-xl" />
            {photos[selectedPhoto].description && <p className="mt-4 text-white text-center">{photos[selectedPhoto].description}</p>}
            <p className="mt-2 text-connect-muted text-sm">
              {selectedPhoto + 1} / {photos.length}
            </p>
          </div>
          <button
            onClick={() => setSelectedPhoto(Math.min(photos.length - 1, selectedPhoto + 1))}
            disabled={selectedPhoto === photos.length - 1}
            className="absolute right-4 text-white hover:text-primary disabled:opacity-30"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
