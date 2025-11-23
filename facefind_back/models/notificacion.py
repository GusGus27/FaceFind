"""
Modelo de Notificación
Sistema de notificaciones para alertas y coincidencias
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Notificacion:
    """
    Clase que representa una notificación del sistema
    Según historia de usuario: Sistema de alertas y notificaciones
    """
    id: Optional[int]
    title: str
    message: str
    severity: str  # low, medium, high, urgent
    isRead: bool
    timestamp: datetime
    usuario_id: Optional[int]
    created_at: Optional[datetime]

    def __post_init__(self):
        """Validaciones post-inicialización"""
        if self.severity not in ['low', 'medium', 'high', 'urgent']:
            raise ValueError(f"Severidad inválida: {self.severity}")

    @staticmethod
    def from_dict(data: dict) -> 'Notificacion':
        """
        Crea una instancia de Notificacion desde un diccionario

        Args:
            data: Diccionario con datos de la notificación

        Returns:
            Instancia de Notificacion
        """
        # Convertir timestamps si son strings
        timestamp = data.get('timestamp')
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))

        created_at = data.get('created_at')
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))

        return Notificacion(
            id=data.get('id'),
            title=data.get('title'),
            message=data.get('message'),
            severity=data.get('severity', 'medium'),
            isRead=data.get('isRead', False),
            timestamp=timestamp,
            usuario_id=data.get('usuario_id'),
            created_at=created_at
        )

    def to_dict(self) -> dict:
        """
        Convierte la notificación a diccionario

        Returns:
            Diccionario con datos de la notificación
        """
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'severity': self.severity,
            'isRead': self.isRead,
            'timestamp': self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp,
            'usuario_id': self.usuario_id,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }

    def marcar_como_leida(self) -> None:
        """Marca la notificación como leída"""
        self.isRead = True

    def es_urgente(self) -> bool:
        """
        Verifica si la notificación es urgente

        Returns:
            True si la severidad es urgent
        """
        return self.severity == 'urgent'

    def es_alta_prioridad(self) -> bool:
        """
        Verifica si la notificación es de alta prioridad

        Returns:
            True si la severidad es high o urgent
        """
        return self.severity in ['high', 'urgent']
