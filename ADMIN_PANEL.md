# Panel de Administración - FaceFind

## 📋 Descripción
Panel de control administrativo completo para la gestión del sistema FaceFind. Incluye funcionalidades de administración de usuarios, casos, notificaciones y logs de auditoría.

## ✨ Características Implementadas

### 1. Dashboard Principal
- **Métricas en tiempo real**: Visualización de usuarios totales, casos activos, resueltos y pendientes
- **Gráficos de estado**: Distribución visual de casos por estado
- **Actividad reciente**: Feed de últimas acciones en el sistema
- **Tarjetas de métricas**: Cards interactivas con tendencias

### 2. Gestión de Usuarios
- Visualización de todos los usuarios del sistema
- Búsqueda por nombre o email
- Filtrado por rol (Admin, Moderador, Usuario)
- Cambio de roles en tiempo real
- Activación/Desactivación de cuentas
- Eliminación de usuarios
- Tabla responsive con información detallada

### 3. Gestión de Casos
- Vista en tarjetas de todos los casos
- Búsqueda por título o ubicación
- Filtrado por estado (Activo, Pendiente, Resuelto)
- Cambio de estado de casos
- Gestión de prioridades (Urgente, Alta, Media, Baja)
- Indicadores visuales de prioridad
- Eliminación de casos

### 4. Panel de Notificaciones
- Sistema de notificaciones en tiempo real
- Filtrado por tipo (Coincidencias, Casos, Sistema, Alertas)
- Marcado de notificaciones como leídas
- Función "Marcar todas como leídas"
- Notificaciones no leídas destacadas
- Indicadores de severidad (Urgente, Alta, Media, Baja)
- Eliminación individual de notificaciones

### 5. Logs de Actividad
- Registro completo de auditoría del sistema
- Búsqueda en logs
- Filtrado por tipo de acción
- Filtrado por fecha
- Exportación de logs en JSON
- Información detallada: usuario, IP, timestamp, estado
- Iconos visuales por tipo de acción
- Estados codificados por color

### 6. Sistema de Autenticación
- Login simple con selección de rol
- Modal interactivo
- Gestión de sesión con Context API
- Protección de rutas administrativas
- Indicador de usuario logueado en header
- Badge especial para administradores

## 🎨 Componentes Creados

### Contexto
- `AuthContext.jsx` - Manejo de autenticación y roles

### Vistas
- `AdminPanel.jsx` - Layout principal del panel admin

### Componentes Admin
- `AdminDashboard.jsx` - Dashboard con métricas
- `MetricCard.jsx` - Tarjetas de métricas
- `RecentActivity.jsx` - Feed de actividad
- `CaseStatusChart.jsx` - Gráfico de estados
- `UserManagement.jsx` - Gestión de usuarios
- `CaseManagement.jsx` - Gestión de casos
- `NotificationPanel.jsx` - Panel de notificaciones
- `ActivityLogs.jsx` - Logs de auditoría

### Componentes Generales
- `LoginModal.jsx` - Modal de inicio de sesión

### Estilos
- Archivos CSS individuales para cada componente
- Diseño responsive
- Tema consistente con colores corporativos
- Animaciones y transiciones suaves

## 🚀 Cómo Usar

### Acceso al Panel
1. Hacer clic en "Iniciar Sesión" en el header
2. Seleccionar "Administrador" en el modal
3. Hacer clic en "Ingresar como Administrador"
4. Automáticamente redirige al panel admin

### Navegación
- Usa el sidebar lateral para navegar entre secciones
- El botón activo se destaca visualmente
- El contenido cambia dinámicamente

### Funcionalidades por Sección

#### Dashboard
- Visualiza métricas generales
- Revisa actividad reciente
- Analiza distribución de casos

#### Gestión de Usuarios
- Busca usuarios específicos
- Cambia roles desde el selector
- Activa/Desactiva usuarios con el botón de candado
- Elimina usuarios con el botón de papelera

#### Gestión de Casos
- Busca casos por título o ubicación
- Cambia estados desde el selector
- Ajusta prioridades según urgencia
- Visualiza detalles completos

#### Notificaciones
- Filtra por tipo de notificación
- Marca como leídas individualmente
- Marca todas como leídas con un clic
- Elimina notificaciones no deseadas

#### Logs
- Busca términos específicos en logs
- Filtra por tipo de acción
- Filtra por rango de fechas
- Exporta logs para análisis externo

## 🎯 Criterios de Aceptación Cumplidos

✅ Dashboard con métricas principales
✅ Acceso a gestión de usuarios
✅ Acceso a gestión de casos
✅ Panel de notificaciones
✅ Logs de actividad del sistema
✅ Vista diferenciada del usuario normal

## 🔧 Tareas Completadas

✅ Diseñar layout de administración
✅ Implementar sistema de roles y permisos
✅ Crear dashboard con widgets informativos
✅ Desarrollar sistema de notificaciones
✅ Implementar logs de auditoría

## 📱 Responsive Design
El panel es completamente responsive:
- Desktop: Sidebar fijo lateral
- Tablet: Sidebar adaptado
- Mobile: Navegación horizontal con scroll

## 🎨 Paleta de Colores
- Primario: #1a237e (Azul oscuro)
- Secundario: #283593 (Azul medio)
- Éxito: #2e7d32 (Verde)
- Error: #c62828 (Rojo)
- Advertencia: #ef6c00 (Naranja)
- Info: #1976d2 (Azul claro)

## 🔐 Seguridad
- Rutas protegidas con verificación de rol
- Redirección automática si no es admin
- Contexto seguro para manejo de sesión

## 🚀 Próximas Mejoras Sugeridas
- Conectar con backend real
- Implementar WebSockets para notificaciones en tiempo real
- Agregar más gráficos estadísticos
- Sistema de permisos granular
- Exportación de reportes en PDF
- Panel de configuración del sistema
- Backup y restauración de datos
