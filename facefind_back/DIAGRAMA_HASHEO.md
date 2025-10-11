# 🔐 CÓMO FUNCIONA EL HASHEO DE CONTRASEÑAS

## Diagrama de Flujo

### 📝 REGISTRO (SIGNUP)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /auth/signup
                              │ { email, password, nombre }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Flask - auth_routes.py)                   │
│                                                                   │
│  1. Validaciones:                                                │
│     ✓ Email obligatorio                                          │
│     ✓ Password ≥ 6 caracteres                                    │
│     ✓ Nombre ≥ 2 caracteres                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ supabase.auth.sign_up()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE AUTH SERVICE                           │
│                                                                   │
│  2. Hasheo automático:                                           │
│     password: "MiPassword123"                                    │
│         ↓                                                         │
│     salt = bcrypt.gensalt()                                      │
│         ↓                                                         │
│     hash = bcrypt.hashpw(password, salt)                         │
│         ↓                                                         │
│     "$2b$12$N9qo8uLOickgx2ZMRZoMye..."                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Guarda en auth.users
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TABLA: auth.users                             │
│                                                                   │
│  id: uuid-xxx-xxx                                                │
│  email: user@example.com                                         │
│  encrypted_password: "$2b$12$N9qo8uLOickgx2..."                 │
│  created_at: 2025-10-11                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Retorna user.id
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND - Inserta en tabla Usuario                 │
│                                                                   │
│  supabase.table("Usuario").insert({                              │
│      id: user.id,                                                │
│      nombre: "Juan",                                             │
│      email: "user@example.com",                                  │
│      role: "user"                                                │
│      ❌ SIN password aquí                                        │
│  })                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 201 Created
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                                                                   │
│  ✅ "Usuario registrado con éxito"                               │
│  → Redirige a /login                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

### 🔑 LOGIN (SIGNIN)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /auth/signin
                              │ { email, password }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND (Flask - auth_routes.py)                   │
│                                                                   │
│  1. Validaciones:                                                │
│     ✓ Email y password obligatorios                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ supabase.auth.sign_in_with_password()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE AUTH SERVICE                           │
│                                                                   │
│  2. Buscar usuario:                                              │
│     SELECT * FROM auth.users WHERE email = '...'                 │
│         ↓                                                         │
│  3. Verificar hash:                                              │
│     stored_hash = "$2b$12$N9qo8uLOickgx2..."                    │
│     user_password = "MiPassword123"                              │
│         ↓                                                         │
│     bcrypt.checkpw(user_password, stored_hash)                   │
│         ↓                                                         │
│     ┌─────────────┐           ┌─────────────┐                   │
│     │  ✅ Match   │           │  ❌ No Match │                   │
│     └─────────────┘           └─────────────┘                   │
│          │                            │                          │
│          ▼                            ▼                          │
│     Genera JWT               Error 401                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ✅ Match → retorna session
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           BACKEND - Busca datos adicionales                      │
│                                                                   │
│  usuario = supabase.table("Usuario")                             │
│      .select("*")                                                │
│      .eq("id", user.id)                                          │
│                                                                   │
│  Response: {                                                     │
│    user: { id, email, nombre, role },                            │
│    session: { access_token, refresh_token }                      │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 200 OK + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                                                                   │
│  1. Guarda en localStorage:                                      │
│     - access_token                                               │
│     - user data                                                  │
│                                                                   │
│  2. Actualiza AuthContext                                        │
│                                                                   │
│  3. ✅ Redirige a /dashboard o /casos                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Anatomía de un Hash bcrypt

```
$2b$12$N9qo8uLOickgx2ZMRZoMyeIjPfqRqgdDRJhQX7zQw5xqQ9JKUqzLq
│ │  │  │                                                       │
│ │  │  └─ Salt (22 caracteres)                                │
│ │  └─ Cost factor (12 = 2^12 iteraciones = 4096)             │
│ └─ Versión del algoritmo (2b = bcrypt)                        │
└─ Indicador de hash                                             │
                                                                  │
                                              Hash final (31 chars)─┘

Total: 60 caracteres
```

### Propiedades de Seguridad:

1. **Salt único**: Cada contraseña tiene salt diferente
   ```
   "password123" → "$2b$12$ABC..." (usuario 1)
   "password123" → "$2b$12$XYZ..." (usuario 2)
   ⚠️ Mismo password, hashes DIFERENTES
   ```

2. **Cost factor ajustable**: Más iteraciones = más seguro
   ```
   12 = 4,096 iteraciones     (estándar)
   14 = 16,384 iteraciones    (más seguro, más lento)
   ```

3. **Irreversible**: No se puede "descifrar"
   ```
   ✅ password → hash (fácil)
   ❌ hash → password (imposible)
   ```

4. **Resistente a rainbow tables**: Salt único previene ataques

---

## 📊 Comparación: Antes vs Ahora

### ❌ ANTES (INSEGURO)

```sql
-- Tabla Usuario
┌──────┬─────────────────┬─────────────┐
│ id   │ email           │ password    │
├──────┼─────────────────┼─────────────┤
│ 1    │ user@test.com   │ password123 │ ⚠️ TEXTO PLANO
│ 2    │ admin@test.com  │ admin2025   │ ⚠️ TEXTO PLANO
└──────┴─────────────────┴─────────────┘

Riesgos:
- Si hackean DB → todas las contraseñas expuestas
- SQL Injection → robo masivo
- Empleados maliciosos → acceso directo
```

### ✅ AHORA (SEGURO)

```sql
-- Tabla Usuario (sin passwords)
┌──────────────────┬─────────────────┬────────┬────────┐
│ id               │ email           │ nombre │ role   │
├──────────────────┼─────────────────┼────────┼────────┤
│ uuid-xxx         │ user@test.com   │ Juan   │ user   │
│ uuid-yyy         │ admin@test.com  │ Admin  │ admin  │
└──────────────────┴─────────────────┴────────┴────────┘

-- Tabla auth.users (Supabase - Inaccesible directamente)
┌──────────────────┬─────────────────┬───────────────────────┐
│ id               │ email           │ encrypted_password    │
├──────────────────┼─────────────────┼───────────────────────┤
│ uuid-xxx         │ user@test.com   │ $2b$12$N9qo8uLOi... │ ✅ HASH
│ uuid-yyy         │ admin@test.com  │ $2b$12$X7fK2mNpQ... │ ✅ HASH
└──────────────────┴─────────────────┴───────────────────────┘

Ventajas:
✓ Passwords hasheadas con bcrypt
✓ Salt único por usuario
✓ Tabla Usuario sin datos sensibles
✓ Auth.users protegida por Supabase
✓ Imposible recuperar contraseña original
```

---

## 🧪 Ejemplo Práctico

### Caso 1: Registro

```python
# Usuario ingresa:
email = "juan@example.com"
password = "MiSuperPassword123"

# Supabase genera:
salt = "$2b$12$randomSaltHere"
hash = bcrypt.hashpw(password + salt)

# Guarda en auth.users:
encrypted_password = "$2b$12$randomSaltHereFinalHashXYZ123ABC"

# Tu tabla Usuario:
{
  "id": "uuid-abc-123",
  "email": "juan@example.com",
  "nombre": "Juan Pérez"
  # ❌ NO password
}
```

### Caso 2: Login Correcto

```python
# Usuario ingresa:
password = "MiSuperPassword123"

# Supabase:
1. Busca hash: "$2b$12$randomSaltHereFinalHashXYZ123ABC"
2. Compara: bcrypt.checkpw(password, stored_hash)
3. Resultado: ✅ True
4. Genera: JWT token
5. Frontend recibe: { user, session }
```

### Caso 3: Login Incorrecto

```python
# Usuario ingresa:
password = "PasswordIncorrecta"

# Supabase:
1. Busca hash: "$2b$12$randomSaltHereFinalHashXYZ123ABC"
2. Compara: bcrypt.checkpw(password, stored_hash)
3. Resultado: ❌ False
4. Retorna: 401 Unauthorized
5. Frontend recibe: { "error": "Email o contraseña incorrectos" }
```

---

## 🎯 Puntos Clave

1. **Nunca guardamos la contraseña real**
2. **Supabase maneja todo el hasheo automáticamente**
3. **No necesitas importar bcrypt en tu código**
4. **Los hashes son únicos incluso para passwords iguales**
5. **Es imposible "descifrar" un hash bcrypt**

---

**Creado:** 11 de octubre, 2025  
**Actualizado por:** GitHub Copilot + Marcelo
