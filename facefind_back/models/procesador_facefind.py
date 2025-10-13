import face_recognition
import numpy as np
import cv2
import base64
import time
import binascii
from supabase import create_client, Client


class ProcesadorFaceFind:
    """
    Versión extendida de ProcesadorFaceFind.
    Carga encodings desde una tabla Supabase donde el vector está guardado como BYTEA o Base64.
    """

    def __init__(self, tolerance=0.55):
        self.tolerance = tolerance
        self.supabase: Client = self._init_supabase()
        self.known_encodings = []
        self.known_names = []

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
    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locations = face_recognition.face_locations(rgb_frame, model="hog")
        encodings = face_recognition.face_encodings(rgb_frame, locations)

        faces = []
        print(f"\n🧠 Detectadas {len(encodings)} caras en el frame")

        for i, encoding in enumerate(encodings):
            results = self.compare_with_known_faces(encoding)
            top, right, bottom, left = locations[i]

            bbox = {
                "x": int(left),
                "y": int(top),
                "width": int(right - left),
                "height": int(bottom - top)
            }

            # 💬 Mostrar resumen en consola
            if results["match_found"]:
                print(f"✅ Rostro {i}: Coincide con {results['best_match_name']} "
                    f"(Similitud: {results['similarity_percentage']}%, "
                    f"Distancia: {results['distance']})")
            else:
                print(f"❌ Rostro {i}: No hay coincidencia (Distancia mínima: {results['distance']})")

            # 💬 Mostrar los 3 más similares
            print("   🔎 Top 3 coincidencias:")
            for sim in results["all_similarities"]:
                print(f"      - {sim['name']}: {sim['similarity_percentage']}% (dist {sim['distance']})")

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
