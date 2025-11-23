# HU-11: Gestión de Múltiples Cámaras - Guía de Visualización

## 📋 ¿Qué se implementó?

Se completó la **Historia de Usuario 11** que permite gestionar múltiples cámaras de vigilancia (USB e IP) desde el panel de administración.

### ✨ Funcionalidades implementadas:

- ✅ Registro de múltiples cámaras (USB e IP)
- ✅ Vista en grid de todas las cámaras registradas
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Activar/Desactivar cámaras individualmente
- ✅ Estadísticas en tiempo real
- ✅ Configuración individual por cámara (nombre, ubicación, resolución, FPS)
- ✅ Validaciones completas en frontend y backend

---

## 🚀 Cómo visualizar los cambios

### 1️⃣ Iniciar el Backend

```powershell
cd C:\Users\USER\Downloads\SoftwareII_Repo\FaceFind\facefind_back
python app.py
```

**Verificar que aparezca:**
```
📹 Cámaras (/cameras):
   GET  /cameras                    - Listar todas las cámaras
   POST /cameras                    - Crear nueva cámara
   GET  /cameras/<id>               - Obtener cámara específica
   PUT  /cameras/<id>               - Actualizar cámara
   DELETE /cameras/<id>             - Eliminar cámara
   ...
```

### 2️⃣ Iniciar el Frontend

```powershell
cd C:\Users\USER\Downloads\SoftwareII_Repo\FaceFind\facefind_front
npm run dev
```

### 3️⃣ Acceder al Sistema

1. Abrir navegador en `http://localhost:5173`
2. **Iniciar sesión como administrador**
3. En el panel de administración, buscar **"Gestión de Cámaras"**

---

## 🎯 Pasos para probar las funcionalidades

### ➕ Crear una cámara USB

1. Click en **"+ Agregar Cámara"**
2. Llenar el formulario:
   - **Nombre:** `Cámara USB Principal`
   - **Tipo:** `USB`
   - **Ubicación:** `Entrada Principal`
   - **Resolución:** `1920x1080`
   - **FPS:** `30`
3. Click en **"Crear"**
4. ✅ Verás la nueva cámara en el grid

### ➕ Crear una cámara IP

1. Click en **"+ Agregar Cámara"**
2. Llenar el formulario:
   - **Nombre:** `Cámara IP Estacionamiento`
   - **Tipo:** `IP`
   - **Ubicación:** `Estacionamiento`
   - **URL:** `http://192.168.1.100:8080/video`
   - **Resolución:** `1280x720`
   - **FPS:** `25`
3. Click en **"Crear"**
4. ✅ Verás ambas cámaras en el grid

### 📊 Ver estadísticas

En la parte superior verás tarjetas con:
- **Total** de cámaras
- Cámaras **Activas**
- Cámaras **Inactivas**
- Cantidad de cámaras **USB**
- Cantidad de cámaras **IP**

### ✏️ Editar una cámara

1. En cualquier tarjeta de cámara, click en **"Editar"**
2. Modificar campos (ej: cambiar ubicación)
3. Click en **"Actualizar"**
4. ✅ Los cambios se reflejan inmediatamente

### 🔄 Activar/Desactivar cámara

1. Click en el botón **"Desactivar"** de una cámara activa
2. ✅ El estado cambia a "Inactiva" (tarjeta gris)
3. Click en **"Activar"** para reactivarla
4. ✅ Vuelve al estado "Activa" (tarjeta verde)

### 🗑️ Eliminar una cámara

1. Click en **"Eliminar"** en cualquier cámara
2. Confirmar la eliminación
3. ✅ La cámara desaparece del grid
4. ✅ Las estadísticas se actualizan

---

## 🎨 Elementos visuales a observar

### Estados de las cámaras:
- **Verde** = Cámara activa
- **Gris** = Cámara inactiva

### Información mostrada en cada tarjeta:
- 📷 Nombre de la cámara
- 🔌 Tipo (USB o IP)
- 📍 Ubicación
- 📐 Resolución
- ⚡ FPS
- 🔗 URL (solo para cámaras IP)

---

## 🧪 Pruebas de validación

### Validaciones automáticas:
1. **Nombre vacío** → Error
2. **Ubicación vacía** → Error
3. **Cámara IP sin URL** → Error
4. **FPS fuera de rango (1-120)** → Error
5. **Nombre duplicado** → Error

### Probar validaciones:
Intenta crear una cámara sin llenar todos los campos requeridos para ver los mensajes de error.

---

## 📱 Vista responsive

La interfaz se adapta a diferentes tamaños de pantalla:
- **Desktop:** Grid de 3-4 columnas
- **Tablet:** Grid de 2 columnas
- **Móvil:** Grid de 1 columna

---

## 🔍 Endpoints de API disponibles

Puedes probar los endpoints directamente:

```bash
# Listar todas las cámaras
GET http://localhost:5000/cameras

# Crear cámara
POST http://localhost:5000/cameras
Body: {
  "nombre": "Cámara Test",
  "type": "USB",
  "ubicacion": "Test Location"
}

# Obtener estadísticas
GET http://localhost:5000/cameras/stats

# Obtener solo cámaras activas
GET http://localhost:5000/cameras/active
```

---

## ✅ Checklist de verificación

- [ ] Backend inicia correctamente
- [ ] Frontend inicia correctamente
- [ ] Puedo acceder al panel de administración
- [ ] Veo la opción "Gestión de Cámaras"
- [ ] Puedo crear cámaras USB
- [ ] Puedo crear cámaras IP
- [ ] Las validaciones funcionan
- [ ] Puedo editar cámaras
- [ ] Puedo activar/desactivar cámaras
- [ ] Puedo eliminar cámaras
- [ ] Las estadísticas se actualizan
- [ ] El grid muestra todas las cámaras
- [ ] La interfaz es responsive

---

## 🐛 Solución de problemas

### Error: "No se pueden cargar las cámaras"
- Verificar que el backend esté corriendo
- Verificar que la URL del API sea correcta (`http://localhost:5000`)

### Error: "Ya existe una cámara con ese nombre"
- Usar un nombre diferente o eliminar la cámara existente

### La cámara no aparece después de crearla
- Verificar la consola del navegador (F12)
- Verificar los logs del backend
- Refrescar la página

---

## 📝 Notas técnicas

### Backend:
- **Modelo:** `models/camara.py`
- **Servicio:** `services/camera_service.py`
- **API:** `api/camera_routes.py`
- **Base de datos:** Tabla `Camara` en Supabase

### Frontend:
- **Componentes:** 
  - `CameraManager.tsx` (gestor principal)
  - `CameraGrid.jsx` (vista grid)
  - `CameraCard.jsx` (tarjeta individual)
- **Servicio:** `services/cameraService.js`
- **Estilos:** `styles/camera/*.css`

---

## 🎉 ¡Listo!

Ahora puedes gestionar múltiples cámaras desde el panel de administración. La funcionalidad está completamente integrada y no afecta las demás funcionalidades del sistema.
