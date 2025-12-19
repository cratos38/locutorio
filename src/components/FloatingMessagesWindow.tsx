"use client";

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    addFriend,
    blockUser,
    reportUser
  } = useMessages();

  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll a último mensaje
  useEffect(() => {
    if (messagesEndRef.current && windowState !== 'minimized') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation, conversations, windowState]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || windowState === 'minimized') return;
      
      if (e.key === 'Escape') {
        closeMessages();
      } else if (e.ctrlKey && e.key === 'Enter') {
        handleSendMessage();
      } else if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        minimizeMessages();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, windowState, messageText]);

  // Drag functionality
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (windowState !== 'normal') return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - windowPosition.x,
      y: e.clientY - windowPosition.y
    });
  };

  const handleMouseMoveDrag = (e: MouseEvent) => {
    if (isDragging && windowState === 'normal') {
      setWindowPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUpDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag);
      window.addEventListener('mouseup', handleMouseUpDrag);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveDrag);
        window.removeEventListener('mouseup', handleMouseUpDrag);
      };
    }
  }, [isDragging, dragOffset]);

  // Resize functionality
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (windowState !== 'normal') return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: windowSize.width,
      height: windowSize.height
    });
  };

  const handleMouseMoveResize = (e: MouseEvent) => {
    if (isResizing && windowState === 'normal') {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      setWindowSize({
        width: Math.max(350, resizeStart.width + deltaX),
        height: Math.max(400, resizeStart.height + deltaY)
      });
    }
  };

  const handleMouseUpResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMoveResize);
      window.addEventListener('mouseup', handleMouseUpResize);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveResize);
        window.removeEventListener('mouseup', handleMouseUpResize);
      };
    }
  }, [isResizing, resizeStart]);

  // Enviar mensaje
  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mostrar modal premium
  const showPremiumFeature = (feature: string) => {
    setPremiumFeature(feature);
    setShowPremiumModal(true);
  };

  // Obtener conversación actual
  const currentConv = conversations.find(c => c.id === currentConversation);
  
  // Filtrar conversaciones por búsqueda
  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Usuario está escribiendo
  const isUserTyping = currentConv && typingUsers.includes(currentConv.userId);

  if (!isOpen) return null;

  // Ventana minimizada (barra de tareas)
  if (windowState === 'minimized') {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={restoreMessages}
          className="bg-connect-card border-2 border-primary rounded-lg px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-bold text-white">Mensajes</span>
          {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
            <span className="bg-primary text-connect-bg-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </span>
          )}
        </button>
      </div>
    );
  }

  // Ventana maximizada
  const windowStyle = windowState === 'maximized'
    ? { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }
    : { 
        top: `${windowPosition.y}px`, 
        left: `${windowPosition.x}px`, 
        width: `${windowSize.width}px`, 
        height: `${windowSize.height}px` 
      };

  return (
    <>
      {/* Overlay oscuro cuando está maximizada */}
      {windowState === 'maximized' && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={restoreMessages} />
      )}

      {/* Ventana de mensajes */}
      <div
        ref={windowRef}
        className="fixed bg-connect-card border-2 border-primary rounded-xl shadow-2xl flex flex-col overflow-hidden z-50"
        style={windowStyle}
      >
        {/* Header con drag */}
        <div
          className="bg-connect-bg-dark border-b border-connect-border px-4 py-3 flex items-center justify-between cursor-move select-none"
          onMouseDown={handleMouseDownDrag}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="font-bold text-white">
              Mensajes Privados
              {currentConv && <span className="text-primary ml-2">@{currentConv.username}</span>}
            </h3>
          </div>
          
          {/* Botones de ventana */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); minimizeMessages(); }}
              className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Minimizar"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); windowState === 'maximized' ? restoreMessages() : maximizeMessages(); }}
              className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
              title={windowState === 'maximized' ? "Restaurar" : "Maximizar"}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {windowState === 'maximized' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeMessages(); }}
              className="w-8 h-8 rounded hover:bg-red-500/20 flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar con botones de funciones */}
        <div className="bg-connect-bg-dark border-b border-connect-border px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {/* Agregar Amigo */}
          <button
            onClick={() => currentConv && addFriend(currentConv.userId)}
            disabled={!currentConv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary hover:scale-105 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            title="Agregar Amigo"
          >
            <span>👤</span>
            <span className="hidden sm:inline">Amigo</span>
          </button>

          {/* Fotos (Premium) */}
          <button
            onClick={() => showPremiumFeature("Enviar Fotos")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 opacity-50 cursor-not-allowed text-xs font-medium grayscale"
            title="Enviar Fotos (Premium)"
          >
            <span>📷</span>
            <span className="hidden sm:inline text-orange-400">PLUS</span>
          </button>

          {/* Denunciar */}
          <button
            onClick={() => currentConv && reportUser(currentConv.userId, "inappropriate")}
            disabled={!currentConv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:scale-105 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            title="Denunciar"
          >
            <span>⚠️</span>
            <span className="hidden sm:inline">Denunciar</span>
          </button>

          {/* Bloquear */}
          <button
            onClick={() => currentConv && blockUser(currentConv.userId, 7)}
            disabled={!currentConv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 hover:scale-105 transition-all text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            title="Bloquear 7 días"
          >
            <span>🔕</span>
            <span className="hidden sm:inline">Bloquear</span>
          </button>

          {/* Notas (Premium) */}
          <button
            onClick={() => showPremiumFeature("Notas Privadas")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 opacity-50 cursor-not-allowed text-xs font-medium grayscale"
            title="Notas Privadas (Premium)"
          >
            <span>📝</span>
            <span className="hidden sm:inline text-orange-400">PLUS</span>
          </button>

          {/* Archivo */}
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary hover:scale-105 transition-all text-xs font-medium"
            title="Archivo"
          >
            <span>📁</span>
            <span className="hidden sm:inline">Archivo</span>
          </button>

          {/* Ajustes */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary hover:scale-105 transition-all text-xs font-medium"
            title="Ajustes"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Ajustes</span>
          </button>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de conversaciones */}
          <div className="w-1/3 border-r border-connect-border flex flex-col overflow-hidden">
            {/* Buscador */}
            <div className="p-3 border-b border-connect-border">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-connect-bg-dark border-connect-border text-white text-sm"
              />
            </div>

            {/* Lista de conversaciones */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-connect-border ${
                    currentConversation === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-connect-card" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-sm truncate">{conv.username}</span>
                      <span className="text-xs text-connect-muted flex-shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-connect-muted truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0 bg-primary text-connect-bg-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 flex flex-col">
            {currentConv ? (
              <>
                {/* Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            msg.isOwn
                              ? 'bg-primary text-connect-bg-dark'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-connect-muted ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span>{msg.time}</span>
                          {msg.isOwn && (
                            <span>
                              {msg.read ? '✓✓' : msg.delivered ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isUserTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-white px-4 py-2 rounded-2xl text-sm italic">
                        {currentConv.username} está escribiendo...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input de mensaje */}
                <div className="p-4 border-t border-connect-border">
                  <div className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-connect-bg-dark border-connect-border text-white"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-primary text-connect-bg-dark hover:brightness-110 font-bold"
                    >
                      Enviar
                    </Button>
                  </div>
                  <p className="text-xs text-connect-muted mt-2">
                    Presiona Enter para enviar, Esc para cerrar
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-connect-muted">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p>Selecciona una conversación</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize handle (solo en modo normal) */}
        {windowState === 'normal' && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleMouseDownResize}
          >
            <svg className="w-4 h-4 text-connect-muted" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 22H2L22 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Modal Premium */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowPremiumModal(false)}>
          <div className="bg-connect-card p-6 rounded-xl max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2">🌟 Función Premium</h3>
            <p className="text-connect-muted mb-4">
              <strong>{premiumFeature}</strong> está disponible solo para usuarios con Plan PLUS
            </p>
            <ul className="text-sm text-connect-muted mb-4 space-y-1">
              <li>• Enviar fotos en mensajes</li>
              <li>• Notas privadas personalizadas</li>
              <li>• Historial ilimitado</li>
              <li>• Y muchas más funciones...</li>
            </ul>
            <div className="flex gap-3">
              <Button onClick={() => setShowPremiumModal(false)} variant="outline" className="flex-1">
                Entendido
              </Button>
              <Button className="flex-1 bg-primary text-connect-bg-dark">
                Ver Planes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
