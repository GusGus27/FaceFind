from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def sign_up():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    nombre = data.get("nombre")

    try:
        auth_res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"nombre": nombre}},
        })

        if not auth_res.user:
            return jsonify({"error": "Error al crear usuario en Auth"}), 400

        user_id = auth_res.user.id
        res = supabase.table("Usuario").insert({
            "id": user_id,
            "nombre": nombre,
            "email": email,
            "role": "user",
            "status": "active",
        }).execute()

        return jsonify({"message": "Usuario creado correctamente", "data": res.data})
    except Exception as e:
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
