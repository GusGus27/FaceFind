"""
Clase Encoding ajustada
Representa el vector de características faciales (embedding)
y permite guardarlo en la BD.
"""
from typing import Optional, Dict
import numpy as np
from datetime import datetime
import base64



class Encoding:
    def __init__(self,
                 vector: np.ndarray,
                 foto_referencia_id: Optional[int] = None,
                 id: Optional[int] = None,
                 fecha_generacion: Optional[datetime] = None):
        self._id = id
        self._vector = vector
        self._foto_referencia_id = foto_referencia_id
        self._fecha_generacion = fecha_generacion or datetime.now()

    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def vector(self) -> np.ndarray:
        return self._vector

    @property
    def foto_referencia_id(self) -> Optional[int]:
        return self._foto_referencia_id

    @property
    def fecha_generacion(self) -> datetime:
        return self._fecha_generacion

    def to_bytes(self) -> bytes:
        """Convierte el vector a bytes para almacenar en BD"""
        return self._vector.astype(np.float64).tobytes()

    @classmethod
    def from_bytes(cls, vector_bytes: bytes, **kwargs) -> 'Encoding':
        vector = np.frombuffer(vector_bytes, dtype=np.float64)
        return cls(vector=vector, **kwargs)

    def to_list(self) -> list:
        return self._vector.tolist()

    def distancia(self, otro_encoding: 'Encoding') -> float:
        return np.linalg.norm(self._vector - otro_encoding.vector)

    def similitud_porcentaje(self, otro_encoding: 'Encoding') -> float:
        distancia = self.distancia(otro_encoding)
        similitud = max(0, min(100, (1 - distancia) * 100))
        return similitud

    def to_dict(self) -> Dict:
        vector_value = self._vector
        # Si el vector está en bytes (después de guardar en DB), conviértelo a base64 para el JSON
        if isinstance(vector_value, (bytes, bytearray)):
            vector_value = base64.b64encode(vector_value).decode("utf-8")
        elif isinstance(vector_value, np.ndarray):
            vector_value = vector_value.tolist()

        return {
            "id": self._id,
            "vector": vector_value,
            "foto_referencia_id": self._foto_referencia_id,
            "fecha_generacion": self._fecha_generacion.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Encoding':
        vector = np.array(data["vector"], dtype=np.float64)
        return cls(
            vector=vector,
            foto_referencia_id=data.get("foto_referencia_id"),
            id=data.get("id"),
            fecha_generacion=data.get("fecha_generacion")
        )
    
    def guardar_en_db(self, supabase_client):
        vector_b64 = base64.b64encode(self.to_bytes()).decode("utf-8")

        data = {
            "foto_referencia_id": self._foto_referencia_id,
            "vector": vector_b64,  # <-- ahora es string
            "fecha_generacion": self._fecha_generacion.isoformat()
        }

        res = supabase_client.table("Embedding").insert(data).execute()
        if res.data:
            self._id = res.data[0]["id"]

        return {
            "id": self._id,
            "foto_referencia_id": self._foto_referencia_id,
            "vector": vector_b64,
            "fecha_generacion": self._fecha_generacion.isoformat()
        }





