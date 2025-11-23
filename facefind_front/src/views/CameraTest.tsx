import React, { useState } from 'react';
import CameraConfig from '../components/camera/CameraConfig';
import CameraViewer from '../components/camera/CameraViewer';
import '../styles/camera/CameraTest.css';

interface CameraSettings {
    type: 'USB' | 'IP';
    resolution: string;
    fps: number;
    url: string;
    deviceId?: string;
}

const CameraTest: React.FC = () => {
    const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
        type: 'USB',
        resolution: '640x480',
        fps: 30,
        url: '',
        deviceId: ''
    });

    const handleConfigChange = (config: CameraSettings) => {
        console.log('📝 Configuración actualizada:', config);
        setCameraSettings(config);
    };

    return (
        <div className="camera-test">
            <div className="camera-test-header">
                <h1>Prueba de Cámara en Vivo</h1>
                <p>Configura y prueba la cámara antes de agregarla al sistema</p>
            </div>
            
            <div className="camera-test-content">
                <div className="config-section">
                    <CameraConfig onConfigChange={handleConfigChange} />
                </div>
                
                <div className="viewer-section">
                    <CameraViewer cameraSettings={cameraSettings} />
                </div>
            </div>
        </div>
    );
};

export default CameraTest;
