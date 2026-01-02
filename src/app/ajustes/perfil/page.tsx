"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryType = "algo-sobre-mi" | "relaciones" | "cultura" | "estilo-vida" | "informacion-privada";

// Tipo para respuestas Sí/No/No respondo
type YesNoResponse = "no-respondo" | "no" | "si" | "";

export default function AjustesPerfilPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("algo-sobre-mi");
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // ===== ALGO SOBRE MÍ =====
    altura: "175",
    peso: "70",
    tipoCuerpo: "atletico",
    colorOjos: "marrones",
    colorCabello: "negro",
    educacion: "universitaria",
    etnia: "mestizo",
    idiomas: [] as string[],
    vivesEn: "ciudad",
    defineteEnFrase: "",
    cuentanosAlgoTuyo: "",
    intereses: "",
    primeraCitaIdeal: "",
    
    // ===== RELACIONES =====
    // Hijos
    tieneHijos: "" as YesNoResponse,
    situacionHijos: "", // "no-viven" | "viven-conmigo" | "ya-adultos" | "no-seguro"
    quiereTenerHijos: "", // "no" | "si" | "no-seguro" | "lo-pensaria" | "adoptados" | "no-puedo"
    
    estadoCivil: "",
    queBuscas: [] as string[],
    razonPrincipal: "",
    tiempoEnPareja: "",
    casarseImportante: "",
    
    // Vehículo
    tieneVehiculo: "" as YesNoResponse,
    
    // Saldrías con fumador
    saldriasFumador: "",
    
    // ===== CULTURA =====
    // Pasatiempos (checkboxes múltiples)
    pasatiempos: [] as string[], // ["peliculas", "musica", "leer", etc.]
    generosPeliculas: [] as string[],
    generosMusica: [] as string[],
    generosLibros: [] as string[],
    
    ideasPoliticas: "",
    valoresTradicionales: "",
    espiritualidad: "",
    religion: "",
    conviccionesReligiosas: "",
    
    // ===== ESTILO DE VIDA =====
    // Qué haces normalmente
    queHaces: [] as string[], // ["cocinar", "deporte", "bailar", etc.]
    nivelCocinar: "", // Solo si marcó "cocinar"
    deportesPractica: [] as string[], // Solo si marcó "deporte"
    nivelBailar: "", // Solo si marcó "bailar"
    
    teEjercitas: "",
    
    // Fumas
    fumas: "" as YesNoResponse,
    frecuenciaFumar: "", // Solo si "fumas" = "si"
    
    // Bebes alcohol
    bebesAlcohol: "" as YesNoResponse,
    frecuenciaBeber: "", // Solo si "bebesAlcohol" = "si"
    
    // Usas drogas
    usasDrogas: "" as YesNoResponse,
    frecuenciaDrogas: "", // Solo si "usasDrogas" = "si"
    
    dietaEspecial: "",
    tiempoConFamilia: "",
    personalidadSociable: "",
    ordenMantenimiento: "",
    
    // ===== INFORMACIÓN PRIVADA =====
    escuelasPrivadasPublicas: "",
    tusPadresEstan: "",
    economicamenteIndependiente: "",
    nivelIngresos: "",
    importaNivelIngresosPareja: "",
    origenGeograficoPrivado: "", // "pueblo" | "ciudad"
    claseSocioeconomica: "", // "humilde" | "media" | "media-alta" | "alta"
    numeroHijos: "",
    ordenNacimiento: "",
    saldriasMasKilos: "",
    saldriasConHijos: "",
  });

  const categories = [
    { id: "algo-sobre-mi" as CategoryType, label: "Algo sobre mí", icon: "👤" },
    { id: "relaciones" as CategoryType, label: "Relaciones", icon: "💑" },
    { id: "cultura" as CategoryType, label: "Cultura", icon: "🎭" },
    { id: "estilo-vida" as CategoryType, label: "Estilo de vida", icon: "🏃" },
    { id: "informacion-privada" as CategoryType, label: "Información privada", icon: "🔒" },
  ];

  // ===== HANDLERS =====
  
  const handleYesNoChange = (field: keyof typeof formData, value: YesNoResponse) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields if changing to "no" or "no-respondo"
      ...(value !== "si" && {
        // Reset related fields based on the field being changed
        ...(field === "tieneHijos" && { situacionHijos: "" }),
        ...(field === "fumas" && { frecuenciaFumar: "" }),
        ...(field === "bebesAlcohol" && { frecuenciaBeber: "" }),
        ...(field === "usasDrogas" && { frecuenciaDrogas: "" }),
      })
    }));
  };

  const handleCheckboxChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value),
          // Reset dependent fields when unchecking
          ...(field === "pasatiempos" && value === "peliculas" && { generosPeliculas: [] }),
          ...(field === "pasatiempos" && value === "musica" && { generosMusica: [] }),
          ...(field === "pasatiempos" && value === "leer" && { generosLibros: [] }),
          ...(field === "queHaces" && value === "cocinar" && { nivelCocinar: "" }),
          ...(field === "queHaces" && value === "deporte" && { deportesPractica: [] }),
          ...(field === "queHaces" && value === "bailar" && { nivelBailar: "" }),
        };
      }
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ===== RENDER HELPERS =====

  // TIPO A: Pregunta Sí/No/No respondo + Selector condicional
  const renderYesNoField = (
    label: string,
    field: keyof typeof formData,
    selectorContent?: React.ReactNode
  ) => {
    const value = formData[field] as YesNoResponse;
    
    return (
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-300 mb-3">{label}</p>
        <div className="flex gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "no-respondo"}
              onChange={() => handleYesNoChange(field, "no-respondo")}
              className="w-4 h-4 text-neon-green bg-forest-dark border-gray-600 focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">No respondo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "no"}
              onChange={() => handleYesNoChange(field, "no")}
              className="w-4 h-4 text-neon-green bg-forest-dark border-gray-600 focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">No</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={field}
              checked={value === "si"}
              onChange={() => handleYesNoChange(field, "si")}
              className="w-4 h-4 text-neon-green bg-forest-dark border-gray-600 focus:ring-neon-green"
            />
            <span className="text-sm text-gray-300">Sí</span>
          </label>
        </div>
        
        {/* Selector condicional aparece solo si "Sí" */}
        {value === "si" && selectorContent && (
          <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-3">
            {selectorContent}
          </div>
        )}
      </div>
    );
  };

  // TIPO B: Selector directo (sin Sí/No)
  const renderSelectField = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => {
    const value = formData[field] as string;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green focus:ring-1 focus:ring-neon-green"
        >
          <option value="">Selecciona una opción</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {value && (
          <div className="mt-3 text-sm text-gray-400">
            → {options.find(o => o.value === value)?.label}
          </div>
        )}
      </div>
    );
  };

  // TIPO C: Checkboxes múltiples
  const renderCheckboxes = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => {
    const values = formData[field] as string[];
    
    return (
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-300 mb-3">{label}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.includes(opt.value)}
                onChange={(e) => handleCheckboxChange(field, opt.value, e.target.checked)}
                className="w-4 h-4 text-neon-green bg-forest-dark border-gray-600 rounded focus:ring-neon-green"
              />
              <span className="text-sm text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // TIPO D: Input numérico o textarea
  const renderInputField = (
    label: string,
    field: keyof typeof formData,
    type: "number" | "text" | "textarea" = "text",
    placeholder?: string,
    suffix?: string
  ) => {
    const value = formData[field] as string;
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        {type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[100px] bg-forest-dark border border-gray-600 text-gray-200 focus:border-neon-green"
            rows={4}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <Input
              type={type}
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-forest-dark border border-gray-600 text-gray-200 focus:border-neon-green"
            />
            {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
          </div>
        )}
      </div>
    );
  };

  // ===== RENDER CONTENT POR CATEGORÍA =====

  const renderContent = () => {
    switch (activeCategory) {
      case "algo-sobre-mi":
        return (
          <div className="space-y-6">
            {/* Apariencia física */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Apariencia física</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInputField("Altura", "altura", "number", "175", "cm")}
                {renderInputField("Peso", "peso", "number", "70", "kg")}
              </div>

              {renderSelectField("Tipo de cuerpo", "tipoCuerpo", [
                { value: "delgado", label: "Delgado/a" },
                { value: "atletico", label: "Atlético/a" },
                { value: "promedio", label: "Promedio" },
                { value: "robusto", label: "Robusto/a" },
              ])}

              {renderSelectField("Color de ojos", "colorOjos", [
                { value: "negros", label: "Negros" },
                { value: "marrones", label: "Marrones" },
                { value: "azules", label: "Azules" },
                { value: "verdes", label: "Verdes" },
                { value: "grises", label: "Grises" },
                { value: "otro", label: "Otro" },
              ])}

              {renderSelectField("Color de cabello", "colorCabello", [
                { value: "negro", label: "Negro" },
                { value: "castano", label: "Castaño" },
                { value: "rubio", label: "Rubio" },
                { value: "pelirrojo", label: "Pelirrojo" },
                { value: "gris", label: "Gris/Blanco" },
                { value: "otro", label: "Otro" },
              ])}
            </div>

            {/* Educación y origen */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Educación y origen</h3>

              {renderSelectField("Educación", "educacion", [
                { value: "basica", label: "Básica" },
                { value: "secundaria", label: "Secundaria" },
                { value: "tecnica", label: "Técnica" },
                { value: "universitaria", label: "Universitaria" },
                { value: "postgrado", label: "Postgrado" },
              ])}

              {renderSelectField("Etnia", "etnia", [
                { value: "blanco", label: "Blanco/a (Caucásico/a)" },
                { value: "afro", label: "Afro/Negro/a" },
                { value: "asiatico", label: "Asiático/a" },
                { value: "mestizo", label: "Mestizo/a" },
                { value: "indigena", label: "Indígena" },
                { value: "arabe", label: "Árabe/Turco/a" },
                { value: "otro", label: "Otro" },
              ])}

              {renderSelectField("¿Vives en ciudad o campo?", "vivesEn", [
                { value: "ciudad", label: "Ciudad" },
                { value: "campo", label: "Campo" },
              ])}
            </div>

            {/* Presentación personal */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Presentación personal</h3>

              {renderInputField("Defínete en una frase", "defineteEnFrase", "textarea", "Ej: Una persona sincera, alegre y aventurera")}
              {renderInputField("Cuéntanos algo tuyo", "cuentanosAlgoTuyo", "textarea", "Comparte algo interesante sobre ti...")}
              {renderInputField("Intereses (separados con una coma)", "intereses", "text", "Ej: Fotografía, viajar, cocina italiana")}
              {renderInputField("¿Cómo sería tu primera cita ideal?", "primeraCitaIdeal", "textarea", "Describe tu cita ideal...")}
            </div>
          </div>
        );

      case "relaciones":
        return (
          <div className="space-y-6">
            {/* Hijos */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Hijos</h3>

              {renderYesNoField(
                "¿Tienes hijos?",
                "tieneHijos",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">Especifica tu situación:</p>
                  <select
                    value={formData.situacionHijos}
                    onChange={(e) => handleInputChange("situacionHijos", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="no-viven">Sí, pero no viven en mi casa</option>
                    <option value="viven-conmigo">Sí, y viven conmigo en la casa</option>
                    <option value="ya-adultos">Sí, pero ya son adultos</option>
                    <option value="no-seguro">No estoy seguro</option>
                  </select>
                  {formData.situacionHijos && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.situacionHijos === "no-viven" && "Sí, pero no viven en mi casa"}
                      {formData.situacionHijos === "viven-conmigo" && "Sí, y viven conmigo en la casa"}
                      {formData.situacionHijos === "ya-adultos" && "Sí, pero ya son adultos"}
                      {formData.situacionHijos === "no-seguro" && "No estoy seguro"}
                    </div>
                  )}
                </>
              )}

              {renderSelectField(
                formData.tieneHijos === "si" ? "¿Quieres tener más hijos?" : "¿Quieres tener hijos?",
                "quiereTenerHijos",
                [
                  { value: "no", label: "No" },
                  { value: "si", label: "Sí" },
                  { value: "no-seguro", label: "No estoy seguro" },
                  { value: "lo-pensaria", label: "Lo pensaría / Abierto a futuro" },
                  { value: "adoptados", label: "Sí, aunque serían adoptados" },
                  { value: "no-puedo", label: "No puedo tener hijos" },
                ]
              )}
            </div>

            {/* Estado civil */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Estado civil</h3>

              {renderSelectField("Estado civil", "estadoCivil", [
                { value: "no-respondo", label: "Prefiero no responder" },
                { value: "soltero", label: "Soltero/a" },
                { value: "divorciado", label: "Divorciado/a" },
                { value: "separado", label: "Separado/a" },
                { value: "viudo", label: "Viudo/a" },
                { value: "en-relacion", label: "En relación" },
                { value: "viviendo-pareja", label: "Viviendo en pareja" },
                { value: "casado", label: "Casado/a" },
              ])}
            </div>

            {/* Expectativas */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Expectativas</h3>

              {renderCheckboxes("¿Qué estás buscando? (puedes marcar varios)", "queBuscas", [
                { value: "pareja-seria", label: "Pareja seria" },
                { value: "aventuras", label: "Aventuras sin compromiso" },
                { value: "amistad", label: "Amistad" },
                { value: "conocer-gente", label: "Conocer gente nueva" },
                { value: "no-seguro", label: "No estoy seguro" },
              ])}

              {renderSelectField("¿Razón PRINCIPAL por la que quieres tener pareja?", "razonPrincipal", [
                { value: "familia-futuro", label: "Para formar una familia y planear un futuro" },
                { value: "acompanado", label: "Para sentirme acompañado/a y pasarla bien" },
                { value: "no-seguro", label: "No estoy seguro / No sé muy bien para qué" },
              ])}

              {renderSelectField("¿Cómo te gusta administrar tu tiempo en pareja?", "tiempoEnPareja", [
                { value: "mayoria-compania", label: "Me encanta pasar la mayoría del tiempo en compañía" },
                { value: "equilibrio", label: "Necesito mi espacio y negociar un equilibrio" },
              ])}

              {renderSelectField("¿Casarse es importante?", "casarseImportante", [
                { value: "si-importante", label: "Sí, es importante, me gustaría casarme en el futuro" },
                { value: "no-tan-importante", label: "No es tan importante, vivir juntos sería suficiente" },
                { value: "no-seguro", label: "No estoy seguro" },
              ])}
            </div>

            {/* Otros */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Otros</h3>

              {renderYesNoField("¿Tienes vehículo propio?", "tieneVehiculo")}

              {renderSelectField("¿Saldrías con alguien que fuma?", "saldriasFumador", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "si-prefiero", label: "Sí, y prefiero que fume" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}
            </div>
          </div>
        );

      case "cultura":
        return (
          <div className="space-y-6">
            {/* Pasatiempos */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">¿Cuáles son tus pasatiempos?</h3>

              {renderCheckboxes("Marca los que te gusten:", "pasatiempos", [
                { value: "peliculas", label: "Películas" },
                { value: "musica", label: "Música" },
                { value: "leer", label: "Leer" },
                { value: "deporte", label: "Deporte" },
                { value: "viajar", label: "Viajar" },
                { value: "fotografia", label: "Fotografía" },
              ])}

              {/* Expansión para Películas */}
              {formData.pasatiempos.includes("peliculas") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de películas te gustan?</p>
                  {renderCheckboxes("", "generosPeliculas", [
                    { value: "accion", label: "Acción" },
                    { value: "comedia", label: "Comedia" },
                    { value: "drama", label: "Drama" },
                    { value: "horror", label: "Horror" },
                    { value: "scifi", label: "Ciencia ficción" },
                    { value: "romance", label: "Romance" },
                    { value: "documentales", label: "Documentales" },
                  ])}
                </div>
              )}

              {/* Expansión para Música */}
              {formData.pasatiempos.includes("musica") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué géneros musicales te gustan?</p>
                  {renderCheckboxes("", "generosMusica", [
                    { value: "rock", label: "Rock" },
                    { value: "pop", label: "Pop" },
                    { value: "jazz", label: "Jazz" },
                    { value: "blues", label: "Blues" },
                    { value: "clasica", label: "Clásica" },
                    { value: "electronica", label: "Electrónica" },
                    { value: "reggaeton", label: "Reggaetón" },
                    { value: "salsa", label: "Salsa" },
                  ])}
                </div>
              )}

              {/* Expansión para Leer */}
              {formData.pasatiempos.includes("leer") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de libros lees?</p>
                  {renderCheckboxes("", "generosLibros", [
                    { value: "fantasia", label: "Fantasía" },
                    { value: "ciencia-ficcion", label: "Ciencia ficción" },
                    { value: "historico", label: "Histórico" },
                    { value: "biografias", label: "Biografías" },
                    { value: "autoayuda", label: "Autoayuda" },
                    { value: "novelas", label: "Novelas" },
                  ])}
                </div>
              )}
            </div>

            {/* Ideas y valores */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Ideas y valores</h3>

              {renderSelectField("Ideas políticas", "ideasPoliticas", [
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "ultra-conservador", label: "Ultra Conservador" },
                { value: "conservador", label: "Conservador" },
                { value: "centro", label: "Centro" },
                { value: "liberal", label: "Liberal" },
                { value: "muy-liberal", label: "Muy Liberal" },
                { value: "otro", label: "Otro punto de vista" },
              ])}

              {renderSelectField("¿Eres una persona de valores tradicionales?", "valoresTradicionales", [
                { value: "bastante", label: "Bastante, me gusta aferrarme a las tradiciones" },
                { value: "tradicional-abierto", label: "Soy tradicional, pero de mente abierta" },
                { value: "poco", label: "Poco tradicional... prefiero mi propio camino" },
              ])}

              {renderSelectField("¿Te interesa la espiritualidad?", "espiritualidad", [
                { value: "si-bastante", label: "Sí, bastante" },
                { value: "mas-o-menos", label: "Más o menos" },
                { value: "muy-poco", label: "Muy poco" },
              ])}
            </div>

            {/* Religión */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Religión</h3>

              {renderSelectField("Religión", "religion", [
                { value: "catolico", label: "Católico" },
                { value: "cristiano", label: "Cristiano" },
                { value: "protestante", label: "Protestante" },
                { value: "ortodoxo", label: "Ortodoxo" },
                { value: "musulman", label: "Musulmán" },
                { value: "judio", label: "Judío" },
                { value: "budista", label: "Budista" },
                { value: "hindu", label: "Hindú" },
                { value: "ateo", label: "Ateo" },
                { value: "agnostico", label: "Agnóstico" },
                { value: "otro", label: "Otro" },
              ])}

              {renderSelectField("Convicciones religiosas", "conviccionesReligiosas", [
                { value: "bastante-religioso", label: "Me considero bastante religioso" },
                { value: "creyente-relajado", label: "Creyente... pero relajado" },
                { value: "no-creyente", label: "No soy creyente, ni religioso" },
              ])}
            </div>
          </div>
        );

      case "estilo-vida":
        return (
          <div className="space-y-6">
            {/* Qué haces normalmente */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">¿Qué haces normalmente?</h3>

              {renderCheckboxes("Marca tus actividades:", "queHaces", [
                { value: "cocinar", label: "Cocinar" },
                { value: "deporte", label: "Deporte" },
                { value: "bailar", label: "Bailar" },
                { value: "leer", label: "Leer" },
                { value: "cine", label: "Ir al cine" },
                { value: "viajar", label: "Viajar" },
              ])}

              {/* Expansión para Cocinar */}
              {formData.queHaces.includes("cocinar") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Cuánto te gusta cocinar?</p>
                  <select
                    value={formData.nivelCocinar}
                    onChange={(e) => handleInputChange("nivelCocinar", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="solo-necesario">Solo lo necesario</option>
                    <option value="me-gusta">Me gusta</option>
                    <option value="me-encanta">Me encanta</option>
                    <option value="chef">Soy chef / Profesional</option>
                  </select>
                  {formData.nivelCocinar && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.nivelCocinar === "solo-necesario" && "Solo lo necesario"}
                      {formData.nivelCocinar === "me-gusta" && "Me gusta"}
                      {formData.nivelCocinar === "me-encanta" && "Me encanta"}
                      {formData.nivelCocinar === "chef" && "Soy chef / Profesional"}
                    </div>
                  )}
                </div>
              )}

              {/* Expansión para Deporte */}
              {formData.queHaces.includes("deporte") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué deportes practicas?</p>
                  {renderCheckboxes("", "deportesPractica", [
                    { value: "futbol", label: "Fútbol" },
                    { value: "basketball", label: "Basketball" },
                    { value: "natacion", label: "Natación" },
                    { value: "yoga", label: "Yoga" },
                    { value: "ciclismo", label: "Ciclismo" },
                    { value: "gym", label: "Gimnasio" },
                  ])}
                </div>
              )}

              {/* Expansión para Bailar */}
              {formData.queHaces.includes("bailar") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Cuánto te gusta bailar?</p>
                  <select
                    value={formData.nivelBailar}
                    onChange={(e) => handleInputChange("nivelBailar", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="me-encanta">Me encanta</option>
                    <option value="frecuentemente">Frecuentemente</option>
                    <option value="de-vez-cuando">De vez en cuando</option>
                  </select>
                  {formData.nivelBailar && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.nivelBailar === "me-encanta" && "Me encanta"}
                      {formData.nivelBailar === "frecuentemente" && "Frecuentemente"}
                      {formData.nivelBailar === "de-vez-cuando" && "De vez en cuando"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Salud y hábitos */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Salud y hábitos</h3>

              {renderSelectField("¿Te ejercitas físicamente?", "teEjercitas", [
                { value: "diariamente", label: "Diariamente" },
                { value: "semanalmente", label: "Semanalmente" },
                { value: "rara-vez", label: "Rara vez" },
                { value: "nunca", label: "Nunca" },
              ])}

              {renderYesNoField(
                "¿Fumas?",
                "fumas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaFumar}
                    onChange={(e) => handleInputChange("frecuenciaFumar", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="diariamente">Diariamente</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="socialmente">Socialmente</option>
                  </select>
                  {formData.frecuenciaFumar && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.frecuenciaFumar === "diariamente" && "Diariamente"}
                      {formData.frecuenciaFumar === "ocasionalmente" && "Ocasionalmente"}
                      {formData.frecuenciaFumar === "socialmente" && "Socialmente"}
                    </div>
                  )}
                </>
              )}

              {renderYesNoField(
                "¿Bebes alcohol?",
                "bebesAlcohol",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaBeber}
                    onChange={(e) => handleInputChange("frecuenciaBeber", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="diariamente">Diariamente</option>
                    <option value="semanalmente">Semanalmente</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="socialmente">Socialmente</option>
                  </select>
                  {formData.frecuenciaBeber && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.frecuenciaBeber === "diariamente" && "Diariamente"}
                      {formData.frecuenciaBeber === "semanalmente" && "Semanalmente"}
                      {formData.frecuenciaBeber === "ocasionalmente" && "Ocasionalmente"}
                      {formData.frecuenciaBeber === "socialmente" && "Socialmente"}
                    </div>
                  )}
                </>
              )}

              {renderYesNoField(
                "¿Usas drogas?",
                "usasDrogas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Con qué frecuencia?</p>
                  <select
                    value={formData.frecuenciaDrogas}
                    onChange={(e) => handleInputChange("frecuenciaDrogas", e.target.value)}
                    className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green"
                  >
                    <option value="">Selecciona...</option>
                    <option value="ocasionalmente">Ocasionalmente</option>
                    <option value="regularmente">Regularmente</option>
                  </select>
                  {formData.frecuenciaDrogas && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.frecuenciaDrogas === "ocasionalmente" && "Ocasionalmente"}
                      {formData.frecuenciaDrogas === "regularmente" && "Regularmente"}
                    </div>
                  )}
                </>
              )}

              {renderSelectField("¿Dieta o alimentación especial?", "dietaEspecial", [
                { value: "ninguna", label: "Ninguna alimentación en especial" },
                { value: "vegetariana", label: "Vegetariana" },
                { value: "vegana", label: "Vegana" },
                { value: "kosher", label: "Kosher" },
                { value: "halal", label: "Halal" },
                { value: "otra", label: "Otra" },
              ])}
            </div>

            {/* Personalidad y costumbres */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Personalidad y costumbres</h3>

              {renderSelectField("¿Te gusta pasar tiempo con familiares?", "tiempoConFamilia", [
                { value: "si-encanta", label: "Sí, me encanta, soy súper familiero/a" },
                { value: "ocasionalmente", label: "Ocasionalmente, de vez en cuando" },
                { value: "no-familiero", label: "Francamente... no soy muy familiero" },
              ])}

              {renderSelectField("¿Eres de personalidad sociable?", "personalidadSociable", [
                { value: "extrovertido", label: "Sí, soy bastante extrovertido y sociable" },
                { value: "algo-timido", label: "Soy algo tímido/a, pero igual me gusta socializar" },
                { value: "desgastante", label: "Me resulta desgastante... odio hacer sociales" },
              ])}

              {renderSelectField("Orden y mantenimiento", "ordenMantenimiento", [
                { value: "impecable", label: "Me encanta mantener todo lo más impecable posible" },
                { value: "orden-sin-exagerar", label: "Me gusta mantener el orden, pero sin exagerar" },
                { value: "relajado", label: "Soy relajado, ordeno ocasionalmente" },
                { value: "muy-relajado", label: "Soy muy relajado, no ordeno casi nunca" },
              ])}
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
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Educación</h3>
              </div>

              {renderSelectField("¿Estudiaste en escuelas privadas o públicas?", "escuelasPrivadasPublicas", [
                { value: "publicas", label: "Escuelas públicas" },
                { value: "privadas", label: "Escuelas privadas" },
                { value: "mezcla", label: "Mezcla de públicas y privadas" },
                { value: "en-casa", label: "Educación en casa" },
                { value: "alternativa", label: "Educación alternativa" },
              ])}
            </div>

            {/* Familia */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Familia</h3>
              </div>

              {renderSelectField("Tus padres están...", "tusPadresEstan", [
                { value: "aun-casados", label: "Aún casados" },
                { value: "divorciados", label: "Divorciados" },
                { value: "separados", label: "Separados" },
                { value: "uno-muerto", label: "Uno ha muerto" },
                { value: "ambos-murieron", label: "Ambos murieron" },
                { value: "no-estan-juntos", label: "No están juntos" },
              ])}

              {renderSelectField("Orden de nacimiento", "ordenNacimiento", [
                { value: "primero", label: "Primero" },
                { value: "segundo", label: "Segundo" },
                { value: "tercero", label: "Tercero" },
                { value: "cuarto", label: "Cuarto" },
                { value: "quinto-mas", label: "Quinto o más" },
                { value: "unico", label: "Único hijo" },
              ])}
            </div>

            {/* Situación económica */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Situación económica</h3>
              </div>

              {renderSelectField("¿Eres económicamente independiente?", "economicamenteIndependiente", [
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
                { value: "mas-o-menos", label: "Más o menos" },
              ])}

              {renderSelectField("¿Cuál es tu nivel de ingresos actual?", "nivelIngresos", [
                { value: "no-tengo", label: "No tengo ingresos" },
                { value: "menores", label: "Ingresos menores que un salario básico" },
                { value: "similares", label: "Ingresos similares que un salario básico" },
                { value: "mayores", label: "Ingresos mayores que un salario básico" },
                { value: "mucho-mayores", label: "Ingresos mucho mayores que un salario básico" },
              ])}

              {renderSelectField("¿Es importante que tu pareja tenga tu mismo nivel de ingresos?", "importaNivelIngresosPareja", [
                { value: "no-importante", label: "No es importante" },
                { value: "escalon-cercano", label: "Es importante que al menos esté en un escalón cercano" },
                { value: "mismo-nivel", label: "Tiene que estar en el mismo nivel o más que yo" },
              ])}
            </div>

            {/* Orígenes */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Orígenes</h3>
              </div>

              {renderSelectField("¿De dónde provienes?", "origenGeograficoPrivado", [
                { value: "pueblo", label: "Vida de pueblo" },
                { value: "ciudad", label: "Vida de ciudad" },
              ])}

              {renderSelectField("¿Cuáles son tus orígenes socio-económicos?", "claseSocioeconomica", [
                { value: "clase-humilde", label: "Provengo de una familia de clase humilde" },
                { value: "clase-media", label: "Provengo de una familia de clase media" },
                { value: "clase-media-alta", label: "Provengo de una familia de clase media-alta" },
                { value: "clase-alta", label: "Provengo de una familia de clase alta" },
              ])}
            </div>

            {/* Saldrías con alguien que... (privado) */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Saldrías con alguien que...</h3>
              </div>

              {renderSelectField("¿Saldrías con alguien con unos kilos de más o de talla grande?", "saldriasMasKilos", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "si-prefiero", label: "Sí, y prefiero que sea así" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Saldrías con alguien que tiene hijos?", "saldriasConHijos", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "depende-cuantos", label: "Depende cuántos" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSaveAll = () => {
    console.log("Guardando todos los datos:", formData);
    // TODO: Enviar a API/backend
    alert("Perfil guardado correctamente");
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

              {/* Botón Guardar Todo */}
              <div className="mt-6">
                <Button
                  onClick={handleSaveAll}
                  className="w-full bg-neon-green text-forest-dark hover:brightness-110 shadow-lg shadow-neon-green/30"
                >
                  💾 Guardar todo
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
