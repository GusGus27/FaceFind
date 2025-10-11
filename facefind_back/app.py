from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import json
import traceback  # Agregar para mejor debugging
from face_detection_service import FaceDetectionService

# 🔹 Importar blueprints de autenticación
from api.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)  # Permitir requests desde el frontend

# 🔹 Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')

# Inicializar el servicio de detección
try:
    detection_service = FaceDetectionService(tolerance=0.6)
    print(f"Servicio inicializado con {len(detection_service.known_encodings)} encodings")
except Exception as e:
    print(f"Error inicializando servicio: {e}")
    detection_service = None

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar que el servicio está funcionando"""
    if detection_service is None:
        return jsonify({
            "status": "ERROR",
            "error": "Servicio no inicializado"
        }), 500
    
    return jsonify({
        "status": "OK",
        "known_faces": len(detection_service.known_encodings),
        "service": "Face Detection API"
    })

@app.route('/detect-faces', methods=['POST'])
def detect_faces():
    """
    Endpoint principal para detectar rostros
    Recibe: imagen en base64
    Retorna: resultados de detección
    """
    try:
        if detection_service is None:
            return jsonify({
                "success": False,
                "error": "Servicio de detección no disponible"
            }), 500

        # Obtener datos del request
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "No se envió imagen"
            }), 400
        
        # Decodificar imagen base64
        image_data = data['image']
        
        # Remover prefijo si existe (data:image/jpeg;base64,)
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        print(f"📸 Procesando imagen de {len(image_data)} caracteres")
        
        # Convertir base64 a imagen
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({
                "success": False,
                "error": "No se pudo decodificar la imagen"
            }), 400
        
        print(f"Imagen decodificada: {frame.shape}")
        
        # Procesar frame
        results = detection_service.process_frame(frame)
        
        # Limpiar resultados para JSON
        clean_results = clean_results_for_json(results)
        
        print(f"Procesamiento exitoso: {clean_results['faces_detected']} rostros detectados")
        
        return jsonify({
            "success": True,
            "data": clean_results
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"Error en detect_faces: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": error_trace if app.debug else None
        }), 500

@app.route('/get-known-faces', methods=['GET'])
def get_known_faces():
    """Obtener lista de caras conocidas"""
    if detection_service is None:
        return jsonify({"error": "Servicio no disponible"}), 500
        
    unique_names = list(set(detection_service.known_names))
    return jsonify({
        "known_faces": unique_names,
        "total_encodings": len(detection_service.known_encodings)
    })

def clean_results_for_json(results):
    """Limpia los resultados para que sean serializables en JSON"""
    def convert_to_json_serializable(obj):
        """Convierte tipos no serializables a tipos básicos de Python"""
        if isinstance(obj, np.bool_):
            return bool(obj)
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, tuple):
            return list(obj)
        return obj
    
    clean_results = {
        "timestamp": float(results["timestamp"]),
        "faces_detected": int(results["faces_detected"]),
        "faces": []
    }
    
    for face in results["faces"]:
        clean_face = {
            "face_id": int(face["face_id"]),
            "location": [convert_to_json_serializable(x) for x in face["location"]],
            "bbox": {
                "x": convert_to_json_serializable(face["bbox"]["x"]),
                "y": convert_to_json_serializable(face["bbox"]["y"]),
                "width": convert_to_json_serializable(face["bbox"]["width"]),
                "height": convert_to_json_serializable(face["bbox"]["height"])
            },
            "match_found": bool(face["match_found"]),
            "best_match_name": str(face["best_match_name"]),
            "similarity_percentage": float(face["similarity_percentage"]),
            "distance": float(face["distance"]),
            "top_matches": []
        }
        
        # Limpiar similitudes
        for similarity in face["all_similarities"][:3]:
            clean_similarity = {
                "name": str(similarity["name"]),
                "similarity_percentage": float(similarity["similarity_percentage"]),
                "distance": float(similarity["distance"])
            }
            clean_face["top_matches"].append(clean_similarity)
        
        clean_results["faces"].append(clean_face)
    
    return clean_results

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Iniciando FaceFind API Server")
    print("=" * 50)
    print("\n📍 Endpoints disponibles:")
    print("\n🔐 Autenticación:")
    print("   POST /auth/signup    - Registrar nuevo usuario")
    print("   POST /auth/signin    - Iniciar sesión")
    print("   POST /auth/signout   - Cerrar sesión")
    print("\n🎯 Detección de rostros:")
    print("   GET  /health         - Estado del servicio")
    print("   POST /detect-faces   - Detectar rostros en imagen")
    print("   GET  /get-known-faces - Lista de caras conocidas")
    print("\n" + "=" * 50)
    print(f"✅ Servidor corriendo en http://localhost:5000")
    print("=" * 50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)