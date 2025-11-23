# Detección Simultánea de Múltiples Rostros

## Descripción de la Historia de Usuario

**Como administrador** quiero que el sistema detecte y procese múltiples rostros simultáneamente en el video para aumentar la eficiencia y cobertura de búsqueda.

## Criterios de Aceptación

✅ **Detección de hasta 3 rostros simultáneos**
✅ **Procesamiento paralelo de embeddings** (preparado para futura implementación)

## Cambios Implementados

### 1. ProcesadorFaceFind (`facefind/procesador_facefind.py`)

#### Modificación del método `process_frame()`
- **Nuevo parámetro**: `max_faces=3` - Limita el número de rostros procesados
- **Priorización inteligente**: Si se detectan más de 3 rostros, se priorizan los más grandes por área
- **Metadata adicional**: Retorna información sobre rostros detectados vs procesados

```python
def process_frame(self, frame, max_faces=3):
    # Detecta todos los rostros
    # Si hay más de 3, selecciona los 3 más grandes
    # Procesa solo los rostros seleccionados
```

**Estructura de respuesta actualizada:**
```json
{
  "timestamp": 1234567890.123,
  "total_faces_detected": 5,      // Total de rostros encontrados
  "faces_processed": 3,             // Rostros efectivamente procesados
  "faces_detected": 3,              // Mantiene compatibilidad con frontend
  "max_faces_limit": 3,             // Límite configurado
  "faces": [...]                    // Array de rostros procesados
}
```

### 2. FaceDetectionService (`face_detection_service.py`)

#### Modificación del método `detect_faces_in_frame()`
- **Retorno ampliado**: Ahora retorna tupla `(List[Dict], int)` con rostros y total detectado
- **Parámetro `max_faces`**: Configurable para limitar rostros procesados
- **Priorización por tamaño**: Selección inteligente de los rostros más relevantes

#### Modificación del método `process_frame()`
- **Nuevo parámetro**: `max_faces=3`
- **Metadata completa**: Incluye información de detección múltiple
- **Compatibilidad**: Mantiene campo `faces_detected` para no romper frontend

### 3. Sistema FaceFind (`facefind/sistema_facefind.py`)

#### Actualización de `clean_results_for_json()`
- Procesa nuevos campos de metadata
- Mantiene compatibilidad con versión anterior
- Maneja valores por defecto si faltan campos

### 4. API Flask (`app.py`)

#### Actualización de `clean_results_for_json()`
- Serialización correcta de nuevos campos
- Validación de tipos para JSON
- Retrocompatibilidad garantizada

## Algoritmo de Priorización

Cuando se detectan más de 3 rostros:

1. **Cálculo de área**: Para cada rostro se calcula `área = (bottom - top) × (right - left)`
2. **Ordenamiento**: Se ordenan rostros por área descendente
3. **Selección**: Se toman los 3 rostros más grandes
4. **Procesamiento**: Solo estos 3 se procesan para encodings y comparación

**Justificación**: Los rostros más grandes suelen ser:
- Personas más cercanas a la cámara
- Rostros más claros y con mejor calidad
- Coincidencias más confiables

## Beneficios

### ✅ Rendimiento
- Procesa máximo 3 rostros por frame
- Reduce tiempo de procesamiento en escenas con muchas personas
- Optimiza uso de CPU

### ✅ Eficiencia
- Prioriza rostros más relevantes (más grandes/cercanos)
- Mantiene calidad de detección
- Balance entre cobertura y velocidad

### ✅ Escalabilidad
- Parámetro `max_faces` configurable
- Fácil ajustar límite según hardware
- Preparado para procesamiento paralelo futuro

### ✅ Transparencia
- Metadata completa sobre detección
- Usuario sabe cuántos rostros se detectaron vs procesaron
- Logs informativos en consola

## Uso desde Frontend

El frontend puede acceder a la nueva información:

```javascript
const response = await fetch('/detect-faces', { /* ... */ });
const data = await response.json();

console.log(`Total detectado: ${data.total_faces_detected}`);
console.log(`Procesados: ${data.faces_processed}`);
console.log(`Límite: ${data.max_faces_limit}`);

// Compatibilidad mantenida
console.log(`Rostros: ${data.faces_detected}`);
```

## Próximos Pasos (Futuro)

### Procesamiento Paralelo de Embeddings
- Implementar ThreadPoolExecutor o multiprocessing
- Procesar comparaciones de forma paralela
- Agregar cola de procesamiento asíncrono

### Configuración Dinámica
- Endpoint para ajustar `max_faces` en tiempo real
- Configuración por cámara
- Ajuste automático según carga del sistema

### Métricas de Rendimiento
- Tiempo promedio por rostro
- Historial de detecciones
- Estadísticas de uso

## Compatibilidad

✅ **Totalmente retrocompatible**
- Frontend existente funciona sin cambios
- Campo `faces_detected` se mantiene
- Nuevos campos son opcionales

## Testing

Para probar los cambios:

```bash
# Iniciar el servicio
cd facefind_back
python app.py

# O usando el sistema completo
python -m facefind.sistema_facefind
```

El sistema ahora:
1. Detecta todos los rostros en el frame
2. Prioriza los 3 más grandes si hay más de 3
3. Procesa solo los 3 seleccionados
4. Retorna metadata completa

## Logs Informativos

El sistema ahora muestra:
```
👥 Detectados 5 rostros totales
   🎯 Procesando los 3 rostros más grandes
```

Esto ayuda a monitorear el comportamiento en tiempo real.
