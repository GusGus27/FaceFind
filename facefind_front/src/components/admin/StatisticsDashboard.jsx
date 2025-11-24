import React, { useState, useEffect } from 'react';
import {
  getDashboardOverview,
  getTemporalAnalysis,
  getDetectionMetrics,
  getHeatmapData,
  getDemographicAnalysis,
  getCameraStatistics,
  getPerformanceMetrics
} from '../../services/statisticsService';
import StatisticsMetricCard from './StatisticsMetricCard';
import TemporalChart from './TemporalChart';
import DetectionMetricsCard from './DetectionMetricsCard';
import HeatmapCard from './HeatmapCard';
import DemographicsChart from './DemographicsChart';
import CameraStatsTable from './CameraStatsTable';
import PerformanceMetrics from './PerformanceMetrics';
import ExportReportModal from './ExportReportModal';
import '../../styles/admin/StatisticsDashboard.css';

const StatisticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [temporalData, setTemporalData] = useState(null);
  const [detectionMetrics, setDetectionMetrics] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [cameraStats, setCameraStats] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [temporalPeriod, setTemporalPeriod] = useState('month');

  useEffect(() => {
    loadAllStatistics();
  }, []);

  useEffect(() => {
    if (temporalPeriod) {
      loadTemporalData();
    }
  }, [temporalPeriod]);

  const loadAllStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todas las estadísticas en paralelo
      const [
        overviewData,
        temporalDataResult,
        detectionData,
        heatmapResult,
        demographicsData,
        cameraData,
        performanceData
      ] = await Promise.all([
        getDashboardOverview(),
        getTemporalAnalysis(temporalPeriod),
        getDetectionMetrics(),
        getHeatmapData(),
        getDemographicAnalysis(),
        getCameraStatistics(),
        getPerformanceMetrics()
      ]);

      setOverview(overviewData);
      setTemporalData(temporalDataResult);
      setDetectionMetrics(detectionData);
      setHeatmapData(heatmapResult);
      setDemographics(demographicsData);
      setCameraStats(cameraData);
      setPerformance(performanceData);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Error al cargar las estadísticas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadTemporalData = async () => {
    try {
      const data = await getTemporalAnalysis(temporalPeriod);
      setTemporalData(data);
    } catch (err) {
      console.error('Error loading temporal data:', err);
    }
  };

  const handleRefresh = () => {
    loadAllStatistics();
  };

  const handlePeriodChange = (newPeriod) => {
    setTemporalPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className="statistics-dashboard">
        <div className="statistics-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-dashboard">
        <div className="statistics-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-dashboard">
      {/* Header */}
      <div className="statistics-header">
        <div className="header-content">
          <h1>📊 Dashboard de Estadísticas Avanzado</h1>
          <p>Análisis completo del sistema FaceFind</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Actualizar
          </button>
          <button 
            onClick={() => setShowExportModal(true)} 
            className="export-button"
          >
            📥 Exportar Reporte
          </button>
        </div>
      </div>

      {/* Métricas Principales */}
      <section className="statistics-section">
        <h2>Métricas Principales</h2>
        <div className="metrics-grid">
          <StatisticsMetricCard
            title="Casos Totales"
            value={overview?.summary?.total_cases || 0}
            icon="📁"
            color="blue"
            subtitle="Total de casos registrados"
          />
          <StatisticsMetricCard
            title="Casos Activos"
            value={overview?.summary?.active_cases || 0}
            icon="🔍"
            color="orange"
            subtitle="En investigación"
          />
          <StatisticsMetricCard
            title="Casos Resueltos"
            value={overview?.summary?.resolved_cases || 0}
            icon="✅"
            color="green"
            subtitle={`Tasa: ${overview?.summary?.resolution_rate || 0}%`}
          />
          <StatisticsMetricCard
            title="Casos Pendientes"
            value={overview?.summary?.pending_cases || 0}
            icon="⏳"
            color="yellow"
            subtitle="Esperando revisión"
          />
          <StatisticsMetricCard
            title="Usuarios Activos"
            value={overview?.summary?.active_users || 0}
            icon="👥"
            color="purple"
            subtitle={`Total: ${overview?.summary?.total_users || 0}`}
          />
          <StatisticsMetricCard
            title="Tasa de Detección"
            value={`${detectionMetrics?.detection_rate || 0}%`}
            icon="🎯"
            color="cyan"
            subtitle={`${detectionMetrics?.total_detections || 0} detecciones`}
          />
        </div>
      </section>

      {/* Análisis Temporal */}
      <section className="statistics-section">
        <div className="section-header">
          <h2>Análisis Temporal</h2>
          <div className="period-selector">
            <button 
              className={temporalPeriod === 'day' ? 'active' : ''}
              onClick={() => handlePeriodChange('day')}
            >
              Día
            </button>
            <button 
              className={temporalPeriod === 'week' ? 'active' : ''}
              onClick={() => handlePeriodChange('week')}
            >
              Semana
            </button>
            <button 
              className={temporalPeriod === 'month' ? 'active' : ''}
              onClick={() => handlePeriodChange('month')}
            >
              Mes
            </button>
          </div>
        </div>
        <TemporalChart data={temporalData} period={temporalPeriod} />
      </section>

      {/* Métricas de Detección y Demográficas */}
      <div className="statistics-row">
        <section className="statistics-section half-width">
          <h2>Métricas de Detección</h2>
          <DetectionMetricsCard metrics={detectionMetrics} />
        </section>
        <section className="statistics-section half-width">
          <h2>Distribución Demográfica</h2>
          <DemographicsChart data={demographics} />
        </section>
      </div>

      {/* Mapa de Calor */}
      <section className="statistics-section">
        <h2>Mapa de Calor de Detecciones</h2>
        <HeatmapCard data={heatmapData} />
      </section>

      {/* Estadísticas por Cámara */}
      <section className="statistics-section">
        <h2>Estadísticas por Cámara</h2>
        <CameraStatsTable cameras={cameraStats} />
      </section>

      {/* Métricas de Rendimiento */}
      <section className="statistics-section">
        <h2>Métricas de Rendimiento del Sistema</h2>
        <PerformanceMetrics data={performance} />
      </section>

      {/* Modal de Exportación */}
      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          overview={overview}
        />
      )}
    </div>
  );
};

export default StatisticsDashboard;
