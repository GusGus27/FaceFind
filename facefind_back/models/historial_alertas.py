"""
Clase HistorialAlertas según diagrama UML
Gestiona el historial y lista de alertas del sistema
"""
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from .alerta import Alerta
from .enums import EstadoAlerta, PrioridadAlerta


class HistorialAlertas:
    """
    Clase para gestionar el historial de alertas
    Según diagrama UML: listaAlertas[], getLista(), anadirNoti()
    """

    def __init__(self):
        """Constructor del historial de alertas"""
        self._lista_alertas: List[Alerta] = []

    @property
    def listaAlertas(self) -> List[Alerta]:
        """
        Getter de la lista de alertas
        Propiedad pública según diagrama UML
        """
        return self._lista_alertas

    def getLista(self) -> List[Alerta]:
        """
        Obtiene la lista completa de alertas
        Método público según diagrama UML

        Returns:
            Array de Alertas
        """
        return self._lista_alertas.copy()

    def anadirNoti(self, alerta: Alerta) -> bool:
        """
        Añade una alerta al historial
        Método público según diagrama UML

        Args:
            alerta: Alerta a añadir

        Returns:
            True si se añadió correctamente
        """
        if alerta is None:
            return False
        
        # Evitar duplicados por ID
        if alerta.id and any(a.id == alerta.id for a in self._lista_alertas):
            return False
        
        self._lista_alertas.append(alerta)
        return True

    def obtener_por_caso(self, caso_id: int) -> List[Alerta]:
        """
        Obtiene todas las alertas de un caso específico

        Args:
            caso_id: ID del caso

        Returns:
            Lista de alertas del caso
        """
        return [a for a in self._lista_alertas if a.caso_id == caso_id]

    def obtener_por_prioridad(self, prioridad: PrioridadAlerta) -> List[Alerta]:
        """
        Filtra alertas por prioridad

        Args:
            prioridad: Prioridad a filtrar

        Returns:
            Lista de alertas con esa prioridad
        """
        return [a for a in self._lista_alertas if a.prioridad == prioridad]

    def obtener_por_estado(self, estado: EstadoAlerta) -> List[Alerta]:
        """
        Filtra alertas por estado

        Args:
            estado: Estado a filtrar

        Returns:
            Lista de alertas con ese estado
        """
        return [a for a in self._lista_alertas if a.estado == estado]

    def obtener_pendientes(self) -> List[Alerta]:
        """
        Obtiene alertas pendientes de revisión

        Returns:
            Lista de alertas pendientes
        """
        return self.obtener_por_estado(EstadoAlerta.PENDIENTE)

    def obtener_recientes(self, horas: int = 24) -> List[Alerta]:
        """
        Obtiene alertas recientes en las últimas N horas

        Args:
            horas: Número de horas hacia atrás

        Returns:
            Lista de alertas recientes
        """
        limite = datetime.now() - timedelta(hours=horas)
        return [a for a in self._lista_alertas 
                if isinstance(a.timestamp, datetime) and a.timestamp >= limite]

    def obtener_alta_prioridad(self) -> List[Alerta]:
        """
        Obtiene solo alertas de alta prioridad

        Returns:
            Lista de alertas de alta prioridad
        """
        return self.obtener_por_prioridad(PrioridadAlerta.ALTA)

    def obtener_por_rango_fechas(self, 
                                  fecha_inicio: datetime, 
                                  fecha_fin: datetime) -> List[Alerta]:
        """
        Obtiene alertas en un rango de fechas

        Args:
            fecha_inicio: Fecha inicial
            fecha_fin: Fecha final

        Returns:
            Lista de alertas en el rango
        """
        return [a for a in self._lista_alertas 
                if isinstance(a.timestamp, datetime) and 
                fecha_inicio <= a.timestamp <= fecha_fin]

    def obtener_por_camara(self, camara_id: int) -> List[Alerta]:
        """
        Obtiene alertas de una cámara específica

        Args:
            camara_id: ID de la cámara

        Returns:
            Lista de alertas de esa cámara
        """
        return [a for a in self._lista_alertas if a.camara_id == camara_id]

    def contar_por_prioridad(self) -> Dict[str, int]:
        """
        Cuenta alertas agrupadas por prioridad

        Returns:
            Diccionario con conteo por prioridad
        """
        conteo = {
            "ALTA": 0,
            "MEDIA": 0,
            "BAJA": 0
        }
        
        for alerta in self._lista_alertas:
            prioridad_str = alerta.prioridad.to_string()
            conteo[prioridad_str] = conteo.get(prioridad_str, 0) + 1
        
        return conteo

    def contar_por_estado(self) -> Dict[str, int]:
        """
        Cuenta alertas agrupadas por estado

        Returns:
            Diccionario con conteo por estado
        """
        conteo = {
            "PENDIENTE": 0,
            "REVISADA": 0,
            "FALSO_POSITIVO": 0
        }
        
        for alerta in self._lista_alertas:
            estado_str = alerta.estado.to_string()
            conteo[estado_str] = conteo.get(estado_str, 0) + 1
        
        return conteo

    def obtener_estadisticas(self) -> Dict:
        """
        Obtiene estadísticas del historial

        Returns:
            Diccionario con estadísticas
        """
        total = len(self._lista_alertas)
        
        if total == 0:
            return {
                "total": 0,
                "por_prioridad": {},
                "por_estado": {},
                "recientes_24h": 0,
                "pendientes": 0
            }
        
        return {
            "total": total,
            "por_prioridad": self.contar_por_prioridad(),
            "por_estado": self.contar_por_estado(),
            "recientes_24h": len(self.obtener_recientes(24)),
            "pendientes": len(self.obtener_pendientes())
        }

    def ordenar_por_prioridad(self) -> List[Alerta]:
        """
        Ordena alertas por prioridad (ALTA > MEDIA > BAJA)

        Returns:
            Lista ordenada de alertas
        """
        orden_prioridad = {
            PrioridadAlerta.ALTA: 3,
            PrioridadAlerta.MEDIA: 2,
            PrioridadAlerta.BAJA: 1
        }
        
        return sorted(self._lista_alertas, 
                     key=lambda a: orden_prioridad.get(a.prioridad, 0), 
                     reverse=True)

    def ordenar_por_fecha(self, descendente: bool = True) -> List[Alerta]:
        """
        Ordena alertas por fecha

        Args:
            descendente: True para más recientes primero

        Returns:
            Lista ordenada de alertas
        """
        return sorted(self._lista_alertas, 
                     key=lambda a: a.timestamp if isinstance(a.timestamp, datetime) else datetime.min,
                     reverse=descendente)

    def limpiar(self) -> None:
        """Limpia el historial completo"""
        self._lista_alertas.clear()

    def remover_por_id(self, alerta_id: int) -> bool:
        """
        Remueve una alerta específica por ID

        Args:
            alerta_id: ID de la alerta a remover

        Returns:
            True si se removió correctamente
        """
        inicial = len(self._lista_alertas)
        self._lista_alertas = [a for a in self._lista_alertas if a.id != alerta_id]
        return len(self._lista_alertas) < inicial

    def remover_antiguas(self, dias: int = 30) -> int:
        """
        Remueve alertas más antiguas que N días

        Args:
            dias: Número de días de antigüedad

        Returns:
            Número de alertas removidas
        """
        limite = datetime.now() - timedelta(days=dias)
        inicial = len(self._lista_alertas)
        
        self._lista_alertas = [a for a in self._lista_alertas 
                              if isinstance(a.timestamp, datetime) and a.timestamp >= limite]
        
        return inicial - len(self._lista_alertas)

    def to_dict_list(self) -> List[Dict]:
        """
        Convierte el historial a lista de diccionarios

        Returns:
            Lista de diccionarios con alertas
        """
        return [alerta.to_dict() for alerta in self._lista_alertas]

    def cargar_desde_lista(self, alertas: List[Alerta]) -> int:
        """
        Carga múltiples alertas al historial

        Args:
            alertas: Lista de alertas a cargar

        Returns:
            Número de alertas añadidas
        """
        añadidas = 0
        for alerta in alertas:
            if self.anadirNoti(alerta):
                añadidas += 1
        return añadidas

    def __len__(self) -> int:
        """Retorna el número de alertas en el historial"""
        return len(self._lista_alertas)

    def __repr__(self) -> str:
        return f"<HistorialAlertas(total={len(self._lista_alertas)})>"
