from flask import Blueprint, request, jsonify
from services.supabase_client import supabase

caso_bp = Blueprint("casos", __name__)

# 🟢 Crear un nuevo caso
@caso_bp.route("/create", methods=["POST"])
def create_caso():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Validar campos obligatorios
        required_fields = ["usuario_id", "fecha_desaparicion", "lugar_desaparicion"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo '{field}' es obligatorio."}), 400

        # Insertar en Supabase
        response = supabase.table("Caso").insert({
            "usuario_id": data["usuario_id"],
            "fecha_desaparicion": data["fecha_desaparicion"],
            "disappearanceTime": data.get("disappearanceTime"),
            "lugar_desaparicion": data["lugar_desaparicion"],
            "lastSeenLocation": data.get("lastSeenLocation"),
            "lastSeen": data.get("lastSeen"),
            "circumstances": data.get("circumstances"),
            "description": data.get("description"),
            "location": data.get("location"),
            "priority": data.get("priority", "medium"),
            "status": data.get("status", "pendiente"),
            "reporterName": data.get("reporterName"),
            "relationship": data.get("relationship"),
            "contactPhone": data.get("contactPhone"),
            "contactEmail": data.get("contactEmail"),
            "additionalContact": data.get("additionalContact"),
            "resolutionDate": data.get("resolutionDate"),
            "resolutionNote": data.get("resolutionNote"),
            "observaciones": data.get("observaciones"),
            "persona_id": data.get("persona_id"),
        }).execute()

        if hasattr(response, "error") and response.error:
            return jsonify({"error": str(response.error)}), 500

        return jsonify({
            "success": True,
            "message": "Caso creado correctamente",
            "data": response.data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🟡 Obtener todos los casos
@caso_bp.route("/", methods=["GET"])
def get_all_casos():
    try:
        response = supabase.table("Caso").select("*").order("created_at", desc=True).execute()
        if hasattr(response, "error") and response.error:
            return jsonify({"error": str(response.error)}), 500

        return jsonify({"data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔵 Obtener un caso por ID
@caso_bp.route("/<int:caso_id>", methods=["GET"])
def get_caso(caso_id):
    try:
        response = supabase.table("Caso").select("*").eq("id", caso_id).single().execute()
        if hasattr(response, "error") and response.error:
            return jsonify({"error": str(response.error)}), 404

        return jsonify({"data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ✅ Actualizar un caso
@caso_bp.route("/<int:caso_id>", methods=["PUT"])
def update_caso(caso_id):
    data = request.get_json()
    try:
        updates = {**data, "updated_at": datetime.utcnow().isoformat()}
        res = supabase.table("Caso").update(updates).eq("id", caso_id).execute()
        return jsonify({"success": True, "data": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Eliminar un caso
@caso_bp.route("/<int:caso_id>", methods=["DELETE"])
def delete_caso(caso_id):
    try:
        res = supabase.table("Caso").delete().eq("id", caso_id).execute()
        return jsonify({"success": True, "message": "Caso eliminado correctamente"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Buscar casos por nombre
@caso_bp.route("/search", methods=["GET"])
def search_casos_by_name():
    try:
        search_term = request.args.get("q", "")
        res = (
            supabase.table("Caso")
            .select("*")
            .ilike("nombre_completo", f"%{search_term}%")
            .order("created_at", desc=True)
            .execute()
        )
        return jsonify({"success": True, "data": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Cambiar estado de un caso
@caso_bp.route("/<int:caso_id>/status", methods=["PATCH"])
def update_caso_status(caso_id):
    data = request.get_json()
    try:
        new_status = data.get("status")
        updates = {"status": new_status}

        if new_status == "RESUELTO":
            updates["resolutionDate"] = datetime.utcnow().isoformat()

        res = supabase.table("Caso").update(updates).eq("id", caso_id).execute()
        return jsonify({"success": True, "data": res.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Estadísticas de casos
@caso_bp.route("/stats", methods=["GET"])
def get_caso_stats():
    try:
        res = supabase.table("Caso").select("status, priority").execute()
        data = res.data

        stats = {
            "total": len(data),
            "byStatus": {},
            "byPriority": {},
        }

        for c in data:
            stats["byStatus"][c["status"]] = stats["byStatus"].get(c["status"], 0) + 1
            stats["byPriority"][c["priority"]] = stats["byPriority"].get(c["priority"], 0) + 1

        return jsonify({"success": True, "data": stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
