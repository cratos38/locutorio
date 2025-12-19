"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos
export type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  read?: boolean;
  delivered?: boolean;
};

export type Conversation = {
  id: number;
  userId: number;
  username: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "online" | "away" | "offline"; // online = cyan, away = orange, offline = gray
  messages: Message[];
  isBlocked?: boolean;
  notes?: string;
};

export type WindowState = "normal" | "minimized" | "maximized";

export type MessagesSettings = {
  sound: boolean;
  autoOpen: boolean;
  desktopNotifications: boolean;
  messagePreview: boolean;
  enterToSend: boolean;
};

interface MessagesContextType {
  // Estado de la ventana
  isOpen: boolean;
  windowState: WindowState;
  windowPosition: { x: number; y: number };
  windowSize: { width: number; height: number };
  
  // Conversaciones
  conversations: Conversation[];
  currentConversation: number | null;
  typingUsers: number[];
  
  // Configuración
  settings: MessagesSettings;
  
  // Acciones de ventana
  openMessages: (userId?: number) => void;
  closeMessages: () => void;
  minimizeMessages: () => void;
  maximizeMessages: () => void;
  restoreMessages: () => void;
  setWindowPosition: (position: { x: number; y: number }) => void;
  setWindowSize: (size: { width: number; height: number }) => void;
  
  // Acciones de mensajes
  selectConversation: (conversationId: number) => void;
  sendMessage: (text: string) => void;
  markAsRead: (conversationId: number) => void;
  addFriend: (userId: number) => void;
  blockUser: (userId: number, days: number) => void;
  reportUser: (userId: number, reason: string) => void;
  addNote: (userId: number, note: string) => void;
  
  // Funciones auxiliares
  getUnreadCount: () => number;
  setTyping: (userId: number, isTyping: boolean) => void;
  updateSettings: (settings: Partial<MessagesSettings>) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ children }) => {
  // Estado de la ventana
  const [isOpen, setIsOpen] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>("normal");
  const [windowPosition, setWindowPosition] = useState({ x: 100, y: 100 });
  const [windowSize, setWindowSize] = useState({ width: 500, height: 600 });
  const [savedNormalState, setSavedNormalState] = useState({ 
    position: { x: 100, y: 100 }, 
    size: { width: 500, height: 600 } 
  });
  
  // Conversaciones
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  
  // Configuración
  const [settings, setSettings] = useState<MessagesSettings>({
    sound: true,
    autoOpen: false,
    desktopNotifications: false,
    messagePreview: true,
    enterToSend: true
  });

  // Cargar datos desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConversations = localStorage.getItem('conversations');
      const savedSettings = localStorage.getItem('messagesSettings');
      const savedWindowState = localStorage.getItem('messagesWindowState');
      
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      } else {
        // Datos iniciales de ejemplo
        const initialConversations: Conversation[] = [
          {
            id: 1,
            userId: 1,
            username: "javier_s",
            name: "Javier Solis",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcAgJzBVY0VcA1ICIc8GlT1M1eiu5Og95ubTpOa58bFlu9OV7QmjTZH1cbQBwbPhtvFKip_HyKq7atWt0zzANSMDAC_wrJi67kz8SXvn-HnWmPBihZZc3BAfUyEZ7TOAs4LhWokU66QRGD6Lhq2RYxETUZKEeHUzBCVw0BiuXDqP1lYEwLeNcffCadpUuZggEMO_dPmEceKo3MQ6C2rOGG5yHNZlrhQNjpnrQwZB36kSlcM_HfVWyMRoN6UQ6gNvgLzfLeM1B3VVpJ",
            lastMessage: "Hola, ¿cómo estás?",
            lastMessageTime: "12:30",
            unreadCount: 2,
            status: "online", // cyan dot
            messages: [
              { id: 1, text: "Hola Ana! ¿Cómo estás?", time: "10:15", isOwn: false, read: true, delivered: true },
              { id: 2, text: "¡Hola Javier! Todo bien, ¿y tú?", time: "10:17", isOwn: true, read: true, delivered: true },
            ]
          },
          {
            id: 2,
            userId: 2,
            username: "laura_g",
            name: "Laura García",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
            lastMessage: "Nos vemos luego",
            lastMessageTime: "11:45",
            unreadCount: 0,
            status: "away", // orange dot - ausente
            messages: [
              { id: 1, text: "¿Nos vemos hoy?", time: "11:30", isOwn: true, read: true, delivered: true },
              { id: 2, text: "Nos vemos luego", time: "11:45", isOwn: false, read: true, delivered: true },
            ]
          },
          {
            id: 3,
            userId: 3,
            username: "carlos_m",
            name: "Carlos Martínez",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
            lastMessage: "Hasta mañana",
            lastMessageTime: "Ayer",
            unreadCount: 0,
            status: "offline", // gray dot - desconectado
            messages: [
              { id: 1, text: "Gracias por todo", time: "20:15", isOwn: false, read: true, delivered: true },
              { id: 2, text: "De nada! Hasta mañana", time: "20:17", isOwn: true, read: true, delivered: true },
            ]
          }
        ];
        setConversations(initialConversations);
        localStorage.setItem('conversations', JSON.stringify(initialConversations));
      }
      
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      if (savedWindowState) {
        const state = JSON.parse(savedWindowState);
        setWindowPosition(state.position);
        setWindowSize(state.size);
      }
    }
  }, []);

  // Guardar conversaciones cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Guardar configuración cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('messagesSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Guardar estado de ventana
  useEffect(() => {
    if (typeof window !== 'undefined' && windowState === 'normal') {
      localStorage.setItem('messagesWindowState', JSON.stringify({
        position: windowPosition,
        size: windowSize
      }));
    }
  }, [windowPosition, windowSize, windowState]);

  // Acciones de ventana
  const openMessages = (userId?: number) => {
    setIsOpen(true);
    if (userId) {
      const conversation = conversations.find(c => c.userId === userId);
      if (conversation) {
        setCurrentConversation(conversation.id);
        markAsRead(conversation.id);
      }
    } else if (conversations.length > 0 && !currentConversation) {
      // Auto-select first conversation if none selected
      setCurrentConversation(conversations[0].id);
    }
    if (settings.sound && typeof Audio !== 'undefined') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSJ0vLTgjMGHm7A7+OZSA0PVanm8LJjHwU7k9r0z38uBihyyO3cnEQIEFyt5O+pWBYLTKXh9MBlKAYthMrz16g9CRdxwu7hnUsOElmr5fCyYx8FO5Pa9M5+LgYnccnt3JxECA9dru3+UlP=');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  const closeMessages = () => {
    setIsOpen(false);
  };

  const minimizeMessages = () => {
    if (windowState === 'normal') {
      setSavedNormalState({ position: windowPosition, size: windowSize });
    }
    setWindowState("minimized");
  };

  const maximizeMessages = () => {
    if (windowState === 'normal') {
      setSavedNormalState({ position: windowPosition, size: windowSize });
    }
    setWindowState("maximized");
  };

  const restoreMessages = () => {
    setWindowState("normal");
    setWindowPosition(savedNormalState.position);
    setWindowSize(savedNormalState.size);
  };

  // Acciones de mensajes
  const selectConversation = (conversationId: number) => {
    setCurrentConversation(conversationId);
    markAsRead(conversationId);
  };

  const sendMessage = (text: string) => {
    if (!currentConversation || !text.trim()) return;
    
    const newMessage: Message = {
      id: Date.now(),
      text: text.trim(),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      read: false,
      delivered: true
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: text.trim(),
          lastMessageTime: newMessage.time
        };
      }
      return conv;
    }));
  };

  const markAsRead = (conversationId: number) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    }));
  };

  const addFriend = (userId: number) => {
    // TODO: Implementar lógica de agregar amigo
    console.log('Add friend:', userId);
  };

  const blockUser = (userId: number, days: number) => {
    setConversations(prev => prev.map(conv => {
      if (conv.userId === userId) {
        return { ...conv, isBlocked: true };
      }
      return conv;
    }));
  };

  const reportUser = (userId: number, reason: string) => {
    // TODO: Implementar lógica de reporte
    console.log('Report user:', userId, reason);
  };

  const addNote = (userId: number, note: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.userId === userId) {
        return { ...conv, notes: note };
      }
      return conv;
    }));
  };

  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const setTyping = (userId: number, isTyping: boolean) => {
    if (isTyping) {
      setTypingUsers(prev => [...prev, userId]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 3000);
    } else {
      setTypingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const updateSettings = (newSettings: Partial<MessagesSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value: MessagesContextType = {
    isOpen,
    windowState,
    windowPosition,
    windowSize,
    conversations,
    currentConversation,
    typingUsers,
    settings,
    openMessages,
    closeMessages,
    minimizeMessages,
    maximizeMessages,
    restoreMessages,
    setWindowPosition,
    setWindowSize,
    selectConversation,
    sendMessage,
    markAsRead,
    addFriend,
    blockUser,
    reportUser,
    addNote,
    getUnreadCount,
    setTyping,
    updateSettings
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
