"""
Clase Foto según diagrama UML
Representa una foto de referencia con su embedding
"""
from typing import Optional, Dict
from datetime import datetime
from .enums import TipoFoto
from .encoding import Encoding


class Foto:
    """
    Foto de referencia de una persona desaparecida
    Según diagrama UML: formato, resolucion, fechaCarga, tipo, embedding
    """

    def __init__(self,
                 ruta_archivo: str,
                 tipo: TipoFoto,
                 formato: Optional[str] = None,
                 resolucion: Optional[str] = None,
                 fecha_carga: Optional[datetime] = None,
                 embedding: Optional[Encoding] = None,
                 caso_id: Optional[int] = None,
                 id: Optional[int] = None):
        """
        Constructor de Foto

        Args:
            ruta_archivo: Ruta del archivo de la foto (URL o path)
            tipo: Tipo de foto (FRONTAL, PERFIL_DER, PERFIL_IZQ)
            formato: Formato del archivo (jpg, png, etc.)
            resolucion: Resolución de la imagen
            fecha_carga: Fecha de carga de la foto
            embedding: Encoding facial asociado
            caso_id: ID del caso asociado
            id: ID en base de datos
        """
        self._id = id
        self._ruta_archivo = ruta_archivo
        self._formato = formato or self._extraer_formato(ruta_archivo)
        self._resolucion = resolucion
        self._fecha_carga = fecha_carga or datetime.now()
        self._tipo = tipo
        self._embedding = embedding
        self._caso_id = caso_id

    @staticmethod
    def _extraer_formato(ruta: str) -> str:
        """
        Extrae el formato de archivo de la ruta

        Args:
            ruta: Ruta del archivo

        Returns:
            Formato del archivo (extensión)
        """
        if '.' in ruta:
            return ruta.split('.')[-1].lower()
        return "unknown"

    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def ruta_archivo(self) -> str:
        return self._ruta_archivo

    @property
    def formato(self) -> str:
        return self._formato

    @property
    def resolucion(self) -> Optional[str]:
        return self._resolucion

    @property
    def fecha_carga(self) -> datetime:
        return self._fecha_carga

    @property
    def tipo(self) -> TipoFoto:
        return self._tipo

    @property
    def embedding(self) -> Optional[Encoding]:
        return self._embedding

    @property
    def caso_id(self) -> Optional[int]:
        return self._caso_id

    @embedding.setter
    def embedding(self, value: Encoding):
        self._embedding = value

    def validarFormato(self) -> bool:
        """
        Valida que el formato de la foto sea correcto
        Según UML: +validarFormato():Boolean

        Returns:
            True si el formato es válido
        """
        formatos_validos = ['jpg', 'jpeg', 'png', 'bmp', 'webp']
        return self._formato.lower() in formatos_validos

    def procesarEmbedding(self) -> Encoding:
        """
        Procesa la foto para generar su embedding facial
        Según UML: +procesarEmbedding():Encoding

        Returns:
            Encoding generado (debe ser implementado con face_recognition)
        """
        # Este método será implementado por el servicio de procesamiento
        # Aquí solo definimos la interfaz según UML
        # La lógica real está en facefind/procesador_facefind.py
        if self._embedding:
            return self._embedding

        # Placeholder - la implementación real se hace en el servicio
        raise NotImplementedError("El procesamiento de embedding debe hacerse mediante el servicio de encodings")

    def tiene_embedding(self) -> bool:
        """
        Verifica si la foto ya tiene un embedding procesado

        Returns:
            True si tiene embedding
        """
        return self._embedding is not None

    def to_dict(self) -> Dict:
        """
        Convierte la foto a diccionario para BD o API

        Returns:
            Diccionario con los datos de la foto
        """
        data = {
            "id": self._id,
            "ruta_archivo": self._ruta_archivo,
            "formato": self._formato,
            "resolucion": self._resolucion,
            "fecha_carga": self._fecha_carga.isoformat() if isinstance(self._fecha_carga, datetime) else self._fecha_carga,
            "tipo": self._tipo.to_string(),
            "caso_id": self._caso_id
        }

        if self._embedding:
            data["embedding"] = self._embedding.to_dict()

        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'Foto':
        """
        Crea una instancia desde un diccionario de BD

        Args:
            data: Diccionario con datos de la foto

        Returns:
            Instancia de Foto
        """
        # Convertir tipo string a enum
        tipo_str = data.get("tipo", "frontal")
        tipo = TipoFoto.from_string(tipo_str)

        # Crear Encoding si existe
        embedding = None
        if "embedding" in data and data["embedding"]:
            embedding = Encoding.from_dict(data["embedding"])

        return cls(
            ruta_archivo=data["ruta_archivo"],
            tipo=tipo,
            formato=data.get("formato"),
            resolucion=data.get("resolucion"),
            fecha_carga=data.get("fecha_carga"),
            embedding=embedding,
            caso_id=data.get("caso_id"),
            id=data.get("id")
        )

    def __repr__(self) -> str:
        return f"<Foto(id={self._id}, tipo={self._tipo.value}, formato={self._formato})>"
