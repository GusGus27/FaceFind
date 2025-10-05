# FACEFIND - Landing Page

## 🎯 Descripción del Proyecto

Landing Page para **FACEFIND**, un sistema de reconocimiento facial diseñado para ayudar a localizar personas desaparecidas y reunir familias a través de la tecnología e inteligencia artificial.

## ✅ Estado del Proyecto

**Landing Page completamente funcional** implementando la Historia de Usuario HU-19.

### Criterios de Aceptación Completados

- ✅ Landing page con información del proyecto
- ✅ Estadísticas públicas (247 casos resueltos, 1,523 búsquedas activas, 8,934 usuarios, 78% de éxito)
- ✅ Sin información sensible (solo datos agregados)
- ✅ Formulario de contacto con validación
- ✅ Links a registro/login en el header
- ✅ Responsive design (Desktop, Tablet, Mobile)

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5173/
```

## 📦 Estructura del Proyecto

```
facefind_front/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.jsx       # Navegación principal
│   │   ├── Hero.jsx         # Sección principal
│   │   ├── About.jsx        # Información del proyecto
│   │   ├── Statistics.jsx   # Estadísticas animadas
│   │   ├── ContactForm.jsx  # Formulario de contacto
│   │   └── Footer.jsx       # Pie de página
│   ├── styles/              # Estilos CSS modulares
│   │   ├── Header.css
│   │   ├── Hero.css
│   │   ├── About.css
│   │   ├── Statistics.css
│   │   ├── ContactForm.css
│   │   └── Footer.css
│   ├── views/               # Vistas principales
│   │   └── LandingPage.jsx
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── public/                  # Recursos estáticos
├── docs/                    # Documentación del proyecto
├── index.html              # HTML con SEO optimizado
└── package.json            # Dependencias
```

## 🎨 Componentes Implementados

### 1. Header
- Logo FACEFIND
- Navegación con scroll suave
- Botones de Login y Registro
- Diseño sticky y responsive

### 2. Hero Section
- Título principal impactante
- Descripción del propósito
- Call-to-action buttons
- Icono animado de reconocimiento facial

### 3. About Section
- Descripción completa del proyecto
- 4 características clave con iconos
- Sección de misión con gradiente
- Grid responsive

### 4. Statistics Section
- Contador animado desde 0
- 4 métricas con colores distintivos
- Nota sobre privacidad de datos
- Actualización visual en tiempo real

### 5. Contact Form
- Validación completa del formulario
- Campos: nombre, email, asunto, mensaje
- Información de contacto
- Feedback visual (success/error)

### 6. Footer
- Grid de 4 columnas con información
- Enlaces rápidos y legales
- Redes sociales
- Copyright y disclaimer

## 🎯 Características Destacadas

### Diseño Responsive
- **Desktop**: > 968px - Grid completo
- **Tablet**: 768-968px - Grid adaptado
- **Mobile**: < 768px - Stack vertical
- **Mobile Small**: < 480px - Optimización extra

### Animaciones
- Contador de estadísticas animado (2 segundos)
- Hover effects en todos los elementos
- Smooth scroll entre secciones
- Icono pulsante en Hero

### Validación de Formulario
- Validación de campos requeridos
- Validación de formato de email
- Mensajes de éxito/error
- Auto-limpieza tras envío

### SEO Optimizado
- Meta tags completos
- Open Graph para redes sociales
- Twitter Cards
- Estructura HTML semántica
- Título y descripción optimizados

## 🛠️ Tecnologías

- **React**: 19.1.1 - Framework UI
- **Vite**: 7.1.9 - Build tool
- **CSS3**: Estilos modernos con Grid, Flexbox
- **Google Fonts**: Inter typography

## 📝 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Crea build optimizado
npm run preview      # Preview del build

# Calidad
npm run lint         # Ejecuta ESLint
```

## 🎨 Paleta de Colores

```css
Primary: #2563eb (Azul)
Secondary: #667eea (Azul-morado)
Accent: #764ba2 (Morado)
Text Dark: #1e293b
Text Light: #64748b
Background: #f8fafc
```

## 📊 Estadísticas Implementadas

- **Casos Resueltos**: 247
- **Búsquedas Activas**: 1,523
- **Usuarios Registrados**: 8,934
- **Tasa de Éxito**: 78%

*Nota: Estadísticas de ejemplo que deben conectarse con el backend real.*

## 📱 Información de Contacto

- **Email**: contacto@facefind.com
- **Teléfono**: +51 999 888 777
- **Horario**: Lunes a Viernes 9:00 AM - 6:00 PM

## 📚 Documentación Adicional

- [LANDING_PAGE_README.md](./LANDING_PAGE_README.md) - Documentación técnica completa
- [QUICK_START.md](./QUICK_START.md) - Guía rápida de inicio
- [docs/](./docs/) - Documentación del proyecto y diagramas

## 🔄 Próximos Pasos

1. Integrar backend para formulario de contacto
2. Implementar sistema de autenticación
3. Conectar estadísticas con API real
4. Agregar tests unitarios
5. Implementar Google Analytics

## 👥 Equipo

**Historia de Usuario**: HU-19  
**Asignado a**: Pedro Tupac (Alumno 5)  
**Prioridad**: Should Have  
**Puntos de Historia**: 3

## 📄 Licencia

Este proyecto es de código abierto para fines educativos y humanitarios.

---

**¡Reuniendo familias a través de la tecnología!** 💙

Para más información, visita: http://localhost:5173/
