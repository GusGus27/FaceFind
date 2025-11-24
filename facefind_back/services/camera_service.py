"""
Camera Service - Servicio para gestión de cámaras
Maneja la lógica de negocio de cámaras usando OOP

HU-11: Gestión de Múltiples Cámaras
"""
from services.supabase_client import supabase
from models.camara import Camara
from typing import Dict, List, Optional


class CameraService:
    """
    Service que trabaja con objetos OOP internamente pero retorna Dict para API
    Implementa CRUD completo para cámaras
    """

    @staticmethod
    def create_camera(data: Dict) -> Dict:
        try:
            # Validar campos obligatorios
            if not data.get("nombre"):
                raise ValueError("El nombre de la cámara es obligatorio")
            
            if not data.get("type"):
                raise ValueError("El tipo de cámara es obligatorio")
            
            if data.get("type") not in ["USB", "IP"]:
                raise ValueError("El tipo debe ser 'USB' o 'IP'")
            
            if data.get("type") == "IP" and not data.get("url"):
                raise ValueError("La URL es obligatoria para cámaras IP")
            
            if not data.get("ubicacion"):
                raise ValueError("La ubicación es obligatoria")

            # Validar FPS si se proporciona
            if data.get("fps"):
                fps = int(data.get("fps"))
                if fps < 1 or fps > 120:
                    raise ValueError("FPS debe estar entre 1 y 120")

            # Generar IP única basada en el nombre si no se proporciona
            import hashlib
            from datetime import datetime
            import time
            
            if not data.get("ip"):
                # Generar IP única usando nombre + timestamp
                unique_string = f"{data['nombre']}_{int(time.time())}"
                ip_hash = hashlib.md5(unique_string.encode()).hexdigest()[:8]
                data["ip"] = f"cam_{ip_hash}"
            
            # Verificar si ya existe una cámara con la misma IP
            existing = supabase.table("Camara").select("*").eq("ip", data["ip"]).execute()
            
            if existing.data:
                # Si existe, generar nueva IP con timestamp
                unique_string = f"{data['nombre']}_{int(time.time() * 1000)}"
                ip_hash = hashlib.md5(unique_string.encode()).hexdigest()[:8]
                data["ip"] = f"cam_{ip_hash}"

            # Crear objeto Camara (OOP internamente)
            camara = Camara(
                nombre=data["nombre"],
                tipo=data["type"],
                ubicacion=data["ubicacion"],
                activa=data.get("activa", True),
                ip=data["ip"],
                url=data.get("url"),
                resolution=data.get("resolution"),
                fps=data.get("fps"),
                latitud=data.get("latitud"),
                longitud=data.get("longitud")
            )

            print(f"📹 Creando cámara tipo {data['type']} con URL/DeviceId: '{data.get('url')}'")
            
            # Guardar en Supabase
            camara_dict = camara.to_dict()
            
            # Remover campos que la BD genera automáticamente
            if "id" in camara_dict:
                del camara_dict["id"]
            
            # Guardar nombre temporalmente y removerlo del dict (no está en schema)
            nombre_guardado = camara_dict.pop("nombre", data["nombre"])
            
            # Asegurar que created_at y updated_at sean strings ISO
            if camara_dict.get("created_at"):
                camara_dict["created_at"] = camara_dict["created_at"]
            if camara_dict.get("updated_at"):
                camara_dict["updated_at"] = camara_dict["updated_at"]

            print(f"📤 Intentando crear cámara con datos: {camara_dict}")
            response = supabase.table("Camara").insert(camara_dict).execute()

            if hasattr(response, "error") and response.error:
                print(f"❌ Error de Supabase: {response.error}")
                raise Exception(f"Error al guardar cámara: {str(response.error)}")

            if not response.data:
                raise Exception("No se recibió respuesta al crear la cámara")

            # Agregar nombre al resultado ya que no está en BD
            result = response.data[0]
            result["nombre"] = nombre_guardado
            return result

        except ValueError as ve:
            print(f"❌ Error de validación: {str(ve)}")
            raise ve
        except Exception as e:
            print(f"❌ Error creando cámara: {str(e)}")
            raise e

    @staticmethod
    def get_all_cameras() -> List[Dict]:
        try:
            response = supabase.table("Camara")\
                .select("*")\
                .order("created_at", desc=True)\
                .execute()

            if hasattr(response, "error") and response.error:
                raise Exception(f"Error obteniendo cámaras: {str(response.error)}")

            # Convertir a objetos OOP y luego a dict
            cameras = []
            for camera_data in response.data:
                # Agregar nombre si no existe (extraer del ubicación o generar)
                if "nombre" not in camera_data or not camera_data.get("nombre"):
                    camera_data["nombre"] = f"Cámara {camera_data.get('id', 'N/A')}"
                camara = Camara.from_dict(camera_data)
                cameras.append(camara.to_dict())

            return cameras

        except Exception as e:
            print(f"❌ Error obteniendo cámaras: {str(e)}")
            raise e

    @staticmethod
    def get_camera_by_id(camera_id: int) -> Dict:
        try:
            response = supabase.table("Camara")\
                .select("*")\
                .eq("id", camera_id)\
                .execute()

            if hasattr(response, "error") and response.error:
                raise Exception(f"Error obteniendo cámara: {str(response.error)}")

            if not response.data:
                raise ValueError(f"No se encontró la cámara con ID {camera_id}")

            # Convertir a objeto OOP y luego a dict
            camera_data = response.data[0]
            # Agregar nombre si no existe
            if "nombre" not in camera_data or not camera_data.get("nombre"):
                camera_data["nombre"] = f"Cámara {camera_data.get('id', 'N/A')}"
            camara = Camara.from_dict(camera_data)
            return camara.to_dict()

        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"❌ Error obteniendo cámara {camera_id}: {str(e)}")
            raise e

    @staticmethod
    def update_camera(camera_id: int, data: Dict) -> Dict:
        try:
            # Obtener cámara actual
            current_camera = CameraService.get_camera_by_id(camera_id)
            camara = Camara.from_dict(current_camera)

            # Validaciones
            if "type" in data and data["type"] not in ["USB", "IP"]:
                raise ValueError("El tipo debe ser 'USB' o 'IP'")
            
            if "type" in data and data["type"] == "IP" and not data.get("url"):
                raise ValueError("La URL es obligatoria para cámaras IP")

            if "fps" in data and data["fps"]:
                fps = int(data["fps"])
                if fps < 1 or fps > 120:
                    raise ValueError("FPS debe estar entre 1 y 120")

            # Actualizar configuración usando método OOP
            camara.actualizar_configuracion(**data)

            # Si se actualiza el estado (activa/inactiva)
            if "activa" in data:
                if data["activa"]:
                    camara.activar()
                else:
                    camara.desactivar()

            # Guardar en Supabase
            camara_dict = camara.to_dict()
            
            # Remover campos que no existen en la BD o no deben actualizarse
            camara_dict.pop("id", None)  # No actualizar el ID
            camara_dict.pop("nombre", None)  # nombre no existe en schema
            camara_dict.pop("created_at", None)  # No actualizar fecha de creación
            
            print(f"📤 Actualizando cámara {camera_id} con datos: {camara_dict}")
            response = supabase.table("Camara")\
                .update(camara_dict)\
                .eq("id", camera_id)\
                .execute()

            if hasattr(response, "error") and response.error:
                print(f"❌ Error de Supabase al actualizar: {response.error}")
                raise Exception(f"Error actualizando cámara: {str(response.error)}")

            if not response.data:
                raise Exception("No se recibió respuesta al actualizar la cámara")
            
            # Agregar nombre de vuelta al resultado
            result = response.data[0]
            result["nombre"] = current_camera.get("nombre", f"Cámara {camera_id}")

            print(f"✅ Cámara actualizada correctamente: {result}")
            return result

        except ValueError as ve:
            print(f"❌ Error de validación: {str(ve)}")
            raise ve
        except Exception as e:
            print(f"❌ Error actualizando cámara {camera_id}: {str(e)}")
            raise e

    @staticmethod
    def delete_camera(camera_id: int) -> bool:
        """
        Elimina una cámara del sistema

        Args:
            camera_id: ID de la cámara a eliminar

        Returns:
            bool: True si se eliminó correctamente

        Raises:
            ValueError: Si la cámara no existe o tiene alertas asociadas
        """
        try:
            # Verificar que existe
            CameraService.get_camera_by_id(camera_id)

            # Verificar si tiene alertas asociadas
            alertas_response = supabase.table("Alerta")\
                .select("id", count="exact")\
                .eq("camara_id", camera_id)\
                .execute()
            
            alertas_count = alertas_response.count if hasattr(alertas_response, "count") else 0
            
            if alertas_count > 0:
                raise ValueError(
                    f"No se puede eliminar la cámara porque tiene {alertas_count} alerta(s) asociada(s). "
                    "Primero debes eliminar o reasignar las alertas."
                )

            # Eliminar de Supabase
            response = supabase.table("Camara")\
                .delete()\
                .eq("id", camera_id)\
                .execute()

            if hasattr(response, "error") and response.error:
                raise Exception(f"Error eliminando cámara: {str(response.error)}")

            print(f"✅ Cámara {camera_id} eliminada correctamente")
            return True

        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"❌ Error eliminando cámara {camera_id}: {str(e)}")
            raise e

    @staticmethod
    def get_active_cameras() -> List[Dict]:
        """
        Obtiene todas las cámaras activas del sistema

        Returns:
            List[Dict]: Lista de cámaras activas en formato JSON
        """
        try:
            response = supabase.table("Camara")\
                .select("*")\
                .eq("activa", True)\
                .order("created_at", desc=True)\
                .execute()

            if hasattr(response, "error") and response.error:
                raise Exception(f"Error obteniendo cámaras activas: {str(response.error)}")

            # Convertir a objetos OOP y luego a dict
            cameras = []
            for camera_data in response.data:
                # Agregar nombre si no existe
                if "nombre" not in camera_data or not camera_data.get("nombre"):
                    camera_data["nombre"] = f"Cámara {camera_data.get('id', 'N/A')}"
                camara = Camara.from_dict(camera_data)
                cameras.append(camara.to_dict())

            return cameras

        except Exception as e:
            print(f"❌ Error obteniendo cámaras activas: {str(e)}")
            raise e

    @staticmethod
    def toggle_camera_status(camera_id: int) -> Dict:
        """
        Alterna el estado activo/inactivo de una cámara

        Args:
            camera_id: ID de la cámara

        Returns:
            Dict: Cámara actualizada en formato JSON
        """
        try:
            current_camera = CameraService.get_camera_by_id(camera_id)
            camara = Camara.from_dict(current_camera)

            # Alternar estado
            if camara.activa:
                camara.desactivar()
            else:
                camara.activar()

            # Guardar en Supabase
            camara_dict = camara.to_dict()
            
            # Remover campos que no existen en la BD o no deben actualizarse
            nombre_guardado = camara_dict.pop("nombre", f"Cámara {camera_id}")
            camara_dict.pop("id", None)
            camara_dict.pop("created_at", None)
            
            response = supabase.table("Camara")\
                .update(camara_dict)\
                .eq("id", camera_id)\
                .execute()

            if hasattr(response, "error") and response.error:
                raise Exception(f"Error alternando estado de cámara: {str(response.error)}")

            # Agregar nombre de vuelta al resultado
            result = response.data[0]
            result["nombre"] = nombre_guardado
            return result

        except Exception as e:
            print(f"❌ Error alternando estado de cámara {camera_id}: {str(e)}")
            raise e

    @staticmethod
    def get_cameras_stats() -> Dict:
        """
        Obtiene estadísticas de las cámaras

        Returns:
            Dict: Estadísticas de cámaras
        """
        try:
            all_cameras = CameraService.get_all_cameras()
            active_cameras = [c for c in all_cameras if c.get("activa", False)]
            inactive_cameras = [c for c in all_cameras if not c.get("activa", False)]
            
            usb_cameras = [c for c in all_cameras if c.get("type") == "USB"]
            ip_cameras = [c for c in all_cameras if c.get("type") == "IP"]

            return {
                "total": len(all_cameras),
                "activas": len(active_cameras),
                "inactivas": len(inactive_cameras),
                "usb": len(usb_cameras),
                "ip": len(ip_cameras)
            }

        except Exception as e:
            print(f"❌ Error obteniendo estadísticas de cámaras: {str(e)}")
            raise e
