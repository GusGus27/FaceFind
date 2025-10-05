import React from 'react';
import '../../styles/MetricCard.css';

const MetricCard = ({ title, value, icon, trend, trendPositive }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className={`metric-trend ${trendPositive ? 'positive' : 'negative'}`}>
          {trend}
        </span>
      </div>
      <div className="metric-body">
        <h3 className="metric-title">{title}</h3>
        <p className="metric-value">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default MetricCard;
