// src/components/admin/SearchCases.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Filter, Loader2, AlertCircle } from 'lucide-react';
import '../../styles/admin/SearchCases.css';

export default function SearchCases({ onOpenCase = () => {} }) { // 

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
    const mockSuggestions = [
      'María González Pérez','María Rodríguez López','María Carmen Silva','Mario Alberto Sánchez','Mariana Torres González'
    ].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    setSuggestions(mockSuggestions.slice(0, 5));
    setShowSuggestions(true);
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true); setError(null); setShowSuggestions(false);
    const start = Date.now();
    try {
      await new Promise(r => setTimeout(r, 500)); // sim
      const mockResults = generateMockResults(searchQuery).filter(c => (estado ? c.estado === estado : true));
      setResults(mockResults);
      setTotalResults(mockResults.length);
      setQueryTime(Date.now() - start);
      saveRecentSearch(searchQuery, searchType);
    } catch (err) {
      setError('Error al realizar la búsqueda. Por favor, intenta nuevamente.');
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const generateMockResults = (searchQuery) => {
    const mockData = [
      { num_caso:'CASO-2025-001', dni:'12345678', nombre:'María González Pérez', edad:25, estado:'Activo',
        fecha_registro:'2025-09-15T10:00:00', fecha_desaparicion:'2025-09-10T08:00:00',
        ultima_ubicacion:'Lima, Perú - Av. Arequipa 1234',
        caracteristicas_fisicas:'Estatura media (1.65m), cabello castaño largo, ojos marrones',
        usuario_nombre:'Juan Pérez', usuario_email:'juan.perez@facefind.com', score:9.5 },
      { num_caso:'CASO-2025-002', dni:'87654321', nombre:'María Rodríguez López', edad:32, estado:'Pendiente',
        fecha_registro:'2025-09-10T14:30:00', fecha_desaparicion:'2025-09-05T20:00:00',
        ultima_ubicacion:'Callao, Perú - Jr. Lima 567',
        caracteristicas_fisicas:'Estatura baja (1.58m), cabello negro corto, ojos negros',
        usuario_nombre:'Ana Torres', usuario_email:'ana.torres@facefind.com', score:8.2 },
      { num_caso:'CASO-2025-003', dni:'45678912', nombre:'Carmen Silva Vásquez', edad:19, estado:'Activo',
        fecha_registro:'2025-09-20T09:00:00', fecha_desaparicion:'2025-09-18T15:30:00',
        ultima_ubicacion:'San Juan de Lurigancho - Av. Próceres 890',
        caracteristicas_fisicas:'Estatura alta (1.70m), cabello rubio teñido, ojos verdes',
        usuario_nombre:'Roberto Díaz', usuario_email:'roberto.diaz@facefind.com', score:7.8 },
    ];
    return mockData.filter(c =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dni.includes(searchQuery) ||
      c.num_caso.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
