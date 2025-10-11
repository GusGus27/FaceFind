# 🧪 GUÍA DE PRUEBAS - Sistema de Autenticación

## 📋 Pre-requisitos

### 1. Verificar instalación de dependencias

```powershell
cd c:\Users\Marcelo\Documents\GitHub\FaceFind\facefind_back
pip list | Select-String "flask|supabase|bcrypt|requests"
```

Deberías ver:
```
bcrypt           5.0.0
Flask            3.0.3
flask-cors       6.0.1
requests         2.32.3
supabase         2.22.0
```

### 2. Verificar variables de entorno

```powershell
cat .env
```

Debe contener:
```
SUPABASE_URL=https://zpswgbrbntaipsrkqhbv.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🚀 PASO 1: Iniciar el Servidor

### Terminal 1 - Servidor Backend

```powershell
cd c:\Users\Marcelo\Documents\GitHub\FaceFind\facefind_back
python app.py
```

**Salida esperada:**
```
==================================================
🚀 Iniciando FaceFind API Server
==================================================

📍 Endpoints disponibles:

🔐 Autenticación:
   POST /auth/signup    - Registrar nuevo usuario
   POST /auth/signin    - Iniciar sesión
   POST /auth/signout   - Cerrar sesión

🎯 Detección de rostros:
   GET  /health         - Estado del servicio
   POST /detect-faces   - Detectar rostros en imagen
   GET  /get-known-faces - Lista de caras conocidas

==================================================
✅ Servidor corriendo en http://localhost:5000
==================================================

 * Serving Flask app 'app'
 * Debug mode: on
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.X.X:5000
```

⚠️ **Si hay errores:**
- Verifica que .env existe y tiene las variables correctas
- Asegúrate de que el puerto 5000 no esté en uso
- Revisa que todas las dependencias estén instaladas

---

## 🧪 PASO 2: Ejecutar Tests Automáticos

### Terminal 2 - Tests

```powershell
cd c:\Users\Marcelo\Documents\GitHub\FaceFind\facefind_back
python test_auth.py
```

**Salida esperada:**
```
==================================================
🔐 PRUEBAS DE AUTENTICACIÓN CON HASHEO
==================================================

⚠️  NOTA: Asegúrate de que el servidor esté corriendo en http://localhost:5000
    Ejecuta: python app.py o flask run

Presiona ENTER para comenzar las pruebas...

🔵 TEST 1: Registro de nuevo usuario
--------------------------------------------------
Status: 201
Response: {
  "message": "Usuario registrado con éxito",
  "data": {
    "id": "uuid-xxx-xxx",
    "email": "test_usuario@facefind.com",
    "nombre": "Usuario Test"
  }
}
✅ Registro exitoso - Contraseña hasheada por Supabase

🔵 TEST 2: Inicio de sesión
--------------------------------------------------
Status: 200
✅ Login exitoso - Hash verificado correctamente
Usuario: Usuario Test
Email: test_usuario@facefind.com
Role: user
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...

🔵 TEST 3: Login con contraseña incorrecta
--------------------------------------------------
Status: 401
Response: {
  "error": "Email o contraseña incorrectos"
}
✅ Rechazo correcto - Hash no coincide

🔵 TEST 4: Validaciones de registro
--------------------------------------------------

  Sub-test 4.1: contraseña debe tener al menos 6 caracteres
  ✅ Validación funcionando: La contraseña debe tener al menos 6 caracteres

  Sub-test 4.2: nombre debe tener al menos 2 caracteres
  ✅ Validación funcionando: El nombre debe tener al menos 2 caracteres

  Sub-test 4.3: Email y contraseña son requeridos
  ✅ Validación funcionando: Email y contraseña son requeridos

==================================================
🎯 PRUEBAS COMPLETADAS
==================================================

✅ Si todo funcionó correctamente:
   - Las contraseñas se guardan hasheadas en auth.users
   - NO se guardan en la tabla Usuario
   - bcrypt verifica los hashes al hacer login
   - Las validaciones funcionan correctamente
```

---

## 🔍 PASO 3: Pruebas Manuales con Postman/Thunder Client

### 3.1 Test de Health Check

```http
GET http://localhost:5000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "known_faces": 0,
  "service": "Face Detection API"
}
```

### 3.2 Test de Registro (Signup)

```http
POST http://localhost:5000/auth/signup
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@test.com",
  "password": "password123"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado con éxito",
  "data": {
    "id": "uuid-abc-123",
    "email": "juan@test.com",
    "nombre": "Juan Pérez"
  }
}
```

### 3.3 Test de Login (Signin)

```http
POST http://localhost:5000/auth/signin
Content-Type: application/json

{
  "email": "juan@test.com",
  "password": "password123"
}
```

**Respuesta esperada (200):**
```json
{
  "user": {
    "id": "uuid-abc-123",
    "email": "juan@test.com",
    "nombre": "Juan Pérez",
    "role": "user",
    "app_metadata": {
      "role": "user"
    }
  },
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "xxx-yyy-zzz",
    "expires_in": 3600,
    "expires_at": 1728691234
  },
  "message": "Inicio de sesión exitoso"
}
```

### 3.4 Test de Login con Password Incorrecta

```http
POST http://localhost:5000/auth/signin
Content-Type: application/json

{
  "email": "juan@test.com",
  "password": "wrongpassword"
}
```

**Respuesta esperada (401):**
```json
{
  "error": "Email o contraseña incorrectos"
}
```

### 3.5 Test de Validaciones

**Contraseña muy corta:**
```http
POST http://localhost:5000/auth/signup
Content-Type: application/json

{
  "nombre": "Test",
  "email": "test@test.com",
  "password": "123"
}
```

**Respuesta (400):**
```json
{
  "error": "La contraseña debe tener al menos 6 caracteres"
}
```

---

## 🔎 PASO 4: Verificar en la Base de Datos

### 4.1 Ver usuarios en Supabase Dashboard

1. Ir a: https://supabase.com/dashboard
2. Seleccionar proyecto: zpswgbrbntaipsrkqhbv
3. Authentication → Users

**Deberías ver:**
```
Email: test_usuario@facefind.com
Created: 2025-10-11
```

### 4.2 Ver tabla Usuario

1. Table Editor → Usuario

**Deberías ver:**
```
id                  | nombre        | email                      | role
--------------------|---------------|----------------------------|------
uuid-abc-123        | Usuario Test  | test_usuario@facefind.com | user
```

⚠️ **NOTA:** NO hay columna `password` (es correcto)

### 4.3 Ver hash de contraseña (opcional)

En SQL Editor:
```sql
SELECT 
  id, 
  email, 
  encrypted_password,
  created_at
FROM auth.users
WHERE email = 'test_usuario@facefind.com';
```

**Resultado:**
```
id              | email                      | encrypted_password          | created_at
----------------|----------------------------|-----------------------------|-----------
uuid-abc-123    | test_usuario@facefind.com | $2b$12$N9qo8uLOickgx2...     | 2025-10-11
```

✅ El hash empieza con `$2b$12$` = bcrypt con cost factor 12

---

## 📊 PASO 5: Verificar Logs del Servidor

En la Terminal 1 (donde corre el servidor), deberías ver:

```
📸 Procesando imagen de XXXX caracteres
✅ Registro exitoso para: test_usuario@facefind.com
✅ Login exitoso para: test_usuario@facefind.com
❌ Login fallido para: test_usuario@facefind.com (contraseña incorrecta)
```

---

## ✅ Checklist de Verificación

Marca cada ítem cuando lo hayas verificado:

- [ ] Servidor inicia sin errores
- [ ] Endpoint /health responde OK
- [ ] Test automático de signup pasa (201)
- [ ] Test automático de signin pasa (200)
- [ ] Test automático de password incorrecta falla correctamente (401)
- [ ] Test de validaciones funciona (400)
- [ ] Usuario aparece en Supabase Auth
- [ ] Usuario aparece en tabla Usuario SIN campo password
- [ ] Hash en auth.users empieza con $2b$12$
- [ ] Logs del servidor muestran actividad correcta

---

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'flask'"
```powershell
pip install flask flask-cors
```

### Error: "supabase.auth.sign_up() failed"
- Verifica que .env tenga SUPABASE_URL y SUPABASE_KEY correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error: "Port 5000 is already in use"
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :5000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID> /F

# O cambiar el puerto en app.py:
app.run(host='0.0.0.0', port=5001, debug=True)
```

### Error: "Connection refused"
- Verifica que el servidor esté corriendo
- Asegúrate de usar http://localhost:5000 (no https)

### Passwords no se verifican correctamente
- Limpia la tabla Usuario: `DELETE FROM "Usuario";`
- Registra usuarios nuevamente con el código actualizado

---

## 🎉 Si Todo Funciona

**¡Felicidades!** Has implementado exitosamente:

✅ Sistema de autenticación con hasheo bcrypt  
✅ Passwords nunca guardadas en texto plano  
✅ Validaciones de entrada  
✅ Mensajes de error seguros  
✅ API REST funcional  

---

## 📚 Siguientes Pasos

1. **Variables de entorno en frontend**
   - Crear `.env` en facefind_front
   - Configurar VITE_API_URL

2. **Persistencia de sesión**
   - Guardar tokens en localStorage
   - Auto-login al recargar página

3. **Integrar con frontend React**
   - Actualizar authService.js
   - Probar flujo completo de registro/login

---

**Creado:** 11 de octubre, 2025  
**Última actualización:** Hoy  
**Estado:** ✅ Listo para probar
