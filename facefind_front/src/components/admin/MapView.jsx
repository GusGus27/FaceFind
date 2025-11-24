/**
 * MapView Component - Mapa interactivo de alertas
 * Historia de Usuario: Ver detecciones en un mapa interactivo
 * 
 * Funcionalidades:
 * - Mapa con ubicación de cámaras
 * - Marcadores de detecciones recientes
 * - Filtros por caso/fecha/cámara
 * - Línea temporal de movimientos
 * - Información en hover/click
 */
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import alertaService from '../../services/alertaService';
import { getAllCasos } from '../../services/casoService';
import { getFotosByCaso } from '../../services/fotoService';
import './MapView.css';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados para diferentes estados
const alertaIconoAltaPrioridad = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const alertaIconoMediaPrioridad = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const alertaIconoBajaPrioridad = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const alertaIconoRevisada = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const alertaIconoFalsoPositivo = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente auxiliar para ajustar vista del mapa
function FitBounds({ coordinates }) {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
}

const MapView = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal de revisión
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAlerta, setSelectedAlerta] = useState(null);
  const [fotosReferencia, setFotosReferencia] = useState([]);

  // Filtros
  const [filters, setFilters] = useState({
    caso_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    camara_id: '',
    mostrarTimeline: false
  });

  // Centro del mapa (Lima, Perú por defecto)
  const [mapCenter, setMapCenter] = useState([-12.046374, -77.042793]);
  const [mapZoom, setMapZoom] = useState(12);

  // Cargar casos disponibles
  useEffect(() => {
    const fetchCasos = async () => {
      try {
        const casosData = await getAllCasos();
        setCasos(casosData || []);
      } catch (error) {
        console.error('Error cargando casos:', error);
      }
    };

    fetchCasos();
  }, []);

  // Cargar alertas cuando cambien los filtros
  useEffect(() => {
    fetchAlertas();
  }, [filters]);

  const fetchAlertas = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construir filtros para API
      const apiFilters = {};
      if (filters.caso_id) apiFilters.caso_id = filters.caso_id;
      if (filters.camara_id) apiFilters.camara_id = filters.camara_id;
      if (filters.fecha_inicio) apiFilters.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) apiFilters.fecha_fin = filters.fecha_fin;

      // Obtener GeoJSON
      const geojson = await alertaService.getAlertasGeoJSON(apiFilters);
      setGeojsonData(geojson);

      // Si se solicita timeline y hay caso seleccionado, obtenerlo
      if (filters.mostrarTimeline && filters.caso_id) {
        const timeline = await alertaService.getTimeline(
          filters.caso_id,
          filters.fecha_inicio || null,
          filters.fecha_fin || null
        );
        setTimelineData(timeline.data);
      } else {
        setTimelineData(null);
      }

      // Ajustar centro del mapa si hay datos
      if (geojson && geojson.features && geojson.features.length > 0) {
        const firstFeature = geojson.features[0];
        const coords = firstFeature.geometry.coordinates;
        setMapCenter([coords[1], coords[0]]); // Leaflet usa [lat, lon]
      }

    } catch (error) {
      console.error('Error fetching alertas:', error);
      setError('Error cargando alertas del mapa');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMarcarRevisada = async (alertaId) => {
    try {
      await alertaService.marcarRevisada(alertaId);
      alert('Alerta marcada como revisada');
      setShowReviewModal(false);
      fetchAlertas(); // Recargar
    } catch (error) {
      console.error('Error marcando alerta:', error);
      alert('Error al marcar alerta');
    }
  };

  const handleMarcarFalsoPositivo = async (alertaId) => {
    try {
      await alertaService.marcarFalsoPositivo(alertaId);
      alert('Alerta marcada como falso positivo');
      setShowReviewModal(false);
      fetchAlertas(); // Recargar
    } catch (error) {
      console.error('Error marcando falso positivo:', error);
      alert('Error al marcar falso positivo');
    }
  };

  const handleOpenReviewModal = async (alerta) => {
    setSelectedAlerta(alerta);
    setShowReviewModal(true);
    
    // Cargar fotos de referencia del caso
    try {
      const fotos = await getFotosByCaso(alerta.caso_id);
      setFotosReferencia(fotos);
    } catch (error) {
      console.error('Error cargando fotos de referencia:', error);
      setFotosReferencia([]);
    }
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedAlerta(null);
    setFotosReferencia([]);
  };

  const getIconoSegunEstadoYPrioridad = (estado, prioridad) => {
    if (estado === 'REVISADA') return alertaIconoRevisada;
    if (estado === 'FALSO_POSITIVO') return alertaIconoFalsoPositivo;
    
    if (prioridad === 'ALTA') return alertaIconoAltaPrioridad;
    if (prioridad === 'MEDIA') return alertaIconoMediaPrioridad;
    return alertaIconoBajaPrioridad;
  };

  const formatFecha = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Coordenadas para la línea temporal (Polyline)
  const timelineCoordinates = timelineData?.timeline
    ? timelineData.timeline
        .filter(t => t.latitud && t.longitud)
        .map(t => [t.latitud, t.longitud])
    : [];

  return (
    <div className="map-view-container">
      <div className="map-header">
        <h2>🗺️ Mapa de Detecciones</h2>
        <p>Visualiza las alertas y patrones de movimiento en el mapa interactivo</p>
      </div>

      {/* Filtros */}
      <div className="map-filters">
        <div className="filter-group">
          <label htmlFor="caso_id">Caso:</label>
          <select
            id="caso_id"
            name="caso_id"
            value={filters.caso_id}
            onChange={handleFilterChange}
          >
            <option value="">Todos los casos</option>
            {casos.map(caso => (
              <option key={caso.id} value={caso.id}>
                Caso #{caso.id} - {caso.PersonaDesaparecida?.nombre_completo || 'Sin nombre'}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="fecha_inicio">Desde:</label>
          <input
            type="datetime-local"
            id="fecha_inicio"
            name="fecha_inicio"
            value={filters.fecha_inicio}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="fecha_fin">Hasta:</label>
          <input
            type="datetime-local"
            id="fecha_fin"
            name="fecha_fin"
            value={filters.fecha_fin}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              name="mostrarTimeline"
              checked={filters.mostrarTimeline}
              onChange={handleFilterChange}
              disabled={!filters.caso_id}
            />
            Mostrar línea temporal
          </label>
        </div>

        <button onClick={fetchAlertas} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>

      {/* Leyenda */}
      <div className="map-legend">
        <h4>Leyenda:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-marker marker-red"></span>
            <span>Alta prioridad</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker marker-orange"></span>
            <span>Media prioridad</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker marker-yellow"></span>
            <span>Baja prioridad</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker marker-green"></span>
            <span>Revisada</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker marker-grey"></span>
            <span>Falso positivo</span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      {loading && <div className="loading-overlay">Cargando mapa...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcadores de alertas agrupados con clustering */}
          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            disableClusteringAtZoom={18}
          >
            {geojsonData && geojsonData.features && geojsonData.features.map((feature, index) => {
              const coords = feature.geometry.coordinates;
              const props = feature.properties;
              
              return (
                <Marker
                  key={index}
                  position={[coords[1], coords[0]]} // Leaflet usa [lat, lon]
                  icon={getIconoSegunEstadoYPrioridad(props.estado, props.prioridad)}
                >
                  <Popup>
                    <div className="marker-popup">
                      <h4>Alerta #{props.id}</h4>
                      <p><strong>Persona:</strong> {props.persona_nombre}</p>
                      <p><strong>Fecha:</strong> {formatFecha(props.timestamp)}</p>
                      <p><strong>Ubicación:</strong> {props.ubicacion || 'No especificado'}</p>
                      <p><strong>Similitud:</strong> {(props.confidence * 100).toFixed(2)}%</p>
                      <p><strong>Estado:</strong> <span className={`estado-${props.estado.toLowerCase()}`}>{props.estado}</span></p>
                      <p><strong>Prioridad:</strong> <span className={`prioridad-${props.prioridad.toLowerCase()}`}>{props.prioridad}</span></p>
                      
                      <div className="popup-actions">
                        <button
                          onClick={() => handleOpenReviewModal(props)}
                          className="btn-review"
                        >
                          🔍 Revisar Detalle
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>

          {/* Línea temporal (Polyline) */}
          {filters.mostrarTimeline && timelineCoordinates.length > 1 && (
            <Polyline
              positions={timelineCoordinates}
              color="blue"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
            />
          )}

          {/* Ajustar vista si hay coordenadas */}
          {timelineCoordinates.length > 0 && (
            <FitBounds coordinates={timelineCoordinates} />
          )}
        </MapContainer>
      </div>

      {/* Timeline Info */}
      {timelineData && (
        <div className="timeline-info">
          <h3>📊 Línea Temporal de Movimientos</h3>
          <p>Caso #{timelineData.caso_id} - Total de detecciones: {timelineData.total_detecciones}</p>
          
          <div className="timeline-list">
            {timelineData.timeline && timelineData.timeline.map((event, index) => (
              <div key={index} className="timeline-event">
                <span className="timeline-number">{index + 1}</span>
                <div className="timeline-details">
                  <strong>{formatFecha(event.timestamp)}</strong>
                  <span>{event.ubicacion || 'Ubicación desconocida'}</span>
                  <span className="timeline-similarity">Similitud: {(event.similitud * 100).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {geojsonData && (
        <div className="map-stats">
          <h4>Resumen:</h4>
          <p>Total de alertas mostradas: {geojsonData.features?.length || 0}</p>
        </div>
      )}

      {/* Modal de Revisión */}
      {showReviewModal && selectedAlerta && (
        <div className="review-modal-overlay" onClick={handleCloseReviewModal}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h2>🔍 Revisión de Alerta #{selectedAlerta.id}</h2>
              <button className="btn-close-modal" onClick={handleCloseReviewModal}>
                ✕
              </button>
            </div>

            <div className="review-modal-body">
              {/* Porcentaje de detección destacado */}
              <div className="detection-percentage-banner">
                <div className="percentage-circle">
                  <span className="percentage-value">{(selectedAlerta.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="percentage-info">
                  <h3>Nivel de Similitud</h3>
                  <p className={`confidence-level ${
                    selectedAlerta.confidence >= 0.85 ? 'high' : 
                    selectedAlerta.confidence >= 0.70 ? 'medium' : 'low'
                  }`}>
                    {selectedAlerta.confidence >= 0.85 ? '🟢 Alta Confianza' : 
                     selectedAlerta.confidence >= 0.70 ? '🟡 Confianza Media' : '🟠 Confianza Baja'}
                  </p>
                </div>
              </div>

              {/* Comparación de imágenes */}
              <div className="review-comparison-section">
                <h3>📸 Comparación Visual</h3>
                <div className="images-comparison-grid">
                  {/* Fotos de referencia del caso */}
                  <div className="reference-images-panel">
                    <h4>Fotos de Referencia (Caso #{selectedAlerta.caso_id})</h4>
                    <p className="panel-subtitle">{selectedAlerta.persona_nombre}</p>
                    <div className="reference-images-container">
                      {fotosReferencia.length > 0 ? (
                        fotosReferencia.map((foto, index) => (
                          <div key={foto.id || index} className="reference-image-wrapper">
                            <img 
                              src={foto.url || foto.ruta_archivo} 
                              alt={`Foto ${index + 1}`}
                              className="reference-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200x200?text=Imagen+no+disponible';
                              }}
                            />
                            <span className="image-label">Foto {index + 1}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-images-placeholder">
                          <p>📷 No hay fotos de referencia disponibles</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Imagen de detección/captura */}
                  <div className="detection-image-panel">
                    <h4>Imagen de Detección</h4>
                    <p className="panel-subtitle">{formatFecha(selectedAlerta.timestamp)}</p>
                    <div className="detection-image-wrapper">
                      {selectedAlerta.imagen_url ? (
                        <img 
                          src={selectedAlerta.imagen_url}
                          alt="Captura del avistamiento"
                          className="detection-image"
                          onError={(e) => {
                            console.error('Error cargando imagen:', selectedAlerta.imagen_url);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="detection-image-placeholder"
                        style={{ display: selectedAlerta.imagen_url ? 'none' : 'flex' }}
                      >
                        <div className="placeholder-icon">📷</div>
                        <p>Imagen de avistamiento</p>
                        <small>{selectedAlerta.imagen_url ? 'Error al cargar imagen' : 'Sin imagen disponible'}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de detalles */}
              <div className="review-details-section">
                <h3>📋 Detalles de la Detección</h3>
                
                <div className="details-grid">
                  <div className="review-detail-row">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span className="detail-value">{selectedAlerta.ubicacion || 'No especificado'}</span>
                  </div>

                  <div className="review-detail-row">
                    <span className="detail-label">🗺️ Coordenadas:</span>
                    <span className="detail-value">
                      Lat: {selectedAlerta.latitud?.toFixed(6)}, Lon: {selectedAlerta.longitud?.toFixed(6)}
                    </span>
                  </div>

                  <div className="review-detail-row">
                    <span className="detail-label">📅 Fecha y Hora:</span>
                    <span className="detail-value">{formatFecha(selectedAlerta.timestamp)}</span>
                  </div>

                  <div className="review-detail-row">
                    <span className="detail-label">📊 Estado Actual:</span>
                    <span className={`detail-value estado-badge estado-${selectedAlerta.estado.toLowerCase()}`}>
                      {selectedAlerta.estado}
                    </span>
                  </div>

                  <div className="review-detail-row">
                    <span className="detail-label">⚡ Prioridad:</span>
                    <span className={`detail-value prioridad-badge prioridad-${selectedAlerta.prioridad.toLowerCase()}`}>
                      {selectedAlerta.prioridad}
                    </span>
                  </div>

                  <div className="review-detail-row">
                    <span className="detail-label">🎥 Cámara ID:</span>
                    <span className="detail-value">#{selectedAlerta.camara_id}</span>
                  </div>

                  {selectedAlerta.falso_positivo && (
                    <div className="review-detail-row warning-row">
                      <span className="detail-label">⚠️ Advertencia:</span>
                      <span className="detail-value warning-text">Marcada como falso positivo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="review-modal-footer">
              <button
                onClick={() => handleMarcarRevisada(selectedAlerta.id)}
                className="btn-modal btn-success"
                disabled={selectedAlerta.estado === 'REVISADA'}
              >
                ✓ Marcar como Revisada/Validada
              </button>
              
              <button
                onClick={() => handleMarcarFalsoPositivo(selectedAlerta.id)}
                className="btn-modal btn-warning"
                disabled={selectedAlerta.estado === 'FALSO_POSITIVO'}
              >
                ✗ Marcar como Falso Positivo
              </button>

              <button
                onClick={handleCloseReviewModal}
                className="btn-modal btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
