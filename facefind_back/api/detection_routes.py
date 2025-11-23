"""
Detection Routes - Endpoints para reconocimiento facial
Maneja detección de rostros y recarga dinámica de encodings
"""
from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64
import traceback
from datetime import datetime

from models.procesador_facefind import ProcesadorFaceFind
from models.frame import Frame
from services.alerta_service import AlertaService

# Crear Blueprint
detection_bp = Blueprint('detection', __name__)

# Instancia global del procesador
detection_service = None

def initialize_detection_service():
    """Inicializa o reinicializa el servicio de detección"""
    global detection_service
    try:
        detection_service = ProcesadorFaceFind(
            tolerance=0.55,
            max_faces=3,
            enable_parallel=True
        )
        print(f"✅ Servicio de detección inicializado con {len(detection_service.known_encodings)} encodings")
        print(f"🎯 Detección: hasta {detection_service.max_faces} rostros por frame")
        print(f"🔄 Deduplicación: activada (sin alertas duplicadas)")
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
        "total_faces_detected": int(results.get("total_faces_detected", results["faces_detected"])),
        "faces_processed": int(results.get("faces_processed", results["faces_detected"])),
        "max_faces_limit": int(results.get("max_faces_limit", 3)),
        "processing_time_ms": float(results.get("processing_time_ms", 0)),
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
        
        # Agregar métrica de calidad si existe
        if "quality_score" in face:
            clean_face["quality_score"] = float(face["quality_score"])
        
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
        
        # Crear alertas y notificaciones para coincidencias válidas
        alertas_creadas = []
        notificaciones_creadas = []
        caso_id = data.get('caso_id')
        camara_id = data.get('camara_id', 1)
        
        for face in results["faces"]:
            # Crear notificación si similitud >= 40%, independientemente de match_found
            if face["similarity_percentage"] >= 40.0:
                try:
                    # SIEMPRE crear notificación cuando similitud >= 40%
                    from services.notification_service import NotificationService
                    
                    confidence_percent = int(face["similarity_percentage"])
                    persona_nombre = face["best_match_name"]
                    timestamp = datetime.now()
                    
                    # Determinar type y severity (3 opciones cada uno)
                    # Type: detection, alert, warning
                    if face["similarity_percentage"] >= 70:
                        notification_type = "alert"
                        severity = "high"
                    elif face["similarity_percentage"] >= 55:
                        notification_type = "warning"
                        severity = "medium"
                    else:
                        notification_type = "detection"
                        severity = "low"
                    
                    # Mensajes por defecto según combinación type-severity
                    message_templates = {
                        ("alert", "high"): f"⚠️ ALERTA: Detección de alta confianza de {persona_nombre}. Se recomienda verificación inmediata.",
                        ("warning", "medium"): f"⚡ ADVERTENCIA: Posible detección de {persona_nombre}. Requiere revisión.",
                        ("detection", "low"): f"👤 DETECCIÓN: Se registró una coincidencia con {persona_nombre}. Pendiente de confirmación."
                    }
                    
                    message = message_templates.get((notification_type, severity), 
                                                   f"Se detectó {persona_nombre} con {confidence_percent}% de similitud")
                    
                    # Crear notificación con usuario_id = 1 (admin por defecto)
                    notificacion = NotificationService.crear_notificacion(
                        title=persona_nombre,  # Nombre de la persona detectada
                        message=message,
                        severity=severity,
                        usuario_id=1,  # Admin
                        notification_type=notification_type
                    )
                    
                    notificaciones_creadas.append({
                        "notificacion_id": notificacion.get("id"),
                        "face_id": face["face_id"],
                        "similarity": face["similarity_percentage"],
                        "persona": persona_nombre
                    })
                    
                    print(f"✅ Notificación creada: {persona_nombre} ({face['similarity_percentage']:.1f}%)")
                    
                    # Si hay caso_id, TAMBIÉN crear alerta
                    if caso_id:
                        frame_obj = Frame(imagen=frame)
                        
                        alerta = AlertaService.crearAlerta(
                            timestamp=timestamp,
                            confidence=face["similarity_percentage"] / 100.0,
                            latitud=data.get('latitud', 0.0),
                            longitud=data.get('longitud', 0.0),
                            camara_id=camara_id,
                            status="PENDIENTE",
                            caso_id=caso_id,
                            frame=frame_obj,
                            falso_positivo=False
                        )
                        
                        alertas_creadas.append({
                            "alerta_id": alerta.id,
                            "face_id": face["face_id"],
                            "similarity": face["similarity_percentage"],
                            "persona": persona_nombre
                        })
                        
                        print(f"✅ Alerta creada: ID {alerta.id} - {persona_nombre} ({face['similarity_percentage']:.1f}%)")
                    
                except Exception as error:
                    print(f"❌ Error procesando rostro {face['face_id']}: {error}")
                    traceback.print_exc()
        
        # Limpiar resultados para JSON
        clean_results = clean_results_for_json(results)
        clean_results["alertas_creadas"] = alertas_creadas
        clean_results["notificaciones_creadas"] = notificaciones_creadas
        clean_results["total_alertas"] = len(alertas_creadas)
        clean_results["total_notificaciones"] = len(notificaciones_creadas)
        
        print(f"✅ Procesamiento exitoso: {clean_results['faces_detected']} rostros detectados, {len(notificaciones_creadas)} notificaciones creadas, {len(alertas_creadas)} alertas creadas")
        
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
    
    status_data = {
        "success": True,
        "status": "available",
        "known_faces": len(set(detection_service.known_names)),
        "total_encodings": len(detection_service.known_encodings),
        "max_faces": detection_service.max_faces,
        "parallel_processing_enabled": detection_service.enable_parallel,
        "deduplication_enabled": True
    }
    
    return jsonify(status_data)

@detection_bp.route('/configure-detection', methods=['POST'])
def configure_detection():
    """
    Configura parámetros de detección en tiempo real
    
    Body:
    {
        "max_faces": 3,  // Número máximo de rostros a procesar
        "tolerance": 0.6  // Umbral de similitud (opcional)
    }
    """
    try:
        if detection_service is None:
            return jsonify({
                "success": False,
                "error": "Servicio no disponible"
            }), 503
        
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No se enviaron datos"
            }), 400
        
        updated_params = {}
        
        # Actualizar max_faces
        if "max_faces" in data:
            max_faces = int(data["max_faces"])
            if max_faces < 1 or max_faces > 10:
                return jsonify({
                    "success": False,
                    "error": "max_faces debe estar entre 1 y 10"
                }), 400
            
            detection_service.set_max_faces(max_faces)
            updated_params["max_faces"] = max_faces
        
        # Actualizar tolerance
        if "tolerance" in data:
            tolerance = float(data["tolerance"])
            if tolerance < 0.0 or tolerance > 1.0:
                return jsonify({
                    "success": False,
                    "error": "tolerance debe estar entre 0.0 y 1.0"
                }), 400
            
            detection_service.tolerance = tolerance
            updated_params["tolerance"] = tolerance
        
        return jsonify({
            "success": True,
            "message": "Configuración actualizada",
            "updated_params": updated_params
        })
        
    except Exception as e:
        print(f"❌ Error en configure_detection: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Inicializar el servicio al cargar el módulo
initialize_detection_service()
