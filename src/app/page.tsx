import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import InfoWidget from "@/components/InfoWidget";
import Link from "next/link";

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-connect-bg-dark/80 border-b border-connect-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">LoCuToRiO</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/stories" className="text-sm font-medium text-white hover:text-primary transition-colors">
                Historias
              </Link>
              <Link href="/tutorial" className="text-sm font-medium text-white hover:text-primary transition-colors">
                Tutorial
              </Link>
              <Link href="/acerca-de" className="text-sm font-medium text-white hover:text-primary transition-colors">
                Acerca de
              </Link>
              
              {/* Espacio extra antes del widget */}
              <div className="w-16"></div>
              
              {/* Widget de Tiempo y BCV */}
              <InfoWidget />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:flex text-white hover:bg-connect-border">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold shadow-[0_0_20px_rgba(43,238,121,0.3)]">
                  Únete Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Blurs */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-connect-border w-fit mx-auto lg:mx-0 border border-white/5">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-medium text-connect-muted uppercase tracking-wider">
                  Social Network v2.0
                </span>
              </Badge>

              <div className="w-full max-w-4xl h-[250px] flex items-center justify-center lg:justify-start mx-auto lg:-ml-8">
                <TextHoverEffect text="LoCuToRiO" duration={0.3} />
              </div>

              <p className="text-lg text-connect-muted max-w-lg mx-auto lg:mx-0">
                Únete a la comunidad de más rápido crecimiento para citas, amistad y conversación.
                Salta a salas en vivo o encuentra personas cercanas.
              </p>
            </div>

            {/* Right Image */}
            <div className="relative w-full aspect-square sm:aspect-video lg:aspect-square max-h-[600px]">
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-connect-border bg-connect-card">
                <div className="w-full h-full bg-gradient-to-br from-connect-card to-connect-bg-dark flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-connect-muted">Imagen de comunidad</p>
                  </div>
                </div>

                {/* Online Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-connect-bg-dark/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-connect-bg-dark"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-connect-bg-dark"></div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-connect-bg-dark border-2 border-connect-bg-dark">
                      +2k
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">En Línea Ahora</span>
                    <span className="text-xs text-primary">Únete a la conversación</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-connect-card border-y border-connect-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dating Card */}
            <Card className="p-6 rounded-2xl bg-connect-bg-dark border border-connect-border hover:border-primary/50 transition-all duration-300 group cursor-default hover:shadow-[0_20px_50px_rgba(43,238,121,0.15)] hover:-translate-y-2 hover:rotate-1 transform-gpu">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-connect-bg-dark transition-colors text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Citas</h3>
              <p className="text-connect-muted text-sm leading-relaxed">
                Encuentra tu pareja perfecta cerca con nuestro algoritmo inteligente diseñado para conexiones reales.
              </p>
            </Card>

            {/* Friends Card */}
            <Card className="p-6 rounded-2xl bg-connect-bg-dark border border-connect-border hover:border-primary/50 transition-all duration-300 group cursor-default hover:shadow-[0_20px_50px_rgba(43,238,121,0.15)] hover:-translate-y-2 transform-gpu">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-connect-bg-dark transition-colors text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Amigos</h3>
              <p className="text-connect-muted text-sm leading-relaxed">
                Conecta con personas que comparten tus hobbies raros, gusto musical y pasiones.
              </p>
            </Card>

            {/* Chat Card */}
            <Card className="p-6 rounded-2xl bg-connect-bg-dark border border-connect-border hover:border-primary/50 transition-all duration-300 group cursor-default hover:shadow-[0_20px_50px_rgba(43,238,121,0.15)] hover:-translate-y-2 hover:-rotate-1 transform-gpu">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-connect-bg-dark transition-colors text-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Chat</h3>
              <p className="text-connect-muted text-sm leading-relaxed">
                Salta a salas de audio y texto en vivo. Comienza a hablar instantáneamente sin presión.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Happening Now Section */}
      <section className="py-20 relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Sucediendo Ahora</h2>
              <p className="text-connect-muted">
                Mira qué está pasando en la comunidad en este momento.
              </p>
            </div>
            <Link href="/connect/activity" className="text-primary font-medium hover:underline flex items-center gap-1">
              Ver toda la actividad →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tutorial Steps */}
            <div className="lg:col-span-2">
              <Card className="bg-connect-card border border-connect-border rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Pasos para Comenzar
                </h3>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-connect-bg-dark font-bold text-lg">
                        1
                      </div>
                      <div className="w-0.5 bg-connect-border h-full my-2"></div>
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className="text-white text-base font-bold">
                        Crea Tu Cuenta
                      </h4>
                      <p className="text-connect-muted text-sm mt-2 leading-relaxed">
                        Regístrate gratis con tu email. Solo toma 2 minutos. Tu cuenta será verificada para garantizar seguridad en la comunidad.
                      </p>
                      <Link href="/registro" className="inline-flex items-center gap-2 mt-3 text-primary text-sm font-medium hover:underline">
                        Crear cuenta ahora →
                      </Link>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-connect-bg-dark font-bold text-lg">
                        2
                      </div>
                      <div className="w-0.5 bg-connect-border h-full my-2"></div>
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className="text-white text-base font-bold">
                        Completa Tu Perfil
                      </h4>
                      <p className="text-connect-muted text-sm mt-2 leading-relaxed">
                        Añade tu foto, intereses y lo que buscas. Un perfil completo recibe 10x más visitas y conexiones reales.
                      </p>
                      <Link href="/connect/tutorial/la-cuenta" className="inline-flex items-center gap-2 mt-3 text-primary text-sm font-medium hover:underline">
                        Aprende más →
                      </Link>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-connect-bg-dark font-bold text-lg">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white text-base font-bold">
                        Conecta y Chatea
                      </h4>
                      <p className="text-connect-muted text-sm mt-2 leading-relaxed">
                        Busca personas por edad, ciudad e intereses. Salta a salas de chat en vivo o envía mensajes privados. ¡Es gratis!
                      </p>
                      <Link href="/tutorial" className="inline-flex items-center gap-2 mt-3 text-primary text-sm font-medium hover:underline">
                        Ver tutorial completo →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              {/* Features */}
              <Card className="bg-connect-card border border-connect-border rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¿Por qué LoCuToRiO?
                </h3>

                <div className="space-y-4">
                  {/* Feature 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">100% Gratis</h4>
                      <p className="text-xs text-connect-muted mt-1">Registro, búsqueda y mensajes sin costo</p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Seguro y Verificado</h4>
                      <p className="text-xs text-connect-muted mt-1">Todas las cuentas son verificadas</p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">+1,200 Activos</h4>
                      <p className="text-xs text-connect-muted mt-1">Miles de usuarios reales en línea</p>
                    </div>
                  </div>
                </div>

                <Link href="/registro">
                  <Button className="w-full mt-4 bg-primary text-connect-bg-dark hover:brightness-110 font-bold">
                    Únete Gratis
                  </Button>
                </Link>
              </Card>

              {/* Premium Card */}
              <Card className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-connect-bg-dark border-0">
                <h3 className="font-bold text-xl mb-2">Hazte Premium</h3>
                <p className="text-sm font-medium opacity-80 mb-4">
                  Desbloquea salas privadas y ve quién vio tu perfil.
                </p>
                <Button className="w-full bg-connect-bg-dark text-white hover:bg-connect-bg-dark/80 font-bold">
                  Actualizar Ahora
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-connect-card border-t border-connect-border py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-6 text-primary bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">LoCuToRiO</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-connect-muted">
              <Link href="/acerca-de" className="hover:text-primary transition-colors">
                Acerca de
              </Link>
              <Link href="/acerca-de/proteccion-datos" className="hover:text-primary transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/acerca-de/terminos" className="hover:text-primary transition-colors">
                Términos de Servicio
              </Link>
              <Link href="/connect/tutorial/la-cuenta" className="hover:text-primary transition-colors">
                Soporte
              </Link>
            </div>

            <div className="flex gap-4">
              <a href="#" className="text-connect-muted hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
              <a href="#" className="text-connect-muted hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-connect-border pt-8 text-center text-xs text-connect-muted">
            © 2023 LoCuToRiO Inc. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
