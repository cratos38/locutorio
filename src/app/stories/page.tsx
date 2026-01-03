import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import InfoWidget from "@/components/InfoWidget";

export default function HistoriasPage() {
  // Historias de éxito de ejemplo (placeholder)
  const historias = [
    {
      id: 1,
      title: "María y Carlos",
      subtitle: "De Caracas a Maracaibo",
      story: "Nos conocimos en LoCuToRiO hace 2 años. Después de meses de conversaciones, decidimos encontrarnos. Hoy vivimos juntos y somos muy felices.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
    },
    {
      id: 2,
      title: "Ana y Luis",
      subtitle: "Una amistad que se convirtió en amor",
      story: "Empezamos como amigos en las salas de chat. Con el tiempo nos dimos cuenta que éramos perfectos el uno para el otro.",
      image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop",
    },
    {
      id: 3,
      title: "Pedro y Laura",
      subtitle: "Amor a distancia",
      story: "Ella en Valencia, yo en Mérida. LoCuToRiO nos ayudó a mantener la conexión hasta que pudimos estar juntos.",
      image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=400&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white">
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
              <Link href="/stories" className="text-sm font-medium text-primary hover:text-primary transition-colors">
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
      <section className="py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
              Historias de <span className="text-primary">Éxito</span>
            </h1>
            <p className="text-xl text-connect-muted max-w-2xl mx-auto">
              Conoce las historias reales de personas que encontraron el amor y la amistad en LoCuToRiO
            </p>
          </div>

          {/* Historias Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {historias.map((historia) => (
              <Card key={historia.id} className="bg-connect-card border-connect-border hover:border-primary/50 transition-all overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={historia.image} 
                    alt={historia.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{historia.title}</h3>
                  <p className="text-sm text-primary mb-3">{historia.subtitle}</p>
                  <p className="text-connect-muted leading-relaxed">{historia.story}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold mb-6">¿Listo para escribir tu propia historia?</h2>
            <Link href="/registro">
              <Button size="lg" className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold text-lg px-8 py-6 shadow-[0_0_30px_rgba(43,238,121,0.4)]">
                Únete Gratis Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
