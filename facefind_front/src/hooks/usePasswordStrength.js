import { useState } from 'react';

/**
 * Custom hook para calcular la fortaleza de una contraseña
 * @returns {Object} - { strength, checkPasswordStrength }
 */
export const usePasswordStrength = () => {
  const [strength, setStrength] = useState({
    score: 0,
    message: '',
    color: '#e0e0e0'
  });

  const checkPasswordStrength = (password) => {
    if (!password || password.length === 0) {
      setStrength({ score: 0, message: '', color: '#e0e0e0' });
      return;
    }

    let score = 0;

    // Validar longitud mínima (8 caracteres)
    if (password.length >= 8) score++;
    
    // Validar mayúsculas
    if (/[A-Z]/.test(password)) score++;
    
    // Validar minúsculas
    if (/[a-z]/.test(password)) score++;
    
    // Validar números
    if (/\d/.test(password)) score++;
    
    // Validar caracteres especiales (bonus)
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Determinar mensaje y color según score
    let message = '';
    let color = '';

    if (score <= 2) {
      message = 'Débil';
      color = '#f44336';
    } else if (score === 3) {
      message = 'Media';
      color = '#ff9800';
    } else if (score === 4) {
      message = 'Fuerte';
      color = '#4caf50';
    } else {
      message = 'Muy fuerte';
      color = '#2196f3';
    }

    setStrength({ score, message, color });
  };

  return { strength, checkPasswordStrength };
};
