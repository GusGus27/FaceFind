"""
AlertaService - Servicio para gestión de alertas
Según diagrama UML: +crearAlerta(Date,float,String,ICamera,String,Frame):Alerta
"""
from typing import Optional, List, Dict
from datetime import datetime
from models.alerta import Alerta
from models.frame import Frame
from models.enums import EstadoAlerta, PrioridadAlerta
from models.historial_alertas import HistorialAlertas
from services.supabase_client import supabase


class AlertaService:
    """
    Servicio para crear y gestionar alertas del sistema
    Según diagrama UML
    """
    
    # Instancia singleton del historial de alertas
    _historial = HistorialAlertas()

    @staticmethod
    def crearAlerta(
        timestamp: datetime,
        confidence: float,
        ubicacion: str,
        camara_id: int,
        caso_id: int,
        frame: Frame
    ) -> Alerta:
        """
        Crea una nueva alerta en el sistema
        Según UML: +crearAlerta(Date,float,String,ICamera,String,Frame):Alerta

        Args:
            timestamp: Fecha y hora de la detección
            confidence: Nivel de confianza/similitud (0.0 - 1.0)
            ubicacion: Ubicación de la cámara
            camara_id: ID de la cámara (ICamera en UML)
            caso_id: ID del caso asociado
            frame: Frame capturado

        Returns:
            Alerta creada
        """
        # Calcular prioridad basada en la similitud
        if confidence >= 0.85:
            prioridad = PrioridadAlerta.ALTA
        elif confidence >= 0.70:
            prioridad = PrioridadAlerta.MEDIA
        else:
            prioridad = PrioridadAlerta.BAJA

        # Crear objeto Alerta
        alerta = Alerta(
            caso_id=caso_id,
            camara_id=camara_id,
            timestamp=timestamp,
            similitud=confidence,
            prioridad=prioridad,
            estado=EstadoAlerta.PENDIENTE,
            ubicacion=ubicacion,
            imagen_captura=frame,
            imagen_bytes=frame.to_bytes() if frame else None
        )

        # Guardar en base de datos
        try:
            alerta_guardada = AlertaService._guardar_en_bd(alerta)
            
            # Añadir al historial
            AlertaService._historial.anadirNoti(alerta_guardada)
            
            # Procesar notificaciones
            AlertaService._procesar_notificaciones(alerta_guardada)
            
            return alerta_guardada
        except Exception as e:
            print(f"Error guardando alerta: {e}")
            raise

    @staticmethod
    def _guardar_en_bd(alerta: Alerta) -> Alerta:
        """
        Guarda la alerta en la base de datos

        Args:
            alerta: Objeto Alerta a guardar

        Returns:
            Alerta con ID asignado
        """
        data = {
            "caso_id": alerta.caso_id,
            "camara_id": alerta.camara_id,
            "timestamp": alerta.timestamp.isoformat() if isinstance(alerta.timestamp, datetime) else alerta.timestamp,
            "similitud": alerta.similitud,
            "ubicacion": alerta.ubicacion,
            "estado": alerta.estado.to_string(),
            "prioridad": alerta.prioridad.to_string(),
            "imagen": alerta.imagen_bytes
        }

        response = supabase.table("Alerta").insert(data).execute()

        if not response.data:
            raise Exception("Error guardando alerta en BD")

        # Crear nueva instancia con el ID asignado
        alerta_data = response.data[0]
        return Alerta.from_dict(alerta_data)

    @staticmethod
    def obtener_alerta_por_id(alerta_id: int) -> Optional[Alerta]:
        """
        Obtiene una alerta por su ID

        Args:
            alerta_id: ID de la alerta

        Returns:
            Alerta o None si no existe
        """
        try:
            response = supabase.table("Alerta").select("*").eq("id", alerta_id).single().execute()

            if not response.data:
                return None

            return Alerta.from_dict(response.data)
        except Exception as e:
            print(f"Error obteniendo alerta: {e}")
            return None

    @staticmethod
    def obtener_alertas_por_caso(caso_id: int) -> List[Alerta]:
        """
        Obtiene todas las alertas de un caso

        Args:
            caso_id: ID del caso

        Returns:
            Lista de alertas
        """
        try:
            response = supabase.table("Alerta").select("*").eq("caso_id", caso_id).order("timestamp", desc=True).execute()

            if not response.data:
                return []

            return [Alerta.from_dict(data) for data in response.data]
        except Exception as e:
            print(f"Error obteniendo alertas del caso: {e}")
            return []

    @staticmethod
    def obtener_alertas_pendientes() -> List[Alerta]:
        """
        Obtiene todas las alertas pendientes de revisión

        Returns:
            Lista de alertas pendientes
        """
        try:
            response = supabase.table("Alerta").select("*").eq("estado", "PENDIENTE").order("timestamp", desc=True).execute()

            if not response.data:
                return []

            return [Alerta.from_dict(data) for data in response.data]
        except Exception as e:
            print(f"Error obteniendo alertas pendientes: {e}")
            return []

    @staticmethod
    def obtener_alertas_alta_prioridad() -> List[Alerta]:
        """
        Obtiene todas las alertas de alta prioridad

        Returns:
            Lista de alertas de alta prioridad
        """
        try:
            response = supabase.table("Alerta").select("*").eq("prioridad", "ALTA").order("timestamp", desc=True).execute()

            if not response.data:
                return []

            return [Alerta.from_dict(data) for data in response.data]
        except Exception as e:
            print(f"Error obteniendo alertas de alta prioridad: {e}")
            return []

    @staticmethod
    def actualizar_estado_alerta(alerta_id: int, nuevo_estado: EstadoAlerta) -> bool:
        """
        Actualiza el estado de una alerta

        Args:
            alerta_id: ID de la alerta
            nuevo_estado: Nuevo estado

        Returns:
            True si se actualizó correctamente
        """
        try:
            supabase.table("Alerta").update({
                "estado": nuevo_estado.to_string()
            }).eq("id", alerta_id).execute()
            return True
        except Exception as e:
            print(f"Error actualizando estado de alerta: {e}")
            return False

    @staticmethod
    def marcar_como_revisada(alerta_id: int) -> bool:
        """
        Marca una alerta como revisada

        Args:
            alerta_id: ID de la alerta

        Returns:
            True si se marcó correctamente
        """
        return AlertaService.actualizar_estado_alerta(alerta_id, EstadoAlerta.REVISADA)

    @staticmethod
    def marcar_como_falso_positivo(alerta_id: int) -> bool:
        """
        Marca una alerta como falso positivo

        Args:
            alerta_id: ID de la alerta

        Returns:
            True si se marcó correctamente
        """
        return AlertaService.actualizar_estado_alerta(alerta_id, EstadoAlerta.FALSO_POSITIVO)

    @staticmethod
    def obtener_estadisticas_alertas() -> Dict:
        """
        Obtiene estadísticas de alertas

        Returns:
            Diccionario con estadísticas
        """
        try:
            response = supabase.table("Alerta").select("estado, prioridad").execute()

            if not response.data:
                return {
                    "total": 0,
                    "por_estado": {},
                    "por_prioridad": {}
                }

            data = response.data
            stats = {
                "total": len(data),
                "por_estado": {},
                "por_prioridad": {}
            }

            for alerta in data:
                estado = alerta.get("estado", "PENDIENTE")
                prioridad = alerta.get("prioridad", "MEDIA")

                stats["por_estado"][estado] = stats["por_estado"].get(estado, 0) + 1
                stats["por_prioridad"][prioridad] = stats["por_prioridad"].get(prioridad, 0) + 1

            return stats
        except Exception as e:
            print(f"Error obteniendo estadísticas de alertas: {e}")
            return {"total": 0, "por_estado": {}, "por_prioridad": {}}

    @staticmethod
    def _procesar_notificaciones(alerta: Alerta) -> None:
        """
        Procesa notificaciones para una alerta
        Envía notificaciones según prioridad

        Args:
            alerta: Alerta que generó las notificaciones
        """
        try:
            from services.notification_service import notification_service
            
            # Obtener emails de administradores
            admin_emails = AlertaService._obtener_emails_administradores()
            
            # Procesar alerta y crear notificaciones
            notification_service.procesar_alerta(alerta, admin_emails)
            
        except Exception as e:
            print(f"Error procesando notificaciones: {e}")

    @staticmethod
    def _obtener_emails_administradores() -> List[str]:
        """
        Obtiene los emails de todos los administradores

        Returns:
            Lista de emails
        """
        try:
            response = supabase.table("Usuario")\
                .select("email")\
                .eq("rol", "admin")\
                .execute()
            
            if response.data:
                return [user["email"] for user in response.data if user.get("email")]
            
            return []
        except Exception as e:
            print(f"Error obteniendo emails de administradores: {e}")
            return []

    @staticmethod
    def obtener_historial() -> HistorialAlertas:
        """
        Obtiene el historial de alertas

        Returns:
            Instancia de HistorialAlertas
        """
        return AlertaService._historial

    @staticmethod
    def cargar_historial_desde_bd(limite: int = 100) -> int:
        """
        Carga el historial de alertas desde la base de datos

        Args:
            limite: Número máximo de alertas a cargar

        Returns:
            Número de alertas cargadas
        """
        try:
            response = supabase.table("Alerta")\
                .select("*")\
                .order("timestamp", desc=True)\
                .limit(limite)\
                .execute()
            
            if response.data:
                alertas = [Alerta.from_dict(data) for data in response.data]
                return AlertaService._historial.cargar_desde_lista(alertas)
            
            return 0
        except Exception as e:
            print(f"Error cargando historial: {e}")
            return 0
