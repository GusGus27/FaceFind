import React, { useState, useRef, useEffect } from 'react';
import '../../styles/camera/CameraCard.css';
import { detectFaces } from '../../services/detectionService';

interface Camera {
    id: number;
    nombre: string;
    type: 'USB' | 'IP';
    ubicacion: string;
    activa: boolean;
    url?: string;
    resolution?: string;
    fps?: number;
}

interface CameraCardProps {
    camera: Camera;
    onEdit: (camera: Camera) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
}

interface FaceResult {
    face_id: number;
    best_match_name: string;
    match_found: boolean;
    similarity_percentage: number;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const CameraCard: React.FC<CameraCardProps> = ({ camera, onEdit, onDelete, onToggleStatus }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognizedFaces, setRecognizedFaces] = useState<FaceResult[]>([]);
    const [isRealTimeActive, setIsRealTimeActive] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<number | null>(null);

    const handleEdit = () => {
        onEdit(camera);
    };

    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de eliminar la cámara "${camera.nombre}"?`)) {
            onDelete(camera.id);
        }
    };

    const handleToggleStatus = () => {
        onToggleStatus(camera.id);
    };

    // Limpiar intervalo al desmontar
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Capturar frame y reconocer rostros
    const captureAndRecognize = async () => {
        if (!camera.activa || isProcessing) return;

        try {
            setIsProcessing(true);
            console.log(`📸 Capturando frame de cámara: ${camera.nombre}`);
            
            // Obtener la imagen del stream
            const img = document.querySelector(`img[alt="Stream de ${camera.nombre}"]`) as HTMLImageElement;
            if (!img || !img.complete) {
                console.warn('⚠️ Imagen no disponible para captura');
                return;
            }

            // Crear canvas temporal para capturar el frame
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.naturalWidth || 640;
            canvas.height = img.naturalHeight || 480;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convertir canvas a base64
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            console.log('📤 Enviando imagen al servicio de detección...');

            // Usar el servicio de detección
            const result = await detectFaces(imageData);

            if (result.success && result.data) {
                const faces = result.data.faces || [];
                console.log(`✅ Detección exitosa: ${faces.length} rostro(s) detectado(s)`);
                
                setRecognizedFaces(faces);
                drawBoundingBoxes(faces);

                // Log de cada rostro detectado
                faces.forEach((face: FaceResult, idx: number) => {
                    if (face.match_found) {
                        console.log(`   ${idx + 1}. ✓ ${face.best_match_name} (${face.similarity_percentage.toFixed(1)}%)`);
                    } else {
                        console.log(`   ${idx + 1}. ? Desconocido`);
                    }
                });
            } else {
                console.log('ℹ️ No se detectaron rostros');
                setRecognizedFaces([]);
                clearBoundingBoxes();
            }
        } catch (error: any) {
            console.error('❌ Error en reconocimiento:', error);
            console.error('   Mensaje:', error.message);
            setRecognizedFaces([]);
            clearBoundingBoxes();
            
            // Mostrar error al usuario solo si es crítico
            if (error.message && error.message.includes('conectar al servidor')) {
                // No mostrar alert en cada frame, solo loggear
                console.error('⚠️ Servidor de detección no disponible');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Dibujar bounding boxes
    const drawBoundingBoxes = (faces: FaceResult[]) => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const ctx = overlay.getContext('2d');
        if (!ctx) return;

        const img = document.querySelector(`img[alt="Stream de ${camera.nombre}"]`) as HTMLImageElement;
        if (!img || !img.complete) return;

        // Obtener dimensiones reales
        const displayWidth = img.clientWidth;
        const displayHeight = img.clientHeight;
        const naturalWidth = img.naturalWidth || 640;
        const naturalHeight = img.naturalHeight || 480;

        // Calcular escala
        const scaleX = displayWidth / naturalWidth;
        const scaleY = displayHeight / naturalHeight;

        // Ajustar tamaño del canvas overlay
        overlay.width = displayWidth;
        overlay.height = displayHeight;

        // Limpiar canvas
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        console.log('🎨 Dibujando boxes:', {
            faces: faces.length,
            displaySize: `${displayWidth}x${displayHeight}`,
            naturalSize: `${naturalWidth}x${naturalHeight}`,
            scale: `${scaleX.toFixed(2)}x${scaleY.toFixed(2)}`
        });

        // Configurar estilo
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px Arial';

        faces.forEach((face) => {
            const { x, y, width, height } = face.bbox;
            
            // Escalar coordenadas
            const scaledX = x * scaleX;
            const scaledY = y * scaleY;
            const scaledWidth = width * scaleX;
            const scaledHeight = height * scaleY;
            
            console.log('📦 Box:', { original: face.bbox, scaled: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight } });
            
            // Dibujar rectángulo
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            
            // Dibujar nombre si hay match
            if (face.match_found && face.best_match_name) {
                const text = `${face.best_match_name} (${face.similarity_percentage.toFixed(1)}%)`;
                ctx.font = 'bold 16px Arial';
                const textWidth = ctx.measureText(text).width;
                
                // Fondo del texto
                ctx.fillStyle = 'rgba(0, 255, 0, 0.85)';
                ctx.fillRect(scaledX, scaledY - 25, textWidth + 12, 25);
                
                // Texto
                ctx.fillStyle = '#000000';
                ctx.fillText(text, scaledX + 6, scaledY - 6);
            } else {
                // Sin match - cuadro rojo
                ctx.strokeStyle = '#ff0000';
                ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
                
                const text = 'Desconocido';
                ctx.font = 'bold 16px Arial';
                const textWidth = ctx.measureText(text).width;
                
                ctx.fillStyle = 'rgba(255, 0, 0, 0.85)';
                ctx.fillRect(scaledX, scaledY - 25, textWidth + 12, 25);
                
                ctx.fillStyle = '#ffffff';
                ctx.fillText(text, scaledX + 6, scaledY - 6);
            }
        });
    };

    // Limpiar bounding boxes
    const clearBoundingBoxes = () => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const ctx = overlay.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, overlay.width, overlay.height);
    };

    // Iniciar reconocimiento automático
    const startRealTimeRecognition = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setIsRealTimeActive(true);
        
        // Primera ejecución inmediata
        captureAndRecognize();
        
        // Configurar intervalo (cada 3 segundos)
        intervalRef.current = window.setInterval(() => {
            captureAndRecognize();
        }, 3000);
    };

    // Detener reconocimiento automático
    const stopRealTimeRecognition = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRealTimeActive(false);
        setRecognizedFaces([]);
        clearBoundingBoxes();
    };

    return (
        <div className={`camera-card ${camera.activa ? 'active' : 'inactive'}`}>
            <div className="camera-card-header">
                <div className="header-left">
                    <h3>{camera.nombre}</h3>
                    <span className="camera-location">📍 {camera.ubicacion}</span>
                </div>
                <div className="header-right">
                    <span className={`status-badge ${camera.activa ? 'active' : 'inactive'}`}>
                        {camera.activa ? '🟢 Activa' : '🔴 Inactiva'}
                    </span>
                    <span className="camera-type-badge">{camera.type}</span>
                </div>
            </div>

            <div className="camera-card-body">

                {/* Vista de cámara con streaming */}
                <div className="camera-preview-container">
                    <div className="camera-preview">
                        {camera.activa ? (
                            <div className="video-wrapper">
                                <img 
                                    src={`http://localhost:5000/cameras/${camera.id}/stream`}
                                    alt={`Stream de ${camera.nombre}`}
                                    className="camera-stream"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        const placeholder = document.querySelector('.preview-placeholder');
                                        if (placeholder) {
                                            (placeholder as HTMLElement).style.display = 'flex';
                                        }
                                    }}
                                    onLoad={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        const overlay = overlayRef.current;
                                        if (overlay) {
                                            overlay.width = img.clientWidth;
                                            overlay.height = img.clientHeight;
                                        }
                                    }}
                                />
                                <canvas
                                    ref={overlayRef}
                                    className="camera-overlay"
                                />
                                {isProcessing && (
                                    <div className="processing-indicator">
                                        <div className="spinner"></div>
                                        <span>Procesando...</span>
                                    </div>
                                )}
                            </div>
                        ) : null}
                        <div className="preview-placeholder" style={{ display: camera.activa ? 'none' : 'flex' }}>
                            <i className="camera-icon">📹</i>
                            <p>{camera.activa ? 'Conectando...' : 'Cámara Inactiva'}</p>
                        </div>
                        
                        {/* Canvas oculto para captura */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Resultados de reconocimiento */}
                    {camera.activa && recognizedFaces.length > 0 && (
                        <div className="recognition-results">
                            <div className="results-header">
                                <span className="results-icon">👤</span>
                                <h4>Detectados ({recognizedFaces.length})</h4>
                            </div>
                            <div className="results-list">
                                {recognizedFaces.map((face, idx) => (
                                    <div key={idx} className={`result-item ${face.match_found ? 'match' : 'no-match'}`}>
                                        {face.match_found ? (
                                            <>
                                                <span className="result-icon">✅</span>
                                                <span className="result-name">{face.best_match_name}</span>
                                                <span className="result-confidence">{face.similarity_percentage.toFixed(1)}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="result-icon">❓</span>
                                                <span className="result-name">Desconocido</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="camera-card-footer">
                {camera.activa && (
                    <div className="recognition-controls">
                        <button 
                            className="btn-recognize"
                            onClick={captureAndRecognize}
                            disabled={isProcessing || isRealTimeActive}
                            title="Capturar y reconocer rostros en este frame"
                        >
                            <span className="btn-icon">📸</span>
                            {isProcessing ? 'Procesando...' : 'Reconocer'}
                        </button>
                        <button 
                            className={`btn-auto ${isRealTimeActive ? 'active' : ''}`}
                            onClick={isRealTimeActive ? stopRealTimeRecognition : startRealTimeRecognition}
                            title={isRealTimeActive ? 'Detener reconocimiento automático cada 3seg' : 'Iniciar reconocimiento automático cada 3seg'}
                        >
                            <span className="btn-icon">{isRealTimeActive ? '⏹' : '▶'}</span>
                            {isRealTimeActive ? 'Detener' : 'Auto'}
                        </button>
                    </div>
                )}
                <div className="camera-controls">
                    <button 
                        className={`btn-toggle ${camera.activa ? 'btn-deactivate' : 'btn-activate'}`}
                        onClick={handleToggleStatus}
                        title={camera.activa ? 'Desactivar cámara' : 'Activar cámara'}
                    >
                        {camera.activa ? '🔴 Desactivar' : '🟢 Activar'}
                    </button>
                    <button 
                        className="btn-edit"
                        onClick={handleEdit}
                        title="Editar configuración de cámara"
                    >
                        ⚙️ Editar
                    </button>
                    <button 
                        className="btn-delete"
                        onClick={handleDelete}
                        title="Eliminar cámara"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CameraCard;
