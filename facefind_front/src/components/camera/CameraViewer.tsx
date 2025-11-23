import React, { useState, useEffect, useRef } from 'react';
import '../../styles/camera/CameraViewer.css';
import { detectFaces } from '../../services/detectionService';

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
    deviceId?: string;
}

interface CameraViewerProps {
    cameraSettings: CameraSettings;
}

const CameraViewer: React.FC<CameraViewerProps> = ({ cameraSettings }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null); // Para streams MJPEG
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);
    const intervalRef = useRef<number | null>(null);
    const mjpegConnectionRef = useRef<string | null>(null); // Para rastrear conexión MJPEG activa

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
    const [recognizedName, setRecognizedName] = useState<string>("Desconocido");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [useMjpeg, setUseMjpeg] = useState<boolean>(false); // Para saber si usar img o video
    
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
                if (cameraSettings.type === 'IP') {
                    if (!cameraSettings.url || cameraSettings.url.trim() === '') {
                        console.error('❌ Error: No se proporcionó URL para la cámara IP');
                        alert('Por favor ingresa una URL válida para la cámara IP');
                        setIsConnected(false);
                        return;
                    }
                    
                    console.log('🔗 Intentando conectar a cámara IP:', cameraSettings.url);
                    
                    // Detectar si es MJPEG (común en apps como IP Webcam)
                    const isMjpeg = cameraSettings.url.includes('/video') || 
                                   cameraSettings.url.includes('mjpeg') || 
                                   cameraSettings.url.includes(':8080');
                    
                    if (isMjpeg) {
                        console.log('📷 Detectado stream MJPEG, usando tag <img>');
                        setUseMjpeg(true);
                        
                        if (imgRef.current) {
                            // Timestamp para evitar cache
                            const urlWithTimestamp = cameraSettings.url + 
                                (cameraSettings.url.includes('?') ? '&' : '?') + 
                                '_t=' + Date.now();
                            
                            mjpegConnectionRef.current = cameraSettings.url; // Guardar referencia
                            imgRef.current.src = urlWithTimestamp;
                            
                            imgRef.current.onload = () => {
                                // Verificar que la imagen tenga dimensiones válidas
                                if (imgRef.current && imgRef.current.naturalWidth > 0) {
                                    setIsConnected(true);
                                    console.log('✅ Cámara IP (MJPEG) conectada exitosamente', {
                                        width: imgRef.current.naturalWidth,
                                        height: imgRef.current.naturalHeight
                                    });
                                } else {
                                    console.error('❌ Imagen sin dimensiones válidas');
                                    setIsConnected(false);
                                }
                            };
                            
                            imgRef.current.onerror = (e) => {
                                console.error('❌ Error conectando cámara IP MJPEG:', e);
                                setIsConnected(false);
                                alert(`No se pudo conectar a la cámara IP.\n\nURL: ${cameraSettings.url}\n\nVerifica:\n- La URL es correcta\n- El dispositivo está en la misma red\n- El servidor de la cámara está activo`);
                            };
                        }
                    } else {
                        console.log('🎥 Stream de video estándar (HLS/RTSP), usando tag <video>');
                        setUseMjpeg(false);
                        
                        if (videoRef.current) {
                            videoRef.current.src = cameraSettings.url;
                            
                            videoRef.current.onloadeddata = () => {
                                setIsConnected(true);
                                console.log('✅ Cámara IP conectada exitosamente');
                            };
                            
                            videoRef.current.onerror = (e) => {
                                console.error('❌ Error conectando cámara IP:', e);
                                console.error('URL intentada:', cameraSettings.url);
                                setIsConnected(false);
                                alert(`No se pudo conectar a la cámara IP.\n\nURL: ${cameraSettings.url}\n\nVerifica:\n- La URL es correcta\n- El dispositivo está en la misma red\n- El servidor de la cámara está activo`);
                            };
                        }
                    }
                } else if (cameraSettings.type === 'USB') {
                    // Cámara USB local
                    console.log('🔗 Intentando conectar a cámara USB...');
                    setUseMjpeg(false);
                    
                    // Configurar constraints para el dispositivo específico
                    const constraints: MediaStreamConstraints = {
                        video: { 
                            width: { ideal: videoWidth },
                            height: { ideal: videoHeight },
                            frameRate: { ideal: cameraSettings.fps }
                        }
                    };
                    
                    // Si se especificó un deviceId, agregarlo a las constraints
                    if (cameraSettings.deviceId) {
                        (constraints.video as MediaTrackConstraints).deviceId = { 
                            exact: cameraSettings.deviceId 
                        };
                        console.log('📹 Usando cámara específica:', cameraSettings.deviceId);
                    }
                    
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setIsConnected(true);
                        
                        // Obtener el label del dispositivo activo
                        const videoTrack = stream.getVideoTracks()[0];
                        console.log('✅ Cámara USB conectada exitosamente:', videoTrack.label);
                    }
                } else {
                    console.error('❌ Tipo de cámara no válido:', cameraSettings.type);
                    setIsConnected(false);
                }
            } catch (err) {
                console.error("❌ Error accessing camera:", err);
                setIsConnected(false);
                
                if (cameraSettings.type === 'USB') {
                    alert('No se pudo acceder a la cámara USB.\n\nVerifica que:\n- Tienes una cámara conectada\n- Diste permiso de acceso a la cámara\n- Ninguna otra aplicación está usando la cámara');
                }
            }
        };

        startCamera();

        return () => {
            console.log('🧹 Limpiando recursos de cámara...');
            
            // Detener reconocimiento en tiempo real si está activo
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            // Limpiar stream de USB
            if (videoRef.current?.srcObject instanceof MediaStream) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                    console.log('✅ Track de USB detenido');
                });
                videoRef.current.srcObject = null;
            }
            
            // Limpiar source de IP (video tag)
            if (videoRef.current && cameraSettings.type === 'IP' && !useMjpeg) {
                videoRef.current.pause(); // Pausar primero
                videoRef.current.src = '';
                videoRef.current.load(); // Forzar liberación del recurso
                videoRef.current.removeAttribute('src');
                console.log('✅ Video source limpiado');
            }
            
            // Limpiar source de IP (img tag para MJPEG)
            if (imgRef.current && useMjpeg && mjpegConnectionRef.current) {
                console.log('🔌 Cerrando conexión MJPEG...');
                
                // Remover event listeners para evitar errores
                imgRef.current.onload = null;
                imgRef.current.onerror = null;
                
                // Crear una imagen vacía 1x1 para forzar cierre de conexión
                const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                imgRef.current.src = emptyImage;
                
                // Forzar que el navegador cierre la conexión anterior
                // Removiendo y recreando el elemento
                const parent = imgRef.current.parentElement;
                const oldImg = imgRef.current;
                
                if (parent) {
                    parent.removeChild(oldImg);
                    // El componente se está desmontando, no necesitamos recrearlo
                }
                
                mjpegConnectionRef.current = null;
                console.log('✅ MJPEG conexión cerrada completamente');
            } else if (imgRef.current && useMjpeg) {
                // Limpieza simple si no hay referencia de conexión
                imgRef.current.src = '';
                imgRef.current.onload = null;
                imgRef.current.onerror = null;
                console.log('✅ MJPEG source limpiado');
            }
            
            console.log('✅ Recursos de cámara liberados completamente');
        };
    }, [cameraSettings, videoWidth, videoHeight, useMjpeg]);

    const captureAndRecognize = async () => {
        // Fuente de video puede ser video o img
        const videoSource = useMjpeg ? imgRef.current : videoRef.current;
        
        if (!videoSource || !canvasRef.current || isProcessing) {
            console.warn('⚠️ No se puede capturar:', {
                hasSource: !!videoSource,
                hasCanvas: !!canvasRef.current,
                isProcessing
            });
            return;
        }

        // Validar que la imagen/video tenga dimensiones válidas
        if (useMjpeg && imgRef.current) {
            if (imgRef.current.naturalWidth === 0 || imgRef.current.naturalHeight === 0) {
                console.error('❌ Imagen MJPEG no cargada completamente');
                alert('La imagen de la cámara no está lista. Espera un momento e intenta de nuevo.');
                return;
            }
            console.log('📸 Capturando desde MJPEG:', {
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight
            });
        } else if (!useMjpeg && videoRef.current) {
            if (videoRef.current.readyState < 2) { // HAVE_CURRENT_DATA
                console.error('❌ Video no está listo');
                alert('El video no está listo. Espera un momento e intenta de nuevo.');
                return;
            }
            console.log('📸 Capturando desde video:', {
                readyState: videoRef.current.readyState,
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            });
        }

        setIsProcessing(true);
        const context = canvasRef.current.getContext('2d');
        if (!context) {
            setIsProcessing(false);
            return;
        }

        try {
            // Captura frame con dimensiones correctas (usa la fuente correcta: video o img)
            context.drawImage(videoSource, 0, 0, videoWidth, videoHeight);
            const imageData = canvasRef.current.toDataURL('image/jpeg');
            
            console.log('📤 Enviando frame al backend...');

            // Usar el servicio de detección
            const result = await detectFaces(imageData);

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
        console.log('⏹ Deteniendo reconocimiento en tiempo real');
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
                intervalRef.current = null;
            }
        };
    }, []);
    
    // Detener reconocimiento en tiempo real si la cámara se desconecta
    useEffect(() => {
        if (!isConnected && isRealTimeActive) {
            console.log('⏹ Deteniendo reconocimiento automático por desconexión');
            stopRealTimeRecognition();
        }
    }, [isConnected, isRealTimeActive]);

    return (
        <div className="camera-viewer">
            <div className="camera-status">
                <p>Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
                <p>Resolución: {cameraSettings.resolution} @ {cameraSettings.fps} FPS</p>
                {cameraSettings.type === 'IP' && (
                    <p>Modo: {useMjpeg ? 'MJPEG (img tag)' : 'Stream de video'}</p>
                )}
                {isProcessing && <p>⏳ Procesando...</p>}
            </div>

            <div className="camera-container" style={{ position: 'relative', width: videoWidth, height: videoHeight }}>
                {/* Video tag para USB y streams de video estándar */}
                {!useMjpeg && (
                    <video
                        ref={videoRef}
                        width={videoWidth}
                        height={videoHeight}
                        autoPlay
                        playsInline
                        muted
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                )}
                
                {/* Img tag para streams MJPEG (cámaras de celular) */}
                {useMjpeg && (
                    <img
                        ref={imgRef}
                        width={videoWidth}
                        height={videoHeight}
                        alt="Camera stream"
                        crossOrigin="anonymous"
                        style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
                    />
                )}
                
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
