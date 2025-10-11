# 🔧 FIX APLICADO - Problema con ID de Usuario

## ❌ Problema Identificado

La tabla `Usuario` en Supabase tiene:
- `id` como **INTEGER autoincremental** (no UUID)
- Columna `password` que NO debería existir

## ✅ Solución Aplicada

### Cambios en `auth_routes.py`:

1. **Signup:** Ya NO intenta insertar el UUID de Auth en la columna `id`
   - Deja que la BD genere el ID automáticamente
   - Retorna tanto el `auth_id` (UUID) como el `db_id` (integer)

2. **Signin:** Busca usuarios por EMAIL en lugar de por ID
   - Usa `eq("email", user_email)` en lugar de `eq("id", user_id)`

## 🧪 Cómo Probar

### Paso 1: Reiniciar servidor backend

```powershell
# Si el servidor está corriendo, detenlo (Ctrl+C)
# Luego reinicia:
cd c:\Users\Marcelo\Documents\GitHub\FaceFind\facefind_back
python app.py
```

### Paso 2: Probar desde el frontend

En tu aplicación React, intenta registrar un usuario nuevo:
- Nombre: Juan
- Email: juan@gmail.com
- Password: Juan1234

Ahora debería funcionar ✅

---

## 🔍 Esquema Actual de la Tabla

```sql
Usuario:
  - id: INTEGER (PRIMARY KEY, AUTOINCREMENT) 
  - nombre: TEXT
  - email: TEXT
  - password: TEXT  ⚠️ Ya NO se usa (Supabase Auth lo maneja)
  - role: TEXT
  - status: TEXT
  - created_at: TIMESTAMP
  - updated_at: TIMESTAMP

auth.users (Supabase Auth):
  - id: UUID (el verdadero identificador único)
  - email: TEXT
  - encrypted_password: TEXT  ← Aquí está el hash bcrypt
  - ...
```

---

## 💡 Recomendaciones para el Futuro

### Opción 1: Mantener esquema actual (más fácil)
✅ Ya funcionando  
✅ No requiere migración  
⚠️ Tienes 2 IDs diferentes (auth_id y db_id)  
⚠️ Columna `password` sigue ahí pero no se usa

### Opción 2: Migrar a UUID (recomendado)
```sql
-- 1. Agregar columna auth_id
ALTER TABLE "Usuario" ADD COLUMN auth_id UUID;

-- 2. Eliminar columna password
ALTER TABLE "Usuario" DROP COLUMN password;

-- 3. Hacer que id sea UUID en lugar de INTEGER (requiere recrear tabla)
-- O mejor: usar auth_id como referencia principal
```

### Opción 3: Eliminar tabla Usuario y usar solo Auth
- Guardar metadata en `user_metadata` de Supabase Auth
- Más simple pero menos flexible

---

## 📝 Logs Esperados

Cuando registres un usuario ahora verás:
```
✅ Usuario registrado: juan@gmail.com con Auth ID: <uuid>, DB ID: 1
```

Cuando hagas login:
```
✅ Usuario creado en tabla Usuario: juan@gmail.com
# O si ya existe:
# Usuario encontrado: juan@gmail.com
```

---

**Estado:** ✅ FIX APLICADO - Reinicia el servidor y prueba
