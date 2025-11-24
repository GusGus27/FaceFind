/**
 * Report Service - Servicio para exportación de reportes
 */
import axios from 'axios';

const API_URL = 'http://localhost:5000/reports';

/**
 * Exporta reportes en formato Excel
 * @param {Object} filtros - Filtros para el reporte
 * @returns {Promise<Blob>} Archivo Excel
 */
export const exportarExcel = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.fecha_inicio) {
      params.append('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params.append('fecha_fin', filtros.fecha_fin);
    }
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }
    if (filtros.usuario_id) {
      params.append('usuario_id', filtros.usuario_id);
    }
    if (filtros.camara_id) {
      params.append('camara_id', filtros.camara_id);
    }

    const response = await axios.get(`${API_URL}/export/excel?${params.toString()}`, {
      responseType: 'blob',
      withCredentials: true
    });

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo del header o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'FaceFind_Reporte.xlsx';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exportando Excel:', error);
    throw error;
  }
};

/**
 * Exporta reportes en formato CSV
 * @param {Object} filtros - Filtros para el reporte
 * @returns {Promise<Blob>} Archivo CSV
 */
export const exportarCSV = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.fecha_inicio) {
      params.append('fecha_inicio', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      params.append('fecha_fin', filtros.fecha_fin);
    }
    if (filtros.estado) {
      params.append('estado', filtros.estado);
    }
    if (filtros.usuario_id) {
      params.append('usuario_id', filtros.usuario_id);
    }
    if (filtros.camara_id) {
      params.append('camara_id', filtros.camara_id);
    }

    const response = await axios.get(`${API_URL}/export/csv?${params.toString()}`, {
      responseType: 'blob',
      withCredentials: true
    });

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo del header o usar uno por defecto
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'FaceFind_Reporte.csv';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exportando CSV:', error);
    throw error;
  }
};

/**
 * Obtiene los filtros disponibles para reportes
 * @returns {Promise<Object>} Opciones de filtros
 */
export const obtenerFiltros = async () => {
  try {
    const response = await axios.get(`${API_URL}/filtros`, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo filtros:', error);
    throw error;
  }
};
