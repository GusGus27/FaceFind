/**
 * Servicio Mock para gestión de horarios de alertas
 * Simula operaciones de backend almacenando datos en localStorage
 */

const STORAGE_KEY = 'alert_schedules';
const LOGS_KEY = 'alert_logs_off_hours';

// Horario por defecto: 24/7
const DEFAULT_SCHEDULE = {
  id: 'default',
  name: 'Horario por Defecto',
  cameraId: null, // null significa global
  days: {
    monday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    tuesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    wednesday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    thursday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    friday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    saturday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] },
    sunday: { enabled: true, slots: [{ start: '00:00', end: '23:59' }] }
  },
  exceptions: [],
  criticalOverride: false, // Si es true, las alertas críticas ignoran el horario
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * Obtener todos los horarios configurados
 */
export const getSchedules = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Inicializar con horario por defecto
      const defaultSchedules = [DEFAULT_SCHEDULE];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSchedules));
      return defaultSchedules;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return [DEFAULT_SCHEDULE];
  }
};

/**
 * Obtener horario por ID
 */
export const getScheduleById = (scheduleId) => {
  const schedules = getSchedules();
  return schedules.find(s => s.id === scheduleId);
};

/**
 * Obtener horario por cámara
 */
export const getScheduleByCamera = (cameraId) => {
  const schedules = getSchedules();
  return schedules.find(s => s.cameraId === cameraId) || schedules.find(s => s.cameraId === null);
};

/**
 * Crear nuevo horario
 */
export const createSchedule = (scheduleData) => {
  try {
    const schedules = getSchedules();
    const newSchedule = {
      ...scheduleData,
      id: `schedule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    return { success: true, schedule: newSchedule };
  } catch (error) {
    console.error('Error al crear horario:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Actualizar horario existente
 */
export const updateSchedule = (scheduleId, scheduleData) => {
  try {
    const schedules = getSchedules();
    const index = schedules.findIndex(s => s.id === scheduleId);
    
    if (index === -1) {
      return { success: false, error: 'Horario no encontrado' };
    }
    
    schedules[index] = {
      ...schedules[index],
      ...scheduleData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    return { success: true, schedule: schedules[index] };
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Eliminar horario
 */
export const deleteSchedule = (scheduleId) => {
  try {
    const schedules = getSchedules();
    const filtered = schedules.filter(s => s.id !== scheduleId);
    
    if (filtered.length === schedules.length) {
      return { success: false, error: 'Horario no encontrado' };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar si la hora actual está dentro del horario permitido
 */
export const isWithinSchedule = (scheduleId, dateTime = new Date(), isCritical = false) => {
  const schedule = getScheduleById(scheduleId);
  
  if (!schedule) {
    return true; // Si no hay horario, permitir
  }
  
  // Si es crítico y el override está activo, permitir
  if (isCritical && schedule.criticalOverride) {
    return true;
  }
  
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dateTime.getDay()];
  const daySchedule = schedule.days[dayName];
  
  if (!daySchedule || !daySchedule.enabled) {
    return false;
  }
  
  const currentTime = dateTime.getHours() * 60 + dateTime.getMinutes();
  
  // Verificar si está en alguna franja horaria
  const isInSlot = daySchedule.slots.some(slot => {
    const [startHour, startMin] = slot.start.split(':').map(Number);
    const [endHour, endMin] = slot.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  });
  
  if (isInSlot) {
    return true;
  }
  
  // Verificar excepciones
  const dateStr = dateTime.toISOString().split('T')[0];
  const exception = schedule.exceptions.find(ex => ex.date === dateStr);
  
  if (exception) {
    return exception.enabled;
  }
  
  return false;
};

/**
 * Agregar excepción a un horario
 */
export const addException = (scheduleId, exceptionData) => {
  try {
    const schedules = getSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule) {
      return { success: false, error: 'Horario no encontrado' };
    }
    
    if (!schedule.exceptions) {
      schedule.exceptions = [];
    }
    
    // Verificar si ya existe una excepción para esa fecha
    const existingIndex = schedule.exceptions.findIndex(ex => ex.date === exceptionData.date);
    
    if (existingIndex !== -1) {
      schedule.exceptions[existingIndex] = exceptionData;
    } else {
      schedule.exceptions.push(exceptionData);
    }
    
    schedule.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    
    return { success: true, schedule };
  } catch (error) {
    console.error('Error al agregar excepción:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Eliminar excepción
 */
export const removeException = (scheduleId, date) => {
  try {
    const schedules = getSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (!schedule) {
      return { success: false, error: 'Horario no encontrado' };
    }
    
    schedule.exceptions = schedule.exceptions.filter(ex => ex.date !== date);
    schedule.updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
    return { success: true, schedule };
  } catch (error) {
    console.error('Error al eliminar excepción:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Registrar log de alerta fuera de horario
 */
export const logOffHoursAlert = (logData) => {
  try {
    const logs = getOffHoursLogs();
    const newLog = {
      ...logData,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog); // Agregar al inicio
    
    // Mantener solo los últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return { success: true, log: newLog };
  } catch (error) {
    console.error('Error al registrar log:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener logs de alertas fuera de horario
 */
export const getOffHoursLogs = (filters = {}) => {
  try {
    const data = localStorage.getItem(LOGS_KEY);
    let logs = data ? JSON.parse(data) : [];
    
    // Aplicar filtros
    if (filters.cameraId) {
      logs = logs.filter(log => log.cameraId === filters.cameraId);
    }
    
    if (filters.startDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }
    
    if (filters.isCritical !== undefined) {
      logs = logs.filter(log => log.isCritical === filters.isCritical);
    }
    
    return logs;
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return [];
  }
};

/**
 * Limpiar logs antiguos
 */
export const clearOldLogs = (daysToKeep = 30) => {
  try {
    const logs = getOffHoursLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const filtered = logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    localStorage.setItem(LOGS_KEY, JSON.stringify(filtered));
    
    return { success: true, removedCount: logs.length - filtered.length };
  } catch (error) {
    console.error('Error al limpiar logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener estadísticas de logs
 */
export const getLogsStatistics = () => {
  try {
    const logs = getOffHoursLogs();
    
    const stats = {
      total: logs.length,
      byCritical: {
        critical: logs.filter(l => l.isCritical).length,
        normal: logs.filter(l => !l.isCritical).length
      },
      byCamera: {},
      last24Hours: 0,
      last7Days: 0,
      last30Days: 0
    };
    
    const now = new Date();
    const day24Ago = new Date(now - 24 * 60 * 60 * 1000);
    const days7Ago = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const days30Ago = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    logs.forEach(log => {
      // Por cámara
      if (!stats.byCamera[log.cameraId]) {
        stats.byCamera[log.cameraId] = 0;
      }
      stats.byCamera[log.cameraId]++;
      
      // Por tiempo
      const logDate = new Date(log.timestamp);
      if (logDate >= day24Ago) stats.last24Hours++;
      if (logDate >= days7Ago) stats.last7Days++;
      if (logDate >= days30Ago) stats.last30Days++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

export default {
  getSchedules,
  getScheduleById,
  getScheduleByCamera,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  isWithinSchedule,
  addException,
  removeException,
  logOffHoursAlert,
  getOffHoursLogs,
  clearOldLogs,
  getLogsStatistics
};
