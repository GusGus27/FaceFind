/**
 * Alerta Service - Cliente para API de alertas
 * Según diagrama UML - AlertaService
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const alertaService = {
  /**
   * Obtiene todas las alertas con filtros opcionales
   * @param {Object} filters - Filtros: caso_id, camara_id, fecha_inicio, fecha_fin, estado, prioridad
   * @returns {Promise} - Lista de alertas
   */
  async getAlertas(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.caso_id) params.append('caso_id', filters.caso_id);
      if (filters.camara_id) params.append('camara_id', filters.camara_id);
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.prioridad) params.append('prioridad', filters.prioridad);

      const response = await axios.get(`${API_BASE_URL}/alertas?${params}`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },

  /**
   * Obtiene alertas en formato GeoJSON para mapas
   * Según UML: getAlertasPorFecha, getAlertasPorCamara, getAlertasPorCaso
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise} - FeatureCollection GeoJSON
   */
  async getAlertasGeoJSON(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.caso_id) params.append('caso_id', filters.caso_id);
      if (filters.camara_id) params.append('camara_id', filters.camara_id);
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

      const response = await axios.get(`${API_BASE_URL}/alertas/geojson?${params}`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo GeoJSON de alertas:', error);
      throw error;
    }
  },

  /**
   * Obtiene línea temporal de movimientos de un caso
   * @param {number} caso_id - ID del caso
   * @param {string} fecha_inicio - Fecha inicio (opcional)
   * @param {string} fecha_fin - Fecha fin (opcional)
   * @returns {Promise} - Timeline de alertas
   */
  async getTimeline(caso_id, fecha_inicio = null, fecha_fin = null) {
    try {
      const params = new URLSearchParams();
      params.append('caso_id', caso_id);
      
      if (fecha_inicio) params.append('fecha_inicio', fecha_inicio);
      if (fecha_fin) params.append('fecha_fin', fecha_fin);

      const response = await axios.get(`${API_BASE_URL}/alertas/timeline?${params}`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo timeline:', error);
      throw error;
    }
  },

  /**
   * Obtiene una alerta específica por ID
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise} - Datos de la alerta
   */
  async getAlertaById(alertaId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/alertas/${alertaId}`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo alerta:', error);
      throw error;
    }
  },

  /**
   * Actualiza el estado de una alerta
   * @param {number} alertaId - ID de la alerta
   * @param {string} estado - Nuevo estado: "PENDIENTE" | "REVISADA" | "FALSO_POSITIVO"
   * @returns {Promise} - Resultado de la operación
   */
  async updateEstado(alertaId, estado) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/alertas/${alertaId}/estado`,
        { estado },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw error;
    }
  },

  /**
   * Marca una alerta como revisada
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise} - Resultado de la operación
   */
  async marcarRevisada(alertaId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/alertas/${alertaId}/revisar`,
        {},
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error marcando como revisada:', error);
      throw error;
    }
  },

  /**
   * Marca una alerta como falso positivo
   * @param {number} alertaId - ID de la alerta
   * @returns {Promise} - Resultado de la operación
   */
  async marcarFalsoPositivo(alertaId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/alertas/${alertaId}/falso-positivo`,
        {},
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error marcando como falso positivo:', error);
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de alertas
   * @returns {Promise} - Estadísticas generales
   */
  async getEstadisticas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/alertas/estadisticas`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Obtiene alertas pendientes de revisión
   * @returns {Promise} - Lista de alertas pendientes
   */
  async getAlertasPendientes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/alertas/pendientes`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas pendientes:', error);
      throw error;
    }
  },

  /**
   * Obtiene alertas de alta prioridad
   * @returns {Promise} - Lista de alertas de alta prioridad
   */
  async getAlertasAltaPrioridad() {
    try {
      const response = await axios.get(`${API_BASE_URL}/alertas/alta-prioridad`, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Error obteniendo alertas de alta prioridad:', error);
      throw error;
    }
  }
};

export default alertaService;
