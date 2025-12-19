"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function FotoAlbumesTutorialPage() {
  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-connect-border bg-connect-bg-dark/80 backdrop-blur-md px-6 py-4">
        <Link href="/connect/tutorial" className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium text-connect-muted">Volver al tutorial</span>
        </Link>
        <Link href="/connect" className="flex items-center gap-2">
          <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">LoCuToRiO</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/20 text-purple-400 mb-6">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Foto Álbumes</h1>
          <p className="text-connect-muted text-lg max-w-2xl mx-auto">
            Comparte tus recuerdos con control total sobre quién puede verlos.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Crear álbumes */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">¿Cómo crear álbumes?</h3>
                <p className="text-connect-muted mb-4">
                  Organiza tus fotos en álbumes temáticos para mantener tus recuerdos ordenados y accesibles.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Haz clic en "Crear Álbum"</div>
                      <div className="text-sm text-connect-muted">Desde tu perfil, accede a la sección de fotos</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Dale un nombre descriptivo</div>
                      <div className="text-sm text-connect-muted">Ej: "Vacaciones 2025", "Mis Mascotas", "Conciertos"</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-white mb-1">Sube tus fotos</div>
                      <div className="text-sm text-connect-muted">Arrastra y suelta o selecciona desde tu dispositivo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Niveles de privacidad */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500 text-connect-bg-dark flex items-center justify-center font-bold">
                2
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">Niveles de Privacidad</h3>
                <p className="text-connect-muted mb-6">
                  Tú decides quién puede ver cada uno de tus álbumes. Elige el nivel que mejor se adapte a cada situación:
                </p>

                <div className="grid gap-4">
                  {/* Público */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-connect-border">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">🌍 Público</h4>
                        <p className="text-sm text-connect-muted mb-3">
                          Cualquier usuario de LoCuToRiO puede ver estas fotos. Perfecto para contenido que quieres compartir con todos.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span>Visible para todos los usuarios</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solo Amigos */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-primary/30 ring-1 ring-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">👥 Solo Amigos</h4>
                        <p className="text-sm text-connect-muted mb-3">
                          Solo las personas en tu lista de amigos pueden ver estas fotos. Ideal para momentos personales que quieres compartir con tu círculo cercano.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-primary">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span>Solo visible para tus amigos confirmados</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Con Contraseña */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-orange-500/30">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">🔒 Con Contraseña (Privado)</h4>
                        <p className="text-sm text-connect-muted mb-3">
                          Solo quien tenga la contraseña puede acceder. Máxima privacidad para tus momentos más íntimos. Tú decides con quién compartir el acceso.
                        </p>
                        <div className="bg-connect-bg-dark/50 p-3 rounded-lg border border-orange-500/20 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            </svg>
                            <span className="text-xs font-bold text-orange-400">Consejo de Seguridad:</span>
                          </div>
                          <p className="text-xs text-connect-muted">
                            Usa una contraseña segura y cámbiala regularmente. Comparte el acceso solo con personas de total confianza.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Cambiar privacidad */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Cambiar la privacidad en cualquier momento</h3>
                <p className="text-connect-muted mb-4">
                  Puedes modificar el nivel de privacidad de tus álbumes cuando quieras. Tus recuerdos, tus reglas.
                </p>
                <div className="bg-connect-bg-dark p-4 rounded-lg border border-connect-border">
                  <div className="flex items-center gap-3 text-sm">
                    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span className="text-white">
                      <strong>Importante:</strong> Los cambios son instantáneos. Si cambias de público a privado, las personas que ya vieron las fotos no perderán el acceso a su historial.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-connect-border">
          <Link href="/connect/tutorial/chat">
            <Button variant="ghost" className="text-connect-muted hover:text-white">
              ← Anterior: Chat en Vivo
            </Button>
          </Link>
          <Link href="/connect/tutorial/busqueda">
            <Button className="bg-primary text-connect-bg-dark hover:brightness-110">
              Siguiente: Búsqueda →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
