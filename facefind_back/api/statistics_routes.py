"""
Statistics Routes
Maneja los endpoints de estadísticas del sistema
Sigue el patrón de rutas usado en el proyecto
"""
from flask import Blueprint, request, jsonify
from services.statistics_service import StatisticsService

statistics_bp = Blueprint("statistics", __name__)


# ============================================================================
# ENDPOINTS DE ESTADÍSTICAS
# ============================================================================

@statistics_bp.route("/dashboard", methods=["GET"])
def get_dashboard_overview():
    """
    Obtiene resumen general del dashboard
    GET /statistics/dashboard
    
    Returns:
        JSON con métricas principales del sistema
    """
    try:
        overview = StatisticsService.get_dashboard_overview()
        return jsonify({
            "success": True,
            "data": overview
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/dashboard: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/temporal", methods=["GET"])
def get_temporal_analysis():
    """
    Obtiene análisis temporal de casos
    GET /statistics/temporal?period=month&days=30
    
    Query Parameters:
        period: Tipo de periodo (day, week, month)
        days: Número de días hacia atrás
        
    Returns:
        JSON con análisis temporal
    """
    try:
        period = request.args.get("period", "month")
        days = request.args.get("days", type=int)
        
        temporal_data = StatisticsService.get_temporal_analysis(period, days)
        return jsonify({
            "success": True,
            "data": temporal_data
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/temporal: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/detection-metrics", methods=["GET"])
def get_detection_metrics():
    """
    Obtiene métricas de detección facial
    GET /statistics/detection-metrics
    
    Returns:
        JSON con métricas de detección y falsos positivos
    """
    try:
        metrics = StatisticsService.get_detection_metrics()
        return jsonify({
            "success": True,
            "data": metrics
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/detection-metrics: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/heatmap", methods=["GET"])
def get_heatmap_data():
    """
    Obtiene datos para mapa de calor de detecciones
    GET /statistics/heatmap
    
    Returns:
        JSON con datos de ubicaciones y conteos
    """
    try:
        heatmap_data = StatisticsService.get_heatmap_data()
        return jsonify({
            "success": True,
            "data": heatmap_data
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/heatmap: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/demographics", methods=["GET"])
def get_demographic_analysis():
    """
    Obtiene análisis demográfico de casos
    GET /statistics/demographics
    
    Returns:
        JSON con distribución por edad y otros datos demográficos
    """
    try:
        demographics = StatisticsService.get_demographic_analysis()
        return jsonify({
            "success": True,
            "data": demographics
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/demographics: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/cameras", methods=["GET"])
def get_camera_statistics():
    """
    Obtiene estadísticas por cámara
    GET /statistics/cameras
    
    Returns:
        JSON con estadísticas de cada cámara
    """
    try:
        camera_stats = StatisticsService.get_camera_statistics()
        return jsonify({
            "success": True,
            "data": camera_stats
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/cameras: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/performance", methods=["GET"])
def get_performance_metrics():
    """
    Obtiene métricas de rendimiento del sistema
    GET /statistics/performance
    
    Returns:
        JSON con métricas de rendimiento y eficiencia
    """
    try:
        performance = StatisticsService.get_performance_metrics()
        return jsonify({
            "success": True,
            "data": performance
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/performance: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/report/complete", methods=["GET"])
def get_complete_report():
    """
    Genera un reporte completo del sistema
    GET /statistics/report/complete
    
    Returns:
        JSON con todas las métricas disponibles
    """
    try:
        report = StatisticsService.get_complete_report()
        return jsonify({
            "success": True,
            "data": report
        }), 200
        
    except Exception as e:
        print(f"Error en /statistics/report/complete: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================================
# ENDPOINTS DE EXPORTACIÓN
# ============================================================================

@statistics_bp.route("/export/pdf", methods=["POST"])
def export_report_pdf():
    """
    Exporta reporte a PDF
    POST /statistics/export/pdf
    
    Body:
        report_type: Tipo de reporte (dashboard, complete, custom)
        filters: Filtros opcionales
        
    Returns:
        PDF file
    """
    try:
        data = request.get_json()
        report_type = data.get("report_type", "complete")
        
        # TODO: Implementar generación de PDF con reportlab o weasyprint
        # Por ahora retorna mensaje de no implementado
        return jsonify({
            "success": False,
            "error": "PDF export not implemented yet",
            "message": "Esta funcionalidad estará disponible próximamente"
        }), 501
        
    except Exception as e:
        print(f"Error en /statistics/export/pdf: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/export/excel", methods=["POST"])
def export_report_excel():
    """
    Exporta reporte a Excel
    POST /statistics/export/excel
    
    Body:
        report_type: Tipo de reporte (dashboard, complete, custom)
        filters: Filtros opcionales
        
    Returns:
        Excel file
    """
    try:
        data = request.get_json()
        report_type = data.get("report_type", "complete")
        
        # TODO: Implementar generación de Excel con openpyxl o xlsxwriter
        # Por ahora retorna mensaje de no implementado
        return jsonify({
            "success": False,
            "error": "Excel export not implemented yet",
            "message": "Esta funcionalidad estará disponible próximamente"
        }), 501
        
    except Exception as e:
        print(f"Error en /statistics/export/excel: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@statistics_bp.route("/export/csv", methods=["POST"])
def export_report_csv():
    """
    Exporta reporte a CSV
    POST /statistics/export/csv
    
    Body:
        report_type: Tipo de reporte (dashboard, complete, custom)
        data_type: Tipo de datos (cases, users, detections)
        
    Returns:
        CSV file
    """
    try:
        data = request.get_json()
        data_type = data.get("data_type", "cases")
        
        # TODO: Implementar generación de CSV
        # Por ahora retorna mensaje de no implementado
        return jsonify({
            "success": False,
            "error": "CSV export not implemented yet",
            "message": "Esta funcionalidad estará disponible próximamente"
        }), 501
        
    except Exception as e:
        print(f"Error en /statistics/export/csv: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
