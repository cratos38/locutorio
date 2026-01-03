"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryType = "algo-sobre-mi" | "relaciones" | "cultura" | "estilo-vida" | "informacion-privada";

// Tipo para respuestas Sí/No/No respondo
type YesNoResponse = "no-respondo" | "no" | "si" | "";

export default function AjustesPerfilPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CategoryType | null;
  
  const [activeCategory, setActiveCategory] = useState<CategoryType>(
    tabParam || "algo-sobre-mi"
  );
  
  // Estado para navegación de fotos
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Cambiar categoría si cambia el parámetro tab
  useEffect(() => {
    if (tabParam && tabParam !== activeCategory) {
      setActiveCategory(tabParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabParam, activeCategory]);
  
  // Función para cambiar de categoría y hacer scroll al inicio
  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // ===== ALGO SOBRE MÍ =====
    altura: "175",
    peso: "70",
    tipoCuerpo: "atletico",
    tipoCuerpoOtro: "", // Si selecciona "otro"
    colorOjos: "marrones",
    colorOjosOtro: "", // Si selecciona "otro"
    colorCabello: "negro",
    colorCabelloOtro: "", // Si selecciona "otro"
    signoZodiacal: "",
    educacion: "universitaria",
    educacionOtra: "", // Si selecciona "otros"
    etnia: "mestizo",
    etniaOtra: "", // Si selecciona "otro"
    idiomas: [] as string[],
    vivesEn: "ciudad",
    
    // Trabajo
    trabajas: "" as YesNoResponse,
    enQueTrabaja: "", // Solo si "trabajas" = "si"
    
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
    queBuscas: [] as string[], // + "charlar-alguien"
    razonPrincipal: "",
    tiempoEnPareja: "",
    casarseImportante: "",
    duracionRelacionLarga: "", // NUEVO
    
    // Vehículo
    tieneVehiculo: "" as YesNoResponse,
    
    // Mascotas - NUEVO
    tieneMascota: "", // "no" | "perro" | "gato" | "perro-gato" | "pajaro" | "otro"
    tieneMascotaOtra: "", // Si selecciona "otro"
    
    // Idiomas - NUEVO
    hablaOtroIdioma: [] as string[],
    
    // ===== CULTURA =====
    // Pasatiempos (checkboxes múltiples) - AMPLIADO
    pasatiempos: [] as string[], // 30+ actividades
    generosPeliculas: [] as string[], // 16 géneros
    generosMusica: [] as string[], // 30 géneros
    generosLibros: [] as string[], // 18 tipos
    deportesPractica: [] as string[], // 30 deportes (MOVIDO AQUÍ desde estilo de vida)
    
    ideasPoliticas: "",
    valoresTradicionales: "",
    espiritualidad: "",
    religion: "",
    religionOtra: "", // Si selecciona "otro"
    conviccionesReligiosas: "",
    
    // ===== ESTILO DE VIDA =====
    // Qué haces normalmente
    queHaces: [] as string[], // ["cocinar", "deporte", "bailar", etc.]
    nivelCocinar: "", // Solo si marcó "cocinar"
    nivelBailar: "", // Solo si marcó "bailar"
    
    teEjercitas: "",
    eresAmbicioso: "", // NUEVO: super-ambicioso | ambicioso | algo-ambicioso | no-ambicioso
    
    // Fumas
    fumas: "" as YesNoResponse,
    frecuenciaFumar: "", // Solo si "fumas" = "si"
    
    // Saldrías con fumador - MOVIDO AQUÍ
    saldriasFumador: "",
    
    // Bebes alcohol
    bebesAlcohol: "" as YesNoResponse,
    frecuenciaBeber: "", // Solo si "bebesAlcohol" = "si"
    
    // Saldrías con bebedor - NUEVO
    saldriasBebedor: "",
    
    // Usas drogas
    usasDrogas: "" as YesNoResponse,
    frecuenciaDrogas: "", // Solo si "usasDrogas" = "si"
    
    dietaEspecial: "", // ACTUALIZADO: separar alimentación vs dietas
    dietaEspecialOtra: "", // Si selecciona "otro"
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
    
    // ===== FOTOS =====
    fotos: [] as { id: string; url: string; esPrincipal: boolean; estado: 'pendiente' | 'aprobada' | 'rechazada' }[],
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
        ...(field === "trabajas" && { enQueTrabaja: "" }),
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
          ...(field === "pasatiempos" && value === "deporte" && { deportesPractica: [] }),
          ...(field === "queHaces" && value === "cocinar" && { nivelCocinar: "" }),
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
    options: { value: string; label: string }[],
    otroField?: keyof typeof formData // Campo para "Otro" descripción
  ) => {
    const value = formData[field] as string;
    const otroValue = otroField ? (formData[otroField] as string) : "";
    
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
        
        {/* Input de texto si selecciona "otro" */}
        {value === "otro" && otroField && (
          <div className="mt-3">
            <Input
              type="text"
              value={otroValue}
              onChange={(e) => handleInputChange(otroField, e.target.value)}
              placeholder="Especifica..."
              className="w-full bg-forest-dark border border-neon-green/50 text-gray-200 focus:border-neon-green"
            />
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

  // TIPO E: Multi-select (selector con múltiples opciones usando Ctrl/Cmd)
  const renderMultiSelect = (
    label: string,
    field: keyof typeof formData,
    options: { value: string; label: string }[]
  ) => {
    const values = formData[field] as string[];
    
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {label}
        </label>
        <select
          multiple
          value={values}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            handleInputChange(field, selectedOptions);
          }}
          className="w-full px-4 py-2 bg-forest-dark border border-gray-600 rounded-lg text-gray-200 focus:border-neon-green min-h-[200px]"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-2">
          💡 Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar varios idiomas
        </p>
        
        {/* Mostrar seleccionados */}
        {values.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-400 mb-2">Idiomas seleccionados:</p>
            <div className="flex flex-wrap gap-2">
              {values.map(val => {
                const option = options.find(opt => opt.value === val);
                return option ? (
                  <span key={val} className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm border border-neon-green/30">
                    {option.label}
                  </span>
                ) : null;
              })}
            </div>
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
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "delgado", label: "Delgado/a" },
                { value: "atletico", label: "Atlético/a" },
                { value: "punto-medio", label: "Punto medio" },
                { value: "curvas-extra", label: "Algunas curvas extra" },
                { value: "talla-grande", label: "De talla grande" },
                { value: "grande-robusto", label: "Grande y robusto/a" },
              ], "tipoCuerpoOtro")}

              {renderSelectField("Color de ojos", "colorOjos", [
                { value: "negros", label: "Negros" },
                { value: "marrones", label: "Marrones" },
                { value: "azules", label: "Azules" },
                { value: "verdes", label: "Verdes" },
                { value: "grises", label: "Grises" },
                { value: "otro", label: "Otro" },
              ], "colorOjosOtro")}

              {renderSelectField("Color de cabello", "colorCabello", [
                { value: "negro", label: "Negro" },
                { value: "castano", label: "Castaño" },
                { value: "rubio", label: "Rubio" },
                { value: "pelirrojo", label: "Pelirrojo" },
                { value: "gris", label: "Gris/Blanco" },
                { value: "otro", label: "Otro" },
              ], "colorCabelloOtro")}

              {renderSelectField("Signo zodiacal", "signoZodiacal", [
                { value: "aries", label: "Aries" },
                { value: "tauro", label: "Tauro" },
                { value: "geminis", label: "Géminis" },
                { value: "cancer", label: "Cáncer" },
                { value: "leo", label: "Leo" },
                { value: "virgo", label: "Virgo" },
                { value: "libra", label: "Libra" },
                { value: "escorpio", label: "Escorpio" },
                { value: "sagitario", label: "Sagitario" },
                { value: "capricornio", label: "Capricornio" },
                { value: "acuario", label: "Acuario" },
                { value: "piscis", label: "Piscis" },
              ])}
            </div>

            {/* Educación y trabajo */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Educación y trabajo</h3>

              {renderSelectField("Educación", "educacion", [
                { value: "primario", label: "Primario" },
                { value: "secundario", label: "Secundario" },
                { value: "algunos-terciarios", label: "Algunos estudios terciarios" },
                { value: "graduado-terciario", label: "Graduado terciario" },
                { value: "algunos-universitarios", label: "Algunos estudios universitarios" },
                { value: "graduado-universitario", label: "Graduado universitario" },
                { value: "posgrado-universitario", label: "Posgrado universitario" },
                { value: "otro", label: "Otros" },
              ], "educacionOtra")}

              {renderYesNoField(
                "¿Trabajas?",
                "trabajas",
                <>
                  <p className="text-sm font-medium text-gray-300 mb-3">¿En qué trabajas?</p>
                  <Input
                    type="text"
                    value={formData.enQueTrabaja}
                    onChange={(e) => handleInputChange("enQueTrabaja", e.target.value)}
                    placeholder="Ej: Ingeniero de software, Profesor, Comerciante..."
                    className="w-full bg-forest-dark border border-gray-600 text-gray-200 focus:border-neon-green"
                  />
                  {formData.enQueTrabaja && (
                    <div className="mt-3 text-sm text-gray-400">
                      → {formData.enQueTrabaja}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Origen */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Origen</h3>

              {renderSelectField("Etnia", "etnia", [
                { value: "blanco", label: "Blanco/a (Caucásico/a)" },
                { value: "afro", label: "Afro/Negro/a" },
                { value: "asiatico", label: "Asiático/a" },
                { value: "mestizo", label: "Mestizo/a" },
                { value: "indigena", label: "Indígena" },
                { value: "arabe", label: "Árabe/Turco/a" },
                { value: "otro", label: "Otro" },
              ], "etniaOtra")}

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
                { value: "charlar-alguien", label: "Charlar con alguien" },
                { value: "conocer-gente", label: "Conocer gente nueva" },
                { value: "no-seguro", label: "No estoy seguro" },
              ])}

              {renderSelectField("¿Razón PRINCIPAL por la que quieres tener pareja?", "razonPrincipal", [
                { value: "familia-futuro", label: "Para formar una familia y planear un futuro" },
                { value: "acompanado", label: "Para sentirme acompañado/a y pasarla bien" },
                { value: "no-seguro", label: "No estoy seguro / No sé muy bien para qué" },
              ])}

              {renderSelectField("¿Cómo te gusta administrar tu tiempo en pareja?", "tiempoEnPareja", [
                { value: "mayoria-compania", label: "Me encanta pasar la mayoría del tiempo en compañía de mi pareja" },
                { value: "equilibrio", label: "Necesito mi espacio y que negociemos un equilibrio entre tiempo en pareja y tiempo personal" },
              ])}

              {renderSelectField("¿Casarse es importante?", "casarseImportante", [
                { value: "si-importante", label: "Sí, es importante, me gustaría casarme en el futuro" },
                { value: "no-tan-importante", label: "No es tan importante, vivir juntos sería suficiente" },
                { value: "futuro-dira", label: "Futuro lo dirá" },
              ])}

              {renderSelectField("¿Cuánto duró la relación más larga que has tenido?", "duracionRelacionLarga", [
                { value: "menos-1", label: "Menos de 1 año" },
                { value: "mas-1", label: "Más de 1 año" },
                { value: "mas-2", label: "Más de 2 años" },
                { value: "mas-3", label: "Más de 3 años" },
                { value: "mas-4", label: "Más de 4 años" },
                { value: "mas-5", label: "Más de 5 años" },
                { value: "mas-6", label: "Más de 6 años" },
                { value: "mas-7", label: "Más de 7 años" },
                { value: "mas-8", label: "Más de 8 años" },
                { value: "mas-9", label: "Más de 9 años" },
                { value: "mas-10", label: "Más de 10 años" },
              ])}
            </div>

            {/* Otros */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Otros</h3>

              {renderYesNoField("¿Tienes vehículo propio?", "tieneVehiculo")}

              {renderSelectField("¿Tienes mascota?", "tieneMascota", [
                { value: "no", label: "No" },
                { value: "perro", label: "Perro" },
                { value: "gato", label: "Gato" },
                { value: "perro-gato", label: "Perro y gato" },
                { value: "pajaro", label: "Pájaro" },
                { value: "otro", label: "Otro" },
              ], "tieneMascotaOtra")}

              {renderMultiSelect("¿Hablas otro idioma?", "hablaOtroIdioma", [
                { value: "ninguno", label: "Ningún otro idioma" },
                { value: "arabe", label: "Árabe" },
                { value: "chino", label: "Chino" },
                { value: "holandes", label: "Holandés" },
                { value: "ingles", label: "Inglés" },
                { value: "frances", label: "Francés" },
                { value: "aleman", label: "Alemán" },
                { value: "hebreo", label: "Hebreo" },
                { value: "hindi", label: "Hindi" },
                { value: "italiano", label: "Italiano" },
                { value: "japones", label: "Japonés" },
                { value: "noruego", label: "Noruego" },
                { value: "portugues", label: "Portugués" },
                { value: "ruso", label: "Ruso" },
                { value: "espanol", label: "Español" },
                { value: "sueco", label: "Sueco" },
                { value: "tagalog", label: "Tagalog" },
                { value: "urdu", label: "Urdu" },
                { value: "otro", label: "Otro" },
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
                { value: "arquitectura", label: "Arquitectura" },
                { value: "tuning-coches", label: "Tuning de coches" },
                { value: "viajes", label: "Viajes" },
                { value: "automovilismo", label: "Automovilismo deportivo" },
                { value: "historia", label: "Historia" },
                { value: "teatro", label: "Teatro" },
                { value: "fotografia", label: "Fotografía" },
                { value: "juegos", label: "Juegos (PC, PS, Xbox)" },
                { value: "cria-animales", label: "Cría de animales" },
                { value: "cine", label: "Cine" },
                { value: "conciertos", label: "Conciertos" },
                { value: "pintura", label: "Pintura" },
                { value: "modelismo", label: "Modelismo" },
                { value: "moda", label: "Moda" },
                { value: "monumentos", label: "Monumentos" },
                { value: "museos", label: "Museos" },
                { value: "caza", label: "Caza" },
                { value: "pesca", label: "Pesca" },
                { value: "canto", label: "Canto" },
                { value: "costura", label: "Costura" },
                { value: "ganchillo", label: "Ganchillo" },
                { value: "baile", label: "Baile" },
                { value: "senderismo", label: "Senderismo" },
                { value: "cocina-reposteria", label: "Cocina-repostería" },
                { value: "jardineria", label: "Jardinería-cultivo" },
                { value: "vida-saludable", label: "Estilo de vida saludable" },
                { value: "otros", label: "Otros" },
              ])}

              {/* Expansión para Películas */}
              {formData.pasatiempos.includes("peliculas") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de películas te gustan?</p>
                  {renderCheckboxes("", "generosPeliculas", [
                    { value: "accion", label: "Acción" },
                    { value: "alternativa", label: "Alternativa" },
                    { value: "documentales", label: "Documentales" },
                    { value: "animacion", label: "Animación" },
                    { value: "drama", label: "Drama" },
                    { value: "historia", label: "Historia" },
                    { value: "horror", label: "Horror" },
                    { value: "comedia", label: "Comedia" },
                    { value: "misterio", label: "Misterio" },
                    { value: "romantico", label: "Romántico" },
                    { value: "scifi", label: "Sci-Fi" },
                    { value: "fantasy", label: "Fantasy" },
                    { value: "guerra", label: "Guerra" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}

              {/* Expansión para Música */}
              {formData.pasatiempos.includes("musica") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué géneros musicales te gustan?</p>
                  {renderCheckboxes("", "generosMusica", [
                    { value: "ambient", label: "Ambient" },
                    { value: "blues", label: "Blues" },
                    { value: "disko", label: "Disko" },
                    { value: "drum-n-bass", label: "Drum n Bass" },
                    { value: "electro", label: "Electro" },
                    { value: "folk-country", label: "Folk & Country" },
                    { value: "funky", label: "Funky" },
                    { value: "house", label: "House" },
                    { value: "chill-out", label: "Chill-out" },
                    { value: "indie", label: "Indie" },
                    { value: "jazz", label: "Jazz" },
                    { value: "clasica", label: "Clásica" },
                    { value: "metal", label: "Metal" },
                    { value: "new-age", label: "New Age" },
                    { value: "salsa", label: "Salsa" },
                    { value: "bachata", label: "Bachata" },
                    { value: "folclorica", label: "Música folclórica" },
                    { value: "pop", label: "Pop" },
                    { value: "punk", label: "Punk" },
                    { value: "rap", label: "Rap" },
                    { value: "rb", label: "R&B" },
                    { value: "soul", label: "Soul" },
                    { value: "hip-hop", label: "Hip-hop" },
                    { value: "reggae", label: "Reggae" },
                    { value: "rock", label: "Rock" },
                    { value: "techno", label: "Techno" },
                    { value: "trance", label: "Trance" },
                    { value: "otro", label: "Otro" },
                  ])}
                </div>
              )}

              {/* Expansión para Leer */}
              {formData.pasatiempos.includes("leer") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué tipo de libros lees?</p>
                  {renderCheckboxes("", "generosLibros", [
                    { value: "policiacas", label: "Novelas policíacas" },
                    { value: "viajes", label: "Libros de viajes" },
                    { value: "idiomas-extranjeros", label: "Literatura en idiomas extranjeros" },
                    { value: "fantasia", label: "Fantasía" },
                    { value: "historico", label: "Novelas históricas" },
                    { value: "terror", label: "Terror" },
                    { value: "humor", label: "Humor" },
                    { value: "satira", label: "Sátira" },
                    { value: "motivacional", label: "Literatura motivacional" },
                    { value: "cocina", label: "Cocina" },
                    { value: "especializada", label: "Literatura especializada" },
                    { value: "poesia", label: "Poesía" },
                    { value: "mujeres", label: "Para mujeres" },
                    { value: "cuentos", label: "Cuentos" },
                    { value: "ciencia-ficcion", label: "Ciencia ficción" },
                    { value: "thriller", label: "Thriller" },
                    { value: "biografias", label: "Biografías" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}

              {/* Expansión para Deporte */}
              {formData.pasatiempos.includes("deporte") && (
                <div className="bg-white/5 border border-neon-green/30 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-3">¿Qué deportes practicas?</p>
                  {renderCheckboxes("", "deportesPractica", [
                    { value: "aerobic", label: "Aerobic" },
                    { value: "combate", label: "Deportes de combate" },
                    { value: "ciclismo", label: "Ciclismo" },
                    { value: "extremos", label: "Deportes extremos" },
                    { value: "fitness", label: "Fitness" },
                    { value: "futbol", label: "Fútbol" },
                    { value: "baloncesto", label: "Baloncesto" },
                    { value: "voleibol", label: "Voleibol" },
                    { value: "badminton", label: "Bádminton" },
                    { value: "hockey", label: "Hockey" },
                    { value: "natacion", label: "Natación" },
                    { value: "patinaje", label: "Patinaje" },
                    { value: "yoga", label: "Yoga" },
                    { value: "running", label: "Running" },
                    { value: "escalada", label: "Escalada" },
                    { value: "senderismo", label: "Senderismo" },
                    { value: "snowboard", label: "Snowboard" },
                    { value: "esqui", label: "Esquí" },
                    { value: "ping-pong", label: "Ping-pong" },
                    { value: "tenis", label: "Tenis" },
                    { value: "golf", label: "Golf" },
                    { value: "padel", label: "Pádel" },
                    { value: "balonmano", label: "Balonmano" },
                    { value: "remo", label: "Remo" },
                    { value: "buceo", label: "Buceo" },
                    { value: "squash", label: "Squash" },
                    { value: "otros", label: "Otros" },
                  ])}
                </div>
              )}
            </div>

            {/* Ideas y valores */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neon-green mb-6">Ideas y valores</h3>

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
                { value: "cristiano", label: "Cristiano" },
                { value: "budista", label: "Budista" },
                { value: "catolico", label: "Católico" },
                { value: "protestante", label: "Protestante" },
                { value: "evangelista", label: "Evangelista" },
                { value: "judio", label: "Judío" },
                { value: "musulman", label: "Musulmán" },
                { value: "hindu", label: "Hindú" },
                { value: "taoismo", label: "Taoísmo" },
                { value: "wiccan", label: "Wiccan" },
                { value: "satanista", label: "Satanista" },
                { value: "no-religioso", label: "No religioso/a" },
                { value: "mormon", label: "Mormón" },
                { value: "espiritualista", label: "Espiritualista" },
                { value: "bautista", label: "Bautista" },
                { value: "metodista", label: "Metodista" },
                { value: "ortodoxo", label: "Ortodoxo" },
                { value: "pentecostes", label: "Pentecostés" },
                { value: "quaquero", label: "Quáquero" },
                { value: "adventista", label: "Adventista" },
                { value: "jainismo", label: "Jainismo" },
                { value: "iskcon", label: "Iskcon" },
                { value: "sintoismo", label: "Sintoísmo" },
                { value: "sijista", label: "Sijista" },
                { value: "caodaismo", label: "Caodaismo" },
                { value: "otra", label: "Otra religión" },
              ], "religionOtra")}

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
                    <option value="no-bailo">No bailo, no me gusta bailar</option>
                  </select>
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
                </>
              )}

              {renderSelectField("¿Saldrías con alguien que fuma?", "saldriasFumador", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Saldrías con alguien que bebe?", "saldriasBebedor", [
                { value: "no", label: "No" },
                { value: "si", label: "Sí" },
                { value: "solo-ocasional", label: "Solo si bebe ocasionalmente" },
                { value: "solo-social", label: "Solo si bebe socialmente" },
                { value: "me-da-igual", label: "Me da igual" },
              ])}

              {renderSelectField("¿Dieta o alimentación especial?", "dietaEspecial", [
                { value: "ninguna", label: "Ninguna" },
                { value: "sin-lactosa", label: "Sin lactosa" },
                { value: "sin-azucar", label: "Sin azúcar" },
                { value: "sin-gluten", label: "Sin gluten (celíaca)" },
                { value: "diabetes", label: "Diabetes" },
                { value: "vegetariana", label: "Vegetariana" },
                { value: "vegana", label: "Vegana" },
                { value: "kosher", label: "Kosher" },
                { value: "halal", label: "Halal" },
                { value: "otra", label: "Otra" },
              ], "dietaEspecialOtra")}
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
                { value: "neutro", label: "No lo busco específicamente, pero si me topo con algo así, lo paso sin problema" },
                { value: "desgastante", label: "Me resulta desgastante... odio hacer sociales o hablar con gente que apenas conozco" },
              ])}

              {renderSelectField("¿Eres ambicioso?", "eresAmbicioso", [
                { value: "super-ambicioso", label: "Super ambicioso" },
                { value: "ambicioso", label: "Ambicioso" },
                { value: "algo-ambicioso", label: "Algo ambicioso" },
                { value: "no-ambicioso", label: "No soy ambicioso" },
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

            {/* Ideas políticas */}
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400">🔒</span>
                <h3 className="text-xl font-bold text-neon-green">Ideas políticas</h3>
              </div>

              {renderSelectField("Ideas políticas", "ideasPoliticas", [
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "ultra-conservador", label: "Ultra Conservador" },
                { value: "conservador", label: "Conservador" },
                { value: "centro", label: "Centro" },
                { value: "liberal", label: "Liberal" },
                { value: "muy-liberal", label: "Muy Liberal" },
                { value: "otro", label: "Otro punto de vista" },
              ])}
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
            <Link href="/" className="flex items-center gap-2">
              <div className="size-10 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">LoCuToRiO</span>
            </Link>
            
            <nav className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-neon-green transition-colors">
                Mi Espacio
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
            <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-4 shadow-lg sticky top-24 space-y-4">
              
              {/* =================== FOTO DE PERFIL (EN SIDEBAR) =================== */}
              <div className="space-y-3">
                {/* Carta de foto con proporción 10:13 */}
                <div 
                  className="relative rounded-xl overflow-hidden bg-forest-dark border border-neon-green/20 cursor-pointer"
                  style={{ aspectRatio: '10/13' }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
                      if (file.size > 500 * 1024) {
                        alert("La imagen es muy grande. Máximo 500KB.");
                        return;
                      }
                      if (formData.fotos.length >= 6) {
                        alert("Ya tienes 6 fotos. Elimina una antes de subir otra.");
                        return;
                      }
                      const url = URL.createObjectURL(file);
                      const newPhoto = {
                        id: Date.now().toString(),
                        url: url,
                        esPrincipal: formData.fotos.length === 0,
                        estado: 'pendiente' as const
                      };
                      setFormData(prev => ({
                        ...prev,
                        fotos: [...prev.fotos, newPhoto]
                      }));
                      setCurrentPhotoIndex(formData.fotos.length);
                    }
                  }}
                >
                  {formData.fotos.length > 0 ? (
                    <>
                      {/* Foto actual */}
                      <img 
                        src={formData.fotos[currentPhotoIndex].url} 
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Badges en esquina superior derecha */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {formData.fotos[currentPhotoIndex].estado === 'pendiente' && (
                          <span className="bg-orange-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            🕐
                          </span>
                        )}
                        {formData.fotos[currentPhotoIndex].estado === 'aprobada' && (
                          <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            ✅
                          </span>
                        )}
                        {formData.fotos[currentPhotoIndex].estado === 'rechazada' && (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            ❌
                          </span>
                        )}
                        {formData.fotos[currentPhotoIndex].esPrincipal && (
                          <span className="bg-neon-green/90 backdrop-blur-sm text-forest-dark text-xs px-2 py-1 rounded-full font-bold">
                            ⭐
                          </span>
                        )}
                      </div>
                      
                      {/* Navegación con flechas */}
                      {formData.fotos.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentPhotoIndex(prev => 
                              prev === 0 ? formData.fotos.length - 1 : prev - 1
                            )}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                          >
                            ◀
                          </button>
                          <button
                            onClick={() => setCurrentPhotoIndex(prev => 
                              prev === formData.fotos.length - 1 ? 0 : prev + 1
                            )}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all text-sm"
                          >
                            ▶
                          </button>
                        </>
                      )}
                      
                      {/* Contador pequeño */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                        {currentPhotoIndex + 1}/{formData.fotos.length}
                      </div>
                    </>
                  ) : (
                    // Texto de requisitos cuando no hay fotos (se tapa al subir)
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="text-5xl mb-3">📷</div>
                      <p className="text-neon-green font-medium text-sm mb-2">Subir foto</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>JPG, PNG • Máx 500KB</p>
                        <p>Cara visible (50%+)</p>
                        <p>Sin filtros</p>
                        <p>Solo tú en la foto</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 3 BOTONES */}
                <div className="grid grid-cols-3 gap-2">
                  <label className="cursor-pointer">
                    <div className="bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 py-2 rounded-lg text-center text-xs transition-all">
                      📤
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 500 * 1024) {
                            alert("La imagen es muy grande. Máximo 500KB.");
                            return;
                          }
                          if (formData.fotos.length >= 6) {
                            alert("Ya tienes 6 fotos. Elimina una antes de subir otra.");
                            return;
                          }
                          const url = URL.createObjectURL(file);
                          const newPhoto = {
                            id: Date.now().toString(),
                            url: url,
                            esPrincipal: formData.fotos.length === 0,
                            estado: 'pendiente' as const
                          };
                          setFormData(prev => ({
                            ...prev,
                            fotos: [...prev.fotos, newPhoto]
                          }));
                          setCurrentPhotoIndex(formData.fotos.length);
                        }
                      }}
                    />
                  </label>
                  
                  <button
                    onClick={() => {
                      if (formData.fotos.length === 0) return;
                      if (confirm('¿Eliminar esta foto?')) {
                        const newFotos = formData.fotos.filter((_, i) => i !== currentPhotoIndex);
                        if (formData.fotos[currentPhotoIndex].esPrincipal && newFotos.length > 0) {
                          newFotos[0].esPrincipal = true;
                        }
                        setFormData(prev => ({
                          ...prev,
                          fotos: newFotos
                        }));
                        setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
                      }
                    }}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 py-2 rounded-lg text-center text-xs transition-all"
                    disabled={formData.fotos.length === 0}
                  >
                    🗑️
                  </button>
                  
                  <button
                    onClick={() => {
                      if (formData.fotos.length === 0) return;
                      setFormData(prev => ({
                        ...prev,
                        fotos: prev.fotos.map((f, i) => ({
                          ...f,
                          esPrincipal: i === currentPhotoIndex
                        }))
                      }));
                    }}
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 py-2 rounded-lg text-center text-xs transition-all"
                    disabled={formData.fotos.length === 0 || formData.fotos[currentPhotoIndex]?.esPrincipal}
                  >
                    ⭐
                  </button>
                </div>
              </div>
              
              {/* Separador */}
              <div className="border-t border-neon-green/20"></div>
              
              {/* Nav de categorías */}
              <nav className="space-y-2">
                {/* Botón Datos básicos - Redirige a /create-profile */}
                <Link
                  href="/create-profile"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-forest-dark/40 border border-transparent text-gray-400 hover:border-neon-green/50 hover:text-gray-300"
                >
                  <span className="text-xl">📝</span>
                  <span className="text-sm font-medium">Datos básicos</span>
                </Link>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
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
