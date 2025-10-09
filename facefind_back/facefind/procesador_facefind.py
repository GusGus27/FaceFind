import face_recognition
import numpy as np
import pickle
import cv2
import time
import os

class ProcesadorFaceFind:
    def __init__(self, tolerance=0.6, encodings_path='encodings_test.pickle'):
        self.tolerance = tolerance
        self.encodings_path = encodings_path
        self.known_encodings = []
        self.known_names = []
        self.load_known_faces()

    def load_known_faces(self):
        if os.path.exists(self.encodings_path):
            with open(self.encodings_path, "rb") as file:
                data = pickle.load(file)
                self.known_encodings = data.get("encodings", [])
                self.known_names = data.get("names", [])
        else:
            print("⚠️ Archivo de encodings no encontrado.")

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        locations = face_recognition.face_locations(rgb_frame, model="hog")
        encodings = face_recognition.face_encodings(rgb_frame, locations)

        faces = []
        for i, encoding in enumerate(encodings):
            results = self.compare_with_known_faces(encoding)

            # locations[i] está en formato (top, right, bottom, left)
            top, right, bottom, left = locations[i]
            bbox = {
                "x": int(left),
                "y": int(top),
                "width": int(right - left),
                "height": int(bottom - top)
            }
            faces.append({
                "face_id": i,
                # mantenemos location con enteros para consistencia
                "location": (int(top), int(right), int(bottom), int(left)),
                "bbox": bbox,
                **results
            })

        return {
            "timestamp": time.time(),
            "faces_detected": len(faces),
            "faces": faces
        }

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
            } for i, d in enumerate(distances)
        ]

        return {
            "match_found": best_distance <= self.tolerance,
            "best_match_name": best_name,
            "similarity_percentage": round((1 - best_distance) * 100, 2),
            "distance": round(float(best_distance), 4),
            "all_similarities": sorted(similarities, key=lambda x: x["distance"])[:3]
        }
    
    def reconocer_rostro(self, image_path, tolerance=0.5):
        """Devuelve el nombre de la persona reconocida o None"""
        image = face_recognition.load_image_file(image_path)
        locations = face_recognition.face_locations(image)
        if not locations:
            print("No se detectó ningún rostro en la imagen.")
            return None
        encodings = face_recognition.face_encodings(image, locations)
        for encoding in encodings:
            matches = face_recognition.compare_faces(self.known_encodings, encoding, tolerance)
            if True in matches:
                matched_idxs = [i for (i, b) in enumerate(matches) if b]
                counts = {}
                for i in matched_idxs:
                    name = self.known_names[i]
                    counts[name] = counts.get(name, 0) + 1
                return max(counts, key=counts.get)
        return None
