"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación básica
    if (!formData.username || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    // Aquí iría la lógica de autenticación real
    console.log("Login:", formData);

    // Verificar si el usuario ya tiene perfil creado
    // Por ahora, simulamos que YA tiene perfil (esto se validará con el backend)
    const usuarioTienePerfil = true; // Cambiar a false solo para usuarios nuevos

    if (usuarioTienePerfil) {
      // Si hay redirect (viene de página pública), usar replace para no dejar login en historial
      // Si NO hay redirect (navegación interna), usar push normal
      if (redirect) {
        router.replace(redirect); // No dejar login en historial
      } else {
        router.push("/dashboard"); // Navegación normal
      }
    } else {
      // Si es primera vez, crear perfil (guardamos redirect para después)
      if (redirect) {
        router.replace(`/crear-perfil?redirect=${redirect}`);
      } else {
        router.push("/crear-perfil");
      }
    }
  };

  return (
    <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center px-4 font-display">
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
          <h1 className="text-2xl font-bold text-white mb-2">Iniciar Sesión</h1>
          <p className="text-connect-muted">Bienvenido de vuelta</p>
        </div>

        {/* Login Form */}
        <div className="bg-connect-card border border-connect-border rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username/Locutorio ID */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Locutorio ID
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">
                  Contraseña
                </label>
                <Link
                  href="/recuperar-contrasena"
                  className="text-sm text-primary hover:brightness-125 transition-all"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary"
                required
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-connect-border bg-connect-bg-dark text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-connect-muted">
                Mantener sesión iniciada
              </label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-primary text-connect-bg-dark hover:brightness-110 hover:shadow-[0_0_20px_rgba(43,238,121,0.3)] font-bold h-12"
            >
              Iniciar Sesión
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

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-connect-muted text-sm">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="text-primary font-semibold hover:brightness-125 transition-all"
              >
                Regístrate gratis
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-connect-bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
