import React from 'react';
import '../../styles/CaseStatusChart.css';

const CaseStatusChart = () => {
  const data = [
    { status: 'Activos', count: 89, percentage: 32, color: '#4CAF50' },
    { status: 'Resueltos', count: 156, percentage: 56, color: '#2196F3' },
    { status: 'Pendientes', count: 34, percentage: 12, color: '#FF9800' }
  ];

  return (
    <div className="case-status-chart">
      <h2>Estado de Casos</h2>
      <div className="chart-container">
        {data.map((item, index) => (
          <div key={index} className="chart-item">
            <div className="chart-bar-container">
              <div
                className="chart-bar"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }}
              >
                <span className="chart-percentage">{item.percentage}%</span>
              </div>
            </div>
            <div className="chart-label">
              <span className="chart-status">{item.status}</span>
              <span className="chart-count">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="chart-summary">
        <p>Total de casos: <strong>{data.reduce((sum, item) => sum + item.count, 0)}</strong></p>
      </div>
    </div>
  );
};

export default CaseStatusChart;
