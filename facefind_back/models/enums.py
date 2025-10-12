"""
Enumeraciones del sistema FaceFind
Defines roles, estados y tipos según el diagrama UML
"""
from enum import Enum


class Rol(Enum):
    """Roles de usuario en el sistema"""
    ADMINISTRADOR = "admin"
    USUARIO_REGISTRADO = "user"

    @classmethod
    def from_string(cls, role_str: str):
        """Convierte string de BD a enum"""
        mapping = {
            "admin": cls.ADMINISTRADOR,
            "user": cls.USUARIO_REGISTRADO
        }
        return mapping.get(role_str, cls.USUARIO_REGISTRADO)

    def to_string(self) -> str:
        """Convierte enum a string para BD"""
        return self.value


class EstadoCaso(Enum):
    """Estados posibles de un caso"""
    ACTIVO = "activo"
    PENDIENTE = "pendiente"
    RESUELTO = "resuelto"
    CANCELADO = "cancelado"

    @classmethod
    def from_string(cls, estado_str: str):
        """Convierte string de BD a enum"""
        mapping = {
            "activo": cls.ACTIVO,
            "pendiente": cls.PENDIENTE,
            "resuelto": cls.RESUELTO,
            "cancelado": cls.CANCELADO
        }
        return mapping.get(estado_str.lower(), cls.PENDIENTE)

    def to_string(self) -> str:
        """Convierte enum a string para BD"""
        return self.value


class TipoFoto(Enum):
    """Tipos de foto según ángulo de captura"""
    FRONTAL = "frontal"
    PERFIL_DER = "perfil_der"
    PERFIL_IZQ = "perfil_izq"

    @classmethod
    def from_string(cls, tipo_str: str):
        """Convierte string de BD a enum"""
        mapping = {
            "frontal": cls.FRONTAL,
            "perfil_der": cls.PERFIL_DER,
            "perfil_izq": cls.PERFIL_IZQ
        }
        return mapping.get(tipo_str.lower(), cls.FRONTAL)

    def to_string(self) -> str:
        """Convierte enum a string para BD"""
        return self.value


class EstadoAlerta(Enum):
    """Estados posibles de una alerta"""
    PENDIENTE = "PENDIENTE"
    REVISADA = "REVISADA"
    FALSO_POSITIVO = "FALSO_POSITIVO"

    @classmethod
    def from_string(cls, estado_str: str):
        """Convierte string de BD a enum"""
        mapping = {
            "PENDIENTE": cls.PENDIENTE,
            "REVISADA": cls.REVISADA,
            "FALSO_POSITIVO": cls.FALSO_POSITIVO
        }
        return mapping.get(estado_str.upper(), cls.PENDIENTE)

    def to_string(self) -> str:
        """Convierte enum a string para BD"""
        return self.value


class PrioridadAlerta(Enum):
    """Niveles de prioridad de alertas"""
    ALTA = "ALTA"
    MEDIA = "MEDIA"
    BAJA = "BAJA"

    @classmethod
    def from_string(cls, prioridad_str: str):
        """Convierte string de BD a enum"""
        mapping = {
            "ALTA": cls.ALTA,
            "MEDIA": cls.MEDIA,
            "BAJA": cls.BAJA
        }
        return mapping.get(prioridad_str.upper(), cls.MEDIA)

    def to_string(self) -> str:
        """Convierte enum a string para BD"""
        return self.value
