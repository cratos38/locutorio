"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";
import { useMessages } from "@/contexts/MessagesContext";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type CoffeeUser = {
  id: number;
  username: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
};

export default function InicioPage() {
  const router = useRouter();
  const { user } = useAuth(); // Hook de autenticación
  const { openMessages } = useMessages();
  
  // 🔍 RASTREADOR DE USUARIO
  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('📍 PÁGINA: /dashboard (Mi Espacio)');
    console.log('👤 Usuario actual:', user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    } : '❌ NO AUTENTICADO');
    console.log('═══════════════════════════════════════');
  }, [user]);
  
  const [statusText, setStatusText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [favoriteSalas, setFavoriteSalas] = useState<string[]>([]);
  
  // Estado del perfil del usuario
  const [profileData, setProfileData] = useState({
    nombre: user?.username || '',
    edad: 0,
    ciudad: '',
    foto_perfil: '',
    amigos_count: 0,
    fotos_count: 0,
    visitas_count: 0,
  });
  
  // Estado de presencia del usuario
  const [presenceStatus, setPresenceStatus] = useState<'online' | 'busy' | 'invisible'>('online');
  const [isPlus, setIsPlus] = useState(false); // TODO: Obtener del backend
  
  // Estado de verificación
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // TODO: Obtener del backend
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.username) return;
      
      try {
        console.log('🔄 Cargando perfil de dashboard:', user.username);
        
        // Cargar perfil
        const profileResponse = await fetch(`/api/profile?username=${user.username}`);
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          
          // Cargar fotos para obtener el count
          const photosResponse = await fetch(`/api/photos?username=${user.username}`);
          let photosCount = 0;
          if (photosResponse.ok) {
            const photosData = await photosResponse.json();
            photosCount = photosData.photos?.length || 0;
          }
          
          setProfileData({
            nombre: data.nombre || user.username,
            edad: data.edad || 0,
            ciudad: data.ciudad || data.vives_en || '',
            foto_perfil: data.foto_perfil || '',
            amigos_count: 0, // TODO: Implementar conteo de amigos
            fotos_count: photosCount,
            visitas_count: 0, // TODO: Implementar conteo de visitas
          });
          
          setStatusText(data.status_text || '');
          console.log('✅ Datos de dashboard cargados');
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del dashboard:', error);
      }
    };
    
    loadUserData();
  }, [user]);

  // Cargar salas favoritas desde localStorage y escuchar cambios
  useEffect(() => {
    const loadFavorites = () => {
      const savedFavorites = localStorage.getItem('chatFavorites');
      if (savedFavorites) {
        setFavoriteSalas(JSON.parse(savedFavorites));
      } else {
        // Por defecto
        setFavoriteSalas(["citas", "charla", "ligar"]);
      }
    };
    
    // Cargar al inicio
    loadFavorites();
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', loadFavorites);
    
    // Custom event para cambios en la misma pestaña
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('storage', loadFavorites);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  // Mapeo de IDs de salas a sus datos (todas las salas disponibles)
  const allRooms: Record<string, {name: string, icon: string, color: string, users: number}> = {
    // Principales
    "citas": { name: "Citas", icon: "💬", color: "bg-blue-500/20 text-blue-400", users: 351 },
    "charla": { name: "Charla", icon: "😊", color: "bg-yellow-500/20 text-yellow-400", users: 120 },
    "encuentros": { name: "Encuentros", icon: "☕", color: "bg-green-500/20 text-green-400", users: 89 },
    "jovenes-alma": { name: "Jóvenes de Alma", icon: "🎯", color: "bg-purple-500/20 text-purple-400", users: 67 },
    "romantica": { name: "Romántica", icon: "💕", color: "bg-pink-500/20 text-pink-400", users: 54 },
    
    // Ciudades
    "caracas": { name: "Caracas", icon: "📍", color: "bg-red-500/20 text-red-400", users: 128 },
    "maracaibo": { name: "Maracaibo", icon: "📍", color: "bg-blue-500/20 text-blue-400", users: 95 },
    "valencia": { name: "Valencia", icon: "📍", color: "bg-green-500/20 text-green-400", users: 76 },
    "barquisimeto": { name: "Barquisimeto", icon: "📍", color: "bg-yellow-500/20 text-yellow-400", users: 54 },
    "merida": { name: "Mérida", icon: "📍", color: "bg-purple-500/20 text-purple-400", users: 42 },
    "barinas": { name: "Barinas", icon: "📍", color: "bg-orange-500/20 text-orange-400", users: 31 },
    
    // Intereses
    "pc-juegos": { name: "PC y Juegos", icon: "🎮", color: "bg-indigo-500/20 text-indigo-400", users: 112 },
    "motorizados": { name: "Motorizados", icon: "🏍️", color: "bg-red-500/20 text-red-400", users: 67 },
    "automobil": { name: "Automóvil", icon: "🚗", color: "bg-blue-500/20 text-blue-400", users: 58 },
    "emo": { name: "EMO", icon: "🖤", color: "bg-purple-500/20 text-purple-400", users: 45 },
    "jesus-te-ama": { name: "Jesús te ama", icon: "✝️", color: "bg-yellow-500/20 text-yellow-400", users: 89 },
    "metal-music": { name: "Metal Music", icon: "🤘", color: "bg-gray-500/20 text-gray-400", users: 72 },
    "futbol": { name: "Fútbol", icon: "⚽", color: "bg-green-500/20 text-green-400", users: 134 },
    "turistica": { name: "Turística", icon: "🗺️", color: "bg-cyan-500/20 text-cyan-400", users: 51 },
    "fitness": { name: "Fitness", icon: "💪", color: "bg-orange-500/20 text-orange-400", users: 98 },
    "rockabilly": { name: "Rockabilly", icon: "🎸", color: "bg-pink-500/20 text-pink-400", users: 34 },
    "programadores": { name: "Programadores", icon: "💻", color: "bg-blue-500/20 text-blue-400", users: 87 },
    "agricultura": { name: "Agricultura", icon: "🌾", color: "bg-green-500/20 text-green-400", users: 29 },
    "crianza": { name: "Crianza", icon: "👶", color: "bg-yellow-500/20 text-yellow-400", users: 62 },
    
    // Extranjeros
    "colombia": { name: "Colombia", icon: "🇨🇴", color: "bg-yellow-500/20 text-yellow-400", users: 156 },
    "brasil": { name: "Brasil", icon: "🇧🇷", color: "bg-green-500/20 text-green-400", users: 142 },
    "eeuu": { name: "EEUU", icon: "🇺🇸", color: "bg-blue-500/20 text-blue-400", users: 98 },
    "eu": { name: "EU", icon: "🇪🇺", color: "bg-indigo-500/20 text-indigo-400", users: 76 },
    "argentina": { name: "Argentina", icon: "🇦🇷", color: "bg-cyan-500/20 text-cyan-400", users: 134 },
    "mexico": { name: "México", icon: "🇲🇽", color: "bg-red-500/20 text-red-400", users: 112 },
    "chile": { name: "Chile", icon: "🇨🇱", color: "bg-blue-500/20 text-blue-400", users: 67 },
    "peru": { name: "Perú", icon: "🇵🇪", color: "bg-red-500/20 text-red-400", users: 89 },
    
    // Sexuales
    "ligar": { name: "Ligar", icon: "🔥", color: "bg-pink-500/20 text-pink-400", users: 1445 },
    "flirteo": { name: "Flirteo", icon: "😘", color: "bg-purple-500/20 text-purple-400", users: 892 },
    "gay-bi": { name: "Gay & Bi", icon: "🏳️‍🌈", color: "bg-rainbow text-rainbow", users: 321 },
    "bdsm": { name: "BDSM", icon: "⛓️", color: "bg-red-500/20 text-red-400", users: 234 },
    "erotica": { name: "Erótica", icon: "💋", color: "bg-pink-500/20 text-pink-400", users: 567 },
    "fotos-videos": { name: "Fotos y Videos 18+", icon: "📸", color: "bg-orange-500/20 text-orange-400", users: 789 },
    "fetiche": { name: "Fetiche", icon: "🔗", color: "bg-purple-500/20 text-purple-400", users: 198 },
  };

  // Calcular las 3 salas más usadas (ordenadas por número de usuarios)
  const topRooms = useMemo(() => {
    return Object.entries(allRooms)
      .map(([id, room]) => ({ id, ...room }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 3);
  }, []);

  // Emojis comunes para estado
  const commonEmojis = [
    '😊', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', 
    '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
    '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🫢', '🫣', '🤫', '🤔',
    '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😶‍🌫️',
    '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔',
    '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯', '🤠',
    '🥳', '🥸', '😎', '🤓', '🧐', '😕', '🫤', '😟',
    '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹',
    '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱',
    '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
    '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩',
    '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺',
    '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓',
    '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️',
    '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
    '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑',
    '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺',
    '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴',
    '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️',
    '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯',
    '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵',
    '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅',
    '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️',
    '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠'
  ];

  // Mensajes privados
  const privateMessages = [
    { id: 1, userId: 1, name: "María", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB", message: "Hola! ¿Cómo estás?", unread: 2 },
    { id: 2, userId: 2, name: "Laura", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", message: "Gracias por aceptar", unread: 1 },
    { id: 3, userId: 3, name: "Sofia", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop", message: "Nos vemos pronto", unread: 0 }
  ];

  // Estado para el widget de Tomar Café
  const [coffeeUsers] = useState<CoffeeUser[]>([
    { id: 1, username: "maria8163", name: "María", age: 24, city: "Maracaibo", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 2, username: "laura_g", name: "Laura", age: 25, city: "Caracas", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { id: 3, username: "sofia_m", name: "Sofia", age: 26, city: "Valencia", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
  ]);
  const [currentCoffeeIndex, setCurrentCoffeeIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const currentCoffeeUser = coffeeUsers[currentCoffeeIndex];

  // Sonidos
  const playAcceptSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0vLTgjMGHm7A7+OZSA0PVanm8LJjHwU7k9r0z38uBihyyO3cnEQIEFyt5O+pWBYLTKXh9MBlKAYthMrz16g9CRdxwu7hnUsOElmr5fCyYx8FO5Pa9M5+LgYnccnt3JxECA9dru3+UlP=');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const playRejectSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRhYAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YfL9//8A');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  // Animación de confetti
  const triggerConfetti = async () => {
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2bee79', '#4ade80', '#22c55e', '#86efac']
      });
    } catch (error) {
      // Confetti no disponible, continuar sin animación
      console.log('Confetti not available');
    }
  };

  // Manejar aceptar invitación
  const handleAcceptCoffee = () => {
    if (!currentCoffeeUser) return;

    // Reproducir sonido y confetti
    playAcceptSound();
    triggerConfetti();

    // Guardar en localStorage con timestamp
    const accepted = JSON.parse(localStorage.getItem('coffeeAccepted') || '[]');
    const newAccepted = {
      ...currentCoffeeUser,
      acceptedAt: new Date().toISOString(),
      status: 'accepted'
    };
    localStorage.setItem('coffeeAccepted', JSON.stringify([...accepted, newAccepted]));

    // Siguiente usuario
    setTimeout(() => {
      if (currentCoffeeIndex < coffeeUsers.length - 1) {
        setCurrentCoffeeIndex(currentCoffeeIndex + 1);
      } else {
        setCurrentCoffeeIndex(0);
      }
    }, 500);
  };

  // Manejar rechazar invitación
  const handleRejectCoffee = () => {
    if (!currentCoffeeUser) return;

    // Reproducir sonido
    playRejectSound();

    // Guardar en localStorage con timestamp
    const rejected = JSON.parse(localStorage.getItem('coffeeRejected') || '[]');
    const newRejected = {
      ...currentCoffeeUser,
      rejectedAt: new Date().toISOString(),
      status: 'rejected'
    };
    localStorage.setItem('coffeeRejected', JSON.stringify([...rejected, newRejected]));

    // Cerrar modal y siguiente usuario
    setShowRejectModal(false);
    setTimeout(() => {
      if (currentCoffeeIndex < coffeeUsers.length - 1) {
        setCurrentCoffeeIndex(currentCoffeeIndex + 1);
      } else {
        setCurrentCoffeeIndex(0);
      }
    }, 300);
  };

  // Simulamos un pool de usuarios según filtro de búsqueda
  const allUsers = useMemo(() => [
    { id: 1, username: "javier-s", name: "Javier S.", age: 28, city: "Madrid", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 2, username: "laura-g", name: "Laura G.", age: 25, city: "Barcelona", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic" },
    { id: 3, username: "carlos-r", name: "Carlos R.", age: 30, city: "Valencia", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 4, username: "maria-p", name: "Maria P.", age: 27, city: "Sevilla", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 5, username: "sofia-m", name: "Sofía M.", age: 24, city: "Bilbao", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw" },
    { id: 6, username: "pablo-r", name: "Pablo R.", age: 29, city: "Málaga", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
    { id: 7, username: "elena-g", name: "Elena G.", age: 26, city: "Zaragoza", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic" },
    { id: 8, username: "diego-s", name: "Diego S.", age: 31, city: "Alicante", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 9, username: "carmen-v", name: "Carmen V.", age: 23, city: "Murcia", gender: "M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 10, username: "antonio-l", name: "Antonio L.", age: 33, city: "Granada", gender: "H", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ" },
  ], []);

  const [displayedUsers, setDisplayedUsers] = useState(allUsers.slice(0, 6));

  // Rotar usuarios cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Obtener 6 usuarios aleatorios del pool
      const shuffled = [...allUsers].sort(() => 0.5 - Math.random());
      setDisplayedUsers(shuffled.slice(0, 6));
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, [allUsers]);

  return (
    <div className="min-h-screen bg-connect-bg-dark text-white font-display flex flex-col">
      <InternalHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-connect-bg-dark">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#1A2226] border border-white/5 shadow-lg rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>

              <div className="relative flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={profileData.foto_perfil || "https://via.placeholder.com/96x96?text=" + (profileData.nombre?.charAt(0) || 'U')}
                    alt={profileData.nombre}
                    className="w-24 h-24 rounded-full border-4 border-[#1A2226] shadow-lg object-cover"
                  />
                  <Link 
                    href="/userprofile"
                    className="absolute bottom-0 right-0 p-1.5 bg-[#1A2226] border border-white/10 rounded-full text-primary hover:bg-primary hover:text-[#0F1416] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                </div>

                <h2 className="text-xl font-bold font-heading text-white">{profileData.nombre || user?.username || 'Usuario'}</h2>
                <p className="text-sm text-gray-400 mb-4">
                  {profileData.edad > 0 && `${profileData.edad} años`}
                  {profileData.edad > 0 && profileData.ciudad && ' • '}
                  {profileData.ciudad}
                  {!profileData.edad && !profileData.ciudad && 'Completa tu perfil'}
                </p>

                <div className="w-full h-px bg-white/5 mb-4"></div>

                <div className="w-full flex justify-between text-sm mb-4">
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">{profileData.amigos_count}</span>
                    <span className="text-xs text-gray-400">Amigos</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">{profileData.fotos_count}</span>
                    <span className="text-xs text-gray-400">Fotos</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white text-lg">{profileData.visitas_count}</span>
                    <span className="text-xs text-gray-400">Visitas</span>
                  </div>
                </div>

                <Link href="/userprofile" className="block w-full">
                  <button className="w-full py-2 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent font-medium flex items-center justify-center gap-2">
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                </Link>
              </div>
            </div>

            {/* Main Menu */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/2">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Menú Principal
                </h3>
              </div>

              <div className="p-2 space-y-1">
                <button onClick={() => openMessages()} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-[#2BEE79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Mensajes</span>
                  </div>
                  <span className="bg-primary text-[#0F1416] text-xs font-bold px-1.5 py-0.5 rounded">3</span>
                </button>

                <Link href="/chat" className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-[#2BEE79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <span>Salas de Chat</span>
                  </div>
                </Link>

                <Link href="/amigos" className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-[#2BEE79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Amigos</span>
                  </div>
                </Link>

                <Link href="/meetings" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-[#2BEE79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2zm10 4h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M4 18h16" />
                    </svg>
                    <span>Invitaciones</span>
                  </div>
                  <span className="bg-primary text-[#0F1416] text-xs font-bold px-1.5 py-0.5 rounded">5</span>
                </Link>

                <Link href="/albums" className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-gray-400 hover:text-[#2BEE79] hover:bg-transparent hover:border-[#2BEE79]/50 hover:shadow-[0_0_15px_rgba(43,238,121,0.3)] border border-transparent group">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 group-hover:text-[#2BEE79]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Álbumes</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Security Card */}
            <div className={`bg-[#1A2226] border rounded-xl p-5 transition-all ${
              isPhoneVerified 
                ? "border-white/5" 
                : "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-pulse-glow"
            }`}>
              <h3 className="font-heading font-bold text-sm text-white flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Seguridad
                </div>
                {!isPhoneVerified && (
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute hidden group-hover:block right-0 top-8 w-80 p-4 rounded-lg bg-gray-900/98 border border-orange-500/50 backdrop-blur-lg shadow-2xl z-50 animate-fade-in">
                      <h4 className="font-bold mb-3 text-white">💡 Estado de verificación</h4>
                      
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1.5">
                          <p>• Email: <span className="text-green-400">✓ Verificado</span></p>
                          <p>• Teléfono: <span className="text-orange-400">✗ Sin verificar</span></p>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-700">
                          <p className="text-orange-300 font-semibold mb-1.5">Limitaciones actuales:</p>
                          <ul className="space-y-1 ml-3 text-gray-400">
                            <li>• Límites de mensajes (100→10/día)</li>
                            <li>• No puedes enviar MP primero</li>
                            <li>• No crear salas privadas</li>
                            <li>• Perfil "No verificado"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estado de cuenta</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    isPhoneVerified
                      ? "text-primary bg-primary/10 border-primary/20"
                      : "text-orange-500 bg-orange-500/20 border-orange-500/50 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                  }`}>
                    {isPhoneVerified ? "Protegida" : "Vulnerable"}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      isPhoneVerified 
                        ? "bg-primary shadow-[0_0_15px_rgba(74,222,128,0.1)]" 
                        : "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    }`}
                    style={{ width: isPhoneVerified ? '100%' : '50%' }}
                  ></div>
                </div>
                
                {/* Button */}
                {isPhoneVerified ? (
                  <Link href="/security?tab=seguridad">
                    <Button variant="outline" className="w-full py-1.5 mt-2 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs transition-colors">
                      Revisar actividad reciente
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    onClick={() => router.push("/security?tab=seguridad")}
                    variant="outline"
                    className="w-full py-1.5 mt-2 bg-transparent hover:bg-white/5 border border-orange-500 text-orange-400 hover:text-orange-300 text-xs transition-all shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                  >
                    Verificar Ahora
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Center Column - Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Status Update */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-4">
              <div className="flex gap-4">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                  alt="Me"
                  className="w-10 h-10 rounded-full object-cover border border-connect-border"
                />
                <div className="flex-1">
                  <Input
                    placeholder="¿Qué estás pensando, Ana?"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full bg-connect-bg-dark border-connect-border rounded-full px-4 py-2.5 text-sm text-white placeholder-connect-muted"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pl-14">
                <div className="relative">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-xs text-connect-muted hover:text-white transition-colors"
                  >
                    <svg className="w-[18px] h-[18px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Emoji
                  </button>

                  {/* Selector de Emojis */}
                  {showEmojiPicker && (
                    <div className="absolute left-0 top-full mt-2 bg-connect-card border border-white/10 rounded-lg p-3 shadow-xl z-50 w-80">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">Selecciona un emoji</h4>
                        <button 
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto">
                        {commonEmojis.map((emoji, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setStatusText(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-white/10 rounded p-1 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botones de Estado de Presencia */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-connect-muted mb-2">Estado de presencia:</p>
                <div className="flex gap-2">
                  {/* Online */}
                  <button
                    onClick={() => setPresenceStatus('online')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      presenceStatus === 'online'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-white/5 text-connect-muted hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                  </button>

                  {/* Ocupado */}
                  <button
                    onClick={() => setPresenceStatus('busy')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      presenceStatus === 'busy'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                        : 'bg-white/5 text-connect-muted hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Ocupado
                  </button>

                  {/* Invisible - Solo PLUS */}
                  <button
                    onClick={() => {
                      if (!isPlus) {
                        alert('Necesitas PLUS para usar modo invisible');
                        return;
                      }
                      setPresenceStatus('invisible');
                    }}
                    disabled={!isPlus}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${
                      presenceStatus === 'invisible'
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                        : isPlus
                        ? 'bg-white/5 text-connect-muted hover:bg-white/10 border border-transparent'
                        : 'bg-white/5 text-connect-muted/50 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    Invisible
                    {!isPlus && (
                      <span className="ml-1 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">PLUS</span>
                    )}
                  </button>
                </div>
                
                {/* Mensaje explicativo según el estado */}
                <p className="text-xs text-connect-muted mt-2">
                  {presenceStatus === 'online' && '🟢 Visible para todos'}
                  {presenceStatus === 'busy' && '🟠 Conectado pero ocupado'}
                  {presenceStatus === 'invisible' && '⚫ Navegas sin dejar rastro (solo en MP)'}
                </p>
              </div>
            </div>

            {/* Profile Visits Widget - UNIFIED with 2 sides */}
            <div className="bg-gradient-to-r from-deep-green/40 to-connect-card border border-primary/20 rounded-xl p-5 relative overflow-hidden">
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {/* Left Side: Who visited me */}
                <div>
                  <h3 className="font-bold text-white text-base mb-2">Me Visitaron</h3>
                  <Link
                    href="/visitas"
                    target="_blank"
                    className="text-sm text-primary font-medium mb-3 hover:underline cursor-pointer inline-block"
                  >
                    28 hoy
                  </Link>

                  <div className="flex -space-x-2 mt-3">
                    <Link href="/publicprofile/javier-s" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Javier S."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/publicprofile/laura-g" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic"
                        alt="Laura G."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/publicprofile/maria-p" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB"
                        alt="Maria P."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/visitas" target="_blank">
                      <div className="w-9 h-9 rounded-full border-2 border-connect-bg-dark bg-connect-card flex items-center justify-center text-xs text-white font-bold hover:bg-white/10 cursor-pointer hover:scale-110 transition-transform">
                        +25
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Right Side: Who I visited */}
                <div className="text-right">
                  <h3 className="font-bold text-white text-base mb-2">He Visitado</h3>
                  <Link
                    href="/visitas"
                    target="_blank"
                    className="text-sm text-primary font-medium mb-3 hover:underline cursor-pointer inline-block"
                  >
                    12 hoy
                  </Link>

                  <div className="flex -space-x-2 justify-end mt-3">
                    <Link href="/publicprofile/carlos-r" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                        alt="Carlos R."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/publicprofile/sofia-m" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                        alt="Sofía M."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/publicprofile/pablo-r" target="_blank">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Pablo R."
                        className="w-9 h-9 rounded-full border-2 border-connect-bg-dark hover:scale-110 transition-transform cursor-pointer"
                      />
                    </Link>
                    <Link href="/visitas" target="_blank">
                      <div className="w-9 h-9 rounded-full border-2 border-connect-bg-dark bg-connect-card flex items-center justify-center text-xs text-white font-bold hover:bg-white/10 cursor-pointer hover:scale-110 transition-transform">
                        +9
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Personas - Full Width Horizontal */}
            <div className="bg-connect-card border border-connect-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Usuarios
                </h3>
                <Link href="/usuarios" className="text-xs text-primary hover:underline">
                  Ver más
                </Link>
              </div>

              <div className="grid grid-cols-6 gap-3">
                {displayedUsers.map((user) => (
                  <Link key={user.id} href={`/publicprofile/${user.username}`} target="_blank" className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 cursor-pointer">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                      {user.id % 2 === 1 && (
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-primary border border-connect-card rounded-full"></span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-medium text-white group-hover:text-primary transition-colors truncate">{user.name}</p>
                      <p className="text-[9px] text-connect-muted">{user.gender} • {user.age}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Two Column Cards: Tomar Café + Mensajes Privados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tomar Café */}
              <div className="bg-connect-card border border-connect-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5h8a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2zm10 4h1a2 2 0 012 2v1a2 2 0 01-2 2h-1M4 18h16" />
                    </svg>
                    Invitaciones para Café
                  </h3>
                  <Link href="/meetings" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Ver más
                  </Link>
                </div>

                {currentCoffeeUser ? (
                  <div 
                    className="relative rounded-xl overflow-hidden group cursor-pointer"
                    onClick={(e) => {
                      // Si el target es un botón o hijo de un botón, no hacer nada
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'BUTTON' || target.closest('button')) {
                        console.log('❌ Click bloqueado (es un botón)');
                        return;
                      }
                      
                      console.log('✅ CLICK en foto de usuario:', currentCoffeeUser.username);
                      const url = `/meetings?user=${currentCoffeeUser.username}`;
                      console.log('🔗 Abriendo URL:', url);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {/* Imagen del usuario */}
                    <div className="relative">
                      <img
                        src={currentCoffeeUser.avatar}
                        alt={currentCoffeeUser.name}
                        className="w-full h-64 object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                      />
                      
                      {/* Overlay con efecto hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <div className="text-center text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm font-bold">Ver todas las fotos</p>
                          <p className="text-xs opacity-80">Click para abrir galería</p>
                        </div>
                      </div>
                      
                      {/* Overlay con gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Badge de invitación */}
                    <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full z-20 pointer-events-none">
                      <span className="text-xs font-bold text-connect-bg-dark">Nueva Invitación</span>
                    </div>

                    {/* Botones de aceptar/rechazar */}
                    <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 px-4 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowRejectModal(true); }}
                        className="w-16 h-16 bg-white/90 hover:bg-white rounded-full font-bold shadow-lg hover:scale-110 transition-all flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAcceptCoffee(); }}
                        className="w-16 h-16 bg-primary hover:brightness-110 rounded-full font-bold shadow-[0_0_25px_rgba(43,238,121,0.4)] hover:shadow-[0_0_35px_rgba(43,238,121,0.6)] hover:scale-110 transition-all flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-connect-bg-dark" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                      </button>
                    </div>

                    {/* Info del usuario */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white z-20 pointer-events-none">
                      <h4 className="text-lg font-bold">{currentCoffeeUser.name}, {currentCoffeeUser.age}</h4>
                      <p className="text-sm opacity-90 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {currentCoffeeUser.city}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-white/5 border border-dashed border-white/10 h-64 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="text-4xl mb-3">☕</div>
                      <p className="text-white font-bold mb-1">No hay invitaciones</p>
                      <p className="text-xs text-connect-muted">Visita "Usuarios" para enviar invitaciones</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mensajes Privados */}
              <div className="bg-connect-card border border-connect-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Mensajes Privados
                  </h3>
                  <button onClick={() => openMessages()} className="text-xs text-primary hover:underline">
                    Ver todos
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Mensaje 1 */}
                  <div 
                    onClick={() => openMessages(1)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                        alt="Javier"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-connect-card rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">Javier Solis</h4>
                        <span className="text-[10px] text-gray-400">12:30</span>
                      </div>
                      <p className="text-xs text-white font-medium truncate">
                        Hola, ¿viste las fotos que...
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>

                  {/* Mensaje 2 */}
                  <div 
                    onClick={() => openMessages(2)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic"
                        alt="Laura"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-gray-400 truncate">Laura G.</h4>
                        <span className="text-[10px] text-gray-400">Ayer</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">¡Te envió una invitación!</p>
                    </div>
                  </div>

                  {/* Mensaje 3 */}
                  <div 
                    onClick={() => openMessages(3)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                        alt="Carlos"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-connect-card rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-gray-400 truncate">Carlos R.</h4>
                        <span className="text-[10px] text-gray-400">14 Dic</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">¿Nos vemos este fin de...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Salas de Chat */}
            <div className="bg-connect-card border border-connect-border rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-connect-border bg-white/2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-base text-white">Salas de Chat</h3>
                  <Link href="/chat" className="ml-auto text-xs text-primary hover:underline">
                    Ver todas
                  </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    placeholder="Buscar salas"
                    className="pl-9 bg-connect-bg-dark border-connect-border text-white text-sm h-9"
                  />
                </div>
              </div>

              {/* Mis Salas Favoritas */}
              <div className="p-3 border-b border-connect-border/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Mis Salas Favoritas</h4>
                <div className="space-y-1">
                  {favoriteSalas.slice(0, 3).map((roomId) => {
                    const room = allRooms[roomId];
                    if (!room) return null;
                    
                    return (
                      <Link 
                        key={roomId}
                        href={`/chat?room=${roomId}`} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                      >
                        <div className={`w-10 h-10 ${room.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                          {room.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{room.name}</h4>
                          <p className="text-xs text-connect-muted">{room.users} personas</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Más Usadas */}
              <div className="p-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Más Usadas</h4>
                <div className="space-y-1">
                  {topRooms.map((room) => (
                    <Link 
                      key={room.id}
                      href={`/chat?room=${room.id}`} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <div className={`w-10 h-10 ${room.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {room.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{room.name}</h4>
                        <p className="text-xs text-connect-muted">{room.users} personas</p>
                      </div>
                    </Link>
                  ))}

                  {/* Botón Crear Sala */}
                  <button className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all group">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-bold text-primary">Crear sala</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Friends Online */}
            <div className="bg-[#1A2226] border border-white/5 rounded-xl p-0">
              <div className="p-4 border-b border-white/5 bg-white/2 flex justify-between items-center">
                <h3 className="font-heading font-bold text-sm text-white">Amigos en línea (4)</h3>
              </div>

              <div className="p-2 grid grid-cols-4 gap-2">
                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw"
                      alt="Pedro"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Pedro
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk"
                      alt="Juan"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Juan
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB"
                      alt="Maria"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Maria
                  </span>
                </Link>

                <Link href="/amigos" className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors">
                  <div className="relative mb-1">
                    <img
                      className="w-10 h-10 rounded-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ"
                      alt="Carlos"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-[#1A2226] rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white truncate w-full text-center">
                    Carlos
                  </span>
                </Link>
              </div>

              <div className="p-2 pt-0">
                <Link href="/amigos" className="w-full block text-center py-2 text-xs text-primary hover:text-primary/80 hover:underline transition-colors">
                  Ver todos mis amigos →
                </Link>
              </div>
            </div>

            {/* Premium Promo */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-4 text-center">
              <svg className="w-8 h-8 mx-auto text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <h3 className="font-bold text-white text-sm">Modo Invisible</h3>
              <p className="text-xs text-connect-muted mb-3">
                Navega sin dejar rastro en "Perfiles Visitados".
              </p>
              <Button className="w-full bg-primary hover:brightness-110 text-connect-bg-dark text-xs font-bold">
                Activar Premium
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center text-xs text-connect-muted border-t border-connect-border pt-4 max-w-[1600px] mx-auto">
          <p>
            © 2023 LoCuToRiO Inc. •{" "}
            <Link href="/about/proteccion-datos" className="hover:text-primary">
              Privacidad
            </Link>{" "}
            •{" "}
            <Link href="/about/terminos" className="hover:text-primary">
              Términos
            </Link>
          </p>
        </footer>
      </main>

      {/* Modal de Confirmación para Rechazar */}
      {showRejectModal && currentCoffeeUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-connect-card border-2 border-connect-border rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¿Rechazar invitación?</h2>
              <p className="text-connect-muted">
                ¿Estás seguro que quieres rechazar la invitación a café de{" "}
                <span className="text-white font-bold">{currentCoffeeUser.name}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                className="flex-1 bg-transparent border-connect-border text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejectCoffee}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Sí, rechazar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Phone Verification Modal */}
      {showPhoneModal && (
        <PhoneVerificationModal
          onVerifyNow={() => {
            setShowPhoneModal(false);
            router.push("/security?tab=seguridad");
          }}
          onClose={() => {
            setShowPhoneModal(false);
            // El modal se cierra, la tarjeta ya está naranja
          }}
        />
      )}
    </div>
  );
}

