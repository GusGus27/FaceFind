/**
 * Detection Service - Servicio para reconocimiento facial
 * Conecta con el backend de detección de rostros
 */

const API_URL = 'http://localhost:5000';

/**
 * Detecta rostros en una imagen
 * @param {string} imageBase64 - Imagen en formato base64
 * @returns {Promise} - Resultado con rostros detectados
 */
export const detectFaces = async (imageBase64) => {
    try {
        console.log('🔍 Enviando imagen para detección de rostros...');
        
        const response = await fetch(`${API_URL}/detection/detect-faces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageBase64 }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en detección de rostros');
        }

        console.log('✅ Detección completada:', {
            rostros: data.data?.faces_detected || 0,
            timestamp: data.data?.timestamp
        });

        return data;
    } catch (error) {
        console.error('❌ Error en detectFaces:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar al servidor de detección. Verifica que el backend esté corriendo.');
        }
        throw error;
    }
};

/**
 * Inicializa el servicio de detección
 * @returns {Promise} - Estado de inicialización
 */
export const initializeDetectionService = async () => {
    try {
        const response = await fetch(`${API_URL}/detection/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ Error verificando servicio de detección:', error);
        throw error;
    }
};

/**
 * Recarga los encodings del servicio de detección
 * @returns {Promise} - Estado de la recarga
 */
export const reloadEncodings = async () => {
    try {
        console.log('🔄 Recargando encodings...');
        
        const response = await fetch(`${API_URL}/detection/reload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error recargando encodings');
        }

        console.log('✅ Encodings recargados:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en reloadEncodings:', error);
        throw error;
    }
};
