from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

user_bp = Blueprint("users", __name__)

@user_bp.route("/", methods=["GET"])
def get_all_users():
    try:
        res = supabase.table("Usuario").select("*").execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/<user_id>", methods=["GET"])
def get_user(user_id):
    try:
        res = supabase.table("Usuario").select("*").eq("id", user_id).single().execute()
        return jsonify(res.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 404


@user_bp.route("/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    updates = {}
    if "nombre" in data: updates["nombre"] = data["nombre"]
    if "role" in data: updates["role"] = data["role"]
    if "status" in data: updates["status"] = data["status"]

    try:
        res = supabase.table("Usuario").update(updates).eq("id", user_id).execute()
        return jsonify({"message": "Usuario actualizado", "data": res.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
