"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre de usuario
    if (!formData.username) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre debe tener al menos 3 caracteres";
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    // Confirmar email
    if (formData.email !== formData.emailConfirm) {
      newErrors.emailConfirm = "Los correos electrónicos no coinciden";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Debe incluir al menos mayúsculas, minúsculas y números";
    }

    // Confirmar contraseña
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Las contraseñas no coinciden";
    }

    // Aceptar términos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Aquí iría la lógica de registro real
    console.log("Registro:", formData);

    // Redirigir a verificación de email o login
    router.push("/login?registered=true");
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center px-4 py-12 font-display">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
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
          <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-connect-muted">Únete a la comunidad</p>
        </div>

        {/* Registration Form */}
        <div className="bg-connect-card border border-connect-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Locutorio ID */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Locutorio ID <span className="text-red-500">*</span>
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary ${
                  errors.username ? "border-red-500" : ""
                }`}
                required
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
              <p className="text-xs text-connect-muted mt-1">
                Este será tu nombre visible para otros usuarios
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary ${
                  errors.email ? "border-red-500" : ""
                }`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Confirm Email */}
            <div>
              <label htmlFor="emailConfirm" className="block text-sm font-medium text-white mb-2">
                Confirmar correo electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                id="emailConfirm"
                type="email"
                placeholder="Repite tu correo"
                value={formData.emailConfirm}
                onChange={(e) => setFormData({ ...formData, emailConfirm: e.target.value })}
                className={`bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary ${
                  errors.emailConfirm ? "border-red-500" : ""
                }`}
                required
              />
              {errors.emailConfirm && (
                <p className="text-red-500 text-xs mt-1">{errors.emailConfirm}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary ${
                  errors.password ? "border-red-500" : ""
                }`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-connect-muted mt-1">
                Debe incluir al menos mayúsculas, minúsculas y números
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-white mb-2">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className={`bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary ${
                  errors.passwordConfirm ? "border-red-500" : ""
                }`}
                required
              />
              {errors.passwordConfirm && (
                <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>
              )}
            </div>

            {/* Accept Terms */}
            <div className="space-y-2">
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="w-4 h-4 mt-1 rounded border-connect-border bg-connect-bg-dark text-primary focus:ring-primary focus:ring-offset-0"
                />
                <label htmlFor="acceptTerms" className="ml-2 text-sm text-connect-muted">
                  Acepto los{" "}
                  <Link href="/acerca-de/terminos" className="text-primary hover:brightness-125">
                    Términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/acerca-de/proteccion-datos" className="text-primary hover:brightness-125">
                    Política de privacidad
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs ml-6">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-primary text-connect-bg-dark hover:brightness-110 hover:shadow-[0_0_20px_rgba(43,238,121,0.3)] font-bold h-12 mt-6"
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-connect-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-connect-card px-4 text-connect-muted">o</span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-connect-muted text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:brightness-125 transition-all"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-connect-muted hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
