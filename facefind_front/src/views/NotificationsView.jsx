import React, { useState, useEffect } from 'react';
import NotificationCard from '../components/common/NotificationCard';
import NotificationDetailModal from '../components/common/NotificationDetailModal';
import NotificationFilters from '../components/common/NotificationFilters';
import ExportReport from '../components/common/ExportReport';
import '../styles/views/NotificationsView.css';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [cases, setCases] = useState([]);
  const [currentFilters, setCurrentFilters] = useState(null);

  useEffect(() => {
    loadNotifications();
    loadStats();
    loadCameras();
    loadCases();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/historial?limite=500', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notificaciones || []);
        setFilteredNotifications(data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/estadisticas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const loadCameras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cameras', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCameras(data.cameras || []);
      }
    } catch (error) {
      console.error('Error cargando cámaras:', error);
    }
  };

  const loadCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/casos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCases(data.casos || []);
      }
    } catch (error) {
      console.error('Error cargando casos:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}/marcar-leida`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const updateFunc = (prev) =>
        prev.map(n =>
          n.id === notificationId ? { ...n, leida_en: new Date().toISOString() } : n
        );

      setNotifications(updateFunc);
      setFilteredNotifications(updateFunc);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = filteredNotifications.filter(n => !n.leida_en);
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    
    let filtered = [...notifications];

    // Filtro de búsqueda
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        (n.asunto?.toLowerCase().includes(query)) ||
        (n.contenido?.toLowerCase().includes(query)) ||
        (n.alerta?.ubicacion?.toLowerCase().includes(query)) ||
        (n.alerta?.caso?.num_caso?.toString().includes(query))
      );
    }

    // Filtro de prioridad
    if (filters.prioridad !== 'all') {
      filtered = filtered.filter(n => n.prioridad === filters.prioridad);
    }

    // Filtro de estado
    if (filters.estado !== 'all') {
      filtered = filtered.filter(n => n.alerta?.estado === filters.estado);
    }

    // Filtro de caso
    if (filters.casoId !== 'all') {
      filtered = filtered.filter(n => n.alerta?.caso?.id === parseInt(filters.casoId));
    }

    // Filtro de cámara
    if (filters.camaraId !== 'all') {
      filtered = filtered.filter(n => n.alerta?.camara?.id === parseInt(filters.camaraId));
    }

    // Filtro de fechas
    if (filters.fechaInicio) {
      const startDate = new Date(filters.fechaInicio);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(n => new Date(n.creada_en) >= startDate);
    }

    if (filters.fechaFin) {
      const endDate = new Date(filters.fechaFin);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(n => new Date(n.creada_en) <= endDate);
    }

    // Filtro de solo no leídas
    if (filters.soloNoLeidas) {
      filtered = filtered.filter(n => !n.leida_en);
    }

    // Ordenamiento
    switch (filters.ordenPor) {
      case 'fecha_desc':
        filtered.sort((a, b) => new Date(b.creada_en) - new Date(a.creada_en));
        break;
      case 'fecha_asc':
        filtered.sort((a, b) => new Date(a.creada_en) - new Date(b.creada_en));
        break;
      case 'prioridad':
        const prioridadOrder = { ALTA: 3, MEDIA: 2, BAJA: 1 };
        filtered.sort((a, b) => (prioridadOrder[b.prioridad] || 0) - (prioridadOrder[a.prioridad] || 0));
        break;
      case 'confianza':
        filtered.sort((a, b) => (b.alerta?.similitud || 0) - (a.alerta?.similitud || 0));
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered);
  };



  return (
    <div className="notifications-view">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <div className="header-left">
            <h1>📬 Notificaciones</h1>
            <p className="subtitle">
              {notifications.filter(n => !n.leida_en).length} sin leer de {notifications.length} totales
            </p>
          </div>
          <div className="header-actions">
            <ExportReport 
              notifications={filteredNotifications} 
              filters={currentFilters}
            />
            {filteredNotifications.some(n => !n.leida_en) && (
              <button 
                className="mark-all-btn"
                onClick={markAllAsRead}
              >
                ✓ Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.cola?.en_cola || 0}</div>
                <div className="stat-label">En cola</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.cola?.procesadas || 0}</div>
                <div className="stat-label">Procesadas</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats.historial_alertas?.por_prioridad?.ALTA || 0}
                </div>
                <div className="stat-label">Alta prioridad</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats.historial_alertas?.recientes_24h || 0}
                </div>
                <div className="stat-label">Últimas 24h</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Avanzados */}
        <NotificationFilters 
          onFilterChange={handleFilterChange}
          totalCount={filteredNotifications.length}
          cameras={cameras}
          cases={cases}
        />

        {/* Lista de notificaciones */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No hay notificaciones</h3>
              <p>
                {notifications.length === 0 
                  ? 'Cuando haya nuevas detecciones, aparecerán aquí'
                  : 'No se encontraron notificaciones con los filtros aplicados'}
              </p>
            </div>
          ) : (
            <div className="notifications-grid">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClick={() => setSelectedNotification(notification)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal de detalles */}
        {selectedNotification && (
          <NotificationDetailModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
