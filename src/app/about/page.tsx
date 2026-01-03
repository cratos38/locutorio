import Link from "next/link";

export default function AcercaDePage() {
  const sections = [
    {
      name: "Sobre nosotros",
      href: "/about/sobre-nosotros",
      description: "Conoce más sobre LoCuToRiO y nuestra misión",
      icon: "👥"
    },
    {
      name: "Carrera",
      href: "/about/carrera",
      description: "Únete a nuestro equipo y crece profesionalmente",
      icon: "💼"
    },
    {
      name: "Términos",
      href: "/about/terminos",
      description: "Términos y condiciones de uso del servicio",
      icon: "📄"
    },
    {
      name: "Cookies",
      href: "/about/cookies",
      description: "Política de cookies y publicidad",
      icon: "🍪"
    },
    {
      name: "Protección de datos",
      href: "/about/proteccion-datos",
      description: "Cómo manejamos tus datos privados",
      icon: "🔒"
    },
    {
      name: "Ajuste de privacidad",
      href: "/about/ajuste-privacidad",
      description: "Configura tus preferencias de privacidad",
      icon: "⚙️"
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">
          Acerca de LoCuToRiO
        </h1>
        <p className="text-connect-muted">
          Encuentra información sobre nuestra empresa, políticas y términos de uso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="block p-6 bg-connect-card border border-connect-border rounded-lg hover:border-primary hover:bg-connect-card/50 transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{section.icon}</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {section.name}
                </h2>
                <p className="text-connect-muted text-sm">
                  {section.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-connect-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
