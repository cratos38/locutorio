'use client'

import { useState } from 'react'
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

export default function AjustesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ajustes')
  const [volumeEnabled, setVolumeEnabled] = useState(true)
  const [showAge, setShowAge] = useState(true)
  const [invisibleMode, setInvisibleMode] = useState(false)
  const [dataProcessingAccepted, setDataProcessingAccepted] = useState(true)
  const [locutorioEnabled, setLocutorioEnabled] = useState(true)
  
  // Seguridad
  const [emailVerified, setEmailVerified] = useState(true)
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
    alert('Se enviará un archivo ZIP a tu correo en los próximos 30 días')
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
                  { id: 'seguridad', icon: 'fa-lock', label: 'Seguridad' },
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
                  <h3 className="text-base font-bold text-white mb-3">Procesamiento de los datos</h3>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataProcessingAccepted}
                      onChange={(e) => setDataProcessingAccepted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#2BEE79] focus:ring-[#2BEE79]"
                    />
                    <span className="text-gray-300 text-xs">
                      Acepto mensajes de publicidad y declaro que me he familiarizado con el{' '}
                      <a href="#" className="text-[#2BEE79] underline">procesamiento de datos personales</a>
                    </span>
                  </label>
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

                {/* Exportar datos */}
                <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)]">
                  <h3 className="text-base font-bold text-white mb-3">Exporta tus datos</h3>
                  <p className="text-gray-300 text-xs mb-3">
                    Todos tus datos te pertenecen. Te los enviaremos en formato ZIP dentro de 30 días.
                  </p>
                  <Button 
                    onClick={handleExportData} 
                    className="bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold text-xs py-2 px-4 shadow-[0_0_20px_rgba(43,238,121,0.4)] hover:shadow-[0_0_30px_rgba(43,238,121,0.6)]"
                  >
                    <i className="fas fa-download mr-2"></i>
                    Exportar datos
                  </Button>
                </div>

              </div>
            )}

            {/* PESTAÑA: SEGURIDAD */}
            {activeTab === 'seguridad' && (
              <div className="space-y-4">
                
                {/* Alerta */}
                <div className={`rounded-lg p-4 shadow-[0_0_30px_rgba(43,238,121,0.1)] ${
                  securityStatus === 'protegida' ? 'bg-green-600/20 border border-green-500/30' : 'bg-orange-600/20 border border-orange-500/30'
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
                        onClick={() => setVerificationMethod(item.method)}
                        className={`relative p-3 rounded-lg text-xs transition-all ${
                          verificationMethod === item.method
                            ? 'bg-[#2BEE79]/10 border-2 border-[#2BEE79] text-white shadow-[0_0_20px_rgba(43,238,121,0.5)]'
                            : item.verified
                              ? 'bg-green-500/10 border-2 border-green-500/50 text-white'
                              : 'bg-transparent border-2 border-white/20 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        {item.verified && (
                          <i className="fas fa-check-circle absolute top-1 right-1 text-[#2BEE79] text-xs"></i>
                        )}
                        <p className="font-semibold">Verificar</p>
                        <p>{item.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Formulario verificación */}
                  {verificationMethod && (
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

                <div className="space-y-3">
                  {[
                    { name: 'WhatsApp', enabled: twoFactorWhatsApp },
                    { name: 'Telegram', enabled: twoFactorTelegram },
                    { name: 'Email', enabled: twoFactorEmail, value: 'Cr****38@gmail.com' },
                    { name: 'Google Authenticator', enabled: twoFactorGoogle },
                  ].map((method, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-transparent rounded-lg border border-white/10 shadow-[0_0_15px_rgba(43,238,121,0.05)]">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-mobile-alt text-2xl text-gray-400"></i>
                        <div>
                          <p className="text-white text-sm font-semibold">{method.name}</p>
                          <p className={`text-xs ${method.enabled ? 'text-gray-400' : 'text-red-400'}`}>
                            {method.enabled ? (method.value || 'Activado') : 'No establecido'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="text-[#2BEE79] hover:text-[#2BEE79]/80 text-xs">
                        Cambiar
                      </Button>
                    </div>
                  ))}
                </div>
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
              <div className="bg-transparent border border-white/10 rounded-lg p-4 shadow-[0_0_30px_rgba(251,146,60,0.1)]">
                <h3 className="text-xl font-bold text-orange-500 mb-3">ELIMINAR CUENTA</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Puedes eliminar tu cuenta en cualquier momento. Perderás todos tus datos.
                </p>

                <div className="space-y-2 mb-6 text-gray-300 text-xs">
                  <p>• Todos tus datos personales</p>
                  <p>• Fotos y comentarios en Galería</p>
                  <p>• Anuncios publicados</p>
                  <p>• Mensajes y comunicaciones</p>
                  <p>• Privilegios PLUS+ sin reembolso</p>
                </div>

                <Button 
                  onClick={handleDeleteAccount} 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-sm shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)]"
                >
                  Eliminar cuenta
                </Button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
