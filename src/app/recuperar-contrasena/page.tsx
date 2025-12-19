"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RecuperarContrasenaPage() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí iría la lógica para enviar el email de recuperación
    console.log("Recuperar contraseña para:", username);
    setSubmitted(true);
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
          <h1 className="text-2xl font-bold text-white mb-2">Recuperar Contraseña</h1>
          <p className="text-connect-muted">Te enviaremos instrucciones a tu correo</p>
        </div>

        {/* Recovery Form */}
        <div className="bg-connect-card border border-connect-border rounded-2xl p-8 shadow-xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                  Locutorio ID o Correo electrónico
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="nombre_usuario o email@ejemplo.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-connect-bg-dark border-connect-border text-white placeholder:text-connect-muted focus:border-primary"
                  required
                />
                <p className="text-xs text-connect-muted mt-2">
                  Ingresa tu nombre de usuario o el correo electrónico que usaste al registrarte
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-connect-bg-dark hover:brightness-110 hover:shadow-[0_0_20px_rgba(43,238,121,0.3)] font-bold h-12"
              >
                Solicitar nueva contraseña
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">¡Revisa tu correo!</h3>
              <p className="text-connect-muted">
                Si existe una cuenta asociada a <strong className="text-white">{username}</strong>, te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-sm text-connect-muted">
                Revisa también tu carpeta de spam.
              </p>
              <Link href="/login">
                <Button variant="ghost" className="text-primary hover:bg-primary/10 mt-4">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-connect-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-connect-card px-4 text-connect-muted">o</span>
            </div>
          </div>

          {/* Additional help */}
          <div className="text-center space-y-3">
            <p className="text-connect-muted text-sm">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:brightness-125 transition-all"
              >
                Inicia sesión
              </Link>
            </p>
            <p className="text-connect-muted text-sm">
              ¿No tienes cuenta?{" "}
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
