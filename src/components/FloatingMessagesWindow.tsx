"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useMessages, type Conversation } from "@/contexts/MessagesContext";
import { Input } from "@/components/ui/input";

type SidebarTabType = "conversaciones" | "invitaciones";
type ActiveViewType = "mensajes" | "archivo" | "ajustes" | "fotos" | "notas" | "denunciar" | "nueva-conversacion";

// Demo conversation requests (TODO: Replace with real data from backend)
const demoRequests = [
  {
    id: 1,
    name: "The.Ronin",
    avatar: "https://i.pravatar.cc/150?img=12",
    message: "quiere conversar contigo"
  },
  {
    id: 2,
    name: "Laura",
    avatar: "https://i.pravatar.cc/150?img=47",
    message: "quiere conversar contigo"
  }
];

// Invitaciones Content Component
function InvitacionesContent() {
  const [requests, setRequests] = useState(demoRequests);

  const handleAccept = (id: number) => {
    console.log(`Accepted request from user ${id}`);
    // TODO: Add to conversations list in backend
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleReject = (id: number) => {
    console.log(`Rejected request from user ${id}`);
    // TODO: Remove from requests in backend
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleSaveForLater = (id: number) => {
    console.log(`Saved request from user ${id} for later`);
    // TODO: Mark as "saved for later" in backend
    setRequests(requests.filter(r => r.id !== id));
  };

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4">
          group_off
        </span>
        <p className="text-gray-400 text-sm leading-relaxed">
          No tienes ninguna solicitud de conversación
        </p>
        <p className="text-text-muted text-xs mt-2">
          Puedes empezar tú mismo escribiendo como primero
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 rounded-lg bg-forest-dark/40 border border-forest-dark/30"
        >
          {/* User info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neon-green/30">
              <img 
                src={request.avatar} 
                alt={request.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-gray-300 font-bold text-sm">{request.name}</p>
              <p className="text-text-muted text-xs">{request.message}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleReject(request.id)}
              className="flex-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-900/30"
            >
              Rechazar
            </button>
            <button
              onClick={() => handleSaveForLater(request.id)}
              className="flex-1 px-3 py-2 bg-orange-900/30 hover:bg-orange-900/50 text-orange-400 rounded-lg text-xs font-bold transition-colors border border-orange-900/30"
            >
              Guardar
            </button>
            <button
              onClick={() => handleAccept(request.id)}
              className="flex-1 px-3 py-2 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green rounded-lg text-xs font-bold transition-colors border border-neon-green/30"
            >
              Aceptar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FloatingMessagesWindow() {
  const {
    isOpen,
    windowState,
    windowPosition,
    windowSize,
    conversations,
    currentConversation,
    typingUsers,
    settings,
    closeMessages,
    minimizeMessages,
    maximizeMessages,
    restoreMessages,
    setWindowPosition,
    setWindowSize,
    selectConversation,
    sendMessage,
    updateSettings,
  } = useMessages();

  const [activeView, setActiveView] = useState<ActiveViewType>("mensajes");
  const [sidebarTab, setSidebarTab] = useState<SidebarTabType>("conversaciones");
  const [messageInput, setMessageInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  // Archivo search state
  const [archivoSearchQuery, setArchivoSearchQuery] = useState("");
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportReasons, setSelectedReportReasons] = useState<string[]>([]);
  
  // Notes modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [userNotes, setUserNotes] = useState<{ [userId: number]: string }>({}); // Notes per user
  const [hasPlus, setHasPlus] = useState(true); // TODO: Connect to real user subscription (temporarily true for testing)
  const [notesModalTimer, setNotesModalTimer] = useState<NodeJS.Timeout | null>(null);
  const [notesModalPosition, setNotesModalPosition] = useState({ top: 0, left: 0 });
  
  // Photos modal state
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [photosModalTimer, setPhotosModalTimer] = useState<NodeJS.Timeout | null>(null);
  const [photosModalPosition, setPhotosModalPosition] = useState({ top: 0, left: 0 });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Add friend modal state
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('mis-amigos');
  
  // New conversation modal state
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchNick, setSearchNick] = useState('');
  
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Popular emojis
  const emojis = [
    '👍', '😀', '😉', '😜', '😂',
    '😔', '😢', '😐', '😎', '😍',
    '😏', '😠', '😘', '😈', '😇',
    '❤️', '😑', '🌹', '😱', '🤓'
  ];
  
  // Insert emoji into message input
  const insertEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  // Demo saved conversations (TODO: Replace with real data)
  const savedConversations = [
    // Empty for now - will show when user clicks "Guardar para luego"
  ];
  
  // Demo online friends (TODO: Replace with real friends data)
  const onlineFriends = [
    // Empty for now - will populate from "Añadir amigo" feature
  ];

  
  // Demo photos (TODO: Replace with actual conversation photos)
  const demoPhotos = [
    { url: 'https://picsum.photos/400/300?random=1', x: 10, y: 15 },
    { url: 'https://picsum.photos/400/300?random=2', x: 60, y: 25 },
    { url: 'https://picsum.photos/400/300?random=3', x: 30, y: 60 },
  ];
  
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notesButtonRef = useRef<HTMLButtonElement>(null);
  const photosButtonRef = useRef<HTMLButtonElement>(null);

  // Get current conversation
  const conversation = conversations.find((c) => c.id === currentConversation);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && windowState === "normal") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages, windowState]);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowState !== "normal") return;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && windowState === "normal") {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep window within viewport
        const maxX = window.innerWidth - windowSize.width;
        const maxY = window.innerHeight - windowSize.height;
        
        setWindowPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }

      if (isResizing && windowState === "normal") {
        // Calculate new height based on mouse position
        const newHeight = Math.max(500, Math.min(900, e.clientY - windowPosition.y));
        // Force width to match height (square aspect ratio)
        const newWidth = newHeight;
        
        setWindowSize({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, windowPosition, windowSize, windowState, setWindowPosition, setWindowSize]);

  // Handle message send
  const handleSend = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput("");
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMessages();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeMessages]);

  if (!isOpen) return null;

  // Minimized state
  if (windowState === "minimized") {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={restoreMessages}
      >
        <div className="bg-connect-bg-dark border border-neon-green/50 rounded-lg px-3 py-3 flex items-center gap-3 shadow-2xl hover:shadow-neon-green/20 transition-all">
          <div className="size-5 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-heading font-bold text-gray-300">
            LoCuToRiO
          </span>
          {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
            <span className="bg-neon-green text-forest-dark text-xs font-bold px-2 py-1 rounded-full">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Maximized state - Simple full screen without internal tabs
  if (windowState === "maximized") {
    return (
      <div className="fixed inset-0 z-50 bg-connect-bg-dark flex flex-col">
        {/* Simple header with close/restore only */}
        <div className="flex-none bg-connect-bg-dark border-b border-forest-dark/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="font-heading font-bold text-sm text-gray-300">
              LoCuToRiO
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreMessages}
              className="text-text-muted hover:text-gray-300 transition-colors p-1"
              title="Restaurar"
            >
              <span className="material-symbols-outlined">close_fullscreen</span>
            </button>
            <button
              onClick={closeMessages}
              className="text-text-muted hover:text-gray-300 transition-colors p-1"
              title="Cerrar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content - Same as normal but full screen */}
        <div className="flex-1 overflow-hidden p-3 max-w-[1920px] mx-auto w-full">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Render main content (used in both maximized and normal states)
  function renderContent() {
    // ARCHIVO view
    if (activeView === "archivo") {
      return (
        <div className="h-full flex flex-col gap-3">
          {/* Search bar */}
          <div className="bg-connect-bg-dark rounded-xl border border-forest-dark/30 p-4 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <Input
                type="text"
                placeholder="Buscar por nick..."
                value={archivoSearchQuery}
                onChange={(e) => setArchivoSearchQuery(e.target.value)}
                className="flex-1 bg-forest-dark/50 border-forest-dark/50 text-gray-300 placeholder:text-gray-500"
              />
              <button className="px-4 py-2 bg-neon-green hover:bg-neon-green/80 text-forest-dark font-heading font-bold text-sm rounded-md transition-all">
                Buscar
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-gray-400">
                <span className="text-neon-green font-bold">0</span> archivos
              </div>
              <div className="text-gray-400">
                <span className="text-neon-green font-bold">0</span> mensajes
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 bg-connect-bg-dark rounded-xl border border-forest-dark/30 overflow-hidden flex flex-col">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-forest-dark/50 border-b border-forest-dark/50 text-gray-400 text-sm font-heading font-bold">
              <div className="col-span-3">NICK</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-4">ÚLTIMA MENSAJE</div>
              <div className="col-span-2">FECHA</div>
              <div className="col-span-1">MENSAJES</div>
            </div>

            {/* Table body */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-text-muted mb-4 block">
                    inventory_2
                  </span>
                  <h3 className="font-heading font-bold text-sm text-gray-300 mb-2">
                    Archivo vacío
                  </h3>
                  <p className="text-text-muted text-sm">
                    Momentáneamente no tienes ningún archivo guardado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // AJUSTES view
    if (activeView === "ajustes") {
      return (
        <div className="h-full flex flex-col gap-4 p-6 bg-connect-bg-dark rounded-xl border border-forest-dark/30">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-5xl text-neon-green mb-3 block">
              settings
            </span>
            <h2 className="font-heading font-bold text-xl text-gray-300 mb-2">
              Ajustes de Mensajes
            </h2>
            <p className="text-text-muted text-sm">
              Configura tu experiencia de mensajería
            </p>
          </div>

          {/* Setting 1: Sound */}
          <div className="bg-forest-dark/50 rounded-lg p-6 border border-forest-dark/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-green text-2xl">
                  volume_up
                </span>
                <div>
                  <h3 className="font-heading font-bold text-gray-300 text-base mb-1">
                    Sonido de mensaje nuevo
                  </h3>
                  <p className="text-text-muted text-sm">
                    Reproducir un sonido suave (ding-dong) cuando recibes un mensaje nuevo
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ sound: !settings.sound })}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  settings.sound
                    ? "bg-neon-green"
                    : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    settings.sound ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Setting 2: Auto-open */}
          <div className="bg-forest-dark/50 rounded-lg p-6 border border-forest-dark/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-neon-green text-2xl">
                  open_in_new
                </span>
                <div>
                  <h3 className="font-heading font-bold text-gray-300 text-base mb-1">
                    Abrir ventana automáticamente
                  </h3>
                  <p className="text-text-muted text-sm">
                    La ventana de mensajes se abrirá automáticamente al recibir un nuevo mensaje
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ autoOpen: !settings.autoOpen })}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  settings.autoOpen
                    ? "bg-neon-green"
                    : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    settings.autoOpen ? "translate-x-7" : "translate-x-1"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Status info */}
          <div className="mt-auto text-center text-text-muted text-sm">
            <p>Los cambios se guardan automáticamente</p>
          </div>
        </div>
      );
    }

    // MENSAJES view (default)
    if (!conversation) {
      return (
        <div className="h-full flex items-center justify-center bg-connect-bg-dark rounded-xl border border-forest-dark/20">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-text-muted mb-4 block">
              chat_bubble
            </span>
            <h3 className="font-heading font-bold text-[10px] text-gray-300 mb-2">
              No hay conversación seleccionada
            </h3>
            <p className="text-text-muted">
              Selecciona una conversación de la lista
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-12 grid-rows-[auto_1fr_auto] gap-2 h-full">
        {/* Profile Strip */}
        <div className="col-span-12 bg-connect-bg-dark rounded-xl border border-forest-dark/30 p-2 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-neon-green/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="relative">
              <div
                className="size-12 rounded-lg bg-connect-bg-dark border-2 border-forest-dark shadow-2xl bg-center bg-cover"
                style={{ backgroundImage: `url('${conversation.avatar}')` }}
              ></div>
              
              {/* Status indicator: online=neon-green, away=orange, offline=gray */}
              {conversation.status === "online" && (
                <div className="absolute -bottom-1 -right-1">
                  <span className="block size-2.5 bg-neon-green rounded-full border-2 border-connect-bg-dark shadow-[0_0_8px_rgba(80,250,123,0.6)]"></span>
                </div>
              )}
              {conversation.status === "away" && (
                <div className="absolute -bottom-1 -right-1">
                  <span className="block size-2.5 bg-orange-400 rounded-full border-2 border-connect-bg-dark shadow-[0_0_8px_rgba(251,146,60,0.6)]"></span>
                </div>
              )}
              {conversation.status === "offline" && (
                <div className="absolute -bottom-1 -right-1">
                  <span className="block size-2.5 bg-gray-400 rounded-full border-2 border-connect-bg-dark"></span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-[13px] text-gray-300 tracking-wide">
                  {conversation.name}
                </h2>
                <span className="material-symbols-outlined text-[14px] text-neon-green" title="Amigo">
                  group
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[11px]">location_on</span>
                  <span>Madrid, ES</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-forest-light"></div>
                <div>26 años</div>
                <div className="w-1.5 h-1.5 rounded-full bg-forest-light"></div>
                <div className="italic text-neon-green">"Amante del Jazz y el Saxofón 🎷"</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-stretch gap-3 z-10 h-14">
            <button 
              onClick={() => setShowAddFriendModal(true)}
              className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group"
            >
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                person
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-gray-300 uppercase tracking-wider">
                Amigos
              </span>
            </button>
            <button 
              ref={photosButtonRef}
              onClick={() => {
                if (hasPlus) {
                  // With PLUS: show fullscreen gallery
                  setShowPhotosModal(true);
                } else {
                  // Without PLUS: show bubble below button
                  if (photosButtonRef.current) {
                    const rect = photosButtonRef.current.getBoundingClientRect();
                    const windowRect = windowRef.current?.getBoundingClientRect();
                    if (windowRect) {
                      setPhotosModalPosition({
                        top: rect.bottom - windowRect.top + 10,
                        left: rect.left - windowRect.left + rect.width / 2,
                      });
                    }
                  }
                  setShowPhotosModal(true);
                }
              }}
              className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group">
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                photo_library
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-gray-300 uppercase tracking-wider">
                Fotos
              </span>
            </button>
            <button 
              ref={notesButtonRef}
              onClick={() => {
                if (notesButtonRef.current) {
                  const rect = notesButtonRef.current.getBoundingClientRect();
                  const windowRect = windowRef.current?.getBoundingClientRect();
                  if (windowRect) {
                    setNotesModalPosition({
                      top: rect.bottom - windowRect.top + 10, // 10px below button
                      left: rect.left - windowRect.left + rect.width / 2, // Centered horizontally
                    });
                  }
                }
                setShowNotesModal(true);
              }}
              className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group relative">
              {/* Post-it sticker if note exists for this user */}
              {conversation && userNotes[conversation.id] && (
                <div className="absolute -top-1 -right-1 size-5 bg-yellow-100 border border-yellow-400 rounded shadow-md transform rotate-12 pointer-events-none">
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
              )}
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                edit_note
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-gray-300 uppercase tracking-wider">
                Notas
              </span>
            </button>
            <div className="w-px h-full bg-forest-light/30 mx-2"></div>
            <button 
              onClick={() => setShowReportModal(true)}
              className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                report
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-gray-300 uppercase tracking-wider">
                Denunciar
              </span>
            </button>
          </div>
        </div>

        {/* Messages Area (8 columns) */}
        <div className="col-span-8 bg-connect-bg-dark rounded-xl border border-forest-dark/20 flex flex-col relative overflow-hidden shadow-lg order-1">
          <div className="absolute inset-0 custom-pattern opacity-30 pointer-events-none"></div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 relative z-10">
            {/* Date separator */}
            <div className="flex justify-center">
              <span className="px-4 py-1.5 bg-connect-bg-dark/80 rounded-full text-[8px] font-bold text-neon-green border border-neon-green/20 backdrop-blur-md">
                HOY, {new Date().toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                }).toUpperCase()}
              </span>
            </div>

            {/* Messages */}
            {conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[80%] group ${
                  msg.isOwn ? "self-end flex-row-reverse" : ""
                }`}
              >
                <div
                  className="size-6 rounded-full bg-connect-bg-dark border border-forest-dark/50 shrink-0 bg-center bg-cover mt-4 shadow-lg"
                  style={{
                    backgroundImage: `url('${
                      msg.isOwn
                        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBA7o0qlLm4cawsI9N5Nx53DQQYSI8V-9TuVBCGWjq0hG_pimTqRVEL-tfSyFMuX4C9siWyHr9nYcpknQ12lzd_mgLzMbat_ltc5HndpH-sKIYfzCDhmMG46sxCgBsGNi7YcAjPSHLH2mztYx5dd1nYtKj8p2fxQXd84ZnaEWHZAZiq2Du7mJX_fr3OwLFkLGelzlI-hVqwoICKw4uEb5tSfehc2bVukmivBzjpkpq4hib7WWuh9pcAnmws8UsA3z2pYXrJlzLB4TET"
                        : conversation.avatar
                    }')`,
                  }}
                ></div>
                <div
                  className={`flex flex-col gap-1 ${
                    msg.isOwn ? "items-end" : ""
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      msg.isOwn
                        ? "text-gray-300 mr-4"
                        : "text-neon-green ml-4"
                    }`}
                  >
                    {msg.isOwn ? "Tú" : conversation.name}
                  </span>
                  <div
                    className={`p-2 rounded-xl shadow-md border backdrop-blur-sm ${
                      msg.isOwn
                        ? "bg-connect-bg-dark text-gray-300 border-neon-green/30 rounded-tr-none"
                        : "bg-forest-dark/95 text-gray-300 border-white/5 rounded-tl-none"
                    }`}
                  >
                    <p className="text-[10px] leading-relaxed font-medium">
                      {msg.text}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] text-text-muted opacity-60 ${
                      msg.isOwn ? "mr-2" : "ml-2"
                    } flex items-center gap-1`}
                  >
                    {msg.time}
                    {msg.isOwn && (
                      <span className="material-symbols-outlined text-[12px] text-neon-green">
                        {msg.read ? "done_all" : "done"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.includes(conversation.userId) && (
              <div className="flex gap-2 max-w-[80%]">
                <div
                  className="size-6 rounded-full bg-connect-bg-dark border border-forest-dark/50 shrink-0 bg-center bg-cover shadow-lg"
                  style={{ backgroundImage: `url('${conversation.avatar}')` }}
                ></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neon-green ml-4">
                    {conversation.name}
                  </span>
                  <div className="bg-forest-dark/95 text-gray-300 p-2 rounded-xl rounded-tl-none shadow-md border border-white/5 backdrop-blur-sm">
                    <p className="text-[10px] italic text-text-muted flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-neon-green">
                        edit
                      </span>
                      Escribiendo...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* User List Sidebar (4 columns) */}
        <div className="col-span-4 bg-forest-dark rounded-xl border border-forest-dark/20 flex flex-col overflow-hidden shadow-lg order-2">
          <div className="p-2 border-b border-forest-dark/20 bg-connect-bg-dark/20 backdrop-blur-sm">
            <div className="flex bg-connect-bg-dark/40 p-1 rounded-xl mb-1">
              <button
                onClick={() => setSidebarTab("conversaciones")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sidebarTab === "conversaciones"
                    ? "bg-neon-green/20 text-neon-green shadow-lg border-2 border-neon-green shadow-neon-green/50"
                    : "text-gray-500 hover:bg-forest-dark/20 hover:text-gray-400"
                }`}
              >
                <span className="material-symbols-outlined text-xs">forum</span>
                Conversaciones
              </button>
              <button
                onClick={() => setSidebarTab("invitaciones")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sidebarTab === "invitaciones"
                    ? "bg-neon-green/20 text-neon-green shadow-lg border-2 border-neon-green shadow-neon-green/50"
                    : "text-gray-500 hover:bg-forest-dark/20 hover:text-gray-400"
                }`}
              >
                <span className="material-symbols-outlined text-xs">mark_email_unread</span>
                Solicitudes
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sidebarTab === "conversaciones" ? (
              // CONVERSACIONES TAB - Show conversation list
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    conv.id === currentConversation
                      ? "bg-connect-bg-dark border border-neon-green/40 shadow-[0_0_15px_rgba(26,83,25,0.5)]"
                      : "hover:bg-forest-dark/10 border border-transparent hover:border-forest-dark/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <div
                        className={`size-12 rounded-full bg-connect-bg-dark border bg-center bg-cover ${
                          conv.status === "online"
                            ? "border-forest-dark"
                            : "border-forest-dark/30 grayscale opacity-80"
                        }`}
                        style={{ backgroundImage: `url('${conv.avatar}')` }}
                      ></div>
                      {/* Status indicator: online=neon-green, away=orange, offline=gray */}
                      {conv.status === "online" && (
                        <div className="absolute -top-1 -right-1 size-2 rounded-full bg-neon-green border-2 border-forest-base shadow-[0_0_6px_rgba(80,250,123,0.5)]"></div>
                      )}
                      {conv.status === "away" && (
                        <div className="absolute -top-1 -right-1 size-2 rounded-full bg-orange-400 border-2 border-forest-base shadow-[0_0_6px_rgba(251,146,60,0.5)]"></div>
                      )}
                      {conv.status === "offline" && (
                        <div className="absolute -top-1 -right-1 size-2 rounded-full bg-gray-400 border-2 border-forest-base"></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-bold text-gray-400 truncate">
                          {conv.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            conv.unreadCount > 0
                              ? "text-neon-green"
                              : "text-text-muted/60"
                          }`}
                        >
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      {typingUsers.includes(conv.userId) ? (
                        <p className="text-[9px] text-neon-green font-medium truncate flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Escribiendo...
                        </p>
                      ) : (
                        <p
                          className={`text-xs truncate ${
                            conv.unreadCount > 0
                              ? "text-gray-300 font-bold"
                              : "text-text-muted opacity-70"
                          }`}
                        >
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="size-5 flex items-center justify-center bg-neon-green text-forest-dark text-[10px] font-bold rounded-full">
                          {conv.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // INVITACIONES TAB - Show conversation requests
              <InvitacionesContent />
            )}
          </div>
        </div>

        {/* Input Area (8 columns) */}
        <div className="col-span-8 bg-forest-dark rounded-xl border border-forest-dark/20 flex items-center p-2 shadow-lg order-3 relative">
          <button className="size-12 rounded-lg text-text-muted hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="size-12 rounded-lg text-text-muted hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition-colors relative"
          >
            <span className="material-symbols-outlined">sentiment_satisfied</span>
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full left-16 mb-2 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-5 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="h-8 w-px bg-forest-light/20 mx-2"></div>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-300 placeholder-forest-light/60 font-medium px-4"
            placeholder={`Escribe un mensaje para ${conversation.name}...`}
          />
          <button
            onClick={handleSend}
            className="h-8 px-4 bg-neon-green hover:bg-white hover:text-forest-base text-forest-dark font-heading font-bold text-[10px] rounded-lg transition-all flex items-center gap-2 shadow-[0_0_10px_rgba(80,250,123,0.2)] ml-2"
          >
            <span>ENVIAR</span>
            <span className="material-symbols-outlined text-[10px]">send</span>
          </button>
        </div>

        {/* New Conversation Button (4 columns) */}
        <div className="col-span-4 rounded-xl flex items-stretch order-4">
          <button 
            onClick={() => setShowNewConversationModal(true)}
            className="w-full bg-forest-dark border border-neon-green/30 rounded-xl flex items-center justify-center gap-3 text-neon-green font-heading font-bold text-[10px] hover:bg-neon-green hover:text-forest-dark transition-all shadow-lg hover:shadow-neon-green/20 group uppercase tracking-widest p-4"
          >
            <span className="material-symbols-outlined text-[10px] group-hover:scale-110 transition-transform">
              add_comment
            </span>
            Nueva Conversación
          </button>
        </div>
      </div>
    );
  }

  // Normal (floating) state
  return (
    <div
      ref={windowRef}
      className="fixed z-50 bg-connect-bg-dark rounded-xl shadow-[0_8px_32px_rgba(80,250,123,0.4),0_16px_64px_rgba(80,250,123,0.2)] flex flex-col overflow-hidden"
      style={{
        left: windowPosition.x,
        top: windowPosition.y,
        width: windowSize.width,
        height: windowSize.height,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Window Header (Draggable) */}
      <div
        className="flex-none bg-connect-bg-dark border-b border-forest-dark/20 px-3 py-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          {/* Logo izquierda */}
          <div className="flex items-center gap-3">
            <div className="size-5 text-neon-green bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="font-heading font-bold text-[10px] text-gray-300">
              LoCuToRiO
            </h2>
          </div>

          {/* Tab buttons CENTRO */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveView("mensajes");
              }}
              className={`px-4 py-1.5 text-[12px] font-heading font-bold rounded-md border transition-all ${
                activeView === "mensajes"
                  ? "text-neon-green bg-neon-green/20 border-neon-green/50 shadow-[0_0_10px_rgba(80,250,123,0.3)]"
                  : "text-gray-500 bg-gray-500/5 border-gray-500/20 hover:text-neon-green hover:bg-neon-green/20 hover:border-neon-green/50 hover:shadow-[0_0_10px_rgba(80,250,123,0.3)]"
              }`}
              title="Mensajes Privados"
            >
              MENSAJES PRIVADOS
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveView("archivo");
              }}
              className={`px-4 py-1.5 text-[12px] font-heading font-bold rounded-md border transition-all ${
                activeView === "archivo"
                  ? "text-neon-green bg-neon-green/20 border-neon-green/50 shadow-[0_0_10px_rgba(80,250,123,0.3)]"
                  : "text-gray-500 bg-gray-500/5 border-gray-500/20 hover:text-neon-green hover:bg-neon-green/20 hover:border-neon-green/50 hover:shadow-[0_0_10px_rgba(80,250,123,0.3)]"
              }`}
              title="Archivo"
            >
              ARCHIVO
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveView("ajustes");
              }}
              className={`px-4 py-1.5 text-[12px] font-heading font-bold rounded-md border transition-all ${
                activeView === "ajustes"
                  ? "text-neon-green bg-neon-green/20 border-neon-green/50 shadow-[0_0_10px_rgba(80,250,123,0.3)]"
                  : "text-gray-500 bg-gray-500/5 border-gray-500/20 hover:text-neon-green hover:bg-neon-green/20 hover:border-neon-green/50 hover:shadow-[0_0_10px_rgba(80,250,123,0.3)]"
              }`}
              title="Ajustes"
            >
              AJUSTES
            </button>
          </div>

          {/* Window controls derecha */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeMessages();
              }}
              className="text-text-muted hover:text-gray-300 transition-colors p-1"
              title="Minimizar"
            >
              <span className="material-symbols-outlined">minimize</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeMessages();
              }}
              className="text-text-muted hover:text-gray-300 transition-colors p-1"
              title="Maximizar"
            >
              <span className="material-symbols-outlined">open_in_full</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeMessages();
              }}
              className="text-text-muted hover:text-gray-300 transition-colors p-1"
              title="Cerrar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {renderContent()}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
        style={{
          background: `linear-gradient(135deg, transparent 50%, ${
            isResizing ? "#50fa7b" : "#2e7d32"
          } 50%)`,
        }}
      ></div>

      {/* Report Modal */}
      {showReportModal && conversation && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="bg-connect-bg-dark border-2 border-neon-green/30 rounded-xl p-6 w-[90%] max-w-md shadow-[0_0_40px_rgba(80,250,123,0.3)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="size-12 rounded-full bg-cover bg-center border-2 border-forest-dark/50"
                style={{ backgroundImage: `url('${conversation.avatar}')` }}
              ></div>
              <div>
                <h3 className="font-heading font-bold text-lg text-gray-100">
                  ¿Qué es malo en esta conversación?
                </h3>
                <p className="text-sm text-text-muted">
                  Conversación con <span className="text-neon-green">{conversation.username}</span>
                </p>
              </div>
            </div>

            {/* Report reasons */}
            <div className="space-y-2 mb-6">
              {[
                { id: 'mensajes-molestos', label: 'Mensajes molestos' },
                { id: 'proclamacion-odio', label: 'Proclamación de odio' },
                { id: 'ilicitas', label: 'Cosas ilícitas, fuera de ley' },
                { id: 'venta', label: 'Venta de mercancía y servicios' },
                { id: 'abuso-sexual', label: 'Abuso sexual' },
                { id: 'spam', label: 'Publicidad, Spam' },
              ].map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => {
                    if (selectedReportReasons.includes(reason.id)) {
                      setSelectedReportReasons(selectedReportReasons.filter(r => r !== reason.id));
                    } else {
                      setSelectedReportReasons([...selectedReportReasons, reason.id]);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedReportReasons.includes(reason.id)
                      ? 'bg-neon-green/20 border-neon-green text-neon-green'
                      : 'bg-forest-dark/30 border-forest-dark/50 text-gray-300 hover:border-neon-green/50'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {/* Emergency warning */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-6">
              <p className="text-xs text-orange-300 leading-relaxed">
                ⚠️ Si se trata de que alguien está en peligro de vida, llame al <span className="font-bold">911</span> (Policía de Venezuela) inmediatamente.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReportReasons([]);
                }}
                className="flex-1 px-4 py-3 bg-forest-dark/50 hover:bg-forest-dark text-gray-300 font-heading font-bold rounded-lg transition-all border border-forest-dark/50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // TODO: Implement report submission
                  console.log('Report submitted for', conversation.username, 'reasons:', selectedReportReasons);
                  setShowReportModal(false);
                  setSelectedReportReasons([]);
                  // Show success message (could add a toast notification here)
                }}
                disabled={selectedReportReasons.length === 0}
                className="flex-1 px-4 py-3 bg-neon-green hover:bg-neon-green/80 text-forest-dark font-heading font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && conversation && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{
            top: `${notesModalPosition.top}px`,
            left: `${notesModalPosition.left}px`,
            transform: 'translateX(-50%)', // Center horizontally below button
          }}
          onMouseLeave={() => {
            // Auto-close with delay when mouse leaves
            const timer = setTimeout(() => {
              setShowNotesModal(false);
            }, 800);
            setNotesModalTimer(timer);
          }}
          onMouseEnter={() => {
            // Cancel auto-close if mouse re-enters
            if (notesModalTimer) {
              clearTimeout(notesModalTimer);
              setNotesModalTimer(null);
            }
          }}
        >
          <div className="bg-connect-bg-dark border-2 border-blue-500/30 rounded-xl p-3 w-40 shadow-[0_0_40px_rgba(59,130,246,0.3)] pointer-events-auto">
            {/* Header */}
            <div className="flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-lg text-blue-500">
                edit_note
              </span>
              <h3 className="font-heading font-bold text-xs text-gray-100">
                Tus anotaciones
              </h3>
            </div>

            {/* Content based on PLUS status */}
            {!hasPlus ? (
              // User WITHOUT PLUS
              <div className="text-center py-2">
                <p className="text-gray-300 text-xs leading-relaxed mb-1">
                  Para anotar sobre esta persona, activa{" "}
                  <Link
                    href="/connect/tutorial/la-cuenta#section-9"
                    onClick={() => {
                      setShowNotesModal(false);
                      closeMessages(); // Close floating MP window
                    }}
                    className="font-bold text-blue-500 hover:text-blue-400 underline transition-colors cursor-pointer"
                  >
                    PLUS
                  </Link>
                </p>
              </div>
            ) : (
              // User WITH PLUS - Post-it style note (compact)
              <div>
                <div className="relative mb-2">
                  {/* Post-it note */}
                  <div className="bg-yellow-100 border-t-2 border-yellow-400 rounded p-2 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                    <textarea
                      value={conversation ? (userNotes[conversation.id] || "") : ""}
                      onChange={(e) => {
                        if (conversation) {
                          setUserNotes(prev => ({
                            ...prev,
                            [conversation.id]: e.target.value
                          }));
                        }
                      }}
                      placeholder="Nota..."
                      className="w-full h-16 bg-transparent text-gray-800 placeholder:text-gray-500 text-xs resize-none focus:outline-none"
                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                    />
                  </div>
                  
                  {/* Pin effect */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-lg border border-red-600"></div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setShowNotesModal(false);
                    }}
                    className="flex-1 px-2 py-1 bg-forest-dark/50 hover:bg-forest-dark text-gray-300 font-heading font-bold text-xs rounded transition-all border border-forest-dark/50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Simply save the note - no animations
                      if (conversation) {
                        console.log('Note saved for', conversation.username, ':', userNotes[conversation.id]);
                      }
                      setShowNotesModal(false);
                    }}
                    disabled={conversation && !userNotes[conversation.id]?.trim()}
                    className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-heading font-bold text-xs rounded transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photos Modal */}
      {showPhotosModal && conversation && hasPlus && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 rounded-xl cursor-pointer"
          onClick={() => {
            setSelectedPhoto(null);
            setShowPhotosModal(false);
          }}
        >
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(2deg); }
            }
          `}</style>
          
          {selectedPhoto ? (
            // Fullsize photo view
            <div className="flex items-center justify-center h-full p-8">
              <img 
                src={selectedPhoto}
                alt="Foto completa"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : demoPhotos.length > 0 ? (
            // Floating thumbnails
            <div className="relative w-full h-full">
              {demoPhotos.map((photo, index) => (
                <img 
                  key={index}
                  src={photo.url}
                  alt={`Foto ${index + 1}`}
                  className="absolute w-32 h-32 object-cover rounded-lg cursor-pointer hover:scale-110 hover:z-10 transition-all border-2 border-white/20"
                  style={{
                    top: `${photo.y}%`,
                    left: `${photo.x}%`,
                    animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: '0 8px 32px rgba(80, 250, 123, 0.4), 0 4px 16px rgba(80, 250, 123, 0.3)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo.url);
                  }}
                />
              ))}
            </div>
          ) : (
            // Empty state - just dark background (no text, no nothing)
            <div></div>
          )}
        </div>
      )}

      {/* Photos bubble for non-PLUS users */}
      {showPhotosModal && conversation && !hasPlus && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            top: `${photosModalPosition.top}px`,
            left: `${photosModalPosition.left}px`,
            transform: 'translateX(-50%)',
          }}
          onMouseLeave={() => {
            const timer = setTimeout(() => {
              setShowPhotosModal(false);
            }, 800);
            setPhotosModalTimer(timer);
          }}
          onMouseEnter={() => {
            if (photosModalTimer) {
              clearTimeout(photosModalTimer);
              setPhotosModalTimer(null);
            }
          }}
        >
          <div className="bg-connect-bg-dark border-2 border-blue-500/30 rounded-xl p-3 w-40 shadow-[0_0_40px_rgba(59,130,246,0.3)] pointer-events-auto">
            <div className="flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-lg text-blue-500">
                photo_library
              </span>
              <h3 className="font-heading font-bold text-xs text-gray-100">
                Fotos compartidas
              </h3>
            </div>

            <div className="text-center py-2">
              <p className="text-gray-300 text-xs leading-relaxed mb-1">
                Para ver fotos intercambiadas con esta persona, activa{" "}
                <Link
                  href="/connect/tutorial/la-cuenta#section-9"
                  onClick={() => {
                    setShowPhotosModal(false);
                    closeMessages();
                  }}
                  className="font-bold text-blue-500 hover:text-blue-400 underline transition-colors cursor-pointer"
                >
                  PLUS
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriendModal && conversation && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 rounded-xl flex items-center justify-center"
          onClick={() => setShowAddFriendModal(false)}
        >
          <div 
            className="bg-forest-dark border-2 border-neon-green rounded-xl p-6 w-[90%] max-w-md shadow-[0_0_30px_rgba(80,250,123,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-neon-green/30">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neon-green/50">
                  <img 
                    src={conversation.avatar} 
                    alt={conversation.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Name and title */}
              <div>
                <h3 className="text-xl font-bold text-neon-green mb-1">
                  Añadir amigo
                </h3>
                <p className="text-gray-300 text-sm">
                  {conversation.name}
                </p>
              </div>
            </div>

            {/* Groups selection */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Añadir a grupo:
              </label>
              
              <div className="space-y-2">
                {/* Mis Amigos */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="friend-group"
                    value="mis-amigos"
                    checked={selectedGroup === 'mis-amigos'}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-4 h-4 accent-neon-green"
                  />
                  <span className="text-gray-300 text-sm">Mis Amigos</span>
                </label>

                {/* Familia */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="friend-group"
                    value="familia"
                    checked={selectedGroup === 'familia'}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-4 h-4 accent-neon-green"
                  />
                  <span className="text-gray-300 text-sm">Familia</span>
                </label>

                {/* Trabajo */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="friend-group"
                    value="trabajo"
                    checked={selectedGroup === 'trabajo'}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-4 h-4 accent-neon-green"
                  />
                  <span className="text-gray-300 text-sm">Trabajo</span>
                </label>

                {/* Clase */}
                <label className="flex items-center gap-3 p-3 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="friend-group"
                    value="clase"
                    checked={selectedGroup === 'clase'}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-4 h-4 accent-neon-green"
                  />
                  <span className="text-gray-300 text-sm">Clase</span>
                </label>
              </div>
            </div>

            {/* Info message */}
            <div className="bg-forest-light/20 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                Esta persona no recibirá notificación. Podrá ver tus álbumes protegidos "solo para amigos".
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddFriendModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // TODO: Save friend to database
                  console.log(`Adding ${conversation.name} to group: ${selectedGroup}`);
                  setShowAddFriendModal(false);
                  setSelectedGroup('mis-amigos'); // Reset
                }}
                className="flex-1 px-4 py-2.5 bg-neon-green hover:bg-neon-green/80 text-forest-dark rounded-lg font-bold transition-colors shadow-lg shadow-neon-green/30"
              >
                Añadir amigo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 rounded-xl flex items-center justify-center"
          onClick={() => setShowNewConversationModal(false)}
        >
          <div 
            className="bg-forest-dark border-2 border-neon-green rounded-xl p-6 w-[90%] max-w-2xl shadow-[0_0_30px_rgba(80,250,123,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neon-green/30">
              <h3 className="text-xl font-bold text-neon-green">
                Nueva Conversación
              </h3>
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="text-gray-400 hover:text-neon-green transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Search by nick */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchNick}
                  onChange={(e) => setSearchNick(e.target.value)}
                  placeholder="Buscar por nick..."
                  className="flex-1 px-4 py-2.5 bg-forest-light/20 border border-forest-light/30 rounded-lg text-gray-300 placeholder-text-muted/60 focus:outline-none focus:border-neon-green/50 transition-colors"
                />
                <button
                  onClick={() => {
                    if (searchNick.trim()) {
                      console.log(`Searching for user: ${searchNick}`);
                      // TODO: Search user and start conversation
                      setSearchNick('');
                      setShowNewConversationModal(false);
                    }
                  }}
                  className="px-6 py-2.5 bg-neon-green hover:bg-neon-green/80 text-forest-dark rounded-lg font-bold transition-colors shadow-lg shadow-neon-green/30"
                >
                  Escribir RP
                </button>
              </div>
            </div>

            {/* Two sections: Saved conversations and Online friends */}
            <div className="grid grid-cols-2 gap-4">
              {/* ODLOŽENÉ ROZHOVORY (Saved conversations) */}
              <div className="border border-forest-light/30 rounded-lg p-4">
                <h4 className="text-gray-400 font-bold text-sm mb-3 uppercase tracking-wider">
                  Conversaciones Guardadas ({savedConversations.length})
                </h4>
                {savedConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-text-muted/30 mb-2">
                      bookmark_border
                    </span>
                    <p className="text-text-muted text-xs">
                      Sin conversaciones guardadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedConversations.map((conv: any) => (
                      <div
                        key={conv.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors"
                        onClick={() => {
                          console.log(`Opening saved conversation with ${conv.name}`);
                          // TODO: Open saved conversation
                          setShowNewConversationModal(false);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-neon-green/30">
                          <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-gray-300 text-sm font-medium">{conv.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ONLINE PRIATELIA (Online friends) */}
              <div className="border border-forest-light/30 rounded-lg p-4">
                <h4 className="text-gray-400 font-bold text-sm mb-3 uppercase tracking-wider">
                  Amigos Online ({onlineFriends.length})
                </h4>
                {onlineFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-text-muted/30 mb-2">
                      person_off
                    </span>
                    <p className="text-text-muted text-xs">
                      Sin amigos online
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {onlineFriends.map((friend: any) => (
                      <div
                        key={friend.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-forest-light/20 hover:bg-forest-light/30 cursor-pointer transition-colors"
                        onClick={() => {
                          console.log(`Starting conversation with ${friend.name}`);
                          // TODO: Start conversation with friend
                          setShowNewConversationModal(false);
                        }}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-neon-green/30">
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -top-1 -right-1 size-3 rounded-full bg-neon-green border-2 border-forest-dark"></div>
                        </div>
                        <span className="text-gray-300 text-sm font-medium">{friend.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
