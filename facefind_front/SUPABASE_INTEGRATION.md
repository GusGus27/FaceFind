# 🚀 Integración de Supabase en FaceFind

Guía completa de integración de Supabase para el proyecto FaceFind.

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configurar Supabase](#configurar-supabase)
- [Uso de Servicios](#uso-de-servicios)
- [Uso de Hooks](#uso-de-hooks)
- [Componentes de Ejemplo](#componentes-de-ejemplo)
- [Storage de Fotos](#storage-de-fotos)
- [Autenticación](#autenticación)
- [Tiempo Real](#tiempo-real)

## 📦 Instalación

La dependencia de Supabase ya está instalada. Si necesitas reinstalarla:

```bash
cd facefind_front
npm install @supabase/supabase-js
```

## ⚙️ Configuración

### 1. Variables de Entorno

El archivo `.env.local` ya está configurado con tus credenciales:

```env
VITE_SUPABASE_URL=https://zpswgbrbntaipsrkqhbv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANTE:** Este archivo está en `.gitignore` y NO se subirá a GitHub.

### 2. Cliente de Supabase

El cliente está configurado en `src/lib/supabase.js`:

```javascript
import { supabase } from './lib/supabase';

// Ya está listo para usar en toda la app
```

## 📁 Estructura del Proyecto

```
facefind_front/
├── src/
│   ├── lib/
│   │   └── supabase.js              # Cliente de Supabase
│   ├── constants/
│   │   └── enums.js                 # Enums y constantes
│   ├── utils/
│   │   └── supabaseHelpers.js       # Funciones helper
│   ├── services/                     # Servicios de negocio
│   │   ├── authService.js           # Autenticación
│   │   ├── casoService.js           # Gestión de casos
│   │   ├── fotoService.js           # Gestión de fotos
│   │   ├── alertaService.js         # Gestión de alertas
│   │   ├── camaraService.js         # Gestión de cámaras
│   │   ├── notificacionService.js   # Notificaciones
│   │   ├── reporteService.js        # Reportes
│   │   └── auditoriaService.js      # Auditoría
│   ├── hooks/                        # React Hooks
│   │   ├── useAuth.js               # Hook de autenticación
│   │   ├── useCasos.js              # Hook de casos
│   │   ├── useAlertas.js            # Hook de alertas
│   │   └── useNotificaciones.js     # Hook de notificaciones
│   ├── context/
│   │   └── AuthContext.jsx          # Context de autenticación
│   └── components/
│       ├── auth/                     # Componentes de auth
│       ├── casos/                    # Componentes de casos
│       ├── alertas/                  # Componentes de alertas
│       └── fotos/                    # Componentes de fotos
├── .env.local                        # Variables de entorno (no en git)
├── .env.local.example               # Ejemplo de variables
└── docs/
    └── db_schema.sql                # Schema de la base de datos
```

## 🗄️ Configurar Supabase

### 1. Ejecutar el Schema SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a `SQL Editor`
3. Copia el contenido de `docs/db_schema.sql`
4. Pega y ejecuta el SQL

### 2. Configurar Storage para Fotos

1. Ve a `Storage` en el dashboard
2. Crea un nuevo bucket llamado `fotos-referencia`
3. Configura las políticas de acceso:

```sql
-- Permitir lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotos-referencia');

-- Permitir insert para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-referencia');

-- Permitir delete para usuarios autenticados
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-referencia');
```

### 3. Habilitar Row Level Security (RLS)

Ejecuta estos comandos SQL para habilitar RLS en las tablas principales:

```sql
-- Habilitar RLS
ALTER TABLE "Usuario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Caso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FotoReferencia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alerta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Camara" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notificacion" ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades)
-- Usuarios pueden ver sus propios datos
CREATE POLICY "Users can view own data"
ON "Usuario" FOR SELECT
USING (auth.uid()::text = id::text);

-- Usuarios autenticados pueden crear casos
CREATE POLICY "Authenticated users can create cases"
ON "Caso" FOR INSERT
TO authenticated
WITH CHECK (true);

-- Usuarios pueden ver sus propios casos
CREATE POLICY "Users can view own cases"
ON "Caso" FOR SELECT
USING (usuario_id::text = auth.uid()::text);
```

## 📚 Uso de Servicios

### Autenticación (authService)

```javascript
import * as authService from './services/authService';

// Registrar usuario
const result = await authService.signUp({
  email: 'usuario@ejemplo.com',
  password: 'password123',
  nombre: 'Juan Pérez',
  role: 'user'
});

// Iniciar sesión
const { user, profile } = await authService.signIn(
  'usuario@ejemplo.com',
  'password123'
);

// Obtener usuario actual
const { user, profile } = await authService.getCurrentUser();

// Cerrar sesión
await authService.signOut();

// Actualizar perfil
await authService.updateProfile(userId, {
  nombre: 'Nuevo Nombre'
});

// Cambiar contraseña
await authService.changePassword('nuevaPassword123');

// Solicitar reset de contraseña
await authService.resetPassword('usuario@ejemplo.com');
```

### Gestión de Casos (casoService)

```javascript
import * as casoService from './services/casoService';
import { CASO_STATUS, CASO_PRIORITY } from './constants/enums';

// Crear un caso
const nuevoCaso = await casoService.createCaso({
  usuario_id: 1,
  nombre_completo: 'María García',
  fecha_nacimiento: '1990-05-15',
  age: 33,
  gender: 'femenino',
  altura: 1.65,
  peso: 60,
  fecha_desaparicion: '2024-10-01',
  lugar_desaparicion: 'Centro, CDMX',
  status: CASO_STATUS.ACTIVO,
  priority: CASO_PRIORITY.HIGH,
  contactPhone: '+52 555 123 4567',
  contactEmail: 'familiar@ejemplo.com'
});

// Obtener todos los casos
const casos = await casoService.getCasos();

// Filtrar por status
const casosActivos = await casoService.filterByStatus(CASO_STATUS.ACTIVO);

// Filtrar por prioridad
const casosUrgentes = await casoService.filterByPriority(CASO_PRIORITY.URGENT);

// Obtener caso con fotos
const casoConFotos = await casoService.getCasoConFotosById(1);

// Actualizar caso
await casoService.updateCaso(casoId, {
  status: CASO_STATUS.RESUELTO,
  resolutionNote: 'Persona encontrada con bien'
});

// Buscar por nombre
const resultados = await casoService.searchCasosByName('María');

// Agregar actualización a un caso
await casoService.addCasoUpdate(casoId, 'Nueva información recibida');

// Obtener historial de actualizaciones
const updates = await casoService.getCasoUpdates(casoId);
```

### Gestión de Fotos (fotoService)

```javascript
import * as fotoService from './services/fotoService';
import { FOTO_ANGULO } from './constants/enums';

// Subir y guardar foto (flujo completo)
const handleFileUpload = async (file, casoId) => {
  try {
    const foto = await fotoService.uploadAndSaveFoto(
      file,
      casoId,
      FOTO_ANGULO.FRONTAL,
      {
        description: 'Foto frontal reciente',
        date: new Date().toISOString()
      }
    );

    console.log('Foto subida:', foto.url);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Obtener fotos de un caso
const fotos = await fotoService.getFotosByCaso(casoId);

// Verificar fotos completas (3 ángulos)
const { complete, missing } = await fotoService.checkFotosCompletion(casoId);
if (!complete) {
  console.log('Faltan ángulos:', missing);
}

// Reemplazar foto
await fotoService.replaceFoto(
  newFile,
  casoId,
  FOTO_ANGULO.IZQUIERDO
);

// Eliminar foto
await fotoService.deleteFoto(fotoId);
```

### Gestión de Alertas (alertaService)

```javascript
import * as alertaService from './services/alertaService';
import { ALERTA_ESTADO, ALERTA_PRIORIDAD } from './constants/enums';

// Crear alerta
const alerta = await alertaService.createAlerta({
  caso_id: 1,
  camara_id: 5,
  similitud: 0.89,
  prioridad: ALERTA_PRIORIDAD.ALTA
});

// Obtener alertas pendientes
const alertasPendientes = await alertaService.getPendingAlertas();

// Obtener alertas de un caso
const alertasCaso = await alertaService.getAlertasByCaso(casoId);

// Marcar como revisada
await alertaService.markAsReviewed(alertaId);

// Marcar como falso positivo
await alertaService.markAsFalsePositive(alertaId);

// Obtener alertas recientes (últimas 24h)
const alertasRecientes = await alertaService.getRecentAlertas(50);

// Obtener estadísticas
const stats = await alertaService.getAlertaStats();
console.log('Total alertas:', stats.total);
console.log('Por estado:', stats.byEstado);
```

### Gestión de Cámaras (camaraService)

```javascript
import * as camaraService from './services/camaraService';
import { CAMERA_TYPE } from './constants/enums';

// Crear cámara
const camara = await camaraService.createCamara({
  ip: '192.168.1.100',
  ubicacion: 'Entrada Principal',
  type: CAMERA_TYPE.IP,
  resolution: '1920x1080',
  fps: 30,
  url: 'rtsp://192.168.1.100:554/stream',
  activa: true
});

// Obtener cámaras activas
const camarasActivas = await camaraService.getCamarasActivas();

// Activar/Desactivar cámara
await camaraService.activateCamara(camaraId);
await camaraService.deactivateCamara(camaraId);

// Buscar por ubicación
const camaras = await camaraService.searchCamarasByLocation('Entrada');

// Obtener estadísticas
const stats = await camaraService.getCamaraStats();
```

### Notificaciones (notificacionService)

```javascript
import * as notificacionService from './services/notificacionService';
import { NOTIF_TYPE, NOTIF_SEVERITY } from './constants/enums';

// Crear notificación
await notificacionService.createNotificacion({
  type: NOTIF_TYPE.ALERT,
  title: 'Nueva Alerta',
  message: 'Se detectó una posible coincidencia',
  severity: NOTIF_SEVERITY.HIGH,
  usuario_id: userId
});

// Obtener notificaciones del usuario
const notifs = await notificacionService.getNotificacionesByUsuario(userId, {
  unreadOnly: true,
  limit: 20
});

// Marcar como leída
await notificacionService.markAsRead(notifId);

// Marcar todas como leídas
await notificacionService.markAllAsRead(userId);

// Obtener contador de no leídas
const count = await notificacionService.getUnreadCount(userId);
```

## 🎣 Uso de Hooks

### useAuth

```javascript
import { useAuth } from './hooks/useAuth';

function LoginPage() {
  const {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register
  } = useAuth();

  const handleLogin = async () => {
    const result = await login('user@example.com', 'password');
    if (result.success) {
      // Redirigir al dashboard
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenido, {profile.nombre}</p>
          <button onClick={logout}>Cerrar Sesión</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Iniciar Sesión</button>
      )}
    </div>
  );
}
```

### useCasos

```javascript
import { useCasos } from './hooks/useCasos';
import { CASO_STATUS } from './constants/enums';

function CasosPage() {
  const {
    casos,
    loading,
    error,
    fetchCasos,
    createCaso,
    updateCaso,
    deleteCaso,
    filterByStatus
  } = useCasos({ autoLoad: true });

  const handleCreate = async () => {
    await createCaso({
      nombre_completo: 'Juan Pérez',
      // ... otros campos
    });
  };

  const handleFilter = () => {
    filterByStatus(CASO_STATUS.ACTIVO);
  };

  if (loading) return <div>Cargando casos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreate}>Crear Caso</button>
      <button onClick={handleFilter}>Ver Activos</button>

      {casos.map(caso => (
        <div key={caso.id}>
          <h3>{caso.nombre_completo}</h3>
          <p>Status: {caso.status}</p>
        </div>
      ))}
    </div>
  );
}
```

### useAlertas (con Tiempo Real)

```javascript
import { useAlertas } from './hooks/useAlertas';
import { useEffect } from 'react';

function AlertasPage() {
  const {
    alertas,
    loading,
    nuevaAlerta,
    markAsReviewed,
    fetchPendingAlertas
  } = useAlertas({
    autoLoad: true,
    realtime: true  // Habilita tiempo real
  });

  // Notificar cuando hay nueva alerta
  useEffect(() => {
    if (nuevaAlerta) {
      alert(`Nueva alerta detectada! ID: ${nuevaAlerta.id}`);
      // Reproducir sonido, mostrar notificación, etc.
    }
  }, [nuevaAlerta]);

  return (
    <div>
      <h1>Alertas en Tiempo Real</h1>

      {nuevaAlerta && (
        <div className="nueva-alerta-badge">
          ¡Nueva alerta recibida!
        </div>
      )}

      {alertas.map(alerta => (
        <div key={alerta.id}>
          <h3>Alerta #{alerta.id}</h3>
          <p>Similitud: {(alerta.similitud * 100).toFixed(2)}%</p>
          <button onClick={() => markAsReviewed(alerta.id)}>
            Marcar como Revisada
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useNotificaciones (con Tiempo Real)

```javascript
import { useNotificaciones } from './hooks/useNotificaciones';

function NotificationBell({ userId }) {
  const {
    notificaciones,
    unreadCount,
    markAsRead,
    markAllAsRead
  } = useNotificaciones(userId, {
    autoLoad: true,
    realtime: true,
    unreadOnly: false
  });

  return (
    <div className="notification-bell">
      <button>
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      <div className="dropdown">
        <button onClick={markAllAsRead}>
          Marcar todas como leídas
        </button>

        {notificaciones.map(notif => (
          <div
            key={notif.id}
            className={!notif.isRead ? 'unread' : ''}
            onClick={() => markAsRead(notif.id)}
          >
            <strong>{notif.title}</strong>
            <p>{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔐 Autenticación

### Proteger Rutas

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, AdminRoute } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas solo para admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## ⚡ Tiempo Real

### Suscribirse a Nuevas Alertas

```javascript
import { subscribeToNewAlertas } from './services/alertaService';

useEffect(() => {
  const subscription = subscribeToNewAlertas((payload) => {
    const nuevaAlerta = payload.new;
    console.log('Nueva alerta:', nuevaAlerta);

    // Actualizar UI, mostrar notificación, etc.
    showNotification(`Nueva alerta: ${nuevaAlerta.prioridad}`);
  });

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Suscribirse a Notificaciones

```javascript
import { subscribeToNotificaciones } from './services/notificacionService';

useEffect(() => {
  const subscription = subscribeToNotificaciones(userId, (payload) => {
    const nuevaNotif = payload.new;

    // Mostrar notificación de navegador
    if (Notification.permission === 'granted') {
      new Notification(nuevaNotif.title, {
        body: nuevaNotif.message
      });
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

## 🎨 Ejemplo Completo: Crear Caso con Fotos

```javascript
import { useState } from 'react';
import * as casoService from './services/casoService';
import * as fotoService from './services/fotoService';
import { FOTO_ANGULO, CASO_PRIORITY } from './constants/enums';

function CrearCasoForm() {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    fecha_nacimiento: '',
    // ... otros campos
  });

  const [fotos, setFotos] = useState({
    [FOTO_ANGULO.FRONTAL]: null,
    [FOTO_ANGULO.IZQUIERDO]: null,
    [FOTO_ANGULO.DERECHO]: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Crear el caso
      const caso = await casoService.createCaso({
        ...formData,
        usuario_id: currentUserId,
        priority: CASO_PRIORITY.MEDIUM
      });

      // 2. Subir las fotos
      for (const [angulo, file] of Object.entries(fotos)) {
        if (file) {
          await fotoService.uploadAndSaveFoto(
            file,
            caso.id,
            angulo
          );
        }
      }

      alert('Caso creado exitosamente!');

    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el caso');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre completo"
        value={formData.nombre_completo}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          nombre_completo: e.target.value
        }))}
      />

      {/* Subir fotos */}
      <div>
        <h3>Fotos de Referencia</h3>
        {Object.values(FOTO_ANGULO).map(angulo => (
          <div key={angulo}>
            <label>{angulo}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFotos(prev => ({
                ...prev,
                [angulo]: e.target.files[0]
              }))}
            />
          </div>
        ))}
      </div>

      <button type="submit">Crear Caso</button>
    </form>
  );
}
```

## 📊 Auditoría

```javascript
import * as auditoriaService from './services/auditoriaService';

// Registrar login
await auditoriaService.logLogin(userId, ipAddress);

// Registrar creación de caso
await auditoriaService.logCaseCreation(userId, casoId);

// Registrar revisión de alerta
await auditoriaService.logAlertReview(userId, alertaId, 'REVISADA');

// Obtener logs recientes
const logs = await auditoriaService.getRecentLogs(50);

// Buscar logs por acción
const loginLogs = await auditoriaService.searchLogsByAction('logged in');
```

## 🚨 Manejo de Errores

Todos los servicios tienen manejo de errores integrado:

```javascript
try {
  const caso = await casoService.getCasoById(999);
} catch (error) {
  // El error ya viene formateado
  console.error(error.message); // "Failed to fetch case: No rows found"
}

// O con try-catch en componentes
const { success, error } = await createCaso(data);
if (!success) {
  alert(error);
}
```

## 📝 Notas Importantes

1. **RLS (Row Level Security)**: Configurar políticas apropiadas en Supabase
2. **Storage**: El bucket `fotos-referencia` debe existir antes de subir fotos
3. **Índices**: El schema ya incluye índices para optimizar consultas
4. **Tiempo Real**: Las suscripciones se limpian automáticamente al desmontar componentes
5. **Autenticación**: Supabase maneja automáticamente el refresh de tokens
6. **Tipos de Datos**: Respetar los tipos del schema (fechas, decimales, etc.)

## 🔗 Links Útiles

- [Supabase Dashboard](https://app.supabase.com)
- [Documentación Supabase](https://supabase.com/docs)
- [Schema SQL](./docs/db_schema.sql)

## ❓ Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verificar que `.env.local` existe y tiene las variables correctas
- Reiniciar el servidor de desarrollo: `npm run dev`

### Error al subir fotos
- Verificar que el bucket `fotos-referencia` existe en Supabase Storage
- Verificar políticas de acceso del bucket

### No se reciben actualizaciones en tiempo real
- Verificar que Realtime está habilitado en el proyecto Supabase
- Verificar que las tablas tienen RLS configurado correctamente

### Error de autenticación
- Verificar que el usuario existe en Supabase Auth
- Verificar que la tabla Usuario está sincronizada con Auth

---

¡La integración está completa y lista para usar! 🎉
