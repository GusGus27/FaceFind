-- FaceFind Database Schema
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Usuario (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'user'::character varying,
  status character varying NOT NULL DEFAULT 'active'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  dni character varying UNIQUE,
  CONSTRAINT Usuario_pkey PRIMARY KEY (id)
);

CREATE TABLE public.PersonaDesaparecida (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_completo character varying NOT NULL,
  fecha_nacimiento date,
  gender character varying,
  altura numeric,
  peso numeric,
  skinColor character varying,
  hairColor character varying,
  eyeColor character varying,
  senas_particulares text,
  age integer,
  clothing text,
  CONSTRAINT PersonaDesaparecida_pkey PRIMARY KEY (id)
);

CREATE TABLE public.Caso (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id integer NOT NULL,
  persona_id integer,
  fecha_desaparicion date NOT NULL,
  disappearanceTime time without time zone,
  lugar_desaparicion character varying NOT NULL,
  lastSeenLocation character varying,
  lastSeen character varying,
  circumstances text,
  description text,
  location character varying,
  priority character varying NOT NULL DEFAULT 'medium'::character varying,
  status character varying NOT NULL DEFAULT 'pendiente'::character varying,
  reporterName character varying,
  relationship character varying,
  contactPhone character varying,
  contactEmail character varying,
  additionalContact character varying,
  resolutionDate date,
  resolutionNote text,
  observaciones text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Caso_pkey PRIMARY KEY (id),
  CONSTRAINT Caso_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.Usuario(id),
  CONSTRAINT Caso_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.PersonaDesaparecida(id)
);

CREATE TABLE public.CasoActualizacion (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  caso_id integer NOT NULL,
  date date NOT NULL,
  note text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT CasoActualizacion_pkey PRIMARY KEY (id),
  CONSTRAINT CasoActualizacion_caso_id_fkey FOREIGN KEY (caso_id) REFERENCES public.Caso(id)
);

CREATE TABLE public.Rol (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Rol_pkey PRIMARY KEY (id)
);

CREATE TABLE public.Permiso (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  CONSTRAINT Permiso_pkey PRIMARY KEY (id)
);

CREATE TABLE public.UsuarioRol (
  usuario_id integer NOT NULL,
  rol_id integer NOT NULL,
  asignado_at timestamp without time zone DEFAULT now(),
  CONSTRAINT UsuarioRol_pkey PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT UsuarioRol_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.Usuario(id),
  CONSTRAINT UsuarioRol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.Rol(id)
);

CREATE TABLE public.RolPermiso (
  rol_id integer NOT NULL,
  permiso_id integer NOT NULL,
  CONSTRAINT RolPermiso_pkey PRIMARY KEY (permiso_id, rol_id),
  CONSTRAINT RolPermiso_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.Rol(id),
  CONSTRAINT RolPermiso_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.Permiso(id)
);

CREATE TABLE public.FotoReferencia (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  caso_id integer NOT NULL,
  ruta_archivo character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT FotoReferencia_pkey PRIMARY KEY (id),
  CONSTRAINT FotoReferencia_caso_id_fkey FOREIGN KEY (caso_id) REFERENCES public.Caso(id)
);

CREATE TABLE public.Embedding (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  foto_referencia_id integer NOT NULL UNIQUE,
  vector bytea NOT NULL,
  fecha_generacion timestamp without time zone DEFAULT now(),
  caso_id integer,
  CONSTRAINT Embedding_pkey PRIMARY KEY (id),
  CONSTRAINT embedding_foto_fk FOREIGN KEY (foto_referencia_id) REFERENCES public.FotoReferencia(id),
  CONSTRAINT embedding_caso_fk FOREIGN KEY (caso_id) REFERENCES public.Caso(id)
);

CREATE TABLE public.Camara (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  ip character varying NOT NULL UNIQUE,
  ubicacion character varying NOT NULL,
  activa boolean NOT NULL DEFAULT true,
  type character varying CHECK (type::text = ANY (ARRAY['IP'::character varying, 'USB'::character varying]::text[])),
  resolution character varying,
  fps integer,
  url character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Camara_pkey PRIMARY KEY (id)
);

CREATE TABLE public.Alerta (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  caso_id integer NOT NULL,
  camara_id integer NOT NULL,
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  similitud numeric NOT NULL,
  imagen bytea,
  estado character varying NOT NULL DEFAULT 'PENDIENTE'::character varying,
  prioridad character varying NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Alerta_pkey PRIMARY KEY (id),
  CONSTRAINT Alerta_caso_id_fkey FOREIGN KEY (caso_id) REFERENCES public.Caso(id),
  CONSTRAINT alerta_camara_fk FOREIGN KEY (camara_id) REFERENCES public.Camara(id)
);

CREATE TABLE public.Reporte (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id integer NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  total_alertas integer DEFAULT 0,
  casos_detectados integer DEFAULT 0,
  coincidencias_confirmadas integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Reporte_pkey PRIMARY KEY (id),
  CONSTRAINT Reporte_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.Usuario(id)
);

CREATE TABLE public.AlertaReporte (
  alerta_id integer NOT NULL,
  reporte_id integer NOT NULL,
  CONSTRAINT AlertaReporte_pkey PRIMARY KEY (alerta_id, reporte_id),
  CONSTRAINT AlertaReporte_alerta_id_fkey FOREIGN KEY (alerta_id) REFERENCES public.Alerta(id),
  CONSTRAINT AlertaReporte_reporte_id_fkey FOREIGN KEY (reporte_id) REFERENCES public.Reporte(id)
);

CREATE TABLE public.LogAuditoria (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id integer NOT NULL,
  alerta_id integer,
  type character varying,
  accion character varying NOT NULL,
  detalles text,
  ip character varying,
  status character varying,
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT LogAuditoria_pkey PRIMARY KEY (id),
  CONSTRAINT LogAuditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.Usuario(id),
  CONSTRAINT LogAuditoria_alerta_id_fkey FOREIGN KEY (alerta_id) REFERENCES public.Alerta(id)
);

CREATE TABLE public.Notificacion (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  severity character varying NOT NULL,
  isRead boolean DEFAULT false,
  timestamp timestamp without time zone NOT NULL DEFAULT now(),
  usuario_id integer,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Notificacion_pkey PRIMARY KEY (id),
  CONSTRAINT Notificacion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.Usuario(id)
);

-- Indexes for performance
CREATE INDEX idx_usuario_email ON public.Usuario(email);
CREATE INDEX idx_usuario_dni ON public.Usuario(dni);
CREATE INDEX idx_caso_usuario_id ON public.Caso(usuario_id);
CREATE INDEX idx_caso_persona_id ON public.Caso(persona_id);
CREATE INDEX idx_caso_status ON public.Caso(status);
CREATE INDEX idx_alerta_caso_id ON public.Alerta(caso_id);
CREATE INDEX idx_foto_referencia_caso_id ON public.FotoReferencia(caso_id);
  "message" text NOT NULL,
  "severity" varchar(20) NOT NULL,
  "isRead" boolean DEFAULT false,
  "timestamp" timestamp NOT NULL DEFAULT (now()),
  "usuario_id" int,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "CasoActualizacion" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "caso_id" int NOT NULL,
  "date" date NOT NULL,
  "note" text NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE INDEX ON "Usuario" ("email");

CREATE INDEX ON "Usuario" ("role");

CREATE INDEX ON "Usuario" ("status");

CREATE INDEX ON "Usuario" ("dni");

CREATE INDEX ON "Caso" ("usuario_id");

CREATE INDEX ON "Caso" ("status");

CREATE INDEX ON "Caso" ("priority");

CREATE INDEX ON "Caso" ("fecha_desaparicion");

CREATE INDEX ON "Caso" ("nombre_completo");

CREATE INDEX ON "FotoReferencia" ("caso_id");

CREATE INDEX ON "FotoReferencia" ("angulo");

CREATE INDEX ON "Embedding" ("foto_referencia_id");

CREATE INDEX ON "Camara" ("ip");

CREATE INDEX ON "Camara" ("activa");

CREATE INDEX ON "Camara" ("ubicacion");

CREATE INDEX ON "Camara" ("type");

CREATE INDEX ON "Alerta" ("caso_id");

CREATE INDEX ON "Alerta" ("camara_id");

CREATE INDEX ON "Alerta" ("timestamp");

CREATE INDEX ON "Alerta" ("estado");

CREATE INDEX ON "Alerta" ("prioridad");

CREATE INDEX ON "Reporte" ("usuario_id");

CREATE INDEX ON "Reporte" ("fecha_inicio");

CREATE INDEX ON "Reporte" ("fecha_fin");

CREATE INDEX ON "LogAuditoria" ("usuario_id");

CREATE INDEX ON "LogAuditoria" ("alerta_id");

CREATE INDEX ON "LogAuditoria" ("timestamp");

CREATE INDEX ON "LogAuditoria" ("accion");

CREATE INDEX ON "LogAuditoria" ("type");

CREATE INDEX ON "LogAuditoria" ("status");

CREATE INDEX ON "Notificacion" ("usuario_id");

CREATE INDEX ON "Notificacion" ("type");

CREATE INDEX ON "Notificacion" ("severity");

CREATE INDEX ON "Notificacion" ("isRead");

CREATE INDEX ON "Notificacion" ("timestamp");

CREATE INDEX ON "CasoActualizacion" ("caso_id");

CREATE INDEX ON "CasoActualizacion" ("date");

COMMENT ON TABLE "Usuario" IS 'Usuarios del sistema con acceso controlado por roles';

COMMENT ON TABLE "Rol" IS 'Roles que determinan permisos de acceso (Admin, Analista, etc.)';

COMMENT ON TABLE "Permiso" IS 'Permisos específicos del sistema (crear_caso, editar_alerta, etc.)';

COMMENT ON TABLE "UsuarioRol" IS 'Relación muchos a muchos entre Usuario y Rol';

COMMENT ON TABLE "RolPermiso" IS 'Relación muchos a muchos entre Rol y Permiso';

COMMENT ON TABLE "Caso" IS 'Casos de personas desaparecidas con información completa del frontend';

COMMENT ON TABLE "FotoReferencia" IS 'Fotos de referencia del rostro. Angulo: IZQUIERDO, FRONTAL, DERECHO';

COMMENT ON TABLE "Embedding" IS 'Representación matemática del rostro para reconocimiento facial (relación 1:1 con FotoReferencia)';

COMMENT ON TABLE "Camara" IS 'Cámaras del sistema de vigilancia (USB e IP)';

COMMENT ON TABLE "Alerta" IS 'Alertas generadas por coincidencias detectadas. Estado: PENDIENTE, REVISADA, FALSO_POSITIVO. Prioridad: ALTA, MEDIA, BAJA';

COMMENT ON TABLE "Reporte" IS 'Reportes estadísticos del sistema';

COMMENT ON TABLE "AlertaReporte" IS 'Relación muchos a muchos entre Alerta y Reporte';

COMMENT ON TABLE "LogAuditoria" IS 'Log de auditoría para trazabilidad de todas las acciones del sistema';

COMMENT ON TABLE "Notificacion" IS 'Sistema de notificaciones detectado en NotificationPanel.jsx';

COMMENT ON TABLE "CasoActualizacion" IS 'Historial de actualizaciones de casos detectado en CaseManagement.jsx:34-38,60-63,85-89,113-116';

ALTER TABLE "UsuarioRol" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE CASCADE;

ALTER TABLE "UsuarioRol" ADD FOREIGN KEY ("rol_id") REFERENCES "Rol" ("id") ON DELETE CASCADE;

ALTER TABLE "RolPermiso" ADD FOREIGN KEY ("rol_id") REFERENCES "Rol" ("id") ON DELETE CASCADE;

ALTER TABLE "RolPermiso" ADD FOREIGN KEY ("permiso_id") REFERENCES "Permiso" ("id") ON DELETE CASCADE;

ALTER TABLE "Caso" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT;

ALTER TABLE "FotoReferencia" ADD FOREIGN KEY ("caso_id") REFERENCES "Caso" ("id") ON DELETE CASCADE;

ALTER TABLE "FotoReferencia" ADD FOREIGN KEY ("id") REFERENCES "Embedding" ("foto_referencia_id") ON DELETE CASCADE;

ALTER TABLE "Alerta" ADD FOREIGN KEY ("caso_id") REFERENCES "Caso" ("id") ON DELETE CASCADE;

ALTER TABLE "Alerta" ADD FOREIGN KEY ("camara_id") REFERENCES "Camara" ("id") ON DELETE RESTRICT;

ALTER TABLE "Reporte" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT;

ALTER TABLE "AlertaReporte" ADD FOREIGN KEY ("alerta_id") REFERENCES "Alerta" ("id") ON DELETE CASCADE;

ALTER TABLE "AlertaReporte" ADD FOREIGN KEY ("reporte_id") REFERENCES "Reporte" ("id") ON DELETE CASCADE;

ALTER TABLE "LogAuditoria" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE RESTRICT;

ALTER TABLE "LogAuditoria" ADD FOREIGN KEY ("alerta_id") REFERENCES "Alerta" ("id") ON DELETE SET NULL;

ALTER TABLE "Notificacion" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuario" ("id") ON DELETE CASCADE;

ALTER TABLE "CasoActualizacion" ADD FOREIGN KEY ("caso_id") REFERENCES "Caso" ("id") ON DELETE CASCADE;
