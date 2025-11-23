"""
Clase Alerta según diagrama UML
Representa una alerta generada por detección de coincidencia
"""
from typing import Optional, Dict
from datetime import datetime
from .enums import EstadoAlerta, PrioridadAlerta
from .frame import Frame


class Alerta:
    """
    Alerta generada cuando se detecta una posible coincidencia
    Según diagrama UML: timestamp, confidence, ubicacion, camera, status, imagenCaptura
    """

    def __init__(self,
                 caso_id: int,
                 camara_id: int,
                 timestamp: datetime,
                 similitud: float,
                 prioridad: PrioridadAlerta,
                 estado: EstadoAlerta = EstadoAlerta.PENDIENTE,
                 ubicacion: Optional[str] = None,
                 imagen_captura: Optional[Frame] = None,
                 imagen_bytes: Optional[bytes] = None,
                 id: Optional[int] = None,
                 created_at: Optional[datetime] = None):
        """
        Constructor de Alerta

        Args:
            caso_id: ID del caso que generó la alerta
            camara_id: ID de la cámara que detectó la coincidencia
            timestamp: Momento de la detección
            similitud: Nivel de confianza/similitud (0.0 - 1.0)
            prioridad: Prioridad de la alerta (ALTA, MEDIA, BAJA)
            estado: Estado de la alerta (PENDIENTE, REVISADA, FALSO_POSITIVO)
            ubicacion: Ubicación de la cámara
            imagen_captura: Frame capturado
            imagen_bytes: Imagen en bytes (para BD)
            id: ID en base de datos
            created_at: Fecha de creación
        """
        self._id = id
        self._caso_id = caso_id
        self._camara_id = camara_id
        self._timestamp = timestamp
        self._confidence = similitud  # confidence en UML
        self._similitud = similitud
        self._ubicacion = ubicacion
        self._estado = estado  # status en UML
        self._prioridad = prioridad
        self._imagen_captura = imagen_captura  # imagenCaptura en UML (Frame)
        self._imagen_bytes = imagen_bytes
        self._created_at = created_at or datetime.now()

    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def caso_id(self) -> int:
        return self._caso_id

    @property
    def camara_id(self) -> int:
        return self._camara_id

    @property
    def timestamp(self) -> datetime:
        return self._timestamp

    @property
    def confidence(self) -> float:
        """Alias para compatibilidad con UML"""
        return self._confidence

    @property
    def similitud(self) -> float:
        return self._similitud

    @property
    def ubicacion(self) -> Optional[str]:
        return self._ubicacion

    @property
    def estado(self) -> EstadoAlerta:
        """status en UML"""
        return self._estado

    @property
    def status(self) -> str:
        """Alias para compatibilidad con BD"""
        return self._estado.to_string()

    @property
    def prioridad(self) -> PrioridadAlerta:
        return self._prioridad

    @property
    def imagen_captura(self) -> Optional[Frame]:
        """imagenCaptura en UML"""
        return self._imagen_captura

    @property
    def imagen_bytes(self) -> Optional[bytes]:
        return self._imagen_bytes

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @estado.setter
    def estado(self, value: EstadoAlerta):
        self._estado = value

    @prioridad.setter
    def prioridad(self, value: PrioridadAlerta):
        self._prioridad = value

    def marcar_como_revisada(self) -> None:
        """Marca la alerta como revisada"""
        self._estado = EstadoAlerta.REVISADA

    def marcar_como_falso_positivo(self) -> None:
        """Marca la alerta como falso positivo"""
        self._estado = EstadoAlerta.FALSO_POSITIVO

    def es_alta_prioridad(self) -> bool:
        """
        Verifica si la alerta es de alta prioridad

        Returns:
            True si es alta prioridad
        """
        return self._prioridad == PrioridadAlerta.ALTA

    def crearNotificacion(self, tipo: str) -> 'Notificacion':
        """
        Crea una notificación a partir de esta alerta
        Método definido en el diagrama UML

        Args:
            tipo: Tipo de notificación ('email' o 'dashboard')

        Returns:
            Instancia de Notificacion
        """
        from .notificacion import Notificacion, TipoNotificacion
        
        tipo_notif = TipoNotificacion.from_string(tipo)
        return Notificacion(
            alerta=self,
            tipo=tipo_notif,
            prioridad=self._prioridad
        )

    def calcular_prioridad_por_similitud(self) -> PrioridadAlerta:
        """
        Calcula la prioridad basada en el nivel de similitud

        Returns:
            Prioridad calculada
        """
        if self._similitud >= 0.85:
            return PrioridadAlerta.ALTA
        elif self._similitud >= 0.70:
            return PrioridadAlerta.MEDIA
        else:
            return PrioridadAlerta.BAJA

    def to_dict(self) -> Dict:
        """
        Convierte la alerta a diccionario para BD o API

        Returns:
            Diccionario con los datos de la alerta
        """
        data = {
            "id": self._id,
            "caso_id": self._caso_id,
            "camara_id": self._camara_id,
            "timestamp": self._timestamp.isoformat() if isinstance(self._timestamp, datetime) else self._timestamp,
            "similitud": self._similitud,
            "confidence": self._confidence,
            "ubicacion": self._ubicacion,
            "estado": self._estado.to_string(),
            "prioridad": self._prioridad.to_string(),
            "created_at": self._created_at.isoformat() if isinstance(self._created_at, datetime) else self._created_at
        }

        # Incluir imagen si existe
        if self._imagen_captura:
            data["imagen_captura"] = self._imagen_captura.to_dict()

        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'Alerta':
        """
        Crea una instancia desde un diccionario de BD

        Args:
            data: Diccionario con datos de la alerta

        Returns:
            Instancia de Alerta
        """
        # Convertir strings a enums
        estado_str = data.get("estado", "PENDIENTE")
        estado = EstadoAlerta.from_string(estado_str)

        prioridad_str = data.get("prioridad", "MEDIA")
        prioridad = PrioridadAlerta.from_string(prioridad_str)

        # Crear Frame si existe imagen
        imagen_captura = None
        if "imagen_captura" in data and data["imagen_captura"]:
            if isinstance(data["imagen_captura"], dict):
                imagen_captura = Frame.from_dict(data["imagen_captura"])

        return cls(
            id=data.get("id"),
            caso_id=data["caso_id"],
            camara_id=data["camara_id"],
            timestamp=data["timestamp"],
            similitud=data["similitud"],
            prioridad=prioridad,
            estado=estado,
            ubicacion=data.get("ubicacion"),
            imagen_captura=imagen_captura,
            imagen_bytes=data.get("imagen"),
            created_at=data.get("created_at")
        )

    def __repr__(self) -> str:
        return f"<Alerta(id={self._id}, caso_id={self._caso_id}, similitud={self._similitud:.2f}, estado={self._estado.value})>"
