"""
Clase Frame según diagrama UML
Representa un frame/imagen capturado de cámara
"""
from typing import Optional, Dict
import numpy as np
import cv2
import base64


class Frame:
    """
    Frame de imagen capturado de cámara
    Según diagrama UML: -imagen:String
    """

    def __init__(self,
                 imagen: np.ndarray,
                 timestamp: Optional[float] = None,
                 camara_id: Optional[int] = None):
        """
        Constructor de Frame

        Args:
            imagen: Array numpy con la imagen (formato OpenCV BGR)
            timestamp: Timestamp de captura
            camara_id: ID de la cámara que capturó el frame
        """
        self._imagen = imagen
        self._timestamp = timestamp
        self._camara_id = camara_id

    @property
    def imagen(self) -> np.ndarray:
        """Imagen como array numpy (imagen:String en UML se interpreta como datos)"""
        return self._imagen

    @property
    def timestamp(self) -> Optional[float]:
        return self._timestamp

    @property
    def camara_id(self) -> Optional[int]:
        return self._camara_id

    @property
    def shape(self) -> tuple:
        """Retorna las dimensiones del frame (height, width, channels)"""
        return self._imagen.shape if self._imagen is not None else (0, 0, 0)

    def to_base64(self) -> str:
        """
        Convierte el frame a string base64

        Returns:
            Imagen codificada en base64
        """
        if self._imagen is None:
            return ""

        # Codificar imagen a JPEG
        success, buffer = cv2.imencode('.jpg', self._imagen)
        if not success:
            return ""

        # Convertir a base64
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{img_base64}"

    @classmethod
    def from_base64(cls, base64_str: str, **kwargs) -> 'Frame':
        """
        Crea un Frame desde un string base64

        Args:
            base64_str: Imagen en formato base64
            **kwargs: Otros parámetros del constructor

        Returns:
            Instancia de Frame
        """
        # Remover prefijo si existe
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]

        # Decodificar base64
        img_bytes = base64.b64decode(base64_str)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)

        # Decodificar imagen
        imagen = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        return cls(imagen=imagen, **kwargs)

    def to_bytes(self) -> bytes:
        """
        Convierte el frame a bytes

        Returns:
            Imagen serializada en bytes (formato JPEG)
        """
        if self._imagen is None:
            return b""

        success, buffer = cv2.imencode('.jpg', self._imagen)
        if not success:
            return b""

        return buffer.tobytes()

    @classmethod
    def from_bytes(cls, img_bytes: bytes, **kwargs) -> 'Frame':
        """
        Crea un Frame desde bytes

        Args:
            img_bytes: Imagen en bytes
            **kwargs: Otros parámetros del constructor

        Returns:
            Instancia de Frame
        """
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        imagen = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        return cls(imagen=imagen, **kwargs)

    def redimensionar(self, ancho: int, alto: int) -> 'Frame':
        """
        Redimensiona el frame

        Args:
            ancho: Nuevo ancho
            alto: Nuevo alto

        Returns:
            Nuevo Frame redimensionado
        """
        if self._imagen is None:
            return self

        imagen_redimensionada = cv2.resize(self._imagen, (ancho, alto))
        return Frame(
            imagen=imagen_redimensionada,
            timestamp=self._timestamp,
            camara_id=self._camara_id
        )

    def to_rgb(self) -> np.ndarray:
        """
        Convierte el frame de BGR (OpenCV) a RGB

        Returns:
            Imagen en formato RGB
        """
        if self._imagen is None:
            return np.array([])

        return cv2.cvtColor(self._imagen, cv2.COLOR_BGR2RGB)

    def to_dict(self) -> Dict:
        """
        Convierte el frame a diccionario

        Returns:
            Diccionario con los datos del frame
        """
        return {
            "imagen": self.to_base64(),
            "timestamp": self._timestamp,
            "camara_id": self._camara_id,
            "shape": self.shape
        }

    def __repr__(self) -> str:
        return f"<Frame(shape={self.shape}, camara_id={self._camara_id})>"
