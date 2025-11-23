# Sistema de Notificaciones Mejorado - FaceFind

## 📋 Descripción General

Se ha implementado un sistema completo de notificaciones y alertas para el Sprint 2, cumpliendo con todos los criterios de aceptación de la historia de usuario:

**Historia de Usuario:** Como administrador, quiero recibir alertas cuando se detecte una coincidencia para poder actuar rápidamente.

## ✅ Criterios de Aceptación Implementados

### 1. ✅ Notificación inmediata en dashboard (real-time)
- Sistema de actualización en tiempo real mediante polling automático
- Indicadores visuales de notificaciones no leídas
- Contador de notificaciones pendientes
- Animaciones y badges para destacar nuevas alertas

### 2. ✅ Notificación por email para coincidencias mayores al umbral
- Backend configurado con sistema de cola de notificaciones
- Priorización automática basada en nivel de confianza
- Servicios de notificación integrados con Supabase

### 3. ✅ Detalles de detección (hora, lugar, confianza)
- Modal detallado con toda la información de la alerta
- Visualización de:
  - Timestamp exacto de detección
  - Ubicación de la cámara
  - Nivel de confianza/similitud (porcentaje)
  - Estado de la alerta
  - Información del caso relacionado

### 4. ✅ Imagen capturada del momento
- Visualización de la imagen capturada en el modal
- Preview en las tarjetas de notificación
- Manejo de errores si la imagen no está disponible
- Timestamp sobre la imagen

### 5. ✅ Priorización por nivel de coincidencia
- Sistema de 3 niveles de prioridad:
  - 🚨 **Alta**: Coincidencias >= 90%
  - ⚠️ **Media**: Coincidencias 70-89%
  - ℹ️ **Baja**: Coincidencias < 70%
- Colores distintivos por prioridad
- Ordenamiento automático por prioridad

### 6. ✅ Historial de notificaciones
- Almacenamiento completo de todas las notificaciones
- Marcado de leídas/no leídas
- Estadísticas de notificaciones
- Visualización en grid responsivo

## 🎨 Componentes Creados

### 1. NotificationCard.jsx
Tarjeta visual para cada notificación con:
- **Preview de imagen**: Miniatura de la captura
- **Badges informativos**: Caso, cámara, ubicación, confianza
- **Indicadores de prioridad**: Colores y iconos
- **Marca de no leída**: Punto pulsante azul
- **Acciones rápidas**: Marcar como leída, ver detalles
- **Animaciones**: Hover effects y transiciones

**Estilos:** `NotificationCard.css`

### 2. NotificationDetailModal.jsx
Modal completo con todos los detalles:
- **Imagen grande**: Visualización completa de la captura
- **Información detallada**:
  - Fecha y hora exacta
  - Ubicación GPS/Dirección
  - Cámara que detectó
  - Caso relacionado
  - Persona desaparecida
  - Estado de la alerta
- **Barra de confianza**: Indicador visual del nivel de similitud
- **Badges de prioridad**: Destacados con colores
- **Metadata**: IDs, fechas de creación y lectura

**Estilos:** `NotificationDetailModal.css`

### 3. NotificationFilters.jsx
Sistema avanzado de filtrado con:
- **Búsqueda textual**: Por contenido, caso, ubicación
- **Filtros rápidos**:
  - Solo no leídas
  - Por prioridad (Alta/Media/Baja)
  - Ordenamiento (Fecha, Prioridad, Confianza)
- **Filtros avanzados** (colapsables):
  - Por estado (Pendiente, Revisada, Confirmada, Falso Positivo)
  - Por caso específico
  - Por cámara
  - Rango de fechas (Desde/Hasta)
  - Atajos de fecha (Hoy, Última semana, Último mes)
- **Resumen de filtros activos**: Tags removibles
- **Contador de resultados**: Feedback instantáneo

**Estilos:** `NotificationFilters.css`

### 4. ExportReport.jsx
Sistema de exportación de reportes con 3 formatos:

#### 📊 CSV (Excel, Google Sheets)
- Todas las notificaciones en formato tabular
- Columnas: ID, Fecha, Asunto, Contenido, Prioridad, Estado, Confianza, Caso, Persona, Cámara, Ubicación, Leída
- Encoding UTF-8 con BOM para compatibilidad

#### 📄 JSON (Datos estructurados)
- Formato completo con metadata
- Incluye filtros aplicados
- Estructura anidada con toda la información
- Ideal para procesamiento automático

#### 🌐 HTML (Reporte web imprimible)
- Diseño profesional con estilos
- Estadísticas visuales en cards
- Información organizada por notificación
- Listo para imprimir o compartir
- Responsive y con colores por prioridad

**Estilos:** `ExportReport.css`

## 🔄 NotificationsView.jsx Actualizado

### Funcionalidades Agregadas:
1. **Carga de datos completa**:
   - Notificaciones
   - Estadísticas
   - Lista de cámaras
   - Lista de casos

2. **Sistema de filtrado inteligente**:
   - Búsqueda en tiempo real
   - Múltiples criterios simultáneos
   - Ordenamiento dinámico
   - Persistencia de filtros

3. **Visualización mejorada**:
   - Grid responsivo de tarjetas
   - Modal de detalles
   - Estados de carga y vacío
   - Animaciones suaves

4. **Acciones batch**:
   - Marcar todas como leídas (respeta filtros)
   - Exportación de reportes

5. **Integración completa**:
   - Todos los componentes nuevos
   - Flujo de datos optimizado
   - Manejo de errores

## 🎯 Funcionalidades Destacadas

### Sistema de Priorización Automática
```javascript
const getPriorityInfo = (priority) => {
  switch (priority) {
    case 'ALTA':
      return { icon: '🚨', label: 'Alta Prioridad', class: 'priority-high' };
    case 'MEDIA':
      return { icon: '⚠️', label: 'Prioridad Media', class: 'priority-medium' };
    case 'BAJA':
      return { icon: 'ℹ️', label: 'Prioridad Baja', class: 'priority-low' };
  }
};
```

### Barra de Confianza Visual
```javascript
const confidenceInfo = getConfidenceLevel(confidence);
// Muestra barra de progreso con colores según nivel:
// 90-100%: Verde (Muy Alta)
// 80-89%: Azul (Alta)
// 70-79%: Amarillo (Media)
// <70%: Rojo (Baja)
```

### Filtrado Inteligente
```javascript
// Búsqueda multi-campo
if (filters.searchQuery) {
  filtered = filtered.filter(n =>
    (n.asunto?.toLowerCase().includes(query)) ||
    (n.contenido?.toLowerCase().includes(query)) ||
    (n.alerta?.ubicacion?.toLowerCase().includes(query)) ||
    (n.alerta?.caso?.num_caso?.toString().includes(query))
  );
}
```

### Ordenamiento Flexible
- **Fecha descendente**: Más recientes primero
- **Fecha ascendente**: Más antiguas primero
- **Por prioridad**: Alta → Media → Baja
- **Por confianza**: Mayor similitud primero

## 📱 Diseño Responsive

Todos los componentes son completamente responsive:

- **Desktop (>1024px)**: Grid de 3 columnas
- **Tablet (768-1024px)**: Grid de 2 columnas
- **Mobile (<768px)**: 1 columna con diseño adaptado
- **Small Mobile (<480px)**: Layout optimizado para pantallas pequeñas

## 🎨 Paleta de Colores

### Prioridades
- **Alta**: `#dc3545` (Rojo)
- **Media**: `#ffc107` (Amarillo)
- **Baja**: `#17a2b8` (Azul claro)
- **Normal**: `#6c757d` (Gris)

### Estados
- **Pendiente**: Amarillo
- **Revisada**: Azul
- **Confirmada**: Verde
- **Falso Positivo**: Rojo

### Gradientes Principales
- **Primario**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Éxito**: `linear-gradient(135deg, #51cf66 0%, #37b24d 100%)`
- **Peligro**: `linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)`

## 🔧 Integración con Backend

### Endpoints Utilizados:
```javascript
GET /api/notifications/historial?limite=500
GET /api/notifications/estadisticas
GET /api/cameras
GET /api/casos
PUT /api/notifications/{id}/marcar-leida
```

### Estructura de Datos:
```javascript
{
  id: number,
  asunto: string,
  contenido: string,
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA',
  creada_en: timestamp,
  leida_en: timestamp | null,
  alerta: {
    id: number,
    timestamp: timestamp,
    similitud: float,
    estado: string,
    ubicacion: string,
    imagen_url: string,
    caso: {
      num_caso: number,
      persona_desaparecida: {
        nombre: string,
        edad: number,
        ...
      }
    },
    camara: {
      nombre: string,
      tipo: string,
      ubicacion: string
    }
  }
}
```

## 🚀 Uso

### 1. Vista Principal - Integrada en AdminPanel
El sistema de notificaciones está completamente integrado en el **Panel de Administración**:

```jsx
// En AdminPanel.jsx
import NotificationPanel from '../components/admin/NotificationPanel';

// Al hacer click en "Notificaciones" en el sidebar:
<button
  className={`admin-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
  onClick={() => setActiveSection('notifications')}
>
  <span className="icon">🔔</span>
  Notificaciones
</button>

// Se renderiza:
case 'notifications':
  return <NotificationPanel />;
```

### 2. Vista Standalone (Opcional)
También puedes usar la vista independiente:
```jsx
import NotificationsView from './views/NotificationsView';

// En el router:
<Route path="/notifications" element={<NotificationsView />} />
```

### 2. Componentes Individuales
```jsx
// Usar NotificationCard independientemente
import NotificationCard from './components/common/NotificationCard';

<NotificationCard
  notification={notificationData}
  onMarkAsRead={handleMarkAsRead}
  onClick={handleClick}
/>
```

### 3. Modal de Detalles
```jsx
import NotificationDetailModal from './components/common/NotificationDetailModal';

<NotificationDetailModal
  notification={selectedNotification}
  onClose={() => setSelectedNotification(null)}
/>
```

### 4. Sistema de Filtros
```jsx
import NotificationFilters from './components/common/NotificationFilters';

<NotificationFilters
  onFilterChange={handleFilterChange}
  totalCount={filteredNotifications.length}
  cameras={cameras}
  cases={cases}
/>
```

### 5. Exportación de Reportes
```jsx
import ExportReport from './components/common/ExportReport';

<ExportReport
  notifications={filteredNotifications}
  filters={currentFilters}
/>
```

## 📊 Características Técnicas

### Performance
- **Filtrado optimizado**: O(n) con búsqueda indexada
- **Renderizado eficiente**: React.memo para componentes
- **Lazy loading**: Imágenes con loading="lazy"
- **Debouncing**: Búsqueda con delay de 300ms

### Accesibilidad
- **ARIA labels**: En todos los botones
- **Keyboard navigation**: Soporte completo
- **Screen readers**: Texto alternativo en imágenes
- **Contraste**: WCAG 2.1 AA compliant

### UX
- **Animaciones suaves**: Transiciones de 0.2-0.3s
- **Feedback visual**: Estados hover/active claros
- **Loading states**: Spinners y mensajes
- **Empty states**: Mensajes descriptivos
- **Error handling**: Fallbacks para imágenes

## 🔄 Próximas Mejoras Sugeridas

1. **WebSockets**: Real-time en lugar de polling
2. **Push Notifications**: Notificaciones del navegador
3. **Email Templates**: Diseño HTML para emails
4. **PDF Export**: Reportes en formato PDF
5. **Filtros guardados**: Guardar configuraciones de filtros
6. **Gráficos**: Visualizaciones de estadísticas
7. **Búsqueda avanzada**: Regex y operadores lógicos
8. **Notificaciones por rol**: Personalización por usuario

## 📝 Notas de Implementación

- Todos los componentes son **reutilizables**
- Código **modular** y bien comentado
- Estilos **sin conflictos** con otras vistas
- Compatible con **todos los navegadores modernos**
- **CSS puro**, sin dependencias externas
- Preparado para **i18n** (internacionalización)

## ✅ Testing Sugerido

1. **Funcional**:
   - Filtrado por cada criterio
   - Ordenamiento
   - Exportación en cada formato
   - Marcado de leídas
   - Modal de detalles

2. **Visual**:
   - Responsive en diferentes tamaños
   - Colores de prioridad
   - Animaciones
   - Estados de carga

3. **Performance**:
   - Carga con 1000+ notificaciones
   - Filtrado rápido
   - Exportación de grandes volúmenes

## 👥 Autor

Implementación completa del sistema de notificaciones para FaceFind Sprint 2.

**Fecha:** Noviembre 2025
