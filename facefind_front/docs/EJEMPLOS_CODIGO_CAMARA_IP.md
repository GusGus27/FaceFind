# 💻 Ejemplos de Código: Integración de Cámara IP

## 🎯 Para Desarrolladores

Este documento contiene ejemplos de código para integrar y trabajar con cámaras IP en diferentes contextos.

---

## 📹 Ejemplo 1: HTML Video Element con IP Camera

### Básico:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test IP Camera</title>
</head>
<body>
    <h1>Prueba de Cámara IP</h1>
    
    <!-- Video element -->
    <video id="video" autoplay controls width="640" height="480">
        Tu navegador no soporta el elemento video
    </video>
    
    <script>
        const video = document.getElementById('video');
        const cameraUrl = 'http://192.168.1.105:8080/video';
        
        // Asignar URL de la cámara IP
        video.src = cameraUrl;
        
        // Eventos
        video.onloadeddata = () => {
            console.log('✅ Cámara conectada');
        };
        
        video.onerror = (e) => {
            console.error('❌ Error conectando cámara:', e);
        };
    </script>
</body>
</html>
```

---

## ⚛️ Ejemplo 2: React Component (Completo)

```jsx
import React, { useRef, useEffect, useState } from 'react';

const IPCameraViewer = ({ cameraUrl, resolution = '640x480', fps = 15 }) => {
  const videoRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  const [width, height] = resolution.split('x').map(Number);
  
  useEffect(() => {
    if (!videoRef.current || !cameraUrl) return;
    
    const video = videoRef.current;
    
    // Asignar URL
    video.src = cameraUrl;
    
    // Handlers
    const handleLoad = () => {
      setIsConnected(true);
      setError(null);
      console.log('✅ Cámara IP conectada:', cameraUrl);
    };
    
    const handleError = (e) => {
      setIsConnected(false);
      setError('No se pudo conectar a la cámara');
      console.error('❌ Error:', e);
    };
    
    video.onloadeddata = handleLoad;
    video.onerror = handleError;
    
    // Cleanup
    return () => {
      video.src = '';
      video.onloadeddata = null;
      video.onerror = null;
    };
  }, [cameraUrl]);
  
  return (
    <div className="camera-viewer">
      <div className="camera-status">
        {isConnected ? (
          <span className="status-connected">
            ✅ Conectado
          </span>
        ) : error ? (
          <span className="status-error">
            ❌ {error}
          </span>
        ) : (
          <span className="status-loading">
            ⏳ Conectando...
          </span>
        )}
      </div>
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width={width}
        height={height}
        style={{ 
          border: '2px solid #333',
          borderRadius: '8px',
          backgroundColor: '#000'
        }}
      />
      
      <div className="camera-info">
        <span>URL: {cameraUrl}</span>
        <span>Resolución: {resolution}</span>
        <span>FPS: {fps}</span>
      </div>
    </div>
  );
};

export default IPCameraViewer;
```

### Uso:

```jsx
<IPCameraViewer 
  cameraUrl="http://192.168.1.105:8080/video"
  resolution="1280x720"
  fps={20}
/>
```

---

## 🎨 Ejemplo 3: Capturar Frames de IP Camera

```javascript
const captureFrameFromIPCamera = (videoElement) => {
  // Crear canvas
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  // Dibujar frame actual
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  
  // Retornar como Blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95);
  });
};

// Uso
const video = document.getElementById('video');
const frameBlob = await captureFrameFromIPCamera(video);

// Enviar al backend
const formData = new FormData();
formData.append('image', frameBlob, 'frame.jpg');

const response = await fetch('/api/detection/detect-faces', {
  method: 'POST',
  body: formData
});
```

---

## 🔄 Ejemplo 4: Reconocimiento Continuo

```javascript
class ContinuousRecognition {
  constructor(videoElement, intervalMs = 2000) {
    this.video = videoElement;
    this.interval = intervalMs;
    this.isRunning = false;
    this.intervalId = null;
  }
  
  async captureAndRecognize() {
    const canvas = document.createElement('canvas');
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0);
    
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
    
    const formData = new FormData();
    formData.append('image', blob, 'frame.jpg');
    
    try {
      const response = await fetch('/api/detection/detect-faces', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.faces_detected && data.faces_detected.length > 0) {
        console.log('🎯 Personas detectadas:', data.faces_detected);
        
        // Disparar evento personalizado
        const event = new CustomEvent('faceDetected', {
          detail: data.faces_detected
        });
        document.dispatchEvent(event);
      }
      
    } catch (error) {
      console.error('❌ Error en reconocimiento:', error);
    }
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('▶️ Iniciando reconocimiento continuo');
    
    this.intervalId = setInterval(() => {
      this.captureAndRecognize();
    }, this.interval);
  }
  
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('⏹️ Reconocimiento detenido');
  }
  
  setInterval(ms) {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }
    
    this.interval = ms;
    
    if (wasRunning) {
      this.start();
    }
  }
}

// Uso
const video = document.getElementById('video');
const recognition = new ContinuousRecognition(video, 2000); // cada 2 segundos

// Escuchar detecciones
document.addEventListener('faceDetected', (e) => {
  console.log('Personas:', e.detail);
  e.detail.forEach(face => {
    console.log(`- ${face.nombre}: ${face.distancia}`);
  });
});

// Controles
recognition.start();
// recognition.stop();
// recognition.setInterval(3000); // cambiar a 3 segundos
```

---

## 🌐 Ejemplo 5: Proxy Server para RTSP

Si tu cámara solo tiene RTSP, necesitas un servidor proxy:

### Node.js + FFmpeg:

```javascript
// proxy-server.js
const { spawn } = require('child_process');
const http = require('http');

class RTSPtoHTTPProxy {
  constructor(rtspUrl, httpPort = 8081) {
    this.rtspUrl = rtspUrl;
    this.httpPort = httpPort;
    this.ffmpegProcess = null;
    this.clients = [];
  }
  
  start() {
    // FFmpeg command para convertir RTSP a MJPEG
    const ffmpegArgs = [
      '-i', this.rtspUrl,
      '-f', 'mjpeg',
      '-q:v', '5',
      '-r', '15',
      '-'
    ];
    
    this.ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
    
    // Crear servidor HTTP
    const server = http.createServer((req, res) => {
      if (req.url === '/video') {
        res.writeHead(200, {
          'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
          'Access-Control-Allow-Origin': '*'
        });
        
        this.clients.push(res);
        
        res.on('close', () => {
          const index = this.clients.indexOf(res);
          if (index > -1) {
            this.clients.splice(index, 1);
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    // Distribuir frames a todos los clientes
    this.ffmpegProcess.stdout.on('data', (chunk) => {
      this.clients.forEach(client => {
        client.write('--frame\r\n');
        client.write('Content-Type: image/jpeg\r\n\r\n');
        client.write(chunk);
        client.write('\r\n');
      });
    });
    
    server.listen(this.httpPort, () => {
      console.log(`✅ Proxy RTSP → HTTP en puerto ${this.httpPort}`);
      console.log(`📹 URL: http://localhost:${this.httpPort}/video`);
    });
  }
  
  stop() {
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill();
    }
  }
}

// Uso
const proxy = new RTSPtoHTTPProxy(
  'rtsp://usuario:password@192.168.1.64:554/stream',
  8081
);

proxy.start();

// Ahora puedes usar: http://localhost:8081/video en FaceFind
```

---

## 🐍 Ejemplo 6: Python Backend con OpenCV

```python
from flask import Flask, Response
import cv2

app = Flask(__name__)

class IPCameraStream:
    def __init__(self, camera_url):
        self.camera_url = camera_url
        self.cap = None
        
    def connect(self):
        """Conectar a la cámara IP"""
        self.cap = cv2.VideoCapture(self.camera_url)
        
        if not self.cap.isOpened():
            raise Exception(f"No se pudo conectar a {self.camera_url}")
        
        print(f"✅ Conectado a cámara IP: {self.camera_url}")
        
    def get_frame(self):
        """Obtener un frame"""
        if self.cap is None:
            self.connect()
            
        success, frame = self.cap.read()
        
        if not success:
            return None
            
        return frame
    
    def generate_frames(self):
        """Generador de frames para streaming"""
        while True:
            frame = self.get_frame()
            
            if frame is None:
                break
                
            # Codificar frame como JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            
            # Formato multipart
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    def release(self):
        """Liberar recursos"""
        if self.cap:
            self.cap.release()

# Instancia global
camera = IPCameraStream('http://192.168.1.105:8080/video')

@app.route('/video_feed')
def video_feed():
    """Endpoint de streaming"""
    return Response(
        camera.generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/capture')
def capture():
    """Capturar un frame"""
    frame = camera.get_frame()
    
    if frame is None:
        return {"error": "No se pudo capturar frame"}, 500
    
    # Aquí puedes procesar el frame (reconocimiento facial, etc.)
    # ...
    
    return {"message": "Frame capturado"}, 200

if __name__ == '__main__':
    camera.connect()
    app.run(host='0.0.0.0', port=5000)
```

---

## 🔧 Ejemplo 7: Configuración Dinámica de Cámaras

```javascript
// cameraManager.js
class CameraManager {
  constructor() {
    this.cameras = [];
    this.activeCameraId = null;
  }
  
  addCamera(config) {
    const camera = {
      id: Date.now(),
      name: config.name,
      type: config.type, // 'USB' | 'IP'
      url: config.url,
      resolution: config.resolution,
      fps: config.fps,
      isConnected: false
    };
    
    this.cameras.push(camera);
    return camera.id;
  }
  
  removeCamera(id) {
    const index = this.cameras.findIndex(c => c.id === id);
    if (index > -1) {
      this.cameras.splice(index, 1);
    }
  }
  
  async connectCamera(id, videoElement) {
    const camera = this.cameras.find(c => c.id === id);
    
    if (!camera) {
      throw new Error('Cámara no encontrada');
    }
    
    try {
      if (camera.type === 'IP') {
        // Cámara IP
        videoElement.src = camera.url;
        
        await new Promise((resolve, reject) => {
          videoElement.onloadeddata = resolve;
          videoElement.onerror = reject;
          
          setTimeout(() => reject(new Error('Timeout')), 10000);
        });
        
      } else {
        // Cámara USB
        const [width, height] = camera.resolution.split('x').map(Number);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: camera.fps }
          }
        });
        
        videoElement.srcObject = stream;
      }
      
      camera.isConnected = true;
      this.activeCameraId = id;
      
      console.log(`✅ Cámara conectada: ${camera.name}`);
      
    } catch (error) {
      camera.isConnected = false;
      console.error(`❌ Error conectando ${camera.name}:`, error);
      throw error;
    }
  }
  
  disconnectCamera(videoElement) {
    if (videoElement.srcObject instanceof MediaStream) {
      // USB camera
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    } else {
      // IP camera
      videoElement.src = '';
    }
    
    if (this.activeCameraId) {
      const camera = this.cameras.find(c => c.id === this.activeCameraId);
      if (camera) {
        camera.isConnected = false;
      }
      this.activeCameraId = null;
    }
  }
  
  getConnectedCamera() {
    return this.cameras.find(c => c.id === this.activeCameraId);
  }
  
  saveToLocalStorage() {
    localStorage.setItem('cameras', JSON.stringify(this.cameras));
  }
  
  loadFromLocalStorage() {
    const data = localStorage.getItem('cameras');
    if (data) {
      this.cameras = JSON.parse(data);
    }
  }
}

// Uso
const manager = new CameraManager();

// Cargar configuraciones guardadas
manager.loadFromLocalStorage();

// Agregar cámaras
const cam1 = manager.addCamera({
  name: 'Celular - Recepción',
  type: 'IP',
  url: 'http://192.168.1.105:8080/video',
  resolution: '1280x720',
  fps: 20
});

const cam2 = manager.addCamera({
  name: 'Cámara Entrada',
  type: 'IP',
  url: 'http://192.168.1.64/mjpg/video.mjpg',
  resolution: '640x480',
  fps: 15
});

// Conectar
const video = document.getElementById('video');
await manager.connectCamera(cam1, video);

// Guardar configuración
manager.saveToLocalStorage();
```

---

## 🧪 Ejemplo 8: Test de Conectividad

```javascript
async function testIPCamera(url, timeout = 5000) {
  console.log(`🔍 Probando: ${url}`);
  
  const video = document.createElement('video');
  video.muted = true;
  
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve({
        url,
        success: false,
        error: 'Timeout - No responde en 5 segundos'
      });
    }, timeout);
    
    const cleanup = () => {
      clearTimeout(timer);
      video.src = '';
      video.onloadeddata = null;
      video.onerror = null;
    };
    
    video.onloadeddata = () => {
      cleanup();
      resolve({
        url,
        success: true,
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    
    video.onerror = (e) => {
      cleanup();
      resolve({
        url,
        success: false,
        error: 'No se pudo cargar el stream'
      });
    };
    
    video.src = url;
  });
}

// Uso
const urls = [
  'http://192.168.1.105:8080/video',
  'http://192.168.1.64/mjpg/video.mjpg',
  'http://192.168.1.70:4747/video'
];

console.log('🧪 Probando cámaras...\n');

for (const url of urls) {
  const result = await testIPCamera(url);
  
  if (result.success) {
    console.log(`✅ ${url}`);
    console.log(`   Resolución: ${result.width}x${result.height}`);
  } else {
    console.log(`❌ ${url}`);
    console.log(`   Error: ${result.error}`);
  }
}
```

---

## 📝 Notas Importantes

### Performance:

- **IP cameras** tienen más latencia que USB
- Usa resoluciones bajas (640x480) para mejor rendimiento
- FPS alto (>30) consume mucho ancho de banda

### Seguridad:

- No expongas URLs con credenciales
- Usa HTTPS cuando sea posible
- Implementa autenticación en el backend

### Compatibilidad:

- MJPEG: ✅ Todos los navegadores
- HLS: ✅ Safari, ⚠️ Chrome con library
- WebRTC: ✅ Todos los navegadores modernos
- RTSP: ❌ Requiere conversión

---

## 🔗 Referencias

- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
- [HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenCV Python](https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html)

---

**¡Listo para integrar cámaras IP en tu proyecto! 🚀**
