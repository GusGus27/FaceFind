import React, { useState } from 'react';
import '../../styles/common/ExportReport.css';

const ExportReport = ({ notifications, filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatDateForExport = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Definir encabezados
      const headers = [
        'ID',
        'Fecha y Hora',
        'Asunto',
        'Contenido',
        'Prioridad',
        'Estado',
        'Confianza (%)',
        'Caso #',
        'Persona',
        'Cámara',
        'Ubicación',
        'Leída',
        'Fecha Lectura'
      ];

      // Preparar datos
      const rows = notifications.map(n => {
        const alerta = n.alerta || {};
        const caso = alerta.caso || {};
        const persona = caso.persona_desaparecida || {};
        const camara = alerta.camara || {};
        const confidence = alerta.similitud ? Math.round(alerta.similitud * 100) : '';

        return [
          n.id,
          formatDateForExport(n.creada_en),
          `"${(n.asunto || '').replace(/"/g, '""')}"`,
          `"${(n.contenido || '').replace(/"/g, '""')}"`,
          n.prioridad || '',
          alerta.estado || '',
          confidence,
          caso.num_caso || '',
          `"${(persona.nombre || '').replace(/"/g, '""')}"`,
          `"${(camara.nombre || '').replace(/"/g, '""')}"`,
          `"${(alerta.ubicacion || '').replace(/"/g, '""')}"`,
          n.leida_en ? 'Sí' : 'No',
          n.leida_en ? formatDateForExport(n.leida_en) : ''
        ];
      });

      // Construir CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `notificaciones_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Error exportando a CSV:', error);
      alert('Error al exportar el reporte en CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      // Preparar datos JSON
      const jsonData = {
        fecha_exportacion: new Date().toISOString(),
        filtros_aplicados: filters,
        total_notificaciones: notifications.length,
        notificaciones: notifications.map(n => ({
          id: n.id,
          fecha_hora: n.creada_en,
          asunto: n.asunto,
          contenido: n.contenido,
          prioridad: n.prioridad,
          leida: !!n.leida_en,
          fecha_lectura: n.leida_en,
          alerta: n.alerta ? {
            id: n.alerta.id,
            timestamp: n.alerta.timestamp,
            similitud: n.alerta.similitud,
            estado: n.alerta.estado,
            ubicacion: n.alerta.ubicacion,
            imagen_url: n.alerta.imagen_url,
            caso: n.alerta.caso ? {
              num_caso: n.alerta.caso.num_caso,
              persona: n.alerta.caso.persona_desaparecida?.nombre
            } : null,
            camara: n.alerta.camara ? {
              nombre: n.alerta.camara.nombre,
              tipo: n.alerta.camara.tipo
            } : null
          } : null
        }))
      };

      // Crear y descargar archivo
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `notificaciones_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Error exportando a JSON:', error);
      alert('Error al exportar el reporte en JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToHTML = () => {
    setIsExporting(true);
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Notificaciones - FaceFind</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .notification {
            background: white;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 4px solid #ccc;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .notification.priority-ALTA {
            border-left-color: #dc3545;
        }
        .notification.priority-MEDIA {
            border-left-color: #ffc107;
        }
        .notification.priority-BAJA {
            border-left-color: #17a2b8;
        }
        .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .notification-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }
        .notification-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        .meta-item {
            display: flex;
            align-items: center;
            font-size: 14px;
        }
        .meta-item strong {
            margin-right: 5px;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge-priority {
            background: #f0f0f0;
        }
        .badge-priority.ALTA {
            background: #dc3545;
            color: white;
        }
        .badge-priority.MEDIA {
            background: #ffc107;
            color: #333;
        }
        .badge-priority.BAJA {
            background: #17a2b8;
            color: white;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 14px;
        }
        @media print {
            body {
                background: white;
            }
            .notification {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Reporte de Notificaciones</h1>
        <p><strong>Sistema FaceFind</strong></p>
        <p>Fecha de generación: ${formatDateForExport(new Date().toISOString())}</p>
        <p>Total de notificaciones: ${notifications.length}</p>
    </div>

    <div class="stats">
        <div class="stat-card">
            <h3>🚨 Prioridad Alta</h3>
            <div class="value">${notifications.filter(n => n.prioridad === 'ALTA').length}</div>
        </div>
        <div class="stat-card">
            <h3>⚠️ Prioridad Media</h3>
            <div class="value">${notifications.filter(n => n.prioridad === 'MEDIA').length}</div>
        </div>
        <div class="stat-card">
            <h3>ℹ️ Prioridad Baja</h3>
            <div class="value">${notifications.filter(n => n.prioridad === 'BAJA').length}</div>
        </div>
        <div class="stat-card">
            <h3>📬 No Leídas</h3>
            <div class="value">${notifications.filter(n => !n.leida_en).length}</div>
        </div>
    </div>

    ${notifications.map(n => {
      const alerta = n.alerta || {};
      const caso = alerta.caso || {};
      const persona = caso.persona_desaparecida || {};
      const camara = alerta.camara || {};
      const confidence = alerta.similitud ? Math.round(alerta.similitud * 100) : null;

      return `
    <div class="notification priority-${n.prioridad || 'NORMAL'}">
        <div class="notification-header">
            <h3 class="notification-title">${n.asunto || 'Notificación'}</h3>
            <span class="badge badge-priority ${n.prioridad || ''}">${n.prioridad || 'NORMAL'}</span>
        </div>
        <p>${n.contenido || ''}</p>
        <div class="notification-meta">
            <div class="meta-item">
                <strong>🕒 Fecha:</strong> ${formatDateForExport(n.creada_en)}
            </div>
            ${confidence ? `
            <div class="meta-item">
                <strong>📊 Confianza:</strong> ${confidence}%
            </div>
            ` : ''}
            ${caso.num_caso ? `
            <div class="meta-item">
                <strong>📁 Caso:</strong> #${caso.num_caso}
            </div>
            ` : ''}
            ${persona.nombre ? `
            <div class="meta-item">
                <strong>👤 Persona:</strong> ${persona.nombre}
            </div>
            ` : ''}
            ${camara.nombre ? `
            <div class="meta-item">
                <strong>📹 Cámara:</strong> ${camara.nombre}
            </div>
            ` : ''}
            ${alerta.ubicacion ? `
            <div class="meta-item">
                <strong>📍 Ubicación:</strong> ${alerta.ubicacion}
            </div>
            ` : ''}
            <div class="meta-item">
                <strong>✓ Leída:</strong> ${n.leida_en ? 'Sí' : 'No'}
            </div>
        </div>
    </div>
      `;
    }).join('')}

    <div class="footer">
        <p>Generado por <strong>FaceFind</strong> - Sistema de Reconocimiento Facial</p>
        <p>${new Date().getFullYear()} - Todos los derechos reservados</p>
    </div>
</body>
</html>
      `;

      // Crear y descargar archivo
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `notificaciones_${new Date().toISOString().split('T')[0]}.html`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowMenu(false);
    } catch (error) {
      console.error('Error exportando a HTML:', error);
      alert('Error al exportar el reporte en HTML');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-report">
      <button 
        className="btn-export"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || notifications.length === 0}
      >
        <span className="btn-icon">📥</span>
        {isExporting ? 'Exportando...' : 'Exportar Reporte'}
      </button>

      {showMenu && (
        <div className="export-menu">
          <div className="menu-header">
            <h4>Exportar como:</h4>
            <button 
              className="close-menu"
              onClick={() => setShowMenu(false)}
            >
              ✕
            </button>
          </div>

          <div className="menu-options">
            <button 
              className="export-option"
              onClick={exportToCSV}
              disabled={isExporting}
            >
              <span className="option-icon">📊</span>
              <div className="option-content">
                <strong>CSV</strong>
                <span>Excel, Google Sheets</span>
              </div>
            </button>

            <button 
              className="export-option"
              onClick={exportToJSON}
              disabled={isExporting}
            >
              <span className="option-icon">📄</span>
              <div className="option-content">
                <strong>JSON</strong>
                <span>Datos estructurados</span>
              </div>
            </button>

            <button 
              className="export-option"
              onClick={exportToHTML}
              disabled={isExporting}
            >
              <span className="option-icon">🌐</span>
              <div className="option-content">
                <strong>HTML</strong>
                <span>Reporte web imprimible</span>
              </div>
            </button>
          </div>

          <div className="menu-footer">
            <p className="export-info">
              {notifications.length} notificación{notifications.length !== 1 ? 'es' : ''} para exportar
            </p>
          </div>
        </div>
      )}

      {showMenu && (
        <div 
          className="export-overlay"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default ExportReport;
