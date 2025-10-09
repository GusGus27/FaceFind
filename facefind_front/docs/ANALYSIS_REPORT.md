# Análisis Frontend FaceFind - 2025-10-08

## 📊 RESUMEN
- Componentes analizados: 32
- Campos faltantes en BD: 28
- Nuevas tablas necesarias: 2
- Inconsistencias detectadas: 6
- Enums a definir: 11

---

## 🔍 DETALLE POR ENTIDAD

### 👤 Usuario
**Frontend muestra:**
- ✅ nombre (string) - OK en BD
- ✅ email (string) - OK en BD
- ✅ password (string) - OK en BD
- ❌ **role** (enum) - FALTA en BD
  - Valores: 'admin', 'moderator', 'user'
  - **Archivos:** AuthContext.jsx:18-31, UserManagement.jsx:12-16
- ❌ **status** (enum) - FALTA en BD
  - Valores: 'active', 'inactive'
  - **Archivos:** UserManagement.jsx:12-16
- ❌ **registeredDate** (date) - FALTA en BD (distinto a created_at)
  - **Archivos:** UserManagement.jsx:12

**Nota:** El frontend usa un campo 'name' mientras la BD tiene 'nombre'. Debe unificarse.

---

### 📁 Caso (Persona Desaparecida)

**Frontend muestra campos existentes:**
- ✅ nombre_completo → **fullName** (frontend)
- ✅ fecha_nacimiento → **birthDate** (frontend)
- ✅ fecha_desaparicion → **disappearanceDate** (frontend)
- ✅ lugar_desaparicion → **lastKnownLocation** (frontend)
- ✅ peso → **weight** (frontend)
- ✅ altura → **height** (frontend)
- ✅ senas_particulares → **distinctiveMarks** (frontend)

**Campos FALTANTES en BD:**

1. ❌ **age** (int) - Edad aproximada
   - **Archivos:** CaseRegistration.jsx:20, FormStep1.jsx:58-74

2. ❌ **gender** (varchar/enum)
   - Valores: 'masculino', 'femenino', 'otro', 'prefiero-no-decir'
   - **Archivos:** FormStep1.jsx:77-97, CaseManagement.jsx:24

3. ❌ **skinColor** (varchar/enum)
   - Valores: 'clara', 'morena', 'trigueña', 'oscura'
   - **Archivos:** FormStep2.jsx:58-78

4. ❌ **hairColor** (varchar/enum)
   - Valores: 'negro', 'castaño', 'rubio', 'rojo', 'canoso', 'teñido'
   - **Archivos:** FormStep2.jsx:80-102

5. ❌ **eyeColor** (varchar/enum)
   - Valores: 'negros', 'marrones', 'verdes', 'azules', 'grises'
   - **Archivos:** FormStep2.jsx:104-125

6. ❌ **disappearanceTime** (time) - Hora aproximada de desaparición
   - **Archivos:** FormStep3.jsx:40-52

7. ❌ **circumstances** (text) - Circunstancias de la desaparición
   - **Archivos:** FormStep3.jsx:72-88

8. ❌ **clothing** (text) - Vestimenta al momento de desaparecer
   - **Archivos:** FormStep3.jsx:91-105, CaseManagement.jsx:29

9. ❌ **reporterName** (varchar) - Nombre del reportante
   - **Archivos:** FormStep4.jsx:22-38

10. ❌ **relationship** (varchar/enum) - Relación con la persona
    - Valores: 'padre-madre', 'hijo-hija', 'hermano-hermana', 'esposo-esposa', 'abuelo-abuela', 'tio-tia', 'primo-prima', 'amigo-amiga', 'otro'
    - **Archivos:** FormStep4.jsx:40-65

11. ❌ **contactPhone** (varchar) - Teléfono del reportante
    - **Archivos:** FormStep4.jsx:67-83

12. ❌ **contactEmail** (varchar) - Email del reportante
    - **Archivos:** FormStep4.jsx:85-101

13. ❌ **additionalContact** (varchar) - Contacto alternativo
    - **Archivos:** FormStep4.jsx:103-115

14. ❌ **priority** (enum) - Prioridad del caso
    - Valores: 'urgent', 'high', 'medium', 'low'
    - **Archivos:** CaseManagement.jsx:18,44,67,96

15. ❌ **reporter** (varchar) - Nombre del reportante (duplicado con reporterName)
    - **Archivos:** CaseManagement.jsx:21,47,72,100

16. ❌ **title** (varchar) - Título descriptivo del caso
    - **Archivos:** CaseManagement.jsx:16,42,66,95, UserCasesView.jsx:17-21

17. ❌ **description** (text) - Descripción general del caso
    - **Archivos:** CaseManagement.jsx:33,59,84,112, UserCasesView.jsx:17-21

18. ❌ **lastSeen** (varchar/datetime) - Última vez visto con fecha y hora
    - **Archivos:** CaseManagement.jsx:27,53,78,106

19. ❌ **lastSeenLocation** (varchar) - Última ubicación vista
    - **Archivos:** CaseManagement.jsx:28,54,79,107

20. ❌ **resolutionDate** (date) - Fecha de resolución del caso
    - **Archivos:** CaseManagement.jsx:90

21. ❌ **resolutionNote** (text) - Nota de resolución
    - **Archivos:** CaseManagement.jsx:91

22. ❌ **location** (varchar) - Ubicación general del caso
    - **Archivos:** CaseManagement.jsx:20,46,71,99

**Inconsistencias:**
- ⚠️ **status**: Frontend usa 'activo', 'pendiente', 'resuelto' | BD usa 'PENDIENTE', 'ENCONTRADO', 'NO_ENCONTRADO'
  - **Archivos:** CaseManagement.jsx:17,43,68,96, UserCasesView.jsx:17-21

---

### 📷 FotoReferencia

**Frontend muestra:**
- ✅ caso_id - OK
- ✅ ruta_archivo - OK
- ❌ **angulo** - El frontend usa nombres diferentes
  - BD usa: 'IZQUIERDO', 'FRONTAL', 'DERECHO'
  - Frontend usa: 'frontal', 'profile1', 'profile2'
  - **Archivos:** FormStep5.jsx:46-50, CaseRegistration.jsx:225-233

**Campos del formulario de fotos:**
- ✅ frontal → FRONTAL
- ❌ profile1 → ¿IZQUIERDO o DERECHO?
- ❌ profile2 → ¿DERECHO o IZQUIERDO?

**Validaciones frontend:**
- Tipo: image/jpeg, image/jpg, image/png
- Tamaño máximo: 5MB
- Resolución mínima: 300x300px
- **Archivos:** FormStep5.jsx:11-51

---

### 📹 Camara

**Frontend muestra:**
- ✅ ip - OK
- ✅ ubicacion - OK
- ✅ activa - OK
- ❌ **type** (enum) - FALTA en BD
  - Valores: 'USB', 'IP'
  - **Archivos:** CameraManager.tsx:6-11
- ❌ **resolution** (varchar) - FALTA en BD
  - **Archivos:** CameraManager.tsx:8
- ❌ **fps** (int) - FALTA en BD
  - **Archivos:** CameraManager.tsx:9
- ❌ **url** (varchar) - FALTA en BD (para cámaras IP)
  - **Archivos:** CameraManager.tsx:10

---

### 🔔 Alerta

**Frontend muestra campos existentes:**
- ✅ caso_id - OK
- ✅ camara_id - OK
- ✅ timestamp - OK
- ✅ similitud - OK
- ✅ estado - OK
- ✅ prioridad - OK

**Sin campos adicionales detectados en frontend actual.**

---

### 📊 LogAuditoria (ActivityLogs)

**Frontend muestra:**
- ✅ usuario_id - OK
- ✅ timestamp - OK
- ✅ accion - OK
- ✅ detalles - OK
- ❌ **type** (enum) - FALTA en BD
  - Valores: 'login', 'case', 'user', 'system', 'delete'
  - **Archivos:** ActivityLogs.jsx:15,25,35,45,54,65,75,85
- ❌ **ip** (varchar) - FALTA en BD
  - **Archivos:** ActivityLogs.jsx:20,30,40,50,60,70,80,90
- ❌ **status** (enum) - FALTA en BD
  - Valores: 'success', 'error', 'warning'
  - **Archivos:** ActivityLogs.jsx:21,31,41,51,61,71,81,91

**Nota:** La tabla actual tiene 'alerta_id' pero el frontend no lo usa en logs.

---

## 🆕 NUEVAS TABLAS SUGERIDAS

### 📬 Notificaciones
**Justificación:** Componente NotificationPanel.jsx maneja sistema completo de notificaciones

**Campos propuestos:**
```sql
Table Notificacion {
  id int [pk, increment]
  type varchar(20) [not null]  // 'match', 'system', 'case', 'user', 'alert'
  title varchar(200) [not null]
  message text [not null]
  severity varchar(20) [not null]  // 'urgent', 'high', 'medium', 'low'
  isRead boolean [default: false]
  timestamp timestamp [default: `now()`]
  usuario_id int  // Nullable - si es para un usuario específico
  created_at timestamp [default: `now()`]
}
```

**Archivos:** NotificationPanel.jsx:10-56

---

### 📝 CaseUpdate (Actualizaciones de Caso)
**Justificación:** CaseManagement.jsx muestra historial de actualizaciones por caso

**Campos propuestos:**
```sql
Table CasoActualizacion {
  id int [pk, increment]
  caso_id int [not null]
  date date [not null]
  note text [not null]
  created_at timestamp [default: `now()`]
}
```

**Archivos:** CaseManagement.jsx:34-38,60-63,85-89,113-116

---

## ⚠️ INCONSISTENCIAS DETECTADAS

### 1. Campo "status" en Caso
- **BD actual:** varchar(20) con valores 'PENDIENTE', 'ENCONTRADO', 'NO_ENCONTRADO'
- **Frontend usa:** 'activo', 'pendiente', 'resuelto'
- **Solución:** Unificar nomenclatura o crear mapeo

### 2. Campo "nombre" en Usuario
- **BD actual:** campo 'nombre' (varchar 100)
- **Frontend usa:** campo 'name' (RegisterForm.jsx:6)
- **Solución:** Cambiar a 'name' o ajustar frontend

### 3. Ángulos de fotos
- **BD actual:** 'IZQUIERDO', 'FRONTAL', 'DERECHO'
- **Frontend usa:** 'frontal', 'profile1', 'profile2'
- **Solución:** Definir mapeo claro o cambiar enums

### 4. Relación Usuario-Caso
- **BD actual:** Caso.usuario_id (el que reporta)
- **Frontend:** No queda claro si usuario_id es quien registró o el sistema asigna
- **Archivos:** CaseRegistration.jsx no muestra asignación de usuario_id

### 5. Datos del reportante en Caso
- **Frontend:** Campos separados (reporterName, contactPhone, contactEmail)
- **BD actual:** No existen estos campos
- **Solución:** Agregar campos de contacto del reportante directamente en tabla Caso

### 6. Prioridad y Estado no están en BD
- **Frontend:** Maneja priority y status extensivamente
- **BD actual:** Solo tiene status básico
- **Solución:** Agregar campo priority y expandir status

---

## 📋 ENUMS A DEFINIR

1. **Usuario.role:** 'admin', 'moderator', 'user'
2. **Usuario.status:** 'active', 'inactive'
3. **Caso.gender:** 'masculino', 'femenino', 'otro', 'prefiero-no-decir'
4. **Caso.skinColor:** 'clara', 'morena', 'trigueña', 'oscura'
5. **Caso.hairColor:** 'negro', 'castaño', 'rubio', 'rojo', 'canoso', 'teñido'
6. **Caso.eyeColor:** 'negros', 'marrones', 'verdes', 'azules', 'grises'
7. **Caso.relationship:** 'padre-madre', 'hijo-hija', 'hermano-hermana', 'esposo-esposa', 'abuelo-abuela', 'tio-tia', 'primo-prima', 'amigo-amiga', 'otro'
8. **Caso.priority:** 'urgent', 'high', 'medium', 'low'
9. **Caso.status:** 'activo', 'pendiente', 'resuelto' (redefinir)
10. **Camara.type:** 'USB', 'IP'
11. **Notificacion.type:** 'match', 'system', 'case', 'user', 'alert'

---

## 📌 RECOMENDACIONES PRIORITARIAS

### Alta Prioridad (Bloquean funcionalidad):
1. ✅ Agregar campos de contacto del reportante a tabla Caso
2. ✅ Agregar campo 'priority' a tabla Caso
3. ✅ Redefinir enum 'status' en tabla Caso
4. ✅ Crear tabla Notificacion
5. ✅ Agregar campos físicos (gender, skinColor, hairColor, eyeColor) a tabla Caso

### Media Prioridad (Mejoran funcionalidad):
1. ✅ Crear tabla CasoActualizacion para historial
2. ✅ Agregar campos de cámara (type, resolution, fps, url)
3. ✅ Agregar campos adicionales de desaparición (time, circumstances, clothing)
4. ✅ Expandir LogAuditoria con type, ip, status

### Baja Prioridad (Optimizaciones):
1. ✅ Unificar nomenclatura campo 'nombre'/'name' en Usuario
2. ✅ Clarificar mapeo de ángulos de fotos
3. ✅ Agregar validaciones de tamaño/tipo de imagen en BD

---

## 🎯 PRÓXIMOS PASOS

1. Revisar y aprobar cambios propuestos
2. Actualizar database-schema.md con nuevos campos y tablas
3. Crear migraciones SQL para base de datos existente
4. Actualizar modelos del backend
5. Sincronizar validaciones frontend-backend
6. Documentar enums y sus valores permitidos

---

**Fecha de análisis:** 2025-10-08
**Analizado por:** Claude Code
**Versión del frontend:** React + Vite (facefind_front)
