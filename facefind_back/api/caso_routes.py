from flask import Blueprint, request, jsonify
from services.supabase_client import supabase
from services.encodings_generator import encodings_generator
from datetime import datetime

caso_bp = Blueprint("casos", __name__)

# 🟢 Crear un nuevo caso
@caso_bp.route("/create", methods=["POST"])
def create_caso():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Validar campos obligatorios
        required_fields = ["usuario_id", "fecha_desaparicion", "lugar_desaparicion", "nombre_completo"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo '{field}' es obligatorio."}), 400

        # Paso 1: Crear PersonaDesaparecida primero
        persona_data = {
            "nombre_completo": data.get("nombre_completo"),
            "fecha_nacimiento": data.get("fecha_nacimiento"),
            "gender": data.get("gender"),
            "altura": data.get("altura"),
            "peso": data.get("peso"),
            "skinColor": data.get("skinColor"),
            "hairColor": data.get("hairColor"),
            "eyeColor": data.get("eyeColor"),
            "senas_particulares": data.get("senas_particulares"),
            "age": data.get("age"),
            "clothing": data.get("clothing")
        }
        
        persona_response = supabase.table("PersonaDesaparecida").insert(persona_data).execute()
        
        if hasattr(persona_response, "error") and persona_response.error:
            return jsonify({"error": f"Error al crear persona: {str(persona_response.error)}"}), 500
        
        persona_id = persona_response.data[0]["id"]
        
        # Paso 2: Crear el Caso con el persona_id
        caso_data = {
            "usuario_id": data["usuario_id"],
            "persona_id": persona_id,
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
            "observaciones": data.get("observaciones")
        }
        
        caso_response = supabase.table("Caso").insert(caso_data).execute()

        if hasattr(caso_response, "error") and caso_response.error:
            # Si falla el caso, intentar borrar la persona creada
            supabase.table("PersonaDesaparecida").delete().eq("id", persona_id).execute()
            return jsonify({"error": f"Error al crear caso: {str(caso_response.error)}"}), 500

        caso_id = caso_response.data[0]["id"]
        
        # Paso 3: Procesar fotos y generar encodings (si se proporcionaron)
        encodings_result = None
        if "photos" in data and data["photos"]:
            print(f"📸 Procesando fotos para {data['nombre_completo']}...")
            try:
                encodings_result = encodings_generator.process_case_photos(
                    person_name=data["nombre_completo"],
                    photos=data["photos"]
                )
                
                if encodings_result["success"]:
                    print(f"✅ Encodings generados: {encodings_result['encodings_generated']}")
                else:
                    print(f"⚠️ Error generando encodings: {encodings_result.get('error')}")
            except Exception as e:
                print(f"⚠️ Error procesando fotos: {e}")
                encodings_result = {
                    "success": False,
                    "error": str(e)
                }

        response_data = {
            "success": True,
            "message": "Caso creado correctamente",
            "data": caso_response.data,
            "caso_id": caso_id,
            "persona_id": persona_id
        }
        
        # Agregar información de encodings si se procesaron fotos
        if encodings_result:
            response_data["encodings"] = encodings_result

        return jsonify(response_data), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🟡 Obtener todos los casos
@caso_bp.route("/", methods=["GET"])
def get_all_casos():
    try:
        # Hacer JOIN con PersonaDesaparecida para obtener datos del desaparecido
        response = supabase.table("Caso").select(
            "*, PersonaDesaparecida(*)"
        ).order("created_at", desc=True).execute()
        
        if hasattr(response, "error") and response.error:
            return jsonify({"error": str(response.error)}), 500

        return jsonify({"data": response.data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔵 Obtener un caso por ID
@caso_bp.route("/<int:caso_id>", methods=["GET"])
def get_caso(caso_id):
    try:
        # Hacer JOIN con PersonaDesaparecida
        response = supabase.table("Caso").select(
            "*, PersonaDesaparecida(*)"
        ).eq("id", caso_id).single().execute()
        
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


# ✅ Obtener casos de un usuario específico
@caso_bp.route("/user/<int:user_id>", methods=["GET"])
def get_casos_by_user(user_id):
    try:
        # Hacer JOIN con PersonaDesaparecida
        response = supabase.table("Caso").select(
            "*, PersonaDesaparecida(*)"
        ).eq("usuario_id", user_id).order("created_at", desc=True).execute()
        
        if hasattr(response, "error") and response.error:
            return jsonify({"error": str(response.error)}), 500

        return jsonify({"success": True, "data": response.data, "count": len(response.data)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

