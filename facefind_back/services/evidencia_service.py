"""
EvidenciaService - Servicio SIMPLE para gestión de evidencias de detección
Guarda imágenes en Supabase Storage y retorna URLs
"""
from typing import Optional
from datetime import datetime, timedelta, timezone
import cv2
from models.frame import Frame
from services.supabase_client import supabase
from supabase import create_client
from config import Config

# Cliente con Service Role Key para operaciones de Storage
supabase_storage = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)

BUCKET_NAME = "evidencias-deteccion"


class EvidenciaService:
    """
    Servicio para gestión de evidencias de detección
    Maneja captura, almacenamiento organizado y limpieza automática
    """

    @staticmethod
    def guardar_evidencia(
        frame: Frame,
        caso_id: int,
        camara_id: int
    ) -> Optional[str]:
        """
        Guarda imagen en Storage y retorna URL.
        SIMPLE: Solo guarda y retorna URL, nada más.

        Args:
            frame: Frame capturado
            caso_id: ID del caso
            camara_id: ID de la cámara

        Returns:
            URL de la imagen guardada o None si falla
        """
        try:
            print(f"🔄 Iniciando guardado de evidencia...")
            print(f"   Caso ID: {caso_id}, Cámara ID: {camara_id}")
            print(f"   Frame type: {type(frame)}, Frame shape: {frame.shape if hasattr(frame, 'shape') else 'N/A'}")
            
            # Verificar SERVICE_ROLE_KEY
            if not Config.SUPABASE_SERVICE_ROLE_KEY:
                raise Exception("SUPABASE_SERVICE_ROLE_KEY no configurada")
            
            # Generar path: caso_id/fecha/timestamp_camXX.jpg
            timestamp = datetime.now()
            fecha_str = timestamp.strftime("%Y-%m-%d")
            timestamp_str = int(timestamp.timestamp() * 1000)  # milisegundos
            
            storage_path = f"{caso_id}/{fecha_str}/evidencia_{timestamp_str}_cam{camara_id}.jpg"
            print(f"   Storage path: {storage_path}")
            
            # Convertir Frame a bytes JPEG
            print(f"   Convirtiendo frame a JPEG...")
            imagen_bytes = EvidenciaService._frame_to_jpeg_bytes(frame)
            print(f"   ✓ Bytes generados: {len(imagen_bytes)} bytes")
            
            # Subir a Storage (con upsert para sobrescribir si existe)
            print(f"   Subiendo a bucket '{BUCKET_NAME}'...")
            response = supabase_storage.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=imagen_bytes,
                file_options={"content-type": "image/jpeg", "upsert": "true"}
            )
            
            print(f"   Response upload: {response}")
            
            # Generar URL firmada (válida por 1 año = 31536000 segundos)
            # Esto funciona independientemente de si el bucket es público o privado
            imagen_url = None
            try:
                signed_response = supabase_storage.storage.from_(BUCKET_NAME).create_signed_url(
                    storage_path,
                    expires_in=31536000  # 1 año en segundos
                )
                
                print(f"   DEBUG - Signed response type: {type(signed_response)}")
                print(f"   DEBUG - Signed response: {signed_response}")
                
                # Extraer URL del response (puede venir como dict o string)
                if isinstance(signed_response, dict):
                    # Intentar diferentes claves posibles
                    imagen_url = (
                        signed_response.get('signedURL') or 
                        signed_response.get('signedUrl') or 
                        signed_response.get('url') or
                        signed_response.get('path')
                    )
                    print(f"   DEBUG - URL extraída de dict: {imagen_url}")
                elif isinstance(signed_response, str):
                    imagen_url = signed_response
                    print(f"   DEBUG - URL es string directo: {imagen_url}")
                
                # Verificar que tengamos una URL válida
                if not imagen_url or not isinstance(imagen_url, str):
                    raise Exception(f"No se pudo extraer URL válida del response: {signed_response}")
                    
            except Exception as e:
                print(f"   ⚠️  Error generando URL firmada: {e}")
                print(f"   Intentando URL pública...")
                # Fallback a URL pública
                imagen_url = supabase_storage.storage.from_(BUCKET_NAME).get_public_url(storage_path)
                print(f"   DEBUG - URL pública: {imagen_url}")
            
            # Validación final
            if not isinstance(imagen_url, str):
                print(f"   ⚠️  ADVERTENCIA: imagen_url no es string: {type(imagen_url)}")
                print(f"   Contenido: {imagen_url}")
                # Intentar convertir a string si es un objeto
                imagen_url = str(imagen_url) if imagen_url else None
            
            print(f"✅ Evidencia guardada exitosamente!")
            print(f"   Path: {storage_path}")
            print(f"   URL final (tipo={type(imagen_url)}): {imagen_url}")
            return imagen_url
            
        except Exception as e:
            print(f"❌ Error guardando evidencia: {e}")
            print(f"   Tipo de error: {type(e).__name__}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()}")
            return None

    @staticmethod
    def _frame_to_jpeg_bytes(frame: Frame, quality: int = 85) -> bytes:
        """
        Convierte Frame a bytes JPEG

        Args:
            frame: Frame a convertir
            quality: Calidad JPEG (0-100)

        Returns:
            bytes de imagen JPEG
        """
        # Obtener imagen del frame
        imagen = frame.imagen
        print(f"   DEBUG _frame_to_jpeg: shape={imagen.shape}, dtype={imagen.dtype}, min={imagen.min()}, max={imagen.max()}")
        
        # Codificar como JPEG
        success, buffer = cv2.imencode('.jpg', imagen, [cv2.IMWRITE_JPEG_QUALITY, quality])
        
        if not success:
            raise Exception("Error codificando frame a JPEG")
        
        jpeg_bytes = buffer.tobytes()
        print(f"   DEBUG _frame_to_jpeg: JPEG size={len(jpeg_bytes)} bytes")
        
        return jpeg_bytes

    @staticmethod
    def limpiar_evidencias_antiguas() -> int:
        """
        Elimina imágenes más antiguas que EVIDENCIAS_RETENCION_DIAS días.
        SIMPLE: Solo borra archivos del bucket, sin tabla de índice.

        Returns:
            Cantidad de archivos eliminados
        """
        try:
            from config import Config
            dias_retencion = getattr(Config, 'EVIDENCIAS_RETENCION_DIAS', 60)
            fecha_limite = datetime.now(timezone.utc) - timedelta(days=dias_retencion)
            
            bucket = supabase_storage.storage.from_(BUCKET_NAME)
            archivos_eliminados = 0
            
            # Listar todos los archivos del bucket
            archivos = bucket.list()
            
            for archivo in archivos:
                # Verificar fecha de creación
                created_at = archivo.get('created_at')
                if created_at:
                    fecha_archivo = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                    
                    if fecha_archivo < fecha_limite:
                        # Eliminar archivo
                        bucket.remove([archivo['name']])
                        archivos_eliminados += 1
                        print(f"Eliminado: {archivo['name']}")
            
            print(f"Limpieza completada: {archivos_eliminados} archivos eliminados")
            return archivos_eliminados
            
        except Exception as e:
            print(f"Error en limpieza: {e}")
            return 0
