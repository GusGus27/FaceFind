"""
Statistics Service
Maneja la lógica de negocio para estadísticas y reportes del sistema
Sigue el patrón Service Layer usado en el proyecto
"""
from repositories.statistics_repository import StatisticsRepository
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class StatisticsService:
    """
    Servicio para estadísticas y reportes del sistema FaceFind
    Arquitectura en capas: Controller -> Service -> Repository -> DB
    """
    
    @staticmethod
    def get_dashboard_overview() -> Dict:
        """
        Obtiene resumen general del dashboard
        Métricas principales del sistema
        
        Returns:
            Dict con métricas del dashboard
        """
        try:
            # Obtener datos de diferentes repositorios
            cases_by_status = StatisticsRepository.get_cases_by_status()
            cases_by_priority = StatisticsRepository.get_cases_by_priority()
            resolution_stats = StatisticsRepository.get_resolution_stats()
            user_stats = StatisticsRepository.get_user_activity_stats()
            detection_stats = StatisticsRepository.get_detection_stats()
            
            # Calcular totales
            total_cases = sum(cases_by_status.values())
            active_cases = cases_by_status.get("activo", 0) + cases_by_status.get("en_progreso", 0)
            resolved_cases = cases_by_status.get("resuelto", 0)
            pending_cases = cases_by_status.get("pendiente", 0)
            
            # Calcular tasa de resolución
            resolution_rate = (resolved_cases / total_cases * 100) if total_cases > 0 else 0
            
            return {
                "summary": {
                    "total_cases": total_cases,
                    "active_cases": active_cases,
                    "resolved_cases": resolved_cases,
                    "pending_cases": pending_cases,
                    "resolution_rate": round(resolution_rate, 1),
                    "total_users": user_stats["total_users"],
                    "active_users": user_stats["active_users"]
                },
                "cases_by_status": cases_by_status,
                "cases_by_priority": cases_by_priority,
                "resolution_stats": resolution_stats,
                "detection_stats": detection_stats,
                "user_stats": user_stats,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_dashboard_overview: {str(e)}")
            raise
    
    @staticmethod
    def get_temporal_analysis(period: str = "month", days: Optional[int] = None) -> Dict:
        """
        Obtiene análisis temporal de casos
        
        Args:
            period: Tipo de periodo ('day', 'week', 'month')
            days: Número de días hacia atrás (opcional)
            
        Returns:
            Dict con análisis temporal
        """
        try:
            if period == "day":
                days = days or 7
                timeline = StatisticsRepository.get_cases_timeline(days)
                return {
                    "period": "daily",
                    "days": days,
                    "data": timeline
                }
            elif period == "week":
                days = days or 28
                timeline = StatisticsRepository.get_cases_timeline(days)
                # Agrupar por semana
                weekly_data = StatisticsService._group_by_week(timeline)
                return {
                    "period": "weekly",
                    "weeks": len(weekly_data),
                    "data": weekly_data
                }
            else:  # month
                months = days // 30 if days else 6
                monthly_trends = StatisticsRepository.get_monthly_trends(months)
                return {
                    "period": "monthly",
                    "months": len(monthly_trends),
                    "data": monthly_trends
                }
                
        except Exception as e:
            print(f"Error in StatisticsService.get_temporal_analysis: {str(e)}")
            raise
    
    @staticmethod
    def get_detection_metrics() -> Dict:
        """
        Obtiene métricas de detección facial
        Incluye tasa de detección y falsos positivos
        
        Returns:
            Dict con métricas de detección
        """
        try:
            detection_stats = StatisticsRepository.get_detection_stats()
            
            # Calcular métricas adicionales
            total_detections = detection_stats["total_detections"]
            true_positives = detection_stats["true_positives"]
            false_positives = detection_stats["false_positives"]
            
            # Calcular tasas
            detection_rate = (true_positives / total_detections * 100) if total_detections > 0 else 0
            false_positive_rate = (false_positives / total_detections * 100) if total_detections > 0 else 0
            accuracy = ((true_positives) / (true_positives + false_positives) * 100) if (true_positives + false_positives) > 0 else 0
            
            return {
                "total_detections": total_detections,
                "true_positives": true_positives,
                "false_positives": false_positives,
                "detection_rate": round(detection_rate, 2),
                "false_positive_rate": round(false_positive_rate, 2),
                "accuracy": round(accuracy, 2),
                "status": "operational" if total_detections > 0 else "no_data"
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_detection_metrics: {str(e)}")
            raise
    
    @staticmethod
    def get_heatmap_data() -> Dict:
        """
        Obtiene datos para el mapa de calor de detecciones
        
        Returns:
            Dict con datos de ubicaciones y conteos
        """
        try:
            geographic_distribution = StatisticsRepository.get_geographic_distribution()
            
            # Limitar a top 20 ubicaciones
            top_locations = geographic_distribution[:20]
            
            return {
                "locations": top_locations,
                "total_locations": len(geographic_distribution),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_heatmap_data: {str(e)}")
            raise
    
    @staticmethod
    def get_demographic_analysis() -> Dict:
        """
        Obtiene análisis demográfico de casos
        
        Returns:
            Dict con análisis demográfico
        """
        try:
            age_groups = StatisticsRepository.get_cases_by_age_group()
            
            # Calcular total
            total = sum(age_groups.values())
            
            # Calcular porcentajes
            age_distribution = {}
            for group, count in age_groups.items():
                percentage = (count / total * 100) if total > 0 else 0
                age_distribution[group] = {
                    "count": count,
                    "percentage": round(percentage, 1)
                }
            
            return {
                "age_distribution": age_distribution,
                "total_cases": total,
                "most_common_group": max(age_groups.items(), key=lambda x: x[1])[0] if age_groups else None
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_demographic_analysis: {str(e)}")
            raise
    
    @staticmethod
    def get_camera_statistics() -> List[Dict]:
        """
        Obtiene estadísticas por cámara
        (Placeholder para implementación futura con sistema de cámaras)
        
        Returns:
            Lista de estadísticas por cámara
        """
        try:
            # TODO: Implementar cuando el sistema de cámaras esté completo
            # Por ahora retorna datos de ejemplo
            return [
                {
                    "camera_id": "cam_001",
                    "camera_name": "Cámara Principal - Entrada",
                    "detections": 0,
                    "true_positives": 0,
                    "false_positives": 0,
                    "status": "inactive",
                    "uptime": 0.0
                },
                {
                    "camera_id": "cam_002",
                    "camera_name": "Cámara Secundaria - Patio",
                    "detections": 0,
                    "true_positives": 0,
                    "false_positives": 0,
                    "status": "inactive",
                    "uptime": 0.0
                }
            ]
            
        except Exception as e:
            print(f"Error in StatisticsService.get_camera_statistics: {str(e)}")
            return []
    
    @staticmethod
    def get_performance_metrics() -> Dict:
        """
        Obtiene métricas de rendimiento del sistema
        
        Returns:
            Dict con métricas de rendimiento
        """
        try:
            resolution_stats = StatisticsRepository.get_resolution_stats()
            user_stats = StatisticsRepository.get_user_activity_stats()
            cases_by_status = StatisticsRepository.get_cases_by_status()
            
            total_cases = sum(cases_by_status.values())
            resolved_cases = cases_by_status.get("resuelto", 0)
            
            # Calcular eficiencia
            resolution_efficiency = (resolved_cases / total_cases * 100) if total_cases > 0 else 0
            user_engagement = (user_stats["users_with_cases"] / user_stats["total_users"] * 100) if user_stats["total_users"] > 0 else 0
            
            return {
                "resolution_efficiency": round(resolution_efficiency, 1),
                "avg_resolution_time_days": resolution_stats["avg_resolution_days"],
                "fastest_resolution_days": resolution_stats["fastest_resolution_days"],
                "slowest_resolution_days": resolution_stats["slowest_resolution_days"],
                "user_engagement": round(user_engagement, 1),
                "system_health": "excellent" if resolution_efficiency > 70 else "good" if resolution_efficiency > 50 else "needs_improvement"
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_performance_metrics: {str(e)}")
            raise
    
    @staticmethod
    def get_complete_report() -> Dict:
        """
        Genera un reporte completo del sistema
        Combina todas las métricas disponibles
        
        Returns:
            Dict con reporte completo
        """
        try:
            return {
                "dashboard_overview": StatisticsService.get_dashboard_overview(),
                "temporal_analysis": StatisticsService.get_temporal_analysis(period="month"),
                "detection_metrics": StatisticsService.get_detection_metrics(),
                "heatmap_data": StatisticsService.get_heatmap_data(),
                "demographic_analysis": StatisticsService.get_demographic_analysis(),
                "camera_statistics": StatisticsService.get_camera_statistics(),
                "performance_metrics": StatisticsService.get_performance_metrics(),
                "report_generated_at": datetime.now().isoformat(),
                "report_type": "complete_system_report"
            }
            
        except Exception as e:
            print(f"Error in StatisticsService.get_complete_report: {str(e)}")
            raise
    
    # ============================================================================
    # MÉTODOS AUXILIARES
    # ============================================================================
    
    @staticmethod
    def _group_by_week(daily_data: List[Dict]) -> List[Dict]:
        """
        Agrupa datos diarios por semana
        
        Args:
            daily_data: Lista de datos diarios
            
        Returns:
            Lista de datos semanales
        """
        if not daily_data:
            return []
        
        weekly_data = []
        current_week = {"week_start": None, "count": 0}
        
        for item in daily_data:
            date = datetime.fromisoformat(item["date"])
            week_start = date - timedelta(days=date.weekday())
            week_start_str = week_start.strftime("%Y-%m-%d")
            
            if current_week["week_start"] == week_start_str:
                current_week["count"] += item["count"]
            else:
                if current_week["week_start"]:
                    weekly_data.append(current_week.copy())
                current_week = {
                    "week_start": week_start_str,
                    "count": item["count"]
                }
        
        # Agregar última semana
        if current_week["week_start"]:
            weekly_data.append(current_week)
        
        return weekly_data
