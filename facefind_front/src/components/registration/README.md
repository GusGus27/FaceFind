# Componentes de Registro - FACEFIND

Este directorio contiene los componentes del formulario multi-paso para registrar personas desaparecidas.

## 📋 Estructura del Formulario

El formulario está dividido en 5 pasos progresivos:

### FormStep1.jsx - Información Personal
- **Campos Obligatorios:**
  - Nombre completo
  - Fecha de nacimiento
  - Edad
  - Género (Masculino/Femenino/Otro)

### FormStep2.jsx - Características Físicas
- **Campos Obligatorios:**
  - Estatura (cm)
  - Tono de piel
  - Color de cabello
  - Color de ojos
- **Campos Opcionales:**
  - Peso (kg)
  - Señas particulares

### FormStep3.jsx - Información de Desaparición
- **Campos Obligatorios:**
  - Fecha de desaparición
  - Último lugar conocido
  - Circunstancias de la desaparición
- **Campos Opcionales:**
  - Hora aproximada
  - Descripción de ropa

### FormStep4.jsx - Contacto de Emergencia
- **Campos Obligatorios:**
  - Nombre del reportante
  - Relación con la persona
  - Teléfono de contacto
  - Correo electrónico
- **Campos Opcionales:**
  - Contacto adicional

### FormStep5.jsx - Fotografías
- **Requisitos:**
  - 3 fotos obligatorias:
    - 1 foto frontal
    - 2 fotos de perfil
  - Formato: JPG o PNG
  - Tamaño máximo: 5MB por imagen
  - Resolución mínima: 300x300 píxeles
- **Características:**
  - Vista previa de imágenes
  - Validación automática de formato, tamaño y resolución
  - Botón para eliminar/reemplazar fotos

## 🎨 Estilos

Los estilos están centralizados en:
- `src/styles/registration/FormStep.css` - Estilos compartidos de todos los pasos
- `src/styles/registration/CaseRegistration.css` - Estilos de la vista principal

## 🔄 Flujo de Trabajo

1. **Usuario completa Paso 1** → Click "Siguiente"
2. **Validación de campos obligatorios** → Si hay errores, se muestran
3. **Si es válido** → Avanza al Paso 2
4. **Repite hasta Paso 5**
5. **Click "Registrar Caso"**
6. **Envío de datos** → Se crea FormData con archivos
7. **Respuesta exitosa** → Pantalla de confirmación con número de caso

## 🔐 Validaciones Implementadas

### Paso 1 (Personal)
- Nombre completo no vacío
- Fecha de nacimiento válida
- Edad mayor a 0
- Género seleccionado

### Paso 2 (Física)
- Estatura entre 50-250 cm
- Colores seleccionados (piel, cabello, ojos)

### Paso 3 (Desaparición)
- Fecha de desaparición válida
- Ubicación no vacía
- Circunstancias descritas

### Paso 4 (Contacto)
- Nombre del reportante no vacío
- Relación seleccionada
- Teléfono con 10 dígitos
- Email con formato válido

### Paso 5 (Fotos)
- Formato: JPG/PNG
- Tamaño: ≤ 5MB
- Resolución: ≥ 300x300px
- 3 fotos obligatorias

## 📱 Responsive Design

Todos los componentes están optimizados para:
- 📱 Móviles (< 480px)
- 📱 Tablets (480px - 768px)
- 💻 Desktop (> 768px)

## 🚀 Uso

```jsx
import CaseRegistration from '../views/CaseRegistration';

// En App.jsx
<Route path="/registrar_caso" element={<CaseRegistration />} />
```

## 📝 Navegación

Los usuarios pueden acceder al formulario desde:
- **Hero Section**: Botón "Registrar un Caso"
- **Header**: Link "📝 Registrar Caso" en la navegación
- **URL directa**: `/registrar_caso`

## 💾 Estructura de Datos

```javascript
{
  // Personal
  fullName: string,
  birthDate: date,
  age: number,
  gender: string,
  
  // Física
  height: number,
  weight: number,
  skinColor: string,
  hairColor: string,
  eyeColor: string,
  distinctiveMarks: string,
  
  // Desaparición
  disappearanceDate: date,
  disappearanceTime: time,
  lastKnownLocation: string,
  circumstances: string,
  clothing: string,
  
  // Contacto
  reporterName: string,
  relationship: string,
  contactPhone: string,
  contactEmail: string,
  additionalContact: string,
  
  // Fotos
  photos: {
    frontal: File,
    profile1: File,
    profile2: File
  }
}
```

## 🎯 Siguiente Paso: Integración Backend

Actualmente el formulario:
- ✅ Valida todos los campos
- ✅ Prepara FormData para envío multipart
- ✅ Simula respuesta del servidor
- ⏳ **Pendiente**: Conectar con API real

Para integrar con backend, actualizar en `CaseRegistration.jsx`:

```javascript
const response = await fetch('http://localhost:5000/api/cases', {
  method: 'POST',
  body: submitData
});
const data = await response.json();
setCaseNumber(data.caseNumber);
```

## 🏆 Características Destacadas

- ✅ Formulario multi-paso con indicador de progreso
- ✅ Validación en tiempo real
- ✅ Manejo de imágenes con preview
- ✅ Responsive design completo
- ✅ Mensajes de error claros
- ✅ Pantalla de éxito con número de caso
- ✅ Navegación intuitiva (Anterior/Siguiente)
- ✅ Scroll automático al cambiar de paso
- ✅ Estado persistente entre pasos
- ✅ Preparado para integración con backend
