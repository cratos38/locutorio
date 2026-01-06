"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function FotoAlbumesTutorialPage() {
  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-connect-border bg-connect-bg-dark/80 backdrop-blur-md px-6 py-4">
        <Link href="/tutorial" className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium text-connect-muted">Volver al tutorial</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
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
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">¿Cómo crear álbumes?</h3>
                <p className="text-connect-muted mb-4">
                  Organiza tus fotos en álbumes temáticos para mantener tus recuerdos ordenados y accesibles.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">Haz clic en "Crear Álbum"</div>
                      <div className="text-sm text-connect-muted">Desde tu perfil o la sección de álbumes, pulsa el botón verde "Crear Álbum"</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">Dale un nombre y descripción</div>
                      <div className="text-sm text-connect-muted">Ej: "Vacaciones 2025" con descripción "Viaje a la playa en verano"</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">Sube tus fotos</div>
                      <div className="text-sm text-connect-muted mb-2">Dos formas fáciles de agregar fotos:</div>
                      <div className="space-y-1 text-xs text-white ml-4">
                        <div>• <strong>Arrastra y suelta:</strong> Arrastra las fotos desde tu carpeta directamente al cuadro</div>
                        <div>• <strong>Selecciona archivos:</strong> Haz clic en "Seleccionar archivos" para buscar en tu dispositivo</div>
                        <div className="text-primary mt-2">✓ Puedes subir hasta 10 fotos a la vez</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center">
                      4
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">Elige la privacidad</div>
                      <div className="text-sm text-connect-muted">Selecciona quién puede ver tu álbum (explicado abajo)</div>
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

          {/* 3. Gestionar fotos del álbum */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">Gestionar fotos del álbum</h3>
                <p className="text-connect-muted mb-4">
                  Una vez creado el álbum, puedes gestionar cada foto individualmente.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Agregar más fotos */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <h4 className="font-bold text-white">Agregar Fotos</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-2">
                      Haz clic en "Agregar Fotos" dentro del álbum para añadir más imágenes en cualquier momento.
                    </p>
                    <div className="text-xs text-green-400">✓ Hasta 10 fotos por vez</div>
                  </div>

                  {/* Editar descripción */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      <h4 className="font-bold text-white">Editar Descripción</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-2">
                      Haz clic en el ícono de lápiz ✏️ para añadir o editar la descripción de cada foto.
                    </p>
                    <div className="text-xs text-blue-400">✓ Describe qué momento capturaste</div>
                  </div>

                  {/* Eliminar fotos */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                      <h4 className="font-bold text-white">Eliminar Fotos</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-2">
                      Haz clic en el ícono de basura 🗑️ para eliminar fotos que ya no quieres en el álbum.
                    </p>
                    <div className="text-xs text-red-400">⚠️ Acción permanente</div>
                  </div>

                  {/* Editar/eliminar álbum */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      <h4 className="font-bold text-white">Editar/Eliminar Álbum</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-2">
                      Botones en la cabecera: Editar (cambiar nombre, descripción, privacidad) o Eliminar álbum completo.
                    </p>
                    <div className="text-xs text-orange-400">⚠️ Solo visible para el dueño</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Carrusel en álbumes públicos */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500 text-connect-bg-dark flex items-center justify-center font-bold">
                4
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">🎠 Carrusel Automático</h3>
                <p className="text-connect-muted mb-4">
                  Los álbumes públicos muestran un carrusel automático con todas tus fotos en la tarjeta de presentación.
                </p>

                <div className="bg-connect-bg-dark p-6 rounded-xl border border-blue-500/20">
                  <h4 className="font-bold text-white mb-3">Controles del Carrusel:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm">▶️</div>
                      <div>
                        <div className="text-sm text-white font-medium">Play / Pause</div>
                        <div className="text-xs text-connect-muted">Pausa o reanuda la rotación automática de fotos</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm">⏱️</div>
                      <div>
                        <div className="text-sm text-white font-medium">Velocidad: 2s / 3s / 5s</div>
                        <div className="text-xs text-connect-muted">Elige cada cuánto tiempo cambia la foto</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm">📍</div>
                      <div>
                        <div className="text-sm text-white font-medium">Contador (1 / 5)</div>
                        <div className="text-xs text-connect-muted">Muestra qué foto estás viendo del total</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-400">
                      💡 <strong>Nota:</strong> Los controles aparecen solo al pasar el mouse sobre la tarjeta del álbum. Solo los álbumes públicos tienen carrusel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Visualizador de fotos (Lightbox) */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                5
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">🖼️ Visualizador de Fotos</h3>
                <p className="text-connect-muted mb-4">
                  Al hacer clic en cualquier foto, se abre el visualizador en pantalla completa con múltiples opciones.
                </p>

                <div className="space-y-4">
                  {/* Navegación */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <span>⬅️➡️</span> Navegación entre fotos
                    </h4>
                    <div className="text-sm text-connect-muted space-y-1">
                      <div>• <strong>Flechas en pantalla:</strong> Haz clic en las flechas laterales para cambiar de foto</div>
                      <div>• <strong>Teclado:</strong> Usa las teclas ← y → para navegar</div>
                      <div>• <strong>ESC:</strong> Cierra el visualizador</div>
                    </div>
                  </div>

                  {/* Expandir foto */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                      </svg>
                      Expandir a tamaño real
                    </h4>
                    <p className="text-sm text-connect-muted mb-2">
                      Haz clic en el botón ⛶ para alternar entre:
                    </p>
                    <div className="text-sm space-y-1 ml-4">
                      <div className="text-white">• <strong>Vista Normal:</strong> Foto ajustada a la pantalla</div>
                      <div className="text-white">• <strong>Vista Expandida:</strong> Foto a tamaño real completo (máxima calidad)</div>
                    </div>
                  </div>

                  {/* Descargar foto */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"/>
                      </svg>
                      Descargar Foto
                    </h4>
                    <p className="text-sm text-connect-muted">
                      Haz clic en el botón de descarga ⬇️ para guardar la foto en tu dispositivo.
                    </p>
                    <div className="text-xs text-green-400 mt-2">✓ Se guarda con nombre: foto_[album]_[numero].jpg</div>
                  </div>

                  {/* Me gusta */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <span>❤️</span> Me Gusta
                    </h4>
                    <div className="text-sm text-connect-muted space-y-2">
                      <div>• En la miniatura: Corazón en la esquina superior derecha</div>
                      <div>• En el visualizador: Botón de corazón con contador</div>
                      <div>• Haz clic para dar/quitar tu "me gusta"</div>
                      <div className="text-primary mt-2">✓ El contador muestra el total de likes que tiene la foto</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 6. Comentarios y privacidad */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500 text-connect-bg-dark flex items-center justify-center font-bold">
                6
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">💬 Comentarios en Fotos</h3>
                <p className="text-connect-muted mb-4">
                  Puedes comentar en las fotos de los álbumes. Hay dos tipos de comentarios:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Comentarios públicos */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">Comentarios Públicos</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Por defecto, tus comentarios son públicos. Todos los que pueden ver la foto pueden leer tu comentario.
                    </p>
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <p className="text-xs text-green-400">
                        ✓ Visibles para todos los usuarios con acceso al álbum
                      </p>
                    </div>
                  </div>

                  {/* Comentarios privados */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-orange-500/30 ring-1 ring-orange-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">Privados (PLUS+) 🔒</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Haz clic en "Privado (PLUS+)" antes de enviar. Solo tú verás este comentario. Ideal para notas personales.
                    </p>
                    <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                      <p className="text-xs text-orange-400">
                        🔒 Solo visible para ti • Aparece con indicador "Privado (solo tú lo ves)"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                  <h4 className="font-bold text-white mb-3">Cómo comentar:</h4>
                  <div className="space-y-2 text-sm text-connect-muted">
                    <div>1. Abre la foto en el visualizador</div>
                    <div>2. Escribe tu comentario en el panel lateral derecho</div>
                    <div>3. Elige "Público" o "Privado (PLUS+)"</div>
                    <div>4. Presiona Enter o haz clic en "Enviar"</div>
                    <div className="text-xs text-primary pt-2">💡 Usa Shift + Enter para escribir varias líneas</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 7. Estadísticas de visitas */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                7
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">📊 Estadísticas de Visitas</h3>
                <p className="text-connect-muted mb-4">
                  Cada vez que alguien abre una foto, se registra la visita. Puedes ver quién ha visto tus fotos.
                </p>

                <div className="space-y-4">
                  {/* Panel de info rápida */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3">Información Visible:</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-connect-bg-dark/50 p-4 rounded-lg border border-connect-border">
                        <div className="text-primary font-bold mb-1">👁️ Vistas Totales</div>
                        <div className="text-sm text-connect-muted">Cuántas veces se abrió la foto</div>
                      </div>
                      <div className="bg-connect-bg-dark/50 p-4 rounded-lg border border-connect-border">
                        <div className="text-primary font-bold mb-1">👥 Visitantes</div>
                        <div className="text-sm text-connect-muted">Avatares de los primeros 5 visitantes</div>
                      </div>
                      <div className="bg-connect-bg-dark/50 p-4 rounded-lg border border-connect-border">
                        <div className="text-primary font-bold mb-1">💬 Comentarios</div>
                        <div className="text-sm text-connect-muted">Total de comentarios públicos</div>
                      </div>
                    </div>
                  </div>

                  {/* Modal de estadísticas */}
                  <div className="bg-connect-bg-dark p-5 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-3">Ver Estadísticas Completas:</h4>
                    <p className="text-sm text-connect-muted mb-3">
                      Haz clic en los avatares de visitantes para abrir el modal de estadísticas detalladas:
                    </p>
                    <div className="space-y-2 text-sm ml-4">
                      <div className="text-white">• <strong>Lista completa:</strong> Todos los usuarios que vieron la foto</div>
                      <div className="text-white">• <strong>Ordenados por vistas:</strong> Los que más veces abrieron la foto aparecen primero</div>
                      <div className="text-white">• <strong>Contador por usuario:</strong> "N veces" + fecha de última visita</div>
                      <div className="text-white">• <strong>Avatar y nombre:</strong> Información de cada visitante</div>
                    </div>
                  </div>

                  {/* Nota de privacidad */}
                  <div className="bg-primary/10 p-5 rounded-xl border border-primary/30">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <div>
                        <div className="font-bold text-white mb-1">📌 Importante:</div>
                        <p className="text-sm text-connect-muted">
                          Las estadísticas de visitas solo son visibles para el dueño del álbum. Los visitantes no saben quién más ha visto las fotos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-connect-border">
          <Link href="/tutorial/chat">
            <Button variant="ghost" className="text-connect-muted hover:text-white">
              ← Anterior: Chat en Vivo
            </Button>
          </Link>
          <Link href="/tutorial/busqueda">
            <Button className="bg-primary text-connect-bg-dark hover:brightness-110">
              Siguiente: Búsqueda →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
