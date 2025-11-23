"""
Camera Routes - Endpoints para gestión de cámaras
HU-11: Gestión de Múltiples Cámaras
"""
from flask import Blueprint, request, jsonify
from services.camera_service import CameraService
import traceback

# Crear Blueprint
camera_bp = Blueprint('cameras', __name__)


# ============================================================================
# ENDPOINTS PRINCIPALES
# ============================================================================

@camera_bp.route('/', methods=['GET'])
def get_all_cameras():
    """
    Obtiene todas las cámaras del sistema
    
    Returns:
        JSON con lista de cámaras
    """
    try:
        cameras = CameraService.get_all_cameras()
        
        return jsonify({
            "success": True,
            "data": cameras,
            "total": len(cameras)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo cámaras: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/<int:camera_id>', methods=['GET'])
def get_camera(camera_id):
    """
    Obtiene una cámara específica por ID
    
    Args:
        camera_id: ID de la cámara
        
    Returns:
        JSON con datos de la cámara
    """
    try:
        camera = CameraService.get_camera_by_id(camera_id)
        
        return jsonify({
            "success": True,
            "data": camera
        }), 200

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 404
    except Exception as e:
        print(f"❌ Error obteniendo cámara {camera_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/', methods=['POST'])
def create_camera():
    """
    Crea una nueva cámara
    
    Request Body:
        {
            "nombre": "Cámara Principal",
            "type": "USB" | "IP",
            "ubicacion": "Entrada Principal",
            "url": "http://...",  // Obligatorio para tipo IP
            "resolution": "1920x1080",
            "fps": 30
        }
        
    Returns:
        JSON con cámara creada
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No se enviaron datos"
            }), 400

        camera = CameraService.create_camera(data)
        
        return jsonify({
            "success": True,
            "data": camera,
            "message": "Cámara creada exitosamente"
        }), 201

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 400
    except Exception as e:
        print(f"❌ Error creando cámara: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/<int:camera_id>', methods=['PUT'])
def update_camera(camera_id):
    """
    Actualiza una cámara existente
    
    Args:
        camera_id: ID de la cámara a actualizar
        
    Request Body:
        {
            "nombre": "Nuevo nombre",
            "ubicacion": "Nueva ubicación",
            "url": "Nueva URL",
            "resolution": "Nueva resolución",
            "fps": 60,
            "activa": true/false
        }
        
    Returns:
        JSON con cámara actualizada
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No se enviaron datos"
            }), 400

        camera = CameraService.update_camera(camera_id, data)
        
        return jsonify({
            "success": True,
            "data": camera,
            "message": "Cámara actualizada exitosamente"
        }), 200

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 404
    except Exception as e:
        print(f"❌ Error actualizando cámara {camera_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/<int:camera_id>', methods=['DELETE'])
def delete_camera(camera_id):
    """
    Elimina una cámara del sistema
    
    Args:
        camera_id: ID de la cámara a eliminar
        
    Returns:
        JSON con confirmación de eliminación
    """
    try:
        CameraService.delete_camera(camera_id)
        
        return jsonify({
            "success": True,
            "message": f"Cámara {camera_id} eliminada exitosamente"
        }), 200

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 404
    except Exception as e:
        print(f"❌ Error eliminando cámara {camera_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================================
# ENDPOINTS ADICIONALES
# ============================================================================

@camera_bp.route('/active', methods=['GET'])
def get_active_cameras():
    """
    Obtiene solo las cámaras activas
    
    Returns:
        JSON con lista de cámaras activas
    """
    try:
        cameras = CameraService.get_active_cameras()
        
        return jsonify({
            "success": True,
            "data": cameras,
            "total": len(cameras)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo cámaras activas: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/<int:camera_id>/toggle', methods=['PATCH'])
def toggle_camera_status(camera_id):
    """
    Alterna el estado activo/inactivo de una cámara
    
    Args:
        camera_id: ID de la cámara
        
    Returns:
        JSON con cámara actualizada
    """
    try:
        camera = CameraService.toggle_camera_status(camera_id)
        
        estado = "activada" if camera.get("activa") else "desactivada"
        
        return jsonify({
            "success": True,
            "data": camera,
            "message": f"Cámara {estado} exitosamente"
        }), 200

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 404
    except Exception as e:
        print(f"❌ Error alternando estado de cámara {camera_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/stats', methods=['GET'])
def get_cameras_stats():
    """
    Obtiene estadísticas de las cámaras
    
    Returns:
        JSON con estadísticas:
        - total: Total de cámaras
        - activas: Cámaras activas
        - inactivas: Cámaras inactivas
        - usb: Cámaras USB
        - ip: Cámaras IP
    """
    try:
        stats = CameraService.get_cameras_stats()
        
        return jsonify({
            "success": True,
            "data": stats
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo estadísticas de cámaras: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/usb/detect', methods=['GET'])
def detect_usb_cameras():
    """
    Detecta cámaras USB disponibles en el sistema
    
    Returns:
        JSON con lista de cámaras USB detectadas
    """
    try:
        import cv2
        available_cameras = []
        
        # Intentar detectar hasta 10 cámaras
        for i in range(10):
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                available_cameras.append({
                    "id": i,
                    "name": f"USB Camera {i}",
                    "device_id": i
                })
                cap.release()
        
        return jsonify({
            "success": True,
            "data": available_cameras,
            "total": len(available_cameras)
        }), 200
        
    except Exception as e:
        print(f"❌ Error detectando cámaras USB: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@camera_bp.route('/<int:camera_id>/stream', methods=['GET'])
def stream_camera(camera_id):
    """
    Stream de video de una cámara específica
    
    Args:
        camera_id: ID de la cámara
        
    Returns:
        Stream de video en formato multipart
    """
    from flask import Response
    import cv2
    
    def generate_frames(camera_data):
        """Generador de frames para streaming"""
        camera = None
        
        try:
            camera_type = camera_data.get("type", "USB")
            
            if camera_type == "USB":
                # Extraer device_id de la IP (formato: "usb://0")
                ip = camera_data.get("ip", "usb://0")
                device_id = int(ip.split("://")[1]) if "://" in ip else 0
                camera = cv2.VideoCapture(device_id)
            else:  # IP Camera
                url = camera_data.get("url") or camera_data.get("ip")
                if not url:
                    return
                camera = cv2.VideoCapture(url)
            
            if not camera.isOpened():
                print(f"❌ No se pudo abrir la cámara {camera_id}")
                return
            
            print(f"✅ Stream iniciado para cámara {camera_id}")
            
            while True:
                success, frame = camera.read()
                if not success:
                    break
                
                # Codificar frame como JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                if not ret:
                    continue
                
                frame_bytes = buffer.tobytes()
                
                # Enviar frame en formato multipart
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                
        except GeneratorExit:
            print(f"🔌 Cliente desconectado del stream {camera_id}")
        except Exception as e:
            print(f"❌ Error en stream de cámara {camera_id}: {str(e)}")
        finally:
            if camera:
                camera.release()
                print(f"🔒 Cámara {camera_id} liberada")
    
    try:
        camera_data = CameraService.get_camera_by_id(camera_id)
        
        if not camera_data.get("activa"):
            return jsonify({
                "success": False,
                "error": "La cámara no está activa"
            }), 400
        
        return Response(
            generate_frames(camera_data),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
        
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 404
    except Exception as e:
        print(f"❌ Error iniciando stream de cámara {camera_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
