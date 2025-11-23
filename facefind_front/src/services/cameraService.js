/**
 * Camera Service - Servicio para gestión de cámaras
 * HU-11: Gestión de Múltiples Cámaras
 */

const API_URL = 'http://localhost:5000';

/**
 * Obtiene todas las cámaras del sistema
 */
export const getAllCameras = async () => {
    try {
        const response = await fetch(`${API_URL}/cameras`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener cámaras');
        }

        return data;
    } catch (error) {
        console.error('Error en getAllCameras:', error);
        throw error;
    }
};

/**
 * Obtiene una cámara específica por ID
 */
export const getCameraById = async (cameraId) => {
    try {
        const response = await fetch(`${API_URL}/cameras/${cameraId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener cámara');
        }

        return data;
    } catch (error) {
        console.error(`Error en getCameraById(${cameraId}):`, error);
        throw error;
    }
};

/**
 * Crea una nueva cámara
 */
export const createCamera = async (cameraData) => {
    try {
        console.log('🚀 Enviando petición a:', `${API_URL}/cameras`);
        console.log('📦 Datos enviados:', cameraData);
        
        const response = await fetch(`${API_URL}/cameras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cameraData),
        });

        console.log('📥 Estado de respuesta:', response.status);
        
        const data = await response.json();
        console.log('📄 Datos recibidos:', data);

        if (!response.ok) {
            throw new Error(data.error || 'Error al crear cámara');
        }

        return data;
    } catch (error) {
        console.error('❌ Error en createCamera:', error);
        if (error.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
        }
        throw error;
    }
};

/**
 * Actualiza una cámara existente
 */
export const updateCamera = async (cameraId, cameraData) => {
    try {
        const response = await fetch(`${API_URL}/cameras/${cameraId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cameraData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar cámara');
        }

        return data;
    } catch (error) {
        console.error(`Error en updateCamera(${cameraId}):`, error);
        throw error;
    }
};

/**
 * Elimina una cámara del sistema
 */
export const deleteCamera = async (cameraId) => {
    try {
        const response = await fetch(`${API_URL}/cameras/${cameraId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar cámara');
        }

        return data;
    } catch (error) {
        console.error(`Error en deleteCamera(${cameraId}):`, error);
        throw error;
    }
};

/**
 * Obtiene solo las cámaras activas
 */
export const getActiveCameras = async () => {
    try {
        const response = await fetch(`${API_URL}/cameras/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener cámaras activas');
        }

        return data;
    } catch (error) {
        console.error('Error en getActiveCameras:', error);
        throw error;
    }
};

/**
 * Alterna el estado activo/inactivo de una cámara
 */
export const toggleCameraStatus = async (cameraId) => {
    try {
        const response = await fetch(`${API_URL}/cameras/${cameraId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al cambiar estado de cámara');
        }

        return data;
    } catch (error) {
        console.error(`Error en toggleCameraStatus(${cameraId}):`, error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de las cámaras
 */
export const getCamerasStats = async () => {
    try {
        const response = await fetch(`${API_URL}/cameras/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener estadísticas');
        }

        return data;
    } catch (error) {
        console.error('Error en getCamerasStats:', error);
        throw error;
    }
};

/**
 * Detecta cámaras USB disponibles en el sistema
 */
export const detectUSBCameras = async () => {
    try {
        const response = await fetch(`${API_URL}/cameras/usb/detect`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al detectar cámaras USB');
        }

        return data;
    } catch (error) {
        console.error('Error en detectUSBCameras:', error);
        throw error;
    }
};

/**
 * Obtiene la URL del stream de video de una cámara
 */
export const getStreamUrl = (cameraId) => {
    return `${API_URL}/cameras/${cameraId}/stream`;
};
