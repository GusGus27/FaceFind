import React, { useState, useEffect, useRef } from 'react';
import '../../styles/camera/CameraViewer.css';

interface FaceResult {
    face_id: number;
    best_match_name: string | null;
    match_found: boolean;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface RecognitionResult {
    faces: FaceResult[];
}

interface CameraSettings {
    type: 'USB' | 'IP';
    resolution: string;
    fps: number;
    url?: string;
}

interface CameraViewerProps {
    cameraSettings: CameraSettings;
}

const CameraViewer: React.FC<CameraViewerProps> = ({ cameraSettings }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const intervalRef = useRef<number | null>(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
    const [recognizedName, setRecognizedName] = useState<string>("Desconocido");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    
    // Estados para reconocimiento en tiempo real
    const [isRealTimeActive, setIsRealTimeActive] = useState<boolean>(false);
    const [intervalSeconds, setIntervalSeconds] = useState<number>(3);

    // Parsear dimensiones una sola vez
    const [videoWidth, videoHeight] = React.useMemo(() => {
        const [w, h] = cameraSettings.resolution.split('x').map(Number);
        return [w || 640, h || 480]; // Valores por defecto si falla el parseo
    }, [cameraSettings.resolution]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                // Si es cámara IP, usar URL directa
                if (cameraSettings.type === 'IP' && cameraSettings.url) {
                    if (videoRef.current) {
                        // Para cámaras IP con stream (MJPEG, HLS, etc)
                        videoRef.current.src = cameraSettings.url;
                        videoRef.current.onloadeddata = () => {
                            setIsConnected(true);
                            console.log('✅ Cámara IP conectada:', cameraSettings.url);
                        };
                        videoRef.current.onerror = (e) => {
                            console.error('❌ Error conectando cámara IP:', e);
                            setIsConnected(false);
                        };
                    }
                } else {
                    // Cámara USB local
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { 
                            width: { ideal: videoWidth },
                            height: { ideal: videoHeight },
                            frameRate: { ideal: cameraSettings.fps }
                        },
                    });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setIsConnected(true);
                    }
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setIsConnected(false);
            }
        };

        startCamera();

        return () => {
            // Limpiar stream de USB
            if (videoRef.current?.srcObject instanceof MediaStream) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            // Limpiar source de IP
            if (videoRef.current && cameraSettings.type === 'IP') {
                videoRef.current.src = '';
            }
        };
    }, [cameraSettings, videoWidth, videoHeight]);

    const captureAndRecognize = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        try {
            // Captura frame con dimensiones correctas
            context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
            const imageData = canvasRef.current.toDataURL('image/jpeg');

            // Llamada al backend (actualizado a nueva ruta)
            const response = await fetch('http://localhost:5000/detection/detect-faces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });

            const result = await response.json();

            if (result.success && result.data.faces.length > 0) {
                const faces: FaceResult[] = result.data.faces;

                // Actualiza estado de resultados
                setRecognitionResult({ faces });

                // Determina nombre reconocido del primer rostro
                const firstFace = faces[0];
                if (firstFace.match_found && firstFace.best_match_name) {
                    setRecognizedName(firstFace.best_match_name);
                } else {
                    setRecognizedName("Desconocido");
                }

                drawBoundingBoxes(faces);
            } else {
                setRecognitionResult(null);
                setRecognizedName("Desconocido");
                clearBoundingBoxes();
            }
        } catch (error) {
            console.error('Error en reconocimiento:', error);
            setRecognitionResult(null);
            setRecognizedName("Desconocido");
            clearBoundingBoxes();
        } finally {
            setIsProcessing(false);
        }
    };

    const drawBoundingBoxes = (faces: FaceResult[]) => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.font = '16px Arial';
        ctx.fillStyle = 'lime';

        faces.forEach(face => {
            const { x, y, width, height } = face.bbox;
            ctx.strokeRect(x, y, width, height);
            if (face.match_found && face.best_match_name) {
                ctx.fillText(face.best_match_name, x, y - 5);
            }
        });
    };

    const clearBoundingBoxes = () => {
        if (!overlayRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') captureAndRecognize();
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Funciones para reconocimiento en tiempo real
    const startRealTimeRecognition = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setIsRealTimeActive(true);
        
        // Ejecutar inmediatamente la primera vez
        captureAndRecognize();
        
        // Configurar intervalo
        intervalRef.current = window.setInterval(() => {
            captureAndRecognize();
        }, intervalSeconds * 1000);
    };

    const stopRealTimeRecognition = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsRealTimeActive(false);
        clearBoundingBoxes();
        setRecognizedName("Desconocido");
    };

    // Limpiar intervalo al desmontar componente
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="camera-viewer">
            <div className="camera-status">
                <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
                <p>Resolución: {cameraSettings.resolution} @ {cameraSettings.fps} FPS</p>
                {isProcessing && <p>Procesando...</p>}
            </div>

            <div className="camera-container" style={{ position: 'relative', width: videoWidth, height: videoHeight }}>
                <video
                    ref={videoRef}
                    width={videoWidth}
                    height={videoHeight}
                    autoPlay
                    playsInline
                    muted
                    style={{ position: 'absolute', top: 0, left: 0 }}
                />
                <canvas
                    ref={overlayRef}
                    width={videoWidth}
                    height={videoHeight}
                    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    width={videoWidth}
                    height={videoHeight}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="camera-controls">
                <button
                    onClick={captureAndRecognize}
                    disabled={isProcessing || !isConnected || isRealTimeActive}
                >
                    {isProcessing ? 'Procesando...' : 'Reconocer Frame (o ESPACIO)'}
                </button>
                
                <div className="real-time-controls">
                    <label htmlFor="interval">Intervalo (segundos):</label>
                    <input
                        id="interval"
                        type="number"
                        min="1"
                        max="30"
                        value={intervalSeconds}
                        onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                        disabled={isRealTimeActive}
                        style={{ width: '60px', marginLeft: '10px', marginRight: '10px' }}
                    />
                    
                    <button
                        onClick={isRealTimeActive ? stopRealTimeRecognition : startRealTimeRecognition}
                        disabled={!isConnected}
                        className={isRealTimeActive ? 'stop-button' : 'start-button'}
                    >
                        {isRealTimeActive ? '⏹ Detener Reconocimiento Automático' : '▶ Iniciar Reconocimiento Automático'}
                    </button>
                </div>
            </div>

            {/* Mostrar "Quién soy" debajo de la cámara */}
            <div className="camera-identity" style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>
                <p>Quién soy: {recognizedName}</p>
            </div>
        </div>
    );
};

export default CameraViewer;
