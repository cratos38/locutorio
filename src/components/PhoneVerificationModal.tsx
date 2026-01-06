"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type PhoneVerificationModalProps = {
  onVerifyNow: () => void;
  onClose: () => void;
};

export default function PhoneVerificationModal({ onVerifyNow, onClose }: PhoneVerificationModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!contentRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de margen
    
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  // Prevenir cierre con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* Modal - NO se puede cerrar haciendo clic fuera */}
      <div className="relative w-full max-w-2xl bg-forest-dark border-2 border-neon-green/30 rounded-2xl shadow-2xl shadow-neon-green/10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-green/10 to-blue-500/10 border-b border-neon-green/20 p-6">
          <div className="flex items-center gap-3">
            <div className="size-12 bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🔐 Protege tu Cuenta</h2>
              <p className="text-sm text-gray-400">Verifica tu número para desbloquear todas las funciones</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar"
        >
          {/* Intro */}
          <p className="text-gray-300 mb-6">
            📱 Para la seguridad de todos los usuarios de la plataforma, recomendamos <strong className="text-white">verificar tu número de teléfono</strong>.
          </p>

          {/* Sin Verificación */}
          <div className="mb-6 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
              <span>❌</span>
              SIN VERIFICACIÓN (Limitaciones)
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">Límites de mensajes decrecientes:</strong> Semana 1: 100/día → Semana 4+: 10/día</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">No puedes enviar MP primero</strong> (solo responder a los que te llegan)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">No puedes crear salas privadas</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">Perfil marcado como "No verificado"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">No puedes usar 2FA</strong> (autenticación de dos factores)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">No puedes ver quién visitó tu perfil</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span><strong className="text-white">No puedes enviar fotos por MP</strong></span>
              </li>
            </ul>
          </div>

          {/* Con Verificación */}
          <div className="mb-6 p-5 bg-green-500/10 border-2 border-green-500/30 rounded-xl">
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              <span>✅</span>
              CON VERIFICACIÓN (Sin limitaciones)
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Mensajes ilimitados</strong> ∞</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Enviar MP libremente</strong> a cualquier usuario</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Crear salas privadas</strong> y públicas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Perfil con insignia "Verificado"</strong> ⭐</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Activar 2FA</strong> para mayor seguridad</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Ver quién visitó tu perfil</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Enviar fotos por MP</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">•</span>
                <span><strong className="text-white">Mayor confianza de otros usuarios</strong></span>
              </li>
            </ul>
          </div>

          {/* Por qué verificar */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="font-bold text-blue-300 mb-2">💡 ¿Por qué verificar tu número?</h4>
            <p className="text-sm text-gray-400">
              La verificación de teléfono nos ayuda a mantener la plataforma segura y libre de cuentas falsas o spam. 
              Tu número <strong className="text-white">NO será visible</strong> para otros usuarios y solo se usa para verificación.
            </p>
          </div>

          {/* Indicador de scroll */}
          {!hasScrolledToBottom && (
            <div className="mt-6 flex flex-col items-center gap-2 text-orange-400 animate-bounce">
              <p className="text-sm font-medium">⚠️ Debes leer todo para continuar</p>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}
        </div>

        {/* Footer - Botones */}
        <div className={`p-6 bg-forest-dark/80 border-t border-neon-green/20 transition-all ${
          hasScrolledToBottom ? "opacity-100" : "opacity-50 pointer-events-none"
        }`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onVerifyNow}
              disabled={!hasScrolledToBottom}
              className="flex-1 bg-neon-green text-forest-dark hover:brightness-110 font-bold py-6 text-base shadow-lg shadow-neon-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📱 Verificar Ahora
            </Button>
            <Button
              onClick={onClose}
              disabled={!hasScrolledToBottom}
              variant="outline"
              className="flex-1 bg-gray-500/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30 hover:text-white py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar
            </Button>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-xs text-center text-orange-400 mt-3">
              ⚠️ Lee toda la información antes de continuar
            </p>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(43, 238, 121, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(43, 238, 121, 0.5);
        }
      `}</style>
    </div>
  );
}
