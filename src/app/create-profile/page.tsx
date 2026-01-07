"use client";

import { useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCountries } from "../../hooks/useCountries";
import PhotoManager, { Photo } from "@/components/PhotoManager";

// =================== COMPONENTE: CREAR PERFIL ===================
// 
// ====================================================================
// FLUJO COMPLETO DE REGISTRO Y VERIFICACIÓN - DOCUMENTACIÓN COMPLETA
// ====================================================================
//
// Este componente maneja DOS modos:
// 1. MODO REGISTRO (editMode=false): Usuario nuevo creando su cuenta
// 2. MODO EDICIÓN (editMode=true): Usuario existente editando sus datos básicos
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 FASE 1: FORMULARIO DE REGISTRO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// CAMPOS OBLIGATORIOS:
// -------------------
// • Nombre (apodo/nick):
//   - Mínimo 3 caracteres, máximo 12
//   - Solo letras, números, guión bajo
//   - Verificación en tiempo real (debounce 500ms)
//   - API: GET /api/check-username?username=XXX
//   - Muestra: ✓ disponible | ! ya en uso | spinner verificando
//
// • Email (escribir DOS VECES): ✅ Campo emailConfirm existe
//   - Campo 1: email
//   - Campo 2: emailConfirm (debe coincidir)
//   - Validación de formato
//   - Verificación de que no esté registrado en DB
//
// • Contraseña (escribir DOS VECES): ✅ Campo passwordConfirm existe
//   - Campo 1: password
//   - Campo 2: passwordConfirm (debe coincidir)
//   - ⚠️ IMPORTANTE: Mínimo 8 CARACTERES (NO "puntos")
//   - Debe incluir: mayúscula, minúscula, número, símbolo
//
// • Sexo:
//   - Solo 2 opciones: Hombre / Mujer
//
// • Fecha de nacimiento:
//   - Debe ser real (se usa para verificación +18)
//   - Solo se puede cambiar 1 vez después del registro
//   - Crítico para acceso a salas +18
//
// • País (dropdown): Por defecto Venezuela (VE)
// • Ciudad (dropdown dinámico según país)
// • ¿Qué buscas?: Amistad, Pareja, Conversación, etc.
// • ¿Dónde buscas?: País y opcionalmente ciudad
//
// FOTO DE PERFIL (sidebar izquierdo):
// ----------------------------------
// • Se sube DURANTE el registro (NO después) ✅
// • Proporción 10:13
// • Máximo 5MB original → redimensiona a 400px ancho
// • Formatos: JPG, PNG
// • Requisitos:
//   - Foto real y actual (máximo 6 meses)
//   - Una sola persona
//   - Cara claramente visible (50%+)
//   - Centrada en el cuadro
//   - Sin filtros excesivos
// • Puede subir TODAS las fotos que quiera (SIN LÍMITE)
// • ⚠️ IMPORTANTE: Eliminado el límite de 6 fotos de perfil
// • Marca una como "principal" (⭐)
// • Todas quedan en estado "pendiente" hasta aprobación
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 FASE 2: ENVÍO DEL FORMULARIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// DOS BOTONES AL FINAL:
// ---------------------
// 1. "Crear y Empezar":
//    → Registro mínimo
//    → Puede completar perfil después
//    → Redirige a verificación de email
//
// 2. "Crear y Completar Perfil":
//    → Mismo flujo inicial
//    → Después de verificar email, redirige a edición de perfil
//
// AL HACER CLIC EN CUALQUIER BOTÓN:
// ---------------------------------
// BACKEND debe (TODO: Implementar API /api/auth/register):
//   1. Validar todos los campos
//   2. Verificar email único en DB
//   3. Verificar nick único en DB
//   4. Hash de contraseña (bcrypt)
//   5. Generar código de verificación de 6 dígitos aleatorio (ej: 482735)
//   6. Guardar en tabla users:
//      {
//        id: uuid,
//        nick: string,
//        email: string,
//        password_hash: string,
//        sex: string,
//        birth_date: date,
//        country_code: string,
//        city: string,
//        email_verified: false,  ← IMPORTANTE
//        phone_verified: false,  ← IMPORTANTE
//        id_verified: false,     ← IMPORTANTE
//        created_at: timestamp
//      }
//   7. Guardar en tabla verification_codes:
//      {
//        id: uuid,
//        user_id: uuid (FK),
//        code: string (encriptado con bcrypt),
//        type: 'email',
//        expires_at: NOW() + 60 segundos,  ← DECISIÓN FINAL: 60 segundos
//        attempts: 0,
//        created_at: timestamp
//      }
//   8. Enviar email con código usando servicio de email (ej: SendGrid, AWS SES)
//   9. Responder: { success: true, user_id: uuid }
//
// FRONTEND debe (TODO: Implementar EmailVerificationModal):
//   1. Recibir respuesta exitosa del backend
//   2. Abrir EmailVerificationModal AUTOMÁTICAMENTE
//   3. Modal BLOQUEA TODA LA APP (no se puede cerrar con X, ESC, click fuera)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧 FASE 3: VERIFICACIÓN DE EMAIL (CRÍTICA)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// MODAL DE VERIFICACIÓN (TODO: Crear componente EmailVerificationModal.tsx):
// --------------------------------------------------------------------------
// Elementos del modal:
//   • Título: "Verifica tu correo electrónico"
//   • Texto: "Hemos enviado un código de 6 dígitos a [email]"
//   • Input de 6 dígitos (solo números, auto-focus)
//   • Temporizador: Cuenta regresiva de 60 segundos
//   • Botón "Verificar" (deshabilitado si no hay 6 dígitos)
//   • Botón "Reenviar código" (deshabilitado hasta que expire el timer)
//   • Link: "¿No recibiste el código? Revisa spam"
//
// Restricciones del modal:
//   ❌ NO tiene botón X (cerrar)
//   ❌ NO se cierra haciendo clic fuera
//   ❌ NO se cierra con tecla ESC
//   ✅ SOLO se cierra al verificar correctamente
//   ✅ Opciones: "Verificar" o "Reenviar código"
//
// FLUJO DE VERIFICACIÓN:
// ---------------------
// 1. Usuario introduce código de 6 dígitos
// 2. Click en "Verificar"
// 3. Frontend envía: POST /api/auth/verify-email { code, user_id }
// 4. Backend valida:
//    - Código correcto (comparar con bcrypt)
//    - No expirado (expires_at > NOW())
//    - Máximo 3 intentos (attempts < 3)
//
// SI CÓDIGO ES CORRECTO:
//   ✅ Actualizar users.email_verified = true
//   ✅ Generar JWT token de sesión
//   ✅ Cerrar modal
//   ✅ Redirigir según botón usado:
//      - "Crear y Empezar" → /dashboard (ya logeado)
//      - "Crear y Completar Perfil" → /userprofile?edit=true (ya logeado)
//
// SI CÓDIGO ES INCORRECTO:
//   ❌ Incrementar attempts en DB
//   ❌ Mostrar error: "Código incorrecto. Te quedan X intentos"
//   ❌ Si attempts >= 3:
//      - Mostrar: "Demasiados intentos. Por favor solicita un nuevo código"
//      - Habilitar botón "Reenviar código"
//
// SI CÓDIGO EXPIRA (60 segundos):
//   ⏱️ Mostrar: "El código ha expirado"
//   ⏱️ Habilitar botón "Reenviar código"
//   ⏱️ Al reenviar:
//      - Generar nuevo código
//      - Resetear timer a 60s
//      - Resetear attempts a 0
//      - Enviar nuevo email
//
// ⚠️ ¿QUÉ PASA SI EL USUARIO CIERRA EL NAVEGADOR?
//    → Al reabrir: detectar que hay usuario sin email_verified
//    → Mostrar modal de verificación inmediatamente
//    → Puede solicitar reenvío de código
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ SIGUIENTE PASO: VERIFICACIÓN DE TELÉFONO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ⚠️ La verificación de teléfono NO se hace en esta página.
// Se hace DESPUÉS de verificar email, en:
//   - /security (sección "Verificación de teléfono")
//   - Ver documentación completa en: src/app/security/page.tsx
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 MODO EDICIÓN (editMode=true)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// FLUJO:
// 1. Usuario ya logeado edita sus datos básicos
// 2. Click en "Guardar Cambios" → actualiza DB → vuelve a su perfil
// 3. NO requiere verificación de email (ya verificado)
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 NOTAS FINALES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ✅ Email y contraseña SE ESCRIBEN DOS VECES
// ✅ "8 puntos" es ERROR → debe ser "8 caracteres"
// ✅ NO existe "inicio de sesión por primera vez"
// ✅ Foto se sube DURANTE el registro (no después)
// ✅ Verificación de teléfono viene DESPUÉS de email
// ✅ Verificación de ID disponible para TODOS (no solo PLUS)
// ✅ PLUS NO es "mensajes ilimitados"
//
// ====================================================================
// FIN DE LA DOCUMENTACIÓN COMPLETA
// ====================================================================
//
function CrearPerfilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const editMode = searchParams.get("edit") === "true"; // Detectar modo edición
  
  // Simular si el usuario está logueado (en producción, esto vendría de un contexto de autenticación)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Estado de verificación de nombre (apodo)
  const [nombreStatus, setNombreStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [nombreCheckTimeout, setNombreCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [profileData, setProfileData] = useState({
    nombre: "",
    email: "",
    emailConfirm: "",
    password: "",
    passwordConfirm: "",
    sexo: "",
    fechaNacimiento: "",
    paisCodigo: "VE", // Código del país donde vive
    paisNombre: "Venezuela",
    ciudad: "",
    estado: "", // Se detecta automáticamente
    queBusca: "",
    // Dónde busca pareja
    buscarParejaPaisCodigo: "", // País donde busca pareja
    buscarParejaPaisNombre: "",
    buscarParejaCiudad: "", // Solo si es el mismo país
    buscarParejaEstado: "", // Solo si es el mismo país
  });
  
  // Cargar datos del usuario si está en modo edición
  useEffect(() => {
    // TODO: En producción, verificar si el usuario está logueado
    // const user = getLoggedInUser();
    // setIsLoggedIn(!!user);
    
    // Simular usuario logueado en modo edición
    if (editMode) {
      setIsLoggedIn(true);
      // TODO: Cargar datos del backend
      // const userData = await fetchUserProfile();
      // Simulación de datos pre-cargados
      setProfileData({
        nombre: "Ana_M",
        email: "ana@example.com",
        emailConfirm: "ana@example.com",

        password: "********",
        passwordConfirm: "********",
        sexo: "mujer",
        fechaNacimiento: "2000-05-15",
        paisCodigo: "VE",
        paisNombre: "Venezuela",
        ciudad: "Caracas",
        estado: "Distrito Capital",
        queBusca: "pareja",
        buscarParejaPaisCodigo: "VE",
        buscarParejaPaisNombre: "Venezuela",
        buscarParejaCiudad: "Caracas",
        buscarParejaEstado: "Distrito Capital",
      });
      
      // Simulación de fotos pre-cargadas
      setFotos([
        {
          id: "1",
          url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw",
          esPrincipal: true,
          estado: "aprobada"
        }
      ]);
    }
  }, [editMode]);

  // Estado para fotos de perfil
  const [fotos, setFotos] = useState<Photo[]>([]);

  // Hook para manejar países/ciudades (ubicación actual)
  const { countries, getCities, getStateByCity } = useCountries(profileData.paisCodigo);
  const [availableCities, setAvailableCities] = useState<Array<{name: string; state: string}>>([]);
  
  // Hook para manejar ciudades de búsqueda de pareja
  const { 
    getCities: getBuscarCities, 
    getStateByCity: getBuscarStateByCity 
  } = useCountries(profileData.buscarParejaPaisCodigo);
  const [buscarAvailableCities, setBuscarAvailableCities] = useState<Array<{name: string; state: string}>>([]);

  // Actualizar ciudades cuando cambia el país
  useEffect(() => {
    if (profileData.paisCodigo) {
      const cities = getCities(profileData.paisCodigo);
      setAvailableCities(cities);
      // Reset ciudad y estado al cambiar país
      setProfileData(prev => ({ ...prev, ciudad: "", estado: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.paisCodigo]);

  // Detectar estado cuando se selecciona una ciudad
  useEffect(() => {
    if (profileData.paisCodigo && profileData.ciudad) {
      const state = getStateByCity(profileData.paisCodigo, profileData.ciudad);
      if (state && state !== profileData.estado) {
        setProfileData(prev => ({ ...prev, estado: state }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.paisCodigo, profileData.ciudad]);

  // Actualizar ciudades de búsqueda cuando cambia el país de búsqueda
  useEffect(() => {
    if (profileData.buscarParejaPaisCodigo) {
      const cities = getBuscarCities(profileData.buscarParejaPaisCodigo);
      setBuscarAvailableCities(cities);
      // Reset ciudad y estado de búsqueda al cambiar país
      setProfileData(prev => ({ ...prev, buscarParejaCiudad: "", buscarParejaEstado: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.buscarParejaPaisCodigo]);

  // Detectar estado de búsqueda cuando se selecciona una ciudad
  useEffect(() => {
    if (profileData.buscarParejaPaisCodigo && profileData.buscarParejaCiudad) {
      const state = getBuscarStateByCity(profileData.buscarParejaPaisCodigo, profileData.buscarParejaCiudad);
      if (state && state !== profileData.buscarParejaEstado) {
        setProfileData(prev => ({ ...prev, buscarParejaEstado: state }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.buscarParejaPaisCodigo, profileData.buscarParejaCiudad]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find(c => c.code === selectedCode);
    if (selectedCountry) {
      setProfileData(prev => ({
        ...prev,
        paisCodigo: selectedCode,
        paisNombre: selectedCountry.name,
      }));
    }
  };

  const handleBuscarParejaCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selectedCountry = countries.find(c => c.code === selectedCode);
    if (selectedCountry) {
      setProfileData(prev => ({
        ...prev,
        buscarParejaPaisCodigo: selectedCode,
        buscarParejaPaisNombre: selectedCountry.name,
      }));
    }
  };

  // =================== HANDLER: CONTINUAR/GUARDAR ===================
  // TODO: Este handler es para MODO EDICIÓN únicamente
  // En modo registro, NO se usa este handler - ver botones de abajo
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar datos básicos en la base de datos
    console.log(editMode ? "Datos actualizados:" : "Datos básicos guardados:", profileData);
    
    if (editMode) {
      // Modo edición: Quedarse en create-profile
      alert("Datos básicos actualizados exitosamente");
    } else {
      // Modo registro: Redirigir al dashboard
      alert("¡Registro completado! Bienvenido a LoCuToRiO");
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    // Guardar datos básicos mínimos si los hay
    console.log("Saltando al inicio:", profileData);
    
    // Redirigir a inicio
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace("/dashboard");
    }
  };

  // =================== HANDLER: CREAR Y EMPEZAR ===================
  const handleCrearYEmpezar = async () => {
    try {
      // Validar datos básicos
      if (!profileData.nombre || !profileData.email || !profileData.password) {
        alert("Por favor completa los campos obligatorios: Nombre, Email y Contraseña");
        return;
      }

      // Validar email
      if (profileData.email !== profileData.emailConfirm) {
        alert("Los emails no coinciden");
        return;
      }

      // Validar contraseña
      if (profileData.password !== profileData.passwordConfirm) {
        alert("Las contraseñas no coinciden");
        return;
      }

      console.log("📤 Iniciando registro de usuario...");

      // 1. REGISTRAR USUARIO (Auth + perfil en DB)
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: profileData.nombre,
          email: profileData.email,
          password: profileData.password,
          sexo: profileData.sexo,
          fechaNacimiento: profileData.fechaNacimiento,
          paisCodigo: profileData.paisCodigo,
          paisNombre: profileData.paisNombre,
          ciudad: profileData.ciudad,
          estado: profileData.estado,
          queBusca: profileData.queBusca,
          buscarParejaPaisCodigo: profileData.buscarParejaPaisCodigo,
          buscarParejaPaisNombre: profileData.buscarParejaPaisNombre,
          buscarParejaCiudad: profileData.buscarParejaCiudad,
          buscarParejaEstado: profileData.buscarParejaEstado,
        }),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Error al registrar usuario');
      }

      console.log("✅ Usuario registrado:", registerResult.user.username);

      // 2. SUBIR FOTO (si existe)
      if (fotos.length > 0 && fotos[0].url) {
        console.log("📤 Subiendo foto de perfil...");
        
        try {
          // Convertir URL de blob a File
          const response = await fetch(fotos[0].url);
          const blob = await response.blob();
          const file = new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('username', profileData.nombre);
          formData.append('isPrincipal', 'true');

          const uploadResponse = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResponse.ok) {
            console.log("✅ Foto subida exitosamente");
          } else {
            console.warn("⚠️ Error al subir foto:", uploadResult.error);
            // No bloqueamos el registro si falla la foto
          }
        } catch (photoError) {
          console.warn("⚠️ Error al procesar foto:", photoError);
          // No bloqueamos el registro si falla la foto
        }
      }

      // 3. MOSTRAR MENSAJE DE ÉXITO
      alert("¡Perfil creado exitosamente! Bienvenido a LoCuToRiO\n\nRevisa tu email para verificar tu cuenta.");

      // 4. REDIRIGIR A DASHBOARD (Mi Espacio)
      router.push("/dashboard");
      
    } catch (error) {
      console.error("❌ Error al crear perfil:", error);
      alert(`Hubo un error al crear el perfil:\n${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // =================== HANDLER: CREAR Y COMPLETAR PERFIL ===================
  const handleCrearYCompletar = async () => {
    try {
      // Validar datos básicos
      if (!profileData.nombre || !profileData.email || !profileData.password) {
        alert("Por favor completa los campos obligatorios: Nombre, Email y Contraseña");
        return;
      }

      // Validar email
      if (profileData.email !== profileData.emailConfirm) {
        alert("Los emails no coinciden");
        return;
      }

      // Validar contraseña
      if (profileData.password !== profileData.passwordConfirm) {
        alert("Las contraseñas no coinciden");
        return;
      }

      console.log("📤 Iniciando registro de usuario...");

      // 1. REGISTRAR USUARIO (mismo proceso que "Crear y Empezar")
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: profileData.nombre,
          email: profileData.email,
          password: profileData.password,
          sexo: profileData.sexo,
          fechaNacimiento: profileData.fechaNacimiento,
          paisCodigo: profileData.paisCodigo,
          paisNombre: profileData.paisNombre,
          ciudad: profileData.ciudad,
          estado: profileData.estado,
          queBusca: profileData.queBusca,
          buscarParejaPaisCodigo: profileData.buscarParejaPaisCodigo,
          buscarParejaPaisNombre: profileData.buscarParejaPaisNombre,
          buscarParejaCiudad: profileData.buscarParejaCiudad,
          buscarParejaEstado: profileData.buscarParejaEstado,
        }),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Error al registrar usuario');
      }

      console.log("✅ Usuario registrado:", registerResult.user.username);

      // 2. SUBIR FOTO (si existe)
      if (fotos.length > 0 && fotos[0].url) {
        console.log("📤 Subiendo foto de perfil...");
        
        try {
          const response = await fetch(fotos[0].url);
          const blob = await response.blob();
          const file = new File([blob], 'foto-perfil.jpg', { type: 'image/jpeg' });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('username', profileData.nombre);
          formData.append('isPrincipal', 'true');

          const uploadResponse = await fetch('/api/photos/upload', {
            method: 'POST',
            body: formData
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResponse.ok) {
            console.log("✅ Foto subida exitosamente");
          } else {
            console.warn("⚠️ Error al subir foto:", uploadResult.error);
          }
        } catch (photoError) {
          console.warn("⚠️ Error al procesar foto:", photoError);
        }
      }

      // 3. MOSTRAR MENSAJE DE ÉXITO
      alert("¡Perfil creado exitosamente!\n\nAhora puedes completar tu información adicional.\n\nRevisa tu email para verificar tu cuenta.");

      // 4. REDIRIGIR A USERPROFILE EN MODO EDICIÓN
      router.push("/userprofile?edit=true");
      
    } catch (error) {
      console.error("❌ Error al crear perfil:", error);
      alert(`Hubo un error al crear el perfil:\n${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812]">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="size-12 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">LoCuToRiO</span>
          </Link>
          
          {/* Botón Volver */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link 
              href={isLoggedIn ? "/userprofile" : "/"}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Volver</span>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {editMode ? "Editar Datos Básicos" : "¡Bienvenido!"}
          </h1>
          <p className="text-gray-400">
            {editMode ? "Actualiza tu información básica" : "Cuéntanos un poco sobre ti para empezar"}
          </p>
        </div>

        {/* Layout con Sidebar + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Sidebar izquierdo con foto */}
          <div className="lg:col-span-1">
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-xl p-4 shadow-lg sticky top-24 space-y-4">
              
              {/* =================== FOTO DE PERFIL (EN SIDEBAR) =================== */}
              <PhotoManager
                initialPhotos={fotos}
                canUpload={true}
                canDelete={true}
                canSetPrincipal={true}
                canToggleCarousel={true}
                onPhotosChange={(photos) => {
                  setFotos(photos);
                }}
                showCarousel={true}
              />
            </div>
          </div>

          {/* Contenido derecho: Formulario de Datos básicos */}
          <div className="lg:col-span-3">
            <div className="bg-connect-bg-dark/60 backdrop-blur-sm border border-connect-border rounded-2xl p-8 shadow-xl shadow-neon-green/5">
              <form onSubmit={handleContinue} className="space-y-6">
            {/* Nombre (apodo) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre (apodo) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tu apodo (máximo 12 caracteres incluido letras, símbolos, números y espacio)"
                  value={profileData.nombre}
                  maxLength={12}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setProfileData({ ...profileData, nombre: newName });
                    
                    // Limpiar timeout anterior
                    if (nombreCheckTimeout) clearTimeout(nombreCheckTimeout);
                    
                    if (newName.length >= 3 && !editMode) {
                      setNombreStatus("checking");
                      
                      // Verificar disponibilidad después de 500ms
                      const timeout = setTimeout(async () => {
                        try {
                          const response = await fetch(`/api/check-username?username=${encodeURIComponent(newName)}`);
                          const data = await response.json();
                          setNombreStatus(data.available ? "available" : "taken");
                        } catch (err) {
                          setNombreStatus("idle");
                        }
                      }, 500);
                      
                      setNombreCheckTimeout(timeout);
                    } else {
                      setNombreStatus("idle");
                    }
                  }}
                  className={`bg-connect-bg-dark/80 text-white placeholder:text-gray-500 transition-all ${
                    nombreStatus === "available" ? "border-2 border-green-500" :
                    nombreStatus === "taken" ? "border-2 border-orange-500" :
                    "border border-connect-border"
                  }`}
                  required
                  disabled={editMode}
                />
                {/* Icono de estado */}
                {nombreStatus !== "idle" && !editMode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nombreStatus === "checking" && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    )}
                    {nombreStatus === "available" && (
                      <span className="text-green-500 text-xl">✓</span>
                    )}
                    {nombreStatus === "taken" && (
                      <span className="text-orange-500 text-xl">!</span>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-400">
                  💡 No es necesario poner tu nombre verdadero. Elige un apodo que te guste.
                </p>
                {nombreStatus === "available" && !editMode && (
                  <p className="text-xs text-green-400">
                    ✅ Este nick está disponible
                  </p>
                )}
                {nombreStatus === "taken" && !editMode && (
                  <p className="text-xs text-orange-400">
                    ⚠️ Este nick ya está en uso. Elige otro.
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                required
                disabled={editMode}
              />
              {!editMode && (
                <p className="text-xs text-orange-400 mt-2">
                  ⚠️ Solo puedes registrar <strong>un nick</strong> a <strong>un email</strong>. No se permiten múltiples cuentas.
                </p>
              )}
            </div>

            {/* Confirmar Email */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar correo electrónico <span className="text-red-400">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Repite tu correo"
                  value={profileData.emailConfirm}
                  onChange={(e) => setProfileData({ ...profileData, emailConfirm: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
              </div>
            )}


            {/* Contraseña */}
            {/* REQUISITOS:
                - Mínimo 8 CARACTERES (NO "puntos")
                - Debe incluir al menos:
                  * Una letra MAYÚSCULA (A-Z)
                  * Una letra minúscula (a-z)
                  * Un número (0-9)
                  * Un símbolo (ej: @, #, $, %, !, &, etc.)
                - Ejemplos válidos: "Hola123!", "MiPass#99", "Secret$2024"
                - Ejemplos inválidos: "hola1234" (sin mayúscula), "Hola" (muy corta), "HolaMundo" (sin número/símbolo)
                
                TODO BACKEND: Validar estos requisitos antes de aceptar registro
            */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Debe incluir al menos mayúsculas, minúsculas y números
                </p>
              </div>
            )}

            {/* Confirmar Contraseña */}
            {!editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña <span className="text-red-400">*</span>
                </label>
                <Input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={profileData.passwordConfirm}
                  onChange={(e) => setProfileData({ ...profileData, passwordConfirm: e.target.value })}
                  className="bg-connect-bg-dark/80 border-connect-border text-white placeholder:text-gray-500"
                  required
                />
              </div>
            )}

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Sexo <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Hombre", "Mujer", "Otro"].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      profileData.sexo === option.toLowerCase()
                        ? "bg-neon-green/20 border-neon-green text-neon-green"
                        : "bg-connect-bg-dark/60 border-connect-border text-gray-400 hover:border-neon-green/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sexo"
                      value={option.toLowerCase()}
                      checked={profileData.sexo === option.toLowerCase()}
                      onChange={(e) => setProfileData({ ...profileData, sexo: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de Nacimiento <span className="text-red-400">*</span>
              </label>
              <Input
                type="date"
                value={profileData.fechaNacimiento}
                onChange={(e) => setProfileData({ ...profileData, fechaNacimiento: e.target.value })}
                className="bg-connect-bg-dark/80 border-connect-border text-white"
                required
              />
              <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-xs text-orange-300">
                  ⚠️ <strong>Por favor, pon tu fecha de nacimiento real.</strong> Luego se puede cambiar solo <strong>una vez</strong>. 
                  En caso de verificación de perfil con ID, no sería posible verificar con fecha de nacimiento incorrecta.
                </p>
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.paisCodigo}
                  onChange={handleCountryChange}
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
                  required
                >
                  <option value="">Selecciona tu país</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ciudad <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.ciudad}
                  onChange={(e) => setProfileData({ ...profileData, ciudad: e.target.value })}
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
                  required
                  disabled={!profileData.paisCodigo}
                >
                  <option value="">Selecciona tu ciudad</option>
                  {availableCities.map((city, index) => (
                    <option key={`${city.name}-${index}`} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {profileData.paisCodigo && availableCities.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No hay ciudades disponibles para este país</p>
                )}
              </div>

              {/* Mostrar estado detectado */}
              {profileData.estado && (
                <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    📍 Estado/Departamento: <span className="text-neon-green font-medium">{profileData.estado}</span>
                  </p>
                </div>
              )}
            </div>

            {/* ¿Qué buscas? */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Qué buscas? <span className="text-red-400">*</span>
              </label>
              <select
                value={profileData.queBusca}
                onChange={(e) => setProfileData({ ...profileData, queBusca: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-connect-bg-dark/80 border border-connect-border text-white focus:border-primary/50 focus:outline-none"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="pareja">Encontrar pareja</option>
                <option value="amistad">Amistad</option>
                <option value="conversar">Conversar / Chatear</option>
                <option value="aventuras">Aventuras sin compromiso</option>
                <option value="nosé">No sé aún</option>
              </select>
            </div>

            {/* ¿Dónde buscas pareja? */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿Dónde buscas pareja? <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileData.buscarParejaPaisCodigo}
                  onChange={handleBuscarParejaCountryChange}
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
                  required
                >
                  <option value="">Selecciona un país</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mostrar selector de ciudad SOLO si es el mismo país */}
              {profileData.buscarParejaPaisCodigo && profileData.buscarParejaPaisCodigo === profileData.paisCodigo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ¿En qué ciudad?
                    </label>
                    <select
                      value={profileData.buscarParejaCiudad}
                      onChange={(e) => setProfileData({ ...profileData, buscarParejaCiudad: e.target.value })}
                      className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white focus:border-primary/50 focus:outline-none"
                    >
                      <option value="">Cualquier ciudad</option>
                      {buscarAvailableCities.map((city, index) => (
                        <option key={`${city.name}-${index}`} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mostrar estado detectado para búsqueda */}
                  {profileData.buscarParejaEstado && (
                    <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-3">
                      <p className="text-xs text-gray-300">
                        📍 Buscando en: <span className="text-neon-green font-medium">{profileData.buscarParejaEstado}</span>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Info cuando busca en otro país */}
              {profileData.buscarParejaPaisCodigo && profileData.buscarParejaPaisCodigo !== profileData.paisCodigo && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-xs text-gray-300">
                    🌍 Buscando pareja en cualquier ciudad de <span className="text-blue-400 font-medium">{profileData.buscarParejaPaisNombre}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-connect-border">
              {editMode ? (
                <Button
                  type="submit"
                  className="flex-1 bg-neon-green text-forest-dark hover:brightness-110 hover:shadow-lg hover:shadow-neon-green/30 font-bold py-6 text-base"
                >
                  💾 Guardar Cambios
                </Button>
              ) : (
                <>
                  {/* =================== BOTÓN 1: CREAR Y EMPEZAR =================== */}
                  {/* FLUJO COMPLETO:
                      1. VALIDACIONES FRONTEND:
                         - Verificar que nombre tenga mínimo 3 caracteres
                         - Verificar que email y emailConfirm coincidan
                         - Verificar que password y passwordConfirm coincidan
                         - Verificar que password tenga mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos
                         - Verificar que todos los campos obligatorios (*) estén llenos
                         - Verificar que haya al menos 1 foto subida
                      
                      2. ENVÍO AL BACKEND (POST /api/auth/register):
                         Body: {
                           nombre: profileData.nombre,
                           email: profileData.email,
                           password: profileData.password,
                           sexo: profileData.sexo,
                           fechaNacimiento: profileData.fechaNacimiento,
                           paisCodigo: profileData.paisCodigo,
                           ciudad: profileData.ciudad,
                           estado: profileData.estado,
                           queBusca: profileData.queBusca,
                           buscarParejaPaisCodigo: profileData.buscarParejaPaisCodigo,
                           buscarParejaCiudad: profileData.buscarParejaCiudad,
                           fotos: fotos,
                           completarPerfilDespues: true // Indica "Crear y Empezar"
                         }
                      
                      3. BACKEND DEBE:
                         a) Validar que email no esté registrado (unique constraint)
                         b) Validar que nombre (nick) no esté en uso (unique constraint)
                         c) Hash de la contraseña (bcrypt)
                         d) Crear usuario en DB con email_verified=false
                         e) Generar código de verificación de 6 dígitos aleatorio (ej: 482735)
                         f) Guardar código en tabla verification_codes:
                            - user_id
                            - code (hash del código, NO plain text)
                            - type: 'email'
                            - expires_at: NOW() + 5 minutos
                            - attempts: 0
                         g) Enviar email con el código a profileData.email
                            Asunto: "Verifica tu cuenta en LoCuToRiO"
                            Contenido: "Tu código de verificación es: 482735. Expira en 5 minutos."
                         h) Response: { success: true, userId, message: "Código enviado" }
                      
                      4. FRONTEND RECIBE RESPUESTA:
                         a) Mostrar componente <EmailVerificationModal> (crear componente nuevo)
                         b) Modal tiene estas características:
                            - NO se puede cerrar con X
                            - NO se puede cerrar haciendo clic fuera
                            - NO se puede cerrar con tecla ESC
                            - Bloquea TODA la aplicación
                         c) Modal muestra:
                            - Título: "Verifica tu correo electrónico"
                            - Texto: "Hemos enviado un código de 6 dígitos a [profileData.email]"
                            - Input para 6 dígitos (solo números)
                            - Temporizador: "Expira en 04:32" (decrementa cada segundo)
                            - Botón "Verificar" (siempre habilitado)
                            - Botón "Reenviar código" (se habilita después de 60 segundos)
                            - Link: "¿No recibiste el código? Revisa tu carpeta de spam"
                      
                      5. USUARIO INTRODUCE CÓDIGO:
                         a) Al hacer clic en "Verificar" → POST /api/verify-email
                            Body: { userId, code: "482735" }
                         b) Backend valida:
                            - Código existe y coincide (comparar hash)
                            - Código NO ha expirado (expires_at > NOW())
                            - Intentos < 3
                         c) Si código CORRECTO:
                            - Actualizar usuario: email_verified=true
                            - Generar JWT token
                            - Response: { success: true, token }
                            - Frontend: 
                              * Cerrar modal
                              * Guardar token en cookie/localStorage
                              * Redirigir a /dashboard (usuario ya logeado)
                         d) Si código INCORRECTO:
                            - Incrementar attempts en DB
                            - Response: { success: false, error: "Código incorrecto", attemptsLeft: 2 }
                            - Frontend: Mostrar error debajo del input
                            - Si attempts >= 3: Bloquear durante 5 minutos
                         e) Si código EXPIRADO:
                            - Response: { success: false, error: "Código expirado" }
                            - Frontend: Mostrar mensaje "El código ha expirado. Solicita uno nuevo."
                      
                      6. REENVIAR CÓDIGO:
                         a) Click en "Reenviar código" → POST /api/resend-email-code
                            Body: { userId }
                         b) Backend:
                            - Invalidar código anterior
                            - Generar nuevo código de 6 dígitos
                            - Guardar con nuevo expires_at
                            - Enviar nuevo email
                         c) Frontend: Reiniciar temporizador a 5:00
                      
                      7. DESPUÉS DE VERIFICAR EMAIL EXITOSAMENTE:
                         Usuario está en /dashboard con sesión activa
                         Mostrar banner opcional: "¿Quieres ganar 30 días gratis de PLUS? Verifica tu teléfono"
                         (Verificación de teléfono es OPCIONAL - se hace después)
                  */}
                  <button
                    type="button"
                    onClick={handleCrearYEmpezar}
                    className="flex-1 bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] font-bold py-6 text-base rounded-lg transition-all"
                  >
                    Crear y Empezar
                  </button>
                  
                  {/* =================== BOTÓN 2: CREAR Y COMPLETAR PERFIL =================== */}
                  {/* FLUJO:
                      1-6: IDÉNTICO al botón "Crear y Empezar" (todo el proceso de verificación de email)
                      
                      7. DESPUÉS DE VERIFICAR EMAIL EXITOSAMENTE:
                         Diferencia: En lugar de ir a /dashboard, redirige a:
                         → /userprofile?edit=true (modo edición de perfil)
                         
                         En esa página el usuario puede:
                         - Añadir más fotos
                         - Completar información adicional (intereses, descripción, etc.)
                         - Verificar teléfono (opcional pero recomendado - 30 días PLUS)
                         - Verificar identidad con ID (opcional - 30 días PLUS)
                  */}
                  <button
                    type="button"
                    onClick={handleCrearYCompletar}
                    className="flex-1 bg-transparent border border-[#2BEE79]/50 text-white hover:text-[#2BEE79] shadow-[0_0_15px_rgba(43,238,121,0.3)] hover:shadow-[0_0_20px_rgba(43,238,121,0.4)] py-6 text-base font-semibold rounded-lg transition-all"
                  >
                    Crear y Completar Perfil
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Info */}
          {!editMode && (
            <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <p className="text-xs text-gray-300 text-center">
                💡 Al crear tu cuenta, aceptas nuestros <a href="/about/terminos" className="text-neon-green hover:brightness-110">Términos y condiciones</a> y <a href="/about/proteccion-datos" className="text-neon-green hover:brightness-110">Política de privacidad</a>
              </p>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CrearPerfilPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    }>
      <CrearPerfilForm />
    </Suspense>
  );
}
