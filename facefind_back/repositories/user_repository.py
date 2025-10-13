"""
User Repository
Maneja la persistencia de usuarios en la base de datos
Patrón Repository para desacoplar la lógica de datos
"""
from services.supabase_client import supabase
from typing import Optional, Dict, List
from datetime import datetime


class UserRepository:
    """
    Repository para operaciones CRUD de usuarios en la base de datos
    Desacopla la lógica de negocio de la persistencia
    """

    @staticmethod
    def find_all(filters: Optional[Dict] = None) -> List[Dict]:
        """
        Obtiene todos los usuarios con filtros opcionales
        Incluye datos del Rol mediante JOIN especificando la relación FK
        
        Args:
            filters: Filtros opcionales (status, role_id, search)
            
        Returns:
            Lista de diccionarios de usuarios con rol anidado
        """
        try:
            # JOIN con Rol especificando la FK para evitar ambigüedad
            # Usamos Rol!Usuario_role_id_fkey para especificar la relación many-to-one
            query = supabase.table("Usuario").select("*, Rol!Usuario_role_id_fkey(*)")
            
            if filters:
                if "status" in filters and filters["status"]:
                    query = query.eq("status", filters["status"])
                
                if "role_id" in filters and filters["role_id"]:
                    query = query.eq("role_id", filters["role_id"])
                
                if "search" in filters and filters["search"]:
                    search_term = f"%{filters['search']}%"
                    query = query.or_(f"nombre.ilike.{search_term},email.ilike.{search_term},dni.ilike.{search_term}")
            
            query = query.order("created_at", desc=True)
            response = query.execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error in UserRepository.find_all: {str(e)}")
            raise

    @staticmethod
    def find_by_id(user_id: int) -> Optional[Dict]:
        """Busca un usuario por ID con datos del Rol"""
        try:
            response = supabase.table("Usuario").select("*, Rol!Usuario_role_id_fkey(*)").eq("id", user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error in UserRepository.find_by_id: {str(e)}")
            return None

    @staticmethod
    def find_by_email(email: str) -> Optional[Dict]:
        """Busca un usuario por email con datos del Rol"""
        try:
            response = supabase.table("Usuario").select("*, Rol!Usuario_role_id_fkey(*)").eq("email", email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error in UserRepository.find_by_email: {str(e)}")
            return None

    @staticmethod
    def find_by_dni(dni: str) -> Optional[Dict]:
        """Busca un usuario por DNI"""
        try:
            response = supabase.table("Usuario").select("*").eq("dni", dni).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error in UserRepository.find_by_dni: {str(e)}")
            return None

    @staticmethod
    def save(user_data: Dict) -> Dict:
        """
        Guarda un nuevo usuario en la base de datos
        
        Args:
            user_data: Diccionario con datos del usuario
            
        Returns:
            Usuario creado
        """
        try:
            response = supabase.table("Usuario").insert(user_data).execute()
            
            if not response.data:
                raise Exception("Failed to save user")
            
            return response.data[0]
        except Exception as e:
            print(f"Error in UserRepository.save: {str(e)}")
            raise

    @staticmethod
    def update(user_id: int, updates: Dict) -> Dict:
        """
        Actualiza un usuario existente
        
        Args:
            user_id: ID del usuario
            updates: Datos a actualizar
            
        Returns:
            Usuario actualizado
        """
        try:
            response = supabase.table("Usuario").update(updates).eq("id", user_id).execute()
            
            if not response.data:
                raise Exception("User not found")
            
            return response.data[0]
        except Exception as e:
            print(f"Error in UserRepository.update: {str(e)}")
            raise

    @staticmethod
    def delete(user_id: int) -> bool:
        """
        Elimina un usuario (soft delete - marca como inactive)
        
        Args:
            user_id: ID del usuario
            
        Returns:
            True si fue exitoso
        """
        try:
            update_data = {
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            }
            UserRepository.update(user_id, update_data)
            return True
        except Exception as e:
            print(f"Error in UserRepository.delete: {str(e)}")
            return False

    @staticmethod
    def count_cases_by_user(user_id: int) -> int:
        """Cuenta los casos de un usuario"""
        try:
            response = supabase.table("Caso").select("id", count="exact").eq("usuario_id", user_id).execute()
            return response.count if response.count else 0
        except Exception as e:
            print(f"Error in UserRepository.count_cases_by_user: {str(e)}")
            return 0

    @staticmethod
    def get_all_roles() -> List[Dict]:
        """Obtiene todos los roles disponibles en el sistema"""
        try:
            response = supabase.table("Rol").select("*").order("id").execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error in UserRepository.get_all_roles: {str(e)}")
            return []

    @staticmethod
    def get_role_by_id(role_id: int) -> Optional[Dict]:
        """Obtiene un rol por su ID"""
        try:
            response = supabase.table("Rol").select("*").eq("id", role_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error in UserRepository.get_role_by_id: {str(e)}")
            return None

    @staticmethod
    def get_role_by_name(name: str) -> Optional[Dict]:
        """Obtiene un rol por su nombre"""
        try:
            response = supabase.table("Rol").select("*").eq("nombre", name).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error in UserRepository.get_role_by_name: {str(e)}")
            return None
