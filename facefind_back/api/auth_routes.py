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
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if not res.user:
            return jsonify({"error": "Credenciales inválidas"}), 401

        return jsonify({"user": res.user, "session": res.session})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/signout", methods=["POST"])
def sign_out():
    try:
        supabase.auth.sign_out()
        return jsonify({"message": "Sesión cerrada correctamente"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
