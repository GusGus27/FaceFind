import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import RecentActivity from './RecentActivity';
import CaseStatusChart from './CaseStatusChart';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeCases: 0,
    resolvedCases: 0,
    pendingCases: 0
  });

  useEffect(() => {
    // Simulación de carga de métricas
    setMetrics({
      totalUsers: 1245,
      activeCases: 89,
      resolvedCases: 156,
      pendingCases: 34
    });
  }, []);

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
