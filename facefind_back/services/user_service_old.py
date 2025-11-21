"""
User Service
Handles all user-related business logic
Refactorizado para usar clases OOP según diagrama UML
"""
from repositories.user_repository import UserRepository
from typing import Optional, Dict, List
from datetime import datetime
from models.usuario import UsuarioBase, UsuarioRegistrado, UsuarioAdministrador
from models.enums import Rol


class UserService:
    """
    Service for managing users
    Usa clases OOP (UsuarioBase y subclases) + Repository pattern
    """

    @staticmethod
    def crear_usuario(user_data: Dict) -> UsuarioBase:
        """
        Crea un nuevo usuario en el sistema (OOP)
        
        Args:
            user_data: Dict con nombre, email, password, role, dni
            
        Returns:
            Instancia OOP del usuario creado
        """
        try:
            # Validar que no exista el email
            if UserRepository.find_by_email(user_data["email"]):
                raise ValueError("Email already exists")
            
            # Validar que no exista el DNI
            if "dni" in user_data and user_data["dni"]:
                if UserRepository.find_by_dni(user_data["dni"]):
                    raise ValueError("DNI already exists")
            
            # Crear instancia OOP según el rol
            rol = Rol.from_string(user_data.get("role", "user"))
            
            if rol == Rol.ADMINISTRADOR:
                usuario = UsuarioAdministrador(
                    nombre=user_data["nombre"],
                    email=user_data["email"],
                    password=user_data["password"],
                    rol=rol,
                    status=user_data.get("status", "active"),
                    dni=user_data.get("dni")
                )
            else:
                usuario = UsuarioRegistrado(
                    nombre=user_data["nombre"],
                    email=user_data["email"],
                    password=user_data["password"],
                    rol=rol,
                    celular=user_data.get("celular"),
                    status=user_data.get("status", "active"),
                    dni=user_data.get("dni")
                )
            
            # Usar el método registrar() de la clase
            user_dict = usuario.registrar()
            
            # Guardar en BD usando Repository
            saved_user = UserRepository.save(user_dict)
            
            # Retornar instancia OOP con el ID asignado
            saved_user["role"] = user_data.get("role", "user")
            return UsuarioBase.from_dict(saved_user)
            
        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"Error in UserService.crear_usuario: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")

    
    @staticmethod
    def obtener_usuario(user_id: int) -> Optional[UsuarioBase]:
        """
        Obtiene un usuario como objeto OOP
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Instancia OOP del usuario o None
        """
        user_data = UserRepository.find_by_id(user_id)
        if not user_data:
            return None
        return UsuarioBase.from_dict(user_data)
    
    @staticmethod
    def obtener_usuario_por_email(email: str) -> Optional[UsuarioBase]:
        """Obtiene un usuario por email como objeto OOP"""
        user_data = UserRepository.find_by_email(email)
        if not user_data:
            return None
        return UsuarioBase.from_dict(user_data)
    
    @staticmethod
    def actualizar_usuario(user_id: int, updates: Dict) -> UsuarioBase:
        """
        Actualiza un usuario (OOP)
        
        Args:
            user_id: ID del usuario
            updates: Datos a actualizar
            
        Returns:
            Instancia OOP del usuario actualizado
        """
        try:
            # Obtener usuario actual como objeto OOP
            usuario = UserService.obtener_usuario(user_id)
            if not usuario:
                raise Exception("User not found")
            
            # Validar cambios de email
            if "email" in updates and updates["email"] != usuario.email:
                existing = UserRepository.find_by_email(updates["email"])
                if existing and existing["id"] != user_id:
                    raise ValueError("Email already exists")
            
            # Validar cambios de DNI
            if "dni" in updates and updates["dni"] != usuario.dni:
                existing = UserRepository.find_by_dni(updates["dni"])
                if existing and existing["id"] != user_id:
                    raise ValueError("DNI already exists")
            
            # Actualizar usando setters de la clase OOP
            if "nombre" in updates:
                usuario.nombre = updates["nombre"]
            
            if "email" in updates:
                usuario.email = updates["email"]
            
            if "dni" in updates:
                usuario.dni = updates["dni"]
            
            if "status" in updates:
                usuario.status = updates["status"]
            
            # Guardar cambios en BD
            update_data = usuario.to_dict()
            update_data["updated_at"] = datetime.now().isoformat()
            
            UserRepository.update(user_id, update_data)
            
            # Retornar usuario actualizado
            return UserService.obtener_usuario(user_id)
            
        except ValueError as ve:
            raise ve
        except Exception as e:
            print(f"Error in UserService.actualizar_usuario: {str(e)}")
            raise Exception(f"Failed to update user: {str(e)}")
    
    
    @staticmethod
    def activar_usuario_por_admin(admin: UsuarioAdministrador, user_id: int) -> UsuarioBase:
        """
        Activa un usuario (solo administradores)
        Usa el método activarCuenta() de UsuarioAdministrador
        
        Args:
            admin: Instancia de UsuarioAdministrador que ejecuta la acción
            user_id: ID del usuario a activar
            
        Returns:
            Usuario activado
        """
        if not isinstance(admin, UsuarioAdministrador):
            raise PermissionError("Only administrators can activate users")
        
        success = admin.activarCuenta(user_id)
        if not success:
            raise Exception("Failed to activate user")
        
        return UserService.obtener_usuario(user_id)
    
    @staticmethod
    def suspender_usuario_por_admin(admin: UsuarioAdministrador, user_id: int) -> UsuarioBase:
        """
        Suspende un usuario (solo administradores)
        Usa el método suspenderCuenta() de UsuarioAdministrador
        
        Args:
            admin: Instancia de UsuarioAdministrador que ejecuta la acción
            user_id: ID del usuario a suspender
            
        Returns:
            Usuario suspendido
        """
        if not isinstance(admin, UsuarioAdministrador):
            raise PermissionError("Only administrators can suspend users")
        
        success = admin.suspenderCuenta(user_id)
        if not success:
            raise Exception("Failed to suspend user")
        
        return UserService.obtener_usuario(user_id)
    
    
    # ===== Métodos de consulta (retornan Dict para compatibilidad con API) =====
    
    @staticmethod
    def get_all_users(filters: Optional[Dict] = None) -> List[Dict]:
        """Obtiene todos los usuarios (retorna dict para API)"""
        return UserRepository.find_all(filters)
    
    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[Dict]:
        """Obtiene usuario por ID (retorna dict para API)"""
        return UserRepository.find_by_id(user_id)
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Obtiene usuario por email (retorna dict para API)"""
        return UserRepository.find_by_email(email)
    
    @staticmethod
    def get_user_by_dni(dni: str) -> Optional[Dict]:
        """Obtiene usuario por DNI (retorna dict para API)"""
        return UserRepository.find_by_dni(dni)
    
    
    @staticmethod
    def create_user(user_data: Dict) -> Dict:
        """
        Crea un nuevo usuario (wrapper para compatibilidad con API)
        Internamente usa crear_usuario() que es OOP
        
        Returns:
            Diccionario del usuario creado
        """
        try:
            usuario_oop = UserService.crear_usuario(user_data)
            return usuario_oop.to_dict()
        except (ValueError, Exception) as e:
            raise
    
    
    @staticmethod
    def update_user(user_id: int, updates: Dict) -> Dict:
        """
        Actualiza un usuario (wrapper para compatibilidad con API)
        Internamente usa actualizar_usuario() que es OOP
        
        Returns:
            Diccionario del usuario actualizado
        """
        try:
            usuario_oop = UserService.actualizar_usuario(user_id, updates)
            return usuario_oop.to_dict()
        except (ValueError, Exception) as e:
            raise
    
    
    @staticmethod
    def activate_user(user_id: int) -> Dict:
        """Activa un usuario (wrapper para compatibilidad)"""
        try:
            update_data = {
                "status": "active",
                "updated_at": datetime.now().isoformat()
            }
            return UserRepository.update(user_id, update_data)
        except Exception as e:
            print(f"Error in activate_user: {str(e)}")
            raise Exception(f"Failed to activate user: {str(e)}")
    
    @staticmethod
    def deactivate_user(user_id: int) -> Dict:
        """Desactiva un usuario (wrapper para compatibilidad)"""
        try:
            update_data = {
                "status": "inactive",
                "updated_at": datetime.now().isoformat()
            }
            return UserRepository.update(user_id, update_data)
        except Exception as e:
            print(f"Error in deactivate_user: {str(e)}")
            raise Exception(f"Failed to deactivate user: {str(e)}")
    
    @staticmethod
    def delete_user(user_id: int) -> bool:
        """Elimina un usuario (soft delete)"""
        try:
            return UserRepository.delete(user_id)
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
        """Obtiene el número de casos de un usuario"""
        return UserRepository.count_cases_by_user(user_id)
    
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
