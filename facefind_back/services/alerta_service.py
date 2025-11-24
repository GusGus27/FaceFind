"""
AlertaService - Servicio para gestión de alertas
Según diagrama UML: +crearAlerta(Date,float,float,float,ICamera,String,Frame,boolean):Alerta
                    +getAlertasPorFecha(Date,Date):List<Alerta>
                    +getAlertasPorCamara(ICamera):List<Alerta>
                    +getAlertasPorCaso(Caso):List<Alerta>
"""
from typing import Optional, List, Dict
from datetime import datetime
from models.alerta import Alerta
from models.frame import Frame
from models.enums import EstadoAlerta, PrioridadAlerta
from services.supabase_client import supabase
from services.notification_service import NotificationService
from services.evidencia_service import EvidenciaService


class AlertaService:
    """
    Servicio para crear y gestionar alertas del sistema
    Según diagrama UML
    """

    @staticmethod
    def crearAlerta(
        timestamp: datetime,
        confidence: float,
        latitud: float,
        longitud: float,
        camara_id: int,
        status: str,
        caso_id: int,
        frame: Frame,
        falso_positivo: bool = False
    ) -> Alerta:
        """
        Crea una nueva alerta en el sistema
        Según UML: +crearAlerta(timestamp:Date, confidence:float, latitud:float, 
                                longitud:float, camera:ICamera, status:String, 
                                imagenCaptura:Frame, falsoPositivo:boolean):Alerta

        Args:
            timestamp: Fecha y hora de la detección
            confidence: Nivel de confianza/similitud (0.0 - 1.0)
            latitud: Coordenada latitud de detección
            longitud: Coordenada longitud de detección
            camara_id: ID de la cámara (ICamera en UML)
            status: Estado de la alerta (String en UML)
            caso_id: ID del caso asociado
            frame: Frame capturado (imagenCaptura en UML)
            falso_positivo: Boolean indicando si es falso positivo

        Returns:
            Alerta creada
        """
        # Calcular prioridad basada en la similitud
        if confidence >= 0.85:
            prioridad = PrioridadAlerta.ALTA
        elif confidence >= 0.60:
            prioridad = PrioridadAlerta.MEDIA
        else:
            prioridad = PrioridadAlerta.BAJA

        # Convertir status string a EstadoAlerta
        estado = EstadoAlerta.from_string(status) if status else EstadoAlerta.PENDIENTE

        # Obtener ubicación de la cámara
        ubicacion = None
        try:
            camara_response = supabase.table("Camara").select("ubicacion").eq("id", camara_id).single().execute()
            if camara_response.data:
                ubicacion = camara_response.data.get("ubicacion")
        except Exception as e:
            print(f"⚠️ No se pudo obtener ubicación de cámara: {e}")

        # Crear objeto Alerta
        alerta = Alerta(
            caso_id=caso_id,
            camara_id=camara_id,
            timestamp=timestamp,
            similitud=confidence,
            prioridad=prioridad,
            estado=estado,
            ubicacion=ubicacion,
            latitud=latitud,
            longitud=longitud,
            imagen_captura=frame,
            imagen_bytes=frame.to_bytes() if frame else None,
            falso_positivo=falso_positivo
        )

        # Guardar evidencia en Storage primero
        print(f"\n📸 Intentando guardar evidencia para alerta...")
        print(f"   Frame: {frame}, Caso: {caso_id}, Cámara: {camara_id}")
        imagen_url = None
        try:
            imagen_url = EvidenciaService.guardar_evidencia(
                frame=frame,
                caso_id=caso_id,
                camara_id=camara_id
            )
            if imagen_url:
                # Validar que sea un string
                if not isinstance(imagen_url, str):
                    print(f"⚠️ ADVERTENCIA: imagen_url no es string, es {type(imagen_url)}")
                    print(f"   Contenido: {imagen_url}")
                    imagen_url = None  # Resetear si no es válida
                else:
                    print(f"✅ Evidencia guardada con URL (string): {imagen_url}")
            else:
                print(f"⚠️ No se obtuvo URL de evidencia (retornó None)")
        except Exception as ev_error:
            print(f"⚠️ Excepción guardando evidencia: {ev_error}")
            import traceback
            traceback.print_exc()
        
        # Guardar en base de datos (con o sin imagen_url)
        try:
            alerta._imagen_url = imagen_url  # Agregar URL al objeto
            alerta_guardada = AlertaService._guardar_en_bd(alerta, imagen_url)
            
            print(f"\n📢 Verificando si crear notificación...")
            print(f"   Prioridad: {prioridad} ({type(prioridad)})")
            print(f"   ¿Es ALTA o MEDIA?: {prioridad in [PrioridadAlerta.ALTA, PrioridadAlerta.MEDIA]}")
            
            # Crear notificación si es alta prioridad (según criterios de aceptación)
            if prioridad in [PrioridadAlerta.ALTA, PrioridadAlerta.MEDIA]:
                print(f"✅ Creando notificación para alerta ID={alerta_guardada.id}")
                try:
                    notificacion = NotificationService.crear_notificacion_coincidencia(
                        caso_id=caso_id,
                        alerta_id=alerta_guardada.id,
                        confidence=confidence,
                        ubicacion=ubicacion or "Ubicación desconocida",
                        timestamp=timestamp
                    )
                    print(f"✅ Notificación creada exitosamente: {notificacion.get('id') if notificacion else 'Sin ID'}")
                except Exception as notif_error:
                    print(f"⚠️ Error creando notificación: {notif_error}")
                    import traceback
                    traceback.print_exc()
            else:
                print(f"ℹ️  No se crea notificación (prioridad {prioridad.to_string()})")
            
            return alerta_guardada
        except Exception as e:
            print(f"Error guardando alerta: {e}")
            raise

    @staticmethod
    def _guardar_en_bd(alerta: Alerta, imagen_url: Optional[str] = None) -> Alerta:
        """
        Guarda la alerta en la base de datos

        Args:
            alerta: Objeto Alerta a guardar
            imagen_url: URL de la imagen en Storage (opcional)

        Returns:
            Alerta con ID asignado
        """
        # Validar que imagen_url sea string o None
        if imagen_url is not None and not isinstance(imagen_url, str):
            print(f"⚠️ ADVERTENCIA en _guardar_en_bd: imagen_url no es string: {type(imagen_url)}")
            print(f"   Contenido: {imagen_url}")
            imagen_url = None  # Resetear a None si no es válida
        
        # Convertir imagen_bytes a base64 string si existe
        import base64
        imagen_base64 = None
        if alerta.imagen_bytes:
            imagen_base64 = base64.b64encode(alerta.imagen_bytes).decode('utf-8')
        
        data = {
            "caso_id": alerta.caso_id,
            "camara_id": alerta.camara_id,
            "timestamp": alerta.timestamp.isoformat() if isinstance(alerta.timestamp, datetime) else alerta.timestamp,
            "similitud": alerta.similitud,
            "ubicacion": alerta.ubicacion,
            "latitud": alerta.latitud,
            "longitud": alerta.longitud,
            "estado": alerta.estado.to_string(),
            "prioridad": alerta.prioridad.to_string(),
            "imagen": imagen_base64,  # Base64 string o null
            "imagen_url": imagen_url,  # ✅ URL de Storage (string o null)
            "falso_positivo": alerta.falso_positivo
        }
        
        print(f"   DEBUG _guardar_en_bd - imagen_url tipo: {type(imagen_url)}, valor: {imagen_url[:100] if imagen_url else None}")

        # Agregar horarios si existen
        if alerta.horario_inicio:
            data["horario_inicio"] = alerta.horario_inicio.isoformat() if isinstance(alerta.horario_inicio, datetime) else alerta.horario_inicio
        if alerta.horario_fin:
            data["horario_fin"] = alerta.horario_fin.isoformat() if isinstance(alerta.horario_fin, datetime) else alerta.horario_fin

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
    def getAlertasPorFecha(fecha_inicio: datetime, fecha_fin: datetime) -> List[Alerta]:
        """
        Obtiene alertas filtradas por rango de fechas
        Según UML: +getAlertasPorFecha(inicio:Date, fin:Date):List<Alerta>

        Args:
            fecha_inicio: Fecha de inicio del rango
            fecha_fin: Fecha de fin del rango

        Returns:
            Lista de alertas en el rango especificado
        """
        try:
            # Query con JOIN para obtener datos de la cámara (ubicación, latitud, longitud)
            response = supabase.table("Alerta")\
                .select("*, Camara(id, ubicacion, latitud, longitud, ip, type)")\
                .gte("timestamp", fecha_inicio.isoformat())\
                .lte("timestamp", fecha_fin.isoformat())\
                .order("timestamp", desc=True)\
                .execute()

            if not response.data:
                return []

            # Enriquecer alertas con datos de cámara
            alertas = []
            for data in response.data:
                # Extraer datos de cámara del JOIN
                if "Camara" in data and data["Camara"]:
                    camara = data["Camara"]
                    data["latitud"] = camara.get("latitud") or data.get("latitud")
                    data["longitud"] = camara.get("longitud") or data.get("longitud")
                    if not data.get("ubicacion"):
                        data["ubicacion"] = camara.get("ubicacion")
                
                alertas.append(Alerta.from_dict(data))
            
            return alertas
        except Exception as e:
            print(f"Error obteniendo alertas por fecha: {e}")
            return []

    @staticmethod
    def getAlertasPorCamara(camara_id: int) -> List[Alerta]:
        """
        Obtiene todas las alertas de una cámara específica
        Según UML: +getAlertasPorCamara(camara:ICamera):List<Alerta>

        Args:
            camara_id: ID de la cámara (ICamera en UML)

        Returns:
            Lista de alertas de la cámara
        """
        try:
            # Query con JOIN para obtener datos de la cámara
            response = supabase.table("Alerta")\
                .select("*, Camara(id, ubicacion, latitud, longitud, ip, type)")\
                .eq("camara_id", camara_id)\
                .order("timestamp", desc=True)\
                .execute()

            if not response.data:
                return []

            # Enriquecer alertas con datos de cámara
            alertas = []
            for data in response.data:
                if "Camara" in data and data["Camara"]:
                    camara = data["Camara"]
                    data["latitud"] = camara.get("latitud") or data.get("latitud")
                    data["longitud"] = camara.get("longitud") or data.get("longitud")
                    if not data.get("ubicacion"):
                        data["ubicacion"] = camara.get("ubicacion")
                
                alertas.append(Alerta.from_dict(data))
            
            return alertas
        except Exception as e:
            print(f"Error obteniendo alertas de cámara: {e}")
            return []

    @staticmethod
    def getAlertasPorCaso(caso_id: int) -> List[Alerta]:
        """
        Obtiene todas las alertas de un caso (implementación OOP según UML)
        Según UML: +getAlertasPorCaso(caso:Caso):List<Alerta>

        Args:
            caso_id: ID del caso

        Returns:
            Lista de alertas del caso
        """
        try:
            # Query con JOIN para obtener datos de la cámara
            response = supabase.table("Alerta")\
                .select("*, Camara(id, ubicacion, latitud, longitud, ip, type)")\
                .eq("caso_id", caso_id)\
                .order("timestamp", desc=True)\
                .execute()

            if not response.data:
                return []

            # Enriquecer alertas con datos de cámara
            alertas = []
            for data in response.data:
                if "Camara" in data and data["Camara"]:
                    camara = data["Camara"]
                    data["latitud"] = camara.get("latitud") or data.get("latitud")
                    data["longitud"] = camara.get("longitud") or data.get("longitud")
                    if not data.get("ubicacion"):
                        data["ubicacion"] = camara.get("ubicacion")
                
                alertas.append(Alerta.from_dict(data))
            
            return alertas
        except Exception as e:
            print(f"Error obteniendo alertas del caso: {e}")
            return []

    @staticmethod
    def obtener_alertas_geojson(caso_id: Optional[int] = None, 
                                 fecha_inicio: Optional[datetime] = None,
                                 fecha_fin: Optional[datetime] = None,
                                 camara_id: Optional[int] = None) -> Dict:
        """
        Obtiene alertas en formato GeoJSON para visualización en mapas
        
        Args:
            caso_id: Filtro opcional por caso
            fecha_inicio: Filtro opcional por fecha inicio
            fecha_fin: Filtro opcional por fecha fin
            camara_id: Filtro opcional por cámara
            
        Returns:
            FeatureCollection GeoJSON con las alertas
        """
        try:
            # Construir query base con JOIN
            query = supabase.table("Alerta")\
                .select("*, Camara(id, ubicacion, latitud, longitud, ip, type), Caso(id, status, PersonaDesaparecida(nombre_completo))")

            # Aplicar filtros
            if caso_id:
                query = query.eq("caso_id", caso_id)
            if camara_id:
                query = query.eq("camara_id", camara_id)
            if fecha_inicio:
                query = query.gte("timestamp", fecha_inicio.isoformat())
            if fecha_fin:
                query = query.lte("timestamp", fecha_fin.isoformat())

            response = query.order("timestamp", desc=True).execute()

            if not response.data:
                return {
                    "type": "FeatureCollection",
                    "features": []
                }

            # Convertir a GeoJSON
            features = []
            for data in response.data:
                # Obtener coordenadas de la cámara
                lat = data.get("latitud")
                lon = data.get("longitud")
                
                if "Camara" in data and data["Camara"]:
                    camara = data["Camara"]
                    lat = camara.get("latitud") or lat
                    lon = camara.get("longitud") or lon

                # Solo incluir si tiene coordenadas válidas
                if lat is not None and lon is not None:
                    # Obtener nombre de persona desaparecida
                    persona_nombre = "Desconocido"
                    if "Caso" in data and data["Caso"]:
                        caso = data["Caso"]
                        if "PersonaDesaparecida" in caso and caso["PersonaDesaparecida"]:
                            persona_nombre = caso["PersonaDesaparecida"].get("nombre_completo", "Desconocido")

                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [float(lon), float(lat)]  # GeoJSON usa [lon, lat]
                        },
                        "properties": {
                            "id": data.get("id"),
                            "caso_id": data.get("caso_id"),
                            "camara_id": data.get("camara_id"),
                            "timestamp": data.get("timestamp"),
                            "similitud": float(data.get("similitud", 0)),
                            "confidence": float(data.get("similitud", 0)),
                            "estado": data.get("estado"),
                            "prioridad": data.get("prioridad"),
                            "ubicacion": data.get("ubicacion"),
                            "latitud": float(lat),
                            "longitud": float(lon),
                            "falso_positivo": data.get("falso_positivo", False),
                            "persona_nombre": persona_nombre,
                            "imagen_url": data.get("imagen_url")  # ✅ URL de la imagen de evidencia
                        }
                    }
                    
                    # Debug: verificar imagen_url
                    if not data.get("imagen_url"):
                        print(f"⚠️  Alerta {data.get('id')} sin imagen_url en BD")
                    else:
                        print(f"✅ Alerta {data.get('id')} con imagen_url: {data.get('imagen_url')[:80]}...")
                    
                    features.append(feature)

            return {
                "type": "FeatureCollection",
                "features": features
            }

        except Exception as e:
            print(f"Error generando GeoJSON de alertas: {e}")
            import traceback
            traceback.print_exc()
            return {
                "type": "FeatureCollection",
                "features": []
            }
