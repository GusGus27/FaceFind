import React, { useState, useEffect } from 'react';
import '../../styles/camera/CameraConfig.css';

interface CameraSettings {
    type: 'USB' | 'IP';
    resolution: string;
    fps: number;
    url: string;
    deviceId?: string;
}

interface CameraConfigProps {
    onConfigChange: (config: CameraSettings) => void;
}

interface MediaDeviceInfo {
    deviceId: string;
    label: string;
}

const CameraConfig: React.FC<CameraConfigProps> = ({ onConfigChange }) => {
    const [config, setConfig] = useState<CameraSettings>({
        type: 'USB',
        resolution: '640x480',
        fps: 30,
        url: '',
        deviceId: ''
    });

    const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
    const [loadingDevices, setLoadingDevices] = useState<boolean>(false);

    // Cargar dispositivos de video disponibles
    useEffect(() => {
        loadVideoDevices();
    }, []);

    const loadVideoDevices = async () => {
        setLoadingDevices(true);
        try {
            // Solicitar permisos primero
            await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Obtener lista de dispositivos
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices
                .filter(device => device.kind === 'videoinput')
                .map((device, index) => ({
                    deviceId: device.deviceId,
                    label: device.label || `Cámara ${index + 1}`
                }));
            
            setAvailableDevices(videoDevices);
            
            // Si hay dispositivos, seleccionar el primero por defecto
            if (videoDevices.length > 0 && !config.deviceId) {
                const newConfig = { ...config, deviceId: videoDevices[0].deviceId };
                setConfig(newConfig);
                onConfigChange(newConfig);
            }
            
            console.log('📹 Dispositivos de video detectados:', videoDevices);
        } catch (error) {
            console.error('Error al obtener dispositivos de video:', error);
        } finally {
            setLoadingDevices(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        const newConfig = { 
            ...config, 
            [name]: name === 'fps' ? parseInt(value) : value 
        };
        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    return (
        <div className="camera-config">
            <h3>Configuración de Cámara</h3>
            <div className="config-form">
                <div className="form-group">
                    <label>Tipo de Cámara:</label>
                    <select 
                        name="type" 
                        value={config.type} 
                        onChange={handleChange}
                    >
                        <option value="USB">Cámara USB</option>
                        <option value="IP">Cámara IP</option>
                    </select>
                </div>

                {config.type === 'USB' && (
                    <div className="form-group">
                        <label>Seleccionar Cámara USB:</label>
                        <select 
                            name="deviceId" 
                            value={config.deviceId || ''} 
                            onChange={handleChange}
                            disabled={loadingDevices || availableDevices.length === 0}
                        >
                            {loadingDevices ? (
                                <option value="">Cargando dispositivos...</option>
                            ) : availableDevices.length === 0 ? (
                                <option value="">No se detectaron cámaras</option>
                            ) : (
                                availableDevices.map((device) => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label}
                                    </option>
                                ))
                            )}
                        </select>
                        <button 
                            type="button" 
                            onClick={loadVideoDevices}
                            className="refresh-devices-btn"
                            style={{ marginTop: '8px', padding: '6px 12px', cursor: 'pointer' }}
                        >
                            🔄 Actualizar lista
                        </button>
                    </div>
                )}

                {config.type === 'IP' && (
                    <div className="form-group">
                        <label>URL de la Cámara:</label>
                        <input
                            type="text"
                            name="url"
                            value={config.url}
                            onChange={handleChange}
                            placeholder="http://192.168.1.X:8080/video"
                        />
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            Ejemplos: http://192.168.1.100:8080/video (IP Webcam) o rtsp://...
                        </small>
                    </div>
                )}

                <div className="form-group">
                    <label>Resolución:</label>
                    <select 
                        name="resolution" 
                        value={config.resolution} 
                        onChange={handleChange}
                    >
                        <option value="640x480">640x480</option>
                        <option value="1280x720">1280x720</option>
                        <option value="1920x1080">1920x1080</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>FPS:</label>
                    <select 
                        name="fps" 
                        value={config.fps} 
                        onChange={handleChange}
                    >
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="60">60</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CameraConfig;