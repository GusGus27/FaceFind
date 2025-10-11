import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/views/StatisticsPage.css";

export default function StatisticsPage() {
  return (
    <>
      <Header />
      <div className="statistics-page">
        <div className="statistics-container">
          {/* Hero */}
          <section className="stats-hero">
            <h1 className="stats-title">
              Estadísticas del <span className="highlight">Sistema</span>
            </h1>
            <p className="stats-subtitle">
              Impacto y rendimiento de FaceFind en tiempo real
            </p>
          </section>

          {/* Main Stats Cards */}
          <section className="main-stats-section">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-number">1,247</div>
                  <div className="stat-label">Casos Registrados</div>
                  <div className="stat-trend positive">
                    <span className="trend-icon">↑</span>
                    <span className="trend-text">+15% este mes</span>
                  </div>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-number">892</div>
                  <div className="stat-label">Personas Encontradas</div>
                  <div className="stat-trend positive">
                    <span className="trend-icon">↑</span>
                    <span className="trend-text">+23% este mes</span>
                  </div>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">🔍</div>
                <div className="stat-content">
                  <div className="stat-number">355</div>
                  <div className="stat-label">Búsquedas Activas</div>
                  <div className="stat-trend neutral">
                    <span className="trend-icon">−</span>
                    <span className="trend-text">-8% este mes</span>
                  </div>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">📹</div>
                <div className="stat-content">
                  <div className="stat-number">486</div>
                  <div className="stat-label">Cámaras Activas</div>
                  <div className="stat-trend positive">
                    <span className="trend-icon">↑</span>
                    <span className="trend-text">+12 nuevas</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Success Rate */}
          <section className="success-section">
            <div className="success-card">
              <h2>Tasa de Éxito del Sistema</h2>
              <div className="success-content">
                <div className="success-chart">
                  <div className="circular-progress">
                    <svg viewBox="0 0 200 200">
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="#e5e7f0"
                        strokeWidth="20"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="20"
                        strokeDasharray="534"
                        strokeDashoffset="80"
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6f3be0" />
                          <stop offset="100%" stopColor="#7f4ae8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="progress-text">
                      <div className="progress-number">71.5%</div>
                      <div className="progress-label">Encontrados</div>
                    </div>
                  </div>
                </div>
                <div className="success-details">
                  <div className="detail-item">
                    <div className="detail-icon">📊</div>
                    <div className="detail-content">
                      <div className="detail-number">892 / 1,247</div>
                      <div className="detail-label">Casos Resueltos vs Total</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">⏱️</div>
                    <div className="detail-content">
                      <div className="detail-number">2.8 días</div>
                      <div className="detail-label">Tiempo Promedio de Localización</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-icon">🎯</div>
                    <div className="detail-content">
                      <div className="detail-number">95.3%</div>
                      <div className="detail-label">Precisión del Sistema</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Cases by Status */}
          <section className="status-section">
            <h2 className="section-title">Distribución de Casos por Estado</h2>
            <div className="status-grid">
              <div className="status-item activo">
                <div className="status-bar">
                  <div className="status-fill" style={{ width: '28.5%' }}></div>
                </div>
                <div className="status-info">
                  <div className="status-label">
                    <span className="status-dot activo-dot"></span>
                    Activos / En Búsqueda
                  </div>
                  <div className="status-number">355 casos (28.5%)</div>
                </div>
              </div>

              <div className="status-item resuelto">
                <div className="status-bar">
                  <div className="status-fill" style={{ width: '71.5%' }}></div>
                </div>
                <div className="status-info">
                  <div className="status-label">
                    <span className="status-dot resuelto-dot"></span>
                    Resueltos / Encontrados
                  </div>
                  <div className="status-number">892 casos (71.5%)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Activity */}
          <section className="activity-section">
            <h2 className="section-title">Actividad Mensual</h2>
            <div className="activity-chart">
              <div className="chart-bars">
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '65%' }}>
                      <div className="bar-value">78</div>
                    </div>
                  </div>
                  <div className="bar-label">Ene</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '72%' }}>
                      <div className="bar-value">86</div>
                    </div>
                  </div>
                  <div className="bar-label">Feb</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '85%' }}>
                      <div className="bar-value">102</div>
                    </div>
                  </div>
                  <div className="bar-label">Mar</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '78%' }}>
                      <div className="bar-value">94</div>
                    </div>
                  </div>
                  <div className="bar-label">Abr</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '90%' }}>
                      <div className="bar-value">108</div>
                    </div>
                  </div>
                  <div className="bar-label">May</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '95%' }}>
                      <div className="bar-value">114</div>
                    </div>
                  </div>
                  <div className="bar-label">Jun</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '88%' }}>
                      <div className="bar-value">106</div>
                    </div>
                  </div>
                  <div className="bar-label">Jul</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '92%' }}>
                      <div className="bar-value">110</div>
                    </div>
                  </div>
                  <div className="bar-label">Ago</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar" style={{ height: '98%' }}>
                      <div className="bar-value">118</div>
                    </div>
                  </div>
                  <div className="bar-label">Sep</div>
                </div>
                <div className="bar-item">
                  <div className="bar-container">
                    <div className="bar active" style={{ height: '100%' }}>
                      <div className="bar-value">120</div>
                    </div>
                  </div>
                  <div className="bar-label">Oct</div>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color"></div>
                  <span>Casos Registrados por Mes</span>
                </div>
              </div>
            </div>
          </section>

          {/* System Performance */}
          <section className="performance-section">
            <h2 className="section-title">Rendimiento del Sistema</h2>
            <div className="performance-grid">
              <div className="performance-card">
                <div className="perf-icon">⚡</div>
                <div className="perf-metric">
                  <div className="perf-number">&lt;2.5s</div>
                  <div className="perf-label">Tiempo de Respuesta</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-fill excellent" style={{ width: '92%' }}></div>
                </div>
                <div className="perf-status excellent-status">Excelente</div>
              </div>

              <div className="performance-card">
                <div className="perf-icon">🎯</div>
                <div className="perf-metric">
                  <div className="perf-number">95.3%</div>
                  <div className="perf-label">Precisión de Coincidencias</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-fill excellent" style={{ width: '95.3%' }}></div>
                </div>
                <div className="perf-status excellent-status">Excelente</div>
              </div>

              <div className="performance-card">
                <div className="perf-icon">📊</div>
                <div className="perf-metric">
                  <div className="perf-number">99.7%</div>
                  <div className="perf-label">Uptime del Sistema</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-fill excellent" style={{ width: '99.7%' }}></div>
                </div>
                <div className="perf-status excellent-status">Excelente</div>
              </div>

              <div className="performance-card">
                <div className="perf-icon">🔔</div>
                <div className="perf-metric">
                  <div className="perf-number">8,542</div>
                  <div className="perf-label">Alertas Generadas</div>
                </div>
                <div className="perf-bar">
                  <div className="perf-fill good" style={{ width: '85%' }}></div>
                </div>
                <div className="perf-status good-status">Muy Bueno</div>
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="info-cards-section">
            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-icon">🌍</div>
                <h3>Cobertura Geográfica</h3>
                <p>El sistema cubre 12 distritos principales de Lima Metropolitana con una red integrada de cámaras de seguridad.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">🤝</div>
                <h3>Colaboración Institucional</h3>
                <p>Trabajamos en conjunto con comisarías, municipalidades y organismos de seguridad ciudadana.</p>
              </div>

              <div className="info-card">
                <div className="info-icon">🔒</div>
                <h3>Privacidad y Seguridad</h3>
                <p>Todos los datos son encriptados y manejados siguiendo estándares internacionales de protección de información.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

