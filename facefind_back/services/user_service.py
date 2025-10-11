"""
User Service
Handles all user-related business logic
"""
from services.supabase_client import supabase
from typing import Optional, Dict, List
from datetime import datetime


class UserService:
    """Service for managing users"""
    
    @staticmethod
    def get_all_users(filters: Optional[Dict] = None) -> List[Dict]:
        """
        Get all users with optional filters
        
        Args:
            filters: Dict with optional keys: status, role, search
            
        Returns:
            List of user dictionaries
        """
        try:
            query = supabase.table("Usuario").select("*")
            
            if filters:
                # Filter by status
                if "status" in filters and filters["status"]:
                    query = query.eq("status", filters["status"])
                
                # Filter by role
                if "role" in filters and filters["role"]:
                    query = query.eq("role", filters["role"])
                
                # Search by name, email or dni
                if "search" in filters and filters["search"]:
                    search_term = f"%{filters['search']}%"
                    query = query.or_(f"nombre.ilike.{search_term},email.ilike.{search_term},dni.ilike.{search_term}")
            
            query = query.order("created_at", desc=True)
            response = query.execute()
            
            return response.data if response.data else []
        except Exception as e:
            print(f"Error in get_all_users: {str(e)}")
            raise
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        try:
            response = supabase.table("Usuario").select("*").eq("id", user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            print(f"Error in get_user_by_id: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Get user by email"""
        try:
            response = supabase.table("Usuario").select("*").eq("email", email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error in get_user_by_email: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_dni(dni: str) -> Optional[Dict]:
        """Get user by DNI"""
        try:
            response = supabase.table("Usuario").select("*").eq("dni", dni).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error in get_user_by_dni: {str(e)}")
            return None
    
    @staticmethod
    def create_user(user_data: Dict) -> Dict:
        """
        Create a new user
        
        Args:
            user_data: Dict with keys: nombre, email, password, role, dni (optional)
            
        Returns:
            Created user dictionary
        """
        try:
            # Check if email already exists
            if UserService.get_user_by_email(user_data["email"]):
                raise ValueError("Email already exists")
            
            # Check if DNI already exists (including inactive users)
            if "dni" in user_data and user_data["dni"]:
                existing_dni = UserService.get_user_by_dni(user_data["dni"])
                if existing_dni:
                    raise ValueError("DNI already exists")
            
            # Set default values
            insert_data = {
                "nombre": user_data["nombre"],
                "email": user_data["email"],
                "password": user_data["password"],
                "role": user_data.get("role", "user"),
                "status": user_data.get("status", "active"),
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            if "dni" in user_data and user_data["dni"]:
                insert_data["dni"] = user_data["dni"]
            
            response = supabase.table("Usuario").insert(insert_data).execute()
            
            if not response.data:
                raise Exception("Failed to create user")
            
            return response.data[0]
        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"Error in create_user: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")
    
    @staticmethod
    def update_user(user_id: int, updates: Dict) -> Dict:
        """
        Update user information
        
        Args:
            user_id: User ID
            updates: Dict with fields to update (nombre, email, role, dni, etc.)
            
        Returns:
            Updated user dictionary
        """
        try:
            # Prepare update data
            update_data = {}
            
            if "nombre" in updates:
                update_data["nombre"] = updates["nombre"]
            
            if "email" in updates:
                # Check if new email is already taken by another user
                existing = UserService.get_user_by_email(updates["email"])
                if existing and existing["id"] != user_id:
                    raise ValueError("Email already exists")
                update_data["email"] = updates["email"]
            
            if "dni" in updates:
                # Check if new DNI is already taken by another user
                existing = UserService.get_user_by_dni(updates["dni"])
                if existing and existing["id"] != user_id:
                    raise ValueError("DNI already exists")
                update_data["dni"] = updates["dni"]
            
            if "role" in updates:
                update_data["role"] = updates["role"]
            
            update_data["updated_at"] = datetime.now().isoformat()
            
            response = supabase.table("Usuario").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise Exception("User not found")
            
            return response.data[0]
        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"Error in update_user: {str(e)}")
            raise Exception(f"Failed to update user: {str(e)}")
    
    @staticmethod
    def activate_user(user_id: int) -> Dict:
        """Activate a user (set status to active)"""
        try:
            update_data = {
                "status": "active",
                "updated_at": datetime.now().isoformat()
            }
            
            response = supabase.table("Usuario").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise Exception("User not found")
            
            return response.data[0]
        except Exception as e:
            print(f"Error in activate_user: {str(e)}")
            raise Exception(f"Failed to activate user: {str(e)}")
    
    @staticmethod
    def deactivate_user(user_id: int) -> Dict:
        """Deactivate a user (set status to inactive)"""
        try:
            update_data = {
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            }
            
            response = supabase.table("Usuario").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise Exception("User not found")
            
            return response.data[0]
        except Exception as e:
            print(f"Error in deactivate_user: {str(e)}")
            raise Exception(f"Failed to deactivate user: {str(e)}")
    
    @staticmethod
    def delete_user(user_id: int) -> bool:
        """
        Soft delete a user (archive)
        Actually just deactivates the user
        """
        try:
            UserService.deactivate_user(user_id)
            return True
        except Exception as e:
            print(f"Error in delete_user: {str(e)}")
            raise Exception(f"Failed to delete user: {str(e)}")
    
    @staticmethod
    def get_user_stats() -> Dict:
        """Get user statistics"""
        try:
            # Get all users
            all_users = UserService.get_all_users()
            
            stats = {
                "total": len(all_users),
                "active": len([u for u in all_users if u.get("status") == "active"]),
                "inactive": len([u for u in all_users if u.get("status") == "inactive"]),
                "by_role": {}
            }
            
            # Count by role
            for user in all_users:
                role = user.get("role", "user")
                stats["by_role"][role] = stats["by_role"].get(role, 0) + 1
            
            return stats
        except Exception as e:
            print(f"Error in get_user_stats: {str(e)}")
            return {"total": 0, "active": 0, "inactive": 0, "by_role": {}}
    
    @staticmethod
    def check_blacklist(email: str = None, dni: str = None) -> Dict:
        """
        Check if email or DNI is in blacklist (inactive users)
        
        Args:
            email: Email to check
            dni: DNI to check
            
        Returns:
            Dict with is_blacklisted (bool) and reason (str)
        """
        try:
            if email:
                user = UserService.get_user_by_email(email)
                if user and user.get("status") == "inactive":
                    return {
                        "is_blacklisted": True,
                        "reason": f"Email is associated with inactive user: {user.get('nombre')}"
                    }
            
            if dni:
                user = UserService.get_user_by_dni(dni)
                if user and user.get("status") == "inactive":
                    return {
                        "is_blacklisted": True,
                        "reason": f"DNI is associated with inactive user: {user.get('nombre')}"
                    }
            
            return {"is_blacklisted": False, "reason": None}
        except Exception as e:
            print(f"Error in check_blacklist: {str(e)}")
            return {"is_blacklisted": False, "reason": None}
    
    @staticmethod
    def get_inactive_users() -> List[Dict]:
        """Get all inactive users (blacklist)"""
        try:
            return UserService.get_all_users({"status": "inactive"})
        except Exception as e:
            print(f"Error in get_inactive_users: {str(e)}")
            return []
    
    @staticmethod
    def get_user_cases_count(user_id: int) -> int:
        """Get the number of cases created by a user"""
        try:
            response = supabase.table("Caso").select("id", count="exact").eq("usuario_id", user_id).execute()
            return response.count if response.count else 0
        except Exception as e:
            print(f"Error in get_user_cases_count: {str(e)}")
            return 0
    
    @staticmethod
    def get_users_with_cases_count() -> List[Dict]:
        """Get all users with their cases count"""
        try:
            users = UserService.get_all_users()
            
            for user in users:
                user["cases_count"] = UserService.get_user_cases_count(user["id"])
            
            return users
        except Exception as e:
            print(f"Error in get_users_with_cases_count: {str(e)}")
            raise
