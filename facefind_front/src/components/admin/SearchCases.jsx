// src/components/admin/SearchCases.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Filter, Loader2, AlertCircle } from 'lucide-react';
import { searchCasos } from '../../services/casoService';
import '../../styles/admin/SearchCases.css';

export default function SearchCases({ onOpenCase = () => {} }) { 

  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('general');
  const [estado, setEstado] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [totalResults, setTotalResults] = useState(0);
  const [queryTime, setQueryTime] = useState(0);
  const [error, setError] = useState(null);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => fetchAutocomplete(query), 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]); setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAutocomplete = async (searchQuery) => {
    try {
      const casosData = await searchCasos(searchQuery);
      const names = casosData
        .map(c => c.PersonaDesaparecida?.nombre_completo)
        .filter(Boolean)
        .slice(0, 5);
      setSuggestions(names);
      setShowSuggestions(names.length > 0);
    } catch (error) {
      console.error('Error en autocompletar:', error);
    }
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }
    
    setIsLoading(true); setError(null); setShowSuggestions(false);
    const start = Date.now();
    try {
      console.log('🔍 Buscando:', searchQuery);
      const casosData = await searchCasos(searchQuery);
      console.log('📦 Datos recibidos:', casosData);
      
      if (!casosData || !Array.isArray(casosData)) {
        console.warn('⚠️ Respuesta inválida del servidor');
        setResults([]);
        setTotalResults(0);
        setQueryTime(Date.now() - start);
        return;
      }
      
      // Filtrar por estado si está seleccionado
      const filtered = estado 
        ? casosData.filter(c => c.estado === estado) 
        : casosData;
      
      console.log('🔎 Casos filtrados:', filtered.length);
      
      // Mapear datos para la UI
      const mappedResults = filtered.map(caso => ({
        num_caso: `CASO-2025-${caso.id}`,
        dni: caso.PersonaDesaparecida?.dni || 'N/A',
        nombre: caso.PersonaDesaparecida?.nombre_completo || 'Sin nombre',
        edad: caso.PersonaDesaparecida?.age || 'N/A',
        estado: caso.status || 'Activo',
        fecha_registro: caso.created_at,
        fecha_desaparicion: caso.fecha_desaparicion,
        ultima_ubicacion: caso.lugar_desaparicion || 'No especificado',
        caracteristicas_fisicas: caso.PersonaDesaparecida?.senas_particulares || 'No especificado',
        usuario_nombre: caso.Usuario?.nombre || 'N/A',
        usuario_email: caso.Usuario?.email || 'N/A',
        id: caso.id,
        score: 9.0 // Placeholder - implementar scoring real después
      }));

      console.log('✅ Resultados mapeados:', mappedResults);
      setResults(mappedResults);
      setTotalResults(mappedResults.length);
      setQueryTime(Date.now() - start);
      
      if (mappedResults.length === 0) {
        setError('No se encontraron resultados para tu búsqueda');
      } else {
        saveRecentSearch(searchQuery, searchType);
      }
    } catch (err) {
      setError(`Error al realizar la búsqueda: ${err.message || 'Intenta nuevamente'}`);
      console.error('❌ Error en búsqueda:', err);
      setResults([]);
      setTotalResults(0);
    } finally { setIsLoading(false); }
  };

  const saveRecentSearch = (searchQuery, type) => {
    const updated = [{ query: searchQuery, type, timestamp: new Date().toISOString() },
      ...recentSearches.filter(s => s.query !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) { if (e.key === 'Enter') handleSearch(); return; }
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions.length > 0) {
        setQuery(suggestions[selectedIndex]); setShowSuggestions(false); setSelectedIndex(-1);
        handleSearch(suggestions[selectedIndex]);
      } else { handleSearch(); }
    } else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(p => (p < suggestions.length - 1 ? p + 1 : p)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(p => (p > 0 ? p - 1 : -1)); }
      else if (e.key === 'Escape') { setShowSuggestions(false); setSelectedIndex(-1); }
  };

  const clearSearch = () => {
    setQuery(''); setResults([]); setSuggestions([]); setShowSuggestions(false); setError(null);
    searchInputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]); localStorage.removeItem('recentSearches');
  };

  const getEstadoBadgeClass = (estado) =>
    ({ 'Activo':'badge-active','Pendiente':'badge-pending','Resuelto':'badge-resolved','Cancelado':'badge-cancelled' }[estado] || 'badge-default');

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const highlightText = (text, q) => {
    if (!q) return text;
    const parts = String(text).split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => part.toLowerCase() === q.toLowerCase() ? <mark key={i}>{part}</mark> : part);
  };

  // ✅ Sin rutas: delega la acción al padre
  const openCase = (caso) => onOpenCase(caso);

  return (
    <div className="search-page">
      <div className="search-container">
        <header className="search-header">
          <h1>Búsqueda de Casos</h1>
          <p>Busca casos por nombre, DNI o número de caso</p>
        </header>

        <div className="search-box">
          <div className="search-input-wrapper">
            <div className="search-input-container">
              <Search className="search-icon" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Buscar por nombre, DNI o número de caso..."
                className="search-input"
              />
              {query && (
                <button onClick={clearSearch} className="clear-button">
                  <X size={18} />
                </button>
              )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="suggestions-dropdown">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => { setQuery(s); setShowSuggestions(false); handleSearch(s); }}
                    className={`suggestion-item ${i === selectedIndex ? 'selected' : ''}`}
                  >
                    <Search size={16} />
                    <span>{highlightText(s, query)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => handleSearch()} disabled={!query.trim() || isLoading} className="search-button">
            {isLoading ? (<><Loader2 className="spinner" size={18} />Buscando...</>) : 'Buscar'}
          </button>

          <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-grid">
              <div className="filter-group">
                <label>Tipo de búsqueda</label>
                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="filter-select">
                  <option value="general">Búsqueda general</option>
                  <option value="nombre">Por nombre</option>
                  <option value="dni">Por DNI</option>
                  <option value="num_caso">Por número de caso</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Estado del caso</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)} className="filter-select">
                  <option value="">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <span className="results-count">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
              </span>
              <span className="results-time">Tiempo: {queryTime}ms</span>
            </div>

            <div className="results-list">
              {results.map((caso, index) => (
                <div key={index} className="result-card" onDoubleClick={() => openCase(caso)}>
                  <div className="result-header">
                    <div className="result-title-section">
                      <h3 className="result-title">{highlightText(caso.nombre, query)}</h3>
                      <span className={`badge ${getEstadoBadgeClass(caso.estado)}`}>{caso.estado}</span>
                    </div>
                    <div className="result-meta">
                      <div className="result-score">Score: {caso.score.toFixed(1)}</div>
                      <div className="result-date">{formatDate(caso.fecha_registro)}</div>
                    </div>
                  </div>

                  <div className="result-info">
                    <p className="case-number">Caso #{caso.num_caso} • DNI: {caso.dni}</p>
                  </div>

                  <div className="result-details">
                    <div className="detail-row"><span className="detail-label">Edad:</span><span className="detail-value">{caso.edad} años</span></div>
                    <div className="detail-row"><span className="detail-label">Última ubicación:</span><span className="detail-value">{caso.ultima_ubicacion}</span></div>
                    <div className="detail-row"><span className="detail-label">Fecha desaparición:</span><span className="detail-value">{formatDate(caso.fecha_desaparicion)}</span></div>
                  </div>

                  {caso.caracteristicas_fisicas && (
                    <div className="result-characteristics">
                      <span className="detail-label">Características:</span>
                      <p>{caso.caracteristicas_fisicas}</p>
                    </div>
                  )}

                  <div className="result-footer">
                    <span className="registered-by">Registrado por: {caso.usuario_nombre}</span>
                    <button className="view-details-button" onClick={() => openCase(caso)}>Ver detalles</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && query && results.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon"><Search size={48} /></div>
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          </div>
        )}

        {isLoading && (
          <div className="loading-state">
            <Loader2 className="spinner-large" size={48} />
            <p>Buscando casos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
