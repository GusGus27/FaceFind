import React, { useState } from 'react';
import { exportReportPDF, exportReportExcel } from '../../services/statisticsService';
import '../../styles/admin/ExportReportModal.css';

const ExportReportModal = ({ onClose, overview }) => {
  const [exportType, setExportType] = useState('pdf');
  const [reportType, setReportType] = useState('complete');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage('');

      let blob;
      let filename;

      switch (exportType) {
        case 'pdf':
          blob = await exportReportPDF(reportType);
          filename = `reporte_facefind_${reportType}_${new Date().getTime()}.pdf`;
          break;
        case 'excel':
          blob = await exportReportExcel(reportType);
          filename = `reporte_facefind_${reportType}_${new Date().getTime()}.xlsx`;
          break;
        default:
          throw new Error('Tipo de exportación no válido');
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('✅ Reporte exportado exitosamente');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error exporting report:', error);
      setMessage(`❌ ${error.message || 'Error al exportar el reporte'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Exportar Reporte</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="export-option">
            <label>Formato de Exportación</label>
            <div className="export-types">
              <button
                className={`type-button ${exportType === 'pdf' ? 'active' : ''}`}
                onClick={() => setExportType('pdf')}
              >
                📄 PDF
              </button>
              <button
                className={`type-button ${exportType === 'excel' ? 'active' : ''}`}
                onClick={() => setExportType('excel')}
              >
                📊 Excel
              </button>
            </div>
          </div>

          {exportType !== 'csv' && (
            <div className="export-option">
              <label>Tipo de Reporte</label>
              <div className="report-types">
                <label className="radio-option">
                  <input
                    type="radio"
                    value="dashboard"
                    checked={reportType === 'dashboard'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Dashboard - Resumen Ejecutivo</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    value="complete"
                    checked={reportType === 'complete'}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>Completo - Todas las Métricas</span>
                </label>
              </div>
            </div>
          )}

          {overview && (
            <div className="export-preview">
              <h4>Vista Previa del Reporte</h4>
              <div className="preview-stats">
                <div className="preview-stat">
                  <span>Casos Totales:</span>
                  <strong>{overview.summary?.total_cases || 0}</strong>
                </div>
                <div className="preview-stat">
                  <span>Casos Resueltos:</span>
                  <strong>{overview.summary?.resolved_cases || 0}</strong>
                </div>
                <div className="preview-stat">
                  <span>Usuarios Activos:</span>
                  <strong>{overview.summary?.active_users || 0}</strong>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`export-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={exporting}>
            Cancelar
          </button>
          <button 
            className="export-button" 
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? '⏳ Exportando...' : '📥 Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
