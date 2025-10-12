from flask import Blueprint, request, jsonify
from services.caso_service import CasoService
from services.encodings_generator import encodings_generator
from services.user_service import UserService
from datetime import datetime
from models.usuario import UsuarioBase, UsuarioRegistrado

caso_bp = Blueprint("casos", __name__)

# 🟢 Crear un nuevo caso
@caso_bp.route("/create", methods=["POST"])
def create_caso():
    """
    Crea un nuevo caso de persona desaparecida
    Usa CasoService (OOP) para manejar la lógica de negocio
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Validar campos obligatorios
        required_fields = ["usuario_id", "fecha_desaparicion", "lugar_desaparicion", "nombre_completo"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo '{field}' es obligatorio."}), 400

        # Crear caso usando Service OOP
        caso_dict = CasoService.create_caso(data)
        
        caso_id = caso_dict.get("id")
        persona_dict = caso_dict.get("PersonaDesaparecida", {})
        persona_id = persona_dict.get("id")

        # Paso 3: Procesar fotos y generar encodings (si se proporcionaron)
        encodings_result = None
        if "photos" in data and data["photos"]:
            persona_nombre = persona_dict.get("nombre_completo", "Desconocido")
            print(f"📸 Procesando fotos para {persona_nombre}...")
            try:
                encodings_result = encodings_generator.process_case_photos(
                    person_name=persona_nombre,
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

        # Obtener el usuario que creó el caso (si es UsuarioRegistrado, tiene el método crearCaso())
        usuario_db = UserService.get_user_by_id(data["usuario_id"])
        if usuario_db:
            usuario = UsuarioBase.from_dict(usuario_db)
            if isinstance(usuario, UsuarioRegistrado):
                print(f"✅ Caso creado por UsuarioRegistrado: {usuario.email}")

        response_data = {
            "success": True,
            "message": "Caso creado correctamente",
            "data": caso_dict,
            "caso_id": caso_id,
            "persona_id": persona_id,
            "persona": persona_dict
        }

        # Agregar información de encodings si se procesaron fotos
        if encodings_result:
            response_data["encodings"] = encodings_result

        return jsonify(response_data), 201

    except Exception as e:
        print(f"❌ Error en /casos/create: {e}")
        return jsonify({"error": str(e)}), 500


# 🟡 Obtener todos los casos
@caso_bp.route("/", methods=["GET"])
def get_all_casos():
    """
    Obtiene todos los casos con sus PersonaDesaparecida
    Usa CasoService (OOP)
    """
    try:
        casos = CasoService.get_all_casos()
        
        return jsonify({
            "data": casos,
            "count": len(casos)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔵 Obtener un caso por ID
@caso_bp.route("/<int:caso_id>", methods=["GET"])
def get_caso(caso_id):
    """
    Obtiene un caso específico por ID
    Usa CasoService (OOP)
    """
    try:
        caso = CasoService.get_caso_by_id(caso_id)
        
        if not caso:
            return jsonify({"error": "Caso no encontrado"}), 404

        return jsonify({
            "data": caso,
            "tipo_objeto": "Caso (OOP)"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ✅ Actualizar un caso
@caso_bp.route("/<int:caso_id>", methods=["PUT"])
def update_caso(caso_id):
    """Actualiza un caso - Usa CasoService (OOP)"""
    data = request.get_json()
    try:
        caso_actualizado = CasoService.update_caso(caso_id, data)
        return jsonify({"success": True, "data": caso_actualizado})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Eliminar un caso
@caso_bp.route("/<int:caso_id>", methods=["DELETE"])
def delete_caso(caso_id):
    """Elimina un caso - Usa CasoService (OOP)"""
    try:
        success = CasoService.delete_caso(caso_id)
        if success:
            return jsonify({"success": True, "message": "Caso eliminado correctamente"})
        else:
            return jsonify({"success": False, "error": "No se pudo eliminar el caso"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Buscar casos por nombre
@caso_bp.route("/search", methods=["GET"])
def search_casos_by_name():
    """Busca casos por nombre - Usa CasoService (OOP)"""
    try:
        search_term = request.args.get("q", "")
        casos = CasoService.search_casos(search_term)
        return jsonify({"success": True, "data": casos})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Cambiar estado de un caso
@caso_bp.route("/<int:caso_id>/status", methods=["PATCH"])
def update_caso_status(caso_id):
    """
    Cambia el estado de un caso - Usa CasoService (OOP)
    """
    data = request.get_json()
    try:
        new_status = data.get("status")
        
        caso_actualizado = CasoService.update_caso_status(caso_id, new_status)
        
        if not caso_actualizado:
            return jsonify({"success": False, "error": "Caso no encontrado"}), 404

        print(f"✅ Estado del caso {caso_id} cambiado a: {new_status}")

        return jsonify({
            "success": True,
            "data": caso_actualizado,
            "mensaje": f"Caso actualizado a estado: {new_status}"
        })
    except Exception as e:
        print(f"❌ Error actualizando estado del caso: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Estadísticas de casos
@caso_bp.route("/stats", methods=["GET"])
def get_caso_stats():
    """Obtiene estadísticas de casos - Usa CasoService (OOP)"""
    try:
        stats = CasoService.get_casos_stats()
        return jsonify({"success": True, "data": stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ✅ Obtener casos de un usuario específico
@caso_bp.route("/user/<int:user_id>", methods=["GET"])
def get_casos_by_user(user_id):
    """Obtiene casos de un usuario - Usa CasoService (OOP)"""
    try:
        casos = CasoService.get_casos_by_user(user_id)
        return jsonify({"success": True, "data": casos, "count": len(casos)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

