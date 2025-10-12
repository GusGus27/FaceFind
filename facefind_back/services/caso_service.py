"""
Caso Service - Versión MINIMALISTA (SIN REDUNDANCIA)
Maneja la lógica de negocio de casos usando OOP
Service Layer que llama DIRECTAMENTE a Supabase (sin DAO, sin Repository)

Patrones aplicados:
- Service Layer Pattern
- Domain Model Pattern  
- Factory Method Pattern

NOTA: A diferencia de UserService, este servicio NO tiene métodos OOP puros redundantes.
Todos los métodos retornan Dict para compatibilidad con la API REST.
Internamente usa objetos OOP (Caso, PersonaDesaparecida) pero no los expone.
"""
from services.supabase_client import supabase
from models.caso import Caso
from models.persona_desaparecida import PersonaDesaparecida
from models.enums import EstadoCaso
from typing import Dict, List, Optional
from datetime import datetime


class CasoService:
    """
    Service que trabaja con objetos OOP internamente pero retorna Dict para API
    Todos los métodos retornan Dict para compatibilidad con REST API
    """
    
    @staticmethod
    def create_caso(data: Dict) -> Dict:
        """
        Crea un caso completo (PersonaDesaparecida + Caso) usando OOP
        
        Args:
            data: Diccionario con los datos del caso y persona
            
        Returns:
            Dict: Caso creado en formato JSON
            
        Raises:
            ValueError: Si faltan campos obligatorios
            Exception: Si hay error al guardar en DB
        """
        try:
            # 1. Crear objeto PersonaDesaparecida (OOP internamente)
            persona = PersonaDesaparecida(
                nombre_completo=data.get("nombre_completo"),
                fecha_nacimiento=data.get("fecha_nacimiento"),
                gender=data.get("gender"),
                altura=data.get("altura"),
                peso=data.get("peso"),
                skin_color=data.get("skinColor"),
                hair_color=data.get("hairColor"),
                eye_color=data.get("eyeColor"),
                senas_particulares=data.get("senas_particulares"),
                edad_desaparicion=data.get("age"),
                clothing=data.get("clothing")
            )
            
            # 2. Guardar PersonaDesaparecida DIRECTO a Supabase
            persona_response = supabase.table("PersonaDesaparecida")\
                .insert(persona.to_dict())\
                .execute()
            
            if hasattr(persona_response, "error") and persona_response.error:
                raise Exception(f"Error al guardar persona: {str(persona_response.error)}")
            
            persona_id = persona_response.data[0]["id"]
            
            # 3. Crear objeto Caso (OOP internamente)
            estado = EstadoCaso.from_string(data.get("status", "pendiente"))
            
            caso = Caso(
                usuario_id=data["usuario_id"],
                persona_id=persona_id,
                fecha_desaparicion=data["fecha_desaparicion"],
                lugar_desaparicion=data["lugar_desaparicion"],
                estado=estado,
                disappearance_time=data.get("disappearanceTime"),
                last_seen_location=data.get("lastSeenLocation"),
                last_seen=data.get("lastSeen"),
                circumstances=data.get("circumstances"),
                description=data.get("description"),
                location=data.get("location"),
                priority=data.get("priority", "medium"),
                reporter_name=data.get("reporterName"),
                relationship=data.get("relationship"),
                contact_phone=data.get("contactPhone"),
                contact_email=data.get("contactEmail"),
                additional_contact=data.get("additionalContact"),
                resolution_date=data.get("resolutionDate"),
                resolution_note=data.get("resolutionNote"),
                observaciones=data.get("observaciones")
            )
            
            # 4. Asociar PersonaDesaparecida al Caso (método OOP del UML)
            caso.anadirPersonaDes(persona)
            
            # 5. Guardar Caso DIRECTO a Supabase
            caso_response = supabase.table("Caso")\
                .insert(caso.to_dict())\
                .execute()
            
            if hasattr(caso_response, "error") and caso_response.error:
                # Rollback: eliminar persona si falla el caso
                supabase.table("PersonaDesaparecida").delete().eq("id", persona_id).execute()
                raise Exception(f"Error al guardar caso: {str(caso_response.error)}")
            
            # 6. Retornar Dict para API (con relaciones)
            caso_creado = Caso.from_dict(caso_response.data[0])
            caso_creado.anadirPersonaDes(persona)
            
            return caso_creado.to_dict(include_relations=True)
            
        except Exception as e:
            print(f"Error en CasoService.create_caso: {str(e)}")
            raise
    
    @staticmethod
    def get_caso_by_id(caso_id: int) -> Optional[Dict]:
        """
        Obtiene un caso por ID con su PersonaDesaparecida
        
        Args:
            caso_id: ID del caso
            
        Returns:
            Dict: Caso en formato JSON o None si no existe
        """
        try:
            # Query DIRECTA a Supabase con join de PersonaDesaparecida
            response = supabase.table("Caso")\
                .select("*, PersonaDesaparecida(*)")\
                .eq("id", caso_id)\
                .single()\
                .execute()
            
            if not response.data:
                return None
            
            # Convertir a OOP y retornar Dict
            caso = Caso.from_dict(response.data)
            return caso.to_dict(include_relations=True)
            
        except Exception as e:
            print(f"Error en CasoService.get_caso_by_id: {str(e)}")
            return None
    
    @staticmethod
    def get_all_casos() -> List[Dict]:
        """
        Obtiene todos los casos con sus PersonaDesaparecida
        
        Returns:
            List[Dict]: Lista de casos en formato JSON
        """
        try:
            # Query DIRECTA a Supabase
            response = supabase.table("Caso")\
                .select("*, PersonaDesaparecida(*)")\
                .execute()
            
            # Convertir cada Dict a objeto OOP y luego a Dict
            casos = [Caso.from_dict(caso) for caso in response.data]
            return [caso.to_dict(include_relations=True) for caso in casos]
            
        except Exception as e:
            print(f"Error en CasoService.get_all_casos: {str(e)}")
            return []
    
    @staticmethod
    def get_casos_by_user(user_id: int) -> List[Dict]:
        """
        Obtiene todos los casos de un usuario específico
        
        Args:
            user_id: ID del usuario
            
        Returns:
            List[Dict]: Lista de casos en formato JSON
        """
        try:
            # Query DIRECTA a Supabase
            response = supabase.table("Caso")\
                .select("*, PersonaDesaparecida(*)")\
                .eq("usuario_id", user_id)\
                .execute()
            
            # Convertir a objetos OOP y luego a Dict
            casos = [Caso.from_dict(caso) for caso in response.data]
            return [caso.to_dict(include_relations=True) for caso in casos]
            
        except Exception as e:
            print(f"Error en CasoService.get_casos_by_user: {str(e)}")
            return []
    
    @staticmethod
    def update_caso(caso_id: int, updates: Dict) -> Optional[Dict]:
        """
        Actualiza un caso existente y su persona desaparecida asociada
        
        Args:
            caso_id: ID del caso
            updates: Diccionario con campos a actualizar
            
        Returns:
            Dict: Caso actualizado en formato JSON
        """
        try:
            # 1. Obtener el caso actual para tener el persona_id
            caso_actual = CasoService.get_caso_by_id(caso_id)
            if not caso_actual:
                raise Exception(f"Caso {caso_id} no encontrado")
            
            persona_id = caso_actual.get("persona_id")
            
            # 2. Mapear campos en español a inglés (frontend usa español, DB usa inglés)
            field_mapping = {
                'edad': 'age',
                'estado': 'status',
                'prioridad': 'priority'
            }
            
            # Aplicar mapeo
            mapped_updates = {}
            for key, value in updates.items():
                mapped_key = field_mapping.get(key, key)
                mapped_updates[mapped_key] = value
            
            # 3. Separar campos de Caso vs PersonaDesaparecida
            # Campos que van en la tabla PersonaDesaparecida
            persona_fields = {
                'nombre_completo', 'fecha_nacimiento', 'gender', 'age', 
                'altura', 'peso', 'skinColor', 'hairColor', 'eyeColor',
                'senas_particulares', 'clothing'
            }
            
            # Campos que van en la tabla Caso
            caso_updates = {}
            persona_updates = {}
            
            for key, value in mapped_updates.items():
                if key in persona_fields:
                    persona_updates[key] = value
                else:
                    caso_updates[key] = value
            
            # 4. Actualizar PersonaDesaparecida si hay cambios
            if persona_updates and persona_id:
                print(f"📝 Actualizando PersonaDesaparecida {persona_id}: {persona_updates}")
                persona_response = supabase.table("PersonaDesaparecida")\
                    .update(persona_updates)\
                    .eq("id", persona_id)\
                    .execute()
                
                if hasattr(persona_response, "error") and persona_response.error:
                    raise Exception(f"Error al actualizar persona: {str(persona_response.error)}")
            
            # 5. Actualizar Caso si hay cambios
            if caso_updates:
                caso_updates["updated_at"] = datetime.now().isoformat()
                print(f"📝 Actualizando Caso {caso_id}: {caso_updates}")
                
                caso_response = supabase.table("Caso")\
                    .update(caso_updates)\
                    .eq("id", caso_id)\
                    .execute()
                
                if hasattr(caso_response, "error") and caso_response.error:
                    raise Exception(f"Error al actualizar caso: {str(caso_response.error)}")
            
            # 6. Retornar caso actualizado completo
            print(f"✅ Caso {caso_id} actualizado correctamente")
            return CasoService.get_caso_by_id(caso_id)
            
        except Exception as e:
            print(f"❌ Error en CasoService.update_caso: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    @staticmethod
    def update_caso_status(caso_id: int, nuevo_estado: str) -> Optional[Dict]:
        """
        Actualiza el estado de un caso
        
        Args:
            caso_id: ID del caso
            nuevo_estado: Nuevo estado ('pendiente', 'en_progreso', 'resuelto', 'cerrado')
            
        Returns:
            Dict: Caso actualizado en formato JSON
        """
        try:
            estado = EstadoCaso.from_string(nuevo_estado)
            return CasoService.update_caso(caso_id, {"status": estado.to_string()})
        except Exception as e:
            print(f"Error en CasoService.update_caso_status: {str(e)}")
            raise
    
    @staticmethod
    def delete_caso(caso_id: int) -> bool:
        """
        Elimina un caso (y su PersonaDesaparecida asociada por CASCADE)
        
        Args:
            caso_id: ID del caso
            
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            response = supabase.table("Caso")\
                .delete()\
                .eq("id", caso_id)\
                .execute()
            
            return True
            
        except Exception as e:
            print(f"Error en CasoService.delete_caso: {str(e)}")
            return False
    
    @staticmethod
    def get_casos_stats() -> Dict:
        """
        Obtiene estadísticas de casos
        Usa objetos OOP internamente
        
        Returns:
            Dict: Estadísticas de casos
        """
        try:
            # Obtener todos los casos
            response = supabase.table("Caso")\
                .select("*, PersonaDesaparecida(*)")\
                .execute()
            
            casos = [Caso.from_dict(caso) for caso in response.data]
            
            stats = {
                "total": len(casos),
                "pendiente": len([c for c in casos if c.estado.value == "pendiente"]),
                "en_progreso": len([c for c in casos if c.estado.value == "en_progreso"]),
                "resuelto": len([c for c in casos if c.estado.value == "resuelto"]),
                "cerrado": len([c for c in casos if c.estado.value == "cerrado"]),
                "by_priority": {}
            }
            
            # Contar por prioridad usando objetos OOP
            for caso in casos:
                priority = caso.priority or "medium"
                stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
            
            return stats
            
        except Exception as e:
            print(f"Error en CasoService.get_casos_stats: {str(e)}")
            return {"total": 0, "pendiente": 0, "en_progreso": 0, "resuelto": 0, "cerrado": 0, "by_priority": {}}

    @staticmethod
    def search_casos(search_term: str) -> List[Dict]:
        """
        Busca casos por nombre completo en PersonaDesaparecida
        
        Args:
            search_term: Término de búsqueda
            
        Returns:
            List[Dict]: Lista de casos que coinciden en formato JSON
        """
        try:
            # Buscar personas desaparecidas que coincidan con el término
            personas_response = supabase.table("PersonaDesaparecida").select(
                "id, nombre_completo"
            ).ilike("nombre_completo", f"%{search_term}%").execute()
            
            if not personas_response.data:
                print(f"⚠️ No se encontraron personas con el término: {search_term}")
                return []
            
            # Obtener IDs de las personas encontradas
            persona_ids = [p['id'] for p in personas_response.data]
            print(f"🔍 Personas encontradas: {len(persona_ids)}")
            
            # Buscar casos de esas personas
            casos_response = supabase.table("Caso").select(
                "*, PersonaDesaparecida(*), Usuario(id, nombre, email)"
            ).in_("persona_id", persona_ids).order("created_at", desc=True).execute()
            
            if hasattr(casos_response, 'error') and casos_response.error:
                print(f"Error en CasoService.search_casos: {casos_response.error}")
                return []
            
            print(f"✅ Casos encontrados: {len(casos_response.data) if casos_response.data else 0}")
            return casos_response.data if casos_response.data else []
            
        except Exception as e:
            print(f"❌ Error en CasoService.search_casos: {str(e)}")
            import traceback
            traceback.print_exc()
            return []
