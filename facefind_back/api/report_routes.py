"""
Report Routes - Endpoints para exportación de reportes
"""
from flask import Blueprint, request, send_file, jsonify
from datetime import datetime
from services.report_service import ReportService
import traceback

# Crear Blueprint
report_bp = Blueprint('reports', __name__)


@report_bp.route('/export/excel', methods=['GET'])
def exportar_excel():
    """
    Exporta reporte de alertas en formato Excel
    
    Query params:
        - fecha_inicio: Fecha inicio (ISO format)
        - fecha_fin: Fecha fin (ISO format)
        - estado: Estado de alerta (PENDIENTE, REVISADA, FALSO_POSITIVO)
        - usuario_id: ID del usuario
        - camara_id: ID de la cámara
        
    Returns:
        Archivo Excel con reportes y gráficos
    """
    try:
        # Obtener parámetros
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')
        estado = request.args.get('estado')
        usuario_id = request.args.get('usuario_id', type=int)
        camara_id = request.args.get('camara_id', type=int)
        
        # Convertir fechas
        fecha_inicio = datetime.fromisoformat(fecha_inicio_str) if fecha_inicio_str else None
        fecha_fin = datetime.fromisoformat(fecha_fin_str) if fecha_fin_str else None
        
        # Generar reporte
        excel_file = ReportService.generar_reporte_excel(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado,
            usuario_id=usuario_id,
            camara_id=camara_id
        )
        
        # Nombre del archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"FaceFind_Reporte_{timestamp}.xlsx"
        
        return send_file(
            excel_file,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"❌ Error exportando Excel: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@report_bp.route('/export/csv', methods=['GET'])
def exportar_csv():
    """
    Exporta reporte de alertas en formato CSV
    
    Query params:
        - fecha_inicio: Fecha inicio (ISO format)
        - fecha_fin: Fecha fin (ISO format)
        - estado: Estado de alerta
        - usuario_id: ID del usuario
        - camara_id: ID de la cámara
        
    Returns:
        Archivo CSV con datos de alertas
    """
    try:
        # Obtener parámetros
        fecha_inicio_str = request.args.get('fecha_inicio')
        fecha_fin_str = request.args.get('fecha_fin')
        estado = request.args.get('estado')
        usuario_id = request.args.get('usuario_id', type=int)
        camara_id = request.args.get('camara_id', type=int)
        
        # Convertir fechas
        fecha_inicio = datetime.fromisoformat(fecha_inicio_str) if fecha_inicio_str else None
        fecha_fin = datetime.fromisoformat(fecha_fin_str) if fecha_fin_str else None
        
        # Generar reporte
        csv_file = ReportService.generar_reporte_csv(
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            estado=estado,
            usuario_id=usuario_id,
            camara_id=camara_id
        )
        
        # Nombre del archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"FaceFind_Reporte_{timestamp}.csv"
        
        return send_file(
            csv_file,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        print(f"❌ Error exportando CSV: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@report_bp.route('/filtros', methods=['GET'])
def obtener_filtros_disponibles():
    """
    Obtiene los valores disponibles para filtros
    
    Returns:
        JSON con opciones de filtros (estados, usuarios, cámaras)
    """
    try:
        from services.supabase_client import supabase
        
        # Obtener estados únicos
        estados_response = supabase.table("Alerta")\
            .select("estado")\
            .execute()
        
        estados = list(set([a['estado'] for a in estados_response.data if a.get('estado')]))
        
        # Obtener usuarios
        usuarios_response = supabase.table("Usuario")\
            .select("id, nombre, email")\
            .execute()
        
        usuarios = [
            {"id": u['id'], "nombre": u['nombre'], "email": u['email']}
            for u in usuarios_response.data
        ]
        
        # Obtener cámaras
        camaras_response = supabase.table("Camara")\
            .select("id, ubicacion, type")\
            .execute()
        
        camaras = [
            {"id": c['id'], "ubicacion": c['ubicacion'], "type": c['type']}
            for c in camaras_response.data
        ]
        
        return jsonify({
            "success": True,
            "data": {
                "estados": estados,
                "usuarios": usuarios,
                "camaras": camaras
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error obteniendo filtros: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
