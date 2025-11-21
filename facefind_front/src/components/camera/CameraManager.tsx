import React, { useState } from 'react';
import CameraViewer from './CameraViewer';
import CameraConfig from './CameraConfig';
import '../../styles/camera/CameraManager.css';

interface CameraSettings {
    type: 'USB' | 'IP';
    resolution: string;
    fps: number;
    url?: string;
}

const CameraManager: React.FC = () => {
    const [cameraSettings, setCameraSettings] = useState<CameraSettings | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionKey, setConnectionKey] = useState(0); // Key para forzar remontaje

    const handleConfigChange = (config: CameraSettings) => {
        setCameraSettings(config);
    };

    const handleConnect = () => {
        if (cameraSettings) {
            // Validar que si es cámara IP, tenga URL
            if (cameraSettings.type === 'IP' && (!cameraSettings.url || cameraSettings.url.trim() === '')) {
                alert('Por favor ingresa una URL válida para la cámara IP');
                return;
            }
            
            console.log('🔌 Conectando cámara con configuración:', cameraSettings);
            setIsConnected(true);
            setConnectionKey(prev => prev + 1); // Incrementar key para nueva conexión
        }
    };

    const handleDisconnect = () => {
        console.log('🔌 Desconectando cámara...');
        setIsConnected(false);
        // El componente se desmontará automáticamente y limpiará recursos
    };

    return (
        <div className="camera-manager">
            <h2>Gestión de Cámara</h2>
            
            <div className="camera-sections">
                <div className="config-section">
                    <CameraConfig onConfigChange={handleConfigChange} />
                    <div className="connection-controls">
                        <button 
                            onClick={isConnected ? handleDisconnect : handleConnect}
                            className={isConnected ? 'disconnect' : 'connect'}
                        >
                            {isConnected ? 'Desconectar' : 'Conectar'}
                        </button>
                    </div>
                </div>

                <div className="viewer-section">
                    {isConnected && cameraSettings && (
                        <CameraViewer 
                            key={connectionKey} 
                            cameraSettings={cameraSettings} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CameraManager;