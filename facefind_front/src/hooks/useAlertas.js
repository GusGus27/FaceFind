/**
 * useAlertas Hook
 * Custom hook for alerts management with real-time subscriptions
 * @module hooks/useAlertas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as alertaService from '../services/alertaService';
import { ALERTA_ESTADO } from '../constants/enums';

/**
 * Alerts hook with real-time updates
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoLoad=true] - Auto-load alerts on mount
 * @param {boolean} [options.realtime=true] - Enable real-time subscriptions
 * @param {Object} [options.filters] - Initial filters
 * @returns {Object} Alerts state and functions
 */
export const useAlertas = (options = {}) => {
  const { autoLoad = true, realtime = true, filters: initialFilters = {} } = options;

  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nuevaAlerta, setNuevaAlerta] = useState(null);
  const subscriptionRef = useRef(null);

  /**
   * Fetch all alerts
   */
  const fetchAlertas = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const appliedFilters = { ...initialFilters, ...customFilters };
      const data = await alertaService.getAlertas(appliedFilters);

      setAlertas(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch alerts';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  /**
   * Fetch pending alerts
   */
  const fetchPendingAlertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await alertaService.getPendingAlertas();

      setAlertas(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch pending alerts';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new alert
   */
  const createAlerta = async (alertaData) => {
    try {
      setLoading(true);
      setError(null);

      const newAlerta = await alertaService.createAlerta(alertaData);

      // Add to local state
      setAlertas(prev => [newAlerta, ...prev]);

      return { success: true, data: newAlerta };
    } catch (err) {
      const errorMessage = err.message || 'Failed to create alert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update alert status
   */
  const updateEstado = async (alertaId, estado) => {
    try {
      setLoading(true);
      setError(null);

      const updatedAlerta = await alertaService.updateEstadoAlerta(alertaId, estado);

      // Update local state
      setAlertas(prev =>
        prev.map(alerta => (alerta.id === alertaId ? updatedAlerta : alerta))
      );

      return { success: true, data: updatedAlerta };
    } catch (err) {
      const errorMessage = err.message || 'Failed to update alert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark alert as reviewed
   */
  const markAsReviewed = async (alertaId) => {
    return updateEstado(alertaId, ALERTA_ESTADO.REVISADA);
  };

  /**
   * Mark alert as false positive
   */
  const markAsFalsePositive = async (alertaId) => {
    return updateEstado(alertaId, ALERTA_ESTADO.FALSO_POSITIVO);
  };

  /**
   * Delete an alert
   */
  const deleteAlerta = async (alertaId) => {
    try {
      setLoading(true);
      setError(null);

      await alertaService.deleteAlerta(alertaId);

      // Remove from local state
      setAlertas(prev => prev.filter(alerta => alerta.id !== alertaId));

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete alert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh alerts
   */
  const refresh = useCallback(() => {
    return fetchAlertas();
  }, [fetchAlertas]);

  /**
   * Set up real-time subscription
   */
  useEffect(() => {
    if (!realtime) return;

    // Subscribe to new alerts
    const subscription = alertaService.subscribeToNewAlertas((payload) => {
      const newAlert = payload.new;

      if (newAlert) {
        // Add new alert to the list
        setAlertas(prev => [newAlert, ...prev]);

        // Set as nueva alerta for notifications
        setNuevaAlerta(newAlert);

        // Clear nueva alerta after 5 seconds
        setTimeout(() => {
          setNuevaAlerta(null);
        }, 5000);
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [realtime]);

  /**
   * Auto-load on mount
   */
  useEffect(() => {
    if (autoLoad) {
      fetchAlertas();
    }
  }, [autoLoad, fetchAlertas]);

  return {
    // State
    alertas,
    loading,
    error,
    nuevaAlerta,

    // Functions
    fetchAlertas,
    fetchPendingAlertas,
    createAlerta,
    updateEstado,
    markAsReviewed,
    markAsFalsePositive,
    deleteAlerta,
    refresh,
  };
};

export default useAlertas;
