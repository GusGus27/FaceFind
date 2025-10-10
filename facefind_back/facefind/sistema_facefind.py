from flask import Blueprint, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import traceback
import os
import time
from facefind.procesador_facefind import ProcesadorFaceFind
from facefind.generador_encodings import GeneradorEncodings  

class SistemaFaceFind:
    def __init__(self):
        #self.app = Flask(__name__)
        self.app = Blueprint("facefind", __name__)
        CORS(self.app)
        self.procesador = ProcesadorFaceFind(tolerance=0.5)
        self.DATASET_PATH = "dataset_personas"
        self.ENCODINGS_PATH = "encodings_test.pickle"
        self.register_routes()

    def register_routes(self):
        app = self.app

        # ✅ Health check
        @app.route('/health', methods=['GET'])
        def health_check():
            if not self.procesador:
                return jsonify({"status": "ERROR", "error": "Servicio no inicializado"}), 500

            return jsonify({
                "status": "OK",
                "known_faces": len(self.procesador.known_encodings),
                "service": "FaceFind API"
            })

        # ✅ Detección de rostros
        @app.route('/detect-faces', methods=['POST'])
        def detect_faces():
            try:
                data = request.get_json()
                if not data or 'image' not in data:
                    return jsonify({"success": False, "error": "No se envió imagen"}), 400

                image_data = data['image']
                if ',' in image_data:
                    image_data = image_data.split(',')[1]

                img_bytes = base64.b64decode(image_data)
                img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

                if frame is None:
                    return jsonify({"success": False, "error": "No se pudo decodificar la imagen"}), 400

                start = time.time()
                results = self.procesador.process_frame(frame)
                print(f"⏱ Tiempo en process_frame: {time.time() - start:.2f}s")
                clean_results = self.clean_results_for_json(results)

                return jsonify({"success": True, "data": clean_results})

            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Error en detect_faces: {e}\n{error_trace}")
                return jsonify({
                    "success": False,
                    "error": str(e),
                    "traceback": error_trace if self.app.debug else None
                }), 500

        # ✅ Obtener lista de rostros conocidos
        @app.route('/get-known-faces', methods=['GET'])
        def get_known_faces():
            unique_names = list(set(self.procesador.known_names))
            return jsonify({
                "known_faces": unique_names,
                "total_encodings": len(self.procesador.known_encodings)
            })

        # ✅ Nuevo endpoint: regenerar encodings
        @app.route('/generate-encodings', methods=['POST'])
        def generate_encodings():
            try:
                if not os.path.exists(self.DATASET_PATH):
                    return jsonify({
                        "success": False,
                        "error": f"No se encontró el dataset en {self.DATASET_PATH}"
                    }), 400

                generator = GeneradorEncodings(
                    dataset_path=self.DATASET_PATH,
                    encodings_path=self.ENCODINGS_PATH
                )

                generator.generar_encodings()

                # ✅ Recargamos los encodings en el procesador actual
                self.procesador.load_known_faces()

                return jsonify({
                    "success": True,
                    "message": "Encodings generados y actualizados correctamente.",
                    "total_personas": len(generator.names)
                })

            except Exception as e:
                error_trace = traceback.format_exc()
                print(f"Error en generate_encodings: {e}\n{error_trace}")
                return jsonify({
                    "success": False,
                    "error": str(e),
                    "traceback": error_trace if self.app.debug else None
                }), 500

    # ✅ Limpiar resultados para JSON
    def clean_results_for_json(self, results):
        def convert(obj):
            if isinstance(obj, np.generic):
                return obj.item()
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj

        clean = {
            "timestamp": float(results["timestamp"]),
            "faces_detected": int(results["faces_detected"]),
            "faces": []
        }

        for face in results["faces"]:
            bbox = face.get("bbox", {})
            clean_face = {
                "face_id": int(face["face_id"]),
                "location": [convert(x) for x in face["location"]],
                "bbox": {
                    "x": convert(bbox.get("x", 0)),
                    "y": convert(bbox.get("y", 0)),
                    "width": convert(bbox.get("width", 0)),
                    "height": convert(bbox.get("height", 0))
                },
                "match_found": bool(face["match_found"]),
                "best_match_name": str(face["best_match_name"]),
                "similarity_percentage": float(face["similarity_percentage"]),
                "distance": float(face["distance"]),
                "top_matches": face["all_similarities"]
            }
            clean["faces"].append(clean_face)

        return clean

    def run(self):
        print("🚀 Iniciando FaceFind API...")
        #self.app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)