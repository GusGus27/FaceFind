"""
Sistema de cola de notificaciones con prioridades
Gestiona el procesamiento ordenado de notificaciones
"""
from typing import Optional, List
from queue import PriorityQueue
from dataclasses import dataclass, field
from datetime import datetime
from threading import Lock
from models.notificacion import Notificacion
from models.enums import PrioridadAlerta


@dataclass(order=True)
class NotificacionConPrioridad:
    """
    Wrapper para notificaciones en cola de prioridad
    Se ordena primero por prioridad, luego por timestamp
    """
    prioridad: int = field(compare=True)
    timestamp: datetime = field(compare=True)
    notificacion: Notificacion = field(compare=False)

    @staticmethod
    def calcular_prioridad_numerica(prioridad: PrioridadAlerta) -> int:
        """
        Convierte prioridad a número (menor = más prioritario)
        
        Args:
            prioridad: Prioridad de la alerta
            
        Returns:
            Valor numérico (1=ALTA, 2=MEDIA, 3=BAJA)
        """
        if prioridad == PrioridadAlerta.ALTA:
            return 1
        elif prioridad == PrioridadAlerta.MEDIA:
            return 2
        else:
            return 3


class ColaNotificaciones:
    """
    Cola de prioridad para gestionar notificaciones
    Las notificaciones de alta prioridad se procesan primero
    """

    def __init__(self, max_size: int = 1000):
        """
        Constructor de la cola

        Args:
            max_size: Tamaño máximo de la cola
        """
        self._cola: PriorityQueue = PriorityQueue(maxsize=max_size)
        self._lock = Lock()
        self._procesadas: List[Notificacion] = []
        self._errores: List[tuple] = []  # (notificacion, error_msg)

    def encolar(self, notificacion: Notificacion) -> bool:
        """
        Añade una notificación a la cola

        Args:
            notificacion: Notificación a encolar

        Returns:
            True si se encoló correctamente
        """
        try:
            prioridad_num = NotificacionConPrioridad.calcular_prioridad_numerica(
                notificacion.prioridad
            )
            
            item = NotificacionConPrioridad(
                prioridad=prioridad_num,
                timestamp=notificacion.created_at,
                notificacion=notificacion
            )
            
            with self._lock:
                self._cola.put(item, block=False)
            
            return True
        except Exception as e:
            print(f"Error al encolar notificación: {str(e)}")
            return False

    def desencolar(self, timeout: Optional[float] = None) -> Optional[Notificacion]:
        """
        Obtiene la siguiente notificación de mayor prioridad

        Args:
            timeout: Tiempo máximo de espera en segundos

        Returns:
            Notificación o None si no hay ninguna
        """
        try:
            with self._lock:
                if self._cola.empty():
                    return None
                
                item = self._cola.get(block=True, timeout=timeout)
                return item.notificacion
        except Exception:
            return None

    def encolar_multiples(self, notificaciones: List[Notificacion]) -> int:
        """
        Encola múltiples notificaciones

        Args:
            notificaciones: Lista de notificaciones

        Returns:
            Número de notificaciones encoladas
        """
        encoladas = 0
        for notif in notificaciones:
            if self.encolar(notif):
                encoladas += 1
        return encoladas

    def marcar_como_procesada(self, notificacion: Notificacion) -> None:
        """
        Registra una notificación como procesada exitosamente

        Args:
            notificacion: Notificación procesada
        """
        with self._lock:
            self._procesadas.append(notificacion)
            # Mantener solo las últimas 100
            if len(self._procesadas) > 100:
                self._procesadas = self._procesadas[-100:]

    def marcar_como_error(self, notificacion: Notificacion, error_msg: str) -> None:
        """
        Registra una notificación con error

        Args:
            notificacion: Notificación que falló
            error_msg: Mensaje de error
        """
        with self._lock:
            self._errores.append((notificacion, error_msg))
            # Mantener solo los últimos 50 errores
            if len(self._errores) > 50:
                self._errores = self._errores[-50:]

    def obtener_estadisticas(self) -> dict:
        """
        Obtiene estadísticas de la cola

        Returns:
            Diccionario con estadísticas
        """
        with self._lock:
            return {
                "en_cola": self._cola.qsize(),
                "procesadas": len(self._procesadas),
                "errores": len(self._errores),
                "capacidad_maxima": self._cola.maxsize,
                "llena": self._cola.full()
            }

    def obtener_errores_recientes(self) -> List[dict]:
        """
        Obtiene lista de errores recientes

        Returns:
            Lista de diccionarios con errores
        """
        with self._lock:
            return [
                {
                    "notificacion_id": notif.id,
                    "tipo": notif.tipo.to_string(),
                    "error": error_msg,
                    "timestamp": notif.created_at.isoformat()
                }
                for notif, error_msg in self._errores
            ]

    def esta_vacia(self) -> bool:
        """
        Verifica si la cola está vacía

        Returns:
            True si está vacía
        """
        with self._lock:
            return self._cola.empty()

    def esta_llena(self) -> bool:
        """
        Verifica si la cola está llena

        Returns:
            True si está llena
        """
        with self._lock:
            return self._cola.full()

    def tamano(self) -> int:
        """
        Obtiene el tamaño actual de la cola

        Returns:
            Número de elementos en cola
        """
        with self._lock:
            return self._cola.qsize()

    def limpiar(self) -> None:
        """Limpia la cola y los registros"""
        with self._lock:
            while not self._cola.empty():
                try:
                    self._cola.get_nowait()
                except:
                    break
            self._procesadas.clear()
            self._errores.clear()

    def obtener_siguiente_sin_remover(self) -> Optional[Notificacion]:
        """
        Observa la siguiente notificación sin removerla de la cola
        
        Returns:
            Siguiente notificación o None
        """
        # Nota: PriorityQueue no tiene peek, esta es una aproximación
        with self._lock:
            if self._cola.empty():
                return None
            # Sacamos y volvemos a meter
            item = self._cola.get()
            self._cola.put(item)
            return item.notificacion

    def __len__(self) -> int:
        """Retorna el tamaño de la cola"""
        return self.tamano()

    def __repr__(self) -> str:
        stats = self.obtener_estadisticas()
        return f"<ColaNotificaciones(en_cola={stats['en_cola']}, procesadas={stats['procesadas']}, errores={stats['errores']})>"
