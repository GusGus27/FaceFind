import React, { useState, useEffect, useRef } from 'react';
import '../../styles/camera/CameraViewer.css';

interface RecognitionResult {
    name: string | null;
    isRecognized: boolean;
}

const CameraViewer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: {
                        width: 640,
                        height: 480
                    }
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

        if (videoRef.current) {
            startCamera();
        }

        // Cleanup
        return () => {
            if (videoRef.current?.srcObject instanceof MediaStream) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach((track: MediaStreamTrack) => track.stop());
            }
        };
    }, []);

    const captureAndRecognize = async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;
        
        setIsProcessing(true);
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        try {
            // Capture frame
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const imageData = canvasRef.current.toDataURL('image/jpeg');

            // Send to backend for recognition
            const response = await fetch('http://localhost:5000/recognize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: imageData }),
            });

            const result = await response.json();
            setRecognitionResult({
                name: result.name,
                isRecognized: result.name !== null
            });

        } catch (error) {
            console.error('Error en reconocimiento:', error);
            setRecognitionResult(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
            captureAndRecognize();
        } else if (e.code === 'Escape') {
            // Handle ESC
        }
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
                {recognitionResult && (
                    <p>
                        {recognitionResult.isRecognized 
                            ? `¡Reconocido como: ${recognitionResult.name}!` 
                            : 'No se reconoció el rostro.'}
                    </p>
                )}
            </div>
            <div className="camera-container">
                <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                />
                <canvas 
                    ref={canvasRef}
                    width="640"
                    height="480"
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
        </div>
    );
};

export default CameraViewer;