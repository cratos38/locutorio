export default function CarreraPage() {
  return (
    <div className="max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Carrera
      </h1>

      <div className="text-connect-muted space-y-4 leading-relaxed">
        <p>
          ¿Te apasiona la tecnología y quieres formar parte de un equipo innovador? En <strong>LoCuToRiO</strong> estamos siempre buscando talento para unirse a nuestra misión de crear mejores conexiones humanas.
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-3">
          ¿Por qué trabajar con nosotros?
        </h2>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Ambiente de trabajo colaborativo y dinámico</li>
          <li>Proyectos desafiantes y tecnología moderna</li>
          <li>Oportunidades de crecimiento profesional</li>
          <li>Flexibilidad y trabajo remoto</li>
          <li>Equipo diverso y multicultural</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-6 mb-3">
          Posiciones abiertas
        </h2>

        <p>
          Actualmente estamos en proceso de expansión. Próximamente publicaremos nuestras vacantes disponibles.
        </p>

        <p>
          Mientras tanto, si crees que puedes aportar valor a nuestro equipo, no dudes en enviarnos tu CV y portafolio a:{" "}
          <a href="mailto:careers@locutorio.com.ve" className="text-blue-600 hover:underline">
            careers@locutorio.com.ve
          </a>
        </p>

        <h2 className="text-xl font-bold text-white mt-6 mb-3">
          Áreas de interés
        </h2>

        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Desarrollo Full Stack (React, Node.js, Python)</li>
          <li>Diseño UI/UX</li>
          <li>Marketing Digital</li>
          <li>Moderación de contenido</li>
          <li>Atención al cliente</li>
          <li>Seguridad informática</li>
        </ul>

        <div className="bg-primary/10 border-l-4 border-primary p-6 mt-8 rounded-lg">
          <p className="text-white font-semibold">
            ¿Listo para formar parte del equipo?
          </p>
          <p className="text-connect-muted mt-2">
            Envíanos tu información y cuéntanos por qué quieres trabajar con nosotros.
          </p>
        </div>
      </div>
    </div>
  );
}
