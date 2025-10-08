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

    const handleConfigChange = (config: CameraSettings) => {
        setCameraSettings(config);
    };

    const handleConnect = () => {
        if (cameraSettings) {
            setIsConnected(true);
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
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
                    {isConnected && <CameraViewer />}
                </div>
            </div>
        </div>
    );
};

export default CameraManager;