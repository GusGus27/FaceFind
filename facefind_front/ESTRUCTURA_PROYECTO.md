# 📁 Estructura del Proyecto FACEFIND - Frontend

## ✅ Reorganización Completada

Este documento describe la nueva estructura organizada del proyecto FACEFIND frontend.

---

## 📂 Estructura de Directorios

```
src/
├── components/                 # Componentes organizados por funcionalidad
│   ├── common/                # Componentes compartidos en toda la app
│   │   ├── Header.jsx         # Barra de navegación principal
│   │   ├── Footer.jsx         # Pie de página
│   │   ├── LoginModal.jsx     # Modal de inicio de sesión
│   │   └── FormInput.jsx      # Input reutilizable para formularios
│   │
│   ├── landing/               # Componentes del Landing Page
│   │   ├── Hero.jsx           # Sección hero principal
│   │   ├── About.jsx          # Sección "Acerca de"
│   │   ├── Statistics.jsx     # Estadísticas animadas
│   │   └── ContactForm.jsx    # Formulario de contacto
│   │
│   ├── cases/                 # Componentes de gestión de casos
│   │   ├── CaseCard.jsx       # Tarjeta individual de caso
│   │   ├── CaseList.jsx       # Lista de casos
│   │   ├── FilterBar.jsx      # Barra de filtros
│   │   └── Pagination.jsx     # Paginación
│   │
│   ├── admin/                 # Componentes del panel administrativo
│   │   ├── AdminDashboard.jsx # Dashboard principal
│   │   ├── UserManagement.jsx # Gestión de usuarios
│   │   ├── CaseManagement.jsx # Gestión de casos
│   │   ├── NotificationPanel.jsx # Panel de notificaciones
│   │   ├── ActivityLogs.jsx   # Registro de actividad
│   │   ├── RecentActivity.jsx # Actividad reciente
│   │   ├── CaseStatusChart.jsx # Gráfico de estados
│   │   └── MetricCard.jsx     # Tarjetas de métricas
│   │
│   └── registration/          # Componentes de registro de casos
│       └── (Formularios multi-paso - por implementar)
│
├── views/                     # Vistas/Páginas principales
│   ├── LandingPage.jsx        # Página de inicio (/)
│   ├── Login.jsx              # Página de login (/login)
│   ├── Register.jsx           # Página de registro (/register)
│   ├── UserCasesView.jsx      # Vista de casos de usuario (/casos)
│   └── AdminPanel.jsx         # Panel de administración (/admin)
│
├── styles/                    # Estilos organizados por módulo
│   ├── common/                # Estilos de componentes compartidos
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   └── LoginModal.css
│   │
│   ├── landing/               # Estilos del Landing Page
│   │   ├── Hero.css
│   │   ├── About.css
│   │   ├── Statistics.css
│   │   └── ContactForm.css
│   │
│   ├── admin/                 # Estilos del panel admin
│   │   ├── AdminPanel.css
│   │   ├── AdminDashboard.css
│   │   ├── UserManagement.css
│   │   ├── CaseManagement.css
│   │   ├── ActivityLogs.css
│   │   ├── CaseStatusChart.css
│   │   ├── MetricCard.css
│   │   ├── NotificationPanel.css
│   │   └── RecentActivity.css
│   │
│   └── views/                 # Estilos de vistas
│       ├── Login.css
│       ├── Register.css
│       └── UserCasesView.css
│
├── context/                   # Contextos de React
│   └── AuthContext.jsx        # Contexto de autenticación
│
├── assets/                    # Recursos estáticos
│   └── react.svg
│
├── App.jsx                    # Componente principal de la app
├── main.jsx                   # Punto de entrada
├── App.css                    # Estilos globales de la app
└── index.css                  # Estilos globales base
```

---

## 🛣️ Rutas de la Aplicación

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | LandingPage | Página de inicio con Hero, About, Statistics y ContactForm |
| `/login` | Login | Página de inicio de sesión |
| `/register` | Register | Página de registro de usuarios |
| `/casos` | UserCasesView | Vista de casos para usuarios autenticados |
| `/admin` | AdminPanel | Panel de administración (solo administradores) |

---

## 🔄 Cambios Realizados

### ✅ Componentes Reorganizados

1. **Componentes Comunes** (`common/`):
   - Movidos: Header, Footer, LoginModal, FormInput
   - Rutas actualizadas: `../../context/`, `../../styles/common/`

2. **Componentes Landing** (`landing/`):
   - Movidos: Hero, About, Statistics, ContactForm
   - Rutas actualizadas: `../../styles/landing/`

3. **Componentes Cases** (`cases/`):
   - Movidos: CaseCard, CaseList, FilterBar, Pagination
   - Sin CSS propios (usan estilos inline o globales)

4. **Componentes Admin** (`admin/`):
   - Ya estaban en subcarpeta ✓
   - Rutas CSS actualizadas: `../../styles/admin/`

### ✅ Vistas Reorganizadas

- `Login.jsx` y `Register.jsx` movidos de subcarpetas a nivel raíz de `/views`
- Imports actualizados para referenciar componentes desde sus nuevas ubicaciones
- Estilos movidos a `styles/views/`

### ✅ Estilos Reorganizados

Todos los CSS agrupados por módulo:
- `styles/common/` - Estilos compartidos
- `styles/landing/` - Estilos del landing
- `styles/admin/` - Estilos de administración
- `styles/views/` - Estilos de vistas principales

### ✅ Configuración de Rutas

- `main.jsx`: Agregado `<BrowserRouter>` wrapper
- `App.jsx`: Simplificado para usar solo `<Routes>` y `<Route>`
- Cada vista ahora es una ruta independiente

---

## 📝 Patrón de Imports

### Para Componentes en `/components/[módulo]/`:
```jsx
// Contextos
import { useAuth } from '../../context/AuthContext';

// Estilos
import '../../styles/[módulo]/ComponentName.css';

// Otros componentes del mismo módulo
import OtroComponente from './OtroComponente';

// Componentes de otros módulos
import Header from '../common/Header';
```

### Para Vistas en `/views/`:
```jsx
// Componentes
import Header from '../components/common/Header';
import Hero from '../components/landing/Hero';

// Estilos
import '../styles/views/ViewName.css';

// Contextos
import { useAuth } from '../context/AuthContext';
```

---

## 🎯 Ventajas de la Nueva Estructura

1. **✅ Organización Clara**: Componentes agrupados por funcionalidad
2. **✅ Escalabilidad**: Fácil agregar nuevos módulos
3. **✅ Mantenibilidad**: Código más fácil de encontrar y modificar
4. **✅ Separación de Responsabilidades**: Vistas, componentes y estilos claramente separados
5. **✅ Consistencia**: Patrón de imports uniforme
6. **✅ Reutilización**: Componentes comunes centralizados

---

## 🚀 Próximos Pasos Sugeridos

1. **Implementar `/registrar_caso`**:
   - Crear vista `CaseRegistration.jsx`
   - Mover FormStep1-5 a `/components/registration/`
   - Agregar ruta en App.jsx

2. **Optimizar componentes comunes**:
   - Crear más componentes reutilizables (Button, Card, Input, etc.)

3. **Agregar lazy loading**:
   - Implementar React.lazy() para rutas pesadas

4. **Documentación de componentes**:
   - Agregar PropTypes o TypeScript
   - Documentar props de cada componente

---

## 🔍 Verificación

Para verificar que todo funciona correctamente:

```bash
# Instalar dependencias (si es necesario)
npm install

# Iniciar servidor de desarrollo
npm run dev

# Verificar que no hay errores en consola
# Navegar a: http://localhost:5173
```

**Estado Actual**: ✅ Sin errores de compilación

---

## 📞 Notas Adicionales

- **Node.js Version Warning**: El proyecto requiere Node.js 20.19+ o 22.12+
- **React Router**: Instalado y configurado correctamente
- **AuthContext**: Funcionando en todos los componentes
- **Estilos**: Todos los imports actualizados correctamente

---

*Documentación generada el: 5 de Octubre, 2025*
*Proyecto: FACEFIND - Sistema de Reconocimiento Facial*
