"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useMessages, type Conversation } from "@/contexts/MessagesContext";
import { Input } from "@/components/ui/input";

type SidebarTabType = "conversaciones" | "invitaciones";
type ActiveViewType = "mensajes" | "archivo" | "ajustes" | "fotos" | "notas" | "denunciar" | "nueva-conversacion";

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
  const [userNote, setUserNote] = useState("");
  const [hasPlus, setHasPlus] = useState(false); // TODO: Connect to real user subscription
  const [notesModalTimer, setNotesModalTimer] = useState<NodeJS.Timeout | null>(null);
  const [notesModalPosition, setNotesModalPosition] = useState({ top: 0, left: 0 });
  
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notesButtonRef = useRef<HTMLButtonElement>(null);

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
        const newWidth = Math.max(450, Math.min(1600, e.clientX - windowPosition.x));
        const newHeight = Math.max(500, Math.min(1000, e.clientY - windowPosition.y));
        
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
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group">
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                person
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-gray-300 uppercase tracking-wider">
                Amigos
              </span>
            </button>
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group">
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
              className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-dark hover:bg-forest-dark/40 border border-forest-dark/20 hover:border-neon-green transition-all group">
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
                    ? "bg-forest-dark/60 text-gray-300 shadow-sm border border-forest-dark/30"
                    : "text-text-muted hover:bg-forest-dark/20 hover:text-gray-300"
                }`}
              >
                <span className="material-symbols-outlined text-xs">forum</span>
                Conversaciones
              </button>
              <button
                onClick={() => setSidebarTab("invitaciones")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sidebarTab === "invitaciones"
                    ? "bg-forest-dark/60 text-gray-300 shadow-sm border border-forest-dark/30"
                    : "text-text-muted hover:bg-forest-dark/20 hover:text-gray-300"
                }`}
              >
                <span className="material-symbols-outlined text-xs">mark_email_unread</span>
                Invitaciones
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
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
            ))}
          </div>
        </div>

        {/* Input Area (8 columns) */}
        <div className="col-span-8 bg-forest-dark rounded-xl border border-forest-dark/20 flex items-center p-2 shadow-lg order-3">
          <button className="size-12 rounded-lg text-text-muted hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
          <button className="size-12 rounded-lg text-text-muted hover:text-gray-300 hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">sentiment_satisfied</span>
          </button>
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
          <button className="w-full bg-forest-dark border border-neon-green/30 rounded-xl flex items-center justify-center gap-3 text-neon-green font-heading font-bold text-[10px] hover:bg-neon-green hover:text-forest-dark transition-all shadow-lg hover:shadow-neon-green/20 group uppercase tracking-widest p-4">
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
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
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
                      setUserNote("");
                    }}
                    className="flex-1 px-2 py-1 bg-forest-dark/50 hover:bg-forest-dark text-gray-300 font-heading font-bold text-xs rounded transition-all border border-forest-dark/50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save note to database
                      console.log('Note saved for', conversation.username, ':', userNote);
                      setShowNotesModal(false);
                    }}
                    className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white font-heading font-bold text-xs rounded transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
