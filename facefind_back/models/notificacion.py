"""
Clase Notificacion según diagrama UML
Representa una notificación generada por una alerta
"""
from typing import Optional, Dict
from datetime import datetime
from enum import Enum


class TipoNotificacion(Enum):
    """Tipos de notificación"""
    EMAIL = "email"
    DASHBOARD = "dashboard"
    
    @classmethod
    def from_string(cls, tipo_str: str):
        """Convierte string a enum"""
        mapping = {
            "email": cls.EMAIL,
            "dashboard": cls.DASHBOARD
        }
        return mapping.get(tipo_str.lower(), cls.DASHBOARD)
    
    def to_string(self) -> str:
        """Convierte enum a string"""
        return self.value


class EstadoNotificacion(Enum):
    """Estados de una notificación"""
    PENDIENTE = "PENDIENTE"
    ENVIADA = "ENVIADA"
    LEIDA = "LEIDA"
    ERROR = "ERROR"
    
    @classmethod
    def from_string(cls, estado_str: str):
        """Convierte string a enum"""
        mapping = {
            "PENDIENTE": cls.PENDIENTE,
            "ENVIADA": cls.ENVIADA,
            "LEIDA": cls.LEIDA,
            "ERROR": cls.ERROR
        }
        return mapping.get(estado_str.upper(), cls.PENDIENTE)
    
    def to_string(self) -> str:
        """Convierte enum a string"""
        return self.value


class Notificacion:
    """
    Notificación generada a partir de una alerta
    Puede ser de tipo email o dashboard (real-time)
    """

    def __init__(self,
                 alerta: 'Alerta',
                 tipo: TipoNotificacion,
                 prioridad: 'PrioridadAlerta',
                 id: Optional[int] = None,
                 estado: EstadoNotificacion = EstadoNotificacion.PENDIENTE,
                 destinatario: Optional[str] = None,
                 asunto: Optional[str] = None,
                 contenido: Optional[str] = None,
                 enviada_en: Optional[datetime] = None,
                 leida_en: Optional[datetime] = None,
                 created_at: Optional[datetime] = None):
        """
        Constructor de Notificacion

        Args:
            alerta: Alerta que generó la notificación
            tipo: Tipo de notificación (EMAIL, DASHBOARD)
            prioridad: Prioridad heredada de la alerta
            id: ID en base de datos
            estado: Estado actual de la notificación
            destinatario: Email del destinatario (para tipo EMAIL)
            asunto: Asunto del mensaje
            contenido: Contenido de la notificación
            enviada_en: Timestamp de envío
            leida_en: Timestamp de lectura
            created_at: Fecha de creación
        """
        self._id = id
        self._alerta = alerta
        self._tipo = tipo
        self._prioridad = prioridad
        self._estado = estado
        self._destinatario = destinatario
        self._asunto = asunto or self._generar_asunto()
        self._contenido = contenido or self._generar_contenido()
        self._enviada_en = enviada_en
        self._leida_en = leida_en
        self._created_at = created_at or datetime.now()

    @property
    def id(self) -> Optional[int]:
        return self._id

    @property
    def alerta(self) -> 'Alerta':
        return self._alerta

    @property
    def alerta_id(self) -> Optional[int]:
        return self._alerta.id if self._alerta else None

    @property
    def tipo(self) -> TipoNotificacion:
        return self._tipo

    @property
    def prioridad(self) -> 'PrioridadAlerta':
        return self._prioridad

    @property
    def estado(self) -> EstadoNotificacion:
        return self._estado

    @property
    def destinatario(self) -> Optional[str]:
        return self._destinatario

    @property
    def asunto(self) -> str:
        return self._asunto

    @property
    def contenido(self) -> str:
        return self._contenido

    @property
    def enviada_en(self) -> Optional[datetime]:
        return self._enviada_en

    @property
    def leida_en(self) -> Optional[datetime]:
        return self._leida_en

    @property
    def created_at(self) -> datetime:
        return self._created_at

    @estado.setter
    def estado(self, value: EstadoNotificacion):
        self._estado = value

    @destinatario.setter
    def destinatario(self, value: str):
        self._destinatario = value

    def _generar_asunto(self) -> str:
        """
        Genera el asunto de la notificación según la prioridad

        Returns:
            Asunto generado
        """
        from .enums import PrioridadAlerta
        
        if self._prioridad == PrioridadAlerta.ALTA:
            return f"🚨 ALERTA URGENTE - Coincidencia de alta confianza detectada"
        elif self._prioridad == PrioridadAlerta.MEDIA:
            return f"⚠️ ALERTA - Posible coincidencia detectada"
        else:
            return f"ℹ️ Notificación - Detección registrada"

    def _generar_contenido(self) -> str:
        """
        Genera el contenido de la notificación

        Returns:
            Contenido generado
        """
        timestamp_str = self._alerta.timestamp.strftime("%d/%m/%Y %H:%M:%S")
        similitud_pct = self._alerta.similitud * 100
        
        contenido = f"""
Detección de coincidencia facial

Detalles de la detección:
- Caso ID: #{self._alerta.caso_id}
- Hora: {timestamp_str}
- Nivel de coincidencia: {similitud_pct:.1f}%
- Ubicación: {self._alerta.ubicacion or 'No especificada'}
- Cámara ID: #{self._alerta.camara_id}
- Prioridad: {self._prioridad.to_string()}

Por favor, revise la alerta en el dashboard para más detalles.
        """
        
        return contenido.strip()

    def generar_template_email(self) -> Dict:
        """
        Genera el template HTML para envío por email

        Returns:
            Diccionario con asunto y cuerpo HTML
        """
        timestamp_str = self._alerta.timestamp.strftime("%d/%m/%Y %H:%M:%S")
        similitud_pct = self._alerta.similitud * 100
        
        # Color según prioridad
        from .enums import PrioridadAlerta
        if self._prioridad == PrioridadAlerta.ALTA:
            color = "#dc3545"  # Rojo
            icono = "🚨"
        elif self._prioridad == PrioridadAlerta.MEDIA:
            color = "#ffc107"  # Amarillo
            icono = "⚠️"
        else:
            color = "#17a2b8"  # Azul
            icono = "ℹ️"

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }}
                .container {{ background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }}
                .header {{ background-color: {color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
                .content {{ padding: 20px; }}
                .detail {{ margin: 10px 0; padding: 10px; background-color: #f8f9fa; border-left: 4px solid {color}; }}
                .detail strong {{ color: {color}; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: {color}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>{icono} {self._asunto}</h2>
                </div>
                <div class="content">
                    <p>Se ha detectado una coincidencia facial que requiere su atención.</p>
                    
                    <div class="detail">
                        <strong>Caso:</strong> #{self._alerta.caso_id}
                    </div>
                    
                    <div class="detail">
                        <strong>Fecha y hora:</strong> {timestamp_str}
                    </div>
                    
                    <div class="detail">
                        <strong>Nivel de coincidencia:</strong> {similitud_pct:.1f}%
                    </div>
                    
                    <div class="detail">
                        <strong>Ubicación:</strong> {self._alerta.ubicacion or 'No especificada'}
                    </div>
                    
                    <div class="detail">
                        <strong>Cámara:</strong> #{self._alerta.camara_id}
                    </div>
                    
                    <div class="detail">
                        <strong>Prioridad:</strong> {self._prioridad.to_string()}
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="{{dashboard_url}}" class="button">Ver en Dashboard</a>
                    </p>
                </div>
                <div class="footer">
                    <p>FaceFind - Sistema de Búsqueda de Personas Desaparecidas</p>
                    <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return {
            "asunto": self._asunto,
            "html_body": html_body,
            "texto_plano": self._contenido
        }

    def generar_template_dashboard(self) -> Dict:
        """
        Genera el template para mostrar en dashboard (real-time)

        Returns:
            Diccionario con datos para dashboard
        """
        return {
            "id": self._id,
            "titulo": self._asunto,
            "mensaje": self._contenido,
            "tipo": self._tipo.to_string(),
            "prioridad": self._prioridad.to_string(),
            "timestamp": self._created_at.isoformat(),
            "alerta_id": self.alerta_id,
            "caso_id": self._alerta.caso_id,
            "similitud": self._alerta.similitud,
            "ubicacion": self._alerta.ubicacion,
            "leida": self._leida_en is not None
        }

    def marcar_como_enviada(self) -> None:
        """Marca la notificación como enviada"""
        self._estado = EstadoNotificacion.ENVIADA
        self._enviada_en = datetime.now()

    def marcar_como_leida(self) -> None:
        """Marca la notificación como leída"""
        self._estado = EstadoNotificacion.LEIDA
        self._leida_en = datetime.now()

    def marcar_como_error(self) -> None:
        """Marca la notificación como error en envío"""
        self._estado = EstadoNotificacion.ERROR

    def requiere_email(self) -> bool:
        """
        Determina si la notificación debe enviarse por email
        Solo se envía email para prioridades altas o medias

        Returns:
            True si requiere envío por email
        """
        from .enums import PrioridadAlerta
        return (self._tipo == TipoNotificacion.EMAIL and 
                self._prioridad in [PrioridadAlerta.ALTA, PrioridadAlerta.MEDIA])

    def to_dict(self) -> Dict:
        """
        Convierte la notificación a diccionario

        Returns:
            Diccionario con los datos
        """
        return {
            "id": self._id,
            "alerta_id": self.alerta_id,
            "tipo": self._tipo.to_string(),
            "prioridad": self._prioridad.to_string(),
            "estado": self._estado.to_string(),
            "destinatario": self._destinatario,
            "asunto": self._asunto,
            "contenido": self._contenido,
            "enviada_en": self._enviada_en.isoformat() if self._enviada_en else None,
            "leida_en": self._leida_en.isoformat() if self._leida_en else None,
            "created_at": self._created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict, alerta: 'Alerta') -> 'Notificacion':
        """
        Crea una instancia desde un diccionario

        Args:
            data: Diccionario con datos
            alerta: Instancia de Alerta

        Returns:
            Instancia de Notificacion
        """
        from .enums import PrioridadAlerta
        
        tipo = TipoNotificacion.from_string(data.get("tipo", "dashboard"))
        prioridad = PrioridadAlerta.from_string(data.get("prioridad", "MEDIA"))
        estado = EstadoNotificacion.from_string(data.get("estado", "PENDIENTE"))
        
        return cls(
            id=data.get("id"),
            alerta=alerta,
            tipo=tipo,
            prioridad=prioridad,
            estado=estado,
            destinatario=data.get("destinatario"),
            asunto=data.get("asunto"),
            contenido=data.get("contenido"),
            enviada_en=data.get("enviada_en"),
            leida_en=data.get("leida_en"),
            created_at=data.get("created_at")
        )

    def __repr__(self) -> str:
        return f"<Notificacion(id={self._id}, tipo={self._tipo.value}, prioridad={self._prioridad.value}, estado={self._estado.value})>"
