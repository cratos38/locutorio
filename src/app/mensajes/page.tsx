"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InternalHeader from "@/components/InternalHeader";

type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
};

type Conversation = {
  id: number;
  userId: number;
  username: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
};

export default function MensajesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "archived">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Datos de conversaciones
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      userId: 1,
      username: "javier_s",
      name: "Javier Solis",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ",
      lastMessage: "Hola, ¿viste las fotos que...",
      lastMessageTime: "12:30",
      unreadCount: 2,
      online: true,
      messages: [
        { id: 1, text: "Hola Ana! ¿Cómo estás?", time: "10:15", isOwn: false },
        { id: 2, text: "¡Hola Javier! Todo bien, ¿y tú?", time: "10:17", isOwn: true },
        { id: 3, text: "Muy bien, gracias! Oye, vi que subiste fotos nuevas", time: "10:18", isOwn: false },
        { id: 4, text: "Sí! Son de mi viaje a Los Roques", time: "10:20", isOwn: true },
        { id: 5, text: "¡Qué chévere! Se ve increíble ese lugar", time: "10:22", isOwn: false },
        { id: 6, text: "Es hermoso, tienes que ir algún día", time: "10:25", isOwn: true },
        { id: 7, text: "Definitivamente! ¿Me recomiendas algún hotel?", time: "10:28", isOwn: false },
        { id: 8, text: "Hola, ¿viste las fotos que...", time: "12:30", isOwn: false },
      ]
    },
    {
      id: 2,
      userId: 2,
      username: "laura_g",
      name: "Laura G.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_k-QPp7Bm1IORwcSuHrBwaT_cooNKHNEO7JbKB8m3ha0lPXpGDfwzn5chvUYwCPj-s9EoOhcVO8dF1vAaBaSF_i1tPyB_hzk8KO03gjXPyNa6N_QrbNVGTFpDQnDJqg10fnvdppt4JpIGSb5n4ql1Ivdmsn9olN4WVvyYvYvXGFUkTqnZmxxtewOWL7MEejxvXGzyIEmcWxbTMlB2HIf7XruycmsEoo9DgJVX043mkpUuUJhOyS_wCVP3JlP0-kYUXILRCrp8H8ic",
      lastMessage: "¡Te envió una invitación!",
      lastMessageTime: "Ayer",
      unreadCount: 0,
      online: false,
      messages: [
        { id: 1, text: "Hola Ana, ¿quieres ir al concierto este sábado?", time: "Ayer 15:30", isOwn: false },
        { id: 2, text: "¡Claro que sí! ¿Qué banda toca?", time: "Ayer 16:00", isOwn: true },
        { id: 3, text: "Los Amigos Invisibles! Conseguí 2 entradas", time: "Ayer 16:05", isOwn: false },
        { id: 4, text: "¡Genial! Me encanta esa banda 🎵", time: "Ayer 16:10", isOwn: true },
        { id: 5, text: "¡Te envío una invitación!", time: "Ayer 16:15", isOwn: false },
      ]
    },
    {
      id: 3,
      userId: 3,
      username: "carlos_r",
      name: "Carlos R.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGb3wmeflExbrjA88BEWgMoBARwnsWXrjnuX9eX0BtYZqnIuIuV2k_c80FD-aUsIiTHut6e-k4cJzjyk4OERJYc_7V103-NFf7eD9WJOXNYzN4YOa0ulR1gN-hucbZyaIz5RfojyS2OglAr4ickMC-qkdFxcoLvF59IV_i3Kxtk7OBbeQjLB2sX2q9THJ5MpQALQETi5ABgMmTiDxzKtRbbs6RUv1H7KU0c6gcA7w_9cbtihKJ1iEfLVPD4g6KGUSrVkXQuXl421Fk",
      lastMessage: "¿Nos vemos este fin de...",
      lastMessageTime: "14 Dic",
      unreadCount: 0,
      online: true,
      messages: [
        { id: 1, text: "Ana, ¿tienes planes para el fin de semana?", time: "14 Dic 18:00", isOwn: false },
        { id: 2, text: "Aún no tengo nada planeado", time: "14 Dic 18:30", isOwn: true },
        { id: 3, text: "¿Nos vemos este fin de semana?", time: "14 Dic 19:00", isOwn: false },
      ]
    },
    {
      id: 4,
      userId: 4,
      username: "maria_p",
      name: "Maria P.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeeMOB_U1vT493g04GMXkQt_nyAG8MhMlNfzG4z2DYPQKR24ob0HEzimmB96Sd4GhY0YRP-TPyWuknoITGye5AxQIIkUMS6bJlap4RBIO5q_9eDlpkiyd765t4bxfntbtlcCVH1rCWDZMmwPm00connYJnD94blHHAjyt0rEyqSIOeuhOi0cgq-CVpWnR4eVh26kZy9ucxX4cLrs2p0K3JeEK_8H1TCTgJzrmRB0bDkW41xryg77g7H1GG4XFsbwP_wkCMxr-3NlwB",
      lastMessage: "Gracias por el consejo 😊",
      lastMessageTime: "10 Dic",
      unreadCount: 1,
      online: false,
      messages: [
        { id: 1, text: "Hola Ana, ¿me puedes ayudar con algo?", time: "10 Dic 10:00", isOwn: false },
        { id: 2, text: "Claro, dime", time: "10 Dic 10:15", isOwn: true },
        { id: 3, text: "¿Conoces algún buen restaurante en Caracas?", time: "10 Dic 10:20", isOwn: false },
        { id: 4, text: "Sí! Te recomiendo La Casa Bistró, es excelente", time: "10 Dic 10:25", isOwn: true },
        { id: 5, text: "Gracias por el consejo 😊", time: "10 Dic 10:30", isOwn: false },
      ]
    },
    {
      id: 5,
      userId: 5,
      username: "sofia_m",
      name: "Sofía M.",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYofTvqVt_2Lu8sae20y2yL8U1RSfBdI4CTdq11IzKkQGmmLnacepHa6_RDA63mrE6WYKmUvPX4Df-kx3DaUGM6S3SCk0GEu-sr3DwKsy8ejCWJOgg554w3KwDj2D74_RZQ4HrEu_CIjtNnY9B7ydy_ur9Xski9wL9YcmK7Bkoxvti-rpSbFyiqiM1qmytWWqJDMFCOMd3_x-YHcLpZdviE8Nt5gVZxmRAU8FOq6Ddci9LVMO-hhvrngkyNDslvWLfJmfFwAEc_mtw",
      lastMessage: "Perfecto, nos vemos allá",
      lastMessageTime: "8 Dic",
      unreadCount: 0,
      online: true,
      messages: [
        { id: 1, text: "Ana! ¿Vienes a la reunión del viernes?", time: "8 Dic 14:00", isOwn: false },
        { id: 2, text: "Sí, allí estaré!", time: "8 Dic 14:15", isOwn: true },
        { id: 3, text: "Perfecto, nos vemos allá", time: "8 Dic 14:20", isOwn: false },
      ]
    },
  ]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  // Conversación actual
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  // Filtrar conversaciones
  const filteredConversations = conversations.filter(conv => {
    // Filtro de búsqueda
    if (searchQuery && !conv.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro de tipo
    if (filterType === "unread" && conv.unreadCount === 0) {
      return false;
    }

    return true;
  });

  // Enviar mensaje
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setConversations(conversations.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          lastMessageTime: "Ahora",
        };
      }
      return conv;
    }));

    setMessageText("");
  };

  // Marcar como leído al seleccionar conversación
  const handleSelectConversation = (convId: number) => {
    setSelectedConversation(convId);
    setConversations(conversations.map(conv => {
      if (conv.id === convId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  return (
    <div className="h-screen bg-connect-bg-dark text-white font-display flex flex-col overflow-hidden">
      <InternalHeader />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar - Conversations List */}
        <div className="w-80 bg-connect-card border-r border-connect-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-connect-border shrink-0">
            <h2 className="text-xl font-bold mb-3">Mensajes Privados</h2>

            {/* Search */}
            <div className="relative mb-3">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-connect-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversaciones..."
                className="pl-10 bg-connect-bg-dark border-connect-border text-white placeholder-connect-muted rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-primary text-connect-bg-dark"
                    : "bg-white/5 text-connect-muted hover:bg-white/10"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType("unread")}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterType === "unread"
                    ? "bg-primary text-connect-bg-dark"
                    : "bg-white/5 text-connect-muted hover:bg-white/10"
                }`}
              >
                No leídas
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-connect-muted">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all mb-1 ${
                      selectedConversation === conv.id
                        ? "bg-primary/20 border-2 border-primary"
                        : "hover:bg-white/5 border-2 border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary border-2 border-connect-card rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-bold text-white text-sm truncate">{conv.name}</h3>
                        <span className="text-xs text-connect-muted shrink-0 ml-2">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-connect-muted'}`}>
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0 ml-2">
                            <span className="text-xs font-bold text-connect-bg-dark">{conv.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right - Chat Area */}
        <div className="flex-1 flex flex-col bg-connect-bg-dark overflow-hidden">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-connect-card border-b border-connect-border flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentConversation.avatar}
                      alt={currentConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {currentConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-connect-card rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{currentConversation.name}</h3>
                    <p className="text-xs text-connect-muted">
                      {currentConversation.online ? "En línea" : "Desconectado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                {currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          msg.isOwn
                            ? 'bg-primary text-connect-bg-dark rounded-br-sm'
                            : 'bg-connect-card text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <p className={`text-xs text-connect-muted mt-1 ${msg.isOwn ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-connect-card border-t border-connect-border shrink-0">
                <div className="flex gap-3 items-end">
                  <Button
                    variant="ghost"
                    className="text-connect-muted hover:text-white shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </Button>

                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-connect-bg-dark border-connect-border text-white placeholder-connect-muted rounded-full px-6"
                  />

                  <Button
                    variant="ghost"
                    className="text-connect-muted hover:text-white shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Button>

                  <Button
                    onClick={handleSendMessage}
                    className="bg-primary hover:bg-primary/90 text-connect-bg-dark font-bold rounded-full px-6 shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-connect-muted">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Selecciona una conversación</h3>
                <p className="text-sm">Elige un contacto para empezar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
