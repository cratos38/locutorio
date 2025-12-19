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
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    // Datos básicos
    fechaNacimiento: "",
    genero: "",
    pais: "Venezuela",
    ciudad: "",

    // Apariencia física
    altura: "",
    peso: "",
    complexion: "",
    colorCabello: "",
    colorOjos: "",

    // Intereses
    sobreMi: "",
    meGusta: "",
    noMeGusta: "",
    hobbies: "",

    // Qué busca
    buscando: "",
    rangoEdad: "",

    // Foto
    fotoPerfil: null as File | null,
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí se guardaría el perfil en la base de datos
    console.log("Perfil creado:", profileData);

    // Redirigir a la página solicitada o a inicio
    // Usamos replace para no dejar crear-perfil en el historial
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/inicio");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Datos Básicos</h2>
              <p className="text-connect-muted">Cuéntanos un poco sobre ti</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={profileData.fechaNacimiento}
                  onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Género <span className="text-red-500">*</span>
                </label>
                <select
                  value={profileData.genero}
                  onChange={(e) => setProfileData({ ...profileData, genero: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-connect-bg-dark border border-connect-border text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  País <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={profileData.pais}
                  onChange={(e) => setProfileData({ ...profileData, pais: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Tu ciudad"
                  value={profileData.ciudad}
                  onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Apariencia Física</h2>
              <p className="text-connect-muted">Describe cómo eres físicamente</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Altura (cm)
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 170"
                  value={profileData.altura}
                  onChange={(e) => setProfileData({ ...profileData, altura: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Peso (kg)
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 70"
                  value={profileData.peso}
                  onChange={(e) => setProfileData({ ...profileData, peso: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Complexión
                </label>
                <select
                  value={profileData.complexion}
                  onChange={(e) => setProfileData({ ...profileData, complexion: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-connect-bg-dark border border-connect-border text-white focus:border-primary focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="delgada">Delgada</option>
                  <option value="atletica">Atlética</option>
                  <option value="normal">Normal</option>
                  <option value="robusta">Robusta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Color de Cabello
                </label>
                <select
                  value={profileData.colorCabello}
                  onChange={(e) => setProfileData({ ...profileData, colorCabello: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-connect-bg-dark border border-connect-border text-white focus:border-primary focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="negro">Negro</option>
                  <option value="castano">Castaño</option>
                  <option value="rubio">Rubio</option>
                  <option value="pelirrojo">Pelirrojo</option>
                  <option value="gris">Gris/Blanco</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Color de Ojos
                </label>
                <select
                  value={profileData.colorOjos}
                  onChange={(e) => setProfileData({ ...profileData, colorOjos: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-connect-bg-dark border border-connect-border text-white focus:border-primary focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="marrones">Marrones</option>
                  <option value="negros">Negros</option>
                  <option value="verdes">Verdes</option>
                  <option value="azules">Azules</option>
                  <option value="grises">Grises</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Sobre Ti</h2>
              <p className="text-connect-muted">Cuéntanos tus intereses y personalidad</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Descripción Personal <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Escribe algo sobre ti..."
                  value={profileData.sobreMi}
                  onChange={(e) => setProfileData({ ...profileData, sobreMi: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted min-h-[100px]"
                  required
                />
                <p className="text-xs text-connect-muted mt-1">
                  Sé auténtico y describe tu personalidad
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Me Gusta
                </label>
                <Textarea
                  placeholder="Cosas que disfrutas hacer..."
                  value={profileData.meGusta}
                  onChange={(e) => setProfileData({ ...profileData, meGusta: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  No Me Gusta
                </label>
                <Textarea
                  placeholder="Cosas que no te gustan..."
                  value={profileData.noMeGusta}
                  onChange={(e) => setProfileData({ ...profileData, noMeGusta: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hobbies e Intereses
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Música, deportes, lectura..."
                  value={profileData.hobbies}
                  onChange={(e) => setProfileData({ ...profileData, hobbies: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">¿Qué Buscas?</h2>
              <p className="text-connect-muted">Ayúdanos a conectarte con las personas adecuadas</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  ¿Qué buscas en LoCuToRiO? <span className="text-red-500">*</span>
                </label>
                <select
                  value={profileData.buscando}
                  onChange={(e) => setProfileData({ ...profileData, buscando: e.target.value })}
                  className="w-full h-10 px-3 rounded-md bg-connect-bg-dark border border-connect-border text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="amor">Amor / Pareja</option>
                  <option value="amistad">Amistad</option>
                  <option value="charla">Conversar / Chatear</option>
                  <option value="encuentros">Encuentros casuales</option>
                  <option value="noseaun">No sé aún</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rango de Edad Preferido
                </label>
                <Input
                  type="text"
                  placeholder="Ej: 25-35"
                  value={profileData.rangoEdad}
                  onChange={(e) => setProfileData({ ...profileData, rangoEdad: e.target.value })}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Foto de Perfil</h2>
              <p className="text-connect-muted">Una foto real y actual tuya</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-connect-border rounded-lg p-8 text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <label htmlFor="fotoPerfil" className="cursor-pointer">
                  <span className="text-primary hover:brightness-125 font-semibold">Subir foto</span>
                  <span className="text-connect-muted"> o arrastra y suelta</span>
                  <Input
                    id="fotoPerfil"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileData({ ...profileData, fotoPerfil: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-connect-muted mt-2">
                  PNG, JPG o GIF (máx. 5MB)
                </p>
              </div>

              {profileData.fotoPerfil && (
                <div className="bg-connect-card border border-connect-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{profileData.fotoPerfil.name}</p>
                      <p className="text-xs text-connect-muted">
                        {(profileData.fotoPerfil.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, fotoPerfil: null })}
                      className="text-red-500 hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Requisitos para foto de perfil:
                </h3>
                <ul className="text-sm text-connect-muted space-y-1 ml-7">
                  <li>• Foto real y actual</li>
                  <li>• Solo una persona en la foto</li>
                  <li>• Cara claramente visible (más del 50%)</li>
                  <li>• Sin filtros que distorsionen el rostro</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center px-4 py-12 font-display">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-primary bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Tu Perfil</h1>
          <p className="text-connect-muted">Paso {step} de {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-connect-card rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-connect-card border border-connect-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-connect-border">
              <Button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                variant="ghost"
                className="text-connect-muted hover:text-white disabled:opacity-30"
              >
                ← Anterior
              </Button>

              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold"
                >
                  Siguiente →
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-primary text-connect-bg-dark hover:brightness-110 hover:shadow-[0_0_20px_rgba(43,238,121,0.3)] font-bold"
                >
                  Crear Perfil →
                </Button>
              )}
            </div>
          </form>

          {/* Skip option */}
          <div className="text-center mt-6">
            <Link
              href="/inicio"
              className="text-sm text-connect-muted hover:text-primary transition-colors"
            >
              Omitir por ahora (puedes completarlo después)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CrearPerfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-connect-bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <CrearPerfilForm />
    </Suspense>
  );
}
