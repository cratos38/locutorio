"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMessages, type Conversation } from "@/contexts/MessagesContext";
import { Input } from "@/components/ui/input";

type SidebarTabType = "conversaciones" | "invitaciones";

export default function FloatingMessagesWindow() {
  const {
    isOpen,
    windowState,
    windowPosition,
    windowSize,
    conversations,
    currentConversation,
    typingUsers,
    closeMessages,
    minimizeMessages,
    maximizeMessages,
    restoreMessages,
    setWindowPosition,
    setWindowSize,
    selectConversation,
    sendMessage,
  } = useMessages();

  const [sidebarTab, setSidebarTab] = useState<SidebarTabType>("conversaciones");
  const [messageInput, setMessageInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        const newWidth = Math.max(800, Math.min(1600, e.clientX - windowPosition.x));
        const newHeight = Math.max(600, Math.min(1000, e.clientY - windowPosition.y));
        
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
        <div className="bg-forest-base border border-neon-green/50 rounded-lg px-3 py-3 flex items-center gap-3 shadow-2xl hover:shadow-neon-green/20 transition-all">
          <span className="material-symbols-outlined text-[10px] text-neon-green">
            chat
          </span>
          <span className="font-heading font-bold text-white">
            Mensajes Privados
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
      <div className="fixed inset-0 z-50 bg-forest-dark flex flex-col">
        {/* Simple header with close/restore only */}
        <div className="flex-none bg-forest-base border-b border-forest-light/20 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-neon-green text-base">
              diversity_2
            </span>
            <h2 className="font-heading font-bold text-sm text-white">
              Mensajes Privados
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreMessages}
              className="text-text-muted hover:text-white transition-colors p-1"
              title="Restaurar"
            >
              <span className="material-symbols-outlined">close_fullscreen</span>
            </button>
            <button
              onClick={closeMessages}
              className="text-text-muted hover:text-white transition-colors p-1"
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
    if (!conversation) {
      return (
        <div className="h-full flex items-center justify-center bg-forest-base rounded-xl border border-forest-light/20">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-text-muted mb-4 block">
              chat_bubble
            </span>
            <h3 className="font-heading font-bold text-[10px] text-white mb-2">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 grid-rows-[auto_1fr_auto] gap-2 h-full">
        {/* Profile Strip */}
        <div className="col-span-1 lg:col-span-12 bg-forest-base rounded-xl border border-forest-light/30 p-2 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-neon-green/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-3 z-10">
            <div className="relative">
              <div
                className="size-12 rounded-lg bg-forest-dark border-2 border-forest-panel shadow-2xl bg-center bg-cover"
                style={{ backgroundImage: `url('${conversation.avatar}')` }}
              ></div>
              {conversation.online && (
                <div className="absolute -bottom-2 -right-2 bg-forest-dark p-1 rounded-full">
                  <span className="block size-5 bg-neon-green rounded-full border-2 border-forest-dark shadow-[0_0_10px_#50fa7b]"></span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-[9px] text-white tracking-wide">
                  {conversation.name}
                </h2>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-neon-green text-forest-dark tracking-wider shadow-lg shadow-neon-green/20">
                  AMIGO
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-medium text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[10px]">location_on</span>
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
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-panel hover:bg-forest-light/40 border border-forest-light/20 hover:border-neon-green transition-all group">
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                person
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-white uppercase tracking-wider">
                Amigos
              </span>
            </button>
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-panel hover:bg-forest-light/40 border border-forest-light/20 hover:border-neon-green transition-all group">
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                photo_library
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-white uppercase tracking-wider">
                Fotos
              </span>
            </button>
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-panel hover:bg-forest-light/40 border border-forest-light/20 hover:border-neon-green transition-all group">
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                edit_note
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-white uppercase tracking-wider">
                Notas
              </span>
            </button>
            <div className="w-px h-full bg-forest-light/30 mx-2"></div>
            <button className="w-14 flex flex-col items-center justify-center gap-1 rounded-lg bg-forest-panel hover:bg-forest-light/40 border border-forest-light/20 hover:border-neon-green transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[9px] text-text-muted group-hover:text-neon-green transition-colors">
                report
              </span>
              <span className="text-[8px] font-bold text-text-muted/70 group-hover:text-white uppercase tracking-wider">
                Denunciar
              </span>
            </button>
          </div>
        </div>

        {/* Messages Area (8 columns) */}
        <div className="col-span-1 lg:col-span-8 bg-forest-base rounded-xl border border-forest-light/20 flex flex-col relative overflow-hidden shadow-lg order-2 lg:order-1">
          <div className="absolute inset-0 custom-pattern opacity-30 pointer-events-none"></div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 relative z-10">
            {/* Date separator */}
            <div className="flex justify-center">
              <span className="px-4 py-1.5 bg-forest-dark/80 rounded-full text-[8px] font-bold text-neon-green border border-neon-green/20 backdrop-blur-md">
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
                  className="size-6 rounded-full bg-forest-dark border border-forest-light/50 shrink-0 bg-center bg-cover mt-4 shadow-lg"
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
                        ? "text-white mr-4"
                        : "text-neon-green ml-4"
                    }`}
                  >
                    {msg.isOwn ? "Tú" : conversation.name}
                  </span>
                  <div
                    className={`p-2 rounded-xl shadow-md border backdrop-blur-sm ${
                      msg.isOwn
                        ? "bg-forest-dark text-white border-neon-green/30 rounded-tr-none"
                        : "bg-forest-light/90 text-white border-white/5 rounded-tl-none"
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
                  className="size-6 rounded-full bg-forest-dark border border-forest-light/50 shrink-0 bg-center bg-cover shadow-lg"
                  style={{ backgroundImage: `url('${conversation.avatar}')` }}
                ></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-neon-green ml-4">
                    {conversation.name}
                  </span>
                  <div className="bg-forest-light/90 text-white p-2 rounded-xl rounded-tl-none shadow-md border border-white/5 backdrop-blur-sm">
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
        <div className="col-span-1 lg:col-span-4 bg-forest-panel rounded-xl border border-forest-light/20 flex flex-col overflow-hidden shadow-lg order-1 lg:order-2">
          <div className="p-2 border-b border-forest-light/20 bg-forest-dark/20 backdrop-blur-sm">
            <div className="flex bg-forest-dark/40 p-1 rounded-xl mb-1">
              <button
                onClick={() => setSidebarTab("conversaciones")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sidebarTab === "conversaciones"
                    ? "bg-forest-light/40 text-white shadow-sm border border-forest-light/30"
                    : "text-text-muted hover:bg-forest-light/20 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xs">forum</span>
                Conversaciones
              </button>
              <button
                onClick={() => setSidebarTab("invitaciones")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  sidebarTab === "invitaciones"
                    ? "bg-forest-light/40 text-white shadow-sm border border-forest-light/30"
                    : "text-text-muted hover:bg-forest-light/20 hover:text-white"
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
                    ? "bg-forest-base border border-neon-green/40 shadow-[0_0_15px_rgba(26,83,25,0.5)]"
                    : "hover:bg-forest-light/10 border border-transparent hover:border-forest-light/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <div
                      className={`size-12 rounded-full bg-forest-dark border bg-center bg-cover ${
                        conv.online
                          ? "border-forest-light"
                          : "border-forest-light/30 grayscale opacity-80"
                      }`}
                      style={{ backgroundImage: `url('${conv.avatar}')` }}
                    ></div>
                    {conv.online && (
                      <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-neon-green border-2 border-forest-base"></div>
                    )}
                    {!conv.online && conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-orange-400 border-2 border-forest-panel"></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-text-light truncate">
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
                            ? "text-white font-bold"
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
        <div className="col-span-1 lg:col-span-8 bg-forest-panel rounded-xl border border-forest-light/20 flex items-center p-2 shadow-lg order-4 lg:order-3">
          <button className="size-12 rounded-lg text-text-muted hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <button className="size-12 rounded-lg text-text-muted hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">sentiment_satisfied</span>
          </button>
          <div className="h-8 w-px bg-forest-light/20 mx-2"></div>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-forest-light/60 font-medium px-4"
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
        <div className="col-span-1 lg:col-span-4 rounded-xl flex items-stretch order-3 lg:order-4">
          <button className="w-full bg-forest-panel border border-neon-green/30 rounded-xl flex items-center justify-center gap-3 text-neon-green font-heading font-bold text-[10px] hover:bg-neon-green hover:text-forest-dark transition-all shadow-lg hover:shadow-neon-green/20 group uppercase tracking-widest p-4">
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
      className="fixed z-50 bg-forest-dark rounded-xl shadow-2xl border border-forest-light/30 flex flex-col overflow-hidden"
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
        className="flex-none bg-forest-base border-b border-forest-light/20 px-3 py-2 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon-green text-[10px]">
              diversity_2
            </span>
            <h2 className="font-heading font-bold text-[10px] text-white">
              Mensajes Privados
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                minimizeMessages();
              }}
              className="text-text-muted hover:text-white transition-colors p-1"
              title="Minimizar"
            >
              <span className="material-symbols-outlined">minimize</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeMessages();
              }}
              className="text-text-muted hover:text-white transition-colors p-1"
              title="Maximizar"
            >
              <span className="material-symbols-outlined">open_in_full</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeMessages();
              }}
              className="text-text-muted hover:text-white transition-colors p-1"
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
    </div>
  );
}
