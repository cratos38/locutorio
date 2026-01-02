"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryType = "algo-sobre-mi" | "relaciones" | "cultura" | "estilo-vida" | "informacion-privada";

type EditModalType = 
  | "altura-peso"
  | "tipo-cuerpo"
  | "color-ojos"
  | "color-cabello"
  | "educacion"
  | "etnia"
  | "origen-geografico"
  | "definete-frase"
  | "cuentanos-algo"
  | "intereses"
  | "primera-cita"
  | "estado-civil"
  | "hijos"
  | "que-buscas"
  | "razon-principal"
  | "tiempo-pareja"
  | "casarse-importante"
  | "vehiculo-propio"
  | "saldrias-fumador"
  | "ideas-politicas"
  | "valores-tradicionales"
  | "espiritualidad"
  | "religion"
  | "convicciones-religiosas"
  | "te-ejercitas"
  | "usas-drogas"
  | "dieta-especial"
  | "tiempo-familia"
  | "personalidad-sociable"
  | "te-gusta-bailar"
  | "te-gusta-cocinar"
  | "orden-mantenimiento"
  | "escuelas-privadas-publicas"
  | "tus-padres"
  | "economicamente-independiente"
  | "pareja-mismo-nivel-ingresos"
  | "nivel-ingresos-actual"
  | "origenes-socioeconomicos"
  | "saldrias-kilos-mas"
  | "saldrias-con-hijos"
  | null;

export default function AjustesPerfilPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("algo-sobre-mi");
  const [editingField, setEditingField] = useState<EditModalType>(null);
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // Algo sobre mí
    altura: "178",
    peso: "75",
    tipoCuerpo: "atletico",
    colorOjos: "marrones",
    colorCabello: "negro",
    educacion: "universitaria",
    etnia: "mestizo",
    origenGeografico: "ciudad",
    defineteEnFrase: "un hombre normal, sincero y simple",
    cuentanosAlgoTuyo: "¡Hola! Gracias por visitar mi perfil. Déjame contarte un poco sobre mí. Me considero una persona honesta, amable, educada e inteligente...",
    intereses: "",
    primeraCitaIdeal: "En un lugar donde estemos cómodos al aire libre",
    
    // Relaciones
    estadoCivil: "soltero",
    hijos: "no",
    queBuscas: "formar-pareja",
    razonPrincipal: "acompanado-bien",
    tiempoEnPareja: "equilibrio",
    casarseImportante: "no-tan-importante",
    vehiculoPropio: "si",
    saldriasFumador: "no",
    
    // Cultura
    ideasPoliticas: "otro-punto-vista",
    valoresTradicionales: "tradicional-abierto",
    espiritualidad: "muy-poco",
    religion: "catolico",
    conviccionesReligiosas: "no-creyente",
    
    // Estilo de vida
    teEjercitas: "algunas-veces",
    usasDrogas: "nunca",
    dietaEspecial: "ninguna",
    tiempoConFamilia: "ocasionalmente",
    personalidadSociable: "algo-timido",
    teGustaBailar: "no-me-gusta",
    teGustaCocinar: "si-me-gusta",
    ordenMantenimiento: "orden-sin-exagerar",
    
    // Información privada
    escuelasPrivadasPublicas: "alternativa",
    tusPadresEstan: "ambos-murieron",
    economicamenteIndependiente: "si",
    parejaMismoNivelIngresos: "no-importante",
    nivelIngresosActual: "mucho-mayores",
    origenesSocioeconomicos: "clase-media",
    saldriasMasKilos: "no",
    saldriasConHijos: "si",
  });

  // Temporal state for modal editing
  const [tempValue, setTempValue] = useState<any>(null);

  const categories = [
    { id: "algo-sobre-mi" as CategoryType, label: "Algo sobre mí", icon: "👤" },
    { id: "relaciones" as CategoryType, label: "Relaciones", icon: "💑" },
    { id: "cultura" as CategoryType, label: "Cultura", icon: "🎭" },
    { id: "estilo-vida" as CategoryType, label: "Estilo de vida", icon: "🏃" },
    { id: "informacion-privada" as CategoryType, label: "Información privada", icon: "🔒" },
  ];

  const openEditModal = (field: EditModalType) => {
    setEditingField(field);
    // Initialize temp value based on field
    switch (field) {
      case "altura-peso":
        setTempValue({ altura: formData.altura, peso: formData.peso });
        break;
      default:
        setTempValue(null);
    }
  };

  const closeEditModal = () => {
    setEditingField(null);
    setTempValue(null);
  };

  const saveEditModal = () => {
    // Save logic here based on editingField
    console.log("Saving:", editingField, tempValue);
    closeEditModal();
  };

  const getLabelForValue = (field: string, value: string): string => {
    const labels: Record<string, Record<string, string>> = {
      tipoCuerpo: {
        "delgado": "Delgado/a",
        "atletico": "Atlético/a",
        "promedio": "Promedio",
        "voluminoso": "Voluminoso/a",
        "robusto": "Robusto/a",
      },
      colorOjos: {
        "negros": "Negros",
        "marrones": "Marrones",
        "azules": "Azules",
        "verdes": "Verdes",
        "grises": "Grises",
        "otro": "Otro",
      },
      colorCabello: {
        "negro": "Negro",
        "castaño": "Castaño",
        "rubio": "Rubio",
        "pelirrojo": "Pelirrojo",
        "gris": "Gris/Blanco",
        "otro": "Otro",
      },
      educacion: {
        "basica": "Básica",
        "secundaria": "Secundaria",
        "tecnica": "Técnica",
        "universitaria": "Universitaria",
        "postgrado": "Postgrado",
      },
      etnia: {
        "afro": "Afro/Negro/a",
        "arabe": "Árabe/Turco/a",
        "asiatico": "Asiático/a",
        "blanco": "Blanco/a (Caucásico/a)",
        "indigena": "Indígena",
        "mestizo": "Mestizo/a",
        "otro": "Otro",
      },
      origenGeografico: {
        "campo": "Vida de campo",
        "pueblo": "Vida de pueblo",
        "ciudad": "Vida de ciudad",
      },
      estadoCivil: {
        "soltero": "Soltero/a",
        "casado": "Casado/a",
        "divorciado": "Divorciado/a",
        "viudo": "Viudo/a",
      },
      hijos: {
        "prefiero-no-decir": "Prefiero no decir",
        "si-no-viven": "Sí, pero no viven en mi casa",
        "si-viven": "Sí, y viven en mi casa",
        "no": "No",
        "no-me-acuerdo": "No me acuerdo...",
      },
      queBuscas: {
        "formar-pareja": "Encontrar a alguien para formar pareja",
        "aventuras": "Aventuras sin compromiso",
      },
      razonPrincipal: {
        "familia-futuro": "Para formar una familia y planear un futuro",
        "acompanado-bien": "Para sentirme acompañado/a y pasarla bien",
        "no-seguro": "No estoy seguro / No sé muy bien para qué",
      },
      tiempoEnPareja: {
        "mayoria-compania": "Me encanta pasar la mayoría del tiempo en compañía de mi pareja",
        "equilibrio": "Necesito mi espacio y que negociemos un equilibrio",
      },
      casarseImportante: {
        "si-importante": "Sí, es importante, me gustaría casarme en el futuro",
        "no-tan-importante": "No es tan importante, vivir juntos sería suficiente",
        "no-estoy-seguro": "No estoy seguro",
      },
      vehiculoPropio: {
        "si": "Sí",
        "no": "No",
      },
      saldriasFumador: {
        "no": "No",
        "si": "Sí",
        "si-prefiero": "Sí, y prefiero que fume",
      },
      ideasPoliticas: {
        "prefiero-no-decir": "Prefiero no decir",
        "ultra-conservador": "Ultra Conservador",
        "conservador": "Conservador",
        "indiferente": "Indiferente",
        "liberal": "Liberal",
        "muy-liberal": "Muy Liberal",
        "inconformista": "Inconformista",
        "otro-punto-vista": "Otro punto de vista",
      },
      valoresTradicionales: {
        "bastante": "Bastante, me gusta aferrarme a las tradiciones",
        "tradicional-abierto": "Soy tradicional, pero de mente abierta hacia lo diferente",
        "poco-tradicional": "Poco tradicional... casi siempre prefiero inventar mi propio camino",
      },
      espiritualidad: {
        "si-bastante": "Sí, bastante",
        "mas-o-menos": "Más o menos",
        "muy-poco": "Muy poco",
      },
      religion: {
        "cristiano": "Cristiano",
        "budista": "Budista",
        "catolico": "Católico",
        "protestante": "Protestante",
        "ortodoxo": "Ortodoxo",
        "musulman": "Musulmán",
        "judio": "Judío",
        "hindu": "Hindú",
        "ateo": "Ateo",
        "agnostico": "Agnóstico",
        "espiritualista": "Espiritualista",
        "otro": "Otro",
      },
      conviccionesReligiosas: {
        "bastante-religioso": "Me considero una persona bastante religiosa",
        "creyente-relajado": "Me considero creyente... pero relajado",
        "no-creyente": "No soy creyente, ni religioso",
      },
      teEjercitas: {
        "si-regularmente": "Sí, regularmente",
        "algunas-veces": "Algunas veces",
        "no-lo-hago": "No lo hago",
      },
      usasDrogas: {
        "prefiero-no-decir": "Prefiero no decir",
        "nunca": "Nunca",
        "alguna-vez": "Alguna vez",
        "seguido": "Seguido (más de 3 veces a la semana)",
      },
      dietaEspecial: {
        "ninguna": "Ninguna alimentación en especial",
        "vegetariana": "Vegetariana",
        "vegana": "Vegana",
        "kosher": "Kosher",
        "halal": "Halal",
        "otra": "Otra",
      },
      tiempoConFamilia: {
        "si-me-encanta": "Sí, me encanta, soy súper familiero/a",
        "ocasionalmente": "Ocasionalmente, de vez en cuando",
        "francamente-no": "Francamente... no soy muy familiero",
      },
      personalidadSociable: {
        "bastante-extrovertido": "Sí, soy bastante extrovertido y sociable",
        "algo-timido": "Soy algo tímido/a, pero igual me gusta socializar",
        "desgastante": "Me resulta desgastante... odio hacer sociales",
      },
      teGustaBailar: {
        "si-me-gusta": "Sí, me gusta",
        "mas-o-menos": "Más o menos",
        "no-me-gusta": "No me gusta",
      },
      teGustaCocinar: {
        "si-me-gusta": "Sí, me gusta",
        "mas-o-menos": "Más o menos",
        "no-me-gusta": "No me gusta",
      },
      ordenMantenimiento: {
        "impecable": "Me encanta mantener todo lo más impecable posible",
        "orden-sin-exagerar": "Me gusta mantener el orden, pero sin exagerar",
        "relajado": "Soy relajado, ordeno ocasionalmente",
        "muy-relajado": "Soy muy relajado, no ordeno casi nunca",
      },
      escuelasPrivadasPublicas: {
        "publicas": "Escuelas públicas",
        "privadas": "Escuelas privadas",
        "mezcla": "Mezcla de públicas y privadas",
        "en-casa": "Educación en casa",
        "alternativa": "Educación alternativa",
      },
      tusPadresEstan: {
        "aun-casados": "Aún casados",
        "divorciados": "Divorciados",
        "separados": "Separados",
        "uno-muerto": "Uno ha muerto",
        "ambos-murieron": "Ambos murieron",
        "no-estan-juntos": "No están juntos",
      },
      economicamenteIndependiente: {
        "si": "Sí",
        "no": "No",
        "mas-o-menos": "Más o menos",
      },
      parejaMismoNivelIngresos: {
        "no-importante": "No es importante",
        "escalon-cercano": "Es importante que al menos esté en un escalón cercano",
        "mismo-nivel": "Tiene que estar en el mismo nivel o más que yo",
      },
      nivelIngresosActual: {
        "no-tengo": "No tengo ingresos",
        "menores": "Ingresos menores que un salario básico",
        "similares": "Ingresos similares que un salario básico",
        "mayores": "Ingresos mayores que un salario básico",
        "mucho-mayores": "Ingresos mucho mayores que un salario básico",
      },
      origenesSocioeconomicos: {
        "clase-humilde": "Provengo de una familia de clase humilde",
        "clase-media": "Provengo de una familia de clase media",
        "clase-media-alta": "Provengo de una familia de clase media-alta",
        "clase-alta": "Provengo de una familia de clase alta",
      },
      saldriasMasKilos: {
        "no": "No",
        "si": "Sí",
        "si-prefiero": "Sí, y prefiero que sea así",
      },
      saldriasConHijos: {
        "no": "No",
        "si": "Sí",
        "si-prefiero": "Sí, y prefiero que tenga hijos",
      },
    };

    return labels[field]?.[value] || value;
  };

  const renderFieldValue = (label: string, value: string, field: string, isPrivate: boolean = false) => {
    if (!value) return null;

    return (
      <div className="bg-white/5 border border-forest-light rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPrivate && <span className="text-gray-500 text-sm">🔒</span>}
              <p className="text-sm font-medium text-gray-400">{label}</p>
            </div>
            <p className="text-gray-200">{getLabelForValue(field, value)}</p>
          </div>
          <button
            onClick={() => openEditModal(field as EditModalType)}
            className="text-sm text-gray-400 hover:text-neon-green border border-forest-light hover:border-neon-green px-4 py-2 rounded-lg transition-all"
          >
            Modificar
          </button>
        </div>
      </div>
    );
  };

  const renderTextFieldValue = (label: string, value: string, fieldKey: EditModalType, isPrivate: boolean = false) => {
    if (!value) return null;

    return (
      <div className="bg-white/5 border border-forest-light rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isPrivate && <span className="text-gray-500 text-sm">🔒</span>}
              <p className="text-sm font-medium text-gray-400">{label}</p>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap">{value}</p>
          </div>
          <button
            onClick={() => openEditModal(fieldKey)}
            className="text-sm text-gray-400 hover:text-neon-green border border-forest-light hover:border-neon-green px-4 py-2 rounded-lg transition-all flex-shrink-0"
          >
            Modificar
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "algo-sobre-mi":
        return (
          <div className="space-y-6">
            {/* Apariencia física */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Apariencia física</h3>
              
              {formData.altura && formData.peso && (
                <div className="bg-white/5 border border-forest-light rounded-lg p-4 mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400 mb-2">Altura y Peso</p>
                      <p className="text-gray-200">{formData.altura} cm / {formData.peso} kg</p>
                    </div>
                    <button
                      onClick={() => openEditModal("altura-peso")}
                      className="text-sm text-gray-400 hover:text-neon-green border border-forest-light hover:border-neon-green px-4 py-2 rounded-lg transition-all"
                    >
                      Modificar
                    </button>
                  </div>
                </div>
              )}

              {renderFieldValue("Tipo de cuerpo", formData.tipoCuerpo, "tipoCuerpo")}
              {renderFieldValue("Color de ojos", formData.colorOjos, "colorOjos")}
              {renderFieldValue("Color de cabello", formData.colorCabello, "colorCabello")}
            </div>

            {/* Educación y origen */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Educación y origen</h3>
              {renderFieldValue("Educación", formData.educacion, "educacion")}
              {renderFieldValue("Tu etnia", formData.etnia, "etnia")}
              {renderFieldValue("Origen geográfico", formData.origenGeografico, "origenGeografico")}
            </div>

            {/* Presentación personal */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Presentación personal</h3>
              {renderTextFieldValue("Defínete en una frase", formData.defineteEnFrase, "definete-frase")}
              {renderTextFieldValue("Cuéntanos algo tuyo", formData.cuentanosAlgoTuyo, "cuentanos-algo")}
              {renderTextFieldValue("Intereses (separados con una coma)", formData.intereses, "intereses")}
              {renderTextFieldValue("¿Cómo sería tu primera cita ideal?", formData.primeraCitaIdeal, "primera-cita")}
            </div>
          </div>
        );

      case "relaciones":
        return (
          <div className="space-y-6">
            {/* Estado civil e hijos */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Estado civil e hijos</h3>
              {renderFieldValue("Estado civil", formData.estadoCivil, "estadoCivil")}
              {renderFieldValue("¿Tienes hijos?", formData.hijos, "hijos")}
            </div>

            {/* Expectativas */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Expectativas</h3>
              {renderFieldValue("¿Qué estás buscando en nuestra web?", formData.queBuscas, "queBuscas")}
              {renderFieldValue("¿Razón PRINCIPAL por la que quieres tener pareja?", formData.razonPrincipal, "razonPrincipal")}
            </div>

            {/* Preferencias */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Preferencias</h3>
              {renderFieldValue("¿Cómo te gusta administrar tu tiempo en pareja?", formData.tiempoEnPareja, "tiempoEnPareja")}
              {renderFieldValue("¿Casarse es importante?", formData.casarseImportante, "casarseImportante")}
              {renderFieldValue("¿Tienes vehículo propio?", formData.vehiculoPropio, "vehiculoPropio")}
            </div>

            {/* Saldrías con alguien que... */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Saldrías con alguien que...</h3>
              {renderFieldValue("¿Saldrías con alguien que fuma?", formData.saldriasFumador, "saldriasFumador")}
            </div>
          </div>
        );

      case "cultura":
        return (
          <div className="space-y-6">
            {/* Ideas y valores */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Ideas y valores</h3>
              {renderFieldValue("Ideas políticas", formData.ideasPoliticas, "ideasPoliticas")}
              {renderFieldValue("¿Eres una persona de valores tradicionales?", formData.valoresTradicionales, "valoresTradicionales")}
              {renderFieldValue("Te interesa la espiritualidad?", formData.espiritualidad, "espiritualidad")}
            </div>

            {/* Religión */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Religión</h3>
              {renderFieldValue("Religión", formData.religion, "religion")}
              {renderFieldValue("Convicciones religiosas", formData.conviccionesReligiosas, "conviccionesReligiosas")}
            </div>
          </div>
        );

      case "estilo-vida":
        return (
          <div className="space-y-6">
            {/* Salud y hábitos */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Salud y hábitos</h3>
              {renderFieldValue("Te ejercitas físicamente?", formData.teEjercitas, "teEjercitas")}
              {renderFieldValue("Usas drogas?", formData.usasDrogas, "usasDrogas")}
              {renderFieldValue("Dieta o alimentación especial?", formData.dietaEspecial, "dietaEspecial")}
            </div>

            {/* Personalidad y costumbres */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-4">Personalidad y costumbres</h3>
              {renderFieldValue("Te gusta pasar tiempo con familiares?", formData.tiempoConFamilia, "tiempoConFamilia")}
              {renderFieldValue("Eres de personalidad sociable?", formData.personalidadSociable, "personalidadSociable")}
              {renderFieldValue("Te gusta bailar?", formData.teGustaBailar, "teGustaBailar")}
              {renderFieldValue("Te gusta cocinar?", formData.teGustaCocinar, "teGustaCocinar")}
              {renderFieldValue("Orden y mantenimiento", formData.ordenMantenimiento, "ordenMantenimiento")}
            </div>
          </div>
        );

      case "informacion-privada":
        return (
          <div className="space-y-6">
            {/* Banner informativo */}
            <div className="bg-forest-dark/80 backdrop-blur-sm border border-neon-green/30 rounded-xl p-6 shadow-xl shadow-neon-green/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🔒</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neon-green mb-3">Información privada</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <p>Esta información es <strong className="text-neon-green">completamente opcional y privada</strong>:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>No es obligatorio completar este formulario</li>
                      <li>No se muestra públicamente en tu perfil</li>
                      <li>No se usa para fines comerciales</li>
                      <li>No se comparte con terceros</li>
                      <li>Solo se utiliza para mejorar las búsquedas automáticas y sugerencias personalizadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Educación */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Educación</h3>
              </div>
              {renderFieldValue("¿Estudiaste en escuelas privadas o públicas?", formData.escuelasPrivadasPublicas, "escuelasPrivadasPublicas", true)}
            </div>

            {/* Familia */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Familia</h3>
              </div>
              {renderFieldValue("Tus padres están...", formData.tusPadresEstan, "tusPadresEstan", true)}
            </div>

            {/* Situación económica */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Situación económica</h3>
              </div>
              {renderFieldValue("¿Eres económicamente independiente?", formData.economicamenteIndependiente, "economicamenteIndependiente", true)}
              {renderFieldValue("¿Es importante que tu pareja tenga tu mismo nivel de ingresos?", formData.parejaMismoNivelIngresos, "parejaMismoNivelIngresos", true)}
              {renderFieldValue("¿Cuál es tu nivel de ingresos actual?", formData.nivelIngresosActual, "nivelIngresosActual", true)}
            </div>

            {/* Orígenes */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Orígenes</h3>
              </div>
              {renderFieldValue("¿Cuáles son tus orígenes socio-económicos?", formData.origenesSocioeconomicos, "origenesSocioeconomicos", true)}
            </div>

            {/* Saldrías con alguien que... (privado) */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Saldrías con alguien que...</h3>
              </div>
              {renderFieldValue("¿Saldrías con alguien con unos kilos de más o de talla grande?", formData.saldriasMasKilos, "saldriasMasKilos", true)}
              {renderFieldValue("¿Saldrías con alguien que tiene hijos?", formData.saldriasConHijos, "saldriasConHijos", true)}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderEditModal = () => {
    if (!editingField) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-forest-dark border-2 border-neon-green/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-neon-green/20">
          {/* Modal content based on editingField */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neon-green">Editar campo</h3>
            <button
              onClick={closeEditModal}
              className="text-gray-400 hover:text-neon-green transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal form content - placeholder */}
          <div className="text-gray-300 mb-6">
            <p>Modal para editar: {editingField}</p>
            <p className="text-sm text-gray-500 mt-2">TODO: Implementar formulario específico para cada campo</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={closeEditModal}
              variant="ghost"
              className="flex-1 bg-forest-light/30 text-gray-300 hover:bg-forest-light/50"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveEditModal}
              className="flex-1 bg-neon-green text-forest-dark hover:brightness-110"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-forest-dark">
      {/* Header */}
      <header className="bg-forest-dark/90 backdrop-blur-sm border-b border-forest-light sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/mi-espacio" className="flex items-center gap-2">
              <div className="size-10 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">LoCuToRiO</span>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/mi-espacio" className="text-gray-400 hover:text-neon-green transition-colors">
                Mi Espacio
              </Link>
              <Link href="/inicio" className="text-gray-400 hover:text-neon-green transition-colors">
                Inicio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Editar Perfil Detallado</h1>
          <p className="text-gray-400">Completa tu perfil para mejorar tus conexiones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-4 shadow-lg sticky top-24">
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeCategory === category.id
                        ? "bg-neon-green/20 border border-neon-green text-neon-green shadow-lg shadow-neon-green/20"
                        : "bg-forest-dark/40 border border-transparent text-gray-400 hover:border-neon-green/50 hover:text-gray-300"
                    }`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
}
