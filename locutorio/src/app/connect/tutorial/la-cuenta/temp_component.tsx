// Componente para enlaces internos animados
const SectionLink = ({ sectionId, children }: { sectionId: number; children: React.ReactNode }) => {
  const scrollToSection = () => {
    // Cerrar cualquier sección abierta y abrir la nueva
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Esperar a que termine el scroll y luego abrir la sección
      setTimeout(() => {
        const button = element.querySelector('button');
        if (button) button.click();
      }, 500);
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToSection}
      className="text-primary font-semibold inline-flex items-center gap-0.5 hover:scale-110 hover:brightness-125 hover:drop-shadow-[0_0_12px_rgba(43,238,121,0.8)] transition-all duration-300 ease-out underline decoration-primary/50 hover:decoration-primary active:scale-95"
    >
      {children}
      <svg className="w-3.5 h-3.5 transition-transform hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

// Mapa de secciones
const SECTION_MAP: Record<string, number> = {
  "¿Qué fotos de perfil aprobamos?": 3,
  "¿Cómo despertar interés con un perfil en las redes sociales?": 10,
  "Reglas de comportamiento en Locutorio.com.ve": 8,
  "Reglas de la comunidad Locutorio": 8,
  "Información sobre el servicio +PLUS": 9,
  "servicio +PLUS": 9,
  "Por qué se debe verificar el perfil (no solo) en Locutorio": 7,
  "Términos y Condiciones": 8,
  "Términos y condiciones": 8
};

// Función para procesar texto y convertir referencias en enlaces
const processTextWithLinks = (text: string): React.ReactNode => {
  let nodes: React.ReactNode[] = [text];
  
  // Ordenar por longitud para procesar primero las frases más largas
  const sortedSections = Object.entries(SECTION_MAP).sort((a, b) => b[0].length - a[0].length);
  
  sortedSections.forEach(([sectionName, sectionId]) => {
    const newNodes: React.ReactNode[] = [];
    
    nodes.forEach((node, nodeIdx) => {
      if (typeof node === 'string') {
        const parts = node.split(sectionName);
        parts.forEach((part, partIdx) => {
          if (part) newNodes.push(part);
          if (partIdx < parts.length - 1) {
            newNodes.push(
              <SectionLink key={`link-${sectionId}-${nodeIdx}-${partIdx}`} sectionId={sectionId}>
                {sectionName}
              </SectionLink>
            );
          }
        });
      } else {
        newNodes.push(node);
      }
    });
    
    nodes = newNodes;
  });
  
  return <>{nodes}</>;
};
