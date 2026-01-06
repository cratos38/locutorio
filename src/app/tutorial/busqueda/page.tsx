"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";

export default function BusquedaTutorialPage() {
  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Use internal header for logged-in users */}
      <InternalHeader />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/20 text-orange-400 mb-6">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Búsqueda Avanzada</h1>
          <p className="text-connect-muted text-lg max-w-2xl mx-auto">
            Encuentra exactamente a quien buscas con filtros inteligentes y búsqueda personalizada.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* 1. Modalidades de búsqueda */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">Modalidades de Búsqueda</h3>
                <p className="text-connect-muted mb-6">
                  Elige el tipo de búsqueda según lo que estés buscando en este momento.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Búsqueda Rápida */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">⚡ Búsqueda Rápida</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Busca por nombre de usuario, ciudad o edad. Resultados instantáneos mientras escribes.
                    </p>
                    <div className="text-xs text-blue-400">
                      Ejemplo: "Ana, 25, Madrid"
                    </div>
                  </div>

                  {/* Búsqueda Avanzada */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-primary/30 ring-1 ring-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">🔍 Búsqueda Avanzada</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Usa múltiples filtros combinados para encontrar tu pareja o amigo ideal.
                    </p>
                    <div className="text-xs text-primary">
                      Más de 20 filtros disponibles
                    </div>
                  </div>

                  {/* Búsqueda por Intereses */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">💝 Por Intereses</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Encuentra personas que comparten tus hobbies, música favorita o películas.
                    </p>
                    <div className="text-xs text-purple-400">
                      Conecta por afinidades
                    </div>
                  </div>

                  {/* Amigos Mutuos */}
                  <div className="bg-connect-bg-dark p-6 rounded-xl border border-connect-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                      </div>
                      <h4 className="font-bold text-white">👥 Amigos Mutuos</h4>
                    </div>
                    <p className="text-sm text-connect-muted mb-3">
                      Descubre personas que tienen amigos en común contigo. Amplía tu círculo social de forma segura.
                    </p>
                    <div className="text-xs text-green-400">
                      Conexiones confiables
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Filtros disponibles */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500 text-connect-bg-dark flex items-center justify-center font-bold">
                2
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-white mb-3">Filtros Inteligentes</h3>
                <p className="text-connect-muted mb-6">
                  Combina múltiples filtros para afinar tu búsqueda y encontrar exactamente lo que buscas.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Filtros básicos */}
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Básicos</div>
                    <div className="text-sm text-white font-medium">📍 Ubicación</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Básicos</div>
                    <div className="text-sm text-white font-medium">🎂 Edad (rango)</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Básicos</div>
                    <div className="text-sm text-white font-medium">⚧️ Género</div>
                  </div>

                  {/* Filtros de apariencia */}
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Apariencia</div>
                    <div className="text-sm text-white font-medium">📏 Altura</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Apariencia</div>
                    <div className="text-sm text-white font-medium">👁️ Color de ojos</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Apariencia</div>
                    <div className="text-sm text-white font-medium">💇 Color de cabello</div>
                  </div>

                  {/* Filtros de personalidad */}
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-primary/30">
                    <div className="text-xs text-connect-muted mb-1">Intereses</div>
                    <div className="text-sm text-white font-medium">🎵 Música</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-primary/30">
                    <div className="text-xs text-connect-muted mb-1">Intereses</div>
                    <div className="text-sm text-white font-medium">🎬 Películas</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-primary/30">
                    <div className="text-xs text-connect-muted mb-1">Intereses</div>
                    <div className="text-sm text-white font-medium">⚽ Deportes</div>
                  </div>

                  {/* Filtros de estilo de vida */}
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Estilo de vida</div>
                    <div className="text-sm text-white font-medium">🎓 Educación</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Estilo de vida</div>
                    <div className="text-sm text-white font-medium">💼 Profesión</div>
                  </div>
                  <div className="bg-connect-bg-dark p-3 rounded-lg border border-connect-border">
                    <div className="text-xs text-connect-muted mb-1">Estado</div>
                    <div className="text-sm text-white font-medium">💚 Online ahora</div>
                  </div>
                </div>

                <div className="mt-6 bg-connect-bg-dark p-4 rounded-lg border border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <div>
                      <div className="text-sm font-bold text-white mb-1">💡 Consejo Pro:</div>
                      <p className="text-sm text-connect-muted">
                        Guarda tus combinaciones de filtros favoritas para usarlas rápidamente en futuras búsquedas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Búsquedas guardadas */}
          <Card className="bg-connect-card border border-connect-border p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Guarda tus Búsquedas Favoritas</h3>
                <p className="text-connect-muted mb-4">
                  ¿Tienes una combinación de filtros que usas frecuentemente? Guárdala para acceder con un solo clic.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <div>
                        <div className="font-bold text-white text-sm">Amigos cerca</div>
                        <div className="text-xs text-connect-muted">20-30 años, 50km, Online</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary text-connect-bg-dark hover:brightness-110">
                      Buscar
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-connect-bg-dark rounded-lg border border-connect-border">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <div>
                        <div className="font-bold text-white text-sm">Parejas deportistas</div>
                        <div className="text-xs text-connect-muted">25-40 años, Deportes, Madrid</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary text-connect-bg-dark hover:brightness-110">
                      Buscar
                    </Button>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-connect-bg-dark hover:bg-connect-border text-white border border-connect-border">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Guardar Nueva Búsqueda
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-connect-border">
          <Link href="/tutorial/foto-albumes">
            <Button variant="ghost" className="text-connect-muted hover:text-white">
              ← Anterior: Foto Álbumes
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="bg-primary text-connect-bg-dark hover:brightness-110">
              Empezar a Usar LoCuToRiO →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
