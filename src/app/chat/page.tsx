"use client";

/**
 * SISTEMA DE VERIFICACIÓN DE EDAD:
 * --------------------------------
 * - Sala +18: NO requiere checkbox de verificación manual
 * - Verificación AUTOMÁTICA por edad del perfil del usuario
 * - Si edad < 18 en perfil: Sala +18 NO aparece en lista de salas
 * - Si edad ≥ 18 en perfil: Sala +18 se muestra normalmente
 * 
 * REGLAS DE PERFIL:
 * - Edad obligatoria: Sin fecha de nacimiento → No se puede crear perfil
 * - Cambio único: Edad se puede cambiar SOLO 1 vez
 * - Verificación IA: Requiere fecha de nacimiento + ID verificado
 * - Anti-fraude: 1 usuario = 1 email + 1 teléfono
 * 
 * REGLAS DE SALAS:
 * - TEMPORAL: Gratis, cualquiera puede crear, desaparece cuando creador sale
 * - PERMANENTE: Solo usuarios PLUS+, persiste después del creador, se elimina si vacía 7+ días
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";
import { useMessages } from "@/contexts/MessagesContext";
import { useSearchParams } from "next/navigation";
import FloatingMessagesWindow from "@/components/FloatingMessagesWindow";

export default function ChatRoomsPage() {
  const { openMessages } = useMessages();
  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');
  
  const [selectedRoom, setSelectedRoom] = useState(roomFromUrl || "general");
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: number, user: string, avatar: string, text: string, time: string, isOwn: boolean, replyTo?: string | null}>>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserMentions, setShowUserMentions] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Private messages removed - using FloatingMessagesWindow instead
  const [isTyping, setIsTyping] = useState(false);
  const [savedMessages, setSavedMessages] = useState<number[]>([]);
  const [reportedMessages, setReportedMessages] = useState<number[]>([]);
  const [messageReactions, setMessageReactions] = useState<{[key: number]: {like: number, love: number, haha: number, userReaction?: string}}>({});
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [pendingRoomToAdd, setPendingRoomToAdd] = useState<string | null>(null);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [neonColor, setNeonColor] = useState<string>('16,255,0'); // Verde por defecto
  const [neonOpacity, setNeonOpacity] = useState<number>(0.7); // 70% por defecto
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sistema de auto-scroll y mensajes nuevos
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Modal de crear sala
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    icon: '💬',
    type: 'temporal', // 'temporal' o 'permanent'
    privacy: 'public', // 'public', '18+', 'friends', 'password'
    password: ''
  });
  
  // Estados para categorías colapsables
  const [expandedCategories, setExpandedCategories] = useState({
    principales: false,
    ciudades: false,
    intereses: false,
    extranjeros: false,
    sexuales: false,
    usuarios: false,
  });

  // Filtros de usuarios
  const [filterGender, setFilterGender] = useState("Todos");
  const [filterAgeMin, setFilterAgeMin] = useState(18);
  const [filterAgeMax, setFilterAgeMax] = useState(99);
  const [filterCity, setFilterCity] = useState("");
  const [filterInterests, setFilterInterests] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const favoritesRef = useRef<HTMLDivElement>(null);

  // Toggle categoría
  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Cargar favoritas desde localStorage o usar por defecto
  useEffect(() => {
    const savedFavorites = localStorage.getItem('chatFavorites');
    if (savedFavorites) {
      setSelectedFavorites(JSON.parse(savedFavorites));
    } else {
      // Por defecto: las 5 salas más populares
      setSelectedFavorites(["citas", "charla", "ligar", "caracas", "pc-juegos"]);
    }
    
    // Cargar color neón guardado
    const savedNeonColor = localStorage.getItem('neonColor');
    if (savedNeonColor) {
      setNeonColor(savedNeonColor);
    }
    
    // Cargar opacidad guardada
    const savedNeonOpacity = localStorage.getItem('neonOpacity');
    if (savedNeonOpacity) {
      setNeonOpacity(parseFloat(savedNeonOpacity));
    }
  }, []);

  // Guardar favoritas en localStorage cuando cambian
  useEffect(() => {
    if (selectedFavorites.length > 0) {
      localStorage.setItem('chatFavorites', JSON.stringify(selectedFavorites));
      // Disparar evento para actualizar Dashboard
      window.dispatchEvent(new Event('favoritesUpdated'));
    }
  }, [selectedFavorites]);

  // Sistema de bots
  const [botsActive, setBotsActive] = useState(false);
  
  const bots = [
    { id: 1, name: "Carlos_R", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk" },
    { id: 2, name: "Maria_G", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB" },
    { id: 3, name: "Pedro_L", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw" },
    { id: 4, name: "Sofia_M", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop" },
    { id: 5, name: "Juan_K", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" },
  ];

  const botMessages = [
    // Mensajes cortos
    "Hola! 😊",
    "Qué tal? 👋",
    "Buenas! 🌟",
    "Hey! 🔥",
    "Cómo están? 😄",
    
    // Mensajes medianos
    "Alguien sabe dónde puedo conseguir buena música? 🎵🎶",
    "Estoy buscando gente para jugar online, alguien se apunta? 🎮",
    "Qué tal el clima por allá? Aquí está lloviendo mucho ⛈️☔",
    "Recomiendan alguna serie buena para ver este fin de semana? 📺🍿",
    "Alguien más está trabajando desde casa hoy? 💻🏠",
    
    // Mensajes largos
    "Me acabo de mudar a la ciudad y estoy buscando lugares interesantes para visitar. Alguien conoce buenos restaurantes o sitios turísticos que recomienden? 🍕🗺️✨",
    "Hola a todos! Soy nuevo aquí y me encantaría conocer gente con intereses similares. Me gusta la música rock, los videojuegos y salir a caminar por las tardes. Alguien más comparte estos gustos? 🎸🎮🚶‍♂️",
    "Estoy organizando un grupo para ir al cine este sábado, pensamos ver la nueva película de acción que acaban de estrenar. Si alguien está interesado puede escribirme! 🎬🍿🎉",
    "Buenos días! Vengo a contarles que ayer fui a un concierto increíble, la energía era espectacular y la banda tocó todas mis canciones favoritas. Fue una experiencia inolvidable! 🎵🎤⭐",
    "Hola! Alguien sabe dónde puedo tomar clases de baile? Siempre he querido aprender salsa y bachata pero no conozco ningún lugar bueno por aquí. Cualquier recomendación es bienvenida! 💃🕺🎶",
    
    // Respuestas con menciones
    "@{bot} Claro! Te ayudo con eso 👍",
    "@{bot} Yo también pienso lo mismo! 💯",
    "@{bot} Excelente idea! Me apunto 🙌",
    "@{bot} Totalmente de acuerdo contigo 😊✨",
    "@{bot} Gracias por compartir! Muy útil 🌟",
    
    // Con emojis variados
    "Feliz viernes! 🎉🥳🎊",
    "Qué lindo día! ☀️🌈🌻",
    "Alguien para tomar café? ☕🍰",
    "Buenas noches a todos! 🌙⭐✨",
    "Exitoso inicio de semana! 💪🚀🔥",
  ];

  // useEffect para activar bots con velocidad variable
  useEffect(() => {
    if (!botsActive) return;

    let messageCount = 0;
    const maxMessages = 50; // Aumentado para ver mejor el efecto
    let timeouts: NodeJS.Timeout[] = [];

    const sendMessage = () => {
      if (messageCount >= maxMessages) {
        setBotsActive(false);
        return;
      }

      // Seleccionar bot aleatorio
      const bot = bots[Math.floor(Math.random() * bots.length)];
      
      // Seleccionar mensaje aleatorio
      let message = botMessages[Math.floor(Math.random() * botMessages.length)];
      
      // Si el mensaje tiene {bot}, reemplazar con nombre de otro bot
      if (message.includes('{bot}')) {
        const otherBot = bots.filter(b => b.id !== bot.id)[Math.floor(Math.random() * (bots.length - 1))];
        message = message.replace('{bot}', otherBot.name);
      }
      
      // Crear mensaje
      const newMessage = {
        id: Date.now() + Math.random(),
        user: bot.name,
        avatar: bot.avatar,
        text: message,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        isOwn: false,
        replyTo: null,
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      messageCount++;
      
      // Decidir siguiente intervalo basado en patrones
      let nextDelay: number;
      
      // Cada 10 mensajes, cambiar el patrón
      const pattern = Math.floor(messageCount / 10) % 3;
      
      if (pattern === 0) {
        // RÁFAGA RÁPIDA: 3-5 mensajes seguidos muy rápido
        if (messageCount % 10 < 5) {
          nextDelay = Math.random() * 500 + 500; // 500-1000ms (muy rápido)
        } else {
          nextDelay = Math.random() * 1000 + 2000; // 2-3 segundos (pausa)
        }
      } else if (pattern === 1) {
        // DESPACIO: 1-2 mensajes lentos
        nextDelay = Math.random() * 2000 + 3000; // 3-5 segundos (lento)
      } else {
        // RÁFAGA RÁPIDA otra vez
        if (messageCount % 10 < 6) {
          nextDelay = Math.random() * 400 + 400; // 400-800ms (ultra-rápido)
        } else {
          nextDelay = Math.random() * 1500 + 2500; // 2.5-4 segundos (recuperación)
        }
      }
      
      const timeout = setTimeout(sendMessage, nextDelay);
      timeouts.push(timeout);
    };

    // Iniciar el primer mensaje
    sendMessage();

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [botsActive]);

  // Detectar sala desde URL y seleccionarla automáticamente
  useEffect(() => {
    if (roomFromUrl) {
      setSelectedRoom(roomFromUrl);
    }
  }, [roomFromUrl]);

  // Detectar acción desde URL (ej: ?action=create para abrir modal de crear sala)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create') {
      // TODO: Cuando implementes autenticación, verificar aquí si hay sesión
      // if (!isLoggedIn) {
      //   router.push('/login');
      //   return;
      // }
      setShowCreateRoomModal(true);
    }
  }, [searchParams]);

  // Auto-scroll input to end when messageText changes (especially for emojis)
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.scrollLeft = messageInputRef.current.scrollWidth;
    }
  }, [messageText]);

  // Auto-focus search input when it appears
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  // Todas las salas organizadas por categoría
  const allRooms = {
    favoritas: [],
    principales: [
      { id: "citas", name: "Citas", icon: "💬", color: "bg-blue-500/20 text-blue-400", users: 351 },
      { id: "charla", name: "Charla", icon: "😊", color: "bg-yellow-500/20 text-yellow-400", users: 120 },
      { id: "encuentros", name: "Encuentros", icon: "☕", color: "bg-green-500/20 text-green-400", users: 89 },
      { id: "jovenes-alma", name: "Jóvenes de Alma", icon: "🎯", color: "bg-purple-500/20 text-purple-400", users: 67 },
      { id: "romantica", name: "Romántica", icon: "💕", color: "bg-pink-500/20 text-pink-400", users: 54 },
    ],
    ciudades: [
      { id: "caracas", name: "Caracas", icon: "📍", color: "bg-red-500/20 text-red-400", users: 128 },
      { id: "maracaibo", name: "Maracaibo", icon: "📍", color: "bg-blue-500/20 text-blue-400", users: 95 },
      { id: "valencia", name: "Valencia", icon: "📍", color: "bg-green-500/20 text-green-400", users: 76 },
      { id: "barquisimeto", name: "Barquisimeto", icon: "📍", color: "bg-yellow-500/20 text-yellow-400", users: 54 },
      { id: "merida", name: "Mérida", icon: "📍", color: "bg-purple-500/20 text-purple-400", users: 42 },
      { id: "barinas", name: "Barinas", icon: "📍", color: "bg-orange-500/20 text-orange-400", users: 31 },
    ],
    intereses: [
      { id: "pc-juegos", name: "PC y Juegos", icon: "🎮", color: "bg-indigo-500/20 text-indigo-400", users: 112 },
      { id: "motorizados", name: "Motorizados", icon: "🏍️", color: "bg-red-500/20 text-red-400", users: 67 },
      { id: "automobil", name: "Automóvil", icon: "🚗", color: "bg-blue-500/20 text-blue-400", users: 58 },
      { id: "emo", name: "EMO", icon: "🖤", color: "bg-purple-500/20 text-purple-400", users: 45 },
      { id: "jesus-te-ama", name: "Jesús te ama", icon: "✝️", color: "bg-yellow-500/20 text-yellow-400", users: 89 },
      { id: "metal-music", name: "Metal Music", icon: "🤘", color: "bg-gray-500/20 text-gray-400", users: 72 },
      { id: "futbol", name: "Fútbol", icon: "⚽", color: "bg-green-500/20 text-green-400", users: 134 },
      { id: "turistica", name: "Turística", icon: "🗺️", color: "bg-cyan-500/20 text-cyan-400", users: 51 },
      { id: "fitness", name: "Fitness", icon: "💪", color: "bg-orange-500/20 text-orange-400", users: 98 },
      { id: "rockabilly", name: "Rockabilly", icon: "🎸", color: "bg-pink-500/20 text-pink-400", users: 34 },
      { id: "programadores", name: "Programadores", icon: "💻", color: "bg-blue-500/20 text-blue-400", users: 87 },
      { id: "agricultura", name: "Agricultura", icon: "🌾", color: "bg-green-500/20 text-green-400", users: 29 },
      { id: "crianza", name: "Crianza", icon: "👶", color: "bg-yellow-500/20 text-yellow-400", users: 62 },
    ],
    extranjeros: [
      { id: "colombia", name: "Colombia", icon: "🇨🇴", color: "bg-yellow-500/20 text-yellow-400", users: 156 },
      { id: "brasil", name: "Brasil", icon: "🇧🇷", color: "bg-green-500/20 text-green-400", users: 142 },
      { id: "eeuu", name: "EEUU", icon: "🇺🇸", color: "bg-blue-500/20 text-blue-400", users: 98 },
      { id: "eu", name: "EU", icon: "🇪🇺", color: "bg-indigo-500/20 text-indigo-400", users: 76 },
      { id: "argentina", name: "Argentina", icon: "🇦🇷", color: "bg-cyan-500/20 text-cyan-400", users: 134 },
      { id: "mexico", name: "México", icon: "🇲🇽", color: "bg-red-500/20 text-red-400", users: 112 },
      { id: "chile", name: "Chile", icon: "🇨🇱", color: "bg-blue-500/20 text-blue-400", users: 67 },
      { id: "peru", name: "Perú", icon: "🇵🇪", color: "bg-red-500/20 text-red-400", users: 89 },
    ],
    sexuales: [
      { id: "ligar", name: "Ligar", icon: "🔥", color: "bg-pink-500/20 text-pink-400", users: 1445 },
      { id: "flirteo", name: "Flirteo", icon: "😘", color: "bg-purple-500/20 text-purple-400", users: 892 },
      { id: "gay-bi", name: "Gay & Bi", icon: "🏳️‍🌈", color: "bg-rainbow text-rainbow", users: 321 },
      { id: "bdsm", name: "BDSM", icon: "⛓️", color: "bg-red-500/20 text-red-400", users: 234 },
      { id: "erotica", name: "Erótica", icon: "💋", color: "bg-pink-500/20 text-pink-400", users: 567 },
      { id: "fotos-videos", name: "Fotos y Videos 18+", icon: "📸", color: "bg-orange-500/20 text-orange-400", users: 789 },
      { id: "fetiche", name: "Fetiche", icon: "🔗", color: "bg-purple-500/20 text-purple-400", users: 198 },
    ],
    usuarios: [],
  };

  // Función para obtener todas las salas (todas las categorías combinadas)
  const getAllAvailableRooms = () => {
    return [
      ...allRooms.principales,
      ...allRooms.ciudades,
      ...allRooms.intereses,
      ...allRooms.extranjeros,
      ...allRooms.sexuales,
    ];
  };

  // Obtener las salas favoritas basadas en selectedFavorites
  const getFavoriteRooms = () => {
    const allAvailable = getAllAvailableRooms();
    return selectedFavorites
      .map(id => allAvailable.find(room => room.id === id))
      .filter(room => room !== undefined)
      .slice(0, 5); // Máximo 5
  };

  // Toggle favorita en el modal
  const toggleFavorite = (roomId: string) => {
    if (!isEditingFavorites) return; // Solo funciona en modo edición
    
    setSelectedFavorites(prev => {
      if (prev.includes(roomId)) {
        // Quitar de favoritas
        if (pendingRoomToAdd) {
          // Si hay una sala pendiente, reemplazar esta por la pendiente
          const newFavorites = prev.map(id => id === roomId ? pendingRoomToAdd : id);
          setPendingRoomToAdd(null);
          return newFavorites;
        } else {
          // Simplemente quitar
          return prev.filter(id => id !== roomId);
        }
      } else if (prev.length < 5) {
        // Agregar a favoritas (hay espacio)
        return [...prev, roomId];
      } else {
        // Ya hay 5, poner en pendiente y hacer scroll a favoritas
        setPendingRoomToAdd(roomId);
        // Auto-scroll a MIS FAVORITAS
        setTimeout(() => {
          favoritesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return prev;
      }
    });
  };

  // Guardar favoritas
  const saveFavorites = () => {
    setIsEditingFavorites(false);
    setPendingRoomToAdd(null);
    // El useEffect se encarga de guardar en localStorage
  };

  // Función para resaltar texto en búsqueda
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span 
          key={index}
          style={{
            color: `rgb(${neonColor})`,
            fontWeight: 'bold'
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Manejar click en sala (modo normal o modo edición)
  const handleRoomClick = (roomId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    if (isEditingFavorites) {
      toggleFavorite(roomId);
    } else {
      setSelectedRoom(roomId);
    }
  };

  // Obtener clase de sala según modo
  const getRoomClassName = (roomId: string, isInFavorites: boolean = false) => {
    if (isEditingFavorites) {
      // Modo edición
      const isSelected = selectedFavorites.includes(roomId);
      const isPending = pendingRoomToAdd === roomId;
      
      if (isInFavorites) {
        // Sala dentro de MIS FAVORITAS
        if (pendingRoomToAdd) {
          // Hay sala pendiente - iluminar en naranja para reemplazar
          return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 cursor-pointer bg-orange-500/20 border-2 border-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(255,149,0,0.8)]`;
        } else {
          // Sin sala pendiente - verde normal
          return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 cursor-pointer bg-primary/20 border-2 border-primary`;
        }
      } else {
        // Sala en las listas normales (no en favoritas)
        if (isPending) {
          // Esta es la sala pendiente - amarillo brillante
          return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 cursor-pointer bg-yellow-500/30 border-2 border-yellow-500 ring-2 ring-yellow-500/50`;
        } else if (isSelected) {
          // Ya está en favoritas - verde suave (sin click)
          return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 bg-primary/10 border-2 border-primary/30 opacity-60 cursor-not-allowed`;
        } else {
          // No seleccionada - iluminada para seleccionar
          return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 cursor-pointer bg-white/10 hover:bg-primary/20 border-2 border-transparent hover:border-primary/50`;
        }
      }
    } else {
      // Modo normal - NO iluminar salas (el header ya muestra la sala actual)
      return `w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 bg-white/5 hover:bg-white/10`;
    }
  };

  // Emojis
  const basicEmojis = ["😊", "❤️", "👍"];
  const allEmojis = ["😊", "😂", "😍", "🥰", "😘", "😁", "😎", "🤗", "🤔", "😅", "😆", "😉", "❤️", "💕", "💖", "💗", "👍", "👏", "🙌", "🤝", "💪", "✨", "🎉", "🎊", "🔥", "⭐", "🌟", "💫"];

  // Usuarios conectados
  const allConnectedUsers = [
    { id: 1, username: "Ana_M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw", online: true, status: "💬 Activa", age: 26, city: "Caracas", gender: "M", interests: "Música, Cine", hasPhotoAlbum: true },
    { id: 2, username: "Carlos_R", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk", online: true, status: "🎧 Escuchando", age: 28, city: "Valencia", gender: "H", interests: "Deportes, Gaming", hasPhotoAlbum: true },
    { id: 3, username: "Laura_G", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic", online: true, status: "✍️ Escribiendo...", age: 25, city: "Maracaibo", gender: "M", interests: "Viajes, Fotografía", hasPhotoAlbum: false },
    { id: 4, username: "Javier_S", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ", online: true, status: "👀 Leyendo", age: 30, city: "Barquisimeto", gender: "H", interests: "Música, Cine", hasPhotoAlbum: true },
    { id: 5, username: "Maria_P", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB", online: true, status: "😊", age: 24, city: "Mérida", gender: "M", interests: "Cocina, Arte", hasPhotoAlbum: true },
    { id: 6, username: "Pedro_L", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ", online: false, status: "Ausente", age: 35, city: "Caracas", gender: "H", interests: "Deportes", hasPhotoAlbum: false },
  ];

  // Filtrar usuarios
  const connectedUsers = allConnectedUsers.filter(user => {
    if (filterGender !== "Todos" && user.gender !== filterGender) return false;
    if (user.age < filterAgeMin || user.age > filterAgeMax) return false;
    if (filterCity && !user.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (filterInterests && !user.interests.toLowerCase().includes(filterInterests.toLowerCase())) return false;
    return true;
  });

  // Mensajes iniciales
  const initialMessages = [
    { id: 1, user: "Carlos_R", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk", text: "Hola a todos! ¿Cómo están?", time: "14:32", isOwn: false },
    { id: 2, user: "Ana_M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw", text: "¡Todo bien! Aquí charlando 😊", time: "14:33", isOwn: true },
    { id: 3, user: "Laura_G", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic", text: "Alguien sabe qué pasó con el evento de mañana?", time: "14:35", isOwn: false },
    { id: 4, user: "Javier_S", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ", text: "Sí! Se confirmó, será a las 8pm", time: "14:36", isOwn: false },
    { id: 5, user: "Ana_M", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw", text: "Perfecto, ahí estaré! 🎉", time: "14:37", isOwn: true },
  ];

  // Inicializar mensajes
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages(initialMessages);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll automático CON control manual
  useEffect(() => {
    if (isAutoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0); // Reset contador cuando está en auto-scroll
    } else {
      // Incrementar contador de mensajes no leídos
      setUnreadCount(prev => prev + 1);
    }
  }, [chatMessages]);

  // Detectar si el usuario hace scroll manual
  const handleChatScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    
    if (isAtBottom) {
      // Usuario llegó al final → Activar auto-scroll
      setIsAutoScrollEnabled(true);
      setUnreadCount(0);
    }
  };

  // Función para saltar al final
  const scrollToBottom = () => {
    setIsAutoScrollEnabled(true);
    setUnreadCount(0);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Encontrar sala actual de todas las categorías
  const currentRoom = Object.values(allRooms).flat().find(r => r.id === selectedRoom);

  // Sonido de notificación
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0vLTgjMGHm7A7+OZSA0PVanm8LJjHwU7k9r0z38uBihyyO3cnEQIEFyt5O+pWBYLTKXh9MBlKAYthMrz16g9CRdxwu7hnUsOElmr5fCyYx8FO5Pa9M5+LgYnccnt3JxECA9dru3+UlP=');
    audio.play().catch(() => {});
  };

  // Indicador de escribiendo
  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Reaccionar a mensaje
  const handleReaction = (messageId: number, reaction: string) => {
    const currentReactions = messageReactions[messageId] || { like: 0, love: 0, haha: 0 };
    const userReaction = currentReactions.userReaction;

    if (userReaction === reaction) {
      // Quitar reacción
      const updatedReactions = { ...currentReactions };
      updatedReactions[reaction as 'like' | 'love' | 'haha'] = Math.max(0, (updatedReactions[reaction as 'like' | 'love' | 'haha'] || 0) - 1);
      updatedReactions.userReaction = undefined;

      setMessageReactions({
        ...messageReactions,
        [messageId]: updatedReactions
      });
    } else {
      // Agregar o cambiar reacción
      const newReactions = { ...currentReactions };
      if (userReaction) {
        newReactions[userReaction as 'like' | 'love' | 'haha'] = Math.max(0, (newReactions[userReaction as 'like' | 'love' | 'haha'] || 0) - 1);
      }
      newReactions[reaction as 'like' | 'love' | 'haha'] = (newReactions[reaction as 'like' | 'love' | 'haha'] || 0) + 1;
      newReactions.userReaction = reaction;

      setMessageReactions({
        ...messageReactions,
        [messageId]: newReactions
      });
    }
  };

  // Guardar mensaje
  const toggleSaveMessage = (messageId: number) => {
    if (savedMessages.includes(messageId)) {
      setSavedMessages(savedMessages.filter((id: number) => id !== messageId));
    } else {
      setSavedMessages([...savedMessages, messageId]);
    }
  };

  // Reportar mensaje
  const reportMessage = (messageId: number, messageText: string, messageUser: string, messageTime: string) => {
    if (!reportedMessages.includes(messageId)) {
      setReportedMessages([...reportedMessages, messageId]);
      
      // Datos completos de la denuncia
      const reportData = {
        // Mensaje denunciado
        messageId,
        messageText,
        messageUser,
        messageTime,
        
        // Denunciante (usuario actual)
        reportedBy: "Ana_M", // TODO: Obtener del contexto de usuario
        reportedByUserId: 1, // TODO: Obtener del contexto
        reportedAt: new Date().toISOString(),
        
        // Contexto
        room: selectedRoom,
        
        // Para detectar abusos
        reportCount: reportedMessages.length + 1,
      };
      
      // TODO: Enviar al servidor
      console.log('📋 Denuncia enviada:', reportData);
      
      // Aquí iría la llamada al API
      // fetch('/api/reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reportData)
      // });
    }
  };

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      user: "Ana_M",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw",
      text: messageText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      replyTo: replyingTo,
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageText("");
    setReplyingTo(null);
    setIsTyping(false);
    playNotificationSound();
  };

  // Private message function removed - using FloatingMessagesWindow instead

  return (
    <div className="h-screen bg-connect-bg-dark text-white font-display flex flex-col overflow-hidden">
      <InternalHeader />

      {/* Main Chat Interface */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Room List */}
        <div className="w-80 bg-connect-card border-r border-connect-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-connect-border">
            <h2 className="text-xl font-bold mb-2">Salas de Chat</h2>
            <p className="text-sm text-connect-muted">Únete a una conversación</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* MIS 5 FAVORITAS - Siempre visible */}
            <div ref={favoritesRef}>
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <span>⭐</span> MIS FAVORITAS
                  {isEditingFavorites && (
                    <span className="text-[10px] text-orange-400 ml-2 animate-pulse">
                      ({selectedFavorites.length}/5)
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => isEditingFavorites ? saveFavorites() : setIsEditingFavorites(true)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                    isEditingFavorites
                      ? "bg-primary text-connect-bg-dark hover:brightness-110"
                      : "bg-white/5 text-connect-muted hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isEditingFavorites ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Guardar</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Ajustar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mensaje cuando hay sala pendiente */}
              {pendingRoomToAdd && (
                <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500 rounded-lg text-[10px] text-yellow-300 animate-pulse">
                  <p className="font-bold">⚠️ Haz click en una de tus favoritas para reemplazarla</p>
                </div>
              )}

              {getFavoriteRooms().map((room: any) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, true)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* SALAS PRINCIPALES */}
            <div>
              <button
                onClick={() => toggleCategory('principales')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider">
                  🏠 PRINCIPALES
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.principales ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.principales.slice(0, expandedCategories.principales ? undefined : 2).map((room) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, false)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* CIUDADES */}
            <div>
              <button
                onClick={() => toggleCategory('ciudades')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider">
                  🌆 CIUDADES
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.ciudades ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.ciudades.slice(0, expandedCategories.ciudades ? undefined : 2).map((room) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, false)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* INTERESES */}
            <div>
              <button
                onClick={() => toggleCategory('intereses')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider">
                  🎮 INTERESES
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.intereses ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.intereses.slice(0, expandedCategories.intereses ? undefined : 2).map((room) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, false)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* EXTRANJEROS */}
            <div>
              <button
                onClick={() => toggleCategory('extranjeros')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider">
                  🌎 EXTRANJEROS
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.extranjeros ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.extranjeros.slice(0, expandedCategories.extranjeros ? undefined : 2).map((room) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, false)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* +18 */}
            <div>
              <button
                onClick={() => toggleCategory('sexuales')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,149,0,0.8)]">
                  🔞 +18
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.sexuales ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.sexuales.slice(0, expandedCategories.sexuales ? undefined : 2).map((room) => (
                <button
                  key={room.id}
                  onClick={(e) => handleRoomClick(room.id, e)}
                  className={getRoomClassName(room.id, false)}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* SALAS DE USUARIOS */}
            <div>
              <button
                onClick={() => toggleCategory('usuarios')}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded transition-colors mb-1"
              >
                <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider">
                  👥 SALAS DE USUARIOS
                </h3>
                <svg
                  className={`w-4 h-4 text-connect-muted transition-transform ${expandedCategories.usuarios ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {allRooms.usuarios.length === 0 && expandedCategories.usuarios && (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-connect-muted">No hay salas creadas aún</p>
                </div>
              )}
              {allRooms.usuarios.slice(0, expandedCategories.usuarios ? undefined : 2).map((room: any) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all mb-1 ${
                    selectedRoom === room.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${room.color} flex items-center justify-center text-lg`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-white">{room.name}</h4>
                    <p className="text-[10px] text-connect-muted">{room.users} personas</p>
                  </div>
                </button>
              ))}
            </div>

            {/* BOTÓN CREAR SALA */}
            <button 
              onClick={() => setShowCreateRoomModal(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all"
            >
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-bold text-primary">Crear Sala</span>
            </button>
          </div>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-connect-bg-dark overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6 shrink-0" style={{boxShadow: `0 4px 20px rgba(${neonColor},${neonOpacity})`}}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${currentRoom?.color} flex items-center justify-center text-xl`}>
                {currentRoom?.icon}
              </div>
              <div>
                <h3 className="font-bold text-white">{currentRoom?.name}</h3>
                <p className="text-xs text-connect-muted">{currentRoom?.users} usuarios conectados</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className={`relative text-white hover:bg-primary/20 ${savedMessages.length > 0 ? 'bg-primary/20' : ''}`}
                onClick={() => setShowSavedMessages(!showSavedMessages)}
              >
                <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {savedMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-connect-bg-dark text-xs rounded-full flex items-center justify-center font-bold">
                    {savedMessages.length}
                  </span>
                )}
              </Button>
              
              {/* Botón de búsqueda con input desplegable */}
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  setShowSearchBar(true);
                }}
                onMouseLeave={() => {
                  searchTimeoutRef.current = setTimeout(() => {
                    setShowSearchBar(false);
                    setSearchQuery('');
                  }, 3000);
                }}
              >
                {!showSearchBar ? (
                  <Button variant="ghost" className="text-white hover:bg-primary/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </Button>
                ) : (
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar usuario o palabra..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 bg-connect-bg-dark border-primary/50 text-white placeholder-connect-muted text-sm"
                  />
                )}
              </div>
              
              {/* Botón de activar/desactivar bots */}
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-primary/20 ${botsActive ? 'bg-primary/20' : ''}`}
                onClick={() => setBotsActive(!botsActive)}
                title={botsActive ? "Detener bots" : "Activar bots"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {botsActive && (
                  <span className="ml-1 text-xs font-bold">ON</span>
                )}
              </Button>
              
              {/* Menú de ajustes (colores neón) */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-primary/20"
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
                
                {showThemeMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-connect-card border border-connect-border rounded-xl shadow-2xl p-4 z-50 w-64">
                    <h4 className="text-sm font-bold text-white mb-3">Color de sombra neón</h4>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { name: 'Verde', rgb: '16,255,0', color: 'bg-green-500' },
                        { name: 'Azul', rgb: '0,150,255', color: 'bg-blue-500' },
                        { name: 'Naranja', rgb: '255,149,0', color: 'bg-orange-500' },
                        { name: 'Lila', rgb: '200,100,255', color: 'bg-purple-500' },
                        { name: 'Amarillo', rgb: '255,255,0', color: 'bg-yellow-400' },
                        { name: 'Rojo', rgb: '255,50,50', color: 'bg-red-500' },
                        { name: 'Cian', rgb: '0,255,255', color: 'bg-cyan-400' },
                        { name: 'Rosa', rgb: '255,100,200', color: 'bg-pink-500' },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          onClick={() => {
                            setNeonColor(theme.rgb);
                            localStorage.setItem('neonColor', theme.rgb);
                          }}
                          className={`${theme.color} h-10 rounded-lg border-2 ${
                            neonColor === theme.rgb ? 'border-white' : 'border-transparent'
                          } hover:scale-110 transition-transform`}
                          title={theme.name}
                        />
                      ))}
                    </div>
                    
                    {/* Slider de opacidad */}
                    <div className="border-t border-connect-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-white">Opacidad</label>
                        <span className="text-xs text-connect-muted">{Math.round(neonOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={neonOpacity * 100}
                        onChange={(e) => {
                          const newOpacity = parseInt(e.target.value) / 100;
                          setNeonOpacity(newOpacity);
                          localStorage.setItem('neonOpacity', newOpacity.toString());
                        }}
                        className="w-full h-2 bg-connect-bg-dark rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgba(${neonColor},0) 0%, rgba(${neonColor},1) 100%)`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-0 relative" 
            onScroll={handleChatScroll}
            onClick={() => {
              // Click en el chat desactiva auto-scroll
              setIsAutoScrollEnabled(false);
            }}
          >
            {chatMessages.map((msg, index) => {
              const user = allConnectedUsers.find(u => u.username === msg.user);
              return (
                <div key={msg.id}>
                  {/* Layout: Avatar | Info Usuario | Mensaje (centrado) | Hora */}
                  <div className="flex gap-3 py-1.5 items-center">
                    {/* Avatar cuadrado */}
                    <div
                      className="relative flex-shrink-0"
                      onMouseEnter={(e) => {
                        if (user) {
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                          setHoveredUser(user.id);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredPosition({ x: rect.left + rect.width + 5, y: rect.top });
                        }
                      }}
                      onMouseLeave={() => {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredUser(null);
                        }, 300);
                      }}
                    >
                      <img
                        src={msg.avatar}
                        alt={msg.user}
                        className="w-10 h-10 rounded-md object-cover cursor-pointer"
                      />
                    </div>
                    
                    {/* Info Usuario (3 líneas fijas) */}
                    <div className="flex flex-col justify-center flex-shrink-0 w-24">
                      <span 
                        className="text-xs font-bold truncate leading-tight"
                        style={searchQuery && msg.user.toLowerCase().includes(searchQuery.toLowerCase()) ? {
                          color: `rgb(${neonColor})`
                        } : { color: 'white' }}
                      >
                        {msg.user}
                      </span>
                      <span className="text-xs text-connect-muted leading-tight">
                        {user ? `${user.gender}/${user.age}` : 'M/--'}
                      </span>
                      <span className="text-xs text-connect-muted truncate leading-tight">
                        {user?.city || 'Ciudad'}
                      </span>
                    </div>
                    
                    {/* Mensaje (centrado verticalmente, flex-1 para ocupar espacio) */}
                    <div className="flex-1 min-w-0 group relative">
                      <p className={`text-xs text-white/90 line-clamp-3 font-mono ${msg.replyTo ? 'italic' : ''}`} style={{overflowWrap: 'break-word', wordBreak: 'normal'}}>
                        {msg.replyTo && (
                          <span className="text-primary font-medium inline whitespace-nowrap">
                            @{msg.replyTo}:{' '}
                          </span>
                        )}
                        {searchQuery ? highlightText(msg.text, searchQuery) : msg.text}
                      </p>
                      
                      {/* Botones de acción en hover - Flotante DEBAJO del mensaje */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 top-full mt-0.5 bg-connect-bg-dark/95 backdrop-blur-sm rounded px-1.5 py-0.5 border border-white/10 z-10">
                        <button
                          onClick={() => toggleSaveMessage(msg.id)}
                          className={`${
                            savedMessages.includes(msg.id) ? 'text-primary' : 'text-connect-muted hover:text-white'
                          }`}
                        >
                          <svg className="w-3 h-3" fill={savedMessages.includes(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => setReplyingTo(msg.user)}
                          className="text-connect-muted hover:text-white"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        
                        {/* Reacciones rápidas */}
                        {['like', 'love', 'haha'].map((reaction) => (
                          <button
                            key={reaction}
                            onClick={() => handleReaction(msg.id, reaction as 'like' | 'love' | 'haha')}
                            className="text-xs hover:scale-110 transition-transform"
                          >
                            {reaction === 'like' && '👍'}
                            {reaction === 'love' && '❤️'}
                            {reaction === 'haha' && '😂'}
                          </button>
                        ))}
                        
                        {/* Separador */}
                        <div className="w-px h-3 bg-white/20 mx-0.5"></div>
                        
                        {/* Botón de denuncia - Texto al lado del triángulo */}
                        {!reportedMessages.includes(msg.id) ? (
                          <button
                            onClick={() => reportMessage(msg.id, msg.text, msg.user, msg.time)}
                            className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                            </svg>
                            <span className="text-[10px] font-medium">Denunciar</span>
                          </button>
                        ) : (
                          <button
                            className="text-connect-muted cursor-not-allowed flex items-center gap-1"
                            disabled
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L1 21h22L12 2zm0 3.83L19.53 19H4.47L12 5.83zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                            </svg>
                            <span className="text-[10px] font-medium">Denunciado</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Reacciones existentes */}
                      {messageReactions[msg.id] && (messageReactions[msg.id].like > 0 || messageReactions[msg.id].love > 0 || messageReactions[msg.id].haha > 0) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          {messageReactions[msg.id].like > 0 && (
                            <span className="text-[10px] bg-white/5 rounded-full px-1 py-0.5">👍 {messageReactions[msg.id].like}</span>
                          )}
                          {messageReactions[msg.id].love > 0 && (
                            <span className="text-[10px] bg-white/5 rounded-full px-1 py-0.5">❤️ {messageReactions[msg.id].love}</span>
                          )}
                          {messageReactions[msg.id].haha > 0 && (
                            <span className="text-[10px] bg-white/5 rounded-full px-1 py-0.5">😂 {messageReactions[msg.id].haha}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Hora (alineada arriba) */}
                    <span className="text-xs text-connect-muted flex-shrink-0 self-start">{msg.time}</span>
                  </div>
                  
                  {/* Línea divisoria casi invisible */}
                  {index < chatMessages.length - 1 && (
                    <div className="border-t border-white/5 my-0.5"></div>
                  )}
                </div>
              );
            })}

            {/* Indicador de escribiendo */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10"></div>
                <div className="bg-connect-card rounded-2xl px-4 py-2 rounded-tl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-connect-muted rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-connect-muted rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-connect-muted rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
            
            {/* Botón flotante de mensajes nuevos - Estilo neón elegante */}
            {!isAutoScrollEnabled && unreadCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que dispare el onClick del contenedor
                  scrollToBottom();
                }}
                className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-connect-bg-dark/80 hover:bg-connect-bg-dark text-white px-6 py-2.5 rounded-lg flex items-center justify-center transition-all z-50 backdrop-blur-md min-w-[180px]"
                style={{
                  borderWidth: '0.5px',
                  borderStyle: 'solid',
                  borderColor: `rgb(${neonColor})`,
                  boxShadow: `0 0 15px rgba(${neonColor}, ${neonOpacity * 0.5}), 0 0 30px rgba(${neonColor}, ${neonOpacity * 0.25}), inset 0 0 10px rgba(${neonColor}, ${neonOpacity * 0.1})`,
                }}
              >
                <span className="font-medium text-sm">{unreadCount} mensaje{unreadCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>

          {/* Panel de Mensajes Guardados */}
          {showSavedMessages && savedMessages.length > 0 && (
            <div className="absolute top-16 right-0 bottom-[72px] w-96 bg-connect-card border-l border-connect-border z-40 flex flex-col">
              <div className="p-4 border-b border-connect-border flex items-center justify-between">
                <h3 className="font-bold text-white">Mensajes Guardados</h3>
                <button onClick={() => setShowSavedMessages(false)} className="text-connect-muted hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.filter(msg => savedMessages.includes(msg.id)).map((msg) => (
                  <div key={msg.id} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{msg.user}</span>
                      <button
                        onClick={() => toggleSaveMessage(msg.id)}
                        className="text-connect-muted hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-white">{msg.text}</p>
                    <p className="text-xs text-connect-muted mt-1">{msg.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 bg-connect-card border-t border-connect-border shrink-0" style={{boxShadow: `0 -4px 20px rgba(${neonColor},${neonOpacity})`}}>
            {replyingTo && (
              <div className="mb-2 text-xs text-connect-muted flex items-center gap-2">
                <span>Respondiendo a @{replyingTo}</span>
                <button onClick={() => setReplyingTo(null)} className="text-primary hover:text-primary/80">
                  ✕
                </button>
              </div>
            )}
            <div className="flex gap-3 items-center">
              {/* Botón + para menciones */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-connect-muted hover:text-white shrink-0"
                  onClick={() => setShowUserMentions(!showUserMentions)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>

                {showUserMentions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-connect-card border border-connect-border rounded-xl shadow-xl w-64 max-h-80 overflow-y-auto p-2">
                    <p className="text-xs text-connect-muted px-2 py-1">Mencionar usuario:</p>
                    {allConnectedUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setReplyingTo(user.username);
                          setMessageText(messageText + `@${user.username} `);
                          setShowUserMentions(false);
                        }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                        <span className="text-sm text-white">{user.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Contador de caracteres - Siempre visible */}
              <span className={`text-xs font-medium ${
                messageText.length >= 401 ? 'text-red-400' : 
                messageText.length >= 351 ? 'text-yellow-400' : 
                'text-primary'
              }`}>
                {messageText.length}/450
              </span>

              <Input
                ref={messageInputRef}
                value={messageText}
                maxLength={450}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un mensaje aquí con máximo 450 caracteres incluido símbolos, espacio y números..."
                className="flex-1 bg-connect-bg-dark border-connect-border text-white placeholder-connect-muted rounded-full px-6 font-mono"
              />
              
              {/* Emojis básicos con picker */}
              <div className="relative flex gap-2">
                {basicEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setMessageText(messageText + emoji)}
                    onMouseEnter={() => setShowEmojiPicker(true)}
                    onMouseLeave={() => setShowEmojiPicker(false)}
                    className="text-2xl hover:scale-125 transition-transform p-1"
                  >
                    {emoji}
                  </button>
                ))}

                {showEmojiPicker && (
                  <div
                    className="absolute bottom-full right-0 mb-2 bg-connect-card border border-connect-border rounded-xl shadow-xl p-6 grid grid-cols-8 gap-3 w-[480px]"
                    onMouseEnter={() => setShowEmojiPicker(true)}
                    onMouseLeave={() => setShowEmojiPicker(false)}
                  >
                    {allEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setMessageText(messageText + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-4xl hover:scale-125 transition-transform p-2 hover:bg-white/10 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold rounded-full px-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Connected Users */}
        <div className="w-80 bg-connect-card border-l border-connect-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-connect-border shrink-0">
            <h2 className="text-lg font-bold">Usuarios Conectados</h2>
            <p className="text-xs text-connect-muted">{connectedUsers.length} en esta sala</p>
          </div>

          {/* Filtros */}
          <div className="border-b border-connect-border bg-white/5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros de búsqueda
              </h3>
              <svg
                className={`w-4 h-4 text-primary transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilters && (
              <div className="px-4 pb-4 space-y-3">
                {/* Género */}
                <div>
                  <label className="text-xs text-connect-muted block mb-1">Sexo</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setFilterGender("H")}
                      className={`py-1 px-2 text-xs rounded ${filterGender === "H" ? "bg-primary text-connect-bg-dark font-bold" : "bg-white/10 text-white"}`}
                    >
                      Hombre
                    </button>
                    <button
                      onClick={() => setFilterGender("M")}
                      className={`py-1 px-2 text-xs rounded ${filterGender === "M" ? "bg-primary text-connect-bg-dark font-bold" : "bg-white/10 text-white"}`}
                    >
                      Mujer
                    </button>
                    <button
                      onClick={() => setFilterGender("Todos")}
                      className={`py-1 px-2 text-xs rounded ${filterGender === "Todos" ? "bg-primary text-connect-bg-dark font-bold" : "bg-white/10 text-white"}`}
                    >
                      Todos
                    </button>
                  </div>
                </div>

                {/* Edad */}
                <div>
                  <label className="text-xs text-connect-muted block mb-1">Edad</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={filterAgeMin}
                      onChange={(e) => setFilterAgeMin(Number(e.target.value))}
                      className="w-full bg-connect-bg-dark border border-connect-border rounded px-2 py-1 text-xs text-white"
                      min="18"
                      max="99"
                    />
                    <span className="text-xs text-connect-muted">-</span>
                    <input
                      type="number"
                      value={filterAgeMax}
                      onChange={(e) => setFilterAgeMax(Number(e.target.value))}
                      className="w-full bg-connect-bg-dark border border-connect-border rounded px-2 py-1 text-xs text-white"
                      min="18"
                      max="99"
                    />
                  </div>
                </div>

                {/* Ciudad/Estado */}
                <div>
                  <label className="text-xs text-connect-muted block mb-1">Estado - Ciudad</label>
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-connect-bg-dark border border-connect-border rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="">Todas las ciudades</option>
                    <optgroup label="Distrito Capital">
                      <option value="Caracas">Caracas</option>
                    </optgroup>
                    <optgroup label="Miranda">
                      <option value="Los Teques">Los Teques</option>
                      <option value="Guarenas">Guarenas</option>
                      <option value="Guatire">Guatire</option>
                    </optgroup>
                    <optgroup label="Zulia">
                      <option value="Maracaibo">Maracaibo</option>
                      <option value="Cabimas">Cabimas</option>
                    </optgroup>
                    <optgroup label="Carabobo">
                      <option value="Valencia">Valencia</option>
                      <option value="Puerto Cabello">Puerto Cabello</option>
                    </optgroup>
                    <optgroup label="Lara">
                      <option value="Barquisimeto">Barquisimeto</option>
                      <option value="Cabudare">Cabudare</option>
                    </optgroup>
                    <optgroup label="Aragua">
                      <option value="Maracay">Maracay</option>
                      <option value="La Victoria">La Victoria</option>
                    </optgroup>
                    <optgroup label="Anzoátegui">
                      <option value="Barcelona">Barcelona</option>
                      <option value="Puerto La Cruz">Puerto La Cruz</option>
                      <option value="El Tigre">El Tigre</option>
                    </optgroup>
                    <optgroup label="Táchira">
                      <option value="San Cristóbal">San Cristóbal</option>
                      <option value="Táriba">Táriba</option>
                    </optgroup>
                    <optgroup label="Mérida">
                      <option value="Mérida">Mérida</option>
                      <option value="El Vigía">El Vigía</option>
                    </optgroup>
                    <optgroup label="Bolívar">
                      <option value="Ciudad Bolívar">Ciudad Bolívar</option>
                      <option value="Puerto Ordaz">Puerto Ordaz</option>
                    </optgroup>
                    <optgroup label="Portuguesa">
                      <option value="Guanare">Guanare</option>
                      <option value="Acarigua">Acarigua</option>
                    </optgroup>
                    <optgroup label="Sucre">
                      <option value="Cumaná">Cumaná</option>
                      <option value="Carúpano">Carúpano</option>
                    </optgroup>
                    <optgroup label="Monagas">
                      <option value="Maturín">Maturín</option>
                    </optgroup>
                    <optgroup label="Falcón">
                      <option value="Coro">Coro</option>
                      <option value="Punto Fijo">Punto Fijo</option>
                    </optgroup>
                    <optgroup label="Vargas">
                      <option value="La Guaira">La Guaira</option>
                      <option value="Catia La Mar">Catia La Mar</option>
                    </optgroup>
                  </select>
                </div>

                {/* Intereses */}
                <div>
                  <label className="text-xs text-connect-muted block mb-1">Intereses</label>
                  <input
                    type="text"
                    value={filterInterests}
                    onChange={(e) => setFilterInterests(e.target.value)}
                    placeholder="Ej: Música, Cine..."
                    className="w-full bg-connect-bg-dark border border-connect-border rounded px-2 py-1 text-xs text-white placeholder-connect-muted"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {connectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors relative"
              >
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={(e) => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setHoveredUser(user.id);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredPosition({ x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setHoveredUser(null);
                    }, 300);
                  }}
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {user.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-connect-card rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{user.username}</h4>
                  <p className="text-xs text-connect-muted truncate">{user.status}</p>
                </div>
                <button
                  onClick={() => openMessages(user.id)}
                  className="text-connect-muted hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-connect-border">
            <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium">
              Invitar Amigos
            </Button>
          </div>
        </div>
      </div>

      {/* Hover Card - User Info */}
      {hoveredUser && (
        <div
          className="fixed z-50 bg-connect-card border-2 border-primary rounded-xl shadow-2xl p-3 w-64"
          style={{
            left: `${hoveredPosition.x}px`,
            top: `${Math.min(Math.max(hoveredPosition.y, 100), window.innerHeight - 250)}px`,
            pointerEvents: 'auto'
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setHoveredUser(hoveredUser);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredUser(null);
            }, 300);
          }}
        >
          {(() => {
            const user = allConnectedUsers.find(u => u.id === hoveredUser);
            if (!user) return null;
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{user.username}</h3>
                    <p className="text-xs text-connect-muted">{user.age} años • {user.city}</p>
                    <p className="text-xs text-connect-muted">{user.gender === "H" ? "Hombre" : "Mujer"}</p>
                  </div>
                </div>
                <p className="text-xs text-connect-muted mb-2 line-clamp-2">Intereses: {user.interests}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <Link
                    href={`/publicprofile/${user.username.toLowerCase()}`}
                    target="_blank"
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg text-center transition-colors"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => openMessages(user.id)}
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    MP
                  </button>
                  <Link
                    href={`/albums/${user.username.toLowerCase()}`}
                    target="_blank"
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg text-center transition-colors ${
                      user.hasPhotoAlbum
                        ? "bg-primary hover:brightness-110 text-connect-bg-dark"
                        : "bg-gray-600 opacity-50 text-gray-400 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    Fotos
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Private Message Window */}
      {/* Private message modal removed - using FloatingMessagesWindow instead */}
      <FloatingMessagesWindow />
      
      {/* Modal de Crear Sala */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowCreateRoomModal(false)}>
          <div className="bg-connect-card rounded-xl shadow-2xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()} style={{
            borderWidth: '0.5px',
            borderStyle: 'solid',
            borderColor: `rgb(${neonColor})`,
            boxShadow: `0 0 30px rgba(${neonColor}, ${neonOpacity * 0.5})`
          }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Crear Nueva Sala</h2>
              <button onClick={() => setShowCreateRoomModal(false)} className="text-connect-muted hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Formulario */}
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre de la Sala</label>
                <Input
                  type="text"
                  value={newRoomData.name}
                  onChange={(e) => setNewRoomData({...newRoomData, name: e.target.value.slice(0, 15)})}
                  placeholder="Ej: Gamers VE"
                  className="w-full bg-connect-bg-dark border-primary/50 text-white"
                  maxLength={15}
                />
                <p className="text-xs text-connect-muted mt-1">{newRoomData.name.length}/15 caracteres</p>
              </div>
              
              {/* Tipo de Sala */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tipo de Sala</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setNewRoomData({...newRoomData, type: 'temporal'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.type === 'temporal'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏱️</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Temporal (Gratis)</div>
                        <div className="text-xs text-connect-muted">Desaparece cuando sales del chat</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setNewRoomData({...newRoomData, type: 'permanent'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.type === 'permanent'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">Permanente (PLUS+)</div>
                        <div className="text-xs text-connect-muted">Se mantiene activa, se borra si vacía 7+ días</div>
                      </div>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">PLUS+</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Icono - Modernos */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Icono</label>
                <div className="grid grid-cols-8 gap-2">
                  {['💬', '🎮', '⚽', '🎵', '🍕', '🌍', '💻', '📚', '🎨', '🏋️', '🚗', '✈️', '🏠', '💼', '🎬', '📷', '🎯', '🎪', '🎭', '🎲', '🏆', '⚡', '🔥', '💎'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewRoomData({...newRoomData, icon: emoji})}
                      className={`text-2xl p-2 rounded-lg border transition-all ${
                        newRoomData.icon === emoji 
                          ? 'border-primary bg-primary/20 scale-110' 
                          : 'border-white/10 hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Privacidad */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Privacidad</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setNewRoomData({...newRoomData, privacy: 'public'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.privacy === 'public'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">🌐 Pública</div>
                    <div className="text-xs text-connect-muted">Cualquiera puede entrar</div>
                  </button>
                  
                  <button
                    onClick={() => setNewRoomData({...newRoomData, privacy: '18+'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.privacy === '18+'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">🔞 Solo +18</div>
                    <div className="text-xs text-connect-muted">Verificación automática por edad de perfil</div>
                  </button>
                  
                  <button
                    onClick={() => setNewRoomData({...newRoomData, privacy: 'friends'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.privacy === 'friends'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">👥 Solo Amigos</div>
                    <div className="text-xs text-connect-muted">Solo tus amigos pueden entrar</div>
                  </button>
                  
                  <button
                    onClick={() => setNewRoomData({...newRoomData, privacy: 'password'})}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      newRoomData.privacy === 'password'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-white">🔑 Con Contraseña</div>
                    <div className="text-xs text-connect-muted">Requiere contraseña para entrar</div>
                  </button>
                </div>
              </div>
              
              {/* Contraseña (si se selecciona) */}
              {newRoomData.privacy === 'password' && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Contraseña</label>
                  <Input
                    type="password"
                    value={newRoomData.password}
                    onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})}
                    placeholder="Contraseña de la sala"
                    className="w-full bg-connect-bg-dark border-primary/50 text-white"
                  />
                </div>
              )}
            </div>
            
            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateRoomModal(false)}
                className="flex-1 border border-white/20 hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  // TODO: Verificar si tiene PLUS+ para salas permanentes
                  if (newRoomData.type === 'permanent') {
                    // Verificar PLUS+ en el backend
                    console.log('⚠️ Verificar PLUS+ del usuario');
                  }
                  
                  // Crear sala
                  console.log('🎨 Nueva sala:', newRoomData);
                  alert(`Sala "${newRoomData.name}" creada exitosamente!\nTipo: ${newRoomData.type === 'temporal' ? 'Temporal' : 'Permanente (PLUS+)'}\nPrivacidad: ${newRoomData.privacy}`);
                  setShowCreateRoomModal(false);
                  
                  // Reset form
                  setNewRoomData({
                    name: '',
                    icon: '💬',
                    type: 'temporal',
                    privacy: 'public',
                    password: ''
                  });
                }}
                disabled={!newRoomData.name.trim()}
                className="flex-1 bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Sala
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
