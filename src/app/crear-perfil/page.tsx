"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function CrearPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  
  const [profileData, setProfileData] = useState({
    nombre: "",
    sexo: "",
    fechaNacimiento: "",
    pais: "Venezuela",
    ciudad: "",
    queBusca: "",
    sobreTi: "",
  });

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar datos básicos en la base de datos
    console.log("Datos básicos guardados:", profileData);
    
    // Redirigir a perfil detallado
    router.push("/ajustes/perfil?from=registro");
  };

  const handleSkip = () => {
    // Guardar datos básicos mínimos si los hay
    console.log("Saltando al inicio:", profileData);
    
    // Redirigir a inicio
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/mi-espacio");
    }
  };

  return (
    <div className="min-h-screen bg-forest-dark flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
          <p className="text-gray-400">Cuéntanos un poco sobre ti para empezar</p>
        </div>

        {/* Form Card */}
        <div className="bg-forest-dark/60 backdrop-blur-sm border border-neon-green/20 rounded-2xl p-8 shadow-xl shadow-neon-green/5">
          <form onSubmit={handleContinue} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                placeholder="Tu nombre"
                value={profileData.nombre}
                onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                className="bg-forest-dark/80 border-forest-light text-white placeholder:text-gray-500"
                required
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sexo <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Hombre", "Mujer", "Otro"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      profileData.sexo === option.toLowerCase()
                        ? "bg-neon-green/20 border-neon-green text-neon-green"
                        : "bg-forest-dark/60 border-forest-light text-gray-400 hover:border-neon-green/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value={option.toLowerCase()}
                      checked={profileData.sexo === option.toLowerCase()}
                      onChange={(e) => setProfileData({ ...profileData, sexo: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Nacimiento <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={profileData.fechaNacimiento}
                onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                className="bg-forest-dark/80 border-forest-light text-white"
                required
              />
            </div>

            {/* De dónde */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={profileData.pais}
                  onChange={(e) => setProfileData({ ...profileData, pais: e.target.value })}
                  className="bg-forest-dark/80 border-forest-light text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ciudad <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Tu ciudad"
                  value={profileData.ciudad}
                  onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                  className="bg-forest-dark/80 border-forest-light text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {/* ¿Qué buscas? */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Qué buscas? <span className="text-red-400">*</span>
              </label>
              <select
                value={profileData.queBusca}
                onChange={(e) => setProfileData({ ...profileData, queBusca: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-forest-dark/80 border border-forest-light text-white focus:border-neon-green focus:outline-none"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="pareja">Encontrar pareja</option>
                <option value="amistad">Amistad</option>
                <option value="conversar">Conversar / Chatear</option>
                <option value="aventuras">Aventuras sin compromiso</option>
                <option value="nosé">No sé aún</option>
              </select>
            </div>

            {/* Algo sobre ti */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Algo sobre ti
              </label>
              <Textarea
                placeholder="Cuéntanos un poco sobre ti, tus intereses, qué te gusta hacer..."
                value={profileData.sobreTi}
                onChange={(e) => setProfileData({ ...profileData, sobreTi: e.target.value })}
                className="bg-forest-dark/80 border-forest-light text-white placeholder:text-gray-500 min-h-[100px]"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-forest-light">
              <Button
                type="submit"
                className="flex-1 bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold py-6 text-base"
              >
                Continuar - Perfil Detallado →
              </Button>
              
              <Button
                type="button"
                onClick={handleSkip}
                variant="ghost"
                className="flex-1 bg-forest-light/30 text-gray-300 hover:bg-forest-light/50 hover:text-white border border-forest-light py-6 text-base"
              >
                Saltar - Llenar luego
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
            <p className="text-xs text-gray-300 text-center">
              💡 Puedes completar tu perfil detallado más tarde desde tu espacio personal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearPerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-forest-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    }>
      <CrearPerfilForm />
    </Suspense>
  );
}
