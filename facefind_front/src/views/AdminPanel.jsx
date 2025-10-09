import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import CaseManagement from '../components/admin/CaseManagement';
import NotificationPanel from '../components/admin/NotificationPanel';
import ActivityLogs from '../components/admin/ActivityLogs';
import SearchCases from '../components/admin/SearchCases'; 

import '../styles/admin/AdminPanel.css';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

    const [selectedCase, setSelectedCase] = useState(null);


  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  const handleOpenCase = (caso) => {
    setSelectedCase(caso);        
    setActiveSection('cases');  
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'cases':
        return <CaseManagement />;
      case 'notifications':
        return <NotificationPanel />;
      case 'logs':
        return <ActivityLogs />;
      case 'search': 
         return <SearchCases />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Panel Admin</h2>
          <p>Gestión del Sistema</p>
        </div>
        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="icon">📊</span>
            Dashboard
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <span className="icon">👥</span>
            Gestión de Usuarios
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'cases' ? 'active' : ''}`}
            onClick={() => setActiveSection('cases')}
          >
            <span className="icon">📁</span>
            Gestión de Casos
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="icon">🔔</span>
            Notificaciones
          </button>
          
          <button
            className={`admin-nav-item ${activeSection === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveSection('logs')}
          >
            <span className="icon">📝</span>
            Logs de Actividad
          </button>
          
          <button
            className={`admin-nav-item ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => setActiveSection('search')}
          >
            <span className="icon">🔎</span>
            Búsqueda
          </button>
        </nav>
      </aside>
      <main className="admin-content">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPanel;
