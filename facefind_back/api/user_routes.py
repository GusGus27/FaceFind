from flask import Blueprint, request, jsonify
from services.user_service import UserService
from models.usuario import UsuarioBase, UsuarioRegistrado, UsuarioAdministrador
from models.enums import Rol

user_bp = Blueprint("users", __name__)


@user_bp.route("/", methods=["GET"])
def get_all_users():
    """Get all users with optional filters"""
    try:
        # Get query parameters for filtering
        filters = {}
        
        if request.args.get("status"):
            filters["status"] = request.args.get("status")
        
        if request.args.get("role"):
            filters["role"] = request.args.get("role")
        
        if request.args.get("search"):
            filters["search"] = request.args.get("search")
        
        users = UserService.get_all_users(filters if filters else None)
        
        return jsonify({
            "success": True,
            "data": users,
            "count": len(users)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/with-cases", methods=["GET"])
def get_users_with_cases():
    """Get all users with their cases count"""
    try:
        users = UserService.get_users_with_cases_count()
        
        return jsonify({
            "success": True,
            "data": users,
            "count": len(users)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """Get user by ID"""
    try:
        user = UserService.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        # Add cases count
        user["cases_count"] = UserService.get_user_cases_count(user_id)
        
        return jsonify({
            "success": True,
            "data": user
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_user_profile(user_id):
    """
    Get user profile with contact information
    Used for auto-filling contact forms
    """
    try:
        user = UserService.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                "success": False,
                "error": "User not found"
            }), 404
        
        # Return only safe profile information
        # Note: phone is not stored in Usuario table, so we don't include it
        profile_data = {
            "id": user.get("id"),
            "nombre": user.get("nombre"),
            "email": user.get("email"),
            "dni": user.get("dni"),
        }
        
        return jsonify({
            "success": True,
            "data": profile_data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/", methods=["POST"])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ["nombre", "email", "password"]
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400
        
        # Check blacklist
        blacklist_check = UserService.check_blacklist(
            email=data.get("email"),
            dni=data.get("dni")
        )
        
        if blacklist_check["is_blacklisted"]:
            return jsonify({
                "success": False,
                "error": blacklist_check["reason"]
            }), 400
        
        user = UserService.create_user(data)
        
        return jsonify({
            "success": True,
            "message": "User created successfully",
            "data": user
        }), 201
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        
        user = UserService.update_user(user_id, data)
        
        return jsonify({
            "success": True,
            "message": "User updated successfully",
            "data": user
        }), 200
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/<int:user_id>/activate", methods=["PUT"])
def activate_user(user_id):
    """
    Activate a user
    Debe ser ejecutado por un UsuarioAdministrador (según UML)
    """
    try:
        # TODO: Obtener el usuario admin del token/sesión
        # Por ahora, validamos que sea admin y usamos el método directo
        # En producción deberías obtener admin_id del JWT/sesión
        
        # admin_id = get_current_user_id_from_token()
        # admin = UserService.obtener_usuario(admin_id)
        # 
        # if not isinstance(admin, UsuarioAdministrador):
        #     return jsonify({
        #         "success": False,
        #         "error": "Permission denied. Only administrators can activate users"
        #     }), 403
        # 
        # user = UserService.activar_usuario_por_admin(admin, user_id)

        # Wrapper temporal para compatibilidad
        user = UserService.activate_user(user_id)

        return jsonify({
            "success": True,
            "message": "User activated successfully",
            "data": user
        }), 200
    except PermissionError as pe:
        return jsonify({
            "success": False,
            "error": str(pe)
        }), 403
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/<int:user_id>/deactivate", methods=["PUT"])
def deactivate_user(user_id):
    """
    Deactivate a user (add to blacklist)
    Debe ser ejecutado por un UsuarioAdministrador (según UML)
    """
    try:
        # TODO: Obtener el usuario admin del token/sesión
        # Por ahora, validamos que sea admin y usamos el método directo
        # En producción deberías obtener admin_id del JWT/sesión
        
        # admin_id = get_current_user_id_from_token()
        # admin = UserService.obtener_usuario(admin_id)
        # 
        # if not isinstance(admin, UsuarioAdministrador):
        #     return jsonify({
        #         "success": False,
        #         "error": "Permission denied. Only administrators can deactivate users"
        #     }), 403
        # 
        # user = UserService.suspender_usuario_por_admin(admin, user_id)

        # Wrapper temporal para compatibilidad
        user = UserService.deactivate_user(user_id)

        return jsonify({
            "success": True,
            "message": "User deactivated successfully",
            "data": user
        }), 200
    except PermissionError as pe:
        return jsonify({
            "success": False,
            "error": str(pe)
        }), 403
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete (deactivate) a user"""
    try:
        UserService.delete_user(user_id)
        
        return jsonify({
            "success": True,
            "message": "User deleted successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/stats", methods=["GET"])
def get_user_stats():
    """Get user statistics"""
    try:
        stats = UserService.get_user_stats()
        
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/blacklist", methods=["GET"])
def get_blacklist():
    """Get blacklisted users (inactive users)"""
    try:
        inactive_users = UserService.get_inactive_users()
        
        return jsonify({
            "success": True,
            "data": inactive_users,
            "count": len(inactive_users)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@user_bp.route("/check-blacklist", methods=["POST"])
def check_blacklist():
    """Check if email or DNI is blacklisted"""
    try:
        data = request.get_json()
        
        result = UserService.check_blacklist(
            email=data.get("email"),
            dni=data.get("dni")
        )
        
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
