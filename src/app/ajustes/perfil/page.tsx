"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CategoryType = "algo-sobre-mi" | "relaciones" | "cultura" | "estilo-vida" | "informacion-privada";

export default function AjustesPerfilPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("algo-sobre-mi");
  
  // Estado para todos los campos del formulario
  const [formData, setFormData] = useState({
    // Algo sobre mí
    altura: "",
    peso: "",
    tipoCuerpo: "",
    colorOjos: "",
    colorCabello: "",
    educacion: "",
    etnia: "",
    idiomas: [] as string[],
    origenGeografico: "",
    defineteEnFrase: "",
    cuentanosAlgoTuyo: "",
    intereses: "",
    primeraCitaIdeal: "",
    
    // Relaciones
    estadoCivil: "",
    hijos: "",
    queBuscas: "",
    razonPrincipal: "",
    tiempoEnPareja: "",
    casarseImportante: "",
    duracionRelacionLarga: "",
    vehiculoPropio: "",
    
    // Cultura
    peliculas: [] as string[],
    libros: [] as string[],
    musica: [] as string[],
    ideasPoliticas: "",
    valoresTradicionales: "",
    espiritualidad: "",
    religion: "",
    conviccionesReligiosas: "",
    
    // Estilo de vida
    deportes: [] as string[],
    queHacesNormalmente: [] as string[],
    interesesMusicales: [] as string[],
    teEjercitas: "",
    usasDrogas: "",
    dietaEspecial: "",
    tiempoConFamilia: "",
    personalidadSociable: "",
    teGustaBailar: "",
    teGustaCocinar: "",
    ordenMantenimiento: "",
    
    // Información privada
    escuelasPrivadasPublicas: "",
    tusPadresEstan: "",
    economicamenteIndependiente: "",
    parejasMismoNivelIngresos: "",
    nivelIngresosActual: "",
    numeroHijos: "",
    ordenNacimiento: "",
    origenesSocioEconomicos: "",
  });

  const categories = [
    { id: "algo-sobre-mi" as CategoryType, label: "Algo sobre mí", icon: "👤" },
    { id: "relaciones" as CategoryType, label: "Relaciones", icon: "💑" },
    { id: "cultura" as CategoryType, label: "Cultura", icon: "🎭" },
    { id: "estilo-vida" as CategoryType, label: "Estilo de vida", icon: "🏃" },
    { id: "informacion-privada" as CategoryType, label: "Información privada", icon: "🔒" },
  ];

  const handleSave = () => {
    console.log("Guardando perfil:", formData);
    // Aquí se guardaría en la base de datos
    alert("Perfil guardado exitosamente");
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "algo-sobre-mi":
        return renderAlgoSobreMi();
      case "relaciones":
        return renderRelaciones();
      case "cultura":
        return renderCultura();
      case "estilo-vida":
        return renderEstiloVida();
      case "informacion-privada":
        return renderInformacionPrivada();
      default:
        return null;
    }
  };

  const renderAlgoSobreMi = () => (
    <div className="space-y-8">
      {/* Altura y Peso */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Apariencia física</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Altura (cm)</label>
            <Input
              type="number"
              placeholder="Ej: 170"
              value={formData.altura}
              onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
              className="bg-forest-dark border-forest-light text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Peso (kg)</label>
            <Input
              type="number"
              placeholder="Ej: 70"
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              className="bg-forest-dark border-forest-light text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de cuerpo</label>
            <select
              value={formData.tipoCuerpo}
              onChange={(e) => setFormData({ ...formData, tipoCuerpo: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              <option value="delgado">Delgado/a</option>
              <option value="atletico">Atlético/a</option>
              <option value="promedio">Promedio</option>
              <option value="voluminoso">Voluminoso/a</option>
              <option value="robusto">Robusto/a</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de ojos</label>
            <select
              value={formData.colorOjos}
              onChange={(e) => setFormData({ ...formData, colorOjos: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              <option value="negros">Negros</option>
              <option value="marrones">Marrones</option>
              <option value="azules">Azules</option>
              <option value="verdes">Verdes</option>
              <option value="grises">Grises</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de cabello</label>
            <select
              value={formData.colorCabello}
              onChange={(e) => setFormData({ ...formData, colorCabello: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              <option value="negro">Negro</option>
              <option value="castaño">Castaño</option>
              <option value="rubio">Rubio</option>
              <option value="pelirrojo">Pelirrojo</option>
              <option value="gris">Gris/Blanco</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Educación y Etnia */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Educación y origen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Educación</label>
            <select
              value={formData.educacion}
              onChange={(e) => setFormData({ ...formData, educacion: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              <option value="basica">Básica</option>
              <option value="secundaria">Secundaria</option>
              <option value="tecnica">Técnica</option>
              <option value="universitaria">Universitaria</option>
              <option value="postgrado">Postgrado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tu etnia</label>
            <select
              value={formData.etnia}
              onChange={(e) => setFormData({ ...formData, etnia: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              <option value="afro">Afro/Negro/a</option>
              <option value="arabe">Árabe/Turco/a</option>
              <option value="asiatico">Asiático/a</option>
              <option value="blanco">Blanco/a (Caucásico/a)</option>
              <option value="indigena">Indígena</option>
              <option value="mestizo">Mestizo/a</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">¿En qué tipo de entorno geográfico creciste?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: "campo", label: "Vida de campo" },
              { value: "pueblo", label: "Vida de pueblo" },
              { value: "ciudad", label: "Vida de ciudad" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.origenGeografico === option.value
                    ? "bg-neon-green/20 border-neon-green"
                    : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                }`}
              >
                <input
                  type="radio"
                  name="origenGeografico"
                  value={option.value}
                  checked={formData.origenGeografico === option.value}
                  onChange={(e) => setFormData({ ...formData, origenGeografico: e.target.value })}
                  className="w-4 h-4 text-neon-green"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Presentación personal */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Presentación personal</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Defínete en una frase</label>
            <Input
              type="text"
              placeholder="un hombre normal, sincero y simple"
              value={formData.defineteEnFrase}
              onChange={(e) => setFormData({ ...formData, defineteEnFrase: e.target.value })}
              className="bg-forest-dark border-forest-light text-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cuéntanos algo tuyo</label>
            <div className="text-xs text-gray-400 mb-2 space-y-1">
              <p>• Cómo es tu vida diaria</p>
              <p>• A qué te dedicas</p>
              <p>• Qué haces para divertirte</p>
              <p>• Qué cosas te hacen único/a</p>
              <p>• Cuáles son tus metas y aspiraciones en la vida</p>
              <p className="text-red-400">• PROHIBIDO lenguaje grosero o indecente</p>
              <p className="text-red-400">• No incluyas tu nombre completo, dirección, teléfono u otros datos de contacto</p>
            </div>
            <Textarea
              placeholder="¡Hola! Gracias por visitar mi perfil. Déjame contarte un poco sobre mí..."
              value={formData.cuentanosAlgoTuyo}
              onChange={(e) => setFormData({ ...formData, cuentanosAlgoTuyo: e.target.value })}
              className="bg-forest-dark border-forest-light text-white placeholder:text-gray-500 min-h-[150px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Intereses (separados con una coma)</label>
            <p className="text-xs text-gray-400 mb-2">Ejemplos: Bailar, comida chatarra, películas de terror, videojuegos, tocar la guitarra</p>
            <Textarea
              placeholder="Tus intereses..."
              value={formData.intereses}
              onChange={(e) => setFormData({ ...formData, intereses: e.target.value })}
              className="bg-forest-dark border-forest-light text-white placeholder:text-gray-500 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">¿Cómo sería tu primera cita ideal?</label>
            <Textarea
              placeholder="En un lugar donde estemos cómodos al aire libre"
              value={formData.primeraCitaIdeal}
              onChange={(e) => setFormData({ ...formData, primeraCitaIdeal: e.target.value })}
              className="bg-forest-dark border-forest-light text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold px-8 py-3"
        >
          Guardar todo
        </Button>
      </div>
    </div>
  );

  const renderRelaciones = () => (
    <div className="space-y-8">
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Estado civil e hijos</h3>
        
        {/* Estado civil */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Estado civil</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"].map((option) => (
              <label
                key={option}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.estadoCivil === option
                    ? "bg-neon-green/20 border-neon-green text-neon-green"
                    : "bg-forest-dark/40 border-forest-light text-gray-400 hover:border-neon-green/50"
                }`}
              >
                <input
                  type="radio"
                  name="estadoCivil"
                  value={option}
                  checked={formData.estadoCivil === option}
                  onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })}
                  className="sr-only"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hijos */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">¿Tienes hijos?</label>
          <div className="space-y-2">
            {[
              { value: "prefiero-no-decir", label: "Prefiero no decir" },
              { value: "si-no-viven", label: "Sí, pero no viven en mi casa" },
              { value: "si-viven", label: "Sí, y viven en mi casa" },
              { value: "no", label: "No" },
              { value: "no-me-acuerdo", label: "No me acuerdo..." },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.hijos === option.value
                    ? "bg-neon-green/20 border-neon-green"
                    : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                }`}
              >
                <input
                  type="radio"
                  name="hijos"
                  value={option.value}
                  checked={formData.hijos === option.value}
                  onChange={(e) => setFormData({ ...formData, hijos: e.target.value })}
                  className="w-4 h-4 text-neon-green"
                />
                <span className="text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Expectativas */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Expectativas</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Qué estás buscando en nuestra web?</label>
            <div className="space-y-2">
              {[
                { value: "formar-pareja", label: "Encontrar a alguien para formar pareja" },
                { value: "aventuras", label: "Aventuras sin compromiso" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.queBuscas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="queBuscas"
                    value={option.value}
                    checked={formData.queBuscas === option.value}
                    onChange={(e) => setFormData({ ...formData, queBuscas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Razón PRINCIPAL por la que quieres tener pareja?</label>
            <div className="space-y-2">
              {[
                { value: "familia-futuro", label: "Para formar una familia y planear un futuro (a eso apunto)" },
                { value: "acompanado-bien", label: "Para sentirme acompañado/a y pasarla bien" },
                { value: "no-seguro", label: "No estoy seguro / No sé muy bien para qué" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.razonPrincipal === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="razonPrincipal"
                    value={option.value}
                    checked={formData.razonPrincipal === option.value}
                    onChange={(e) => setFormData({ ...formData, razonPrincipal: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Más relaciones */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Preferencias</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Estando en pareja... ¿Cómo te gusta administrar tu tiempo?</label>
            <div className="space-y-2">
              {[
                { value: "mayoria-compania", label: "Me encanta pasar la mayoría del tiempo en compañía de mi pareja" },
                { value: "equilibrio", label: "Necesito mi espacio y que negociemos un equilibrio entre tiempo en pareja y tiempo personal" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.tiempoEnPareja === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tiempoEnPareja"
                    value={option.value}
                    checked={formData.tiempoEnPareja === option.value}
                    onChange={(e) => setFormData({ ...formData, tiempoEnPareja: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Casarse es importante?</label>
            <div className="space-y-2">
              {[
                { value: "si-importante", label: "Sí, es importante, me gustaría casarme en el futuro" },
                { value: "no-tan-importante", label: "No es tan importante, vivir juntos sería suficiente" },
                { value: "no-estoy-seguro", label: "No estoy seguro" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.casarseImportante === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="casarseImportante"
                    value={option.value}
                    checked={formData.casarseImportante === option.value}
                    onChange={(e) => setFormData({ ...formData, casarseImportante: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">¿Tienes vehículo propio?</label>
            <div className="grid grid-cols-2 gap-3">
              {["Sí", "No"].map((option) => (
                <label
                  key={option}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.vehiculoPropio === option
                      ? "bg-neon-green/20 border-neon-green text-neon-green"
                      : "bg-forest-dark/40 border-forest-light text-gray-400 hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="vehiculoPropio"
                    value={option}
                    checked={formData.vehiculoPropio === option}
                    onChange={(e) => setFormData({ ...formData, vehiculoPropio: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold px-8 py-3"
        >
          Guardar todo
        </Button>
      </div>
    </div>
  );

  const renderCultura = () => (
    <div className="space-y-8">
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Ideas y valores</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Ideas políticas</label>
            <div className="space-y-2">
              {[
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "ultra-conservador", label: "Ultra Conservador" },
                { value: "conservador", label: "Conservador" },
                { value: "indiferente", label: "Indiferente" },
                { value: "liberal", label: "Liberal" },
                { value: "muy-liberal", label: "Muy Liberal" },
                { value: "inconformista", label: "Inconformista" },
                { value: "otro-punto-vista", label: "Otro punto de vista" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.ideasPoliticas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="ideasPoliticas"
                    value={option.value}
                    checked={formData.ideasPoliticas === option.value}
                    onChange={(e) => setFormData({ ...formData, ideasPoliticas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Eres una persona de valores tradicionales?</label>
            <div className="space-y-2">
              {[
                { value: "bastante", label: "Bastante, me gusta aferrarme a las tradiciones y a lo conocido" },
                { value: "tradicional-abierto", label: "Soy tradicional, pero de mente abierta hacia lo diferente" },
                { value: "poco-tradicional", label: "Poco tradicional... casi siempre prefiero inventar mi propio camino" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.valoresTradicionales === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="valoresTradicionales"
                    value={option.value}
                    checked={formData.valoresTradicionales === option.value}
                    onChange={(e) => setFormData({ ...formData, valoresTradicionales: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Te interesa la espiritualidad?</label>
            <div className="space-y-2">
              {[
                { value: "si-bastante", label: "Sí, bastante" },
                { value: "mas-o-menos", label: "Más o menos" },
                { value: "muy-poco", label: "Muy poco" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.espiritualidad === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="espiritualidad"
                    value={option.value}
                    checked={formData.espiritualidad === option.value}
                    onChange={(e) => setFormData({ ...formData, espiritualidad: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Religión */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Religión</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Religión</label>
            <select
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-forest-dark border border-forest-light text-white focus:border-neon-green focus:outline-none max-h-40 overflow-y-auto"
              size={8}
            >
              <option value="">Seleccionar...</option>
              <option value="cristiano">Cristiano</option>
              <option value="budista">Budista</option>
              <option value="catolico">Católico</option>
              <option value="protestante">Protestante</option>
              <option value="ortodoxo">Ortodoxo</option>
              <option value="musulman">Musulmán</option>
              <option value="judio">Judío</option>
              <option value="hindu">Hindú</option>
              <option value="ateo">Ateo</option>
              <option value="agnostico">Agnóstico</option>
              <option value="espiritualista">Espiritualista</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Convicciones religiosas</label>
            <div className="space-y-2">
              {[
                { value: "bastante-religioso", label: "Me considero una persona bastante religiosa" },
                { value: "creyente-relajado", label: "Me considero creyente... pero relajado" },
                { value: "no-creyente", label: "No soy creyente, ni religioso" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.conviccionesReligiosas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="conviccionesReligiosas"
                    value={option.value}
                    checked={formData.conviccionesReligiosas === option.value}
                    onChange={(e) => setFormData({ ...formData, conviccionesReligiosas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold px-8 py-3"
        >
          Guardar todo
        </Button>
      </div>
    </div>
  );

  const renderEstiloVida = () => (
    <div className="space-y-8">
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Salud y hábitos</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Te ejercitas físicamente?</label>
            <div className="space-y-2">
              {[
                { value: "si-regularmente", label: "Sí, regularmente" },
                { value: "algunas-veces", label: "Algunas veces" },
                { value: "no-lo-hago", label: "No lo hago" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.teEjercitas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="teEjercitas"
                    value={option.value}
                    checked={formData.teEjercitas === option.value}
                    onChange={(e) => setFormData({ ...formData, teEjercitas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Usas drogas?</label>
            <div className="space-y-2">
              {[
                { value: "prefiero-no-decir", label: "Prefiero no decir" },
                { value: "nunca", label: "Nunca" },
                { value: "alguna-vez", label: "Alguna vez" },
                { value: "seguido", label: "Seguido (más de 3 veces a la semana)" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.usasDrogas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="usasDrogas"
                    value={option.value}
                    checked={formData.usasDrogas === option.value}
                    onChange={(e) => setFormData({ ...formData, usasDrogas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Dieta o alimentación especial?</label>
            <div className="space-y-2">
              {[
                { value: "ninguna", label: "Ninguna alimentación en especial" },
                { value: "vegetariana", label: "Vegetariana" },
                { value: "vegana", label: "Vegana" },
                { value: "kosher", label: "Kosher" },
                { value: "halal", label: "Halal" },
                { value: "otra", label: "Otra" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.dietaEspecial === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="dietaEspecial"
                    value={option.value}
                    checked={formData.dietaEspecial === option.value}
                    onChange={(e) => setFormData({ ...formData, dietaEspecial: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personalidad y costumbres */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-neon-green mb-4">Personalidad y costumbres</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Te gusta pasar tiempo con familiares y parientes?</label>
            <div className="space-y-2">
              {[
                { value: "si-me-encanta", label: "Sí, me encanta, soy súper familiero/a" },
                { value: "ocasionalmente", label: "Ocasionalmente, de vez en cuando" },
                { value: "francamente-no", label: "Francamente... no soy muy familiero" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.tiempoConFamilia === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tiempoConFamilia"
                    value={option.value}
                    checked={formData.tiempoConFamilia === option.value}
                    onChange={(e) => setFormData({ ...formData, tiempoConFamilia: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Eres de personalidad sociable?</label>
            <div className="space-y-2">
              {[
                { value: "bastante-extrovertido", label: "Sí, soy bastante extrovertido y sociable con todo el mundo" },
                { value: "algo-timido", label: "Soy algo tímido/a, pero igual me interesa y me gusta socializar" },
                { value: "desgastante", label: "Me resulta desgastante... odio hacer sociales o hablar con gente que apenas conozco" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.personalidadSociable === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="personalidadSociable"
                    value={option.value}
                    checked={formData.personalidadSociable === option.value}
                    onChange={(e) => setFormData({ ...formData, personalidadSociable: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Te gusta bailar?</label>
            <div className="space-y-2">
              {[
                { value: "si-me-gusta", label: "Sí, me gusta" },
                { value: "mas-o-menos", label: "Más o menos" },
                { value: "no-me-gusta", label: "No me gusta" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.teGustaBailar === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="teGustaBailar"
                    value={option.value}
                    checked={formData.teGustaBailar === option.value}
                    onChange={(e) => setFormData({ ...formData, teGustaBailar: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Te gusta cocinar?</label>
            <div className="space-y-2">
              {[
                { value: "si-me-gusta", label: "Sí, me gusta" },
                { value: "mas-o-menos", label: "Más o menos" },
                { value: "no-me-gusta", label: "No me gusta" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.teGustaCocinar === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="teGustaCocinar"
                    value={option.value}
                    checked={formData.teGustaCocinar === option.value}
                    onChange={(e) => setFormData({ ...formData, teGustaCocinar: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Orden y mantenimiento</label>
            <div className="space-y-2">
              {[
                { value: "impecable", label: "Me encanta mantener todo lo más impecable posible" },
                { value: "orden-sin-exagerar", label: "Me gusta mantener el orden, pero sin exagerar" },
                { value: "relajado", label: "Soy relajado, ordeno ocasionalmente" },
                { value: "muy-relajado", label: "Soy muy relajado, no ordeno casi nunca" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.ordenMantenimiento === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="ordenMantenimiento"
                    value={option.value}
                    checked={formData.ordenMantenimiento === option.value}
                    onChange={(e) => setFormData({ ...formData, ordenMantenimiento: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold px-8 py-3"
        >
          Guardar todo
        </Button>
      </div>
    </div>
  );

  const renderInformacionPrivada = () => (
    <div className="space-y-8">
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
          <span className="text-xs text-gray-500 bg-forest-dark/60 px-2 py-1 rounded">Esto no se verá en tu perfil</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Estudiaste en escuelas privadas o públicas?</label>
            <div className="space-y-2">
              {[
                { value: "publicas", label: "Escuelas públicas" },
                { value: "privadas", label: "Escuelas privadas" },
                { value: "mezcla", label: "Mezcla de públicas y privadas" },
                { value: "en-casa", label: "Educación en casa" },
                { value: "alternativa", label: "Educación alternativa" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.escuelasPrivadasPublicas === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="escuelasPrivadasPublicas"
                    value={option.value}
                    checked={formData.escuelasPrivadasPublicas === option.value}
                    onChange={(e) => setFormData({ ...formData, escuelasPrivadasPublicas: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Familia */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400">🔒</span>
          <h3 className="text-xl font-bold text-neon-green">Familia</h3>
          <span className="text-xs text-gray-500 bg-forest-dark/60 px-2 py-1 rounded">Esto no se verá en tu perfil</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Tus padres están...</label>
            <div className="space-y-2">
              {[
                { value: "aun-casados", label: "Aún casados" },
                { value: "divorciados", label: "Divorciados" },
                { value: "separados", label: "Separados" },
                { value: "uno-muerto", label: "Uno ha muerto" },
                { value: "ambos-murieron", label: "Ambos murieron" },
                { value: "no-estan-juntos", label: "No están juntos" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.tusPadresEstan === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="tusPadresEstan"
                    value={option.value}
                    checked={formData.tusPadresEstan === option.value}
                    onChange={(e) => setFormData({ ...formData, tusPadresEstan: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Situación económica */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400">🔒</span>
          <h3 className="text-xl font-bold text-neon-green">Situación económica</h3>
          <span className="text-xs text-gray-500 bg-forest-dark/60 px-2 py-1 rounded">Esto no se verá en tu perfil</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Eres económicamente independiente?</label>
            <div className="space-y-2">
              {[
                { value: "si", label: "Sí" },
                { value: "no", label: "No" },
                { value: "mas-o-menos", label: "Más o menos" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.economicamenteIndependiente === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="economicamenteIndependiente"
                    value={option.value}
                    checked={formData.economicamenteIndependiente === option.value}
                    onChange={(e) => setFormData({ ...formData, economicamenteIndependiente: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Es importante que tu pareja tenga tu mismo nivel de ingresos?</label>
            <div className="space-y-2">
              {[
                { value: "no-importante", label: "No es importante" },
                { value: "escalon-cercano", label: "Es importante que al menos este en un escalón cercano" },
                { value: "mismo-nivel", label: "Tiene que estar en el mismo nivel o más que yo" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.parejasMismoNivelIngresos === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="parejasMismoNivelIngresos"
                    value={option.value}
                    checked={formData.parejasMismoNivelIngresos === option.value}
                    onChange={(e) => setFormData({ ...formData, parejasMismoNivelIngresos: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Cuál es tu nivel de ingresos actual?</label>
            <div className="space-y-2">
              {[
                { value: "no-tengo", label: "No tengo ingresos" },
                { value: "menores", label: "Ingresos menores que un salario básico" },
                { value: "similares", label: "Ingresos similares que un salario básico" },
                { value: "mayores", label: "Ingresos mayores que un salario básico" },
                { value: "mucho-mayores", label: "Ingresos mucho mayores que un salario básico" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.nivelIngresosActual === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="nivelIngresosActual"
                    value={option.value}
                    checked={formData.nivelIngresosActual === option.value}
                    onChange={(e) => setFormData({ ...formData, nivelIngresosActual: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orígenes */}
      <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400">🔒</span>
          <h3 className="text-xl font-bold text-neon-green">Orígenes</h3>
          <span className="text-xs text-gray-500 bg-forest-dark/60 px-2 py-1 rounded">Esto no se verá en tu perfil</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">¿Cuáles son tus orígenes socio-económicos?</label>
            <div className="space-y-2">
              {[
                { value: "clase-humilde", label: "Provengo de una familia de clase humilde" },
                { value: "clase-media", label: "Provengo de una familia de clase media" },
                { value: "clase-media-alta", label: "Provengo de una familia de clase media-alta" },
                { value: "clase-alta", label: "Provengo de una familia de clase alta" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    formData.origenesSocioEconomicos === option.value
                      ? "bg-neon-green/20 border-neon-green"
                      : "bg-forest-dark/40 border-forest-light hover:border-neon-green/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="origenesSocioEconomicos"
                    value={option.value}
                    checked={formData.origenesSocioEconomicos === option.value}
                    onChange={(e) => setFormData({ ...formData, origenesSocioEconomicos: e.target.value })}
                    className="w-4 h-4 text-neon-green"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold px-8 py-3"
        >
          Guardar todo
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-forest-dark">
      {/* Header */}
      <header className="bg-forest-dark/90 backdrop-blur-sm border-b border-forest-light sticky top-0 z-50">
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
    </div>
  );
}
