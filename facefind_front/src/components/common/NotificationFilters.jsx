import React, { useState, useEffect } from 'react';
import '../../styles/common/NotificationFilters.css';

const NotificationFilters = ({ onFilterChange, totalCount, cameras, cases }) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    prioridad: 'all',
    estado: 'all',
    casoId: 'all',
    camaraId: 'all',
    fechaInicio: '',
    fechaFin: '',
    soloNoLeidas: false,
    ordenPor: 'fecha_desc' // fecha_desc, fecha_asc, prioridad, confianza
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Notificar cambios al componente padre
    onFilterChange(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    const resetFilters = {
      searchQuery: '',
      prioridad: 'all',
      estado: 'all',
      casoId: 'all',
      camaraId: 'all',
      fechaInicio: '',
      fechaFin: '',
      soloNoLeidas: false,
      ordenPor: 'fecha_desc'
    };
    setFilters(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.prioridad !== 'all') count++;
    if (filters.estado !== 'all') count++;
    if (filters.casoId !== 'all') count++;
    if (filters.camaraId !== 'all') count++;
    if (filters.fechaInicio) count++;
    if (filters.fechaFin) count++;
    if (filters.soloNoLeidas) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="notification-filters">
      {/* Barra de búsqueda y filtros rápidos */}
      <div className="filters-main">
        {/* Búsqueda */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por contenido, caso, ubicación..."
            value={filters.searchQuery}
            onChange={(e) => handleInputChange('searchQuery', e.target.value)}
            className="search-input"
          />
          {filters.searchQuery && (
            <button 
              className="clear-search"
              onClick={() => handleInputChange('searchQuery', '')}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="quick-filters">
          {/* Toggle no leídas */}
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={filters.soloNoLeidas}
              onChange={(e) => handleInputChange('soloNoLeidas', e.target.checked)}
            />
            <span className="toggle-label">
              📬 Solo no leídas
            </span>
          </label>

          {/* Prioridad */}
          <select
            value={filters.prioridad}
            onChange={(e) => handleInputChange('prioridad', e.target.value)}
            className="filter-select"
          >
            <option value="all">🔔 Todas las prioridades</option>
            <option value="ALTA">🚨 Alta</option>
            <option value="MEDIA">⚠️ Media</option>
            <option value="BAJA">ℹ️ Baja</option>
          </select>

          {/* Ordenar */}
          <select
            value={filters.ordenPor}
            onChange={(e) => handleInputChange('ordenPor', e.target.value)}
            className="filter-select"
          >
            <option value="fecha_desc">📅 Más recientes</option>
            <option value="fecha_asc">📅 Más antiguas</option>
            <option value="prioridad">🚨 Por prioridad</option>
            <option value="confianza">📊 Por confianza</option>
          </select>

          {/* Botón filtros avanzados */}
          <button 
            className={`btn-advanced ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="btn-icon">⚙️</span>
            Avanzados
            {activeFiltersCount > 0 && (
              <span className="filter-count">{activeFiltersCount}</span>
            )}
          </button>

          {/* Botón reset */}
          {activeFiltersCount > 0 && (
            <button 
              className="btn-reset"
              onClick={handleReset}
              title="Limpiar filtros"
            >
              <span className="btn-icon">🔄</span>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtros avanzados (colapsable) */}
      {showAdvanced && (
        <div className="filters-advanced">
          <h4 className="advanced-title">
            <span className="title-icon">⚙️</span>
            Filtros Avanzados
          </h4>

          <div className="advanced-grid">
            {/* Filtro por estado */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">🔍</span>
                Estado
              </label>
              <select
                value={filters.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                className="filter-select-full"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="REVISADA">Revisada</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="FALSO_POSITIVO">Falso Positivo</option>
              </select>
            </div>

            {/* Filtro por caso */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📁</span>
                Caso
              </label>
              <select
                value={filters.casoId}
                onChange={(e) => handleInputChange('casoId', e.target.value)}
                className="filter-select-full"
              >
                <option value="all">Todos los casos</option>
                {cases && cases.map(caso => (
                  <option key={caso.id} value={caso.id}>
                    Caso #{caso.num_caso} - {caso.persona_desaparecida?.nombre || 'Sin nombre'}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por cámara */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">📹</span>
                Cámara
              </label>
              <select
                value={filters.camaraId}
                onChange={(e) => handleInputChange('camaraId', e.target.value)}
                className="filter-select-full"
              >
                <option value="all">Todas las cámaras</option>
                {cameras && cameras.map(camera => (
                  <option key={camera.id} value={camera.id}>
                    {camera.nombre} ({camera.tipo})
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de fechas */}
            <div className="filter-group date-range">
              <label className="filter-label">
                <span className="label-icon">📆</span>
                Rango de Fechas
              </label>
              <div className="date-inputs">
                <div className="date-input-wrapper">
                  <label className="date-sublabel">Desde</label>
                  <input
                    type="date"
                    value={filters.fechaInicio}
                    onChange={(e) => handleInputChange('fechaInicio', e.target.value)}
                    className="date-input"
                    max={filters.fechaFin || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-wrapper">
                  <label className="date-sublabel">Hasta</label>
                  <input
                    type="date"
                    value={filters.fechaFin}
                    onChange={(e) => handleInputChange('fechaFin', e.target.value)}
                    className="date-input"
                    min={filters.fechaInicio}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Atajos de fecha */}
            <div className="filter-group">
              <label className="filter-label">
                <span className="label-icon">⚡</span>
                Atajos
              </label>
              <div className="date-shortcuts">
                <button
                  className="shortcut-btn"
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setFilters(prev => ({ ...prev, fechaInicio: today, fechaFin: today }));
                  }}
                >
                  Hoy
                </button>
                <button
                  className="shortcut-btn"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setFilters(prev => ({
                      ...prev,
                      fechaInicio: lastWeek.toISOString().split('T')[0],
                      fechaFin: today.toISOString().split('T')[0]
                    }));
                  }}
                >
                  Última semana
                </button>
                <button
                  className="shortcut-btn"
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    setFilters(prev => ({
                      ...prev,
                      fechaInicio: lastMonth.toISOString().split('T')[0],
                      fechaFin: today.toISOString().split('T')[0]
                    }));
                  }}
                >
                  Último mes
                </button>
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="filters-summary">
              <span className="summary-label">Filtros activos:</span>
              <div className="summary-tags">
                {filters.searchQuery && (
                  <span className="filter-tag">
                    🔍 "{filters.searchQuery}"
                    <button onClick={() => handleInputChange('searchQuery', '')}>✕</button>
                  </span>
                )}
                {filters.prioridad !== 'all' && (
                  <span className="filter-tag">
                    🚨 {filters.prioridad}
                    <button onClick={() => handleInputChange('prioridad', 'all')}>✕</button>
                  </span>
                )}
                {filters.estado !== 'all' && (
                  <span className="filter-tag">
                    🔍 {filters.estado}
                    <button onClick={() => handleInputChange('estado', 'all')}>✕</button>
                  </span>
                )}
                {filters.soloNoLeidas && (
                  <span className="filter-tag">
                    📬 No leídas
                    <button onClick={() => handleInputChange('soloNoLeidas', false)}>✕</button>
                  </span>
                )}
                {filters.fechaInicio && (
                  <span className="filter-tag">
                    📆 Desde {filters.fechaInicio}
                    <button onClick={() => handleInputChange('fechaInicio', '')}>✕</button>
                  </span>
                )}
                {filters.fechaFin && (
                  <span className="filter-tag">
                    📆 Hasta {filters.fechaFin}
                    <button onClick={() => handleInputChange('fechaFin', '')}>✕</button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de resultados */}
      <div className="filters-info">
        <span className="result-count">
          {totalCount} notificación{totalCount !== 1 ? 'es' : ''} encontrada{totalCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default NotificationFilters;
