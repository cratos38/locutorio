"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type EmailVerificationBlockProps = {
  email: string;
  onVerified: () => void;
};

export default function EmailVerificationBlock({ email, onVerified }: EmailVerificationBlockProps) {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-verificar cuando se completan los 6 dígitos
  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 6 && !isVerifying) {
      verifyCode(fullCode);
    }
  }, [code]);

  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Mover al siguiente campo automáticamente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: borrar y mover al anterior
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Pegar código completo
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newCode = [...code];
        digits.forEach((digit, i) => {
          if (i < 6) newCode[i] = digit;
        });
        setCode(newCode);
        
        // Enfocar el último campo con contenido
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
      });
    }
  };

  const verifyCode = async (fullCode: string) => {
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      if (response.ok) {
        // ✅ Código correcto
        onVerified();
      } else {
        // ❌ Código incorrecto
        const data = await response.json();
        setError(data.message || "Código incorrecto o expirado");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Error al verificar el código");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    setError("");
    setCode(["", "", "", "", "", ""]);

    try {
      await fetch("/api/resend-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      setError("Error al reenviar el código");
    }
  };

  const formatEmail = (email: string) => {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const maskedName = name.slice(0, 2) + "*".repeat(name.length - 2);
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-forest-dark flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 text-neon-green bg-neon-green/20 rounded-full mb-4">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">📧 Verifica tu Email</h1>
          <p className="text-gray-400">
            Te enviamos un código de 6 dígitos a:
          </p>
          <p className="text-neon-green font-medium mt-1">{formatEmail(email)}</p>
        </div>

        {/* Card */}
        <div className="bg-forest-dark/80 backdrop-blur-sm border border-neon-green/20 rounded-2xl p-8 shadow-2xl">
          {/* Input de código */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
              Ingresa el código:
            </label>
            <div className="flex gap-3 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying || timeLeft <= 0}
                  className="w-12 h-14 text-center text-2xl font-bold bg-forest-dark border-2 border-neon-green/30 text-white rounded-lg focus:border-neon-green focus:ring-2 focus:ring-neon-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-4">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-400">
                ⏱️ Código válido por:{" "}
                <span className={`font-bold ${timeLeft <= 10 ? "text-red-400" : "text-neon-green"}`}>
                  {timeLeft}s
                </span>
              </p>
            ) : (
              <p className="text-sm text-red-400 font-medium">
                ⏰ El código ha expirado
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">❌ {error}</p>
            </div>
          )}

          {/* Loading */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neon-green"></div>
              <p className="text-sm text-gray-400">Verificando...</p>
            </div>
          )}

          {/* Reenviar */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">¿No recibiste el código?</p>
            {timeLeft > 0 ? (
              <p className="text-xs text-gray-500">
                Podrás reenviar el código en {timeLeft}s
              </p>
            ) : (
              <Button
                onClick={handleResend}
                variant="outline"
                className="bg-neon-green/10 border-neon-green/30 text-neon-green hover:bg-neon-green/20"
              >
                🔄 Reenviar código
              </Button>
            )}
          </div>

          {/* Ayuda */}
          <div className="mt-6 pt-6 border-t border-forest-light/20">
            <p className="text-xs text-gray-500 text-center">
              💡 <strong className="text-gray-400">Tip:</strong> Puedes copiar y pegar el código directamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
