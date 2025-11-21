# Scripts de Utilidad

Este directorio contiene scripts de prueba, diagnóstico y sincronización para FaceFind.

## 📁 Contenido

### Scripts de Prueba y Diagnóstico

- **`test_auth.py`** - Pruebas del sistema de autenticación
  ```bash
  python scripts/test_auth.py
  ```

- **`test_connection.py`** - Verificar conexión con Supabase
  ```bash
  python scripts/test_connection.py
  ```

- **`check_usuarios.py`** - Verificar usuarios en la tabla Usuario
  ```bash
  python scripts/check_usuarios.py
  ```

- **`diagnose_supabase.py`** - Diagnóstico completo de Supabase Storage
  ```bash
  python scripts/diagnose_supabase.py
  ```

- **`diagnose_storage.py`** - Diagnóstico específico de Storage y permisos
  ```bash
  python scripts/diagnose_storage.py
  ```

### Scripts de Sincronización

- **`sync_user.py`** - Sincronizar usuario de Auth a tabla Usuario
  ```bash
  python scripts/sync_user.py
  ```

- **`sync_encodings.py`** - Sincronizar encodings faciales con Supabase Storage
  ```bash
  # Subir encodings locales a la nube (desde facefind_back/)
  python scripts/sync_encodings.py upload
  
  # Descargar encodings de la nube
  python scripts/sync_encodings.py download
  
  # Ver estado de encodings (local y remoto)
  python scripts/sync_encodings.py status
  ```
  **Nota:** El script busca `encodings.pickle` en la raíz de `facefind_back/`

### Scripts de Administración

- **`prueba.py`** - Script para convertir usuario en administrador
  ```bash
  python scripts/prueba.py
  # Luego hacer POST a /make_admin/<user_id>
  ```

## 🚀 Ejecución

**Importante:** Todos los scripts deben ejecutarse desde el directorio raíz del proyecto:

```bash
# Activar entorno de Anaconda
conda activate facefind

# Ejecutar scripts desde facefind_back/
cd facefind_back
python scripts/nombre_del_script.py
```

## 📝 Notas

- Asegúrate de tener el archivo `.env` configurado antes de ejecutar cualquier script
- Los scripts automáticamente agregan el directorio padre al path para importar módulos correctamente

