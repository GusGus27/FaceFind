"""
Jerarquía de clases Usuario según diagrama UML
Implementa herencia con UsuarioBase como clase abstracta
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, List
from datetime import datetime
from .enums import Rol


class UsuarioBase(ABC):
    """
    Clase abstracta base para todos los usuarios del sistema
    Según diagrama UML: UsuarioBase <<abstract>>
    """

    def __init__(self,
                 nombre: str,
                 email: str,
                 password: str,
                 rol: Rol,
                 id: Optional[int] = None,
                 status: str = "active",
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None,
                 dni: Optional[str] = None):
        """
        Constructor de UsuarioBase

        Args:
            nombre: Nombre del usuario
            email: Email del usuario
            password: Contraseña (hasheada)
            rol: Rol del usuario (enum)
            id: ID en base de datos
            status: Estado del usuario (active/inactive)
            created_at: Fecha de creación
            updated_at: Fecha de última actualización
            dni: DNI del usuario (opcional)
        """
        self._id = id
        self._nombre = nombre
        self._email = email
        self._password = password
        self._rol = rol
        self._status = status
        self._created_at = created_at or datetime.now()
        self._updated_at = updated_at or datetime.now()
        self._dni = dni

    # Getters
    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def nombre(self) -> str:
        return self._nombre

    @property
    def email(self) -> str:
        return self._email

    @property
    def password(self) -> str:
        return self._password

    @property
    def rol(self) -> Rol:
        return self._rol

    @property
    def status(self) -> str:
        return self._status

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    @property
    def dni(self) -> Optional[str]:
        return self._dni

    # Setters
    @nombre.setter
    def nombre(self, value: str):
        self._nombre = value
        self._updated_at = datetime.now()

    @email.setter
    def email(self, value: str):
        self._email = value
        self._updated_at = datetime.now()

    @status.setter
    def status(self, value: str):
        self._status = value
        self._updated_at = datetime.now()

    @dni.setter
    def dni(self, value: Optional[str]):
        self._dni = value
        self._updated_at = datetime.now()

    @abstractmethod
    def registrar(self) -> Dict:
        """
        Registra el usuario en el sistema
        Método abstracto que debe ser implementado por subclases
        """
        pass

    def login(self, password: str) -> bool:
        """
        Valida las credenciales de login

        Args:
            password: Contraseña a validar

        Returns:
            True si las credenciales son válidas
        """
        # La validación real se hace en Supabase Auth
        # Este método es un wrapper para la lógica de negocio
        return True

    def logout(self) -> bool:
        """
        Cierra la sesión del usuario

        Returns:
            True si el logout fue exitoso
        """
        # La lógica de logout se maneja en Supabase Auth
        return True

    def to_dict(self) -> Dict:
        """
        Convierte el usuario a diccionario para BD o API

        Returns:
            Diccionario con los datos del usuario
        """
        return {
            "id": self._id,
            "nombre": self._nombre,
            "email": self._email,
            "password": self._password,
            "role": self._rol.to_string(),
            "status": self._status,
            "created_at": self._created_at.isoformat() if isinstance(self._created_at, datetime) else self._created_at,
            "updated_at": self._updated_at.isoformat() if isinstance(self._updated_at, datetime) else self._updated_at,
            "dni": self._dni
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'UsuarioBase':
        """
        Crea una instancia desde un diccionario de BD
        Factory method que determina la subclase correcta según el rol

        Args:
            data: Diccionario con datos del usuario

        Returns:
            Instancia de UsuarioRegistrado o UsuarioAdministrador
        """
        rol_str = data.get("role", "user")
        rol = Rol.from_string(rol_str)

        # Determinar qué subclase instanciar
        if rol == Rol.ADMINISTRADOR:
            return UsuarioAdministrador(
                nombre=data["nombre"],
                email=data["email"],
                password=data.get("password", "NO_SE_USA"),
                rol=rol,
                id=data.get("id"),
                status=data.get("status", "active"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
                dni=data.get("dni")
            )
        else:
            return UsuarioRegistrado(
                nombre=data["nombre"],
                email=data["email"],
                password=data.get("password", "NO_SE_USA"),
                rol=rol,
                celular=data.get("celular"),
                id=data.get("id"),
                status=data.get("status", "active"),
                created_at=data.get("created_at"),
                updated_at=data.get("updated_at"),
                dni=data.get("dni")
            )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self._id}, email='{self._email}', rol={self._rol.value})>"


class UsuarioRegistrado(UsuarioBase):
    """
    Usuario registrado regular del sistema
    Puede crear y gestionar casos de personas desaparecidas
    """

    def __init__(self,
                 nombre: str,
                 email: str,
                 password: str,
                 rol: Rol,
                 celular: Optional[str] = None,
                 **kwargs):
        """
        Constructor de UsuarioRegistrado

        Args:
            nombre: Nombre del usuario
            email: Email del usuario
            password: Contraseña
            rol: Rol del usuario
            celular: Número de celular (atributo adicional según UML)
            **kwargs: Argumentos adicionales para UsuarioBase
        """
        super().__init__(nombre, email, password, rol, **kwargs)
        self._celular = celular

    @property
    def celular(self) -> Optional[str]:
        return self._celular

    @celular.setter
    def celular(self, value: Optional[str]):
        self._celular = value
        self._updated_at = datetime.now()

    def registrar(self) -> Dict:
        """
        Registra un usuario regular en el sistema

        Returns:
            Diccionario con el resultado del registro
        """
        data = self.to_dict()
        if self._celular:
            data["celular"] = self._celular
        return data

    def crearCaso(self, caso_data: Dict) -> Dict:
        """
        Crea un nuevo caso de persona desaparecida

        Args:
            caso_data: Datos del caso a crear

        Returns:
            Datos del caso creado
        """
        # La lógica de creación se delega al servicio correspondiente
        # Este método es parte de la interfaz de negocio
        from services.supabase_client import supabase

        caso_data["usuario_id"] = self._id
        return caso_data

    def actualizarCaso(self, caso_id: int, updates: Dict) -> Dict:
        """
        Actualiza un caso existente

        Args:
            caso_id: ID del caso a actualizar
            updates: Datos a actualizar

        Returns:
            Caso actualizado
        """
        # Validar que el caso pertenezca al usuario
        updates["updated_at"] = datetime.now().isoformat()
        return updates

    def verCasos(self) -> List[Dict]:
        """
        Obtiene todos los casos del usuario

        Returns:
            Lista de casos
        """
        # La lógica de consulta se delega al servicio
        from services.supabase_client import supabase

        response = supabase.table("Caso").select("*").eq("usuario_id", self._id).execute()
        return response.data if response.data else []

    def to_dict(self) -> Dict:
        """Extiende to_dict para incluir celular"""
        data = super().to_dict()
        if self._celular:
            data["celular"] = self._celular
        return data


class UsuarioAdministrador(UsuarioBase):
    """
    Usuario administrador del sistema
    Tiene permisos especiales para validar coincidencias, gestionar alertas y usuarios
    """

    def __init__(self,
                 nombre: str,
                 email: str,
                 password: str,
                 rol: Rol,
                 **kwargs):
        """
        Constructor de UsuarioAdministrador

        Args:
            nombre: Nombre del administrador
            email: Email del administrador
            password: Contraseña
            rol: Rol (debe ser ADMINISTRADOR)
            **kwargs: Argumentos adicionales para UsuarioBase
        """
        super().__init__(nombre, email, password, rol, **kwargs)

    def registrar(self) -> Dict:
        """
        Registra un administrador en el sistema

        Returns:
            Diccionario con el resultado del registro
        """
        return self.to_dict()

    def validarCoincidencia(self, caso_id: int, alerta_id: int, es_valida: bool) -> bool:
        """
        Valida si una coincidencia detectada es correcta

        Args:
            caso_id: ID del caso
            alerta_id: ID de la alerta
            es_valida: Si la coincidencia es válida o falso positivo

        Returns:
            True si la validación fue exitosa
        """
        from services.supabase_client import supabase

        nuevo_estado = "REVISADA" if es_valida else "FALSO_POSITIVO"

        try:
            supabase.table("Alerta").update({
                "estado": nuevo_estado,
                "updated_at": datetime.now().isoformat()
            }).eq("id", alerta_id).execute()
            return True
        except Exception as e:
            print(f"Error validando coincidencia: {e}")
            return False

    def validarAlerta(self, alerta_id: int, nuevo_estado: str) -> bool:
        """
        Cambia el estado de una alerta

        Args:
            alerta_id: ID de la alerta
            nuevo_estado: Nuevo estado (PENDIENTE, REVISADA, FALSO_POSITIVO)

        Returns:
            True si la actualización fue exitosa
        """
        from services.supabase_client import supabase

        try:
            supabase.table("Alerta").update({
                "estado": nuevo_estado,
                "updated_at": datetime.now().isoformat()
            }).eq("id", alerta_id).execute()
            return True
        except Exception as e:
            print(f"Error validando alerta: {e}")
            return False

    def suspenderCuenta(self, usuario_id: int) -> bool:
        """
        Suspende (desactiva) la cuenta de un usuario

        Args:
            usuario_id: ID del usuario a suspender

        Returns:
            True si la suspensión fue exitosa
        """
        from services.supabase_client import supabase

        try:
            supabase.table("Usuario").update({
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            }).eq("id", usuario_id).execute()
            return True
        except Exception as e:
            print(f"Error suspendiendo cuenta: {e}")
            return False

    def activarCuenta(self, usuario_id: int) -> bool:
        """
        Activa la cuenta de un usuario

        Args:
            usuario_id: ID del usuario a activar

        Returns:
            True si la activación fue exitosa
        """
        from services.supabase_client import supabase

        try:
            supabase.table("Usuario").update({
                "status": "active",
                "updated_at": datetime.now().isoformat()
            }).eq("id", usuario_id).execute()
            return True
        except Exception as e:
            print(f"Error activando cuenta: {e}")
            return False
