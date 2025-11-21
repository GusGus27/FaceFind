# 📸 Tutorial Visual: Configurar Cámara IP en FaceFind

## 🎯 Tutorial Paso a Paso con Ejemplos Reales

---

## Método 1: Usar tu Celular como Cámara IP (FÁCIL)

### Paso 1: Instalar la App

**En Android:**
```
📱 Play Store → Buscar "IP Webcam" → Instalar
```

**Alternativas:**
- IP Webcam (Recomendada) ⭐
- DroidCam
- Iriun Webcam

---

### Paso 2: Configurar la App

```
┌─────────────────────────────┐
│      IP Webcam              │
├─────────────────────────────┤
│                             │
│  Video Resolution:          │
│  ▼ 1280x720                 │
│                             │
│  Quality: 80%               │
│                             │
│  FPS Limit: 30              │
│                             │
│  [Iniciar Servidor] ►       │
│                             │
└─────────────────────────────┘
```

---

### Paso 3: Obtener la URL

**La app mostrará:**

```
╔═══════════════════════════════════════╗
║     IP Webcam - Servidor Activo       ║
╠═══════════════════════════════════════╣
║                                       ║
║  Accede desde tu navegador:           ║
║                                       ║
║  http://192.168.1.105:8080            ║
║                                       ║
║  Usuario: (opcional)                  ║
║  Password: (opcional)                 ║
║                                       ║
║  [Detener Servidor]                   ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Importante:** Anota esta URL, la necesitarás.

---

### Paso 4: Configurar en FaceFind

**1. Ve al Panel de Admin → Gestión de Cámaras**

```
┌────────────────────────────────────────┐
│  Configuración de Cámara              │
├────────────────────────────────────────┤
│                                        │
│  Tipo de Cámara:                      │
│  ○ Cámara USB                         │
│  ● Cámara IP  ◄── Selecciona esto     │
│                                        │
│  URL de la Cámara:                    │
│  ┌──────────────────────────────────┐ │
│  │ http://192.168.1.105:8080/video  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Resolución:                          │
│  ▼ 1280x720                           │
│                                        │
│  FPS:                                 │
│  [────●────] 20                       │
│                                        │
│  [Conectar Cámara]                    │
│                                        │
└────────────────────────────────────────┘
```

**2. URLs según la app:**

```
┌─────────────────────┬──────────────────────────────────────┐
│ App                 │ URL para FaceFind                    │
├─────────────────────┼──────────────────────────────────────┤
│ IP Webcam           │ http://IP:8080/video                 │
│ DroidCam            │ http://IP:4747/video                 │
│ Iriun               │ http://IP:8080/                      │
└─────────────────────┴──────────────────────────────────────┘
```

---

### Paso 5: Probar la Conexión

**Vista previa en FaceFind:**

```
┌────────────────────────────────────────┐
│  Vista de Cámara IP                   │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │       [VIDEO EN VIVO]            │ │
│  │                                  │ │
│  │     Tu rostro aparecerá aquí     │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Estado: ✅ Conectado                  │
│  FPS: 20                              │
│  Resolución: 1280x720                 │
│                                        │
│  [Capturar Frame] [Iniciar Detección] │
│                                        │
└────────────────────────────────────────┘
```

---

## Método 2: Cámara de Seguridad IP

### Ejemplo: Cámara Hikvision

**Configuración típica:**

```
┌────────────────────────────────────────┐
│  Cámara IP - Hikvision                │
├────────────────────────────────────────┤
│                                        │
│  IP de la cámara: 192.168.1.64        │
│  Puerto: 80                            │
│  Usuario: admin                        │
│  Password: ********                    │
│                                        │
└────────────────────────────────────────┘

URL para FaceFind:
http://admin:password@192.168.1.64/ISAPI/Streaming/channels/101/httpPreview
```

### Ejemplo: Cámara TP-Link

```
URL: http://192.168.1.64:8080/video.cgi
```

### Ejemplo: Cámara Axis

```
URL: http://192.168.1.64/mjpg/video.mjpg
```

---

## 🔍 Solución de Problemas

### Problema 1: "No se puede conectar"

```
❌ Error mostrado:
┌────────────────────────────────────────┐
│  ⚠️ No se pudo conectar a la cámara   │
│                                        │
│  Verifica:                            │
│  • La URL es correcta                 │
│  • La cámara está encendida           │
│  • Estás en la misma red WiFi         │
└────────────────────────────────────────┘
```

**Solución:**

1. **Prueba abrir la URL en tu navegador:**
   ```
   Chrome → http://192.168.1.105:8080/video
   ```
   
   Si ves el video → URL correcta ✅
   Si no ves nada → Revisa la URL ❌

2. **Verifica la red:**
   ```powershell
   # En PowerShell
   ping 192.168.1.105
   ```
   
   Si responde → Cámara alcanzable ✅
   Si no responde → Problema de red ❌

---

### Problema 2: "Video lento o entrecortado"

```
🐌 Síntomas:
- El video se congela
- FPS muy bajo
- Latencia alta
```

**Soluciones:**

```
┌────────────────────────────────────────┐
│  Ajustar Configuración                │
├────────────────────────────────────────┤
│                                        │
│  Resolución:                          │
│  1280x720  →  640x480                 │
│                                        │
│  FPS:                                 │
│  30  →  15                            │
│                                        │
│  [Aplicar Cambios]                    │
│                                        │
└────────────────────────────────────────┘
```

---

### Problema 3: CORS Error

```
❌ Error en consola (F12):
Access to video at 'http://192.168.1.105:8080/video' 
has been blocked by CORS policy
```

**Esto pasa cuando:**
- La cámara no permite acceso desde otros dominios
- Es una limitación de seguridad del navegador

**Soluciones:**

1. **Configurar CORS en la cámara** (si es posible)
2. **Usar proxy local**
3. **Desactivar CORS en navegador** (solo para desarrollo)

---

## 📊 Configuraciones Recomendadas

### Para Reconocimiento en Tiempo Real:

```
┌─────────────────────┬──────────────────┐
│ Parámetro          │ Valor Recomendado │
├─────────────────────┼──────────────────┤
│ Resolución         │ 640x480          │
│ FPS                │ 15-20            │
│ Calidad            │ Media (50-70%)   │
│ Conexión           │ Cable > WiFi     │
└─────────────────────┴──────────────────┘
```

### Para Máxima Calidad (sacrificando velocidad):

```
┌─────────────────────┬──────────────────┐
│ Parámetro          │ Valor            │
├─────────────────────┼──────────────────┤
│ Resolución         │ 1280x720         │
│ FPS                │ 25-30            │
│ Calidad            │ Alta (80-90%)    │
│ Conexión           │ Cable Ethernet   │
└─────────────────────┴──────────────────┘
```

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Oficina con celular de respaldo

```yaml
Escenario:
  - PC en recepción
  - Celular como cámara de respaldo
  - Red WiFi estable

Configuración:
  tipo: Cámara IP
  url: http://192.168.1.105:8080/video
  resolucion: 1280x720
  fps: 20
  
Resultado:
  ✅ Funciona perfectamente
  ✅ Sin cables
  ✅ Fácil de mover
```

### Ejemplo 2: Monitoreo remoto

```yaml
Escenario:
  - Múltiples cámaras de seguridad
  - Sistema centralizado
  - Acceso desde oficina

Configuración:
  tipo: Cámara IP
  url: http://camara-entrada.local/mjpg/video.mjpg
  resolucion: 640x480
  fps: 15
  
Resultado:
  ✅ Monitoreo 24/7
  ✅ Múltiples cámaras
  ✅ Bajo consumo de red
```

---

## 💡 Tips Avanzados

### 1. Crear un Script de Prueba

```javascript
// Prueba rápida de conectividad
const testUrl = 'http://192.168.1.105:8080/video';

fetch(testUrl)
  .then(() => console.log('✅ Cámara alcanzable'))
  .catch(() => console.log('❌ No se puede conectar'));
```

### 2. Guardar Configuraciones

```json
{
  "cameras": [
    {
      "name": "Celular - Recepción",
      "url": "http://192.168.1.105:8080/video",
      "resolution": "1280x720",
      "fps": 20
    },
    {
      "name": "Cámara Entrada",
      "url": "http://192.168.1.64/mjpg/video.mjpg",
      "resolution": "640x480",
      "fps": 15
    }
  ]
}
```

### 3. Monitorear Rendimiento

**Abre la consola del navegador (F12):**

```javascript
// Ver FPS real
console.log('FPS:', videoElement.fps);

// Ver latencia
console.log('Latencia:', Date.now() - lastFrameTime);

// Ver errores de red
videoElement.onerror = (e) => console.error('Error:', e);
```

---

## 🆘 Contacto y Soporte

Si tienes problemas:

1. **Revisa esta guía**
2. **Consulta:** `facefind_front/docs/GUIA_CAMARA_IP.md`
3. **Logs del navegador:** F12 → Console
4. **Prueba la URL directamente** en el navegador

---

## ✅ Checklist Final

Antes de usar la cámara IP:

```
□ App instalada y servidor iniciado
□ URL anotada correctamente
□ Cámara y PC en la misma red
□ URL probada en navegador
□ Configuración en FaceFind completada
□ Video visible en pantalla
□ Reconocimiento facial funcionando
```

---

**¡Listo! Ahora puedes usar cámaras IP para reconocimiento facial en FaceFind 🎉**
