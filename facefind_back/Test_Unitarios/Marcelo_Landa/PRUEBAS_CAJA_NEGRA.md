# Pruebas de Caja Negra - limpiar_evidencias_antiguas()

**Función:** `EvidenciaService.limpiar_evidencias_antiguas()`  
**Autor:** Marcelo Landa  
**Fecha:** Noviembre 2025

---

## 📋 Descripción

Documento de pruebas de caja negra (Black Box Testing) para la función `limpiar_evidencias_antiguas()` del servicio `EvidenciaService`. Las pruebas se enfocan en las salidas esperadas para diferentes entradas sin considerar la implementación interna.

---

## 🎯 Especificación Funcional

### Entrada
- **Parámetro implícito:** `Config.EVIDENCIAS_RETENCION_DIAS` (default: 60)
- **Tipo:** Entero positivo (días de retención)

### Proceso
- Lista archivos en bucket de Supabase Storage
- Filtra archivos con fecha de creación (`created_at`)
- Compara fecha de creación con fecha límite: `datetime.now() - timedelta(days=dias_retencion)`
- Elimina archivos más antiguos que la fecha límite

### Salida
- **Tipo:** Entero
- **Valor:** Número de archivos eliminados (≥ 0)
- **Caso error:** Retorna `0`

---

## 🧪 Técnicas de Prueba Aplicadas

### 1. Particionamiento de Equivalencia

#### Partición 1: Archivos con fecha válida
- **Descripción:** Archivos con `created_at` en formato ISO 8601
- **Casos de prueba:**
  - **CP-001:** Archivo con fecha antigua (> 60 días)
    - **Entrada:** `created_at = now() - 70 días`
    - **Resultado esperado:** Archivo eliminado, retorna `1`
  - **CP-002:** Archivo con fecha reciente (< 60 días)
    - **Entrada:** `created_at = now() - 30 días`
    - **Resultado esperado:** Archivo no eliminado, retorna `0`

#### Partición 2: Archivos sin fecha
- **Descripción:** Archivos sin campo `created_at`
- **Casos de prueba:**
  - **CP-003:** Archivo sin `created_at`
    - **Entrada:** `{'name': 'archivo.jpg'}` (sin `created_at`)
    - **Resultado esperado:** Archivo no procesado, retorna `0`

#### Partición 3: Bucket vacío
- **Descripción:** Sin archivos en el bucket
- **Casos de prueba:**
  - **CP-004:** Bucket sin archivos
    - **Entrada:** Lista vacía `[]`
    - **Resultado esperado:** Retorna `0`

#### Partición 4: Múltiples archivos mixtos
- **Descripción:** Combinación de archivos antiguos y recientes
- **Casos de prueba:**
  - **CP-005:** 2 antiguos, 2 recientes
    - **Entrada:** Mix de fechas (70, 80, 30, 40 días)
    - **Resultado esperado:** Retorna `2`

---

### 2. Análisis de Valores Límite (BVA)

#### Límite: 60 días (valor por defecto)

| Caso | Días | Resultado Esperado | ID Test |
|------|------|-------------------|---------|
| Justo antes del límite | 59 días | No elimina | **BVA-001** |
| Exactamente el límite | 60 días | No elimina | **BVA-002** |
| Justo después del límite | 61 días | Elimina | **BVA-003** |

#### Límite: 0 y 1 día

| Caso | Días Retención | Archivo (días) | Resultado | ID Test |
|------|----------------|----------------|-----------|---------|
| Retención mínima | 0 | Cualquiera | Elimina todos | **BVA-004** |
| Retención mínima útil | 1 | 2 días | Elimina | **BVA-005** |
| Retención mínima útil | 1 | 0 días | No elimina | **BVA-006** |

---

### 3. Tablas de Decisión

#### Tabla 1: Decisiones de eliminación

| Condición | C1 | C2 | C3 | C4 | C5 |
|-----------|----|----|----|----|-----|
| ¿Tiene `created_at`? | ✅ | ✅ | ✅ | ❌ | ❌ |
| ¿Fecha válida? | ✅ | ✅ | ❌ | N/A | N/A |
| ¿Más antiguo que límite? | ✅ | ❌ | N/A | N/A | N/A |
| **ACCIÓN:** | | | | | |
| Eliminar archivo | ✅ | ❌ | ❌ | ❌ | ❌ |
| Incrementar contador | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Test ID** | **DT-001** | **DT-002** | **DT-003** | **DT-004** | **DT-005** |

---

### 4. Casos de Uso

#### Caso de Uso 1: Limpieza semanal automática
- **Descripción:** Sistema ejecuta limpieza cada 7 días
- **Escenario:**
  - 50 archivos totales
  - 20 archivos > 60 días
  - 30 archivos < 60 días
- **Resultado esperado:** Elimina 20, retorna `20`
- **Test ID:** **UC-001**

#### Caso de Uso 2: Primera ejecución en bucket nuevo
- **Descripción:** Bucket recién creado sin archivos
- **Escenario:** Lista vacía
- **Resultado esperado:** Retorna `0`
- **Test ID:** **UC-002**

#### Caso de Uso 3: Retención personalizada
- **Descripción:** Configuración con 30 días de retención
- **Escenario:**
  - `EVIDENCIAS_RETENCION_DIAS = 30`
  - Archivos de 25 y 35 días
- **Resultado esperado:** Elimina archivo de 35 días, retorna `1`
- **Test ID:** **UC-003**

---

### 5. Pruebas de Robustez

#### Robustez 1: Manejo de errores de red
- **Test ID:** **ROB-001**
- **Escenario:** `bucket.list()` genera excepción
- **Entrada:** Error de conexión
- **Resultado esperado:** Retorna `0` sin crash

#### Robustez 2: Formato de fecha inválido
- **Test ID:** **ROB-002**
- **Escenario:** `created_at = "fecha-invalida"`
- **Entrada:** Formato no ISO 8601
- **Resultado esperado:** Archivo no procesado, continúa ejecución

#### Robustez 3: Valores null/None
- **Test ID:** **ROB-003**
- **Escenario:** `created_at = None`
- **Entrada:** Valor nulo
- **Resultado esperado:** Archivo no procesado, retorna `0`

#### Robustez 4: Error al eliminar archivo
- **Test ID:** **ROB-004**
- **Escenario:** `bucket.remove()` falla para un archivo
- **Entrada:** Archivo bloqueado o en uso
- **Resultado esperado:** Excepción manejada, continúa con siguiente archivo

---

## 📊 Matriz de Trazabilidad

| Requisito | Técnica | Tests | Estado |
|-----------|---------|-------|--------|
| REQ-01: Eliminar archivos antiguos | Equivalencia | CP-001, CP-002 | ✅ |
| REQ-02: Ignorar archivos sin fecha | Equivalencia | CP-003 | ✅ |
| REQ-03: Manejar bucket vacío | Equivalencia | CP-004 | ✅ |
| REQ-04: Límite configurable | BVA | BVA-001, BVA-002, BVA-003 | ✅ |
| REQ-05: Retorno correcto | Decisión | DT-001 a DT-005 | ✅ |
| REQ-06: Manejo de errores | Robustez | ROB-001 a ROB-004 | ✅ |

---

## 🔍 Resumen de Casos de Prueba

### Total de Casos: **21 casos**

| Técnica | Cantidad | IDs |
|---------|----------|-----|
| Particionamiento de Equivalencia | 5 | CP-001 a CP-005 |
| Análisis de Valores Límite | 6 | BVA-001 a BVA-006 |
| Tablas de Decisión | 5 | DT-001 a DT-005 |
| Casos de Uso | 3 | UC-001 a UC-003 |
| Pruebas de Robustez | 4 | ROB-001 a ROB-004 |

---

## ✅ Criterios de Aceptación

1. **Funcionalidad:** Todos los casos de prueba deben pasar
2. **Cobertura:** 100% de particiones equivalentes cubiertas
3. **Límites:** Todos los valores límite verificados
4. **Errores:** Manejo robusto sin crashes
5. **Rendimiento:** Procesa 100+ archivos sin degradación

---

## 📝 Notas de Implementación

### Preparación de Datos de Prueba
```python
# Ejemplo de datos mock para pruebas
archivos_antiguos = [
    {'name': 'viejo.jpg', 'created_at': (now - timedelta(days=70)).isoformat() + 'Z'}
]

archivos_recientes = [
    {'name': 'nuevo.jpg', 'created_at': (now - timedelta(days=30)).isoformat() + 'Z'}
]

archivos_sin_fecha = [
    {'name': 'sin_fecha.jpg'}
]
```

### Configuración de Mocks
```python
@patch('services.evidencia_service.supabase_storage')
@patch('services.evidencia_service.Config')
def test_caso_prueba(self, mock_config, mock_storage):
    # Configurar días de retención
    mock_config.EVIDENCIAS_RETENCION_DIAS = 60
    
    # Configurar bucket mock
    mock_bucket = MagicMock()
    mock_bucket.list.return_value = archivos_mock
    mock_storage.storage.from_.return_value = mock_bucket
```

---

## 🎓 Conclusiones

Las pruebas de caja negra proporcionan:
- ✅ Validación completa de especificaciones funcionales
- ✅ Cobertura exhaustiva de casos límite
- ✅ Verificación de robustez ante errores
- ✅ Documentación clara de comportamiento esperado
- ✅ Base para pruebas de regresión

**Estado:** Listo para implementación por Marcelo Landa
