"""
Clase PersonaDesaparecida según diagrama UML
Representa información de una persona desaparecida
"""
from typing import Optional, Dict, List
from datetime import date, datetime


class PersonaDesaparecida:
    """
    Persona desaparecida con sus características físicas y datos
    Según diagrama UML
    """

    def __init__(self,
                 nombre_completo: str,
                 fecha_nacimiento: Optional[date] = None,
                 gender: Optional[str] = None,
                 altura: Optional[float] = None,
                 peso: Optional[float] = None,
                 skin_color: Optional[str] = None,
                 hair_color: Optional[str] = None,
                 eye_color: Optional[str] = None,
                 senas_particulares: Optional[str] = None,
                 edad_desaparicion: Optional[int] = None,
                 clothing: Optional[str] = None,
                 id: Optional[int] = None):
        """
        Constructor de PersonaDesaparecida

        Args:
            nombre_completo: Nombre completo de la persona
            fecha_nacimiento: Fecha de nacimiento
            gender: Género
            altura: Altura en cm
            peso: Peso en kg
            skin_color: Color de piel
            hair_color: Color de cabello
            eye_color: Color de ojos
            senas_particulares: Señas particulares
            edad_desaparicion: Edad al momento de la desaparición
            clothing: Ropa que vestía
            id: ID en base de datos
        """
        self._id = id
        self._nombre = nombre_completo
        self._edad = edad_desaparicion
        self._fecha_nac = fecha_nacimiento
        self._gender = gender
        self._altura = altura
        self._peso = peso
        self._skin_color = skin_color
        self._hair_color = hair_color
        self._eye_color = eye_color
        self._senas_particulares = senas_particulares
        self._clothing = clothing
        self._fotos: List = []  # Lista de objetos Foto

    # Getters
    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def nombre(self) -> str:
        return self._nombre

    @property
    def edad(self) -> Optional[int]:
        return self._edad

    @property
    def fecha_nac(self) -> Optional[date]:
        return self._fecha_nac

    @property
    def caracteristicas_fisicas(self) -> str:
        """
        Genera descripción de características físicas
        Según UML: caracteristicasFisicas:String
        """
        caracteristicas = []

        if self._gender:
            caracteristicas.append(f"Género: {self._gender}")
        if self._altura:
            caracteristicas.append(f"Altura: {self._altura} cm")
        if self._peso:
            caracteristicas.append(f"Peso: {self._peso} kg")
        if self._skin_color:
            caracteristicas.append(f"Color de piel: {self._skin_color}")
        if self._hair_color:
            caracteristicas.append(f"Color de cabello: {self._hair_color}")
        if self._eye_color:
            caracteristicas.append(f"Color de ojos: {self._eye_color}")
        if self._senas_particulares:
            caracteristicas.append(f"Señas particulares: {self._senas_particulares}")
        if self._clothing:
            caracteristicas.append(f"Vestimenta: {self._clothing}")

        return " | ".join(caracteristicas) if caracteristicas else "Sin información"

    @property
    def fotos(self) -> List:
        return self._fotos

    # Setters
    @nombre.setter
    def nombre(self, value: str):
        self._nombre = value

    @edad.setter
    def edad(self, value: Optional[int]):
        self._edad = value

    def agregarFoto(self, foto) -> None:
        """
        Agrega una foto a la persona desaparecida
        Según UML: +agregarFoto(Foto):void

        Args:
            foto: Objeto Foto a agregar
        """
        if foto not in self._fotos:
            self._fotos.append(foto)

    def eliminarFoto(self, foto) -> bool:
        """
        Elimina una foto de la persona desaparecida
        Según UML: +eliminarFoto(Foto):void

        Args:
            foto: Objeto Foto a eliminar

        Returns:
            True si se eliminó exitosamente
        """
        try:
            self._fotos.remove(foto)
            return True
        except ValueError:
            return False

    def actualizarInformacion(self, updates: Dict) -> None:
        """
        Actualiza la información de la persona
        Según UML: +actualizarInformacion():void

        Args:
            updates: Diccionario con campos a actualizar
        """
        if "nombre_completo" in updates:
            self._nombre = updates["nombre_completo"]
        if "age" in updates:
            self._edad = updates["age"]
        if "fecha_nacimiento" in updates:
            self._fecha_nac = updates["fecha_nacimiento"]
        if "gender" in updates:
            self._gender = updates["gender"]
        if "altura" in updates:
            self._altura = updates["altura"]
        if "peso" in updates:
            self._peso = updates["peso"]
        if "skinColor" in updates:
            self._skin_color = updates["skinColor"]
        if "hairColor" in updates:
            self._hair_color = updates["hairColor"]
        if "eyeColor" in updates:
            self._eye_color = updates["eyeColor"]
        if "senas_particulares" in updates:
            self._senas_particulares = updates["senas_particulares"]
        if "clothing" in updates:
            self._clothing = updates["clothing"]

    def to_dict(self) -> Dict:
        """
        Convierte la persona a diccionario para BD o API

        Returns:
            Diccionario con los datos de la persona
        """
        data = {
            "nombre_completo": self._nombre,
            "age": self._edad,
            "fecha_nacimiento": self._fecha_nac.isoformat() if isinstance(self._fecha_nac, date) else self._fecha_nac,
            "gender": self._gender,
            "altura": self._altura,
            "peso": self._peso,
            "skinColor": self._skin_color,
            "hairColor": self._hair_color,
            "eyeColor": self._eye_color,
            "senas_particulares": self._senas_particulares,
            "clothing": self._clothing
        }
        
        # Solo incluir id si existe (para updates, no para inserts)
        if self._id is not None:
            data["id"] = self._id
            
        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'PersonaDesaparecida':
        """
        Crea una instancia desde un diccionario de BD

        Args:
            data: Diccionario con datos de la persona

        Returns:
            Instancia de PersonaDesaparecida
        """
        return cls(
            nombre_completo=data["nombre_completo"],
            fecha_nacimiento=data.get("fecha_nacimiento"),
            gender=data.get("gender"),
            altura=data.get("altura"),
            peso=data.get("peso"),
            skin_color=data.get("skinColor"),
            hair_color=data.get("hairColor"),
            eye_color=data.get("eyeColor"),
            senas_particulares=data.get("senas_particulares"),
            edad_desaparicion=data.get("age"),
            clothing=data.get("clothing"),
            id=data.get("id")
        )

    def __repr__(self) -> str:
        return f"<PersonaDesaparecida(id={self._id}, nombre='{self._nombre}', edad={self._edad})>"
