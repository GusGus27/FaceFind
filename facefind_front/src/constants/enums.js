/**
 * Enumerations and constants used throughout the application
 * Based on the database schema
 * @module constants/enums
 */

/**
 * User roles in the system
 * @enum {string}
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
};

/**
 * User account status
 * @enum {string}
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

/**
 * Case status values
 * @enum {string}
 */
export const CASO_STATUS = {
  ACTIVO: 'activo',
  PENDIENTE: 'pendiente',
  RESUELTO: 'resuelto',
};

/**
 * Case priority levels
 * @enum {string}
 */
export const CASO_PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Alert states
 * @enum {string}
 */
export const ALERTA_ESTADO = {
  PENDIENTE: 'PENDIENTE',
  REVISADA: 'REVISADA',
  FALSO_POSITIVO: 'FALSO_POSITIVO',
};

/**
 * Alert priority levels
 * @enum {string}
 */
export const ALERTA_PRIORIDAD = {
  ALTA: 'ALTA',
  MEDIA: 'MEDIA',
  BAJA: 'BAJA',
};

/**
 * Gender options
 * @enum {string}
 */
export const GENDER = {
  MASCULINO: 'masculino',
  FEMENINO: 'femenino',
  OTRO: 'otro',
  PREFIERO_NO_DECIR: 'prefiero-no-decir',
};

/**
 * Notification types
 * @enum {string}
 */
export const NOTIF_TYPE = {
  MATCH: 'match',
  SYSTEM: 'system',
  CASE: 'case',
  USER: 'user',
  ALERT: 'alert',
};

/**
 * Notification severity levels
 * @enum {string}
 */
export const NOTIF_SEVERITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Camera types
 * @enum {string}
 */
export const CAMERA_TYPE = {
  USB: 'USB',
  IP: 'IP',
};

/**
 * Photo reference angles
 * @enum {string}
 */
export const FOTO_ANGULO = {
  IZQUIERDO: 'IZQUIERDO',
  FRONTAL: 'FRONTAL',
  DERECHO: 'DERECHO',
};

/**
 * Audit log action types
 * @enum {string}
 */
export const LOG_TYPE = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read',
  LOGIN: 'login',
  LOGOUT: 'logout',
};

/**
 * Audit log status
 * @enum {string}
 */
export const LOG_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  ERROR: 'error',
};

/**
 * Relationship types for case reporters
 * @enum {string}
 */
export const RELATIONSHIP_TYPES = {
  PADRE: 'Padre/Madre',
  HERMANO: 'Hermano/a',
  HIJO: 'Hijo/a',
  ESPOSO: 'Esposo/a',
  OTRO_FAMILIAR: 'Otro familiar',
  AMIGO: 'Amigo/a',
  CONOCIDO: 'Conocido',
  AUTORIDAD: 'Autoridad',
  OTRO: 'Otro',
};

/**
 * Helper function to get label for enum value
 * @param {Object} enumObj - The enum object
 * @param {string} value - The value to get label for
 * @returns {string} The formatted label
 */
export const getEnumLabel = (enumObj, value) => {
  const key = Object.keys(enumObj).find(k => enumObj[k] === value);
  return key ? key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : value;
};

/**
 * Get all values from an enum
 * @param {Object} enumObj - The enum object
 * @returns {string[]} Array of enum values
 */
export const getEnumValues = (enumObj) => Object.values(enumObj);

/**
 * Check if a value is valid for a given enum
 * @param {Object} enumObj - The enum object
 * @param {string} value - The value to validate
 * @returns {boolean} True if valid
 */
export const isValidEnumValue = (enumObj, value) => {
  return getEnumValues(enumObj).includes(value);
};
