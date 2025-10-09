/**
 * useCasos Hook
 * Custom hook for case management
 * @module hooks/useCasos
 */

import { useState, useEffect, useCallback } from 'react';
import * as casoService from '../services/casoService';
import { CASO_STATUS, CASO_PRIORITY } from '../constants/enums';

/**
 * Cases hook
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoLoad=true] - Auto-load cases on mount
 * @param {Object} [options.filters] - Initial filters
 * @returns {Object} Cases state and functions
 */
export const useCasos = (options = {}) => {
  const { autoLoad = true, filters: initialFilters = {} } = options;

  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Fetch all cases
   */
  const fetchCasos = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const appliedFilters = { ...filters, ...customFilters };
      const data = await casoService.getCasos(appliedFilters);

      setCasos(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch cases';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Fetch cases with photos
   */
  const fetchCasosConFotos = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const appliedFilters = { ...filters, ...customFilters };
      const data = await casoService.getCasosConFotos(appliedFilters);

      setCasos(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch cases with photos';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Create a new case
   */
  const createCaso = async (casoData) => {
    try {
      setLoading(true);
      setError(null);

      const newCaso = await casoService.createCaso(casoData);

      // Add to local state
      setCasos(prev => [newCaso, ...prev]);

      return { success: true, data: newCaso };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a case
   */
  const updateCaso = async (casoId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const updatedCaso = await casoService.updateCaso(casoId, updates);

      // Update local state
      setCasos(prev =>
        prev.map(caso => (caso.id === casoId ? updatedCaso : caso))
      );

      return { success: true, data: updatedCaso };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a case
   */
  const deleteCaso = async (casoId) => {
    try {
      setLoading(true);
      setError(null);

      await casoService.deleteCaso(casoId);

      // Remove from local state
      setCasos(prev => prev.filter(caso => caso.id !== casoId));

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete case';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter by status
   */
  const filterByStatus = useCallback(async (status) => {
    setFilters(prev => ({ ...prev, status }));
    return fetchCasos({ status });
  }, [fetchCasos]);

  /**
   * Filter by priority
   */
  const filterByPriority = useCallback(async (priority) => {
    setFilters(prev => ({ ...prev, priority }));
    return fetchCasos({ priority });
  }, [fetchCasos]);

  /**
   * Search cases by name
   */
  const searchByName = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);

      const data = await casoService.searchCasosByName(searchTerm);

      setCasos(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to search cases';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get active cases
   */
  const fetchActiveCasos = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await casoService.getActiveCasos();

      setCasos(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch active cases';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update case status
   */
  const updateStatus = async (casoId, status, additionalData = {}) => {
    return updateCaso(casoId, { status, ...additionalData });
  };

  /**
   * Update case priority
   */
  const updatePriority = async (casoId, priority) => {
    return updateCaso(casoId, { priority });
  };

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    return fetchCasos({});
  }, [fetchCasos]);

  /**
   * Refresh cases
   */
  const refresh = useCallback(() => {
    return fetchCasos();
  }, [fetchCasos]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      fetchCasos();
    }
  }, [autoLoad, fetchCasos]);

  return {
    // State
    casos,
    loading,
    error,
    filters,

    // Functions
    fetchCasos,
    fetchCasosConFotos,
    createCaso,
    updateCaso,
    deleteCaso,
    filterByStatus,
    filterByPriority,
    searchByName,
    fetchActiveCasos,
    updateStatus,
    updatePriority,
    clearFilters,
    refresh,
  };
};

export default useCasos;
