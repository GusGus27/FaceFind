import React, { useState, useEffect } from 'react';
import '../styles/Statistics.css';

const Statistics = () => {
  const [counters, setCounters] = useState({
    casesResolved: 0,
    activeSearches: 0,
    registeredUsers: 0,
    successRate: 0
  });

  const finalValues = {
    casesResolved: 247,
    activeSearches: 1523,
    registeredUsers: 8934,
    successRate: 78
  };

  useEffect(() => {
    const duration = 2000; // 2 segundos para la animación
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        casesResolved: Math.floor(finalValues.casesResolved * progress),
        activeSearches: Math.floor(finalValues.activeSearches * progress),
        registeredUsers: Math.floor(finalValues.registeredUsers * progress),
        successRate: Math.floor(finalValues.successRate * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setCounters(finalValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      value: counters.casesResolved,
      label: 'Casos Resueltos',
      icon: '✓',
      color: '#10b981'
    },
    {
      value: counters.activeSearches,
      label: 'Búsquedas Activas',
      icon: '🔍',
      color: '#3b82f6'
    },
    {
      value: counters.registeredUsers,
      label: 'Usuarios Registrados',
      icon: '👥',
      color: '#8b5cf6'
    },
    {
      value: `${counters.successRate}%`,
      label: 'Tasa de Éxito',
      icon: '📊',
      color: '#f59e0b'
    }
  ];

  return (
    <section id="statistics" className="statistics">
      <div className="statistics-container">
        <h2 className="section-title">Nuestro Impacto</h2>
        <p className="statistics-intro">
          Estadísticas públicas que demuestran la efectividad de nuestra plataforma
        </p>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ '--accent-color': stat.color }}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="statistics-note">
          <p>
            * Estadísticas actualizadas mensualmente. Solo mostramos datos públicos 
            que no comprometen la privacidad de los usuarios ni la sensibilidad de los casos.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
