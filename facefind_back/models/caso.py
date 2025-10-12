"""
Clase Caso según diagrama UML
Representa un caso de persona desaparecida
"""
from typing import Optional, Dict, List
from datetime import date, datetime
from .enums import EstadoCaso
from .persona_desaparecida import PersonaDesaparecida


class Caso:
    """
    Caso de persona desaparecida
    Según diagrama UML con atributos: numCaso, estado, fechaRegistro, detecciones[]
    """

    def __init__(self,
                 usuario_id: int,
                 fecha_desaparicion: date,
                 lugar_desaparicion: str,
                 estado: EstadoCaso = EstadoCaso.PENDIENTE,
                 id: Optional[int] = None,
                 persona_id: Optional[int] = None,
                 persona_desaparecida: Optional[PersonaDesaparecida] = None,
                 disappearance_time: Optional[str] = None,
                 last_seen_location: Optional[str] = None,
                 last_seen: Optional[str] = None,
                 circumstances: Optional[str] = None,
                 description: Optional[str] = None,
                 location: Optional[str] = None,
                 priority: str = "medium",
                 reporter_name: Optional[str] = None,
                 relationship: Optional[str] = None,
                 contact_phone: Optional[str] = None,
                 contact_email: Optional[str] = None,
                 additional_contact: Optional[str] = None,
                 resolution_date: Optional[date] = None,
                 resolution_note: Optional[str] = None,
                 observaciones: Optional[str] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        """
        Constructor de Caso

        Args:
            usuario_id: ID del usuario que creó el caso
            fecha_desaparicion: Fecha de desaparición
            lugar_desaparicion: Lugar de desaparición
            estado: Estado del caso (enum EstadoCaso)
            id: ID del caso (numCaso en UML)
            persona_id: ID de PersonaDesaparecida en BD
            persona_desaparecida: Objeto PersonaDesaparecida
            ... (resto de parámetros opcionales)
        """
        self._id = id  # numCaso en UML
        self._usuario_id = usuario_id
        self._persona_id = persona_id
        self._persona_desaparecida = persona_desaparecida
        self._fecha_desaparicion = fecha_desaparicion
        self._disappearance_time = disappearance_time
        self._lugar_desaparicion = lugar_desaparicion
        self._last_seen_location = last_seen_location
        self._last_seen = last_seen
        self._circumstances = circumstances
        self._description = description
        self._location = location
        self._estado = estado  # estado en UML
        self._priority = priority
        self._reporter_name = reporter_name
        self._relationship = relationship
        self._contact_phone = contact_phone
        self._contact_email = contact_email
        self._additional_contact = additional_contact
        self._resolution_date = resolution_date
        self._resolution_note = resolution_note
        self._observaciones = observaciones
        self._created_at = created_at or datetime.now()  # fechaRegistro en UML
        self._updated_at = updated_at or datetime.now()
        self._detecciones: List = []  # detecciones[] en UML - Lista de Alertas

    # Getters
    @property
    def id(self) -> Optional[int]:
        """numCaso en UML"""
        return self._id

    @property
    def num_caso(self) -> Optional[int]:
        """Alias para compatibilidad con UML"""
        return self._id

    @property
    def usuario_id(self) -> int:
        return self._usuario_id

    @property
    def persona_id(self) -> Optional[int]:
        return self._persona_id

    @property
    def persona_desaparecida(self) -> Optional[PersonaDesaparecida]:
        return self._persona_desaparecida

    @property
    def fecha_desaparicion(self) -> date:
        return self._fecha_desaparicion

    @property
    def lugar_desaparicion(self) -> str:
        return self._lugar_desaparicion

    @property
    def estado(self) -> EstadoCaso:
        return self._estado

    @property
    def fecha_registro(self) -> datetime:
        """fechaRegistro en UML"""
        return self._created_at

    @property
    def detecciones(self) -> List:
        """detecciones[] en UML - Lista de Alertas"""
        return self._detecciones

    @property
    def priority(self) -> str:
        return self._priority

    @property
    def status(self) -> str:
        """Alias para compatibilidad con BD"""
        return self._estado.to_string()

    # Setters
    @estado.setter
    def estado(self, value: EstadoCaso):
        self._estado = value
        self._updated_at = datetime.now()

    @priority.setter
    def priority(self, value: str):
        self._priority = value
        self._updated_at = datetime.now()

    @persona_desaparecida.setter
    def persona_desaparecida(self, value: PersonaDesaparecida):
        self._persona_desaparecida = value
        if value and value.id:
            self._persona_id = value.id

    def anadirPersonaDes(self, persona: PersonaDesaparecida) -> None:
        """
        Añade o actualiza la persona desaparecida del caso
        Según UML: +anadirPersonaDes(PersonaDesaparecida):void

        Args:
            persona: Objeto PersonaDesaparecida
        """
        self._persona_desaparecida = persona
        if persona.id:
            self._persona_id = persona.id
        self._updated_at = datetime.now()

    def agregarDeteccion(self, alerta) -> None:
        """
        Agrega una alerta/detección al caso

        Args:
            alerta: Objeto Alerta
        """
        if alerta not in self._detecciones:
            self._detecciones.append(alerta)

    def cambiarEstado(self, nuevo_estado: EstadoCaso, nota: Optional[str] = None) -> None:
        """
        Cambia el estado del caso

        Args:
            nuevo_estado: Nuevo estado del caso
            nota: Nota opcional sobre el cambio
        """
        self._estado = nuevo_estado
        if nuevo_estado == EstadoCaso.RESUELTO:
            self._resolution_date = date.today()
            if nota:
                self._resolution_note = nota
        self._updated_at = datetime.now()

    def to_dict(self, include_relations: bool = False) -> Dict:
        """
        Convierte el caso a diccionario para BD o API

        Args:
            include_relations: Si es True, incluye objetos relacionados (para API).
                              Si es False, solo campos de la tabla (para INSERT/UPDATE en BD)

        Returns:
            Diccionario con los datos del caso
        """
        data = {
            "usuario_id": self._usuario_id,
            "persona_id": self._persona_id,
            "fecha_desaparicion": self._fecha_desaparicion.isoformat() if isinstance(self._fecha_desaparicion, date) else self._fecha_desaparicion,
            "disappearanceTime": self._disappearance_time,
            "lugar_desaparicion": self._lugar_desaparicion,
            "lastSeenLocation": self._last_seen_location,
            "lastSeen": self._last_seen,
            "circumstances": self._circumstances,
            "description": self._description,
            "location": self._location,
            "status": self._estado.to_string(),
            "priority": self._priority,
            "reporterName": self._reporter_name,
            "relationship": self._relationship,
            "contactPhone": self._contact_phone,
            "contactEmail": self._contact_email,
            "additionalContact": self._additional_contact,
            "resolutionDate": self._resolution_date.isoformat() if isinstance(self._resolution_date, date) else self._resolution_date,
            "resolutionNote": self._resolution_note,
            "observaciones": self._observaciones
        }
        
        # Solo incluir id si existe (para updates, no para inserts)
        if self._id is not None:
            data["id"] = self._id
            
        # Solo incluir timestamps si existen
        if self._created_at is not None:
            data["created_at"] = self._created_at.isoformat() if isinstance(self._created_at, datetime) else self._created_at
        if self._updated_at is not None:
            data["updated_at"] = self._updated_at.isoformat() if isinstance(self._updated_at, datetime) else self._updated_at

        # SOLO para API (no para INSERT en BD): Incluir PersonaDesaparecida si existe y se solicita
        if include_relations and self._persona_desaparecida:
            data["PersonaDesaparecida"] = self._persona_desaparecida.to_dict()

        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'Caso':
        """
        Crea una instancia desde un diccionario de BD

        Args:
            data: Diccionario con datos del caso

        Returns:
            Instancia de Caso
        """
        # Convertir estado string a enum
        estado_str = data.get("status", "pendiente")
        estado = EstadoCaso.from_string(estado_str)

        # Crear PersonaDesaparecida si existe en el dict
        persona = None
        if "PersonaDesaparecida" in data and data["PersonaDesaparecida"]:
            persona = PersonaDesaparecida.from_dict(data["PersonaDesaparecida"])

        return cls(
            id=data.get("id"),
            usuario_id=data["usuario_id"],
            persona_id=data.get("persona_id"),
            persona_desaparecida=persona,
            fecha_desaparicion=data["fecha_desaparicion"],
            disappearance_time=data.get("disappearanceTime"),
            lugar_desaparicion=data["lugar_desaparicion"],
            last_seen_location=data.get("lastSeenLocation"),
            last_seen=data.get("lastSeen"),
            circumstances=data.get("circumstances"),
            description=data.get("description"),
            location=data.get("location"),
            estado=estado,
            priority=data.get("priority", "medium"),
            reporter_name=data.get("reporterName"),
            relationship=data.get("relationship"),
            contact_phone=data.get("contactPhone"),
            contact_email=data.get("contactEmail"),
            additional_contact=data.get("additionalContact"),
            resolution_date=data.get("resolutionDate"),
            resolution_note=data.get("resolutionNote"),
            observaciones=data.get("observaciones"),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        )

    def __repr__(self) -> str:
        return f"<Caso(id={self._id}, usuario_id={self._usuario_id}, estado={self._estado.value})>"
