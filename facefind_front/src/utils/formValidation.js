/**
 * Utilidades para validación de formularios
 */

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de DNI peruano (8 dígitos)
 * @param {string} dni - DNI a validar
 * @returns {boolean}
 */
export const isValidDNI = (dni) => {
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
};

/**
 * Valida longitud mínima de nombre
 * @param {string} name - Nombre a validar
 * @param {number} minLength - Longitud mínima (default: 3)
 * @returns {boolean}
 */
export const isValidName = (name, minLength = 3) => {
  return name.trim().length >= minLength;
};

/**
 * Valida formato de número de teléfono peruano (9 dígitos)
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\d{9}$/;
  return phoneRegex.test(phone);
};
