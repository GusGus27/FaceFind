/**
 * Statistics Service
 * Handles statistics-related API calls
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get dashboard overview with main metrics
 * @returns {Promise<Object>} Dashboard overview data
 */
export const getDashboardOverview = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/dashboard`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard overview');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

/**
 * Get temporal analysis
 * @param {string} period - Period type (day, week, month)
 * @param {number} days - Number of days (optional)
 * @returns {Promise<Object>} Temporal analysis data
 */
export const getTemporalAnalysis = async (period = 'month', days = null) => {
  try {
    const params = new URLSearchParams({ period });
    if (days) params.append('days', days);
    
    const response = await fetch(`${API_URL}/statistics/temporal?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch temporal analysis');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching temporal analysis:', error);
    throw error;
  }
};

/**
 * Get detection metrics
 * @returns {Promise<Object>} Detection metrics data
 */
export const getDetectionMetrics = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/detection-metrics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch detection metrics');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching detection metrics:', error);
    throw error;
  }
};

/**
 * Get heatmap data
 * @returns {Promise<Object>} Heatmap data with locations
 */
export const getHeatmapData = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/heatmap`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch heatmap data');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    throw error;
  }
};

/**
 * Get demographic analysis
 * @returns {Promise<Object>} Demographic analysis data
 */
export const getDemographicAnalysis = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/demographics`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch demographic analysis');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching demographic analysis:', error);
    throw error;
  }
};

/**
 * Get camera statistics
 * @returns {Promise<Array>} Camera statistics data
 */
export const getCameraStatistics = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/cameras`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch camera statistics');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching camera statistics:', error);
    throw error;
  }
};

/**
 * Get performance metrics
 * @returns {Promise<Object>} Performance metrics data
 */
export const getPerformanceMetrics = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/performance`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance metrics');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
};

/**
 * Get complete report
 * @returns {Promise<Object>} Complete system report
 */
export const getCompleteReport = async () => {
  try {
    const response = await fetch(`${API_URL}/statistics/report/complete`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch complete report');
    }
    
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error('Error fetching complete report:', error);
    throw error;
  }
};

/**
 * Export report to PDF
 * @param {string} reportType - Type of report (dashboard, complete, custom)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} PDF file blob
 */
export const exportReportPDF = async (reportType = 'complete', filters = {}) => {
  try {
    const response = await fetch(`${API_URL}/statistics/export/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ report_type: reportType, filters }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export PDF');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

/**
 * Export report to Excel
 * @param {string} reportType - Type of report (dashboard, complete, custom)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportReportExcel = async (reportType = 'complete', filters = {}) => {
  try {
    const response = await fetch(`${API_URL}/statistics/export/excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ report_type: reportType, filters }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export Excel');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};

/**
 * Export data to CSV
 * @param {string} dataType - Type of data (cases, users, detections)
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportReportCSV = async (dataType = 'cases') => {
  try {
    const response = await fetch(`${API_URL}/statistics/export/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data_type: dataType }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to export CSV');
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};
