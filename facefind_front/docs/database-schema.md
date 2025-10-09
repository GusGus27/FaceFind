# Schema DB FaceFind Lima - Peru

<!-- CHANGELOG - 2025-10-08 -->
<!-- [AGREGADO] Usuario.role enum (admin, moderator, user) -->
<!-- [AGREGADO] Usuario.status enum (active, inactive) -->
<!-- [AGREGADO] Caso.age int -->
<!-- [AGREGADO] Caso.gender enum -->
<!-- [AGREGADO] Caso.skinColor, hairColor, eyeColor enums -->
<!-- [AGREGADO] Caso.disappearanceTime time -->
<!-- [AGREGADO] Caso.circumstances, clothing text -->
<!-- [AGREGADO] Caso.reporterName, relationship, contactPhone, contactEmail, additionalContact -->
<!-- [AGREGADO] Caso.priority enum (urgent, high, medium, low) -->
<!-- [AGREGADO] Caso.title, description, location -->
<!-- [AGREGADO] Caso.lastSeen, lastSeenLocation -->
<!-- [AGREGADO] Caso.resolutionDate, resolutionNote -->
<!-- [MODIFICADO] Caso.status ahora es enum (activo, pendiente, resuelto) -->
<!-- [AGREGADO] Camara.type enum (USB, IP) -->
<!-- [AGREGADO] Camara.resolution, fps, url -->
<!-- [AGREGADO] LogAuditoria.type enum, ip, status -->
<!-- [NUEVA] Tabla Notificacion -->
<!-- [NUEVA] Tabla CasoActualizacion -->

```sql
// FaceFind Lima - Perú
// Sistema de detección de personas desaparecidas mediante reconocimiento facial
// Database Schema for DBDiagram.io
// Última actualización: 2025-10-08

Project FaceFind {
  database_type: 'PostgreSQL'
  Note: 'Sistema de gestión de casos de personas desaparecidas con reconocimiento facial'
}

// ============================================
// TABLAS DE CONTROL DE ACCESO
// ============================================

Table Usuario {
  id int [pk, increment]
  nombre varchar(100) [not null]
  email varchar(150) [not null, unique]
  password varchar(255) [not null]
  role varchar(20) [not null, default: 'user'] // [AGREGADO 2025-10-08] Detectado en AuthContext.jsx, UserManagement.jsx - Valores: admin, moderator, user
  status varchar(20) [not null, default: 'active'] // [AGREGADO 2025-10-08] Detectado en UserManagement.jsx - Valores: active, inactive
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Indexes {
    email
    role
    status
  }

  Note: 'Usuarios del sistema con acceso controlado por roles'
}

Table Rol {
  id int [pk, increment]
  nombre varchar(50) [not null, unique]
  descripcion text
  created_at timestamp [default: `now()`]
  
  Note: 'Roles que determinan permisos de acceso (Admin, Analista, etc.)'
}

Table Permiso {
  id int [pk, increment]
  nombre varchar(50) [not null, unique]
  descripcion text
  
  Note: 'Permisos específicos del sistema (crear_caso, editar_alerta, etc.)'
}

// Tabla intermedia Usuario-Rol (relación muchos a muchos)
Table UsuarioRol {
  usuario_id int [not null]
  rol_id int [not null]
  asignado_at timestamp [default: `now()`]
  
  Indexes {
    (usuario_id, rol_id) [pk]
  }
  
  Note: 'Relación muchos a muchos entre Usuario y Rol'
}

// Tabla intermedia Rol-Permiso (relación muchos a muchos)
Table RolPermiso {
  rol_id int [not null]
  permiso_id int [not null]
  
  Indexes {
    (rol_id, permiso_id) [pk]
  }
  
  Note: 'Relación muchos a muchos entre Rol y Permiso'
}

// ============================================
// TABLAS DE GESTIÓN DE CASOS
// ============================================

Table Caso {
  id int [pk, increment]
  usuario_id int [not null]

  // Información básica de la persona
  nombre_completo varchar(200) [not null]
  fecha_nacimiento date [not null]
  age int // [AGREGADO 2025-10-08] Detectado en FormStep1.jsx:58-74
  gender varchar(30) // [AGREGADO 2025-10-08] Detectado en FormStep1.jsx:77-97 - Valores: masculino, femenino, otro, prefiero-no-decir

  // Características físicas
  altura decimal(5,2)
  peso decimal(5,2)
  skinColor varchar(30) // [AGREGADO 2025-10-08] Detectado en FormStep2.jsx:58-78 - Valores: clara, morena, trigueña, oscura
  hairColor varchar(30) // [AGREGADO 2025-10-08] Detectado en FormStep2.jsx:80-102 - Valores: negro, castaño, rubio, rojo, canoso, teñido
  eyeColor varchar(30) // [AGREGADO 2025-10-08] Detectado en FormStep2.jsx:104-125 - Valores: negros, marrones, verdes, azules, grises
  senas_particulares text

  // Información de desaparición
  fecha_desaparicion date [not null]
  disappearanceTime time // [AGREGADO 2025-10-08] Detectado en FormStep3.jsx:40-52
  lugar_desaparicion varchar(255) [not null]
  lastSeenLocation varchar(255) // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:28,54,79,107
  lastSeen varchar(100) // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:27,53,78,106
  circumstances text // [AGREGADO 2025-10-08] Detectado en FormStep3.jsx:72-88
  clothing text // [AGREGADO 2025-10-08] Detectado en FormStep3.jsx:91-105, CaseManagement.jsx:29

  // Información del caso
  title varchar(300) // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:16,42,66,95
  description text // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:33,59,84,112
  location varchar(255) // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:20,46,71,99
  priority varchar(20) [not null, default: 'medium'] // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:18,44,67,96 - Valores: urgent, high, medium, low
  status varchar(20) [not null, default: 'pendiente'] // [MODIFICADO 2025-10-08] Cambiado a: activo, pendiente, resuelto (antes: PENDIENTE, ENCONTRADO, NO_ENCONTRADO)

  // Información del reportante
  reporterName varchar(200) // [AGREGADO 2025-10-08] Detectado en FormStep4.jsx:22-38
  relationship varchar(50) // [AGREGADO 2025-10-08] Detectado en FormStep4.jsx:40-65 - Valores: padre-madre, hijo-hija, hermano-hermana, esposo-esposa, abuelo-abuela, tio-tia, primo-prima, amigo-amiga, otro
  contactPhone varchar(20) // [AGREGADO 2025-10-08] Detectado en FormStep4.jsx:67-83
  contactEmail varchar(150) // [AGREGADO 2025-10-08] Detectado en FormStep4.jsx:85-101
  additionalContact varchar(200) // [AGREGADO 2025-10-08] Detectado en FormStep4.jsx:103-115

  // Resolución
  resolutionDate date // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:90
  resolutionNote text // [AGREGADO 2025-10-08] Detectado en CaseManagement.jsx:91

  // Campos originales
  observaciones text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Indexes {
    usuario_id
    status
    priority
    fecha_desaparicion
    nombre_completo
  }

  Note: 'Casos de personas desaparecidas con información completa del frontend'
}

// ============================================
// TABLAS DE PROCESAMIENTO DE IMÁGENES
// ============================================

Table FotoReferencia {
  id int [pk, increment]
  caso_id int [not null]
  ruta_archivo varchar(500) [not null]
  angulo varchar(20) [not null]
  metadata jsonb
  created_at timestamp [default: `now()`]
  
  Indexes {
    caso_id
    angulo
  }
  
  Note: 'Fotos de referencia del rostro. Angulo: IZQUIERDO, FRONTAL, DERECHO'
}

Table Embedding {
  id int [pk, increment]
  foto_referencia_id int [not null, unique]
  vector bytea [not null]
  dimension int [not null]
  fecha_generacion timestamp [default: `now()`]
  
  Indexes {
    foto_referencia_id
  }
  
  Note: 'Representación matemática del rostro para reconocimiento facial (relación 1:1 con FotoReferencia)'
}

// ============================================
// TABLAS DE SISTEMA DE VIGILANCIA
// ============================================

Table Camara {
  id int [pk, increment]
  ip varchar(45) [not null, unique]
  ubicacion varchar(255) [not null]
  activa boolean [not null, default: true]
  type varchar(10) // [AGREGADO 2025-10-08] Detectado en CameraManager.tsx:7 - Valores: USB, IP
  resolution varchar(20) // [AGREGADO 2025-10-08] Detectado en CameraManager.tsx:8
  fps int // [AGREGADO 2025-10-08] Detectado en CameraManager.tsx:9
  url varchar(500) // [AGREGADO 2025-10-08] Detectado en CameraManager.tsx:10 - Para cámaras IP
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  Indexes {
    ip
    activa
    ubicacion
    type
  }

  Note: 'Cámaras del sistema de vigilancia (USB e IP)'
}

Table Alerta {
  id int [pk, increment]
  caso_id int [not null]
  camara_id int [not null]
  timestamp timestamp [not null, default: `now()`]
  similitud decimal(5,4) [not null]
  imagen bytea
  estado varchar(20) [not null, default: 'PENDIENTE']
  prioridad varchar(10) [not null]
  created_at timestamp [default: `now()`]
  
  Indexes {
    caso_id
    camara_id
    timestamp
    estado
    prioridad
  }
  
  Note: 'Alertas generadas por coincidencias detectadas. Estado: PENDIENTE, REVISADA, FALSO_POSITIVO. Prioridad: ALTA, MEDIA, BAJA'
}

// ============================================
// TABLAS DE REPORTES Y AUDITORÍA
// ============================================

Table Reporte {
  id int [pk, increment]
  usuario_id int [not null]
  fecha_inicio date [not null]
  fecha_fin date [not null]
  total_alertas int [default: 0]
  casos_detectados int [default: 0]
  coincidencias_confirmadas int [default: 0]
  created_at timestamp [default: `now()`]
  
  Indexes {
    usuario_id
    fecha_inicio
    fecha_fin
  }
  
  Note: 'Reportes estadísticos del sistema'
}

// Tabla intermedia Alerta-Reporte (relación muchos a muchos)
Table AlertaReporte {
  alerta_id int [not null]
  reporte_id int [not null]
  
  Indexes {
    (alerta_id, reporte_id) [pk]
  }
  
  Note: 'Relación muchos a muchos entre Alerta y Reporte'
}

Table LogAuditoria {
  id int [pk, increment]
  usuario_id int [not null]
  alerta_id int
  type varchar(20) // [AGREGADO 2025-10-08] Detectado en ActivityLogs.jsx:15,25,35,45,54,65,75,85 - Valores: login, case, user, system, delete
  accion varchar(100) [not null]
  detalles text
  ip varchar(45) // [AGREGADO 2025-10-08] Detectado en ActivityLogs.jsx:20,30,40,50,60,70,80,90
  status varchar(20) // [AGREGADO 2025-10-08] Detectado en ActivityLogs.jsx:21,31,41,51,61,71,81,91 - Valores: success, error, warning
  timestamp timestamp [not null, default: `now()`]

  Indexes {
    usuario_id
    alerta_id
    timestamp
    accion
    type
    status
  }

  Note: 'Log de auditoría para trazabilidad de todas las acciones del sistema'
}

// ============================================
// TABLAS NUEVAS (2025-10-08)
// ============================================

Table Notificacion {
  id int [pk, increment]
  type varchar(20) [not null] // [NUEVA 2025-10-08] Detectado en NotificationPanel.jsx:13,22,32,41,49 - Valores: match, system, case, user, alert
  title varchar(200) [not null]
  message text [not null]
  severity varchar(20) [not null] // Valores: urgent, high, medium, low
  isRead boolean [default: false]
  timestamp timestamp [not null, default: `now()`]
  usuario_id int // Nullable - si es para un usuario específico o broadcast
  created_at timestamp [default: `now()`]

  Indexes {
    usuario_id
    type
    severity
    isRead
    timestamp
  }

  Note: 'Sistema de notificaciones detectado en NotificationPanel.jsx'
}

Table CasoActualizacion {
  id int [pk, increment]
  caso_id int [not null]
  date date [not null] // [NUEVA 2025-10-08] Detectado en CaseManagement.jsx:35,61,86,114
  note text [not null]
  created_at timestamp [default: `now()`]

  Indexes {
    caso_id
    date
  }

  Note: 'Historial de actualizaciones de casos detectado en CaseManagement.jsx:34-38,60-63,85-89,113-116'
}

// ============================================
// RELACIONES (FOREIGN KEYS)
// ============================================

// Relaciones Usuario-Rol-Permiso
Ref: UsuarioRol.usuario_id > Usuario.id [delete: cascade]
Ref: UsuarioRol.rol_id > Rol.id [delete: cascade]
Ref: RolPermiso.rol_id > Rol.id [delete: cascade]
Ref: RolPermiso.permiso_id > Permiso.id [delete: cascade]

// Relaciones Caso
Ref: Caso.usuario_id > Usuario.id [delete: restrict]

// Relaciones FotoReferencia-Embedding
Ref: FotoReferencia.caso_id > Caso.id [delete: cascade]
Ref: Embedding.foto_referencia_id - FotoReferencia.id [delete: cascade]

// Relaciones Alerta
Ref: Alerta.caso_id > Caso.id [delete: cascade]
Ref: Alerta.camara_id > Camara.id [delete: restrict]

// Relaciones Reporte
Ref: Reporte.usuario_id > Usuario.id [delete: restrict]
Ref: AlertaReporte.alerta_id > Alerta.id [delete: cascade]
Ref: AlertaReporte.reporte_id > Reporte.id [delete: cascade]

// Relaciones LogAuditoria
Ref: LogAuditoria.usuario_id > Usuario.id [delete: restrict]
Ref: LogAuditoria.alerta_id > Alerta.id [delete: set null]

// Relaciones Notificacion (NUEVA 2025-10-08)
Ref: Notificacion.usuario_id > Usuario.id [delete: cascade]

// Relaciones CasoActualizacion (NUEVA 2025-10-08)
Ref: CasoActualizacion.caso_id > Caso.id [delete: cascade]
```
