"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ChatTutorialPage() {
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 text-blue-400 mb-6">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Chat en Vivo</h1>
          <p className="text-connect-muted text-lg max-w-2xl mx-auto">
            Aprende a dominar las salas de chat y personaliza tu experiencia de conversación.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Cómo funcionan las salas */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">¿Cómo funcionan las salas?</h3>
                <p className="text-connect-muted mb-4">
                  Las salas de chat son espacios públicos donde puedes unirte a conversaciones en tiempo real con múltiples personas que comparten tus intereses.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-white"><strong>Explora salas:</strong> Navega por categorías como Amistad, Romance, Hobbies, Regiones, etc.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-white"><strong>Únete con un clic:</strong> Entra a cualquier sala para empezar a chatear al instante.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">→</span>
                    <span className="text-white"><strong>Ve quién está online:</strong> Mira cuántas personas están activas en cada sala.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 2. Personalización y favoritos */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Personaliza tu experiencia</h3>
                <p className="text-connect-muted mb-4">
                  Organiza tus salas favoritas para acceder rápidamente a las conversaciones que más te interesan.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-connect-bg-dark p-4 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Salas Favoritas
                    </h4>
                    <p className="text-sm text-connect-muted">Marca tus 5 salas preferidas y accede a ellas desde la parte superior de tu lista.</p>
                  </div>
                  <div className="bg-connect-bg-dark p-4 rounded-xl border border-connect-border">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
                      </svg>
                      Vista Detallada
                    </h4>
                    <p className="text-sm text-connect-muted">Muestra tus favoritas con descripción completa y el resto agrupadas por categoría.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Agrupar y extender */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Agrupar salas por tipo</h3>
                <p className="text-connect-muted mb-4">
                  Organiza las salas en carpetas personalizadas para una navegación más eficiente.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3 p-3 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center">📁</div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">Mis Intereses</div>
                      <div className="text-xs text-connect-muted">Música, Gaming, Cine</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="w-8 h-8 rounded bg-pink-500/20 text-pink-400 flex items-center justify-center">📁</div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">Citas</div>
                      <div className="text-xs text-connect-muted">Romance, Amistad, Encuentros</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Crear tu propia sala */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary text-connect-bg-dark flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Crea tu propia sala</h3>
                <p className="text-connect-muted mb-4">
                  ¿No encuentras una sala para tu tema favorito? ¡Créala! Tienes dos opciones:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  {/* Sala Temporal */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      <h4 className="font-bold text-white">Sala Temporal</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Activa solo mientras estés conectado. Perfecta para reuniones rápidas o eventos específicos.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Se elimina cuando te desconectas</span>
                    </div>
                  </div>

                  {/* Sala Permanente */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-primary/20 ring-2 ring-primary/30">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                      <h4 className="font-bold text-white">Sala Permanente</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Funciona 24/7, incluso sin ti. Crea una comunidad duradera alrededor de tu tema favorito.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Siempre disponible para todos</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-primary text-connect-bg-dark hover:brightness-110 font-bold">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Crear Mi Primera Sala
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-connect-border">
          <Link href="/connect/tutorial">
            <Button variant="ghost" className="text-connect-muted hover:text-white">
              ← Volver al tutorial
            </Button>
          </Link>
          <Link href="/connect/tutorial/foto-albumes">
            <Button className="bg-primary text-connect-bg-dark hover:brightness-110">
              Siguiente: Foto Álbumes →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
