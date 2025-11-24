# Pruebas de Caja Blanca - limpiar_evidencias_antiguas()

**Función:** `EvidenciaService.limpiar_evidencias_antiguas()`  
**Autor:** Marcelo Landa  
**Fecha:** Noviembre 2025

---

## 📋 Descripción

Documento de pruebas de caja blanca (White Box Testing) para la función `limpiar_evidencias_antiguas()` del servicio `EvidenciaService`. Las pruebas se enfocan en la estructura interna del código, flujo de control y cobertura de código.

---

## 📂 Código Fuente Analizado

```python
# Ubicación: services/evidencia_service.py (líneas 158-196)

@staticmethod
def limpiar_evidencias_antiguas():
    """
    Elimina evidencias (imágenes) más antiguas que EVIDENCIAS_RETENCION_DIAS
    desde Supabase Storage.
    
    Returns:
        int: Número de archivos eliminados
    """
    try:
        from config import Config                                              # [L1]
        
        # Obtener días de retención desde configuración
        dias_retencion = getattr(Config, 'EVIDENCIAS_RETENCION_DIAS', 60)     # [L2]
        
        # Calcular fecha límite
        fecha_limite = datetime.now() - timedelta(days=dias_retencion)        # [L3]
        
        # Obtener bucket
        bucket = supabase_storage.storage.from_(BUCKET_NAME)                  # [L4]
        
        # Inicializar contador
        archivos_eliminados = 0                                                # [L5]
        
        # Listar archivos
        archivos = bucket.list()                                              # [L6]
        
        # Iterar sobre archivos
        for archivo in archivos:                                              # [L7]
            created_at = archivo.get('created_at')                            # [L8]
            
            if created_at:                                                    # [D1]
                # Parsear fecha
                fecha_archivo = datetime.fromisoformat(                       # [L9]
                    created_at.replace('Z', '+00:00')
                )
                
                # Comparar con límite
                if fecha_archivo < fecha_limite:                              # [D2]
                    # Eliminar archivo
                    bucket.remove([archivo['name']])                          # [L10]
                    # Incrementar contador
                    archivos_eliminados += 1                                  # [L11]
        
        # Retornar resultado
        return archivos_eliminados                                            # [L12]
        
    except Exception as e:                                                    # [D3]
        print(f"Error limpiando evidencias: {e}")                             # [L13]
        return 0                                                               # [L14]
```

**Leyenda:**
- `[Ln]` = Línea ejecutable #n
- `[Dn]` = Decisión #n (punto de bifurcación)

---

## 🔢 Análisis de Complejidad Ciclomática

### Método McCabe

**Fórmula:** V(G) = E - N + 2P

Donde:
- **E** = Número de aristas (conexiones entre nodos)
- **N** = Número de nodos (bloques de código)
- **P** = Número de componentes conectados (típicamente 1)

### Grafo de Flujo

```
[Inicio]
   |
   v
[try] ──────────────────┐
   |                    │
   v                    │
[import Config]         │
   |                    │
   v                    │
[getattr dias]          │
   |                    │
   v                    │
[calcular fecha_limite] │
   |                    │
   v                    │
[bucket.from_]          │
   |                    │
   v                    │
[archivos_eliminados=0] │
   |                    │
   v                    │
[bucket.list()]         │
   |                    │
   v                    │
[for archivo] ◄─────┐   │
   |                │   │
   v                │   │
[D1: if created_at?]    │
   |      |         │   │
   No     Sí        │   │
   |      |         │   │
   |      v         │   │
   |  [parsear fecha]   │
   |      |         │   │
   |      v         │   │
   |  [D2: if antigua?] │
   |      |      |  │   │
   |      No     Sí │   │
   |      |      |  │   │
   |      |      v  │   │
   |      |  [remove] │ │
   |      |      |  │   │
   |      |      v  │   │
   |      |  [+=1]  │   │
   |      |      |  │   │
   └──────┴──────┴──┘   │
          |              │
          v              │
    [más archivos?]      │
          |              │
          No             │
          |              │
          v              │
   [return contador]     │
          |              │
          └──────────────┤
                         │
[except Exception] ◄─────┘
          |
          v
   [print error]
          |
          v
   [return 0]
          |
          v
       [Fin]
```

### Cálculo

- **Nodos (N):** 18
- **Aristas (E):** 22
- **Componentes (P):** 1

**V(G) = 22 - 18 + 2(1) = 6**

### Decisiones Identificadas

1. **try-except:** Manejo de excepciones
2. **for archivo in archivos:** Ciclo iterativo
3. **if created_at:** Verificación de existencia de fecha
4. **if fecha_archivo < fecha_limite:** Comparación de fechas

**Complejidad Ciclomática:** **V(G) = 5** (4 decisiones + 1)

---

## 🎯 Estrategias de Prueba

### 1. Cobertura de Sentencias (Statement Coverage)

**Objetivo:** Ejecutar cada línea de código al menos una vez.

| ID | Sentencia | Descripción | Caso de Prueba |
|----|-----------|-------------|----------------|
| **S-001** | `from config import Config` | Importar configuración | TC-S001 |
| **S-002** | `getattr(Config, ...)` | Obtener días retención | TC-S002 |
| **S-003** | `fecha_limite = ...` | Calcular fecha límite | TC-S003 |
| **S-004** | `bucket.from_(...)` | Obtener bucket | TC-S004 |
| **S-005** | `archivos_eliminados = 0` | Inicializar contador | TC-S005 |
| **S-006** | `bucket.list()` | Listar archivos | TC-S006 |
| **S-007** | `for archivo in archivos` | Inicio ciclo | TC-S007 |
| **S-008** | `created_at = archivo.get(...)` | Extraer fecha | TC-S008 |
| **S-009** | `datetime.fromisoformat(...)` | Parsear fecha | TC-S009 |
| **S-010** | `bucket.remove([...])` | Eliminar archivo | TC-S010 |
| **S-011** | `archivos_eliminados += 1` | Incrementar contador | TC-S011 |
| **S-012** | `return archivos_eliminados` | Retorno normal | TC-S012 |
| **S-013** | `print(f"Error...")` | Log de error | TC-S013 |
| **S-014** | `return 0` (en except) | Retorno error | TC-S014 |

**Meta:** 14/14 sentencias ejecutadas = **100%**

---

### 2. Cobertura de Decisiones (Decision Coverage)

**Objetivo:** Probar ambos resultados (True/False) de cada decisión.

| ID | Decisión | Rama True | Rama False | Casos |
|----|----------|-----------|------------|-------|
| **D-001** | `try-except` | Ejecución exitosa | Captura excepción | TC-D001, TC-D002 |
| **D-002** | `for archivo` | Con archivos | Sin archivos | TC-D003, TC-D004 |
| **D-003** | `if created_at` | Fecha existe | Fecha no existe | TC-D005, TC-D006 |
| **D-004** | `if fecha < limite` | Archivo antiguo | Archivo reciente | TC-D007, TC-D008 |

**Meta:** 8/8 ramas ejecutadas = **100%**

---

### 3. Cobertura de Condiciones (Condition Coverage)

**Objetivo:** Probar cada condición booleana en True y False.

| ID | Condición | Valores a Probar | Casos |
|----|-----------|------------------|-------|
| **C-001** | `created_at` | `None`, `"2024-01-01"` | TC-C001, TC-C002 |
| **C-002** | `fecha_archivo < fecha_limite` | `True`, `False` | TC-C003, TC-C004 |

---

### 4. Cobertura de Caminos (Path Coverage)

**Objetivo:** Ejecutar todos los caminos posibles del código.

#### Caminos Independientes (Basis Paths)

| ID | Descripción del Camino | Flujo | Caso |
|----|------------------------|-------|------|
| **P-001** | Bucket vacío | try → list → for(0 iter) → return | TC-P001 |
| **P-002** | Archivo sin fecha | try → list → for → if(False) → return | TC-P002 |
| **P-003** | Archivo reciente | try → list → for → if(True) → if(False) → return | TC-P003 |
| **P-004** | Archivo antiguo | try → list → for → if(True) → if(True) → remove → return | TC-P004 |
| **P-005** | Excepción | try → Exception → except → return 0 | TC-P005 |
| **P-006** | Múltiples archivos | try → list → for(N iter) → return | TC-P006 |

**Caminos Totales:** **6 caminos independientes**

---

### 5. Cobertura de Ciclos (Loop Coverage)

**Objetivo:** Probar ciclo `for archivo in archivos`

| ID | Escenario | Iteraciones | Caso |
|----|-----------|-------------|------|
| **L-001** | Sin iteraciones | 0 | TC-L001 |
| **L-002** | Una iteración | 1 | TC-L002 |
| **L-003** | Dos iteraciones | 2 | TC-L003 |
| **L-004** | Múltiples iteraciones | N | TC-L004 |
| **L-005** | Iteraciones con mix | N (diferentes ramas) | TC-L005 |

---

## 📊 Casos de Prueba Detallados

### Cobertura de Sentencias

#### TC-S001: Importar Config
```markdown
**Entrada:** Ejecución normal
**Esperado:** Config importado correctamente
**Verifica:** Línea [L1]
```

#### TC-S002: Obtener días de retención
```markdown
**Entrada:** Config.EVIDENCIAS_RETENCION_DIAS = 45
**Esperado:** dias_retencion = 45
**Verifica:** Línea [L2]
```

#### TC-S010: Eliminar archivo antiguo
```markdown
**Entrada:** Archivo de 70 días
**Esperado:** bucket.remove() llamado con ['nombre_archivo.jpg']
**Verifica:** Línea [L10]
```

#### TC-S011: Incrementar contador
```markdown
**Entrada:** 2 archivos antiguos
**Esperado:** archivos_eliminados = 2
**Verifica:** Línea [L11]
```

#### TC-S013: Manejo de excepción
```markdown
**Entrada:** bucket.list() lanza Exception
**Esperado:** print("Error limpiando evidencias: ...")
**Verifica:** Línea [L13]
```

---

### Cobertura de Decisiones

#### TC-D001: try exitoso
```markdown
**Entrada:** Bucket con archivos válidos
**Esperado:** Retorna número de archivos eliminados
**Verifica:** Rama True de try-except
```

#### TC-D002: except ejecutado
```markdown
**Entrada:** Error en bucket.list()
**Esperado:** Retorna 0
**Verifica:** Rama except
```

#### TC-D003: for con elementos
```markdown
**Entrada:** Lista con 3 archivos
**Esperado:** Itera 3 veces
**Verifica:** Rama True del ciclo
```

#### TC-D004: for sin elementos
```markdown
**Entrada:** Lista vacía []
**Esperado:** No itera
**Verifica:** Rama False del ciclo
```

#### TC-D005: created_at existe
```markdown
**Entrada:** {'name': 'a.jpg', 'created_at': '2024-01-01T00:00:00Z'}
**Esperado:** Procesa fecha
**Verifica:** if created_at = True
```

#### TC-D006: created_at no existe
```markdown
**Entrada:** {'name': 'a.jpg'}
**Esperado:** Salta procesamiento
**Verifica:** if created_at = False
```

#### TC-D007: Archivo antiguo
```markdown
**Entrada:** Fecha de 70 días atrás
**Esperado:** Elimina archivo
**Verifica:** if fecha < limite = True
```

#### TC-D008: Archivo reciente
```markdown
**Entrada:** Fecha de 30 días atrás
**Esperado:** No elimina archivo
**Verifica:** if fecha < limite = False
```

---

### Cobertura de Caminos

#### TC-P001: Bucket vacío
```markdown
**Camino:** Inicio → try → list() → for(0) → return
**Entrada:** bucket.list() = []
**Esperado:** return 0
**Flujo:** No entra al ciclo, retorna inmediatamente
```

#### TC-P002: Archivo sin created_at
```markdown
**Camino:** Inicio → try → list() → for → if(False) → for → return
**Entrada:** [{'name': 'a.jpg'}]
**Esperado:** return 0
**Flujo:** Entra al ciclo pero salta procesamiento interno
```

#### TC-P003: Archivo reciente
```markdown
**Camino:** Inicio → try → list() → for → if(True) → parse → if(False) → return
**Entrada:** [{'name': 'a.jpg', 'created_at': now() - 30 días}]
**Esperado:** return 0
**Flujo:** Procesa fecha pero no elimina
```

#### TC-P004: Archivo antiguo
```markdown
**Camino:** Inicio → try → list() → for → if(True) → parse → if(True) → remove → += → return
**Entrada:** [{'name': 'a.jpg', 'created_at': now() - 70 días}]
**Esperado:** return 1
**Flujo:** Camino completo con eliminación
```

#### TC-P005: Excepción
```markdown
**Camino:** Inicio → try → Exception → except → print → return 0
**Entrada:** bucket.list() lanza Exception
**Esperado:** return 0
**Flujo:** Manejo de error
```

#### TC-P006: Múltiples archivos mixtos
```markdown
**Camino:** Múltiples iteraciones con diferentes ramas
**Entrada:** [sin_fecha, reciente, antiguo1, antiguo2]
**Esperado:** return 2
**Flujo:** Combina diferentes ramas en cada iteración
```

---

## 🔬 Análisis de Flujo de Datos

### Variables y su Uso

| Variable | Definición | Uso | P-Uso | C-Uso |
|----------|-----------|-----|-------|-------|
| `dias_retencion` | L2 | L3 | - | L3 |
| `fecha_limite` | L3 | - | D4 | - |
| `bucket` | L4 | L6, L10 | - | L6, L10 |
| `archivos_eliminados` | L5 | L11, L12 | - | L11, L12 |
| `archivos` | L6 | - | D2 | - |
| `archivo` | L7 | L8, L10 | - | L8, L10 |
| `created_at` | L8 | - | D3 | L9 |
| `fecha_archivo` | L9 | - | D4 | - |

**Leyenda:**
- **P-Uso:** Uso en predicado (condición)
- **C-Uso:** Uso en cálculo (computación)

### Pares Def-Use

| Variable | Definición | Uso | Path |
|----------|-----------|-----|------|
| `archivos_eliminados` | L5 | L12 | Sin eliminaciones |
| `archivos_eliminados` | L11 | L12 | Con eliminaciones |
| `fecha_limite` | L3 | D4 | Comparación |
| `archivo` | L7 | L8, L10 | Procesamiento |

---

## 📈 Métricas de Cobertura

### Objetivos de Cobertura

| Métrica | Objetivo | Casos Requeridos |
|---------|----------|------------------|
| Cobertura de Sentencias | 100% | 14 |
| Cobertura de Decisiones | 100% | 8 |
| Cobertura de Condiciones | 100% | 4 |
| Cobertura de Caminos | 100% | 6 |
| Cobertura de Ciclos | 100% | 5 |

### Resumen Total

- **Total de Casos Únicos:** ~26 casos
- **Complejidad Ciclomática:** V(G) = 5
- **Casos Mínimos Requeridos:** 5 (según V(G))
- **Casos Propuestos:** 26 (cobertura exhaustiva)

---

## ✅ Matriz de Trazabilidad Código-Prueba

| Línea | Tipo | Descripción | Tests |
|-------|------|-------------|-------|
| L1 | Sentencia | import Config | S-001 |
| L2 | Sentencia | getattr dias | S-002 |
| L3 | Sentencia | calcular fecha_limite | S-003 |
| L4 | Sentencia | bucket.from_ | S-004 |
| L5 | Sentencia | contador = 0 | S-005 |
| L6 | Sentencia | bucket.list | S-006 |
| L7 | Decisión | for archivo | D-003, D-004 |
| L8 | Sentencia | get created_at | S-008 |
| D1 | Decisión | if created_at | D-005, D-006 |
| L9 | Sentencia | fromisoformat | S-009 |
| D2 | Decisión | if fecha < limite | D-007, D-008 |
| L10 | Sentencia | bucket.remove | S-010 |
| L11 | Sentencia | += 1 | S-011 |
| L12 | Sentencia | return contador | S-012 |
| D3 | Decisión | except | D-001, D-002 |
| L13 | Sentencia | print error | S-013 |
| L14 | Sentencia | return 0 | S-014 |

---

## 🎯 Priorización de Pruebas

### Alta Prioridad
1. **TC-P004** - Camino completo con eliminación (funcionalidad principal)
2. **TC-P005** - Manejo de excepciones (robustez)
3. **TC-D007** - Archivo antiguo eliminado (caso crítico)

### Media Prioridad
4. **TC-P001** - Bucket vacío (caso borde)
5. **TC-P003** - Archivo reciente no eliminado (validación)
6. **TC-P006** - Múltiples archivos mixtos (caso real)

### Baja Prioridad
7. **TC-P002** - Archivo sin fecha (caso raro)
8. Resto de casos de cobertura específica

---

## 📝 Implementación de Pruebas

### Estructura Sugerida

```python
class TestCajaBlanca_LimpiarEvidencias(unittest.TestCase):
    """Pruebas de Caja Blanca - Cobertura Completa"""
    
    # Cobertura de Sentencias (14 tests)
    def test_S001_import_config(self):
        """Verifica importación de Config"""
        pass
    
    def test_S010_eliminar_archivo(self):
        """Verifica llamada a bucket.remove()"""
        pass
    
    # Cobertura de Decisiones (8 tests)
    def test_D001_try_exitoso(self):
        """Verifica rama exitosa de try"""
        pass
    
    def test_D002_except_ejecutado(self):
        """Verifica rama except"""
        pass
    
    # Cobertura de Caminos (6 tests)
    def test_P001_bucket_vacio(self):
        """Camino: lista vacía sin iteraciones"""
        pass
    
    def test_P004_archivo_antiguo(self):
        """Camino completo: detecta y elimina archivo"""
        pass
```

### Configuración de Mocks

```python
@patch('services.evidencia_service.supabase_storage')
@patch('services.evidencia_service.Config')
def test_ejemplo(self, mock_config, mock_storage):
    # Setup
    mock_config.EVIDENCIAS_RETENCION_DIAS = 60
    mock_bucket = MagicMock()
    mock_bucket.list.return_value = [...]
    mock_storage.storage.from_.return_value = mock_bucket
    
    # Execute
    resultado = EvidenciaService.limpiar_evidencias_antiguas()
    
    # Assert
    self.assertEqual(resultado, expected_value)
    mock_bucket.remove.assert_called_with([...])
```

---

## 🎓 Conclusiones

### Características del Código Analizadas

1. **Complejidad:** V(G) = 5 (moderada)
2. **Decisiones:** 4 puntos de bifurcación
3. **Ciclos:** 1 ciclo `for` con múltiples escenarios
4. **Manejo de errores:** 1 bloque try-except global
5. **Líneas ejecutables:** 14 sentencias

### Estrategia Recomendada

Para cobertura **100%**:
- ✅ Implementar 26 casos de prueba
- ✅ Verificar todas las sentencias (14)
- ✅ Probar todas las decisiones (8 ramas)
- ✅ Cubrir todos los caminos (6)
- ✅ Validar ciclos (5 escenarios)

### Beneficios del Análisis

- 🔍 Identificación de código muerto (si existe)
- 🛡️ Garantía de robustez ante errores
- 📊 Medición objetiva de cobertura
- 🧪 Base para testing automatizado
- 📈 Mejora continua del código

**Estado:** Listo para implementación por Marcelo Landa
