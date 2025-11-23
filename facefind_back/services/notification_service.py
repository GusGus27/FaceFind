"""
NotificationService - Servicio para gestión de notificaciones
Sistema de notificaciones en tiempo real para alertas y coincidencias
"""
from typing import List, Optional, Dict
from datetime import datetime
from services.supabase_client import supabase


class NotificationService:
    """
    Servicio para crear y gestionar notificaciones del sistema
    Integrado con el sistema de alertas según diagrama UML
    """

    @staticmethod
    def crear_notificacion(
        title: str,
        message: str,
        severity: str,
        usuario_id: Optional[int] = None,
        notification_type: str = "detection"
    ) -> Dict:
        """
        Crea una nueva notificación en el sistema

        Args:
            title: Título de la notificación (nombre de la persona)
            message: Mensaje descriptivo
            severity: Nivel de severidad (low, medium, high)
            usuario_id: ID del usuario destinatario (1 para admin por defecto)
            notification_type: Tipo de notificación (detection, alert, warning)

        Returns:
            Diccionario con la notificación creada
        """
        try:
            # Validar severity
            if severity not in ['low', 'medium', 'high']:
                severity = 'medium'
            
            # Validar type
            if notification_type not in ['detection', 'alert', 'warning']:
                notification_type = 'detection'
            
            data = {
                "title": title,
                "message": message,
                "severity": severity,
                "type": notification_type,
                "isRead": False,
                "timestamp": datetime.now().isoformat(),
                "usuario_id": usuario_id or 1  # Admin por defecto
            }

            response = supabase.table("Notificacion").insert(data).execute()

            if not response.data:
                raise Exception("Error creando notificación")

            print(f"✅ Notificación creada: {title}")
            return response.data[0]

        except Exception as e:
            print(f"❌ Error creando notificación: {e}")
            raise

    @staticmethod
    def crear_notificacion_coincidencia(
        caso_id: int,
        alerta_id: int,
        confidence: float,
        ubicacion: str,
        timestamp: datetime
    ) -> Dict:
        """
        Crea una notificación específica para coincidencia detectada

        Args:
            caso_id: ID del caso
            alerta_id: ID de la alerta
            confidence: Nivel de confianza (0.0 - 1.0)
            ubicacion: Ubicación de la detección
            timestamp: Fecha y hora de la detección

        Returns:
            Diccionario con la notificación creada
        """
        # Determinar severidad según nivel de confianza
        if confidence >= 0.85:
            severity = "urgent"
        elif confidence >= 0.60:
            severity = "high"
        else:
            severity = "medium"

        # Formatear confianza como porcentaje
        confidence_percent = int(confidence * 100)

        title = f"🎯 Coincidencia detectada - {confidence_percent}% similitud"
        message = f"Se detectó una posible coincidencia para el caso #{caso_id} en {ubicacion} a las {timestamp.strftime('%H:%M:%S')}"

        return NotificationService.crear_notificacion(
            title=title,
            message=message,
            severity=severity
        )

    @staticmethod
    def obtener_notificaciones(
        usuario_id: Optional[int] = None,
        solo_no_leidas: bool = False,
        limit: int = 50
    ) -> List[Dict]:
        """
        Obtiene notificaciones del sistema

        Args:
            usuario_id: Filtrar por usuario (None para todas)
            solo_no_leidas: Solo notificaciones no leídas
            limit: Número máximo de notificaciones

        Returns:
            Lista de notificaciones
        """
        try:
            query = supabase.table("Notificacion").select("*")

            # Filtrar por usuario si se especifica, sino mostrar TODAS (admin ve todo)
            if usuario_id:
                query = query.eq("usuario_id", usuario_id)

            # Filtrar solo no leídas si se solicita
            if solo_no_leidas:
                query = query.eq("isRead", False)

            # Ordenar por timestamp descendente y limitar
            response = query.order("timestamp", desc=True).limit(limit).execute()

            if not response.data:
                return []

            return response.data

        except Exception as e:
            print(f"❌ Error obteniendo notificaciones: {e}")
            return []

    @staticmethod
    def marcar_como_leida(notificacion_id: int) -> bool:
        """
        Marca una notificación como leída

        Args:
            notificacion_id: ID de la notificación

        Returns:
            True si se actualizó correctamente
        """
        try:
            supabase.table("Notificacion").update({
                "isRead": True
            }).eq("id", notificacion_id).execute()

            print(f"✅ Notificación {notificacion_id} marcada como leída")
            return True

        except Exception as e:
            print(f"❌ Error marcando notificación como leída: {e}")
            return False

    @staticmethod
    def marcar_todas_como_leidas(usuario_id: Optional[int] = None) -> bool:
        """
        Marca todas las notificaciones como leídas

        Args:
            usuario_id: ID del usuario (None para todas las notificaciones globales)

        Returns:
            True si se actualizaron correctamente
        """
        try:
            query = supabase.table("Notificacion").update({"isRead": True})

            if usuario_id:
                query = query.eq("usuario_id", usuario_id)

            query.execute()

            print(f"✅ Todas las notificaciones marcadas como leídas")
            return True

        except Exception as e:
            print(f"❌ Error marcando todas como leídas: {e}")
            return False

    @staticmethod
    def eliminar_notificacion(notificacion_id: int) -> bool:
        """
        Elimina una notificación

        Args:
            notificacion_id: ID de la notificación

        Returns:
            True si se eliminó correctamente
        """
        try:
            supabase.table("Notificacion").delete().eq("id", notificacion_id).execute()

            print(f"✅ Notificación {notificacion_id} eliminada")
            return True

        except Exception as e:
            print(f"❌ Error eliminando notificación: {e}")
            return False

    @staticmethod
    def contar_no_leidas(usuario_id: Optional[int] = None) -> int:
        """
        Cuenta las notificaciones no leídas

        Args:
            usuario_id: ID del usuario (None para notificaciones globales)

        Returns:
            Número de notificaciones no leídas
        """
        try:
            query = supabase.table("Notificacion").select("id", count="exact").eq("isRead", False)

            if usuario_id:
                query = query.eq("usuario_id", usuario_id)

            response = query.execute()

            return response.count if hasattr(response, 'count') else len(response.data)

        except Exception as e:
            print(f"❌ Error contando notificaciones no leídas: {e}")
            return 0

    @staticmethod
    def obtener_historial_notificaciones(
        fecha_inicio: Optional[datetime] = None,
        fecha_fin: Optional[datetime] = None,
        severity: Optional[str] = None
    ) -> List[Dict]:
        """
        Obtiene historial de notificaciones con filtros

        Args:
            fecha_inicio: Fecha de inicio del rango
            fecha_fin: Fecha de fin del rango
            severity: Filtrar por severidad

        Returns:
            Lista de notificaciones del historial
        """
        try:
            query = supabase.table("Notificacion").select("*")

            if fecha_inicio:
                query = query.gte("timestamp", fecha_inicio.isoformat())
            if fecha_fin:
                query = query.lte("timestamp", fecha_fin.isoformat())
            if severity:
                query = query.eq("severity", severity)

            response = query.order("timestamp", desc=True).execute()

            return response.data if response.data else []

        except Exception as e:
            print(f"❌ Error obteniendo historial de notificaciones: {e}")
            return []
