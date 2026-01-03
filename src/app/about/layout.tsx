import Link from "next/link";

export default function AcercaDeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = [
    { name: "Sobre nosotros", href: "/about/sobre-nosotros" },
    { name: "Carrera", href: "/about/carrera" },
    { name: "Términos", href: "/about/terminos" },
    { name: "Cookies", href: "/about/cookies" },
    { name: "Protección de datos", href: "/about/proteccion-datos" },
    { name: "Ajuste de privacidad", href: "/about/ajuste-privacidad" },
  ];

  return (
    <div className="min-h-screen bg-connect-bg-dark font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-connect-border bg-connect-bg-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 text-primary bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>

          <Link href="/" className="text-sm text-connect-muted hover:text-primary transition-colors">
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="space-y-1 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Acerca de</h2>
              {sections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="block px-4 py-2 text-sm text-connect-muted hover:bg-connect-card hover:text-primary rounded-lg transition-colors"
                >
                  {section.name}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-connect-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-connect-muted">Locutorio.com.ve ayuda © 2025</p>
          <p className="text-xs text-primary mt-2">Creado con amor en</p>
        </div>
      </footer>
    </div>
  );
}
