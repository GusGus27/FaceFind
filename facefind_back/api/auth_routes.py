from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        nombre = data.get('nombre')

        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        # 🔹 Crear usuario en Supabase Auth
        result = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })

        if result.user is None:
            return jsonify({"error": result.error_message}), 400

        # 🔹 Insertar en tabla Usuario
        supabase.table("Usuario").insert({
            "nombre": nombre,
            "email": email,
            "password": password,  # ⚠️ En un entorno real, deberías encriptar esto
        }).execute()

        return jsonify({"message": "Usuario registrado con éxito"}), 200

    except Exception as e:
        print(f"Error en /auth/signup: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signin", methods=["POST"])
def sign_in():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not res.user:
            return jsonify({"error": "Credenciales inválidas"}), 401

        # 🔹 Buscar el usuario en la tabla Usuario para obtener el ID numérico
        usuario_query = supabase.table("Usuario").select("*").eq("email", email).execute()
        
        usuario_db = None
        if usuario_query.data and len(usuario_query.data) > 0:
            usuario_db = usuario_query.data[0]

        # 🔹 Extraer solo lo serializable
        user_data = {
            "id": usuario_db["id"] if usuario_db else None,  # ID numérico de la tabla Usuario
            "auth_id": res.user.id,  # UUID de Supabase Auth
            "email": res.user.email,
            "nombre": usuario_db["nombre"] if usuario_db else None,
            "role": usuario_db.get("role", "user") if usuario_db else "user",
        }

        session_data = {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
        }

        return jsonify({"user": user_data, "session": session_data}), 200

    except Exception as e:
        print(f"Error en /auth/signin: {e}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signout", methods=["POST"])
def sign_out():
    """
    Cierra la sesión del usuario actual
    """
    try:
        # Obtener el token del header si existe
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            # Cerrar sesión en Supabase
            supabase.auth.sign_out()
        
        return jsonify({
            "success": True,
            "message": "Sesión cerrada correctamente"
        }), 200

    except Exception as e:
        print(f"Error en /auth/signout: {e}")
        return jsonify({
            "success": True,  # Aún así retornar success para limpiar el frontend
            "message": "Sesión cerrada localmente"
        }), 200
