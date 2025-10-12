import face_recognition
import numpy as np
import pickle
import cv2
import time
from supabase import create_client, Client

class ProcesadorFaceFind:
    """
    Versión extendida de ProcesadorFaceFind.
    Carga encodings desde una tabla Supabase donde el vector está guardado como BYTEA.
    """

    def __init__(self, tolerance=0.6):
        self.tolerance = tolerance
        self.supabase: Client = self._init_supabase()
        self.known_encodings = []
        self.known_names = []

        # Cargar encodings desde Supabase (tabla, no bucket)
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
    # 📥 Cargar encodings desde la tabla
    # ======================================================
    def load_known_faces_from_db(self):
        """Carga los encodings desde la tabla 'encodings' donde el campo 'vector' es bytea."""
        try:
            response = self.supabase.table("encodings").select("*").execute()
            rows = response.data or []

            encodings = []
            names = []

            for row in rows:
                vector_bytes = row.get("vector")
                name = row.get("nombre") or row.get("name") or "Desconocido"

                try:
                    # ⚙️ Decodificar bytes -> numpy.ndarray
                    if isinstance(vector_bytes, (bytes, bytearray)):
                        encoding_array = pickle.loads(vector_bytes)
                    elif isinstance(vector_bytes, memoryview):
                        encoding_array = pickle.loads(vector_bytes.tobytes())
                    else:
                        print(f"⚠️ Tipo inesperado en vector: {type(vector_bytes)}")
                        continue

                    if isinstance(encoding_array, np.ndarray):
                        encodings.append(encoding_array)
                        names.append(name)
                    else:
                        print(f"⚠️ El vector de {name} no es ndarray")
                except Exception as e:
                    print(f"⚠️ Error decodificando encoding de {name}: {e}")

            self.known_encodings = encodings
            self.known_names = names
            print(f"✅ {len(self.known_encodings)} encodings cargados desde Supabase DB")

        except Exception as e:
            print(f"❌ Error cargando encodings desde Supabase: {e}")
            self.known_encodings = []
            self.known_names = []

    # ======================================================
    # 🧠 Procesamiento facial
    # ======================================================
    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locations = face_recognition.face_locations(rgb_frame, model="hog")
        encodings = face_recognition.face_encodings(rgb_frame, locations)

        faces = []
        for i, encoding in enumerate(encodings):
            results = self.compare_with_known_faces(encoding)
            top, right, bottom, left = locations[i]
            bbox = {
                "x": int(left),
                "y": int(top),
                "width": int(right - left),
                "height": int(bottom - top)
            }

            faces.append({
                "face_id": i,
                "location": (int(top), int(right), int(bottom), int(left)),
                "bbox": bbox,
                **results
            })

        return {
            "timestamp": time.time(),
            "faces_detected": len(faces),
            "faces": faces
        }

    # ======================================================
    # 🔍 Comparación facial
    # ======================================================
    def compare_with_known_faces(self, encoding):
        if not self.known_encodings:
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
    # 🧩 Agregar nuevos rostros
    # ======================================================
    def add_new_face(self, encoding, name):
        """Agrega un nuevo rostro en memoria (no guarda en Supabase todavía)."""
        self.known_encodings.append(encoding)
        self.known_names.append(name)
        print(f"🆕 Agregado nuevo rostro: {name}")
