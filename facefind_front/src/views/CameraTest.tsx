import React, { useState, useEffect } from 'react';
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

interface Caso {
    id: number;
    lugar_desaparicion: string;
    status: string;
}

const CameraTest: React.FC = () => {
    const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
        type: 'USB',
        resolution: '640x480',
        fps: 30,
        url: '',
        deviceId: ''
    });

    // Estados para alertas automáticas
    const [casosActivos, setCasosActivos] = useState<Caso[]>([]);
    const [casoSeleccionado, setCasoSeleccionado] = useState<number | null>(null);
    const [ubicacionCamara, setUbicacionCamara] = useState<string>('');
    const [camaraId, setCamaraId] = useState<number>(1);

    // Cargar casos activos al montar
    useEffect(() => {
        fetch('http://localhost:5000/casos/')
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('Casos recibidos del backend:', data);
                
                // El backend puede retornar { data: [...], count: X } o directamente [...]
                const casos = Array.isArray(data) ? data : (data.data || []);
                
                const activos = casos.filter((c: Caso) => c.status === 'activo');
                console.log('Casos activos filtrados:', activos);
                
                setCasosActivos(activos);
                if (activos.length > 0) {
                    setCasoSeleccionado(activos[0].id);
                }
            })
            .catch(err => {
                console.error('Error cargando casos:', err);
                setCasosActivos([]);
            });
    }, []);

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
                    
                    {/* Configuración de Alertas */}
                    <div className="alert-config">
                        <h3>⚡ Sistema de Alertas y Evidencias</h3>
                        
                        <div className="info-box">
                            <p><strong>✅ Detección Automática:</strong></p>
                            <p>El sistema crea alertas automáticamente cuando detecta un rostro conocido. El caso se identifica automáticamente desde la base de datos.</p>
                        </div>
                        
                        <div className="form-group">
                            <label>Casos Activos en el Sistema:</label>
                            <select disabled value={casoSeleccionado || ''}>
                                <option value="">Cargando casos...</option>
                                {casosActivos.map(caso => (
                                    <option key={caso.id} value={caso.id}>
                                        #{caso.id} - {caso.lugar_desaparicion}
                                    </option>
                                ))}
                            </select>
                            <small>Solo informativo - El caso se detecta automáticamente al reconocer un rostro</small>
                        </div>
                        
                        <div className="form-group">
                            <label>ID Cámara:</label>
                            <input 
                                type="number" 
                                value={camaraId} 
                                onChange={(e) => setCamaraId(Number(e.target.value))}
                                min="1"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Ubicación:</label>
                            <input 
                                type="text" 
                                value={ubicacionCamara} 
                                onChange={(e) => setUbicacionCamara(e.target.value)}
                                placeholder="Ej: Plaza Mayor, Entrada principal..."
                            />
                        </div>
                    </div>
                </div>
                
                <div className="viewer-section">
                    <CameraViewer 
                        cameraSettings={cameraSettings}
                        casoId={casoSeleccionado || undefined}
                        cameraId={camaraId}
                        ubicacion={ubicacionCamara || 'Ubicación no especificada'}
                    />
                </div>
            </div>
        </div>
    );
};

export default CameraTest;
