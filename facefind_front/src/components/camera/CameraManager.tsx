import React, { useState, useEffect } from 'react';
import CameraGrid from './CameraGrid';
import '../../styles/camera/CameraManager.css';
import { 
    getAllCameras, 
    createCamera, 
    updateCamera, 
    deleteCamera, 
    toggleCameraStatus,
    getCamerasStats,
    detectUSBCameras 
} from '../../services/cameraService';

interface Camera {
    id?: number;
    nombre: string;
    type: 'USB' | 'IP';
    ubicacion: string;
    activa: boolean;
    url?: string;
    resolution?: string;
    fps?: number;
    ip?: string;
    created_at?: string;
    updated_at?: string;
}

interface USBDevice {
    deviceId: string;
    label: string;
}

const CameraManager: React.FC = () => {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [availableUSBDevices, setAvailableUSBDevices] = useState<USBDevice[]>([]);
    const [loadingUSBDevices, setLoadingUSBDevices] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [formData, setFormData] = useState<Camera>({
        nombre: '',
        type: 'USB',
        ubicacion: '',
        activa: true,
        url: '',
        resolution: '1920x1080',
        fps: 30
    });

    useEffect(() => {
        loadCameras();
        loadStats();
    }, []);

    // Sincronizar selectedDeviceId con formData.url cuando se abre el modal de edición
    useEffect(() => {
        if (showModal && editingCamera && editingCamera.type === 'USB' && editingCamera.url) {
            console.log('🔄 Sincronizando deviceId desde formData:', editingCamera.url);
            setSelectedDeviceId(editingCamera.url);
        }
    }, [showModal, editingCamera]);

    const loadCameras = async () => {
        try {
            setLoading(true);
            const response = await getAllCameras();
            if (response.success) {
                setCameras(response.data || []);
            } else {
                setCameras([]);
            }
        } catch (error) {
            console.error('Error cargando cámaras:', error);
            // No mostrar alerta si es la primera carga, solo establecer cámaras vacías
            setCameras([]);
            // Solo mostrar error si no es un problema de conexión inicial
            if (error.message && !error.message.includes('conectar al servidor')) {
                console.warn('⚠️ No se pudieron cargar las cámaras. Iniciando con lista vacía.');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await getCamerasStats();
            if (response.success) {
                setStats(response.data);
            } else {
                // Establecer stats en 0 si no hay datos
                setStats({
                    total: 0,
                    activas: 0,
                    inactivas: 0,
                    usb: 0,
                    ip: 0
                });
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            // Establecer stats en 0 en caso de error
            setStats({
                total: 0,
                activas: 0,
                inactivas: 0,
                usb: 0,
                ip: 0
            });
        }
    };

    const detectBrowserUSBCameras = async () => {
        setLoadingUSBDevices(true);
        try {
            // Solicitar permisos primero
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Detener el stream inmediatamente (solo necesitamos permisos)
            stream.getTracks().forEach(track => track.stop());
            
            // Obtener lista de dispositivos
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices
                .filter(device => device.kind === 'videoinput')
                .map((device, index) => ({
                    deviceId: String(index), // Usar el índice como deviceId (0, 1, 2...)
                    label: device.label || `Cámara USB ${index + 1}`
                }));
            
            console.log('📹 Cámaras USB detectadas:', videoDevices);
            console.log('🎯 Índice actualmente seleccionado:', selectedDeviceId);
            
            setAvailableUSBDevices(videoDevices);
            
            // Solo seleccionar la primera automáticamente si:
            // 1. Hay dispositivos disponibles
            // 2. No hay ninguno seleccionado actualmente
            // 3. O el seleccionado ya no existe en la lista
            const currentExists = videoDevices.some(d => d.deviceId === selectedDeviceId);
            
            if (videoDevices.length > 0) {
                if (!selectedDeviceId || !currentExists) {
                    const firstDeviceId = videoDevices[0].deviceId;
                    console.log('🔄 Auto-seleccionando primera cámara (índice ' + firstDeviceId + '):', videoDevices[0].label);
                    setSelectedDeviceId(firstDeviceId);
                } else {
                    console.log('✅ Manteniendo cámara seleccionada (índice ' + selectedDeviceId + ')');
                }
            }
            
        } catch (error) {
            console.error('Error al detectar cámaras USB:', error);
            alert('No se pudo acceder a las cámaras USB. Verifica los permisos del navegador.');
        } finally {
            setLoadingUSBDevices(false);
        }
    };

    const handleOpenModal = async (camera: Camera | null = null) => {
        // Primero detectar cámaras disponibles
        await detectBrowserUSBCameras();
        
        if (camera) {
            console.log('📝 Editando cámara:', camera);
            setEditingCamera(camera);
            setFormData(camera);
            
            // Seleccionar el deviceId guardado
            if (camera.type === 'USB' && camera.url) {
                console.log('🔍 Intentando seleccionar deviceId guardado:', camera.url);
                setSelectedDeviceId(camera.url);
            } else {
                setSelectedDeviceId(camera.url || '');
            }
        } else {
            console.log('➕ Creando nueva cámara');
            setEditingCamera(null);
            setFormData({
                nombre: '',
                type: 'USB',
                ubicacion: '',
                activa: true,
                url: '',
                resolution: '1920x1080',
                fps: 30
            });
            setSelectedDeviceId('');
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCamera(null);
        setFormData({
            nombre: '',
            type: 'USB',
            ubicacion: '',
            activa: true,
            url: '',
            resolution: '1920x1080',
            fps: 30
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Si cambia el tipo de cámara a USB, detectar dispositivos
        if (name === 'type' && value === 'USB' && availableUSBDevices.length === 0) {
            detectBrowserUSBCameras();
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        console.log('🔄 Cambiando a dispositivo:', deviceId);
        
        setSelectedDeviceId(deviceId);
        
        // Actualizar la URL del formData con el deviceId seleccionado
        setFormData(prev => ({
            ...prev,
            url: deviceId
        }));
        
        // Buscar el nombre de la cámara seleccionada
        const selectedCamera = availableUSBDevices.find(d => d.deviceId === deviceId);
        if (selectedCamera) {
            console.log('✅ Cámara seleccionada:', selectedCamera.label);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!formData.nombre.trim()) {
            alert('El nombre es obligatorio');
            return;
        }

        if (!formData.ubicacion.trim()) {
            alert('La ubicación es obligatoria');
            return;
        }

        if (formData.type === 'IP' && !formData.url?.trim()) {
            alert('La URL es obligatoria para cámaras IP');
            return;
        }

        if (formData.type === 'USB' && !selectedDeviceId) {
            alert('Debes seleccionar una cámara USB');
            return;
        }

        // Para cámaras USB, guardar el deviceId en el campo url
        const dataToSend = {
            ...formData,
            url: formData.type === 'USB' ? selectedDeviceId : formData.url
        };

        try {
            console.log('📤 Enviando datos:', dataToSend);
            
            if (editingCamera && editingCamera.id) {
                // Actualizar cámara existente
                const response = await updateCamera(editingCamera.id, dataToSend);
                console.log('✅ Respuesta actualización:', response);
                if (response.success) {
                    alert('Cámara actualizada exitosamente');
                    loadCameras();
                    loadStats();
                    handleCloseModal();
                }
            } else {
                // Crear nueva cámara
                const response = await createCamera(dataToSend);
                console.log('✅ Respuesta creación:', response);
                if (response.success) {
                    alert('Cámara creada exitosamente');
                    loadCameras();
                    loadStats();
                    handleCloseModal();
                }
            }
        } catch (error: any) {
            console.error('❌ Error guardando cámara:', error);
            console.error('Error completo:', error);
            
            // Mostrar error más detallado
            let errorMessage = 'Error al guardar la cámara';
            if (error.message) {
                errorMessage = error.message;
            }
            if (error.message === 'Failed to fetch') {
                errorMessage = 'No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:5000';
            }
            
            alert(errorMessage);
        }
    };

    const handleDelete = async (cameraId: number) => {
        try {
            const response = await deleteCamera(cameraId);
            if (response.success) {
                alert('Cámara eliminada exitosamente');
                loadCameras();
                loadStats();
            }
        } catch (error: any) {
            console.error('Error eliminando cámara:', error);
            alert(error.message || 'Error al eliminar la cámara');
        }
    };

    const handleToggleStatus = async (cameraId: number) => {
        try {
            const response = await toggleCameraStatus(cameraId);
            if (response.success) {
                loadCameras();
                loadStats();
            }
        } catch (error: any) {
            console.error('Error cambiando estado de cámara:', error);
            alert(error.message || 'Error al cambiar el estado de la cámara');
        }
    };

    if (loading) {
        return <div className="camera-manager-loading">Cargando cámaras...</div>;
    }

    const handleDetectUSB = async () => {
        try {
            const response = await detectUSBCameras();
            if (response.success && response.data) {
                const usbCameras = response.data;
                if (usbCameras.length === 0) {
                    alert('No se detectaron cámaras USB en el sistema');
                } else {
                    alert(`Se detectaron ${usbCameras.length} cámara(s) USB:\n${usbCameras.map(c => c.name).join('\n')}`);
                }
            }
        } catch (error: any) {
            console.error('Error detectando USB:', error);
            alert(error.message || 'Error al detectar cámaras USB');
        }
    };

    return (
        <div className="camera-manager">
            <div className="camera-manager-header">
                <h2>Gestión de Múltiples Cámaras</h2>
                <div className="header-buttons">
                    <button className="btn-detect-usb" onClick={handleDetectUSB}>
                        🔍 Detectar USB
                    </button>
                    <button className="btn-add-camera" onClick={() => handleOpenModal()}>
                        + Agregar Cámara
                    </button>
                </div>
            </div>

            {stats && stats.total >= 0 && (
                <div className="camera-stats">
                    <div className="stat-card">
                        <h4>Total</h4>
                        <p className="stat-value">{stats.total}</p>
                    </div>
                    <div className="stat-card active">
                        <h4>Activas</h4>
                        <p className="stat-value">{stats.activas}</p>
                    </div>
                    <div className="stat-card inactive">
                        <h4>Inactivas</h4>
                        <p className="stat-value">{stats.inactivas}</p>
                    </div>
                    <div className="stat-card">
                        <h4>USB</h4>
                        <p className="stat-value">{stats.usb}</p>
                    </div>
                    <div className="stat-card">
                        <h4>IP</h4>
                        <p className="stat-value">{stats.ip}</p>
                    </div>
                </div>
            )}

            <CameraGrid
                cameras={cameras}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />

            {/* Modal para crear/editar cámara */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCamera ? 'Editar Cámara' : 'Nueva Cámara'}</h3>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre *</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="type">Tipo *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="USB">USB</option>
                                    <option value="IP">IP</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="ubicacion">Ubicación *</label>
                                <input
                                    type="text"
                                    id="ubicacion"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {formData.type === 'USB' && (
                                <div className="form-group">
                                    <label htmlFor="usbDevice">Seleccionar Cámara USB *</label>
                                    {loadingUSBDevices ? (
                                        <div className="loading-devices">
                                            <span>🔄 Detectando cámaras...</span>
                                        </div>
                                    ) : availableUSBDevices.length === 0 ? (
                                        <div className="no-devices">
                                            <p>⚠️ No se detectaron cámaras USB</p>
                                            <button 
                                                type="button" 
                                                onClick={detectBrowserUSBCameras}
                                                className="btn-refresh-devices"
                                            >
                                                🔄 Buscar nuevamente
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                id="usbDevice"
                                                name="usbDevice"
                                                value={selectedDeviceId}
                                                onChange={handleDeviceChange}
                                                required
                                            >
                                                <option value="">-- Selecciona una cámara --</option>
                                                {availableUSBDevices.map((device) => (
                                                    <option key={device.deviceId} value={device.deviceId}>
                                                        {device.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={detectBrowserUSBCameras}
                                                className="btn-refresh-devices"
                                                style={{ marginTop: '8px' }}
                                            >
                                                🔄 Actualizar lista
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {formData.type === 'IP' && (
                                <div className="form-group">
                                    <label htmlFor="url">URL *</label>
                                    <input
                                        type="text"
                                        id="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        placeholder="http://192.168.1.100:8080/video"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="resolution">Resolución</label>
                                <input
                                    type="text"
                                    id="resolution"
                                    name="resolution"
                                    value={formData.resolution}
                                    onChange={handleInputChange}
                                    placeholder="1920x1080"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fps">FPS</label>
                                <input
                                    type="number"
                                    id="fps"
                                    name="fps"
                                    value={formData.fps}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="120"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingCamera ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CameraManager;