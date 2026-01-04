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
    // Simular envío de código
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
    
    // Simular proceso de IA (3 segundos)
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
    <div className="min-h-screen bg-connect-bg-dark">
      <InternalHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Menú de pestañas */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A2226] rounded-lg border border-white/5 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2BEE79] to-emerald-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(43,238,121,0.3)]">
                    <i className="fas fa-cog text-white"></i>
                  </div>
                  <h2 className="text-lg font-bold text-white">Configuración</h2>
                </div>
              </div>
              
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('ajustes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'ajustes' 
                      ? 'bg-[#2BEE79]/10 text-[#2BEE79] border border-[#2BEE79]/30 shadow-[0_0_15px_rgba(43,238,121,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-sliders w-5"></i>
                  <span>Ajustes</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('seguridad')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'seguridad' 
                      ? 'bg-[#2BEE79]/10 text-[#2BEE79] border border-[#2BEE79]/30 shadow-[0_0_15px_rgba(43,238,121,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-lock w-5"></i>
                  <span>Seguridad</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('2fa')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === '2fa' 
                      ? 'bg-[#2BEE79]/10 text-[#2BEE79] border border-[#2BEE79]/30 shadow-[0_0_15px_rgba(43,238,121,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-shield-alt w-5"></i>
                  <span>Autentificación 2FA</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('verificacion')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'verificacion' 
                      ? 'bg-[#2BEE79]/10 text-[#2BEE79] border border-[#2BEE79]/30 shadow-[0_0_15px_rgba(43,238,121,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-user-check w-5"></i>
                  <span>Verificación de Perfil</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('contrasena')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'contrasena' 
                      ? 'bg-[#2BEE79]/10 text-[#2BEE79] border border-[#2BEE79]/30 shadow-[0_0_15px_rgba(43,238,121,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-key w-5"></i>
                  <span>Cambio de Contraseña</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('eliminar')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'eliminar' 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <i className="fas fa-trash w-5"></i>
                  <span>Eliminar Cuenta</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            
            {/* PESTAÑA: AJUSTES */}
            {activeTab === 'ajustes' && (
              <div className="space-y-6">
                
                {/* Toggles ON/OFF */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-6">Configuración General</h3>
                  
                  <div className="space-y-4">
                    {/* Volumen */}
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-volume-up text-primary text-xl"></i>
                        <div>
                          <p className="text-white font-semibold">Sonidos</p>
                          <p className="text-sm text-gray-400">Activar/desactivar sonidos de la página</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setVolumeEnabled(!volumeEnabled)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          volumeEnabled ? 'bg-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.5)]' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          volumeEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {/* Mostrar edad - PLUS+ */}
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-orange-400/30">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-birthday-cake text-orange-400 text-xl"></i>
                        <div>
                          <p className="text-white font-semibold flex items-center gap-2">
                            Mostrar edad
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded shadow-[0_0_10px_rgba(251,146,60,0.4)]">PLUS+</span>
                          </p>
                          <p className="text-sm text-gray-400">Ocultar tu edad en tu perfil</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAge(!showAge)}
                        disabled
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors opacity-50 cursor-not-allowed ${
                          showAge ? 'bg-[#2BEE79]' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          showAge ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    {/* Modo invisible - PLUS+ */}
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-orange-400/30">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-eye-slash text-orange-400 text-xl"></i>
                        <div>
                          <p className="text-white font-semibold flex items-center gap-2">
                            Modo invisible
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded shadow-[0_0_10px_rgba(251,146,60,0.4)]">PLUS+</span>
                          </p>
                          <p className="text-sm text-gray-400">Navegar sin aparecer en línea</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setInvisibleMode(!invisibleMode)}
                        disabled
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors opacity-50 cursor-not-allowed ${
                          invisibleMode ? 'bg-[#2BEE79]' : 'bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          invisibleMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Procesamiento de datos */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Procesamiento de los datos</h3>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataProcessingAccepted}
                      onChange={(e) => setDataProcessingAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-300 text-sm">
                      Acepto enviar mensajes de publicidad y marketing de terceros a mi cuenta de Locutorio y declaro que me he familiarizado con el{' '}
                      <a href="#" className="text-[#2BEE79] underline">procesamiento de datos personales</a>
                    </span>
                  </label>
                </div>

                {/* Activación de servicios */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Activación de los servicios</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Al marcar casilla usted acepta el uso de servicio de Locutorio seleccionado. Si usa el servicio su acuerdo esta elegido automáticamente
                  </p>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locutorioEnabled}
                      onChange={(e) => setLocutorioEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-primary focus:ring-primary"
                    />
                    <span className="text-[#2BEE79] font-semibold">Locutorio.com.ve</span>
                  </label>
                </div>

                {/* Exportar datos */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Exporta tus datos de usuario</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Todos tus datos como usuario, que se recopilan en nuestros servidores durante tu estancia aquí, te pertenecen a ti. 
                    En cualquier momento puedes pedirlos, que te enviamos todos tus datos. Si así lo haces, te lo enviaremos dentro de 30 días 
                    a tu correo electrónico que usaste para crear tu cuenta en Locutorio en el formato ZIP.
                  </p>
                  <Button onClick={handleExportData} className="bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)] hover:shadow-[0_0_30px_rgba(43,238,121,0.6)] transition-all">
                    <i className="fas fa-download mr-2"></i>
                    Exportar tus datos
                  </Button>
                </div>

              </div>
            )}

            {/* PESTAÑA: SEGURIDAD */}
            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                
                {/* Alerta de estado */}
                <div className={`rounded-lg p-6 ${
                  securityStatus === 'protegida' 
                    ? 'bg-green-600' 
                    : 'bg-red-600'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
                    </div>
                    <div className="text-white">
                      <p className="font-bold text-lg">
                        {securityStatus === 'protegida' 
                          ? 'La seguridad de su cuenta, es asegurada' 
                          : 'Para aumentar la seguridad de su cuenta, es necesario verificar su correo electrónico y en segundo paso su número de teléfono móvil'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verificación */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-[#2BEE79] mb-4">Seguridad de la cuenta de Cratoz39</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Si olvida su contraseña, solo le enviaremos la nueva información a contactos verificados. 
                    Estos datos no revelaremos nunca a ningún parte
                  </p>

                  {/* Botones de verificación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => setVerificationMethod('email')}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        emailVerified 
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {emailVerified && (
                        <i className="fas fa-check-circle absolute top-2 right-2 text-white"></i>
                      )}
                      <p className="font-semibold">Verificación vía</p>
                      <p>correo electrónico</p>
                    </button>

                    <button
                      onClick={() => setVerificationMethod('telegram')}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        telegramVerified 
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {telegramVerified && (
                        <i className="fas fa-check-circle absolute top-2 right-2 text-white"></i>
                      )}
                      <p className="font-semibold">Verificación vía</p>
                      <p>Telegram</p>
                    </button>

                    <button
                      onClick={() => setVerificationMethod('whatsapp')}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        whatsappVerified 
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {whatsappVerified && (
                        <i className="fas fa-check-circle absolute top-2 right-2 text-white"></i>
                      )}
                      <p className="font-semibold">Verificación vía</p>
                      <p>WhatsApp</p>
                    </button>
                  </div>

                  {/* Formulario de verificación */}
                  {verificationMethod && (
                    <div className="bg-black/30 rounded-lg p-6 border border-white/5">
                      <h4 className="text-lg font-bold text-white mb-4">
                        Verificación por {verificationMethod === 'email' ? 'correo electrónico' : verificationMethod === 'telegram' ? 'Telegram' : 'WhatsApp'}
                      </h4>
                      
                      {verificationMethod === 'email' ? (
                        <>
                          <p className="text-gray-300 mb-4">Su correo electrónico: <span className="font-mono">{email}</span></p>
                          <Input
                            type="email"
                            placeholder="Su correo electrónico"
                            className="mb-4 bg-white/10 border-white/20 text-white"
                          />
                          <Button onClick={handleVerificationSend} className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)]">
                            Enviar código
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-300 mb-4">
                            <img src="https://flagcdn.com/w20/ve.png" alt="VE" className="inline w-5 mr-2" />
                            +58 V {phoneNumber}
                          </p>
                          <Button onClick={handleVerificationSend} className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)] mb-4">
                            Enviar código
                          </Button>
                          
                          <p className="text-white font-semibold mb-2">Escribe código de 6 cifras</p>
                          <div className="flex gap-2 mb-4">
                            {[...Array(6)].map((_, i) => (
                              <Input
                                key={i}
                                type="text"
                                maxLength={1}
                                className="w-12 h-12 text-center text-xl bg-white/10 border-white/20 text-white"
                              />
                            ))}
                          </div>
                          <Button onClick={handleVerificationConfirm} className="w-full bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)]">
                            Confirmar
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Últimas conexiones */}
                <div className="bg-[#0F2D19] rounded-lg border border-white/5 p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Últimas Conexiones</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessionLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-black/20 rounded-lg text-sm">
                        <span className="text-gray-400 w-24">{log.date}</span>
                        <span className="text-gray-400 w-32 font-mono">{log.ip}</span>
                        <span className="text-gray-300 w-28">{log.location}</span>
                        <span className="text-gray-300 flex-1">{log.device}</span>
                        <span className="text-gray-400">{log.browser}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* PESTAÑA: AUTENTIFICACIÓN 2FA */}
            {activeTab === '2fa' && (
              <div className="bg-[#144214] rounded-lg border border-white/5 p-6">
                <h3 className="text-2xl font-bold text-[#2BEE79] mb-4">Autentificación de dos factores</h3>
                <p className="text-gray-300 mb-6">
                  La <strong>verificación de dos etapas</strong> mejora la protección de su cuenta contra el acceso no autorizado. 
                  Además de iniciar sesión con la contraseña, puede usar SMS-Code, correo electrónico o Google Authenticator (e otros de tu selección)
                </p>

                <h4 className="text-lg font-bold text-white mb-4">Modo de verificación</h4>

                <div className="space-y-4">
                  {/* WhatsApp */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-mobile-alt text-3xl text-gray-400"></i>
                      <div>
                        <p className="text-white font-semibold">WhatsApp</p>
                        <p className="text-red-500 text-sm">No establecido</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-[#2BEE79] hover:text-[#2BEE79]/80 hover:bg-[#2BEE79]/10">
                      Cambiar
                    </Button>
                  </div>

                  {/* Telegram */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-mobile-alt text-3xl text-gray-400"></i>
                      <div>
                        <p className="text-white font-semibold">Telegram</p>
                        <p className="text-red-500 text-sm">No establecido</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-[#2BEE79] hover:text-[#2BEE79]/80 hover:bg-[#2BEE79]/10">
                      Cambiar
                    </Button>
                  </div>

                  {/* Correo electrónico */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-at text-3xl text-gray-400"></i>
                      <div>
                        <p className="text-white font-semibold">Correo electrónico</p>
                        <p className="text-gray-400 text-sm font-mono">Cr****38@gmail.com</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-[#2BEE79] hover:text-[#2BEE79]/80 hover:bg-[#2BEE79]/10">
                      Cambiar
                    </Button>
                  </div>

                  {/* Google Autentificador */}
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <i className="fas fa-user-circle text-3xl text-gray-400"></i>
                      <div>
                        <p className="text-white font-semibold">Google Autentificador</p>
                        <p className="text-red-500 text-sm">No establecido</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-[#2BEE79] hover:text-[#2BEE79]/80 hover:bg-[#2BEE79]/10">
                      Cambiar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA: VERIFICACIÓN DE PERFIL */}
            {activeTab === 'verificacion' && (
              <div className="bg-[#144214] rounded-lg border border-white/5 p-6">
                <h3 className="text-2xl font-bold text-[#2BEE79] mb-4">Verificación de Perfil con IA</h3>
                <p className="text-gray-300 mb-6">
                  Verifica tu identidad subiendo una foto con tu rostro y tu documento de identidad en mano. 
                  Nuestra IA comparará tu foto con tu ID y las fotos de tu perfil para confirmar tu autenticidad.
                </p>

                {verificationResult === null && !uploadingPhoto && (
                  <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg bg-black/20">
                    <i className="fas fa-id-card text-6xl text-gray-600 mb-4"></i>
                    <p className="text-white font-semibold mb-2">Sube una foto con tu rostro + ID en mano</p>
                    <p className="text-gray-400 text-sm mb-6">La foto debe mostrar claramente tu cara y tu documento de identidad</p>
                    
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <span className="inline-block px-6 py-3 bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold rounded-lg cursor-pointer transition-all shadow-[0_0_20px_rgba(43,238,121,0.4)] hover:shadow-[0_0_30px_rgba(43,238,121,0.6)]">
                        <i className="fas fa-upload mr-2"></i>
                        Subir foto
                      </span>
                    </label>
                  </div>
                )}

                {uploadingPhoto && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white font-semibold">Espera un momento...</p>
                    <p className="text-gray-400 text-sm">La IA está verificando tu identidad</p>
                  </div>
                )}

                {verificationResult === 'success' && (
                  <div className="text-center py-12 bg-green-600/20 rounded-lg border border-green-500">
                    <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                    <p className="text-white font-bold text-2xl mb-2">¡Perfil Auténtico!</p>
                    <p className="text-gray-300">Tu identidad ha sido verificada exitosamente</p>
                    <p className="text-sm text-gray-400 mt-4">Las fotos se han eliminado automáticamente por seguridad</p>
                  </div>
                )}

                {verificationResult === 'failed' && (
                  <div className="text-center py-12 bg-red-600/20 rounded-lg border border-red-500">
                    <i className="fas fa-times-circle text-6xl text-red-500 mb-4"></i>
                    <p className="text-white font-bold text-2xl mb-2">Verificación Fallida</p>
                    <p className="text-gray-300">No pudimos verificar tu identidad</p>
                    <Button onClick={() => setVerificationResult(null)} className="mt-6 bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)]">
                      Intentar de nuevo
                    </Button>
                  </div>
                )}

                {profileVerified && (
                  <div className="mt-6 p-4 bg-green-600/10 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-badge-check text-green-500 text-2xl"></i>
                      <div>
                        <p className="text-white font-semibold">Perfil Verificado</p>
                        <p className="text-sm text-gray-400">Tu perfil tiene el sello de verificación ✓</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA: CAMBIO DE CONTRASEÑA */}
            {activeTab === 'contrasena' && (
              <div className="bg-[#144214] rounded-lg border border-white/5 p-6">
                <h3 className="text-2xl font-bold text-[#2BEE79] mb-4">Cambio de contraseña</h3>
                
                <div className="p-4 bg-green-600/20 rounded-lg border border-green-500 mb-6">
                  <p className="text-green-400 font-semibold">Dirección de correo electrónico esta confirmado</p>
                </div>

                <p className="text-gray-300 mb-6">
                  Si olvida su contraseña, solo le enviaremos la nueva información a contactos verificados. 
                  <strong> Estos datos no revelaremos nunca a ningún parte</strong>
                </p>

                <p className="text-white font-semibold mb-2">Cambio de datos esta protegido</p>
                <p className="text-gray-300 mb-4">Su correo electrónico verificado es: <span className="font-mono">Cr****38@gmail.com</span></p>

                <p className="text-white font-semibold mb-2">Para realizar cambios escribe tu correo electrónico entero</p>
                <Input
                  type="email"
                  placeholder="Escribe su correo electrónico"
                  value={passwordEmail}
                  onChange={(e) => setPasswordEmail(e.target.value)}
                  className="mb-6 bg-white/10 border-white/20 text-white"
                />

                <Button className="bg-[#2BEE79] hover:bg-[#2BEE79]/90 text-black font-semibold shadow-[0_0_20px_rgba(43,238,121,0.4)] w-full">
                  Cambia la contraseña
                </Button>
              </div>
            )}

            {/* PESTAÑA: ELIMINAR CUENTA */}
            {activeTab === 'eliminar' && (
              <div className="bg-[#144214] rounded-lg border border-white/5 p-6">
                <h3 className="text-2xl font-bold text-orange-500 mb-4">ELIMINACION DE TU CUENTA</h3>
                <p className="text-gray-300 mb-6">
                  Tu cuenta personal puedes eliminar en cualquier momento. 
                  Recuerda que con este paso puedes perder tus datos que se guardan en nuestro servidor.
                </p>

                <div className="space-y-3 mb-8 text-gray-300">
                  <p>Todos tus datos personales que usaste para crear tu perfil</p>
                  <p>Fotos y sus respetivos comentarios en <strong>Foto Galeria</strong></p>
                  <p>Anuncios que publicaste en <strong>Mercadillo</strong> e <strong>Yo lo hago bien</strong></p>
                  <p>Toda comunicación por salas de chat incluido mensajes privados.</p>
                  <p>Privilegios obtenidos o comprados por activación de programa <strong>+PLUS</strong> sin derecho de reembolso.</p>
                </div>

                <Button 
                  onClick={handleDeleteAccount} 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 text-lg shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:shadow-[0_0_30px_rgba(251,146,60,0.6)] transition-all"
                >
                  Eliminar la cuenta
                </Button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
