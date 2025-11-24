"""
Clase Camara según diagrama UML
Representa una cámara de vigilancia (USB o IP)
"""
from typing import Optional, Dict
from datetime import datetime


class Camara:
    """
    Cámara de vigilancia
    Representa una cámara del sistema (USB o IP) para reconocimiento facial
    """

    def __init__(self,
                 nombre: str,
                 tipo: str,
                 ubicacion: str,
                 activa: bool = True,
                 id: Optional[int] = None,
                 ip: Optional[str] = None,
                 url: Optional[str] = None,
                 resolution: Optional[str] = None,
                 fps: Optional[int] = None,
                 latitud: Optional[float] = None,
                 longitud: Optional[float] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        """
        Constructor de Camara

        Args:
            nombre: Nombre identificador de la cámara
            tipo: Tipo de cámara ('USB' o 'IP')
            ubicacion: Ubicación física de la cámara
            activa: Estado de la cámara (activa/inactiva)
            id: ID de la cámara en BD
            ip: Dirección IP (para cámaras IP)
            url: URL de conexión (para cámaras IP)
            resolution: Resolución de la cámara (ej: "1920x1080")
            fps: Frames por segundo
            latitud: Latitud de la ubicación de la cámara
            longitud: Longitud de la ubicación de la cámara
            created_at: Fecha de creación
            updated_at: Fecha de última actualización
        """
        self._id = id
        self._nombre = nombre
        self._tipo = tipo
        self._ip = ip or f"camera_{nombre}_{id or 0}"  # Generar IP única si no se proporciona
        self._ubicacion = ubicacion
        self._activa = activa
        self._url = url
        self._resolution = resolution
        self._fps = fps
        self._latitud = latitud
        self._longitud = longitud
        self._created_at = created_at or datetime.now()
        self._updated_at = updated_at or datetime.now()

    # Getters
    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def nombre(self) -> str:
        return self._nombre

    @property
    def tipo(self) -> str:
        return self._tipo

    @property
    def ip(self) -> str:
        return self._ip

    @property
    def ubicacion(self) -> str:
        return self._ubicacion

    @property
    def activa(self) -> bool:
        return self._activa

    @property
    def url(self) -> Optional[str]:
        return self._url

    @property
    def resolution(self) -> Optional[str]:
        return self._resolution

    @property
    def fps(self) -> Optional[int]:
        return self._fps

    @property
    def latitud(self) -> Optional[float]:
        return self._latitud

    @property
    def longitud(self) -> Optional[float]:
        return self._longitud

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @property
    def updated_at(self) -> datetime:
        return self._updated_at

    # Setters
    @nombre.setter
    def nombre(self, value: str):
        self._nombre = value
        self._updated_at = datetime.now()

    @tipo.setter
    def tipo(self, value: str):
        if value not in ["USB", "IP"]:
            raise ValueError("Tipo debe ser 'USB' o 'IP'")
        self._tipo = value
        self._updated_at = datetime.now()

    @ubicacion.setter
    def ubicacion(self, value: str):
        self._ubicacion = value
        self._updated_at = datetime.now()

    @activa.setter
    def activa(self, value: bool):
        self._activa = value
        self._updated_at = datetime.now()

    @url.setter
    def url(self, value: Optional[str]):
        self._url = value
        self._updated_at = datetime.now()

    @resolution.setter
    def resolution(self, value: Optional[str]):
        self._resolution = value
        self._updated_at = datetime.now()

    @fps.setter
    def fps(self, value: Optional[int]):
        if value is not None and (value < 1 or value > 120):
            raise ValueError("FPS debe estar entre 1 y 120")
        self._fps = value
        self._updated_at = datetime.now()

    @latitud.setter
    def latitud(self, value: Optional[float]):
        if value is not None and (value < -90 or value > 90):
            raise ValueError("Latitud debe estar entre -90 y 90")
        self._latitud = value
        self._updated_at = datetime.now()

    @longitud.setter
    def longitud(self, value: Optional[float]):
        if value is not None and (value < -180 or value > 180):
            raise ValueError("Longitud debe estar entre -180 y 180")
        self._longitud = value
        self._updated_at = datetime.now()

    # Métodos según UML
    def activar(self) -> None:
        """Activa la cámara"""
        self._activa = True
        self._updated_at = datetime.now()

    def desactivar(self) -> None:
        """Desactiva la cámara"""
        self._activa = False
        self._updated_at = datetime.now()

    def actualizar_configuracion(self, **kwargs) -> None:
        """
        Actualiza la configuración de la cámara
        
        Args:
            **kwargs: Parámetros a actualizar (nombre, ubicacion, url, resolution, fps)
        """
        if 'nombre' in kwargs:
            self.nombre = kwargs['nombre']
        if 'ubicacion' in kwargs:
            self.ubicacion = kwargs['ubicacion']
        if 'url' in kwargs:
            self.url = kwargs['url']
        if 'resolution' in kwargs:
            self.resolution = kwargs['resolution']
        if 'fps' in kwargs:
            self.fps = kwargs['fps']
        if 'tipo' in kwargs:
            self.tipo = kwargs['tipo']

    # Métodos de conversión
    def to_dict(self) -> Dict:
        """Convierte la cámara a diccionario para JSON/BD"""
        return {
            "id": self._id,
            "nombre": self._nombre,
            "type": self._tipo,
            "ip": self._ip,
            "ubicacion": self._ubicacion,
            "activa": self._activa,
            "url": self._url,
            "resolution": self._resolution,
            "fps": self._fps,
            "latitud": self._latitud,
            "longitud": self._longitud,
            "created_at": self._created_at.isoformat() if self._created_at else None,
            "updated_at": self._updated_at.isoformat() if self._updated_at else None
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Camara':
        """
        Crea una instancia de Camara desde un diccionario
        
        Args:
            data: Diccionario con los datos de la cámara
            
        Returns:
            Camara: Instancia de Camara
        """
        def parse_timestamp(timestamp_str: str) -> datetime:
            """Parsea timestamp de PostgreSQL manejando microsegundos variables"""
            if not timestamp_str:
                return None
            
            try:
                # Intentar parseo normal
                return datetime.fromisoformat(timestamp_str)
            except ValueError:
                # Si falla, normalizar microsegundos a 6 dígitos
                if '.' in timestamp_str:
                    parts = timestamp_str.split('.')
                    if len(parts) == 2:
                        # Asegurar que microsegundos tenga 6 dígitos
                        microseconds = parts[1].ljust(6, '0')[:6]
                        normalized = f"{parts[0]}.{microseconds}"
                        return datetime.fromisoformat(normalized)
                # Si aún falla, retornar None
                return None
        
        return cls(
            id=data.get("id"),
            nombre=data.get("nombre", ""),
            tipo=data.get("type", "USB"),
            ip=data.get("ip"),
            ubicacion=data.get("ubicacion", ""),
            activa=data.get("activa", True),
            url=data.get("url"),
            resolution=data.get("resolution"),
            fps=data.get("fps"),
            latitud=data.get("latitud"),
            longitud=data.get("longitud"),
            created_at=parse_timestamp(data.get("created_at")),
            updated_at=parse_timestamp(data.get("updated_at"))
        )

    def __str__(self) -> str:
        """Representación en string de la cámara"""
        estado = "Activa" if self._activa else "Inactiva"
        return f"Camara(id={self._id}, nombre='{self._nombre}', tipo='{self._tipo}', ubicacion='{self._ubicacion}', estado={estado})"

    def __repr__(self) -> str:
        return self.__str__()
