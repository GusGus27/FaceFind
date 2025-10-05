# FACEFIND - Landing Page

## Descripción del Proyecto

Landing Page para FACEFIND, un sistema de reconocimiento facial diseñado para ayudar a localizar personas desaparecidas y reunir familias a través de la tecnología.

## Historia de Usuario - HU-19

**Como** visitante sin cuenta  
**Quiero** ver información general del proyecto  
**Para** entender el propósito y efectividad del sistema

### Criterios de Aceptación ✅

- ✅ Landing page con información del proyecto
- ✅ Estadísticas públicas (casos resueltos)
- ✅ Sin información sensible
- ✅ Formulario de contacto
- ✅ Links a registro/login
- ✅ Responsive design

## Estructura de Componentes

```
src/
├── components/
│   ├── Header.jsx          # Navegación principal con links a login/registro
│   ├── Hero.jsx            # Sección principal con mensaje impactante
│   ├── About.jsx           # Información del proyecto y características
│   ├── Statistics.jsx      # Contador animado de estadísticas públicas
│   ├── ContactForm.jsx     # Formulario de contacto con validación
│   └── Footer.jsx          # Pie de página con links y redes sociales
├── styles/
│   ├── Header.css
│   ├── Hero.css
│   ├── About.css
│   ├── Statistics.css
│   ├── ContactForm.css
│   └── Footer.css
├── views/
│   └── LandingPage.jsx     # Vista principal del Landing Page
├── App.jsx                 # Componente principal
└── main.jsx               # Punto de entrada
```

## Características Implementadas

### 1. Header Component
- Logo y nombre del proyecto
- Navegación a secciones (scroll suave)
- Botones de Login y Registro
- Responsive con menú adaptable

### 2. Hero Component
- Mensaje principal atractivo
- Descripción del propósito del sistema
- Call-to-action buttons
- Ícono animado de reconocimiento facial
- Diseño responsive

### 3. About Component
- Información general del proyecto
- Grid de características principales:
  - 🔍 Búsqueda Inteligente
  - 🔒 Seguridad y Privacidad
  - ⚡ Resultados Rápidos
  - 🤝 Colaboración
- Sección de misión
- Diseño adaptable a diferentes dispositivos

### 4. Statistics Component
- Contador animado de estadísticas:
  - Casos Resueltos: 247
  - Búsquedas Activas: 1,523
  - Usuarios Registrados: 8,934
  - Tasa de Éxito: 78%
- Animación de conteo desde 0
- Nota sobre privacidad de datos
- Cards con colores distintivos

### 5. ContactForm Component
- Formulario completo con validación:
  - Nombre (requerido)
  - Email (requerido, validación de formato)
  - Asunto (opcional)
  - Mensaje (requerido)
- Información de contacto:
  - Email: contacto@facefind.com
  - Teléfono: +51 999 888 777
  - Horario de atención
- Mensajes de éxito/error
- Diseño responsivo

### 6. Footer Component
- Información de la empresa
- Links a redes sociales
- Enlaces rápidos a secciones
- Links legales
- Sección de soporte
- Copyright y disclaimer

## Optimización SEO

### Meta Tags Implementados
- **Title**: Optimizado con palabras clave
- **Description**: Descripción completa del servicio
- **Keywords**: Palabras clave relevantes
- **Open Graph**: Para compartir en redes sociales
- **Twitter Cards**: Para mejor visualización en Twitter
- **Robots**: Configurado para indexación

### Mejores Prácticas
- HTML semántico
- Atributos alt en imágenes
- Estructura de headings correcta (H1, H2, H3)
- URLs amigables
- Scroll suave para mejor UX
- Carga optimizada de fuentes (Google Fonts)

## Diseño Responsive

### Breakpoints
- **Desktop**: > 968px
- **Tablet**: 768px - 968px
- **Mobile**: < 768px
- **Mobile Small**: < 480px

### Adaptaciones Móviles
- Grid columns se ajustan automáticamente
- Navegación se reorganiza en dispositivos pequeños
- Tipografía escalada para mejor legibilidad
- Botones y formularios optimizados para touch
- Imágenes responsivas

## Instalación y Uso

### Requisitos Previos
- Node.js (v16 o superior)
- npm o yarn

### Instalación

```bash
# Navegar a la carpeta del proyecto
cd facefind_front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la versión de producción
- `npm run lint` - Ejecuta el linter

## Tecnologías Utilizadas

- **React 19.1.1** - Framework principal
- **Vite 7.1.7** - Build tool y dev server
- **CSS3** - Estilos y animaciones
- **Google Fonts (Inter)** - Tipografía

## Características de Seguridad y Privacidad

- ✅ No se muestra información sensible
- ✅ Estadísticas agregadas y anonimizadas
- ✅ Formulario con validación del lado del cliente
- ✅ No se almacenan datos sin consentimiento
- ✅ Disclaimers sobre uso de datos

## Próximas Mejoras

1. Integración con backend para envío real de formularios
2. Sistema de autenticación (Login/Registro)
3. Implementación de Google Analytics
4. Agregar tests unitarios y de integración
5. Implementar lazy loading para imágenes
6. Añadir animaciones más complejas con Framer Motion
7. Implementar i18n para múltiples idiomas
8. Agregar chatbot de soporte

## Autor

**Proyecto FACEFIND**  
Sistema de Reconocimiento Facial para Personas Desaparecidas  
Desarrollado para fines educativos y de ayuda humanitaria

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

*Reuniendo familias a través de la tecnología* 💙
