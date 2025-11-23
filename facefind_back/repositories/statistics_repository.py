"""
Statistics Repository
Maneja las consultas de datos para estadísticas y reportes
"""
from services.supabase_client import supabase
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class StatisticsRepository:
    """
    Repository para consultas de estadísticas del sistema
    Sigue el patrón Repository usado en el proyecto
    """
    
    @staticmethod
    def get_cases_by_status() -> Dict:
        """
        Obtiene el conteo de casos por estado
        
        Returns:
            Dict con conteos por estado
        """
        try:
            response = supabase.table("Caso")\
                .select("status")\
                .execute()
            
            if not response.data:
                return {}
            
            # Contar casos por estado
            status_count = {}
            for caso in response.data:
                status = caso.get("status", "pendiente")
                status_count[status] = status_count.get(status, 0) + 1
            
            return status_count
            
        except Exception as e:
            print(f"Error in get_cases_by_status: {str(e)}")
            return {}
    
    @staticmethod
    def get_cases_by_priority() -> Dict:
        """
        Obtiene el conteo de casos por prioridad
        
        Returns:
            Dict con conteos por prioridad
        """
        try:
            response = supabase.table("Caso")\
                .select("priority")\
                .execute()
            
            if not response.data:
                return {}
            
            # Contar casos por prioridad
            priority_count = {}
            for caso in response.data:
                priority = caso.get("priority", "medium")
                priority_count[priority] = priority_count.get(priority, 0) + 1
            
            return priority_count
            
        except Exception as e:
            print(f"Error in get_cases_by_priority: {str(e)}")
            return {}
    
    @staticmethod
    def get_cases_timeline(days: int = 30) -> List[Dict]:
        """
        Obtiene casos agrupados por fecha de creación
        
        Args:
            days: Número de días hacia atrás
            
        Returns:
            Lista de dicts con fecha y conteo
        """
        try:
            # Calcular fecha inicial
            start_date = datetime.now() - timedelta(days=days)
            
            response = supabase.table("Caso")\
                .select("created_at, status")\
                .gte("created_at", start_date.isoformat())\
                .order("created_at")\
                .execute()
            
            if not response.data:
                return []
            
            # Agrupar por fecha
            timeline = {}
            for caso in response.data:
                if caso.get("created_at"):
                    date = caso["created_at"][:10]  # Solo YYYY-MM-DD
                    if date not in timeline:
                        timeline[date] = {"date": date, "count": 0}
                    timeline[date]["count"] += 1
            
            return list(timeline.values())
            
        except Exception as e:
            print(f"Error in get_cases_timeline: {str(e)}")
            return []
    
    @staticmethod
    def get_resolution_stats() -> Dict:
        """
        Obtiene estadísticas de resolución de casos
        
        Returns:
            Dict con estadísticas de resolución
        """
        try:
            # Obtener todos los casos resueltos
            response = supabase.table("Caso")\
                .select("created_at, resolutionDate, status")\
                .eq("status", "resuelto")\
                .execute()
            
            if not response.data:
                return {
                    "total_resolved": 0,
                    "avg_resolution_days": 0,
                    "fastest_resolution_days": 0,
                    "slowest_resolution_days": 0
                }
            
            # Calcular tiempos de resolución
            resolution_times = []
            for caso in response.data:
                if caso.get("created_at") and caso.get("resolutionDate"):
                    created = datetime.fromisoformat(caso["created_at"].replace("Z", "+00:00"))
                    resolved = datetime.fromisoformat(caso["resolutionDate"] + "T00:00:00")
                    days = (resolved - created).days
                    if days >= 0:
                        resolution_times.append(days)
            
            if not resolution_times:
                return {
                    "total_resolved": len(response.data),
                    "avg_resolution_days": 0,
                    "fastest_resolution_days": 0,
                    "slowest_resolution_days": 0
                }
            
            return {
                "total_resolved": len(response.data),
                "avg_resolution_days": round(sum(resolution_times) / len(resolution_times), 1),
                "fastest_resolution_days": min(resolution_times),
                "slowest_resolution_days": max(resolution_times)
            }
            
        except Exception as e:
            print(f"Error in get_resolution_stats: {str(e)}")
            return {
                "total_resolved": 0,
                "avg_resolution_days": 0,
                "fastest_resolution_days": 0,
                "slowest_resolution_days": 0
            }
    
    @staticmethod
    def get_detection_stats() -> Dict:
        """
        Obtiene estadísticas de detección facial
        (Por ahora retorna datos de ejemplo, requiere implementación futura)
        
        Returns:
            Dict con estadísticas de detección
        """
        try:
            # TODO: Implementar con tabla de Alertas cuando esté disponible
            # Por ahora retornamos estructura base
            return {
                "total_detections": 0,
                "true_positives": 0,
                "false_positives": 0,
                "detection_rate": 0.0,
                "false_positive_rate": 0.0
            }
            
        except Exception as e:
            print(f"Error in get_detection_stats: {str(e)}")
            return {
                "total_detections": 0,
                "true_positives": 0,
                "false_positives": 0,
                "detection_rate": 0.0,
                "false_positive_rate": 0.0
            }
    
    @staticmethod
    def get_user_activity_stats() -> Dict:
        """
        Obtiene estadísticas de actividad de usuarios
        
        Returns:
            Dict con estadísticas de usuarios
        """
        try:
            # Obtener usuarios
            users_response = supabase.table("Usuario")\
                .select("id, status, created_at")\
                .execute()
            
            # Obtener casos con usuario_id
            casos_response = supabase.table("Caso")\
                .select("usuario_id")\
                .execute()
            
            if not users_response.data:
                return {
                    "total_users": 0,
                    "active_users": 0,
                    "inactive_users": 0,
                    "users_with_cases": 0
                }
            
            # Contar usuarios con casos
            users_with_cases = set()
            if casos_response.data:
                for caso in casos_response.data:
                    if caso.get("usuario_id"):
                        users_with_cases.add(caso["usuario_id"])
            
            # Contar por estado
            active_users = len([u for u in users_response.data if u.get("status") == "active"])
            inactive_users = len([u for u in users_response.data if u.get("status") == "inactive"])
            
            return {
                "total_users": len(users_response.data),
                "active_users": active_users,
                "inactive_users": inactive_users,
                "users_with_cases": len(users_with_cases)
            }
            
        except Exception as e:
            print(f"Error in get_user_activity_stats: {str(e)}")
            return {
                "total_users": 0,
                "active_users": 0,
                "inactive_users": 0,
                "users_with_cases": 0
            }
    
    @staticmethod
    def get_geographic_distribution() -> List[Dict]:
        """
        Obtiene distribución geográfica de casos
        
        Returns:
            Lista de dicts con ubicación y conteo
        """
        try:
            response = supabase.table("Caso")\
                .select("lugar_desaparicion, lastSeenLocation")\
                .execute()
            
            if not response.data:
                return []
            
            # Contar por ubicación
            location_count = {}
            for caso in response.data:
                location = caso.get("lugar_desaparicion") or caso.get("lastSeenLocation", "Desconocido")
                location_count[location] = location_count.get(location, 0) + 1
            
            # Convertir a lista ordenada por conteo
            locations = [
                {"location": loc, "count": count}
                for loc, count in location_count.items()
            ]
            locations.sort(key=lambda x: x["count"], reverse=True)
            
            return locations
            
        except Exception as e:
            print(f"Error in get_geographic_distribution: {str(e)}")
            return []
    
    @staticmethod
    def get_cases_by_age_group() -> Dict:
        """
        Obtiene distribución de casos por grupo de edad
        
        Returns:
            Dict con conteos por grupo de edad
        """
        try:
            response = supabase.table("Caso")\
                .select("PersonaDesaparecida(age)")\
                .execute()
            
            if not response.data:
                return {}
            
            # Agrupar por rangos de edad
            age_groups = {
                "0-12": 0,      # Niños
                "13-17": 0,     # Adolescentes
                "18-30": 0,     # Jóvenes adultos
                "31-50": 0,     # Adultos
                "51-70": 0,     # Adultos mayores
                "70+": 0,       # Ancianos
                "Desconocido": 0
            }
            
            for caso in response.data:
                persona = caso.get("PersonaDesaparecida", {})
                age = persona.get("age")
                
                if age is None:
                    age_groups["Desconocido"] += 1
                elif age <= 12:
                    age_groups["0-12"] += 1
                elif age <= 17:
                    age_groups["13-17"] += 1
                elif age <= 30:
                    age_groups["18-30"] += 1
                elif age <= 50:
                    age_groups["31-50"] += 1
                elif age <= 70:
                    age_groups["51-70"] += 1
                else:
                    age_groups["70+"] += 1
            
            return age_groups
            
        except Exception as e:
            print(f"Error in get_cases_by_age_group: {str(e)}")
            return {}
    
    @staticmethod
    def get_monthly_trends(months: int = 6) -> List[Dict]:
        """
        Obtiene tendencias mensuales de casos
        
        Args:
            months: Número de meses hacia atrás
            
        Returns:
            Lista de dicts con mes y métricas
        """
        try:
            start_date = datetime.now() - timedelta(days=months * 30)
            
            response = supabase.table("Caso")\
                .select("created_at, status")\
                .gte("created_at", start_date.isoformat())\
                .order("created_at")\
                .execute()
            
            if not response.data:
                return []
            
            # Agrupar por mes
            monthly_data = {}
            for caso in response.data:
                if caso.get("created_at"):
                    month = caso["created_at"][:7]  # YYYY-MM
                    if month not in monthly_data:
                        monthly_data[month] = {
                            "month": month,
                            "total": 0,
                            "resolved": 0,
                            "active": 0,
                            "pending": 0
                        }
                    monthly_data[month]["total"] += 1
                    
                    status = caso.get("status", "pendiente")
                    if status == "resuelto":
                        monthly_data[month]["resolved"] += 1
                    elif status == "activo" or status == "en_progreso":
                        monthly_data[month]["active"] += 1
                    elif status == "pendiente":
                        monthly_data[month]["pending"] += 1
            
            return list(monthly_data.values())
            
        except Exception as e:
            print(f"Error in get_monthly_trends: {str(e)}")
            return []
