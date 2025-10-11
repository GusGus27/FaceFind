# 🔐 MEJORAS DE SEGURIDAD - FaceFind Backend

## ✅ Cambios Implementados

### 1. **HASHEO DE CONTRASEÑAS**

#### ❌ Problema Anterior:
```python
# ⚠️ PELIGROSO: Guardaba contraseña en texto plano
supabase.table("Usuario").insert({
    "nombre": nombre,
    "email": email,
    "password": password,  # ⚠️ TEXTO PLANO EN BASE DE DATOS
}).execute()
```

#### ✅ Solución Implementada:
- **Supabase Auth hashea automáticamente** las contraseñas usando bcrypt
- **Eliminamos** el campo `password` de la tabla `Usuario`
- Las contraseñas se guardan **hasheadas** en la tabla `auth.users` de Supabase
- **NO es necesario** hashear manualmente porque Supabase lo hace internamente

---

### 2. **REGISTRO (SIGNUP)**

#### Mejoras:
```python
# ✅ Validaciones agregadas
- Email y contraseña requeridos
- Nombre mínimo 2 caracteres
- Contraseña mínimo 6 caracteres

# ✅ Sin guardar password en tabla Usuario
supabase.table("Usuario").insert({
    "id": result.user.id,  # UUID de Supabase Auth
    "nombre": nombre,
    "email": email,
    "role": "user",
    "status": "active"
    # ❌ Ya NO guardamos password aquí
}).execute()

# ✅ Password guardada HASHEADA en auth.users por Supabase
```

---

### 3. **LOGIN (SIGNIN)**

#### Mejoras:
```python
# ✅ Supabase verifica el hash automáticamente
res = supabase.auth.sign_in_with_password({
    "email": email,
    "password": password
})
# Internamente Supabase compara:
# bcrypt.checkpw(password.encode('utf-8'), stored_hash)

# ✅ Mensajes de error mejorados
- "Email o contraseña incorrectos" (genérico por seguridad)
- No revela si el email existe o no

# ✅ Auto-creación de usuario en tabla Usuario si falta
# (para usuarios antiguos que se registraron antes del cambio)
```

---

### 4. **RESPUESTAS MEJORADAS**

#### Antes:
```json
{
  "user": {...},
  "session": {...}
}
```

#### Ahora:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "nombre": "Juan Pérez",
    "role": "user",
    "app_metadata": {
      "role": "user"
    }
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600,
    "expires_at": 1728691234
  },
  "message": "Inicio de sesión exitoso"
}
```

---

## 🔧 Dependencias Actualizadas

### `requirements.txt`:
```txt
flask
fastapi 
uvicorn 
supabase      # ← Maneja hasheo automático
python-dotenv
bcrypt        # ← Agregado (backup/uso futuro)
```

---

## 🗄️ Cambios en la Base de Datos

### Tabla `Usuario` - Nuevo Schema Recomendado:

```sql
-- ❌ ELIMINAR columna password (ya no se usa)
ALTER TABLE "Usuario" DROP COLUMN IF EXISTS "password";

-- ✅ Columnas actuales:
CREATE TABLE "Usuario" (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Nota:** Las contraseñas hasheadas están en `auth.users` (tabla interna de Supabase)

---

## 🔒 Cómo Funciona el Hasheo

### 1. **Registro (sign_up):**
```
Usuario envía: password = "MiPassword123"
           ↓
Supabase Auth hashea usando bcrypt:
  - Genera salt aleatorio
  - Hash = bcrypt.hashpw(password + salt)
  - Resultado: "$2b$12$ABC...XYZ" (60 caracteres)
           ↓
Guarda en auth.users:
  encrypted_password = "$2b$12$ABC...XYZ"
```

### 2. **Login (sign_in):**
```
Usuario envía: password = "MiPassword123"
           ↓
Supabase Auth:
  1. Busca user por email en auth.users
  2. Obtiene hash almacenado: "$2b$12$ABC...XYZ"
  3. Compara: bcrypt.checkpw(password, hash_almacenado)
  4. Si coincide → genera access_token
  5. Si no → error 401
```

---

## ✅ Checklist de Seguridad

- [x] Contraseñas hasheadas con bcrypt (via Supabase)
- [x] No guardar passwords en tabla Usuario
- [x] Validaciones de entrada en signup
- [x] Mensajes de error genéricos en login
- [x] Tokens JWT en sesión
- [ ] Rate limiting (TODO)
- [ ] Refresh token rotation (TODO)
- [ ] 2FA (TODO - próxima fase)

---

## 🚨 IMPORTANTE

### ⚠️ Para usuarios existentes:
Si ya tenías usuarios con password en texto plano:

```python
# Script de migración (ejecutar UNA VEZ):
# 1. Obtener usuarios de tabla Usuario con password
# 2. Para cada uno:
#    - Crear en Supabase Auth con supabase.auth.admin.create_user()
#    - Eliminar columna password de Usuario
```

### ⚠️ Para desarrollo:
```bash
# Limpiar tabla Usuario de passwords en texto plano:
DELETE FROM "Usuario" WHERE password IS NOT NULL;
# O directamente eliminar la columna:
ALTER TABLE "Usuario" DROP COLUMN password;
```

---

## 🔄 Próximos Pasos de Seguridad

1. **Variables de entorno en frontend** (siguiente)
2. **Persistencia de sesión**
3. **Rate limiting** en endpoints de auth
4. **CORS** configurado correctamente
5. **HTTPS** en producción
6. **Validación de tokens** en cada request

---

## 📚 Referencias

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [bcrypt Documentation](https://github.com/pyca/bcrypt/)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**Fecha de implementación:** 11 de octubre, 2025  
**Implementado por:** GitHub Copilot + Marcelo
