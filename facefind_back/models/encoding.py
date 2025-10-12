"""
Clase Encoding según diagrama UML
Representa el vector de características faciales (embedding)
"""
from typing import Optional, Dict
import numpy as np
from datetime import datetime


class Encoding:
    """
    Encoding/Embedding facial - Representación matemática del rostro
    Según diagrama UML: +vector:Float[]
    """

    def __init__(self,
                 vector: np.ndarray,
                 foto_referencia_id: Optional[int] = None,
                 caso_id: Optional[int] = None,
                 id: Optional[int] = None,
                 fecha_generacion: Optional[datetime] = None):
        """
        Constructor de Encoding

        Args:
            vector: Array numpy con el vector de características (128 dimensiones)
            foto_referencia_id: ID de la foto de referencia
            caso_id: ID del caso asociado
            id: ID en base de datos
            fecha_generacion: Fecha de generación del encoding
        """
        self._id = id
        self._vector = vector
        self._foto_referencia_id = foto_referencia_id
        self._caso_id = caso_id
        self._fecha_generacion = fecha_generacion or datetime.now()

    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def vector(self) -> np.ndarray:
        """Vector de características faciales (Float[] en UML)"""
        return self._vector

    @property
    def foto_referencia_id(self) -> Optional[int]:
        return self._foto_referencia_id

    @property
    def caso_id(self) -> Optional[int]:
        return self._caso_id

    @property
    def fecha_generacion(self) -> datetime:
        return self._fecha_generacion

    def to_bytes(self) -> bytes:
        """
        Convierte el vector a bytes para almacenar en BD

        Returns:
            Vector serializado en bytes
        """
        return self._vector.tobytes()

    @classmethod
    def from_bytes(cls, vector_bytes: bytes, **kwargs) -> 'Encoding':
        """
        Crea un Encoding desde bytes almacenados en BD

        Args:
            vector_bytes: Vector serializado
            **kwargs: Otros parámetros del constructor

        Returns:
            Instancia de Encoding
        """
        vector = np.frombuffer(vector_bytes, dtype=np.float64)
        return cls(vector=vector, **kwargs)

    def to_list(self) -> list:
        """
        Convierte el vector a lista Python

        Returns:
            Lista de floats
        """
        return self._vector.tolist()

    def distancia(self, otro_encoding: 'Encoding') -> float:
        """
        Calcula la distancia euclidiana con otro encoding

        Args:
            otro_encoding: Otro Encoding para comparar

        Returns:
            Distancia entre los encodings (menor = más similar)
        """
        return np.linalg.norm(self._vector - otro_encoding.vector)

    def similitud_porcentaje(self, otro_encoding: 'Encoding') -> float:
        """
        Calcula el porcentaje de similitud con otro encoding

        Args:
            otro_encoding: Otro Encoding para comparar

        Returns:
            Porcentaje de similitud (0-100)
        """
        distancia = self.distancia(otro_encoding)
        # Convertir distancia a porcentaje (1 - distancia normalizada)
        similitud = max(0, min(100, (1 - distancia) * 100))
        return similitud

    def to_dict(self) -> Dict:
        """
        Convierte el encoding a diccionario

        Returns:
            Diccionario con los datos del encoding
        """
        return {
            "id": self._id,
            "vector": self.to_list(),
            "foto_referencia_id": self._foto_referencia_id,
            "caso_id": self._caso_id,
            "fecha_generacion": self._fecha_generacion.isoformat() if isinstance(self._fecha_generacion, datetime) else self._fecha_generacion
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Encoding':
        """
        Crea una instancia desde un diccionario

        Args:
            data: Diccionario con datos del encoding

        Returns:
            Instancia de Encoding
        """
        vector = np.array(data["vector"], dtype=np.float64)
        return cls(
            vector=vector,
            foto_referencia_id=data.get("foto_referencia_id"),
            caso_id=data.get("caso_id"),
            id=data.get("id"),
            fecha_generacion=data.get("fecha_generacion")
        )

    def __repr__(self) -> str:
        return f"<Encoding(id={self._id}, dim={len(self._vector)}, foto_ref={self._foto_referencia_id})>"
