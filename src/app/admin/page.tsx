"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Tipos
interface User {
  id: string;
  username: string;
  email: string;
  nombre: string;
  edad: number | null;
  genero: string;
  ciudad: string;
  created_at: string;
  is_banned: boolean;
  is_verified: boolean;
  is_plus: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  presence_status: string;
  last_login: string | null;
}

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  reporter: { id: string; username: string; email: string };
  reported_user: { id: string; username: string; email: string; is_banned: boolean } | null;
}

interface Photo {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  is_approved: boolean;
  is_rejected: boolean;
  rejection_reason: string | null;
  created_at: string;
  user: { id: string; username: string; nombre: string; email: string };
}

interface Stats {
  pendingCount: number;
  urgentCount: number;
  highCount: number;
}

interface PhotoStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

// Razones predefinidas de rechazo
const REJECTION_REASONS = [
  'Contenido inapropiado o explícito',
  'No muestra claramente tu rostro',
  'Foto de baja calidad o borrosa',
  'Contiene texto, logos o marcas de agua',
  'Imagen de otra persona o celebridad',
  'Foto grupal (debe ser individual)',
  'Menores de edad en la imagen',
  'Contenido violento o perturbador',
  'Otro motivo'
];

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  
  // Estados
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'photos' | 'rooms' | 'appeals'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [photoStats, setPhotoStats] = useState<PhotoStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [photoStatusFilter, setPhotoStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [banDuration, setBanDuration] = useState<number | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | null>(null);
  
  // 🆕 Estados para reclamaciones (appeals)
  const [appeals, setAppeals] = useState<any[]>([]);
  const [appealStats, setAppealStats] = useState<{ pendingCount: number } | null>(null);
  const [appealStatusFilter, setAppealStatusFilter] = useState('pending');
  const [selectedAppeal, setSelectedAppeal] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // Verificar acceso de admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, isAdmin, router]);
  
  // Cargar datos
  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'reports') {
        loadReports();
      } else if (activeTab === 'photos') {
        loadPhotos();
      } else if (activeTab === 'appeals') {
        loadAppeals();
      }
    }
  }, [user, isAdmin, activeTab, statusFilter, photoStatusFilter, appealStatusFilter]);
  
  const loadUsers = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        adminId: user.id,
        status: statusFilter,
        search: searchTerm,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
    setIsLoading(false);
  };
  
  const loadReports = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        adminId: user.id,
        status: statusFilter === 'all' ? 'pending' : statusFilter,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
    setIsLoading(false);
  };

  const loadPhotos = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        adminId: user.id,
        status: photoStatusFilter,
        limit: '50'
      });
      
      const response = await fetch(`/api/admin/photos?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPhotos(data.photos);
        setPhotoStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando fotos:', error);
    }
    setIsLoading(false);
  };
  
  const loadAppeals = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        admin: 'true',
        status: appealStatusFilter,
      });
      
      const response = await fetch(`/api/photo-appeals?${params}`);
      const data = await response.json();
      
      if (data.appeals) {
        setAppeals(data.appeals);
        // Contar pendientes para el badge
        const pendingCount = data.appeals.filter((a: any) => a.status === 'pending').length;
        setAppealStats({ pendingCount });
      }
    } catch (error) {
      console.error('Error cargando reclamaciones:', error);
    }
    setIsLoading(false);
  };
  
  // Acciones de usuario
  const handleUserAction = async (action: string) => {
    if (!user || !selectedUser) return;
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          userId: selectedUser.id,
          action,
          reason: actionReason,
          duration: banDuration
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedUser(null);
        setActionReason('');
        setBanDuration(null);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      alert('Error al ejecutar la acción');
    }
  };
  
  const handleDeleteUser = async () => {
    if (!user || !selectedUser) return;
    
    if (!confirm(`¿Estás seguro de ELIMINAR permanentemente a ${selectedUser.username}? Esta acción NO se puede deshacer.`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          userId: selectedUser.id,
          reason: actionReason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedUser(null);
        loadUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    }
  };
  
  // Acciones de reportes
  const handleReportAction = async (action: string, banUser = false) => {
    if (!user || !selectedReport) return;
    
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          reportId: selectedReport.id,
          action,
          resolution: actionReason,
          banUser,
          banDuration
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedReport(null);
        setActionReason('');
        setBanDuration(null);
        loadReports();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error procesando reporte:', error);
    }
  };

  // Acciones de fotos
  const handlePhotoAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!user || !selectedPhoto) return;
    
    try {
      const response = await fetch('/api/admin/photos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          photoId: selectedPhoto.id,
          action,
          rejectionReason: actionReason
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedPhoto(null);
        setActionReason('');
        loadPhotos();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error procesando foto:', error);
    }
  };

  const handleBulkPhotoAction = async () => {
    if (!user || !bulkAction || selectedPhotos.length === 0) return;
    
    if (!confirm(`¿${bulkAction === 'approve' ? 'Aprobar' : 'Rechazar'} ${selectedPhotos.length} fotos?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          photoIds: selectedPhotos,
          action: bulkAction,
          rejectionReason: bulkAction === 'reject' ? actionReason : null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedPhotos([]);
        setBulkAction(null);
        setActionReason('');
        loadPhotos();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error procesando fotos en lote:', error);
    }
  };

  const handleAppealAction = async (action: 'approve' | 'reject') => {
    if (!user || !selectedAppeal) return;
    
    const actionText = action === 'approve' ? 'aprobar' : 'rechazar';
    
    if (!confirm(`¿Estás seguro de ${actionText} esta reclamación?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/photo-appeals/${selectedAppeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          admin_notes: adminNotes || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setSelectedAppeal(null);
        setAdminNotes('');
        loadAppeals();
      } else {
        alert(data.error || 'Error al procesar la reclamación');
      }
    } catch (error) {
      console.error('Error procesando reclamación:', error);
      alert('Error al procesar la reclamación');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    if (selectedPhotos.length === photos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(photos.map(p => p.id));
    }
  };
  
  // Renderizar loading o sin acceso
  if (loading) {
    return (
      <div className="min-h-screen bg-connect-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2820] via-connect-bg-dark to-[#0a1812]">
      {/* Header */}
      <header className="bg-connect-bg-dark/80 backdrop-blur-sm border-b border-connect-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white">
                ← Volver
              </Link>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-red-500">👮</span> Panel de Administración
              </h1>
            </div>
            <div className="text-sm text-gray-400">
              Admin: <span className="text-neon-green">{user?.username}</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-connect-border pb-4">
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'bg-neon-green text-forest-dark' : ''}
          >
            👥 Usuarios
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
            className={activeTab === 'reports' ? 'bg-red-500 text-white' : ''}
          >
            🚨 Denuncias {stats?.pendingCount ? `(${stats.pendingCount})` : ''}
          </Button>
          <Button
            variant={activeTab === 'photos' ? 'default' : 'outline'}
            onClick={() => setActiveTab('photos')}
            className={activeTab === 'photos' ? 'bg-blue-500 text-white' : ''}
          >
            📷 Fotos {photoStats?.pendingCount ? `(${photoStats.pendingCount})` : ''}
          </Button>
          <Button
            variant={activeTab === 'appeals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('appeals')}
            className={activeTab === 'appeals' ? 'bg-yellow-500 text-white' : ''}
          >
            ⚖️ Reclamaciones {appealStats?.pendingCount ? `(${appealStats.pendingCount})` : ''}
          </Button>
          <Button
            variant={activeTab === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rooms')}
          >
            💬 Salas de Chat
          </Button>
          <Button
            variant={activeTab === 'quick-messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quick-messages')}
            className={activeTab === 'quick-messages' ? 'bg-purple-500 text-white' : ''}
          >
            ⚡ Mensajes Rápidos
          </Button>
        </div>
        
        {/* Tab: Usuarios */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                type="text"
                placeholder="Buscar por username, email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                className="max-w-xs bg-connect-bg-dark/80 border-connect-border text-white"
              />
              <Button onClick={loadUsers} variant="outline">
                🔍 Buscar
              </Button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="banned">Baneados</option>
                <option value="unverified">Sin verificar</option>
              </select>
            </div>
            
            {/* Lista de usuarios */}
            <div className="bg-connect-bg-dark/60 rounded-xl border border-connect-border overflow-hidden overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-connect-bg-dark/80">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Verificación</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-connect-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Cargando...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="hover:bg-connect-bg-dark/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            u.presence_status === 'online' ? 'bg-green-500' :
                            u.presence_status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              {u.username}
                              {u.is_verified && <span title="Verificado">✓</span>}
                              {u.is_plus && <span className="text-yellow-400" title="PLUS">⭐</span>}
                            </div>
                            <div className="text-xs text-gray-400">{u.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${u.email_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            📧
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${u.phone_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            📱
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${u.id_verified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            🆔
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_banned ? (
                          <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                            🚫 Baneado
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                            ✓ Activo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(u)}
                        >
                          ⚙️ Gestionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Tab: Reportes */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-connect-border">
                  <div className="text-3xl font-bold text-yellow-400">{stats.pendingCount}</div>
                  <div className="text-sm text-gray-400">Pendientes</div>
                </div>
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-red-500/30">
                  <div className="text-3xl font-bold text-red-400">{stats.urgentCount}</div>
                  <div className="text-sm text-gray-400">Urgentes</div>
                </div>
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-orange-500/30">
                  <div className="text-3xl font-bold text-orange-400">{stats.highCount}</div>
                  <div className="text-sm text-gray-400">Alta Prioridad</div>
                </div>
              </div>
            )}
            
            {/* Filtros */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
              >
                <option value="pending">Pendientes</option>
                <option value="reviewing">En revisión</option>
                <option value="resolved">Resueltos</option>
                <option value="dismissed">Descartados</option>
                <option value="all">Todos</option>
              </select>
            </div>
            
            {/* Lista de reportes */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">Cargando...</div>
              ) : reports.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No hay reportes</div>
              ) : reports.map((report) => (
                <div 
                  key={report.id} 
                  className={`bg-connect-bg-dark/60 rounded-lg p-4 border ${
                    report.priority === 'urgent' ? 'border-red-500' :
                    report.priority === 'high' ? 'border-orange-500' :
                    'border-connect-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          report.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          report.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {report.priority.toUpperCase()}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                          {report.report_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      
                      <p className="text-white mb-2">{report.description}</p>
                      
                      <div className="text-sm text-gray-400">
                        <span>Reportado por: <span className="text-neon-green">{report.reporter?.username}</span></span>
                        {report.reported_user && (
                          <span className="ml-4">
                            Usuario reportado: <span className="text-red-400">{report.reported_user.username}</span>
                            {report.reported_user.is_banned && ' (Ya baneado)'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedReport(report)}
                    >
                      ⚙️ Procesar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tab: Fotos pendientes */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            {/* Stats */}
            {photoStats && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400">{photoStats.pendingCount}</div>
                  <div className="text-sm text-gray-400">Pendientes</div>
                </div>
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-green-500/30">
                  <div className="text-3xl font-bold text-green-400">{photoStats.approvedCount}</div>
                  <div className="text-sm text-gray-400">Aprobadas</div>
                </div>
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-red-500/30">
                  <div className="text-3xl font-bold text-red-400">{photoStats.rejectedCount}</div>
                  <div className="text-sm text-gray-400">Rechazadas</div>
                </div>
              </div>
            )}
            
            {/* Filtros y acciones en lote */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <select
                  value={photoStatusFilter}
                  onChange={(e) => setPhotoStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
                >
                  <option value="pending">Pendientes</option>
                  <option value="approved">Aprobadas</option>
                  <option value="rejected">Rechazadas</option>
                  <option value="all">Todas</option>
                </select>
                
                <Button onClick={loadPhotos} variant="outline" size="sm">
                  🔄 Actualizar
                </Button>
              </div>
              
              {/* Acciones en lote */}
              {selectedPhotos.length > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-400">
                    {selectedPhotos.length} seleccionadas
                  </span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => { setBulkAction('approve'); handleBulkPhotoAction(); }}
                  >
                    ✓ Aprobar todas
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => setBulkAction('reject')}
                  >
                    ✗ Rechazar todas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedPhotos([])}
                  >
                    Limpiar
                  </Button>
                </div>
              )}
            </div>
            
            {/* Grid de fotos */}
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-green mx-auto mb-2"></div>
                Cargando fotos...
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">📷</p>
                <p>No hay fotos {photoStatusFilter === 'pending' ? 'pendientes de revisión' : ''}</p>
              </div>
            ) : (
              <>
                {/* Seleccionar todas */}
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.length === photos.length && photos.length > 0}
                    onChange={selectAllPhotos}
                    className="w-4 h-4 rounded border-gray-500"
                  />
                  <span className="text-sm text-gray-400">Seleccionar todas</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className={`relative bg-connect-bg-dark/60 rounded-xl border overflow-hidden group ${
                        selectedPhotos.includes(photo.id) 
                          ? 'border-neon-green' 
                          : 'border-connect-border hover:border-gray-600'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedPhotos.includes(photo.id)}
                          onChange={() => togglePhotoSelection(photo.id)}
                          className="w-5 h-5 rounded border-gray-500 bg-black/50"
                        />
                      </div>
                      
                      {/* Imagen */}
                      <div 
                        className="aspect-square cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={photo.url}
                          alt="Foto de usuario"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info del usuario */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-white truncate">
                            @{photo.user?.username}
                          </div>
                          {photo.is_primary && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-400 mb-2">
                          {new Date(photo.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        {/* Estado */}
                        {photo.is_approved && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            ✓ Aprobada
                          </span>
                        )}
                        {photo.is_rejected && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            ✗ Rechazada
                          </span>
                        )}
                        {!photo.is_approved && !photo.is_rejected && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            ⏳ Pendiente
                          </span>
                        )}
                      </div>
                      
                      {/* Acciones rápidas (hover) */}
                      {!photo.is_approved && !photo.is_rejected && (
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                              handlePhotoAction('approve');
                            }}
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPhoto(photo);
                            }}
                          >
                            ✗
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {/* 🆕 Tab: Reclamaciones */}
        {activeTab === 'appeals' && (
          <div className="space-y-6">
            {/* Stats */}
            {appealStats && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400">{appealStats.pendingCount}</div>
                  <div className="text-sm text-gray-400">Reclamaciones Pendientes</div>
                </div>
              </div>
            )}
            
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={appealStatusFilter}
                onChange={(e) => setAppealStatusFilter(e.target.value)}
                className="px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
              >
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
                <option value="all">Todas</option>
              </select>
              
              <Button onClick={loadAppeals} variant="outline" size="sm">
                🔄 Actualizar
              </Button>
            </div>
            
            {/* Lista de reclamaciones */}
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                Cargando reclamaciones...
              </div>
            ) : appeals.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <p className="text-4xl mb-4">⚖️</p>
                <p>No hay reclamaciones {appealStatusFilter === 'pending' ? 'pendientes de revisión' : ''}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appeals.map((appeal: any) => {
                  const statusColor = 
                    appeal.status === 'pending' ? 'yellow' :
                    appeal.status === 'approved' ? 'green' : 'red';
                  
                  const statusText =
                    appeal.status === 'pending' ? 'Pendiente' :
                    appeal.status === 'approved' ? 'Aprobada' : 'Rechazada';
                  
                  return (
                    <div
                      key={appeal.id}
                      className="bg-connect-bg-dark/60 rounded-xl border border-connect-border p-4 hover:border-yellow-500/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Imagen de la foto reclamada */}
                        <div className="w-32 h-32 flex-shrink-0">
                          <img
                            src={appeal.album_photos?.url}
                            alt="Foto reclamada"
                            className="w-full h-full object-cover rounded-lg border-2 border-yellow-500/30"
                          />
                        </div>
                        
                        {/* Información */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                Reclamación de {appeal.profiles?.username || 'Usuario'}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {new Date(appeal.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${statusColor}-500/20 text-${statusColor}-400 border border-${statusColor}-500/30`}>
                              {statusText}
                            </span>
                          </div>
                          
                          {/* Motivo original del rechazo */}
                          {appeal.album_photos?.moderation_reason && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                              <p className="text-xs text-red-400 font-semibold mb-1">Motivo del rechazo automático:</p>
                              <p className="text-sm text-red-300">{appeal.album_photos.moderation_reason}</p>
                              {appeal.album_photos.moderation_score && (
                                <p className="text-xs text-red-400 mt-1">
                                  Score: {(appeal.album_photos.moderation_score * 100).toFixed(1)}%
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Razón de la reclamación */}
                          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-xs text-yellow-400 font-semibold mb-1">Motivo de la reclamación:</p>
                            <p className="text-sm text-yellow-200 mb-2">{appeal.reason}</p>
                            <p className="text-sm text-white">{appeal.description}</p>
                          </div>
                          
                          {/* Notas del admin (si existen) */}
                          {appeal.admin_notes && (
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-xs text-blue-400 font-semibold mb-1">Notas del administrador:</p>
                              <p className="text-sm text-blue-200">{appeal.admin_notes}</p>
                              {appeal.admin_profiles && (
                                <p className="text-xs text-blue-400 mt-1">
                                  Por: {appeal.admin_profiles.username}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Botones de acción (solo para pendientes) */}
                          {appeal.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 flex-1"
                                onClick={() => setSelectedAppeal(appeal)}
                              >
                                ✓ Revisar y Aprobar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 flex-1"
                                onClick={() => {
                                  setSelectedAppeal(appeal);
                                  // Auto-seleccionar rechazar
                                  setTimeout(() => {
                                    const rejectBtn = document.getElementById('reject-appeal-btn');
                                    if (rejectBtn) rejectBtn.focus();
                                  }, 100);
                                }}
                              >
                                ✗ Rechazar Reclamación
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Tab: Salas de chat */}
        {activeTab === 'rooms' && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-2xl mb-4">💬</p>
            <p>Módulo de gestión de salas de chat</p>
            <p className="text-sm mt-2">Próximamente...</p>
          </div>
        )}
        
        {/* Tab: Mensajes Rápidos */}
        {activeTab === 'quick-messages' && (
          <div className="space-y-6">
            <div className="bg-connect-bg-dark/60 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">⚡ Mensajes Rápidos</h3>
              <p className="text-gray-400 mb-4">
                Gestiona plantillas de mensajes rápidos para responder a usuarios
              </p>
              
              <div className="text-center text-gray-400 py-8">
                <p className="text-4xl mb-4">💬</p>
                <p>Módulo de mensajes rápidos</p>
                <p className="text-sm mt-2">Funcionalidad en desarrollo...</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal: Gestionar Usuario */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-connect-bg-dark rounded-xl border border-connect-border max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Gestionar: {selectedUser.username}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="text-sm text-gray-400">
                <p>Email: {selectedUser.email}</p>
                <p>Registrado: {new Date(selectedUser.created_at).toLocaleDateString('es-ES')}</p>
                <p>Estado: {selectedUser.is_banned ? '🚫 Baneado' : '✓ Activo'}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Razón (opcional)</label>
                <Input
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Motivo de la acción..."
                  className="bg-connect-bg-dark/80 border-connect-border text-white"
                />
              </div>
              
              {!selectedUser.is_banned && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración del ban (días, opcional)</label>
                  <Input
                    type="number"
                    value={banDuration || ''}
                    onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Dejar vacío para ban permanente"
                    className="bg-connect-bg-dark/80 border-connect-border text-white"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {selectedUser.is_banned ? (
                <Button onClick={() => handleUserAction('unban')} className="bg-green-600 hover:bg-green-700">
                  ✓ Desbanear
                </Button>
              ) : (
                <Button onClick={() => handleUserAction('ban')} className="bg-red-600 hover:bg-red-700">
                  🚫 Banear
                </Button>
              )}
              
              {!selectedUser.is_verified && (
                <Button onClick={() => handleUserAction('verify')} className="bg-blue-600 hover:bg-blue-700">
                  ✓ Verificar
                </Button>
              )}
              
              <Button onClick={handleDeleteUser} variant="destructive">
                🗑️ Eliminar
              </Button>
              
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: Procesar Reporte */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-connect-bg-dark rounded-xl border border-connect-border max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Procesar Reporte
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="text-sm text-gray-400">
                <p>Tipo: {selectedReport.report_type}</p>
                <p>Prioridad: {selectedReport.priority}</p>
                <p className="mt-2 text-white">{selectedReport.description}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Resolución</label>
                <Input
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Descripción de la resolución..."
                  className="bg-connect-bg-dark/80 border-connect-border text-white"
                />
              </div>
              
              {selectedReport.reported_user && !selectedReport.reported_user.is_banned && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duración del ban (días)</label>
                  <Input
                    type="number"
                    value={banDuration || ''}
                    onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Si deseas banear al usuario"
                    className="bg-connect-bg-dark/80 border-connect-border text-white"
                  />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleReportAction('resolve', false)} className="bg-green-600 hover:bg-green-700">
                ✓ Resolver
              </Button>
              
              {selectedReport.reported_user && !selectedReport.reported_user.is_banned && (
                <Button onClick={() => handleReportAction('resolve', true)} className="bg-red-600 hover:bg-red-700">
                  ✓ Resolver + Banear
                </Button>
              )}
              
              <Button onClick={() => handleReportAction('dismiss')} variant="outline">
                ✗ Descartar
              </Button>
              
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Revisar Foto */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-connect-bg-dark rounded-xl border border-connect-border max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-connect-bg-dark border-b border-connect-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Revisar Foto
              </h3>
              <Button variant="ghost" onClick={() => { setSelectedPhoto(null); setActionReason(''); }}>
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Imagen */}
                <div>
                  <img
                    src={selectedPhoto.url}
                    alt="Foto a revisar"
                    className="w-full rounded-lg"
                  />
                </div>
                
                {/* Info y acciones */}
                <div className="space-y-4">
                  <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-connect-border">
                    <h4 className="font-bold text-white mb-2">Información del usuario</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Username: <span className="text-neon-green">@{selectedPhoto.user?.username}</span></p>
                      <p>Nombre: {selectedPhoto.user?.nombre || 'No especificado'}</p>
                      <p>Email: {selectedPhoto.user?.email}</p>
                      <p>Subida: {new Date(selectedPhoto.created_at).toLocaleString('es-ES')}</p>
                      {selectedPhoto.is_primary && (
                        <p className="text-yellow-400">⭐ Esta es su foto principal</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Estado actual */}
                  <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-connect-border">
                    <h4 className="font-bold text-white mb-2">Estado actual</h4>
                    {selectedPhoto.is_approved && (
                      <span className="text-green-400">✓ Aprobada</span>
                    )}
                    {selectedPhoto.is_rejected && (
                      <div>
                        <span className="text-red-400">✗ Rechazada</span>
                        {selectedPhoto.rejection_reason && (
                          <p className="text-sm text-gray-400 mt-1">
                            Motivo: {selectedPhoto.rejection_reason}
                          </p>
                        )}
                      </div>
                    )}
                    {!selectedPhoto.is_approved && !selectedPhoto.is_rejected && (
                      <span className="text-yellow-400">⏳ Pendiente de revisión</span>
                    )}
                  </div>
                  
                  {/* Acciones */}
                  {!selectedPhoto.is_approved && !selectedPhoto.is_rejected && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Motivo de rechazo (si aplica)</label>
                        <select
                          value={actionReason}
                          onChange={(e) => setActionReason(e.target.value)}
                          className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
                        >
                          <option value="">Seleccionar motivo...</option>
                          {REJECTION_REASONS.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                        {actionReason === 'Otro motivo' && (
                          <Input
                            className="mt-2 bg-connect-bg-dark/80 border-connect-border text-white"
                            placeholder="Especificar motivo..."
                            onChange={(e) => setActionReason(e.target.value)}
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handlePhotoAction('approve')}
                        >
                          ✓ Aprobar
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => handlePhotoAction('reject')}
                          disabled={!actionReason}
                        >
                          ✗ Rechazar
                        </Button>
                      </div>
                      
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          if (confirm('¿Eliminar esta foto permanentemente?')) {
                            handlePhotoAction('delete');
                          }
                        }}
                      >
                        🗑️ Eliminar permanentemente
                      </Button>
                    </div>
                  )}
                  
                  {/* Ver perfil */}
                  <Link 
                    href={`/publicprofile/${selectedPhoto.user?.username}`}
                    target="_blank"
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      👤 Ver perfil del usuario
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazo en lote */}
      {bulkAction === 'reject' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-connect-bg-dark rounded-xl border border-connect-border max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Rechazar {selectedPhotos.length} fotos
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Motivo de rechazo</label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white"
                >
                  <option value="">Seleccionar motivo...</option>
                  {REJECTION_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleBulkPhotoAction}
                disabled={!actionReason}
              >
                Rechazar todas
              </Button>
              <Button
                variant="outline"
                onClick={() => { setBulkAction(null); setActionReason(''); }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 🆕 Modal: Revisar Reclamación */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-connect-bg-dark rounded-xl border border-yellow-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-connect-bg-dark border-b border-yellow-500/30 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                ⚖️ Revisar Reclamación
              </h3>
              <Button variant="ghost" onClick={() => { setSelectedAppeal(null); setAdminNotes(''); }}>
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Imagen de la foto reclamada */}
                <div>
                  <div className="relative">
                    <img
                      src={selectedAppeal.album_photos?.url}
                      alt="Foto reclamada"
                      className="w-full rounded-lg border-2 border-yellow-500/30"
                    />
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                      RECHAZADA
                    </div>
                  </div>
                  
                  {/* Score de moderación */}
                  {selectedAppeal.album_photos?.moderation_score && (
                    <div className="mt-3 bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-xs text-red-400 font-semibold">Score de moderación automática:</p>
                      <p className="text-2xl font-bold text-red-300">
                        {(selectedAppeal.album_photos.moderation_score * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Información y acciones */}
                <div className="space-y-4">
                  {/* Info del usuario */}
                  <div className="bg-connect-bg-dark/60 rounded-lg p-4 border border-connect-border">
                    <h4 className="font-bold text-white mb-2">Usuario que reclama</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Username: <span className="text-yellow-400">@{selectedAppeal.profiles?.username}</span></p>
                      <p>Nombre: {selectedAppeal.profiles?.full_name || 'No especificado'}</p>
                      <p>Fecha de reclamación: {new Date(selectedAppeal.created_at).toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                  
                  {/* Motivo del rechazo automático */}
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-red-400 mb-2">Motivo del rechazo automático</h4>
                    <p className="text-sm text-red-300">
                      {selectedAppeal.album_photos?.moderation_reason || 'No especificado'}
                    </p>
                  </div>
                  
                  {/* Razón de la reclamación */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-400 mb-2">Razón de la reclamación</h4>
                    <p className="text-sm text-yellow-200 font-semibold mb-2">
                      {selectedAppeal.reason}
                    </p>
                    <p className="text-sm text-white">
                      {selectedAppeal.description}
                    </p>
                  </div>
                  
                  {/* Notas del admin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Notas administrativas (opcional)
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Agrega notas sobre tu decisión..."
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-2 bg-connect-bg-dark/80 border border-connect-border rounded-lg text-white resize-none focus:outline-none focus:border-yellow-500/50"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {adminNotes.length}/500 caracteres
                    </p>
                  </div>
                  
                  {/* Acciones */}
                  <div className="space-y-3 pt-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                      onClick={() => handleAppealAction('approve')}
                    >
                      ✓ Aprobar Reclamación (Desbloquear Foto)
                    </Button>
                    <Button
                      id="reject-appeal-btn"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                      onClick={() => handleAppealAction('reject')}
                    >
                      ✗ Rechazar Reclamación (Mantener Bloqueada)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setSelectedAppeal(null); setAdminNotes(''); }}
                    >
                      Cancelar
                    </Button>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      <strong>Aprobar:</strong> La foto se desbloqueará y aparecerá en el álbum público.<br />
                      <strong>Rechazar:</strong> La foto permanecerá bloqueada y el usuario será notificado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
