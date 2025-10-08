import React, { useState } from 'react';
import '../../styles/camera/CameraConfig.css';

interface CameraSettings {
    type: 'USB' | 'IP';
    resolution: string;
    fps: number;
    url: string;
}

interface CameraConfigProps {
    onConfigChange: (config: CameraSettings) => void;
}

const CameraConfig: React.FC<CameraConfigProps> = ({ onConfigChange }) => {
    const [config, setConfig] = useState<CameraSettings>({
        type: 'USB',
        resolution: '640x480',
        fps: 30,
        url: ''
    });

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

                {config.type === 'IP' && (
                    <div className="form-group">
                        <label>URL de la Cámara:</label>
                        <input
                            type="text"
                            name="url"
                            value={config.url}
                            onChange={handleChange}
                            placeholder="rtsp:// o http://"
                        />
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