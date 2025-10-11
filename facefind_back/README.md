# FaceFind Backend

Sistema backend para FaceFind - Plataforma de reconocimiento facial para localización de personas desaparecidas.

## 🏗️ Estructura del Proyecto

```
facefind_back/
├── api/                          # Endpoints REST API (Blueprints)
│   ├── auth_routes.py           # Autenticación y autorización
│   ├── user_routes.py           # Gestión de usuarios
│   ├── caso_routes.py           # Gestión de casos
│   └── encodings_routes.py      # Generación de encodings faciales
│
├── services/                     # Servicios de negocio
│   ├── supabase_client.py       # Cliente de Supabase centralizado
│   ├── face_detection_service.py # Detección y reconocimiento facial
│   ├── encodings_generator.py   # Generación de encodings faciales
│   └── encodings_storage.py     # Almacenamiento de encodings en Supabase
│
├── facefind/                     # Módulo principal del sistema FaceFind
│   ├── camera/                  # Gestión de cámaras
│   │   ├── camera_interface.py
│   │   ├── camera_factory.py
│   │   ├── camera_manager.py
│   │   └── concrete_cameras.py
│   ├── generador_encodings.py
│   ├── procesador_facefind.py
│   └── sistema_facefind.py
│
├── db/                           # Base de datos
│   ├── db_schema.sql            # Schema de la base de datos
│   └── database-schema.md       # Documentación del schema
│
├── scripts/                      # Scripts de utilidad y pruebas
│   ├── test_auth.py
│   ├── test_connection.py
│   ├── check_usuarios.py
│   ├── diagnose_supabase.py
│   ├── sync_user.py
│   ├── sync_encodings.py
│   └── README.md
│
├── app.py                        # Aplicación Flask principal ⭐
├── config.py                     # Configuración centralizada
├── requirements.txt              # Dependencias Python
├── ENV_TEMPLATE.txt              # Template de variables de entorno
└── README.md                     # Este archivo
```

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Activar entorno de Anaconda
conda activate facefind

# Instalar dependencias
cd facefind_back
pip install -r requirements.txt
```

### 2. Configuración

Crea un archivo `.env` en la raíz del proyecto (usa `ENV_TEMPLATE.txt` como referencia):

```env
# Flask
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
SECRET_KEY=tu-clave-secreta

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Reconocimiento Facial
ENCODINGS_FILE=encodings.pickle
FACE_TOLERANCE=0.6

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Ejecutar el Servidor

```bash
# Asegúrate de estar en el entorno correcto
conda activate facefind

# Ejecutar desde facefind_back/
python app.py
```

El servidor estará disponible en `http://localhost:5000`

## 📡 API Endpoints

### 🔐 Autenticación (`/auth`)
- `POST /auth/signup` - Registrar nuevo usuario
- `POST /auth/signin` - Iniciar sesión
- `POST /auth/signout` - Cerrar sesión

### 👥 Usuarios (`/users`)
- `GET /users` - Listar usuarios
- `GET /users/<id>` - Obtener usuario específico
- `PUT /users/<id>` - Actualizar usuario
- `DELETE /users/<id>` - Eliminar usuario

### 📁 Casos (`/casos`)
- `GET /casos` - Listar casos
- `POST /casos` - Crear nuevo caso
- `GET /casos/<id>` - Obtener caso específico
- `PUT /casos/<id>` - Actualizar caso
- `DELETE /casos/<id>` - Eliminar caso

### 🎯 Encodings (`/encodings`)
- `POST /encodings` - Generar encodings desde imágenes

### 🔍 Detección Facial
- `GET /health` - Estado del servicio
- `POST /detect-faces` - Detectar rostros en imagen
- `GET /get-known-faces` - Lista de caras conocidas

## 🛠️ Servicios Principales

### Face Detection Service
Servicio de detección y reconocimiento facial en tiempo real.

```python
from services.face_detection_service import FaceDetectionService

service = FaceDetectionService(encodings_path="encodings.pickle", tolerance=0.6)
results = service.process_frame(frame)
```

### Supabase Client
Cliente centralizado para interactuar con Supabase.

```python
from services.supabase_client import supabase

result = supabase.table("Usuario").select("*").execute()
```

### Encodings Storage
Gestión de encodings faciales en Supabase Storage.

```python
from services.encodings_storage import upload_encodings_to_cloud

result = upload_encodings_to_cloud()
```

## 🧪 Scripts de Utilidad

Ver [scripts/README.md](scripts/README.md) para más detalles.

```bash
# Activar entorno
conda activate facefind

# Desde facefind_back/, ejecutar scripts:
python scripts/test_connection.py        # Probar conexión
python scripts/sync_encodings.py upload  # Sincronizar encodings
python scripts/check_usuarios.py         # Verificar usuarios
```

## 📦 Dependencias Principales

- **Flask** - Framework web
- **face_recognition** - Reconocimiento facial
- **opencv-python** - Procesamiento de imágenes
- **supabase** - Cliente de Supabase
- **python-dotenv** - Variables de entorno

## 🔧 Configuración Avanzada

### Tolerancia de Reconocimiento Facial

El parámetro `FACE_TOLERANCE` controla qué tan estricto es el reconocimiento:
- **0.4** - Muy estricto (menos coincidencias)
- **0.6** - Balanceado (recomendado)
- **0.8** - Permisivo (más coincidencias)

### CORS

Configura los orígenes permitidos en `CORS_ORIGINS`:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://mi-dominio.com
```

## 🐛 Debugging

### Verificar configuración
```bash
python scripts/diagnose_supabase.py
```

### Ver logs del servidor
El servidor muestra logs detallados en la consola cuando `FLASK_DEBUG=True`

## 📝 Notas

- Los encodings faciales se almacenan en `encodings.pickle` localmente
- Se recomienda sincronizar los encodings con Supabase Storage usando `scripts/sync_encodings.py`
- Para producción, asegúrate de cambiar `FLASK_DEBUG=False` y usar una `SECRET_KEY` segura

## 🤝 Contribuir

1. Mantén la estructura de carpetas organizada
2. Documenta las nuevas funciones
3. Actualiza los tests cuando hagas cambios
4. Usa los scripts de utilidad para verificar que todo funciona

## 📄 Licencia

Proyecto académico - Universidad Nacional Mayor de San Marcos

