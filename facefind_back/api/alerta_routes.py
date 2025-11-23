"""
Alerta Routes - Endpoints para gestión de alertas
Según diagrama UML - AlertaService
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from services.alerta_service import AlertaService
from models.enums import EstadoAlerta
import traceback

# Crear Blueprint
alerta_bp = Blueprint('alertas', __name__)


# ============================================================================
# ENDPOINTS PRINCIPALES SEGÚN UML
# ============================================================================

@alerta_bp.route('/', methods=['GET'])
def obtener_alertas():
    """
    Obtiene alertas con filtros opcionales
    Query params: caso_id, camara_id, fecha_inicio, fecha_fin, estado, prioridad
    """
    try:
        # Obtener parámetros de filtro
        caso_id = request.args.get('caso_id', type=int)
        camara_id = request.args.get('camara_id', type=int)
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        estado = request.args.get('estado')
        prioridad = request.args.get('prioridad')

        # Aplicar filtros según UML
        if caso_id:
            alertas = AlertaService.getAlertasPorCaso(caso_id)
        elif camara_id:
            alertas = AlertaService.getAlertasPorCamara(camara_id)
        elif fecha_inicio and fecha_fin:
            fecha_inicio_dt = datetime.fromisoformat(fecha_inicio)
            fecha_fin_dt = datetime.fromisoformat(fecha_fin)
            alertas = AlertaService.getAlertasPorFecha(fecha_inicio_dt, fecha_fin_dt)
        else:
            # Si no hay filtros específicos, obtener todas (limitado)
            alertas = AlertaService.obtener_alertas_pendientes()

        # Filtros adicionales
        if estado:
            alertas = [a for a in alertas if a.estado.to_string() == estado.upper()]
        if prioridad:
            alertas = [a for a in alertas if a.prioridad.to_string() == prioridad.upper()]

        return jsonify({
            "success": True,
            "data": [alerta.to_dict() for alerta in alertas],
            "total": len(alertas)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo alertas: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/geojson', methods=['GET'])
def obtener_alertas_geojson():
    """
    Obtiene alertas en formato GeoJSON para visualización en mapas
    Query params: caso_id, camara_id, fecha_inicio, fecha_fin
    
    Response: FeatureCollection GeoJSON con marcadores de alertas
    """
    try:
        # Obtener parámetros de filtro
        caso_id = request.args.get('caso_id', type=int)
        camara_id = request.args.get('camara_id', type=int)
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')

        # Convertir fechas
        fecha_inicio = datetime.fromisoformat(fecha_inicio_str) if fecha_inicio_str else None
        fecha_fin = datetime.fromisoformat(fecha_fin_str) if fecha_fin_str else None

        # Obtener GeoJSON
        geojson = AlertaService.obtener_alertas_geojson(
            caso_id=caso_id,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            camara_id=camara_id
        )

        return jsonify(geojson), 200

    except Exception as e:
        print(f"❌ Error obteniendo GeoJSON de alertas: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "type": "FeatureCollection",
            "features": [],
            "error": str(e)
        }), 500


@alerta_bp.route('/timeline', methods=['GET'])
def obtener_timeline():
    """
    Obtiene línea temporal de alertas (para visualización de movimientos)
    Query params: caso_id, fecha_inicio, fecha_fin
    """
    try:
        caso_id = request.args.get('caso_id', type=int)
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')

        # Validar que se proporcione caso_id
        if not caso_id:
            return jsonify({
                "success": False,
                "error": "caso_id es requerido"
            }), 400

        # Convertir fechas
        if fecha_inicio_str and fecha_fin_str:
            fecha_inicio = datetime.fromisoformat(fecha_inicio_str)
            fecha_fin = datetime.fromisoformat(fecha_fin_str)
            alertas = AlertaService.getAlertasPorFecha(fecha_inicio, fecha_fin)
            # Filtrar por caso
            alertas = [a for a in alertas if a.caso_id == caso_id]
        else:
            alertas = AlertaService.getAlertasPorCaso(caso_id)

        # Ordenar por timestamp (cronológico)
        alertas_ordenadas = sorted(alertas, key=lambda a: a.timestamp)

        # Construir timeline
        timeline = []
        for alerta in alertas_ordenadas:
            timeline.append({
                "id": alerta.id,
                "timestamp": alerta.timestamp.isoformat() if isinstance(alerta.timestamp, datetime) else alerta.timestamp,
                "ubicacion": alerta.ubicacion,
                "latitud": alerta.latitud,
                "longitud": alerta.longitud,
                "similitud": alerta.similitud,
                "camara_id": alerta.camara_id,
                "estado": alerta.estado.to_string(),
                "prioridad": alerta.prioridad.to_string()
            })

        return jsonify({
            "success": True,
            "data": {
                "caso_id": caso_id,
                "total_detecciones": len(timeline),
                "timeline": timeline
            }
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo timeline: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/<int:alerta_id>', methods=['GET'])
def obtener_alerta(alerta_id):
    """Obtiene una alerta específica por ID"""
    try:
        alerta = AlertaService.obtener_alerta_por_id(alerta_id)
        
        if not alerta:
            return jsonify({
                "success": False,
                "error": "Alerta no encontrada"
            }), 404

        return jsonify({
            "success": True,
            "data": alerta.to_dict()
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo alerta: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/<int:alerta_id>/estado', methods=['PATCH'])
def actualizar_estado(alerta_id):
    """
    Actualiza el estado de una alerta
    Body: { "estado": "REVISADA" | "FALSO_POSITIVO" | "PENDIENTE" }
    """
    try:
        data = request.get_json()
        nuevo_estado_str = data.get('estado')

        if not nuevo_estado_str:
            return jsonify({
                "success": False,
                "error": "Estado es requerido"
            }), 400

        # Convertir a enum
        nuevo_estado = EstadoAlerta.from_string(nuevo_estado_str)

        # Actualizar
        success = AlertaService.actualizar_estado_alerta(alerta_id, nuevo_estado)

        if not success:
            return jsonify({
                "success": False,
                "error": "No se pudo actualizar el estado"
            }), 500

        return jsonify({
            "success": True,
            "message": f"Estado actualizado a {nuevo_estado_str}"
        }), 200

    except Exception as e:
        print(f"❌ Error actualizando estado: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/<int:alerta_id>/revisar', methods=['POST'])
def marcar_revisada(alerta_id):
    """Marca una alerta como revisada"""
    try:
        success = AlertaService.marcar_como_revisada(alerta_id)

        if not success:
            return jsonify({
                "success": False,
                "error": "No se pudo marcar como revisada"
            }), 500

        return jsonify({
            "success": True,
            "message": "Alerta marcada como revisada"
        }), 200

    except Exception as e:
        print(f"❌ Error marcando como revisada: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/<int:alerta_id>/falso-positivo', methods=['POST'])
def marcar_falso_positivo(alerta_id):
    """Marca una alerta como falso positivo"""
    try:
        success = AlertaService.marcar_como_falso_positivo(alerta_id)

        if not success:
            return jsonify({
                "success": False,
                "error": "No se pudo marcar como falso positivo"
            }), 500

        return jsonify({
            "success": True,
            "message": "Alerta marcada como falso positivo"
        }), 200

    except Exception as e:
        print(f"❌ Error marcando como falso positivo: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/estadisticas', methods=['GET'])
def obtener_estadisticas():
    """Obtiene estadísticas generales de alertas"""
    try:
        stats = AlertaService.obtener_estadisticas_alertas()

        return jsonify({
            "success": True,
            "data": stats
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo estadísticas: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/pendientes', methods=['GET'])
def obtener_pendientes():
    """Obtiene todas las alertas pendientes de revisión"""
    try:
        alertas = AlertaService.obtener_alertas_pendientes()

        return jsonify({
            "success": True,
            "data": [alerta.to_dict() for alerta in alertas],
            "total": len(alertas)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo alertas pendientes: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@alerta_bp.route('/alta-prioridad', methods=['GET'])
def obtener_alta_prioridad():
    """Obtiene todas las alertas de alta prioridad"""
    try:
        alertas = AlertaService.obtener_alertas_alta_prioridad()

        return jsonify({
            "success": True,
            "data": [alerta.to_dict() for alerta in alertas],
            "total": len(alertas)
        }), 200

    except Exception as e:
        print(f"❌ Error obteniendo alertas de alta prioridad: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
