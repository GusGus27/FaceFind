/**
 * ExportModal - Modal para exportar reportes con filtros
 */
import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, X, Filter } from 'lucide-react';
import { exportarExcel, exportarCSV, obtenerFiltros } from '../../services/reportService';
import './ExportModal.css';

const ExportModal = ({ isOpen, onClose }) => {
  const [formato, setFormato] = useState('excel');
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    usuario_id: '',
    camara_id: ''
  });
  const [filtrosDisponibles, setFiltrosDisponibles] = useState({
    estados: [],
    usuarios: [],
    camaras: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarFiltrosDisponibles();
      // Establecer fecha fin como hoy y fecha inicio como 30 días atrás
      const hoy = new Date();
      const hace30dias = new Date();
      hace30dias.setDate(hace30dias.getDate() - 30);
      
      setFiltros({
        fecha_inicio: hace30dias.toISOString().split('T')[0],
        fecha_fin: hoy.toISOString().split('T')[0],
        estado: '',
        usuario_id: '',
        camara_id: ''
      });
    }
  }, [isOpen]);

  const cargarFiltrosDisponibles = async () => {
    try {
      const data = await obtenerFiltros();
      setFiltrosDisponibles(data);
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar filtros (convertir fechas a ISO string completo)
      const filtrosExport = {
        ...filtros,
        fecha_inicio: filtros.fecha_inicio ? `${filtros.fecha_inicio}T00:00:00` : undefined,
        fecha_fin: filtros.fecha_fin ? `${filtros.fecha_fin}T23:59:59` : undefined,
        usuario_id: filtros.usuario_id || undefined,
        camara_id: filtros.camara_id || undefined,
        estado: filtros.estado || undefined
      };

      if (formato === 'excel') {
        await exportarExcel(filtrosExport);
      } else {
        await exportarCSV(filtrosExport);
      }

      // Cerrar modal después de exportar
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError('Error al exportar el reporte. Por favor, intenta de nuevo.');
      console.error('Error exportando:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    const hoy = new Date();
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);
    
    setFiltros({
      fecha_inicio: hace30dias.toISOString().split('T')[0],
      fecha_fin: hoy.toISOString().split('T')[0],
      estado: '',
      usuario_id: '',
      camara_id: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="export-modal-overlay" onClick={onClose}>
      <div className="export-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-modal-title">
            <Download size={24} />
            <h2>Exportar Reporte</h2>
          </div>
          <button className="export-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="export-modal-body">
          {error && (
            <div className="export-error-message">
              {error}
            </div>
          )}

          {/* Selección de formato */}
          <div className="export-section">
            <h3>Formato de Exportación</h3>
            <div className="export-format-options">
              <button
                className={`export-format-btn ${formato === 'excel' ? 'active' : ''}`}
                onClick={() => setFormato('excel')}
              >
                <FileSpreadsheet size={20} />
                <span>Excel (.xlsx)</span>
                <small>Con gráficos y estadísticas</small>
              </button>
              <button
                className={`export-format-btn ${formato === 'csv' ? 'active' : ''}`}
                onClick={() => setFormato('csv')}
              >
                <FileText size={20} />
                <span>CSV (.csv)</span>
                <small>Datos tabulares simples</small>
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="export-section">
            <div className="export-section-header">
              <h3>
                <Filter size={18} />
                Filtros
              </h3>
              <button className="export-clear-btn" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>

            <div className="export-filters-grid">
              {/* Rango de fechas */}
              <div className="export-filter-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={filtros.fecha_inicio}
                  onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                  className="export-input"
                />
              </div>

              <div className="export-filter-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={filtros.fecha_fin}
                  onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                  className="export-input"
                />
              </div>

              {/* Estado */}
              <div className="export-filter-group">
                <label>Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="export-input"
                >
                  <option value="">Todos los estados</option>
                  {filtrosDisponibles.estados.map(estado => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usuario */}
              <div className="export-filter-group">
                <label>Usuario</label>
                <select
                  value={filtros.usuario_id}
                  onChange={(e) => handleFiltroChange('usuario_id', e.target.value)}
                  className="export-input"
                >
                  <option value="">Todos los usuarios</option>
                  {filtrosDisponibles.usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cámara */}
              <div className="export-filter-group full-width">
                <label>Cámara</label>
                <select
                  value={filtros.camara_id}
                  onChange={(e) => handleFiltroChange('camara_id', e.target.value)}
                  className="export-input"
                >
                  <option value="">Todas las cámaras</option>
                  {filtrosDisponibles.camaras.map(camara => (
                    <option key={camara.id} value={camara.id}>
                      {camara.type} - {camara.ubicacion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="export-info-box">
            <h4>ℹ️ Información del Reporte</h4>
            <ul>
              <li>El reporte incluirá <strong>marca de agua institucional</strong></li>
              {formato === 'excel' && (
                <>
                  <li>Excel incluye <strong>gráficos estadísticos</strong> y formato profesional</li>
                  <li>Se generarán <strong>múltiples hojas</strong>: Alertas, Estadísticas y Gráficos</li>
                </>
              )}
              {formato === 'csv' && (
                <li>CSV es compatible con Excel y otras herramientas de análisis</li>
              )}
              <li>Los datos están <strong>filtrados</strong> según tu selección</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="export-modal-footer">
          <button className="export-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="export-btn-export"
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="export-spinner"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download size={18} />
                Exportar {formato === 'excel' ? 'Excel' : 'CSV'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
