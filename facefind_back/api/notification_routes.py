"""
Notification Routes - Endpoints para gestión de notificaciones
Sistema de alertas y notificaciones en tiempo real
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from services.notification_service import NotificationService
import traceback

# Crear Blueprint
notification_bp = Blueprint('notifications', __name__)


# ============================================================================
# ENDPOINTS PRINCIPALES
# ============================================================================

@notification_bp.route('/', methods=['GET'])
def obtener_notificaciones():
    """
    Obtiene notificaciones del sistema
    Query params: usuario_id, solo_no_leidas, limit
    """
    try:
        usuario_id = request.args.get('usuario_id', type=int)
        solo_no_leidas = request.args.get('solo_no_leidas', 'false').lower() == 'true'
        limit = request.args.get('limit', default=50, type=int)

        notificaciones = NotificationService.obtener_notificaciones(
            usuario_id=usuario_id,
            solo_no_leidas=solo_no_leidas,
            limit=limit
        )

        return jsonify({
            "success": True,
            "data": notificaciones,
            "total": len(notificaciones)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo notificaciones: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/unread-count', methods=['GET'])
def contar_no_leidas():
    """
    Cuenta las notificaciones no leídas
    Query params: usuario_id
    """
    try:
        usuario_id = request.args.get('usuario_id', type=int)

        count = NotificationService.contar_no_leidas(usuario_id=usuario_id)

        return jsonify({
            "success": True,
            "count": count
        }), 200

    except Exception as e:
        print(f"❌ Error contando notificaciones: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/<int:notificacion_id>/mark-read', methods=['PUT'])
def marcar_como_leida(notificacion_id):
    """
    Marca una notificación como leída
    """
    try:
        success = NotificationService.marcar_como_leida(notificacion_id)

        if success:
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
        print(f"❌ Error marcando notificación: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/mark-all-read', methods=['PUT'])
def marcar_todas_como_leidas():
    """
    Marca todas las notificaciones como leídas
    Query params: usuario_id (opcional)
    """
    try:
        usuario_id = request.args.get('usuario_id', type=int)

        success = NotificationService.marcar_todas_como_leidas(usuario_id=usuario_id)

        if success:
            return jsonify({
                "success": True,
                "message": "Todas las notificaciones marcadas como leídas"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "No se pudieron marcar las notificaciones"
            }), 400

    except Exception as e:
        print(f"❌ Error marcando todas las notificaciones: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/<int:notificacion_id>', methods=['DELETE'])
def eliminar_notificacion(notificacion_id):
    """
    Elimina una notificación
    """
    try:
        success = NotificationService.eliminar_notificacion(notificacion_id)

        if success:
            return jsonify({
                "success": True,
                "message": "Notificación eliminada"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "No se pudo eliminar la notificación"
            }), 400

    except Exception as e:
        print(f"❌ Error eliminando notificación: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/historial', methods=['GET'])
def obtener_historial():
    """
    Obtiene historial de notificaciones con filtros
    Query params: fecha_inicio, fecha_fin, severity
    """
    try:
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')
        severity = request.args.get('severity')

        # Convertir fechas si existen
        fecha_inicio = datetime.fromisoformat(fecha_inicio_str) if fecha_inicio_str else None
        fecha_fin = datetime.fromisoformat(fecha_fin_str) if fecha_fin_str else None

        historial = NotificationService.obtener_historial_notificaciones(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            severity=severity
        )

        return jsonify({
            "success": True,
            "data": historial,
            "total": len(historial)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo historial: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@notification_bp.route('/', methods=['POST'])
def crear_notificacion():
    """
    Crea una nueva notificación (admin only)
    Body: { title, message, severity, usuario_id? }
    """
    try:
        data = request.get_json()

        if not data or not data.get('title') or not data.get('message'):
            return jsonify({
                "success": False,
                "error": "Título y mensaje son requeridos"
            }), 400

        notificacion = NotificationService.crear_notificacion(
            title=data['title'],
            message=data['message'],
            severity=data.get('severity', 'medium'),
            usuario_id=data.get('usuario_id')
        )

        return jsonify({
            "success": True,
            "data": notificacion,
            "message": "Notificación creada exitosamente"
        }), 201

    except Exception as e:
        print(f"❌ Error creando notificación: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
