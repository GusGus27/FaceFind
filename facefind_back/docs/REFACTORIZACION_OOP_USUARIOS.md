# Refactorización OOP - Sistema de Usuarios FaceFind

## 📊 Arquitectura Implementada

### Patrón en Capas (Layered Architecture)

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer (Flask)                    │
│              user_routes.py (Controllers)               │
├─────────────────────────────────────────────────────────┤
│                   Service Layer (OOP)                   │
│           user_service.py (Business Logic)              │
│  - Usa instancias de UsuarioBase/subclases             │
│  - Implementa lógica de negocio                         │
├─────────────────────────────────────────────────────────┤
│                  Repository Layer                        │
│    user_repository.py (Data Access)                     │
│  - CRUD operations con Supabase                         │
│  - Desacoplado de la lógica de negocio                  │
├─────────────────────────────────────────────────────────┤
│                   Model Layer (OOP)                      │
│              usuario.py (Domain Models)                  │
│  - UsuarioBase (abstract)                               │
│  - UsuarioRegistrado                                     │
│  - UsuarioAdministrador                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
                   [Supabase DB]
```

---

## 🏗️ Componentes Principales

### 1. **Models (usuario.py)** - Capa de Dominio

#### Jerarquía de Clases (según UML):
```python
UsuarioBase (ABC)
├── UsuarioRegistrado
│   ├── atributos: celular
│   └── métodos: crearCaso(), actualizarCaso(), verCasos()
└── UsuarioAdministrador
    └── métodos: validarCoincidencia(), suspenderCuenta(), activarCuenta()
```

**Responsabilidades:**
- ✅ Encapsulación de atributos (properties con getters/setters)
- ✅ Métodos abstractos (registrar())
- ✅ Lógica de negocio relacionada con el usuario
- ✅ Factory method (from_dict())
- ✅ Serialización (to_dict())

---

### 2. **Repository (user_repository.py)** - Capa de Datos

```python
class UserRepository:
    @staticmethod
    def find_all(filters) → List[Dict]
    @staticmethod
    def find_by_id(user_id) → Optional[Dict]
    @staticmethod
    def find_by_email(email) → Optional[Dict]
    @staticmethod
    def find_by_dni(dni) → Optional[Dict]
    @staticmethod
    def save(user_data) → Dict
    @staticmethod
    def update(user_id, updates) → Dict
    @staticmethod
    def delete(user_id) → bool
    @staticmethod
    def count_cases_by_user(user_id) → int
```

**Responsabilidades:**
- ✅ Todas las operaciones CRUD con la base de datos
- ✅ Queries y filtros de Supabase
- ✅ Manejo de errores de persistencia
- ❌ NO contiene lógica de negocio
- ❌ NO valida reglas de negocio

---

### 3. **Service (user_service.py)** - Capa de Lógica de Negocio

#### Métodos OOP (trabajan con instancias):
```python
class UserService:
    # Métodos que retornan objetos OOP
    @staticmethod
    def crear_usuario(data) → UsuarioBase
    @staticmethod
    def obtener_usuario(id) → Optional[UsuarioBase]
    @staticmethod
    def actualizar_usuario(id, updates) → UsuarioBase
    @staticmethod
    def activar_usuario_por_admin(admin, id) → UsuarioBase
    @staticmethod
    def suspender_usuario_por_admin(admin, id) → UsuarioBase
```

#### Métodos de Compatibilidad (para la API):
```python
    # Métodos que retornan Dict (wrapper para API REST)
    @staticmethod
    def get_all_users(filters) → List[Dict]
    @staticmethod
    def create_user(data) → Dict  # Llama a crear_usuario() internamente
    @staticmethod
    def update_user(id, updates) → Dict  # Llama a actualizar_usuario()
```

**Responsabilidades:**
- ✅ Validaciones de negocio (email/DNI únicos)
- ✅ Orquestación de operaciones
- ✅ Uso de instancias OOP (UsuarioBase y subclases)
- ✅ Llamadas al Repository para persistencia
- ✅ Transformación entre OOP y Dict para API

---

### 4. **Controllers (user_routes.py)** - Capa de API

```python
@user_bp.route("/", methods=["POST"])
def create_user():
    # 1. Validar request
    # 2. Llamar a UserService
    # 3. Retornar JSON response

@user_bp.route("/<int:user_id>/activate", methods=["PUT"])
def activate_user(user_id):
    # 1. Obtener admin (TODO: desde JWT)
    # 2. UserService.activar_usuario_por_admin(admin, user_id)
    # 3. Retornar response
```

**Responsabilidades:**
- ✅ Manejo de HTTP requests/responses
- ✅ Validación de parámetros de entrada
- ✅ Serialización JSON
- ✅ Códigos de estado HTTP
- ❌ NO contiene lógica de negocio

---

## 🎯 Flujo de una Operación OOP

### Ejemplo: Crear Usuario

```
1. POST /users
   ↓
2. user_routes.create_user()
   ↓
3. UserService.create_user(data)  [Wrapper]
   ↓
4. UserService.crear_usuario(data)  [OOP]
   ├── Valida email único
   ├── Valida DNI único
   ├── Crea instancia: UsuarioRegistrado o UsuarioAdministrador
   ├── Llama a usuario.registrar()
   └── UserRepository.save(dict)
       ↓
5. Supabase INSERT
   ↓
6. Retorna Dict
   ↓
7. Convierte a UsuarioBase.from_dict()
   ↓
8. Retorna instancia OOP
   ↓
9. Convierte a Dict con .to_dict()
   ↓
10. JSON Response
```

---

## ✅ Beneficios de la Arquitectura OOP

### 1. **Separación de Responsabilidades**
- Cada capa tiene un propósito claro
- Fácil de entender y mantener

### 2. **Desacoplamiento**
- Service no conoce Supabase directamente
- Repository puede cambiar de BD sin afectar Service

### 3. **Reusabilidad**
- Los métodos OOP pueden usarse desde cualquier parte
- Los modelos encapsulan su propia lógica

### 4. **Testabilidad**
- Fácil hacer mocks del Repository
- Service puede probarse sin BD real

### 5. **Extensibilidad**
- Agregar nuevo tipo de usuario: nueva subclase
- Agregar nueva operación: nuevo método en Service

---

## 🔄 Comparación: Antes vs Después

### ❌ ANTES (Mal - No OOP)
```python
# user_service.py
def create_user(data):
    # Llamada directa a supabase
    response = supabase.table("Usuario").insert(data).execute()
    return response.data[0]  # Solo Dict, sin OOP
```

### ✅ DESPUÉS (Bien - OOP)
```python
# user_service.py
def crear_usuario(data) → UsuarioBase:
    # 1. Validaciones
    # 2. Crear instancia OOP según rol
    usuario = UsuarioRegistrado(...) o UsuarioAdministrador(...)
    # 3. Usar método de la clase
    user_dict = usuario.registrar()
    # 4. Persistencia via Repository
    saved = UserRepository.save(user_dict)
    # 5. Retornar instancia OOP
    return UsuarioBase.from_dict(saved)
```

---

## 📚 Patrones de Diseño Utilizados

1. **Repository Pattern** 
   - Abstrae acceso a datos
   
2. **Factory Pattern**
   - `UsuarioBase.from_dict()` decide qué subclase crear

3. **Strategy Pattern**
   - Diferentes comportamientos según tipo de usuario

4. **Template Method**
   - `registrar()` es abstracto, implementado por subclases

5. **Service Layer Pattern**
   - Encapsula lógica de negocio

---

## 🚀 Próximas Mejoras

### 1. **Autenticación con JWT**
```python
# Obtener usuario actual desde token
current_user_id = get_user_id_from_jwt(request.headers['Authorization'])
current_user = UserService.obtener_usuario(current_user_id)

# Verificar que sea admin
if isinstance(current_user, UsuarioAdministrador):
    current_user.suspenderCuenta(user_id)
```

### 2. **Decoradores para Permisos**
```python
@require_admin
@user_bp.route("/<int:user_id>/activate", methods=["PUT"])
def activate_user(user_id, current_user):
    current_user.activarCuenta(user_id)
```

### 3. **Unit Testing**
```python
def test_crear_usuario():
    # Mock del Repository
    with patch('UserRepository.save') as mock_save:
        mock_save.return_value = {"id": 1, ...}
        usuario = UserService.crear_usuario(data)
        assert isinstance(usuario, UsuarioRegistrado)
```

---

## 📝 Notas Importantes

1. **Dos tipos de métodos en Service**:
   - `crear_usuario()` → Retorna `UsuarioBase` (OOP puro)
   - `create_user()` → Retorna `Dict` (wrapper para API)

2. **Repository solo retorna Dict**:
   - No conoce las clases OOP
   - Service convierte Dict → OOP

3. **Factory Method en UsuarioBase**:
   - `from_dict()` decide automáticamente qué subclase crear
   - Basado en el campo `role`

4. **Métodos OOP en las clases**:
   - `UsuarioAdministrador.suspenderCuenta()`
   - `UsuarioAdministrador.activarCuenta()`
   - `UsuarioRegistrado.crearCaso()`

---

## 🎓 Conclusión

La refactorización ha transformado el código de un estilo **procedural** a un diseño completamente **orientado a objetos** siguiendo:

- ✅ Principios SOLID
- ✅ Patrones de diseño (Repository, Factory, Service)
- ✅ Separación de capas
- ✅ Alta cohesión, bajo acoplamiento
- ✅ Código mantenible y extensible

El sistema ahora sigue fielmente el **diagrama UML** con herencia, polimorfismo y encapsulación adecuados.
