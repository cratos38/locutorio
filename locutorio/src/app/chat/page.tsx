"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import InternalHeader from "@/components/InternalHeader";

export default function ChatRoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [messageText, setMessageText] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: number, user: string, avatar: string, text: string, time: string, isOwn: boolean, replyTo?: string | null}>>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserMentions, setShowUserMentions] = useState(false);
  const [hoveredUser, setHoveredUser] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPrivateMessage, setShowPrivateMessage] = useState<{id: number, username: string, avatar: string} | null>(null);
  const [privateMessages, setPrivateMessages] = useState<{[key: number]: Array<{id: number, text: string, time: string, isOwn: boolean}>}>({});
  const [privateMessageText, setPrivateMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [savedMessages, setSavedMessages] = useState<number[]>([]);
  const [messageReactions, setMessageReactions] = useState<{[key: number]: {like: number, love: number, haha: number, userReaction?: string}}>({});
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtros de usuarios
  const [filterGender, setFilterGender] = useState("Todos");
  const [filterAgeMin, setFilterAgeMin] = useState(18);
  const [filterAgeMax, setFilterAgeMax] = useState(99);
  const [filterCity, setFilterCity] = useState("");
  const [filterInterests, setFilterInterests] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Salas disponibles
  const rooms = [
    { id: "general", name: "General", icon: "👥", color: "bg-blue-500/20 text-blue-400", users: 245, category: "Popular" },
    { id: "musica", name: "Música", icon: "🎵", color: "bg-purple-500/20 text-purple-400", users: 128, category: "Popular" },
    { id: "citas", name: "Citas", icon: "💕", color: "bg-pink-500/20 text-pink-400", users: 89, category: "Popular" },
    { id: "deportes", name: "Deportes", icon: "⚽", color: "bg-green-500/20 text-green-400", users: 67, category: "Temas" },
    { id: "cine", name: "Cine", icon: "🎬", color: "bg-yellow-500/20 text-yellow-400", users: 54, category: "Temas" },
    { id: "tecnologia", name: "Tecnología", icon: "💻", color: "bg-cyan-500/20 text-cyan-400", users: 91, category: "Temas" },
    { id: "gaming", name: "Gaming", icon: "🎮", color: "bg-indigo-500/20 text-indigo-400", users: 112, category: "Temas" },
    { id: "cocina", name: "Cocina", icon: "🍳", color: "bg-orange-500/20 text-orange-400", users: 43, category: "Temas" },
  ];

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

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const currentRoom = rooms.find(r => r.id === selectedRoom);

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

  // Enviar mensaje privado
  const handleSendPrivateMessage = () => {
    if (!privateMessageText.trim() || !showPrivateMessage) return;

    const newPM = {
      id: (privateMessages[showPrivateMessage.id]?.length || 0) + 1,
      text: privateMessageText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setPrivateMessages({
      ...privateMessages,
      [showPrivateMessage.id]: [...(privateMessages[showPrivateMessage.id] || []), newPM]
    });
    setPrivateMessageText("");
  };

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

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {/* Popular Rooms */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider px-2 mb-2">Popular</h3>
              {rooms.filter(r => r.category === "Popular").map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedRoom === room.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${room.color} flex items-center justify-center text-2xl`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-white">{room.name}</h4>
                    <p className="text-xs text-connect-muted">{room.users} conectados</p>
                  </div>
                  {selectedRoom === room.id && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Topic Rooms */}
            <div>
              <h3 className="text-xs font-bold text-connect-muted uppercase tracking-wider px-2 mb-2">Temas</h3>
              {rooms.filter(r => r.category === "Temas").map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedRoom === room.id
                      ? "bg-primary/20 border-2 border-primary"
                      : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${room.color} flex items-center justify-center text-2xl`}>
                    {room.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-white">{room.name}</h4>
                    <p className="text-xs text-connect-muted">{room.users} conectados</p>
                  </div>
                  {selectedRoom === room.id && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-connect-bg-dark overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6 shrink-0">
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
                className={`relative ${savedMessages.length > 0 ? 'text-primary' : 'text-connect-muted hover:text-white'}`}
                onClick={() => setShowSavedMessages(!showSavedMessages)}
              >
                <svg className="w-5 h-5" fill={savedMessages.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {savedMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-connect-bg-dark text-xs rounded-full flex items-center justify-center font-bold">
                    {savedMessages.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" className="text-connect-muted hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
              <Button variant="ghost" className="text-connect-muted hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <div
                  className="relative"
                  onMouseEnter={(e) => {
                    const user = allConnectedUsers.find(u => u.username === msg.user);
                    if (user) {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                      setHoveredUser(user.id);
                      setHoveredPosition({ x: e.clientX, y: e.clientY });
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
                    className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col items-start max-w-2xl group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{msg.user}</span>
                    <span className="text-xs text-connect-muted">{msg.time}</span>
                    <button
                      onClick={() => toggleSaveMessage(msg.id)}
                      className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        savedMessages.includes(msg.id) ? 'text-primary' : 'text-connect-muted hover:text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill={savedMessages.includes(msg.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                  <div className={`rounded-2xl px-4 py-2 rounded-tl-sm ${
                    msg.isOwn
                      ? 'bg-white/5 backdrop-blur-sm border border-white/10 text-white shadow-lg'
                      : 'bg-connect-card text-white'
                  } ${msg.replyTo ? 'italic bg-primary/5 border-l-4 border-primary' : ''}`}>
                    {msg.replyTo && (
                      <p className="text-xs text-connect-muted mb-1">
                        Respondió a @{msg.replyTo}
                      </p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>

                  {/* Reacciones */}
                  <div className="flex items-center gap-2 mt-1">
                    {messageReactions[msg.id] && (messageReactions[msg.id].like > 0 || messageReactions[msg.id].love > 0 || messageReactions[msg.id].haha > 0) && (
                      <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
                        {messageReactions[msg.id].like > 0 && (
                          <span className="text-xs">👍 {messageReactions[msg.id].like}</span>
                        )}
                        {messageReactions[msg.id].love > 0 && (
                          <span className="text-xs">❤️ {messageReactions[msg.id].love}</span>
                        )}
                        {messageReactions[msg.id].haha > 0 && (
                          <span className="text-xs">😂 {messageReactions[msg.id].haha}</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReaction(msg.id, 'like')}
                        className={`text-lg hover:scale-125 transition-transform ${
                          messageReactions[msg.id]?.userReaction === 'like' ? 'opacity-100' : 'opacity-60'
                        }`}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleReaction(msg.id, 'love')}
                        className={`text-lg hover:scale-125 transition-transform ${
                          messageReactions[msg.id]?.userReaction === 'love' ? 'opacity-100' : 'opacity-60'
                        }`}
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => handleReaction(msg.id, 'haha')}
                        className={`text-lg hover:scale-125 transition-transform ${
                          messageReactions[msg.id]?.userReaction === 'haha' ? 'opacity-100' : 'opacity-60'
                        }`}
                      >
                        😂
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
          <div className="p-4 bg-connect-card border-t border-connect-border shrink-0">
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

              <Input
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-connect-bg-dark border-connect-border text-white placeholder-connect-muted rounded-full px-6"
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
                    className="absolute bottom-full right-0 mb-2 bg-connect-card border border-connect-border rounded-xl shadow-xl p-4 grid grid-cols-7 gap-3"
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
                        className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-white/10 rounded"
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
                  onClick={() => setShowPrivateMessage({id: user.id, username: user.username, avatar: user.avatar})}
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
            right: '340px',
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
                    href={`/perfil/${user.username.toLowerCase()}`}
                    target="_blank"
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg text-center transition-colors"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={() => setShowPrivateMessage({id: user.id, username: user.username, avatar: user.avatar})}
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    MP
                  </button>
                  <Link
                    href={`/albumes/${user.username.toLowerCase()}`}
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
      {showPrivateMessage && (
        <div className="fixed bottom-4 right-4 w-96 bg-connect-card border-2 border-primary rounded-xl shadow-2xl z-50 flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-connect-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={showPrivateMessage.avatar} alt={showPrivateMessage.username} className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-bold text-white">{showPrivateMessage.username}</h3>
                <p className="text-xs text-connect-muted">Mensaje privado</p>
              </div>
            </div>
            <button onClick={() => setShowPrivateMessage(null)} className="text-connect-muted hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(privateMessages[showPrivateMessage.id] || []).map((pm) => (
              <div key={pm.id} className={`flex ${pm.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                  pm.isOwn
                    ? 'bg-primary text-connect-bg-dark'
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="text-sm">{pm.text}</p>
                  <p className="text-xs opacity-70 mt-1">{pm.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-connect-border flex gap-2">
            <Input
              value={privateMessageText}
              onChange={(e) => setPrivateMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendPrivateMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-connect-bg-dark border-connect-border text-white"
            />
            <Button
              onClick={handleSendPrivateMessage}
              className="bg-primary hover:bg-primary/90 text-connect-bg-dark"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
