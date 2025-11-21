"""
Detection Routes - Endpoints para reconocimiento facial
Maneja detección de rostros y recarga dinámica de encodings
"""
from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64
import traceback

from models.procesador_facefind import ProcesadorFaceFind

# Crear Blueprint
detection_bp = Blueprint('detection', __name__)

# Instancia global del procesador
detection_service = None

def initialize_detection_service():
    """Inicializa o reinicializa el servicio de detección"""
    global detection_service
    try:
        detection_service = ProcesadorFaceFind()
        print(f"✅ Servicio de detección inicializado con {len(detection_service.known_encodings)} encodings")
        return True
    except Exception as e:
        print(f"⚠️  Error inicializando servicio de detección: {e}")
        detection_service = None
        return False

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

# ============================================================================
# ENDPOINTS
# ============================================================================

@detection_bp.route('/detect-faces', methods=['POST'])
def detect_faces():
    """
    Endpoint principal para detectar rostros
    
    Request:
        {
            "image": "base64_encoded_image"
        }
    
    Response:
        {
            "success": true,
            "data": {
                "timestamp": 1234567890.123,
                "faces_detected": 2,
                "faces": [...]
            }
        }
    """
    try:
        if detection_service is None:
            return jsonify({
                "success": False,
                "error": "Servicio de detección no disponible"
            }), 503

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
        
        print(f"✅ Imagen decodificada: {frame.shape}")
        
        # Procesar frame
        results = detection_service.process_frame(frame)
        
        # Limpiar resultados para JSON
        clean_results = clean_results_for_json(results)
        
        print(f"✅ Procesamiento exitoso: {clean_results['faces_detected']} rostros detectados")
        
        return jsonify({
            "success": True,
            "data": clean_results
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ Error en detect_faces: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        return jsonify({
            "success": False,
            "error": str(e),
            "traceback": error_trace
        }), 500

@detection_bp.route('/get-known-faces', methods=['GET'])
def get_known_faces():
    """Obtener lista de caras conocidas registradas en el sistema"""
    if detection_service is None:
        return jsonify({
            "success": False,
            "error": "Servicio no disponible"
        }), 503
        
    unique_names = list(set(detection_service.known_names))
    
    return jsonify({
        "success": True,
        "data": {
            "known_faces": unique_names,
            "total_encodings": len(detection_service.known_encodings)
        }
    })

@detection_bp.route('/reload-encodings', methods=['POST'])
def reload_encodings():
    """
    Recarga los encodings faciales sin reiniciar el servidor
    Útil cuando se agregan nuevas personas al sistema
    
    Response:
        {
            "success": true,
            "message": "Encodings recargados",
            "total_encodings": 15
        }
    """
    try:
        success = initialize_detection_service()
        
        if success and detection_service:
            return jsonify({
                "success": True,
                "message": "Encodings recargados exitosamente",
                "total_encodings": len(detection_service.known_encodings),
                "known_faces": list(set(detection_service.known_names))
            })
        else:
            return jsonify({
                "success": False,
                "error": "No se pudieron recargar los encodings"
            }), 500
            
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ Error en reload_encodings: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@detection_bp.route('/status', methods=['GET'])
def detection_status():
    """Verificar estado del servicio de detección"""
    if detection_service is None:
        return jsonify({
            "success": False,
            "status": "unavailable",
            "message": "Servicio de detección no inicializado"
        }), 503
    
    return jsonify({
        "success": True,
        "status": "available",
        "known_faces": len(set(detection_service.known_names)),
        "total_encodings": len(detection_service.known_encodings)
    })

# Inicializar el servicio al cargar el módulo
initialize_detection_service()
