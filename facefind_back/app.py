"""
FaceFind API - Servidor Principal
Sistema de reconocimiento facial para localización de personas desaparecidas
"""
from flask import Flask, jsonify, request
from flask_cors import CORS

# Configuración
from config import Config

# Blueprints (Rutas API)
from api.auth_routes import auth_bp
from api.user_routes import user_bp
from api.caso_routes import caso_bp
from api.encodings_routes import encodings_bp
from api.foto_routes import foto_bp
from api.detection_routes import detection_bp
from api.alerta_routes import alerta_bp
from api.camera_routes import camera_bp


# Inicializar aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Configurar CORS - Más permisivo para desarrollo
CORS(app, 
     resources={r"/*": {
         "origins": "*",  # Permitir todos los orígenes en desarrollo
         "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
         "expose_headers": ["Content-Type"],
         "supports_credentials": False,  # Cambiar a False cuando origins es *
         "max_age": 3600
     }})

# Handler para OPTIONS (preflight)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS")
        return response

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(caso_bp, url_prefix="/casos")
app.register_blueprint(encodings_bp, url_prefix="/encodings")
app.register_blueprint(foto_bp, url_prefix="/fotos")
app.register_blueprint(detection_bp, url_prefix="/detection")
app.register_blueprint(alerta_bp, url_prefix="/alertas")
app.register_blueprint(camera_bp, url_prefix="/cameras")


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
            "detection": "/detection",
            "fotos": "/fotos",
            "alertas": "/alertas",
            "cameras": "/cameras"
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Verificar estado del servicio"""
    return jsonify({
        "status": "OK",
        "service": "FaceFind API",
        "message": "Servidor funcionando correctamente"
    }), 200

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
    print("\n🔍 Detección Facial (/detection):")
    print("   GET  /detection/status           - Estado del servicio")
    print("   POST /detection/detect-faces     - Detectar rostros en imagen")
    print("   GET  /detection/get-known-faces  - Lista de caras conocidas")
    print("   POST /detection/reload-encodings - Recargar encodings sin reiniciar")
    print("\n🚨 Alertas (/alertas):")
    print("   GET  /alertas                    - Listar alertas (con filtros)")
    print("   GET  /alertas/geojson            - Alertas en formato GeoJSON para mapas")
    print("   GET  /alertas/timeline           - Línea temporal de movimientos")
    print("   GET  /alertas/<id>               - Obtener alerta específica")
    print("   PATCH /alertas/<id>/estado       - Actualizar estado")
    print("   POST /alertas/<id>/revisar       - Marcar como revisada")
    print("   POST /alertas/<id>/falso-positivo - Marcar como falso positivo")
    print("\n📹 Cámaras (/cameras):")
    print("   GET  /cameras                    - Listar todas las cámaras")
    print("   POST /cameras                    - Crear nueva cámara")
    print("   GET  /cameras/<id>               - Obtener cámara específica")
    print("   PUT  /cameras/<id>               - Actualizar cámara")
    print("   DELETE /cameras/<id>             - Eliminar cámara")
    print("   GET  /cameras/active             - Listar cámaras activas")
    print("   PATCH /cameras/<id>/toggle       - Activar/Desactivar cámara")
    print("   GET  /cameras/stats              - Estadísticas de cámaras")
    print("\n" + "=" * 70)
    print(f"✅ Servidor corriendo en http://{Config.HOST}:{Config.PORT}")
    print(f"📊 Debug Mode: {'ON' if Config.DEBUG else 'OFF'}")
    print("=" * 70 + "\n")
    
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
