'use client'

// ====================================================================
// PÁGINA DE SEGURIDAD Y VERIFICACIONES - DOCUMENTACIÓN COMPLETA
// ====================================================================
//
// Esta página maneja:
// 1. Verificación de teléfono (WhatsApp/Telegram)
// 2. Verificación de identidad con ID (cédula/DNI/pasaporte)
// 3. Seguridad de la cuenta (cambio de contraseña, sesiones, etc.)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📱 VERIFICACIÓN DE TELÉFONO (WhatsApp/Telegram)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// CUÁNDO SE HACE:
//   • Después de verificar email
//   • Opcional pero recomendada
//   • Banner en dashboard: "¿Quieres ganar 30 días gratis de PLUS? Verifica tu teléfono"
//
// OPCIONES:
//   1. WhatsApp
//   2. Telegram
//
// PROCESO (TODO: Implementar PhoneVerificationModal.tsx):
// -------------------------------------------------------
// 1. Usuario hace click en "Verificar teléfono con WhatsApp" o "Telegram"
// 2. Se abre PhoneVerificationModal:
//    • Dropdown de código de país (+58, +1, +34, etc.)
//    • Input de número de teléfono
//    • Botón "Enviar código"
// 3. Backend (POST /api/auth/verify-phone/send-code):
//    • Formatear número completo: +58 412 1234567
//    • Generar código de 6 dígitos
//    • Guardar en tabla verification_codes:
//      {
//        id: uuid,
//        user_id: uuid (del JWT),
//        code: string (encriptado),
//        type: 'phone',
//        phone_number: string,
//        method: 'whatsapp' | 'telegram',
//        expires_at: NOW() + 60 segundos,
//        attempts: 0
//      }
//    • Enviar código por WhatsApp o Telegram (API externa)
// 4. Frontend muestra input de código:
//    • Input de 6 dígitos
//    • Temporizador: 60 segundos
//    • Botón "Verificar"
//    • Botón "Reenviar código" (habilitado después de 60s)
// 5. Verificación (POST /api/auth/verify-phone/confirm-code):
//    • Validar código
//    • Validar que no expiró (60s)
//    • Validar attempts < 3
//    • Si correcto:
//      - Actualizar users.phone_verified = true
//      - Actualizar users.phone_number = phone
//      - 🎁 Otorgar 30 días de PLUS gratis
//      - Cerrar modal
//    • Si incorrecto:
//      - Incrementar attempts
//      - Mostrar error
//
// BENEFICIOS AL VERIFICAR TELÉFONO:
//   ✅ Se eliminan límites de mensajes en chat
//   ✅ Puede iniciar conversaciones nuevas (MP)
//   ⚠️ Límite: Máximo 10 nuevos usuarios/día para primer MP
//   ✅ Mensajes ilimitados con usuarios con los que ya se comunica
//   ✅ Puede crear salas TEMPORALES
//   ✅ Se otorgan 30 días de PLUS gratis
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆔 VERIFICACIÓN DE IDENTIDAD CON ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ IMPORTANTE:
// Verificación de ID NO requiere PLUS.
// DISPONIBLE PARA TODOS los usuarios.
// AL CONTRARIO: Verificando tu ID obtienes PLUS gratis.
//
// QUÉ ES:
//   • Usuario sube foto de su cédula/DNI/pasaporte
//   • Se compara la foto del documento con la foto de perfil
//   • Usa IA para verificar que es la misma persona
//   • NO expone el nombre real del usuario
//   • Solo confirma: "Esta persona es real y su edad es correcta"
//
// BENEFICIOS:
//   • Badge de "Verificado Real" (✓) en el perfil
//   • 🎁 30 días de PLUS gratis
//   • Mayor confianza de otros usuarios
//
// PROCESO (TODO: Implementar):
// ---------------------------
// 1. Usuario hace click en "Verificar mi identidad"
// 2. Se abre modal/página de verificación:
//    • Instrucciones claras
//    • Ejemplo de foto aceptada
//    • Input para subir foto de documento (cédula/DNI/pasaporte)
//    • Input para subir selfie sosteniendo el documento
// 3. Backend (POST /api/auth/verify-id):
//    • Validar que ambas fotos existen
//    • Subir a Supabase Storage: bucket 'id-verification'
//    • Llamar a API de verificación facial (AWS Rekognition, Azure Face API)
//    • Comparar:
//      - Foto de perfil del usuario
//      - Foto del documento
//      - Selfie con documento
//    • Extraer fecha de nacimiento del documento
//    • Comparar con fecha de nacimiento registrada
//    • Si todo coincide (match >= 90%):
//      - Actualizar users.id_verified = true
//      - Actualizar users.age_verified = true
//      - 🎁 Otorgar 30 días de PLUS gratis
//      - Crear registro en tabla id_verifications:
//        {
//          id: uuid,
//          user_id: uuid,
//          status: 'approved',
//          verified_at: timestamp,
//          match_score: float
//        }
//    • Si no coincide:
//      - status: 'rejected'
//      - Mostrar: "La verificación falló. Por favor intenta de nuevo"
// 4. Tiempo de verificación:
//    • Automática (IA): 1-5 minutos
//    • Si requiere revisión manual: 24-48 horas
// 5. Después de verificar:
//    • Badge "✓ Verificado" aparece en:
//      - Foto de perfil
//      - Perfil público
//      - Búsquedas
//    • Notificación: "Tu perfil ha sido verificado"
//
// QUÉ PASA SI SE RECHAZA:
//   • Mensaje: "No pudimos verificar tu identidad. Asegúrate de que:"
//     - La foto del documento sea clara
//     - La fecha de nacimiento coincida
//     - La foto de perfil muestre tu cara claramente
//   • Puede intentar de nuevo (máximo 3 intentos por mes)
//
// ====================================================================
// FIN DE LA DOCUMENTACIÓN - security/page.tsx
// ====================================================================

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import InternalHeader from '@/components/InternalHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type TabType = 'ajustes' | 'seguridad' | '2fa' | 'verificacion' | 'contrasena' | 'eliminar'

interface SessionLog {
  date: string
  ip: string
  location: string
  device: string
  browser: string
}

function AjustesContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('ajustes')
  
  // Leer tab desde URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['ajustes', 'seguridad', '2fa', 'verificacion', 'contrasena', 'eliminar'].includes(tab)) {
      setActiveTab(tab as TabType)
    }
  }, [searchParams])
  
  const [volumeEnabled, setVolumeEnabled] = useState(true)
  const [showAge, setShowAge] = useState(true)
  const [invisibleMode, setInvisibleMode] = useState(false)
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [deleteDataOnExport, setDeleteDataOnExport] = useState(false)
  const [locutorioEnabled, setLocutorioEnabled] = useState(true)
  
  // Seguridad (inicialmente NO verificados para poder verificar)
  const [emailVerified, setEmailVerified] = useState(false)
  const [telegramVerified, setTelegramVerified] = useState(false)
  const [whatsappVerified, setWhatsappVerified] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'telegram' | 'whatsapp' | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('+58 424 2818542')
  const [email, setEmail] = useState('cr****38@gmail.com')
  
  // 2FA
  const [twoFactorWhatsApp, setTwoFactorWhatsApp] = useState(false)
  const [twoFactorTelegram, setTwoFactorTelegram] = useState(false)
  const [twoFactorEmail, setTwoFactorEmail] = useState(true)
  const [twoFactorGoogle, setTwoFactorGoogle] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<'whatsapp' | 'telegram' | 'email' | 'google' | null>(null)
  const [twoFactorPhone, setTwoFactorPhone] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorStep, setTwoFactorStep] = useState<'phone' | 'code' | null>(null)
  
  // Verificación de perfil
  const [profileVerified, setProfileVerified] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null)
  
  // Cambio de contraseña
  const [passwordEmail, setPasswordEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  // Últimas conexiones
  const sessionLogs: SessionLog[] = [
    { date: '03.01.2026', ip: '192.168.1.1', location: 'Amsterdam', device: 'Windows 11', browser: 'Chrome' },
    { date: '02.01.2026', ip: '10.0.0.5', location: 'Madrid', device: 'iPhone 13', browser: 'Safari' },
    { date: '01.01.2026', ip: '172.16.0.1', location: 'Barcelona', device: 'MacBook Pro', browser: 'Firefox' },
    { date: '31.12.2025', ip: '192.168.0.100', location: 'Valencia', device: 'Android', browser: 'Chrome' },
    { date: '30.12.2025', ip: '10.20.30.40', location: 'Sevilla', device: 'Windows 10', browser: 'Edge' },
  ]

  const handleVerificationSend = () => {
    alert(`Código enviado a ${verificationMethod === 'email' ? email : phoneNumber}`)
  }

  const handleVerificationConfirm = () => {
    if (verificationMethod === 'email') setEmailVerified(true)
    if (verificationMethod === 'telegram') setTelegramVerified(true)
    if (verificationMethod === 'whatsapp') setWhatsappVerified(true)
    setVerificationMethod(null)
    setVerificationCode('')
  }

  const handleTwoFactorChange = (method: 'whatsapp' | 'telegram' | 'email' | 'google') => {
    setTwoFactorMethod(method)
    if (method === 'google') {
      setTwoFactorStep('code') // Google Auth va directo a código
    } else if (method === 'email') {
      setTwoFactorStep('code') // Email va directo a código (ya tiene email registrado)
    } else {
      setTwoFactorStep('phone') // WhatsApp/Telegram piden teléfono primero
    }
  }

  const handleTwoFactorSendCode = () => {
    setTwoFactorStep('code')
    alert(`Código enviado a ${twoFactorMethod === 'email' ? email : twoFactorPhone}`)
  }

  const handleTwoFactorConfirm = () => {
    if (twoFactorMethod === 'whatsapp') setTwoFactorWhatsApp(true)
    if (twoFactorMethod === 'telegram') setTwoFactorTelegram(true)
    if (twoFactorMethod === 'email') setTwoFactorEmail(true)
    if (twoFactorMethod === 'google') setTwoFactorGoogle(true)
    
    // Reset
    setTwoFactorMethod(null)
    setTwoFactorStep(null)
    setTwoFactorPhone('')
    setTwoFactorCode('')
    alert('Autentificación 2FA activada correctamente')
  }

  const handleTwoFactorDisable = (method: 'whatsapp' | 'telegram' | 'email' | 'google') => {
    if (confirm('¿Deseas desactivar este método de autentificación?')) {
      if (method === 'whatsapp') setTwoFactorWhatsApp(false)
      if (method === 'telegram') setTwoFactorTelegram(false)
      if (method === 'email') setTwoFactorEmail(false)
      if (method === 'google') setTwoFactorGoogle(false)
      alert('Método desactivado')
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingPhoto(true)
    setVerificationResult(null)
    
    setTimeout(() => {
      setUploadingPhoto(false)
      setVerificationResult('success')
      setProfileVerified(true)
    }, 3000)
  }

  const handleExportData = () => {
    const message = deleteDataOnExport
      ? 'Se enviará un archivo ZIP a tu correo en los próximos 10 días y tus datos serán eliminados del servidor.'
      : 'Se enviará un archivo ZIP a tu correo en los próximos 10 días. Tus datos permanecerán en el servidor.'
    alert(message)
  }

  const handleDeleteAccount = () => {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      alert('Tu cuenta será eliminada en 30 días. Puedes cancelar este proceso dentro de ese período.')
    }
  }

  const securityStatus = emailVerified && (telegramVerified || whatsappVerified) ? 'protegida' : 'insegura'

  return (
    <div 
      className="min-h-screen text-white"
      style={{
        background: 'radial-gradient(circle at top left, rgba(16, 34, 23, 0.8), #102217 50%, #0a1510 100%)'
      }}
    >
      <InternalHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link 
            href="/userprofile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Volver al Perfil</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Menú */}
          <div className="lg:col-span-1">
            <div className="bg-transparent border border-white/10 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(43,238,121,0.1)]">
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-cog text-gray-400 text-sm"></i>
                  </div>
                  <h2 className="text-base font-bold text-white">Configuración</h2>
                </div>
              </div>
              
              <nav className="p-2">
                {[
                  { id: 'ajustes', icon: 'fa-sliders', label: 'Ajustes' },
                  { id: 'seguridad', icon: 'fa-lock', label: 'Verificación de Correo y Teléfono' },
                  { id: '2fa', icon: 'fa-shield-alt', label: 'Autentificación 2FA' },
                  { id: 'verificacion', icon: 'fa-user-check', label: 'Verificación de Perfil' },
                  { id: 'contrasena', icon: 'fa-key', label: 'Cambio de Contraseña' },
                  { id: 'eliminar', icon: 'fa-trash', label: 'Eliminar Cuenta' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      activeTab === tab.id
                        ? tab.id === 'eliminar'
                          ? 'bg-transparent border border-orange-400/50 text-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]'
                          : 'bg-transparent border border-[#2BEE79]/50 text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <i className={`fas ${tab.icon} w-4`}></i>
                    <span className="text-xs">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            
            {/* PESTAÑA: AJUSTES */}
            {activeTab === 'ajustes' && (
              <div className="space-y-4">
                
                {/* Configuración General */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-cog text-gray-400 text-sm"></i>
                    </div>
                    <h3 className="text-lg font-bold text-white">Configuración General</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Volumen */}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-volume-up text-[#2BEE79] text-base"></i>
                        <div>
                          <p className="text-white text-sm font-medium">Sonidos</p>
                          <p className="text-xs text-gray-400">Activar/desactivar sonidos</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVolumeEnabled(!volumeEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                          volumeEnabled ? 'bg-[#2BEE79] shadow-[0_0_10px_rgba(43,238,121,0.5)]' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          volumeEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {/* Mostrar edad - PLUS+ */}
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-birthday-cake text-orange-400 text-base"></i>
                        <div>
                          <p className="text-white text-sm font-medium flex items-center gap-2">
                            Mostrar edad
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold rounded">PLUS+</span>
                          </p>
                          <p className="text-xs text-gray-400">Ocultar edad en perfil</p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                    
                    {/* Modo invisible - PLUS+ */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-eye-slash text-orange-400 text-base"></i>
                        <div>
                          <p className="text-white text-sm font-medium flex items-center gap-2">
                            Modo invisible
                            <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-bold rounded">PLUS+</span>
                          </p>
                          <p className="text-xs text-gray-400">Navegar en modo incógnito</p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
                      >
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Procesamiento de datos */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <h3 className="text-base font-bold text-white mb-4">Procesamiento de los datos</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={dataProcessingAccepted}
                        onChange={(e) => setDataProcessingAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#2BEE79] focus:ring-[#2BEE79]"
                      />
                      <span className="text-gray-300 text-xs">
                        Declaro que estoy de acuerdo y me he familiarizado con{' '}
                        <a href="/about/proteccion-datos" className="text-blue-400 underline hover:text-blue-300">
                          el procesamiento de datos personales
                        </a>
                      </span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#2BEE79] focus:ring-[#2BEE79]"
                      />
                      <span className="text-gray-300 text-xs">
                        Declaro que estoy de acuerdo y me he familiarizado con{' '}
                        <a href="/about/terminos" className="text-blue-400 underline hover:text-blue-300">
                          términos y condiciones de uso
                        </a>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Activación de servicios */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <h3 className="text-base font-bold text-white mb-3">Activación de los servicios</h3>
                  <p className="text-gray-300 text-xs mb-3">
                    Al marcar casilla acepta el uso del servicio seleccionado
                  </p>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locutorioEnabled}
                      onChange={(e) => setLocutorioEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-[#2BEE79] focus:ring-[#2BEE79]"
                    />
                    <span className="text-[#2BEE79] font-semibold text-sm">Locutorio.com.ve</span>
                  </label>
                </div>

              </div>
            )}

            {/* PESTAÑA: SEGURIDAD */}
            {activeTab === 'seguridad' && (
              <div className="space-y-4">
                
                {/* Alerta */}
                <div className={`rounded-lg p-4 ${
                  securityStatus === 'protegida' 
                    ? 'bg-green-600/20 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]' 
                    : 'bg-orange-600/20 border border-orange-500/30 shadow-[0_0_30px_rgba(251,146,60,0.2)]'
                }`}>
                  <div className="flex items-center gap-3">
                    <i className={`fas ${
                      securityStatus === 'protegida' ? 'fa-check-circle text-green-500' : 'fa-exclamation-triangle text-orange-500'
                    } text-2xl`}></i>
                    <p className={`text-sm font-semibold ${
                      securityStatus === 'protegida' ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {securityStatus === 'protegida' 
                        ? 'La seguridad de su cuenta es asegurada' 
                        : 'Para aumentar la seguridad, verifica tu correo y teléfono'}
                    </p>
                  </div>
                </div>

                {/* Verificación */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <h3 className="text-lg font-bold text-[#2BEE79] mb-3">Seguridad de cuenta</h3>
                  <p className="text-gray-300 text-xs mb-4">
                    Si olvidas tu contraseña, enviaremos información solo a contactos verificados
                  </p>

                  {/* Botones verificación */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { method: 'email' as const, label: 'Email', verified: emailVerified },
                      { method: 'telegram' as const, label: 'Telegram', verified: telegramVerified },
                      { method: 'whatsapp' as const, label: 'WhatsApp', verified: whatsappVerified },
                    ].map((item) => (
                      <button
                        key={item.method}
                        onClick={() => !item.verified && setVerificationMethod(item.method)}
                        disabled={item.verified}
                        className={`relative p-3 rounded-lg text-xs transition-all ${
                          item.verified
                            ? 'bg-green-500/10 border-2 border-green-500/50 text-green-400 cursor-default'
                            : verificationMethod === item.method
                              ? 'bg-[#2BEE79]/10 border-2 border-[#2BEE79] text-white shadow-[0_0_20px_rgba(43,238,121,0.5)]'
                              : 'bg-transparent border-2 border-white/20 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        {item.verified && (
                          <i className="fas fa-check-circle absolute top-1 right-1 text-green-500 text-xs"></i>
                        )}
                        <p className="font-semibold">{item.verified ? 'Verificado' : 'Verificar'}</p>
                        <p>{item.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Formulario verificación - solo si NO está verificado */}
                  {verificationMethod && !(
                    (verificationMethod === 'email' && emailVerified) ||
                    (verificationMethod === 'telegram' && telegramVerified) ||
                    (verificationMethod === 'whatsapp' && whatsappVerified)
                  ) && (
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10 shadow-[0_0_20px_rgba(43,238,121,0.05)]">
                      <h4 className="text-sm font-bold text-white mb-3">
                        Verificación por {verificationMethod === 'email' ? 'correo' : verificationMethod}
                      </h4>
                      
                      {verificationMethod === 'email' ? (
                        <>
                          <Input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="mb-3 bg-transparent border-white/20 text-white text-sm"
                          />
                          <Button className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs py-2">
                            Enviar código
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 mb-3 text-xs">{phoneNumber}</p>
                          <Button className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs py-2 mb-3">
                            Enviar código
                          </Button>
                          
                          <p className="text-white text-xs mb-2">Código de 6 cifras</p>
                          <div className="flex gap-2 mb-3">
                            {[...Array(6)].map((_, i) => (
                              <Input
                                key={i}
                                type="text"
                                maxLength={1}
                                className="w-10 h-10 text-center text-lg bg-transparent border-white/20 text-white"
                              />
                            ))}
                          </div>
                          <Button onClick={handleVerificationConfirm} className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs py-2">
                            Confirmar
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Últimas conexiones */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <h3 className="text-base font-bold text-white mb-3">Últimas Conexiones</h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {sessionLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-black/20 rounded text-xs border border-white/5 shadow-[0_0_10px_rgba(43,238,121,0.03)]">
                        <span className="text-gray-400 w-20">{log.date}</span>
                        <span className="text-gray-400 w-28 font-mono">{log.ip}</span>
                        <span className="text-gray-300 w-24">{log.location}</span>
                        <span className="text-gray-300 flex-1">{log.device}</span>
                        <span className="text-gray-400">{log.browser}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PESTAÑA: 2FA */}
            {activeTab === '2fa' && (
              <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                <h3 className="text-xl font-bold text-[#2BEE79] mb-3">Autentificación 2FA</h3>
                <p className="text-gray-300 text-sm mb-4">
                  La verificación de dos etapas protege tu cuenta del acceso no autorizado
                </p>

                <h4 className="text-base font-bold text-white mb-3">Métodos de verificación</h4>

                <div className="space-y-3 mb-4">
                  {[
                    { id: 'whatsapp' as const, name: 'WhatsApp', enabled: twoFactorWhatsApp },
                    { id: 'telegram' as const, name: 'Telegram', enabled: twoFactorTelegram },
                    { id: 'email' as const, name: 'Email', enabled: twoFactorEmail, value: 'Cr****38@gmail.com' },
                    { id: 'google' as const, name: 'Google Authenticator', enabled: twoFactorGoogle },
                  ].map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 bg-transparent rounded-lg border border-white/10 shadow-[0_0_15px_rgba(43,238,121,0.05)]">
                      <div className="flex items-center gap-3">
                        <i className={`fas ${method.enabled ? 'fa-check-circle text-green-500' : 'fa-mobile-alt text-gray-400'} text-2xl`}></i>
                        <div>
                          <p className="text-white text-sm font-semibold">{method.name}</p>
                          <p className={`text-xs ${method.enabled ? 'text-green-400' : 'text-red-400'}`}>
                            {method.enabled ? (method.value || 'Activado') : 'No establecido'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => method.enabled ? handleTwoFactorDisable(method.id) : handleTwoFactorChange(method.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
                          method.enabled
                            ? 'text-red-400 border-red-400/50 hover:bg-red-400/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'text-[#2BEE79] border-white/10 hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)]'
                        }`}
                      >
                        {method.enabled ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Formulario de emparejamiento */}
                {twoFactorMethod && (
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10 shadow-[0_0_20px_rgba(43,238,121,0.05)]">
                    <h4 className="text-sm font-bold text-white mb-3">
                      Configurar {twoFactorMethod === 'whatsapp' ? 'WhatsApp' : twoFactorMethod === 'telegram' ? 'Telegram' : twoFactorMethod === 'email' ? 'Email' : 'Google Authenticator'}
                    </h4>

                    {/* Paso 1: Teléfono (WhatsApp/Telegram) */}
                    {twoFactorStep === 'phone' && (
                      <div>
                        <p className="text-gray-300 text-xs mb-3">
                          Ingresa tu número de teléfono para recibir los códigos de verificación
                        </p>
                        <Input
                          type="tel"
                          placeholder="+58 424 1234567"
                          value={twoFactorPhone}
                          onChange={(e) => setTwoFactorPhone(e.target.value)}
                          className="mb-3 bg-transparent border-white/20 text-white text-sm"
                        />
                        <Button 
                          onClick={handleTwoFactorSendCode}
                          disabled={!twoFactorPhone}
                          className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs py-2"
                        >
                          Enviar código
                        </Button>
                      </div>
                    )}

                    {/* Paso 2: Código (todos) */}
                    {twoFactorStep === 'code' && (
                      <div>
                        {twoFactorMethod === 'google' ? (
                          <>
                            <p className="text-gray-300 text-xs mb-3">
                              Escanea este código QR con tu aplicación Google Authenticator
                            </p>
                            <div className="bg-black/30 p-4 rounded-lg mb-3 flex items-center justify-center border border-white/10">
                              <div className="w-40 h-40 bg-white flex items-center justify-center text-gray-400 text-xs font-semibold">
                                [QR Code]
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs mb-3 text-center font-mono">
                              Clave manual: ABCD-EFGH-IJKL-MNOP
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-300 text-xs mb-3">
                            Ingresa el código de 6 dígitos que te enviamos
                          </p>
                        )}
                        
                        <div className="flex gap-2 mb-3 justify-center">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <input
                              key={i}
                              type="text"
                              maxLength={1}
                              className="w-10 h-10 text-center text-lg bg-transparent border-white/20 text-white border rounded-lg focus:border-[#2BEE79] focus:ring-1 focus:ring-[#2BEE79]"
                              value={twoFactorCode[i] || ''}
                              onChange={(e) => {
                                const newCode = twoFactorCode.split('')
                                newCode[i] = e.target.value
                                setTwoFactorCode(newCode.join(''))
                                
                                // Auto-focus siguiente campo
                                if (e.target.value && i < 5) {
                                  const next = e.target.nextElementSibling as HTMLInputElement
                                  next?.focus()
                                }
                              }}
                            />
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setTwoFactorMethod(null)
                              setTwoFactorStep(null)
                              setTwoFactorCode('')
                              setTwoFactorPhone('')
                            }}
                            className="flex-1 text-xs py-2 bg-transparent border border-white/20 text-gray-300 hover:border-white/40 hover:text-white rounded-lg transition-all"
                          >
                            Cancelar
                          </button>
                          <Button 
                            onClick={handleTwoFactorConfirm}
                            disabled={twoFactorCode.length !== 6}
                            className="flex-1 bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs py-2"
                          >
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA: VERIFICACIÓN */}
            {activeTab === 'verificacion' && (
              <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                <h3 className="text-xl font-bold text-[#2BEE79] mb-3">Verificación con IA</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Sube una foto con tu rostro y documento. La IA verificará tu identidad.
                </p>

                {verificationResult === null && !uploadingPhoto && (
                  <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-lg">
                    <i className="fas fa-id-card text-4xl text-gray-600 mb-3"></i>
                    <p className="text-white text-sm mb-2">Foto con rostro + ID en mano</p>
                    <p className="text-gray-400 text-xs mb-4">Clara y visible</p>
                    
                    <label>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      <span className="inline-block px-4 py-2 bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-xs font-semibold rounded-lg cursor-pointer shadow-[0_0_15px_rgba(43,238,121,0.4)]">
                        <i className="fas fa-upload mr-2"></i>
                        Subir foto
                      </span>
                    </label>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2BEE79] border-t-transparent mx-auto mb-3"></div>
                    <p className="text-white text-sm">Verificando...</p>
                  </div>
                )}

                {verificationResult === 'success' && (
                  <div className="text-center py-8 bg-green-600/10 rounded-lg border border-green-500/30">
                    <i className="fas fa-check-circle text-4xl text-green-500 mb-3"></i>
                    <p className="text-white font-bold text-lg mb-1">¡Perfil Auténtico!</p>
                    <p className="text-gray-300 text-sm">Verificado exitosamente</p>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA: CONTRASEÑA */}
            {activeTab === 'contrasena' && (
              <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                <h3 className="text-xl font-bold text-[#2BEE79] mb-3">Cambio de contraseña</h3>
                
                <div className="p-3 bg-green-600/10 rounded-lg border border-green-500/30 mb-4">
                  <p className="text-green-400 text-xs font-semibold">Email confirmado</p>
                </div>

                <p className="text-gray-300 text-sm mb-4">
                  Correo verificado: <span className="font-mono text-white">Cr****38@gmail.com</span>
                </p>

                <Input
                  type="email"
                  placeholder="Escribe tu correo completo"
                  value={passwordEmail}
                  onChange={(e) => setPasswordEmail(e.target.value)}
                  className="mb-4 bg-transparent border-white/20 text-white"
                />

                <Button className="bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black text-sm py-2 px-4 font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)] w-full">
                  Cambiar contraseña
                </Button>
              </div>
            )}

            {/* PESTAÑA: ELIMINAR */}
            {activeTab === 'eliminar' && (
              <div className="space-y-6">
                
                {/* Exportar datos */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(251,146,60,0.1)]">
                  <h3 className="text-xl font-bold text-orange-500 mb-3">
                    <i className="fas fa-download mr-2"></i>
                    Exportar tus datos
                  </h3>
                  
                  <div className="space-y-3 text-gray-300 text-sm mb-4">
                    <p>
                      Todos tus datos de usuario, que se recopilan en nuestros servidores durante tu estancia aquí, te pertenecen a ti. 
                      En cualquier momento puedes pedirnos que te enviamos todos tus datos.
                    </p>
                    <p>
                      Si así lo haces, te lo enviaremos dentro de 10 días a tu correo electrónico que usaste para crear tu cuenta en Locutorio en el formato ZIP.
                    </p>
                    <p>
                      Si el tamaño de ZIP superaría 25MB te mandamos link de descarga donde lo puedes descargar gratis.
                    </p>
                  </div>

                  <p className="text-orange-400 text-sm mb-2 flex items-start gap-2">
                    <i className="fas fa-exclamation-triangle mt-0.5"></i>
                    <span>Envío de tus datos no borrará esos datos del sistema automáticamente!</span>
                  </p>

                  <label className="flex items-start gap-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={deleteDataOnExport}
                      onChange={(e) => setDeleteDataOnExport(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-300 text-xs">
                      Borrar mis datos del servidor después de enviar el ZIP
                    </span>
                  </label>

                  <p className="text-orange-400 text-sm mb-4 flex items-start gap-2">
                    <i className="fas fa-exclamation-triangle mt-0.5"></i>
                    <span>Exportar y borrar tus datos del sistema no eliminará tu cuenta!</span>
                  </p>

                  <Button 
                    onClick={handleExportData} 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-sm shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Exportar mis datos
                  </Button>
                </div>

                {/* Eliminar cuenta */}
                <div className="bg-transparent border border-orange-500/30 rounded-lg p-4 shadow-[0_0_30px_rgba(251,146,60,0.2)]">
                  <h3 className="text-xl font-bold text-orange-500 mb-3">
                    <i className="fas fa-trash-alt mr-2"></i>
                    ELIMINAR CUENTA
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    Tu cuenta personal puedes eliminar en cualquier momento.
                  </p>

                  <p className="text-white font-semibold text-sm mb-3">
                    Recuerda que con este paso puedes perder tus datos que se guardan en nuestro servidor:
                  </p>

                  <div className="space-y-2 mb-6 text-gray-300 text-xs bg-black/20 rounded-lg p-4 border border-white/10">
                    <p className="flex items-start gap-2">
                      <i className="fas fa-circle text-[6px] mt-1.5 text-orange-500"></i>
                      <span>
                        Todos tus datos personales que usaste para crear tu{' '}
                        <Link href="/userprofile" className="text-blue-400 underline hover:text-blue-300">perfil</Link>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fas fa-circle text-[6px] mt-1.5 text-orange-500"></i>
                      <span>
                        Fotos y sus respectivos comentarios en{' '}
                        <Link href="/albums" className="text-blue-400 underline hover:text-blue-300">Álbumes</Link>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fas fa-circle text-[6px] mt-1.5 text-orange-500"></i>
                      <span>Anuncios que publicaste</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fas fa-circle text-[6px] mt-1.5 text-orange-500"></i>
                      <span>
                        Toda comunicación por salas de chat incluido{' '}
                        <a href="/chat" className="text-blue-400 underline hover:text-blue-300">mensajes privados</a>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fas fa-circle text-[6px] mt-1.5 text-orange-500"></i>
                      <span>Privilegios obtenidos o comprados por activación de programa +PLUS sin derecho de reembolso</span>
                    </p>
                  </div>

                  <Button 
                    onClick={handleDeleteAccount} 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                  >
                    <i className="fas fa-trash-alt mr-2"></i>
                    Eliminar mi cuenta permanentemente
                  </Button>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AjustesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-connect-bg-dark flex items-center justify-center"><div className="text-white">Cargando...</div></div>}>
      <AjustesContent />
    </Suspense>
  )
}
