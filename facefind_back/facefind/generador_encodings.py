import face_recognition
import numpy as np
import pickle
import os
import cv2

class GeneradorEncodings:
    """
    Clase responsable de generar y validar encodings faciales
    a partir de las imágenes de personas cargadas.
    """

    def __init__(self, dataset_path="dataset_faces", output_path="encodings.pickle"):
        self.dataset_path = dataset_path
        self.output_path = output_path
        self.encodings = []
        self.names = []

    def generar_encodings(self):
        """Recorre el dataset y genera encodings faciales por persona"""
        print("🧠 Iniciando generación de encodings...")

        for persona in os.listdir(self.dataset_path):
            persona_dir = os.path.join(self.dataset_path, persona)
            if not os.path.isdir(persona_dir):
                continue

            encodings_persona = []
            for filename in os.listdir(persona_dir):
                path_imagen = os.path.join(persona_dir, filename)
                imagen = face_recognition.load_image_file(path_imagen)
                ubicaciones = face_recognition.face_locations(imagen)

                if not ubicaciones:
                    print(f"⚠️ No se detectó rostro en {filename}")
                    continue

                encoding = face_recognition.face_encodings(imagen, ubicaciones)[0]
                encodings_persona.append(encoding)

            if len(encodings_persona) >= 1:
                # Validar consistencia (similitud promedio entre rostros)
                if self._validar_consistencia(encodings_persona):
                    for enc in encodings_persona:
                        self.encodings.append(enc)
                        self.names.append(persona)
                    print(f"✅ Encodings validados y agregados para {persona}")
                else:
                    print(f"❌ Encodings de {persona} no superan la consistencia mínima")

        self._guardar_encodings()
        print(f"📁 Encodings guardados en {self.output_path}")

    def _validar_consistencia(self, encodings, umbral=0.85):
        """Valida que los encodings de una misma persona sean consistentes (>85%)"""
        if len(encodings) < 2:
            return True  # No hay con qué comparar, se acepta por defecto

        distancias = []
        for i in range(len(encodings)):
            for j in range(i + 1, len(encodings)):
                dist = np.linalg.norm(encodings[i] - encodings[j])
                similitud = 1 - dist  # inverso de la distancia
                distancias.append(similitud)

        promedio = np.mean(distancias)
        print(f"🔍 Consistencia promedio: {promedio:.2f}")
        return promedio >= umbral

    def _guardar_encodings(self):
        """Guarda los encodings y nombres en un archivo pickle"""
        data = {"encodings": self.encodings, "names": self.names}
        with open(self.output_path, "wb") as file:
            pickle.dump(data, file)
