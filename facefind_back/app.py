"""
FaceFind API - Servidor Principal
Sistema de reconocimiento facial para localización de personas desaparecidas
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import traceback

# Configuración
from config import Config

# Servicios
from services.face_detection_service import FaceDetectionService

# Blueprints (Rutas API)
from api.auth_routes import auth_bp
from api.user_routes import user_bp
from api.caso_routes import caso_bp
from api.encodings_routes import encodings_bp
from api.foto_routes import foto_bp


# Inicializar aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}}, supports_credentials=True)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(caso_bp, url_prefix="/casos")
app.register_blueprint(encodings_bp, url_prefix="/encodings")
app.register_blueprint(foto_bp, url_prefix="/fotos")


# Inicializar servicio de detección facial
detection_service = None
try:
    detection_service = FaceDetectionService(
        encodings_path=Config.ENCODINGS_FILE,
        tolerance=Config.FACE_TOLERANCE
    )
    print(f"✅ Servicio de detección inicializado con {len(detection_service.known_encodings)} encodings")
except Exception as e:
    print(f"⚠️  Error inicializando servicio de detección: {e}")
    print("   El servidor continuará sin el servicio de detección facial")

# ============================================================================
# ENDPOINTS PRINCIPALES
# ============================================================================

@app.route('/')
def index():
    """Endpoint raíz - Información del API"""
    return jsonify({
        "message": "🔍 FaceFind API - Sistema de Reconocimiento Facial",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/auth",
            "users": "/users",
            "casos": "/casos",
            "encodings": "/encodings",
            "detection": "/detect-faces"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar estado del servicio"""
    status = {
        "status": "OK",
        "service": "FaceFind API",
        "detection_service": "available" if detection_service else "unavailable"
    }
    
    if detection_service:
        status["known_faces"] = len(detection_service.known_encodings)
    
    return jsonify(status), 200 if detection_service else 503

# ============================================================================
# ENDPOINTS DE DETECCIÓN FACIAL
# ============================================================================

@app.route('/detect-faces', methods=['POST'])
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
            "traceback": error_trace if app.debug else None
        }), 500

@app.route('/get-known-faces', methods=['GET'])
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

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

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
# INICIO DE LA APLICACIÓN
# ============================================================================

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 INICIANDO FACEFIND API SERVER")
    print("=" * 70)
    print("\n📍 ENDPOINTS DISPONIBLES:")
    print("\n🔐 Autenticación (/auth):")
    print("   POST /auth/signup    - Registrar nuevo usuario")
    print("   POST /auth/signin    - Iniciar sesión")
    print("   POST /auth/signout   - Cerrar sesión")
    print("\n👥 Usuarios (/users):")
    print("   GET  /users          - Listar usuarios")
    print("   GET  /users/<id>     - Obtener usuario")
    print("\n📁 Casos (/casos):")
    print("   GET  /casos          - Listar casos")
    print("   POST /casos          - Crear caso")
    print("   GET  /casos/<id>     - Obtener caso")
    print("\n🎯 Encodings (/encodings):")
    print("   POST /encodings      - Generar encodings")
    print("\n🔍 Detección Facial:")
    print("   GET  /health         - Estado del servicio")
    print("   POST /detect-faces   - Detectar rostros en imagen")
    print("   GET  /get-known-faces - Lista de caras conocidas")
    print("\n" + "=" * 70)
    print(f"✅ Servidor corriendo en http://{Config.HOST}:{Config.PORT}")
    print(f"📊 Debug Mode: {'ON' if Config.DEBUG else 'OFF'}")
    print("=" * 70 + "\n")
    
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
