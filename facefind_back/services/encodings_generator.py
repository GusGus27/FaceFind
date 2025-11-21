"""
Servicio para generar encodings faciales desde imágenes
y procesamiento de fotos de casos
"""
import face_recognition
import numpy as np
import cv2
import base64
from typing import List, Dict, Tuple
import pickle
import os

class EncodingsGeneratorService:
    """
    Servicio para generar encodings faciales desde imágenes
    """
    
    def __init__(self, model="hog"):
        """
        Args:
            model: 'hog' (rápido) o 'cnn' (preciso pero más lento)
        """
        self.model = model
    
    def generate_encoding_from_base64(self, image_base64: str) -> Dict:
        """
        Genera encoding desde una imagen en base64
        
        Args:
            image_base64: Imagen codificada en base64
        
        Returns:
            Dict con encoding y metadata
        """
        try:
            # Limpiar prefijo si existe
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Decodificar
            img_bytes = base64.b64decode(image_base64)
            img_array = np.frombuffer(img_bytes, dtype=np.uint8)
            image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            
            if image is None:
                return {
                    "success": False,
                    "error": "No se pudo decodificar la imagen"
                }
            
            # Convertir BGR a RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detectar rostros
            face_locations = face_recognition.face_locations(rgb_image, model=self.model)
            
            if not face_locations:
                return {
                    "success": False,
                    "error": "No se detectó ningún rostro en la imagen"
                }
            
            if len(face_locations) > 1:
                return {
                    "success": False,
                    "error": f"Se detectaron {len(face_locations)} rostros. Solo debe haber uno por foto."
                }
            
            # Generar encodings
            face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
            
            if not face_encodings:
                return {
                    "success": False,
                    "error": "No se pudo generar el encoding del rostro"
                }
            
            encoding = face_encodings[0]
            location = face_locations[0]
            
            return {
                "success": True,
                "encoding": encoding.tolist(),  # Convertir a lista para JSON
                "location": {
                    "top": int(location[0]),
                    "right": int(location[1]),
                    "bottom": int(location[2]),
                    "left": int(location[3])
                },
                "image_shape": image.shape
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def generate_encodings_from_multiple_images(self, images_base64: List[str]) -> Dict:
        """
        Genera encodings desde múltiples imágenes
        
        Args:
            images_base64: Lista de imágenes en base64
        
        Returns:
            Dict con encodings generados y errores
        """
        results = {
            "success": True,
            "encodings": [],
            "errors": [],
            "total_processed": len(images_base64),
            "successful": 0,
            "failed": 0
        }
        
        for i, img_base64 in enumerate(images_base64):
            result = self.generate_encoding_from_base64(img_base64)
            
            if result["success"]:
                results["encodings"].append({
                    "index": i,
                    "encoding": result["encoding"],
                    "location": result["location"]
                })
                results["successful"] += 1
            else:
                results["errors"].append({
                    "index": i,
                    "error": result["error"]
                })
                results["failed"] += 1
        
        if results["successful"] == 0:
            results["success"] = False
            results["error"] = "No se pudo generar ningún encoding"
        
        return results
    
    def add_encodings_to_system(self, person_name: str, encodings: List, 
                                encodings_path: str = "encodings.pickle") -> Dict:
        """
        Agrega encodings al sistema
        """
        try:
            # Intentar descargar desde la nube primero
            try:
                from services.encodings_storage import download_encodings_from_cloud
                result = download_encodings_from_cloud(encodings_path)
                if result.get("success"):
                    print(f"✅ Descargado desde nube: {result['size']} bytes")
            except Exception as e:
                print(f"⚠️ No se pudo descargar: {e}")
            
            # Cargar archivo local (ya sea descargado o existente)
            if os.path.exists(encodings_path):
                with open(encodings_path, 'rb') as f:
                    data = pickle.load(f)
                print(f"📂 Encodings existentes: {len(data.get('encodings', []))}")
            else:
                data = {'encodings': [], 'names': []}
                print("📂 Creando archivo nuevo")
            
            # Agregar nuevos encodings
            for encoding in encodings:
                if isinstance(encoding, list):
                    encoding = np.array(encoding)
                data['encodings'].append(encoding)
                data['names'].append(person_name)
            
            # Guardar localmente
            with open(encodings_path, 'wb') as f:
                pickle.dump(data, f)
            
            print(f"✅ Total encodings: {len(data['encodings'])}")
            
            return {
                "success": True,
                "message": f"Agregados {len(encodings)} encodings",
                "total_encodings": len(data['encodings'])
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def process_case_photos(self, person_name: str, photos: Dict[str, str],
                           encodings_path: str = "encodings.pickle") -> Dict:
        """
        Procesa las fotos de un caso: genera encodings y los agrega al sistema
        
        Args:
            person_name: Nombre de la persona desaparecida
            photos: Dict con fotos en base64 {'frontal': ..., 'profile1': ..., 'profile2': ...}
            encodings_path: Ruta al archivo de encodings
        
        Returns:
            Dict con resultado completo del procesamiento
        """
        try:
            # Extraer imágenes
            images = []
            photo_types = []
            
            for photo_type, photo_base64 in photos.items():
                if photo_base64:
                    images.append(photo_base64)
                    photo_types.append(photo_type)
            
            if not images:
                return {
                    "success": False,
                    "error": "No se proporcionaron fotos"
                }
            
            # Generar encodings
            print(f"🔍 Generando encodings de {len(images)} fotos para {person_name}...")
            encoding_results = self.generate_encodings_from_multiple_images(images)
            
            if not encoding_results["success"]:
                return {
                    "success": False,
                    "error": "No se pudieron generar encodings",
                    "details": encoding_results
                }
            
            # Extraer solo los encodings
            encodings = [enc["encoding"] for enc in encoding_results["encodings"]]
            
            # Agregar al sistema
            print(f"💾 Agregando {len(encodings)} encodings al sistema...")
            add_result = self.add_encodings_to_system(person_name, encodings, encodings_path)
            
            if not add_result["success"]:
                return {
                    "success": False,
                    "error": "No se pudieron agregar encodings al sistema",
                    "details": add_result
                }
            
            # Sincronizar con la nube
            try:
                from services.encodings_storage import upload_encodings_to_cloud
                print(f"☁️ Sincronizando encodings con Supabase Storage...")
                cloud_result = upload_encodings_to_cloud()
                cloud_synced = cloud_result.get("success", False)
                if cloud_synced:
                    print(f"✅ Encodings sincronizados con la nube")
                else:
                    print(f"⚠️ Advertencia: {cloud_result.get('error', 'Error desconocido')}")
            except Exception as e:
                print(f"⚠️ No se pudo sincronizar con la nube: {e}")
                print(f"💡 Tip: Crea el bucket 'face-encodings' en Supabase Storage")
                cloud_synced = False
            
            return {
                "success": True,
                "message": f"Encodings procesados correctamente para {person_name}",
                "encodings_generated": len(encodings),
                "photos_processed": encoding_results["successful"],
                "photos_failed": encoding_results["failed"],
                "total_encodings_in_system": add_result["total_encodings"],
                "cloud_synced": cloud_synced,
                "details": {
                    "photo_types": photo_types,
                    "errors": encoding_results.get("errors", [])
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Instancia global
encodings_generator = EncodingsGeneratorService()
