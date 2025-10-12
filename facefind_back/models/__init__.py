"""
Modelos del dominio FaceFind
Implementación OOP según diagrama UML
"""

# Enumeraciones
from .enums import Rol, EstadoCaso, TipoFoto, EstadoAlerta, PrioridadAlerta

# Clases de dominio
from .encoding import Encoding
from .frame import Frame
from .foto import Foto
from .persona_desaparecida import PersonaDesaparecida
from .caso import Caso
from .alerta import Alerta

# Jerarquía de Usuario
from .usuario import UsuarioBase, UsuarioRegistrado, UsuarioAdministrador

__all__ = [
    # Enums
    'Rol',
    'EstadoCaso',
    'TipoFoto',
    'EstadoAlerta',
    'PrioridadAlerta',

    # Clases
    'Encoding',
    'Frame',
    'Foto',
    'PersonaDesaparecida',
    'Caso',
    'Alerta',

    # Usuarios
    'UsuarioBase',
    'UsuarioRegistrado',
    'UsuarioAdministrador',
]
