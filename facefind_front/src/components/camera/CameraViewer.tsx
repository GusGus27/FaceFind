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

const CameraViewer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const overlayRef = useRef<HTMLCanvasElement | null>(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
    const [recognizedName, setRecognizedName] = useState<string>("Desconocido");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480 },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsConnected(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setIsConnected(false);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current?.srcObject instanceof MediaStream) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const captureAndRecognize = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        try {
            // Captura frame
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const imageData = canvasRef.current.toDataURL('image/jpeg');

            // Llamada al backend
            const response = await fetch('http://localhost:5000/detect-faces', {
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

    return (
        <div className="camera-viewer">
            <div className="camera-status">
                <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
                {isProcessing && <p>Procesando...</p>}
            </div>

            <div className="camera-container" style={{ position: 'relative', width: 640, height: 480 }}>
                <video
                    ref={videoRef}
                    width={640}
                    height={480}
                    autoPlay
                    playsInline
                    muted
                    style={{ position: 'absolute', top: 0, left: 0 }}
                />
                <canvas
                    ref={overlayRef}
                    width={640}
                    height={480}
                    style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="camera-controls">
                <button
                    onClick={captureAndRecognize}
                    disabled={isProcessing || !isConnected}
                >
                    {isProcessing ? 'Procesando...' : 'Reconocer (o presiona ESPACIO)'}
                </button>
            </div>

            {/* Mostrar "Quién soy" debajo de la cámara */}
            <div className="camera-identity" style={{ marginTop: 10, fontSize: 18, fontWeight: 'bold' }}>
                <p>Quién soy: {recognizedName}</p>
            </div>
        </div>
    );
};

export default CameraViewer;
