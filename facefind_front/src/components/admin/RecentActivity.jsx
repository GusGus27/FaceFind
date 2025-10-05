import React, { useState, useEffect } from 'react';
import '../../styles/RecentActivity.css';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Simulación de actividades recientes
    setActivities([
      {
        id: 1,
        type: 'case',
        message: 'Nuevo caso reportado: Persona desaparecida en zona norte',
        timestamp: '2025-10-05 14:30',
        user: 'Juan Pérez'
      },
      {
        id: 2,
        type: 'user',
        message: 'Nuevo usuario registrado en el sistema',
        timestamp: '2025-10-05 13:15',
        user: 'Sistema'
      },
      {
        id: 3,
        type: 'case',
        message: 'Caso #156 marcado como resuelto',
        timestamp: '2025-10-05 12:00',
        user: 'María García'
      },
      {
        id: 4,
        type: 'match',
        message: 'Posible coincidencia detectada en caso #89',
        timestamp: '2025-10-05 11:45',
        user: 'Sistema IA'
      },
      {
        id: 5,
        type: 'user',
        message: 'Usuario admin actualizó permisos',
        timestamp: '2025-10-05 10:30',
        user: 'Admin'
      }
    ]);
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'case': return '📁';
      case 'user': return '👤';
      case 'match': return '🎯';
      default: return '📌';
    }
  };

  return (
    <div className="recent-activity">
      <h2>Actividad Reciente</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
            <div className="activity-details">
              <p className="activity-message">{activity.message}</p>
              <div className="activity-meta">
                <span className="activity-user">{activity.user}</span>
                <span className="activity-time">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
