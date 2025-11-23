"""
Rutas API para gestión de notificaciones
Endpoints para historial, lectura y estadísticas
"""
from flask import Blueprint, jsonify, request
from services.notification_service import notification_service
from services.alerta_service import AlertaService
from functools import wraps
from services.supabase_client import supabase

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


def token_required(f):
    """Decorador para verificar autenticación"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "Token no proporcionado"}), 401
        
        try:
            # Extraer token sin 'Bearer '
            if token.startswith('Bearer '):
                token = token[7:]
            
            # Verificar token con Supabase
            user = supabase.auth.get_user(token)
            
            if not user:
                return jsonify({"error": "Token inválido"}), 401
            
            return f(user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({"error": f"Error de autenticación: {str(e)}"}), 401
    
    return decorated


def admin_required(f):
    """Decorador para verificar rol de administrador"""
    @wraps(f)
    @token_required
    def decorated(user, *args, **kwargs):
        try:
            # Obtener rol del usuario
            response = supabase.table("Usuario")\
                .select("rol")\
                .eq("id", user.user.id)\
                .single()\
                .execute()
            
            if not response.data or response.data.get("rol") != "admin":
                return jsonify({"error": "Acceso denegado. Se requiere rol de administrador"}), 403
            
            return f(user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({"error": f"Error verificando permisos: {str(e)}"}), 403
    
    return decorated


@notification_bp.route('/historial', methods=['GET'])
@token_required
def obtener_historial(user):
    """
    Obtiene el historial de notificaciones
    
    Query params:
        - limite: Número máximo de notificaciones (default: 50)
        - solo_no_leidas: Si True, solo retorna no leídas (default: False)
    """
    try:
        limite = int(request.args.get('limite', 50))
        solo_no_leidas = request.args.get('solo_no_leidas', 'false').lower() == 'true'
        
        notificaciones = notification_service.obtener_historial_notificaciones(
            limite=limite,
            solo_no_leidas=solo_no_leidas
        )
        
        return jsonify({
            "success": True,
            "total": len(notificaciones),
            "notificaciones": notificaciones
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error obteniendo historial: {str(e)}"
        }), 500


@notification_bp.route('/<int:notificacion_id>/marcar-leida', methods=['PUT'])
@token_required
def marcar_leida(user, notificacion_id):
    """
    Marca una notificación como leída
    
    Args:
        notificacion_id: ID de la notificación
    """
    try:
        exito = notification_service.marcar_notificacion_como_leida(notificacion_id)
        
        if exito:
            return jsonify({
                "success": True,
                "message": "Notificación marcada como leída"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "No se pudo marcar la notificación"
            }), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/no-leidas/count', methods=['GET'])
@token_required
def contar_no_leidas(user):
    """
    Cuenta el número de notificaciones no leídas
    """
    try:
        notificaciones = notification_service.obtener_historial_notificaciones(
            limite=200,
            solo_no_leidas=True
        )
        
        return jsonify({
            "success": True,
            "count": len(notificaciones)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/estadisticas', methods=['GET'])
@admin_required
def obtener_estadisticas(user):
    """
    Obtiene estadísticas del sistema de notificaciones
    Solo para administradores
    """
    try:
        # Estadísticas de la cola
        stats_cola = notification_service.obtener_estadisticas_cola()
        
        # Estadísticas del historial de alertas
        historial = AlertaService.obtener_historial()
        stats_historial = historial.obtener_estadisticas()
        
        return jsonify({
            "success": True,
            "cola": stats_cola,
            "historial_alertas": stats_historial
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/prioritarias', methods=['GET'])
@admin_required
def obtener_prioritarias(user):
    """
    Obtiene notificaciones de alta prioridad
    Solo para administradores
    """
    try:
        notificaciones = notification_service.obtener_historial_notificaciones(limite=100)
        
        # Filtrar solo las de alta prioridad
        prioritarias = [
            n for n in notificaciones 
            if n.get('prioridad') == 'ALTA'
        ]
        
        return jsonify({
            "success": True,
            "total": len(prioritarias),
            "notificaciones": prioritarias
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/alerta/<int:alerta_id>', methods=['GET'])
@token_required
def obtener_por_alerta(user, alerta_id):
    """
    Obtiene todas las notificaciones relacionadas a una alerta específica
    
    Args:
        alerta_id: ID de la alerta
    """
    try:
        response = supabase.table('notificaciones')\
            .select('*')\
            .eq('alerta_id', alerta_id)\
            .order('created_at', desc=True)\
            .execute()
        
        notificaciones = response.data if response.data else []
        
        return jsonify({
            "success": True,
            "total": len(notificaciones),
            "notificaciones": notificaciones
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/historial-alertas', methods=['GET'])
@admin_required
def obtener_historial_alertas(user):
    """
    Obtiene el historial completo de alertas
    Solo para administradores
    
    Query params:
        - prioridad: Filtrar por prioridad (ALTA, MEDIA, BAJA)
        - estado: Filtrar por estado (PENDIENTE, REVISADA, FALSO_POSITIVO)
    """
    try:
        historial = AlertaService.obtener_historial()
        
        # Aplicar filtros si existen
        prioridad_filtro = request.args.get('prioridad')
        estado_filtro = request.args.get('estado')
        
        if prioridad_filtro:
            from models.enums import PrioridadAlerta
            prioridad = PrioridadAlerta.from_string(prioridad_filtro)
            alertas = historial.obtener_por_prioridad(prioridad)
        elif estado_filtro:
            from models.enums import EstadoAlerta
            estado = EstadoAlerta.from_string(estado_filtro)
            alertas = historial.obtener_por_estado(estado)
        else:
            alertas = historial.getLista()
        
        return jsonify({
            "success": True,
            "total": len(alertas),
            "alertas": [alerta.to_dict() for alerta in alertas]
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/iniciar-procesamiento', methods=['POST'])
@admin_required
def iniciar_procesamiento(user):
    """
    Inicia el procesamiento asíncrono de notificaciones
    Solo para administradores
    """
    try:
        notification_service.iniciar_procesamiento_asincrono()
        
        return jsonify({
            "success": True,
            "message": "Procesamiento de notificaciones iniciado"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/detener-procesamiento', methods=['POST'])
@admin_required
def detener_procesamiento(user):
    """
    Detiene el procesamiento asíncrono de notificaciones
    Solo para administradores
    """
    try:
        notification_service.detener_procesamiento()
        
        return jsonify({
            "success": True,
            "message": "Procesamiento de notificaciones detenido"
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500


@notification_bp.route('/test-email', methods=['POST'])
@admin_required
def test_email(user):
    """
    Envía un email de prueba
    Solo para administradores
    
    Body JSON:
        - email: Email de destino
    """
    try:
        data = request.get_json()
        email_destino = data.get('email')
        
        if not email_destino:
            return jsonify({
                "success": False,
                "error": "Email de destino requerido"
            }), 400
        
        # Crear una alerta de prueba
        from models.alerta import Alerta
        from models.enums import PrioridadAlerta, EstadoAlerta
        from datetime import datetime
        
        alerta_prueba = Alerta(
            caso_id=0,
            camara_id=0,
            timestamp=datetime.now(),
            similitud=0.95,
            prioridad=PrioridadAlerta.ALTA,
            estado=EstadoAlerta.PENDIENTE,
            ubicacion="Ubicación de prueba"
        )
        
        # Crear notificación
        notificacion = alerta_prueba.crearNotificacion("email")
        notificacion.destinatario = email_destino
        
        # Enviar
        exito = notification_service.enviar_notificacion_email(notificacion)
        
        if exito:
            return jsonify({
                "success": True,
                "message": f"Email de prueba enviado a {email_destino}"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "No se pudo enviar el email de prueba"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error: {str(e)}"
        }), 500
