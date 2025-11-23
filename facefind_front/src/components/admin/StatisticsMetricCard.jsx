import React from 'react';
import '../../styles/admin/StatisticsMetricCard.css';

const StatisticsMetricCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className={`statistics-metric-card ${color}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3 className="metric-title">{title}</h3>
        <div className="metric-value">{value}</div>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatisticsMetricCard;
