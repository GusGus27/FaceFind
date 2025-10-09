/**
 * Utilidades para validación de contraseñas
 */

/**
 * Valida que la contraseña cumpla con los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {Object} - { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {boolean}
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Genera un mensaje de error combinado para validación de contraseña
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {string|null} - Mensaje de error o null si es válida
 */
export const getPasswordValidationError = (password, confirmPassword) => {
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    return validation.errors[0]; // Retorna el primer error
  }

  if (!passwordsMatch(password, confirmPassword)) {
    return 'Las contraseñas no coinciden';
  }

  return null;
};
