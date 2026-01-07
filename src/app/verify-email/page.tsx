"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Por favor ingresa el código de 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Implementar verificación con Supabase
      // Por ahora, simular éxito después de 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError("");

    try {
      // TODO: Implementar reenvío con Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Código reenviado. Revisa tu email.");
    } catch (err: any) {
      setError(err.message || "Error al reenviar el código");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          {/* Icono de éxito */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              ¡Cuenta Creada con Éxito! 🎉
            </h1>
            <p className="text-gray-400">
              Bienvenido a LoCuToRiO.com.ve
            </p>
          </div>

          {/* Instrucciones */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">📧</span>
              Verifica tu correo electrónico
            </h2>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Para continuar, necesitamos verificar tu email:</p>
              <p className="font-mono text-neon-green bg-white/5 px-3 py-2 rounded border border-neon-green/20">
                {email || 'tu@email.com'}
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Revisa tu bandeja de entrada (y spam)</li>
                <li>Busca el email de <strong className="text-white">locutorio.com.ve</strong></li>
                <li>Copia el código de 6 dígitos</li>
                <li>Pégalo aquí abajo y confirma</li>
              </ol>
            </div>
          </div>

          {/* Input de código */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código de verificación
            </label>
            <Input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="bg-white/5 border-white/10 text-white text-center text-2xl tracking-widest font-mono placeholder:text-gray-600"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botón verificar */}
          <Button
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
            className="w-full bg-neon-green hover:bg-neon-green/90 text-connect-bg-dark font-semibold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verificando...
              </span>
            ) : (
              "Verificar y Continuar"
            )}
          </Button>

          {/* Reenviar código */}
          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-sm text-gray-400 hover:text-neon-green transition-colors disabled:opacity-50"
            >
              {resending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
            </button>
          </div>

          {/* Link de ayuda */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              ¿Problemas? <Link href="/contacto" className="text-neon-green hover:underline">Contáctanos</Link>
            </p>
          </div>
        </div>

        {/* Saltar verificación (solo para desarrollo) */}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            🔧 Saltar verificación (desarrollo)
          </button>
        </div>
      </div>
    </div>
  );
}
