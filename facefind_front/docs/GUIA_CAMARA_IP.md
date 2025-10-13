# 📹 Guía: Cómo usar Cámaras IP en FaceFind

## 🎯 Introducción

FaceFind soporta dos tipos de cámaras:
1. **Cámara USB/Webcam** - Cámara conectada directamente a tu computadora
2. **Cámara IP por URL** - Cámara de red accesible mediante una URL

Esta guía te enseña cómo configurar y usar cámaras IP.

---

## 📋 Formatos de Stream Soportados

Los navegadores web modernos soportan los siguientes formatos de streaming:

### ✅ Formatos Compatibles:

1. **MJPEG (Motion JPEG)**
   - Formato más común y compatible
   - Funciona directamente en navegadores
   - Calidad buena, consumo moderado de ancho de banda

2. **HLS (HTTP Live Streaming)**
   - Para iOS/Safari principalmente
   - Requiere configuración especial del servidor

3. **WebRTC**
   - Latencia ultra-baja
   - Requiere servidor de señalización

### ❌ Formatos NO compatibles directamente:

- **RTSP** - Protocolo usado por cámaras IP profesionales
  - Requiere conversión a HTTP/MJPEG
  - Necesita servidor intermediario

---

## 🔧 Ejemplos de URLs

### 1️⃣ Cámaras IP Públicas de Prueba

```
# Ejemplo 1: Cámara pública MJPEG
http://webcam.domain.com/mjpg/video.mjpg

# Ejemplo 2: Stream directo
http://192.168.1.100:8080/video

# Ejemplo 3: Con autenticación
http://usuario:password@192.168.1.100:8080/video
```

### 2️⃣ Aplicaciones Móviles como Cámara IP

Si quieres usar tu celular como cámara IP:

**IP Webcam (Android):**
```
http://192.168.1.XXX:8080/video
```

**DroidCam:**
```
http://192.168.1.XXX:4747/video
```

**Pasos:**
1. Instala "IP Webcam" desde Play Store
2. Abre la app y presiona "Iniciar servidor"
3. La app te mostrará una URL como `http://192.168.1.105:8080`
4. En FaceFind, usa: `http://192.168.1.105:8080/video`

### 3️⃣ Cámaras IP Comerciales

**Hikvision:**
```
http://192.168.1.XXX/ISAPI/Streaming/channels/101/httpPreview
```

**Dahua:**
```
http://192.168.1.XXX/cgi-bin/mjpg/video.cgi
```

**Axis:**
```
http://192.168.1.XXX/mjpg/video.mjpg
```

**TP-Link:**
```
http://192.168.1.XXX:8080/video.cgi
```

---

## 🚀 Cómo Configurar en FaceFind

### Paso 1: Accede a la Gestión de Cámaras
1. Inicia sesión como administrador
2. Ve al Panel de Admin
3. Selecciona "Gestión de Cámaras"

### Paso 2: Selecciona "Cámara IP"
1. En el selector de tipo, elige **"Cámara IP"**
2. Aparecerá un campo de texto para ingresar la URL

### Paso 3: Ingresa la URL
```
Ejemplo: http://192.168.1.100:8080/video
```

### Paso 4: Configura Resolución y FPS
- **Resolución:** 640x480 o 1280x720 (recomendado)
- **FPS:** 15-30 fps (más alto = más procesamiento)

### Paso 5: Conecta
1. Presiona "Conectar Cámara"
2. El video debería aparecer en pantalla
3. Si no funciona, revisa la consola del navegador (F12)

---

## 🛠️ Convertir RTSP a HTTP/MJPEG

Si tu cámara solo tiene RTSP, necesitas un servidor intermediario:

### Opción 1: FFmpeg (Recomendado)

```bash
# Instala FFmpeg
# Windows: Descarga de https://ffmpeg.org/

# Convierte RTSP a HTTP MJPEG
ffmpeg -i rtsp://usuario:password@192.168.1.100:554/stream \
  -f mpjpeg \
  -q:v 5 \
  http://localhost:8081/video
```

Luego usa en FaceFind:
```
http://localhost:8081/video
```

### Opción 2: Servidor Node.js con node-rtsp-stream

```javascript
// server.js
const Stream = require('node-rtsp-stream');

const stream = new Stream({
  name: 'camara1',
  streamUrl: 'rtsp://usuario:password@192.168.1.100:554/stream',
  wsPort: 9999,
  ffmpegOptions: {
    '-stats': '',
    '-r': 30
  }
});
```

---

## 🔍 Solución de Problemas

### ❌ "No se pudo conectar a la cámara"

**Causas posibles:**

1. **URL incorrecta**
   - Verifica que la URL sea correcta
   - Prueba abrirla en un navegador normal

2. **Cámara fuera de línea**
   - Verifica que la cámara esté encendida
   - Haz ping a la IP: `ping 192.168.1.100`

3. **Firewall bloqueando**
   - Desactiva temporalmente el firewall
   - Agrega excepción para el puerto

4. **Problemas de red**
   - Asegúrate de estar en la misma red
   - Verifica que no haya restricciones de red

### ❌ "Video se ve lento o entrecortado"

**Soluciones:**

1. **Reduce el FPS**
   - Prueba con 15 FPS en lugar de 30

2. **Reduce la resolución**
   - Usa 640x480 en lugar de 1280x720

3. **Verifica el ancho de banda**
   - Cámaras IP consumen mucho ancho de banda
   - Usa cable Ethernet en lugar de WiFi

### ❌ CORS Error

Si ves errores de CORS en la consola:

```
Access to video at 'http://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solución:** Usa un proxy o configura CORS en el servidor de la cámara.

---

## 📊 Comparación: USB vs IP

| Característica | Cámara USB | Cámara IP |
|----------------|------------|-----------|
| Conexión | Física (USB) | Red (WiFi/Ethernet) |
| Alcance | ~5 metros | Toda la red |
| Latencia | Muy baja | Moderada |
| Configuración | Plug & play | Requiere URL |
| Calidad | Alta | Depende de la red |
| Costo | Bajo | Medio-Alto |
| Flexibilidad | Limitada | Alta |

---

## 🎯 Casos de Uso Recomendados

### Usa Cámara USB cuando:
- Estés en una estación de trabajo fija
- Necesites latencia ultra-baja
- La cámara esté cerca de la computadora

### Usa Cámara IP cuando:
- Necesites monitorear desde ubicaciones remotas
- Tengas múltiples cámaras en diferentes lugares
- Quieras usar tu celular como cámara
- La cámara esté lejos de la computadora

---

## 📝 Ejemplos de Configuración Completa

### Ejemplo 1: Celular como Cámara IP

```
Tipo: Cámara IP
URL: http://192.168.1.105:8080/video
Resolución: 1280x720
FPS: 20

App usada: IP Webcam (Android)
```

### Ejemplo 2: Cámara de Seguridad Hikvision

```
Tipo: Cámara IP
URL: http://192.168.1.64/ISAPI/Streaming/channels/101/httpPreview
Resolución: 640x480
FPS: 15

Usuario: admin
Password: (configurado en la cámara)
```

### Ejemplo 3: Stream Público de Prueba

```
Tipo: Cámara IP
URL: http://demo.url.com/mjpg/video.mjpg
Resolución: 640x480
FPS: 30

Nota: Busca "public MJPEG stream" en Google para URLs de prueba
```

---

## ⚠️ Consideraciones de Seguridad

1. **No uses credenciales en URLs públicas**
   - Las URLs con usuario:password pueden ser interceptadas
   - Usa HTTPS cuando sea posible

2. **Restringe el acceso a la cámara**
   - Configura firewall para limitar acceso
   - Usa VPN si accedes remotamente

3. **Actualiza el firmware**
   - Cámaras IP antiguas tienen vulnerabilidades
   - Mantén el firmware actualizado

---

## 💡 Tips y Trucos

1. **Prueba la URL en el navegador primero**
   ```
   Abre: http://192.168.1.100:8080/video
   ```
   Si ves el video en el navegador, funcionará en FaceFind

2. **Guarda configuraciones exitosas**
   - Anota las URLs que funcionan
   - Documenta las configuraciones

3. **Usa IP estática**
   - Configura IP fija en tu router para la cámara
   - Evita que la IP cambie

4. **Monitorea el rendimiento**
   - Revisa la consola del navegador (F12)
   - Busca errores o warnings

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa logs del navegador** (F12 → Console)
2. **Verifica la URL** abriendo en navegador normal
3. **Prueba con resolución más baja** (640x480)
4. **Reduce FPS** a 15
5. **Consulta manual de tu cámara** para formato de URL correcto

---

## 🔗 Enlaces Útiles

- [Lista de URLs por fabricante](https://www.ispyconnect.com/camera-database)
- [IP Webcam (Android)](https://play.google.com/store/apps/details?id=com.pas.webcam)
- [FFmpeg Download](https://ffmpeg.org/download.html)
- [MJPEG Test Streams](http://www.webcamtests.com/)

---

**✅ ¡Listo! Ahora puedes usar cámaras IP en FaceFind para reconocimiento facial remoto.**
