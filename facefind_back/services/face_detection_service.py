import cv2
import pickle
import numpy as np
import face_recognition
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import time
import os

class FaceDetectionService:
    """
    Servicio para detectar rostros en tiempo real y comparar con encodings existentes
    """
    
    def __init__(self, encodings_path: str = "encodings.pickle", tolerance: float = 0.6):
        """
        Inicializa el servicio de detección facial
        
        Args:
            encodings_path: Ruta al archivo de encodings
            tolerance: Umbral de similitud (menor = más estricto)
        """
        self.tolerance = tolerance
        self.known_encodings = []
        self.known_names = []
        self.encodings_path = encodings_path
        
        # Cargar encodings existentes
        self._load_encodings(encodings_path)
        
    def _load_encodings(self, encodings_path: str):
        """Carga los encodings desde el archivo pickle"""
        try:
            # Verificar si el archivo existe
            if not os.path.exists(encodings_path):
                print(f"Archivo no encontrado: {encodings_path}")
                print(f"Directorio actual: {os.getcwd()}")
                print(f"Archivos disponibles: {os.listdir('.')}")
                self.known_encodings = []
                self.known_names = []
                return
            
            with open(encodings_path, "rb") as f:
                data = pickle.load(f)
                self.known_encodings = data["encodings"]
                self.known_names = data["names"]
            print(f"Cargados {len(self.known_encodings)} encodings conocidos")
            print(f"Nombres disponibles: {set(self.known_names)}")

        except Exception as e:
            print(f"Error cargando encodings: {e}")
            self.known_encodings = []
            self.known_names = []
    
    def detect_faces_in_frame(self, frame: np.ndarray) -> List[Dict]:
        """
        Detecta rostros en un frame y extrae sus encodings
        """
        try:
            # Convertir BGR a RGB para face_recognition
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Redimensionar para mejor rendimiento
            scale_factor = 4
            small_frame = cv2.resize(rgb_frame, (0, 0), fx=1/scale_factor, fy=1/scale_factor)
            
            # Detectar ubicaciones de rostros
            face_locations = face_recognition.face_locations(small_frame, model="hog")
            
            if not face_locations:
                print("👤 No se detectaron rostros")
                return []
            
            print(f"👥 Detectados {len(face_locations)} rostros")
            
            # Extraer encodings de rostros detectados
            face_encodings = face_recognition.face_encodings(small_frame, face_locations)
            
            detected_faces = []
            for i, (encoding, location) in enumerate(zip(face_encodings, face_locations)):
                # Escalar coordenadas de vuelta al tamaño original
                top, right, bottom, left = location
                scaled_location = (
                    top * scale_factor,
                    right * scale_factor, 
                    bottom * scale_factor,
                    left * scale_factor
                )
                
                detected_faces.append({
                    "face_id": i,
                    "encoding": encoding,
                    "location": scaled_location,
                    "bbox": {
                        "x": left * scale_factor,
                        "y": top * scale_factor,
                        "width": (right - left) * scale_factor,
                        "height": (bottom - top) * scale_factor
                    }
                })
            
            return detected_faces
            
        except Exception as e:
            print(f"Error en detect_faces_in_frame: {e}")
            return []
    
    def compare_with_known_faces(self, detected_encoding: np.ndarray) -> Dict:
        """
        Compara un encoding detectado con los conocidos
        """
        try:
            if len(self.known_encodings) == 0:
                return {
                    "match_found": False,
                    "best_match_name": "Desconocido",
                    "similarity_percentage": 0.0,
                    "all_similarities": []
                }
            
            # Calcular distancias con todos los encodings conocidos
            distances = face_recognition.face_distance(self.known_encodings, detected_encoding)
            
            # Convertir distancias a porcentajes de similitud
            similarities = [(1 - dist) * 100 for dist in distances]
            
            # Encontrar el mejor match
            best_match_index = np.argmin(distances)
            best_distance = distances[best_match_index]
            best_similarity = similarities[best_match_index]
            
            # Verificar si supera el umbral
            match_found = best_distance <= self.tolerance
            best_match_name = self.known_names[best_match_index] if match_found else "Desconocido"
            
            # Crear lista de similitudes
            all_similarities = []
            for i, (name, sim) in enumerate(zip(self.known_names, similarities)):
                all_similarities.append({
                    "name": name,
                    "similarity_percentage": round(sim, 2),
                    "distance": round(distances[i], 4)
                })
            
            all_similarities.sort(key=lambda x: x["similarity_percentage"], reverse=True)
            
            return {
                "match_found": match_found,
                "best_match_name": best_match_name,
                "similarity_percentage": round(best_similarity, 2),
                "distance": round(best_distance, 4),
                "all_similarities": all_similarities[:5]
            }
            
        except Exception as e:
            print(f"Error en compare_with_known_faces: {e}")
            return {
                "match_found": False,
                "best_match_name": "Error",
                "similarity_percentage": 0.0,
                "all_similarities": []
            }
    
    def process_frame(self, frame: np.ndarray) -> Dict:
        """
        Procesa un frame completo: detecta rostros y los compara
        """
        try:
            detected_faces = self.detect_faces_in_frame(frame)
            
            results = {
                "timestamp": time.time(),
                "faces_detected": len(detected_faces),
                "faces": []
            }
            
            for face_data in detected_faces:
                comparison_result = self.compare_with_known_faces(face_data["encoding"])
                
                face_result = {
                    "face_id": face_data["face_id"],
                    "location": face_data["location"],
                    "bbox": face_data["bbox"],
                    **comparison_result
                }
                
                results["faces"].append(face_result)
            
            return results
            
        except Exception as e:
            print(f"Error en process_frame: {e}")
            return {
                "timestamp": time.time(),
                "faces_detected": 0,
                "faces": [],
                "error": str(e)
            }