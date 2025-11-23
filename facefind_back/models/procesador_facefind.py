import face_recognition
import numpy as np
import cv2
import base64
import time
import binascii
from supabase import create_client, Client
from concurrent.futures import ThreadPoolExecutor, as_completed


class ProcesadorFaceFind:
    """
    Versión extendida de ProcesadorFaceFind.
    Carga encodings desde una tabla Supabase donde el vector está guardado como BYTEA o Base64.
    
    Características:
    - Detección simultánea de hasta 3 rostros
    - Priorización por calidad de detección (tamaño + nitidez)
    - Procesamiento paralelo de embeddings
    - Deduplicación de alertas (sin alertas duplicadas para misma persona)
    """

    def __init__(self, tolerance=0.55, max_faces=3, enable_parallel=True):
        self.tolerance = tolerance
        self.max_faces = max_faces
        self.enable_parallel = enable_parallel
        
        self.supabase: Client = self._init_supabase()
        self.known_encodings = []
        self.known_names = []
        
        # Thread pool para procesamiento paralelo
        if self.enable_parallel:
            self.executor = ThreadPoolExecutor(max_workers=3)

        # Cargar encodings desde Supabase
        self.load_known_faces_from_db()

    # ======================================================
    # 🔗 Conexión con Supabase
    # ======================================================
    def _init_supabase(self) -> Client:
        from config import Config
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_KEY
        return create_client(url, key)

    # ======================================================
    # 🧩 Función auxiliar: decodificar base64 con padding
    # ======================================================
    def _decode_base64_vector(self, b64_string, id=None):
        try:
            if not isinstance(b64_string, str):
                print(f"⚠️ Vector id={id}: tipo inesperado {type(b64_string)}")
                return None

            s = b64_string.strip()
            # 🔧 Corrige padding faltante
            missing_padding = len(s) % 4
            if missing_padding:
                s += "=" * (4 - missing_padding)

            decoded = base64.b64decode(s)
            return np.frombuffer(decoded, dtype=np.float64)

        except Exception as e:
            print(f"⚠️ No se pudo decodificar vector id={id}: {e}")
            return None

    # ======================================================
    # 📥 Cargar encodings desde la tabla Supabase
    # ======================================================
    def load_known_faces_from_db(self):
        """
        Carga encodings desde Supabase y obtiene el nombre de la persona desaparecida
        mediante JOIN con FotoReferencia, Caso y PersonaDesaparecida
        """
        # Query con JOIN para obtener el nombre de la persona
        response = self.supabase.table("Embedding")\
            .select("id, vector, foto_referencia_id, FotoReferencia(caso_id, Caso(persona_id, PersonaDesaparecida(nombre_completo)))")\
            .execute()
        
        if not response.data:
            print("    No se encontraron encodings en BD")
            return

        for row in response.data:
            vector_data = row.get("vector")
            
            # Intentar obtener el nombre de la persona desaparecida
            nombre = None
            try:
                foto_ref = row.get("FotoReferencia")
                if foto_ref and isinstance(foto_ref, dict):
                    caso = foto_ref.get("Caso")
                    if caso and isinstance(caso, dict):
                        persona = caso.get("PersonaDesaparecida")
                        if persona and isinstance(persona, dict):
                            nombre = persona.get("nombre_completo")
            except Exception as e:
                print(f"⚠️ Error obteniendo nombre para embedding {row.get('id')}: {e}")
            
            # Si no se pudo obtener el nombre, usar ID como fallback
            if not nombre:
                nombre = f"Foto_{row.get('foto_referencia_id', row.get('id'))}"

            vector = None
            try:
                # Detectar formato del vector
                if isinstance(vector_data, str):
                    if vector_data.startswith("\\x"):
                        # Es formato bytea (hex)
                        vector = np.frombuffer(binascii.unhexlify(vector_data[2:]), dtype=np.float64)
                    else:
                        # Es formato base64 (raro en tu caso, pero posible)
                        vector = self._decode_base64_vector(vector_data, id=row.get("id"))
                elif isinstance(vector_data, (bytes, bytearray)):
                    vector = np.frombuffer(vector_data, dtype=np.float64)
                elif isinstance(vector_data, list):
                    vector = np.array(vector_data, dtype=np.float64)

                if vector is not None and len(vector) > 0:
                    self.known_encodings.append(vector)
                    self.known_names.append(nombre)
                    print(f"  ✅ Cargado: {nombre} (ID: {row.get('id')})")
            except Exception as e:
                print(f"⚠️ No se pudo procesar vector id={row.get('id')}: {e}")

        print(f"✅ {len(self.known_encodings)} encodings cargados desde Supabase DB")

    # ======================================================
    # 🧠 Procesamiento facial
    # ======================================================
    def calculate_quality_score(self, frame: np.ndarray, bbox: dict) -> float:
        """
        Calcula score de calidad para priorización
        
        Factores:
        - Tamaño del rostro (60%)
        - Nitidez (40%)
        """
        height, width = frame.shape[:2]
        top, left = bbox['y'], bbox['x']
        bottom, right = top + bbox['height'], left + bbox['width']
        
        # 1. Score de tamaño
        face_area = bbox['width'] * bbox['height']
        frame_area = width * height
        size_score = min(100, (face_area / frame_area) * 1000)
        
        # 2. Score de nitidez (Laplacian)
        try:
            face_roi = frame[max(0, top):min(height, bottom), max(0, left):min(width, right)]
            gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray_roi, cv2.CV_64F).var()
            sharpness_score = min(100, laplacian_var / 10)
        except:
            sharpness_score = 50
        
        # Peso: 60% tamaño, 40% nitidez
        total_score = (size_score * 0.6) + (sharpness_score * 0.4)
        return round(total_score, 2)
    
    def process_frame(self, frame):
        """
        Procesa un frame de video detectando y reconociendo rostros
        
        Args:
            frame: Frame BGR de OpenCV
            
        Returns:
            Dict con timestamp, rostros detectados y deduplicación automática
        """
        start_time = time.time()
        
        # Convertir a RGB para face_recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detectar ubicaciones de rostros
        locations = face_recognition.face_locations(rgb_frame, model="hog")
        total_faces_detected = len(locations)
        
        print(f"\n🧠 Detectados {total_faces_detected} rostros totales")
        
        if total_faces_detected == 0:
            return {
                "timestamp": time.time(),
                "total_faces_detected": 0,
                "faces_processed": 0,
                "faces_detected": 0,
                "max_faces_limit": self.max_faces,
                "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                "faces": []
            }
        
        # Extraer encodings
        encodings = face_recognition.face_encodings(rgb_frame, locations)
        
        # Preparar datos de rostros detectados con score de calidad
        detected_faces = []
        for i, (encoding, location) in enumerate(zip(encodings, locations)):
            top, right, bottom, left = location
            bbox = {
                "x": int(left),
                "y": int(top),
                "width": int(right - left),
                "height": int(bottom - top)
            }
            
            # Calcular score de calidad
            quality_score = self.calculate_quality_score(frame, bbox)
            
            detected_faces.append({
                "face_id": i,
                "location": (int(top), int(right), int(bottom), int(left)),
                "encoding": encoding,
                "bbox": bbox,
                "quality_score": quality_score
            })
        
        # Priorizar por calidad (mejor calidad primero)
        detected_faces.sort(key=lambda x: x['quality_score'], reverse=True)
        detected_faces = detected_faces[:self.max_faces]
        print(f"   🎯 Procesando los {len(detected_faces)} rostros de mejor calidad")
        
        # Procesar comparaciones (paralelo o secuencial)
        if self.enable_parallel and len(detected_faces) > 1:
            faces = self._process_faces_parallel(detected_faces)
        else:
            faces = self._process_faces_sequential(detected_faces)
        
        # DEDUPLICACIÓN: Eliminar alertas duplicadas para misma persona
        faces = self._deduplicate_faces(faces)
        
        processing_time = time.time() - start_time
        
        result = {
            "timestamp": time.time(),
            "total_faces_detected": total_faces_detected,
            "faces_processed": len(faces),
            "faces_detected": len(faces),
            "max_faces_limit": self.max_faces,
            "processing_time_ms": round(processing_time * 1000, 2),
            "faces": faces
        }
        
        print(f"⏱️  Procesamiento completado en {result['processing_time_ms']}ms")
        
        return result
    
    def _process_faces_sequential(self, detected_faces: list) -> list:
        """Procesa rostros de forma secuencial"""
        faces = []
        for face_data in detected_faces:
            results = self.compare_with_known_faces(face_data["encoding"])
            
            # Información de consola
            face_label = face_data.get('track_id', face_data['face_id'])
            if results["match_found"]:
                print(f"✅ Rostro {face_label}: Coincide con {results['best_match_name']} "
                      f"(Similitud: {results['similarity_percentage']}%, "
                      f"Distancia: {results['distance']})")
            else:
                print(f"❌ Rostro {face_label}: No hay coincidencia (Distancia mínima: {results['distance']})")
            
            # Top 3 coincidencias
            print("   🔎 Top 3 coincidencias:")
            for sim in results["all_similarities"]:
                print(f"      - {sim['name']}: {sim['similarity_percentage']}% (dist {sim['distance']})")
            
            face_result = {
                "face_id": face_data.get('track_id', face_data['face_id']),
                "location": face_data["location"],
                "bbox": face_data["bbox"],
                **results
            }
            
            # Agregar información de tracking si existe
            if 'quality_score' in face_data:
                face_result['quality_score'] = face_data['quality_score']
            
            faces.append(face_result)
        
        return faces
    
    def _deduplicate_faces(self, faces: list) -> list:
        """
        Elimina duplicados: Si 2+ rostros tienen el mismo nombre,
        solo mantiene el de mejor calidad/similitud
        """
        if len(faces) <= 1:
            return faces
        
        # Agrupar por nombre
        name_groups = {}
        for face in faces:
            name = face['best_match_name']
            if name not in name_groups:
                name_groups[name] = []
            name_groups[name].append(face)
        
        # Para cada grupo, mantener solo el mejor
        deduplicated = []
        for name, group in name_groups.items():
            if len(group) == 1:
                deduplicated.append(group[0])
            else:
                # Ordenar por similitud descendente, luego por calidad
                best_face = max(group, key=lambda f: (
                    f['similarity_percentage'],
                    f.get('quality_score', 0)
                ))
                deduplicated.append(best_face)
                print(f"   🔄 Deduplicado: {name} ({len(group)} detecciones → 1 alerta)")
        
        return deduplicated
    
    def _process_faces_parallel(self, detected_faces: list) -> list:
        """
        Procesa rostros en paralelo usando ThreadPoolExecutor
        Mejora el rendimiento cuando hay múltiples rostros
        """
        print(f"   ⚡ Procesamiento paralelo de {len(detected_faces)} rostros")
        
        # Enviar tareas al pool
        future_to_face = {}
        for face_data in detected_faces:
            future = self.executor.submit(self.compare_with_known_faces, face_data["encoding"])
            future_to_face[future] = face_data
        
        # Recolectar resultados
        faces = []
        for future in as_completed(future_to_face):
            face_data = future_to_face[future]
            try:
                results = future.result()
                
                face_label = face_data.get('track_id', face_data['face_id'])
                if results["match_found"]:
                    print(f"✅ Rostro {face_label}: {results['best_match_name']} "
                          f"({results['similarity_percentage']}%)")
                
                face_result = {
                    "face_id": face_data.get('track_id', face_data['face_id']),
                    "location": face_data["location"],
                    "bbox": face_data["bbox"],
                    **results
                }
                
                if 'quality_score' in face_data:
                    face_result['quality_score'] = face_data['quality_score']
                
                faces.append(face_result)
                
            except Exception as e:
                print(f"⚠️ Error procesando rostro {face_data['face_id']}: {e}")
        
        return faces

    # ======================================================
    # 🔍 Comparación facial
    # ======================================================
    def compare_with_known_faces(self, encoding):
        """Compara un encoding con todos los conocidos"""
        if not self.known_encodings:
            print("⚠️ No hay encodings cargados para comparar.")
            return {
                "match_found": False,
                "best_match_name": "Desconocido",
                "similarity_percentage": 0,
                "distance": None,
                "all_similarities": []
            }

        distances = face_recognition.face_distance(self.known_encodings, encoding)
        best_match_index = np.argmin(distances)
        best_distance = distances[best_match_index]
        best_name = self.known_names[best_match_index]

        similarities = [
            {
                "name": self.known_names[i],
                "similarity_percentage": round((1 - d) * 100, 2),
                "distance": round(float(d), 4)
            }
            for i, d in enumerate(distances)
        ]

        return {
            "match_found": best_distance <= self.tolerance,
            "best_match_name": best_name,
            "similarity_percentage": round((1 - best_distance) * 100, 2),
            "distance": round(float(best_distance), 4),
            "all_similarities": sorted(similarities, key=lambda x: x["distance"])[:3]
        }

    # ======================================================
    # 🧩 Agregar nuevos rostros en memoria
    # ======================================================
    def add_new_face(self, encoding, name):
        self.known_encodings.append(encoding)
        self.known_names.append(name)
        print(f"🆕 Agregado nuevo rostro: {name}")
    
    def set_max_faces(self, max_faces: int):
        """Ajusta dinámicamente el número máximo de rostros a procesar"""
        self.max_faces = max_faces
        print(f"🔧 Máximo de rostros ajustado a: {max_faces}")
    
    def __del__(self):
        """Limpieza al destruir el objeto"""
        if hasattr(self, 'executor') and self.enable_parallel:
            self.executor.shutdown(wait=False)
