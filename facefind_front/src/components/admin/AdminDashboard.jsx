import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import { getAllCasos } from '../../services/casoService';
import MetricCard from './MetricCard';
import RecentActivity from './RecentActivity';
import CaseStatusChart from './CaseStatusChart';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingCases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios y casos en paralelo
      const [usersData, casosData] = await Promise.all([
        getAllUsers(),
        getAllCasos()
      ]);

      // Contar casos por estado
      const activeCases = casosData.filter(c => c.status === 'activo').length;
      const resolvedCases = casosData.filter(c => c.status === 'resuelto').length;
      const pendingCases = casosData.filter(c => c.status === 'pendiente').length;

      setMetrics({
        totalUsers: usersData.length,
        activeCases,
        resolvedCases,
        pendingCases
      });
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Dashboard Administrativo</h1>
          <p>Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrativo</h1>
        <p>Resumen general del sistema FaceFind</p>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Usuarios Totales"
          value={metrics.totalUsers}
          icon="👥"
          trend="+12%"
          trendPositive={true}
        />
        <MetricCard
          title="Casos Activos"
          value={metrics.activeCases}
          icon="🔍"
          trend="+8%"
          trendPositive={true}
        />
        <MetricCard
          title="Casos Resueltos"
          value={metrics.resolvedCases}
          icon="✅"
          trend="+15%"
          trendPositive={true}
        />
        <MetricCard
          title="Casos Pendientes"
          value={metrics.pendingCases}
          icon="⏳"
          trend="-5%"
          trendPositive={false}
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <CaseStatusChart />
        </div>
        <div className="dashboard-section">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
