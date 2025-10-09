/**
 * Report Service
 * Handles report generation and CRUD operations
 * @module services/reporteService
 */

import { supabase } from '../lib/supabase';
import { handleSupabaseError, executeQuery, formatDateForDB } from '../utils/supabaseHelpers';

/**
 * Create a new report
 * @param {Object} reporteData - Report data
 * @param {number} reporteData.usuario_id - User ID creating the report
 * @param {Date|string} reporteData.fecha_inicio - Start date
 * @param {Date|string} reporteData.fecha_fin - End date
 * @param {number} [reporteData.total_alertas=0] - Total alerts
 * @param {number} [reporteData.casos_detectados=0] - Cases detected
 * @param {number} [reporteData.coincidencias_confirmadas=0] - Confirmed matches
 * @returns {Promise<Object>} Created report
 */
export const createReporte = async (reporteData) => {
  try {
    const { data, error } = await supabase
      .from('Reporte')
      .insert({
        usuario_id: reporteData.usuario_id,
        fecha_inicio: formatDateForDB(reporteData.fecha_inicio),
        fecha_fin: formatDateForDB(reporteData.fecha_fin),
        total_alertas: reporteData.total_alertas || 0,
        casos_detectados: reporteData.casos_detectados || 0,
        coincidencias_confirmadas: reporteData.coincidencias_confirmadas || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to create report');
  }
};

/**
 * Get all reports
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.usuario_id] - Filter by user
 * @returns {Promise<Object[]>} List of reports
 */
export const getReportes = async (filters = {}) => {
  try {
    let query = supabase
      .from('Reporte')
      .select(`
        *,
        Usuario (
          id,
          nombre,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.usuario_id) {
      query = query.eq('usuario_id', filters.usuario_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch reports');
  }
};

/**
 * Get a single report by ID
 * @param {number} reporteId - Report ID
 * @returns {Promise<Object>} Report data
 */
export const getReporteById = async (reporteId) => {
  return executeQuery(
    supabase
      .from('Reporte')
      .select(`
        *,
        Usuario (
          id,
          nombre,
          email
        )
      `)
      .eq('id', reporteId)
      .single(),
    'Failed to fetch report'
  );
};

/**
 * Update a report
 * @param {number} reporteId - Report ID
 * @param {Object} updates - Report updates
 * @returns {Promise<Object>} Updated report
 */
export const updateReporte = async (reporteId, updates) => {
  try {
    const formattedUpdates = { ...updates };

    if (updates.fecha_inicio) {
      formattedUpdates.fecha_inicio = formatDateForDB(updates.fecha_inicio);
    }

    if (updates.fecha_fin) {
      formattedUpdates.fecha_fin = formatDateForDB(updates.fecha_fin);
    }

    const { data, error } = await supabase
      .from('Reporte')
      .update(formattedUpdates)
      .eq('id', reporteId)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to update report');
  }
};

/**
 * Delete a report
 * @param {number} reporteId - Report ID
 * @returns {Promise<void>}
 */
export const deleteReporte = async (reporteId) => {
  try {
    const { error } = await supabase.from('Reporte').delete().eq('id', reporteId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete report');
  }
};

/**
 * Get reports by user ID
 * @param {number} usuarioId - User ID
 * @returns {Promise<Object[]>} User reports
 */
export const getReportesByUsuario = async (usuarioId) => {
  return getReportes({ usuario_id: usuarioId });
};

/**
 * Generate automatic report for date range
 * Calculates statistics from alerts in the given period
 * @param {number} usuarioId - User ID creating the report
 * @param {Date|string} fechaInicio - Start date
 * @param {Date|string} fechaFin - End date
 * @returns {Promise<Object>} Generated report
 */
export const generateReporte = async (usuarioId, fechaInicio, fechaFin) => {
  try {
    // 1. Get alerts in date range
    const { data: alertas, error: alertError } = await supabase
      .from('Alerta')
      .select('*')
      .gte('timestamp', formatDateForDB(fechaInicio))
      .lte('timestamp', formatDateForDB(fechaFin));

    if (alertError) throw alertError;

    // 2. Calculate statistics
    const totalAlertas = alertas.length;
    const casosDetectados = new Set(alertas.map(a => a.caso_id)).size;
    const coincidenciasConfirmadas = alertas.filter(a => a.estado === 'REVISADA').length;

    // 3. Create report
    const reporte = await createReporte({
      usuario_id: usuarioId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      total_alertas: totalAlertas,
      casos_detectados: casosDetectados,
      coincidencias_confirmadas: coincidenciasConfirmadas,
    });

    // 4. Link alerts to report
    if (alertas.length > 0) {
      const alertaReporteLinks = alertas.map(alerta => ({
        alerta_id: alerta.id,
        reporte_id: reporte.id,
      }));

      const { error: linkError } = await supabase
        .from('AlertaReporte')
        .insert(alertaReporteLinks);

      if (linkError) throw linkError;
    }

    return reporte;
  } catch (error) {
    handleSupabaseError(error, 'Failed to generate report');
  }
};

/**
 * Get report with associated alerts
 * @param {number} reporteId - Report ID
 * @returns {Promise<Object>} Report with alerts
 */
export const getReporteWithAlertas = async (reporteId) => {
  try {
    const { data, error } = await supabase
      .from('Reporte')
      .select(`
        *,
        Usuario (nombre, email),
        AlertaReporte (
          Alerta (
            *,
            Caso (nombre_completo),
            Camara (ubicacion)
          )
        )
      `)
      .eq('id', reporteId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch report with alerts');
  }
};

/**
 * Get reports within a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Promise<Object[]>} Reports in range
 */
export const getReportesByDateRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('Reporte')
      .select('*, Usuario (nombre, email)')
      .gte('fecha_inicio', formatDateForDB(startDate))
      .lte('fecha_fin', formatDateForDB(endDate))
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch reports by date range');
  }
};

/**
 * Get report statistics summary
 * @returns {Promise<Object>} Summary statistics
 */
export const getReporteSummary = async () => {
  try {
    const { data, error } = await supabase
      .from('Reporte')
      .select('total_alertas, casos_detectados, coincidencias_confirmadas');

    if (error) throw error;

    const summary = {
      totalReportes: data.length,
      totalAlertas: data.reduce((sum, r) => sum + (r.total_alertas || 0), 0),
      totalCasosDetectados: data.reduce((sum, r) => sum + (r.casos_detectados || 0), 0),
      totalCoincidenciasConfirmadas: data.reduce((sum, r) => sum + (r.coincidencias_confirmadas || 0), 0),
    };

    return summary;
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch report summary');
  }
};
