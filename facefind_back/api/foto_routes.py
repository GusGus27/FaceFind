from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import os
from datetime import datetime
from dotenv import load_dotenv
import base64

from models.generador_encodings import GeneradorEncodings
from models.encoding import Encoding

load_dotenv()
foto_bp = Blueprint("foto_bp", __name__)

# 🔑 Configurar cliente Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("🔑 Supabase URL:", SUPABASE_URL)
print("🔑 Supabase KEY starts with:", SUPABASE_KEY[:10] if SUPABASE_KEY else "None")

BUCKET_NAME = "fotos-referencia"


def upload_photo_to_supabase(file, case_id, tipo):
    """Sube una foto al bucket de Supabase y devuelve la URL pública."""
    try:
        extension = file.filename.split(".")[-1]
        filename = f"{case_id}/{tipo}_{int(datetime.now().timestamp())}.{extension}"

        file_bytes = file.read()
        res = supabase.storage.from_(BUCKET_NAME).upload(filename, file_bytes)
        if isinstance(res, dict) and res.get("error"):
            return None, res["error"]["message"]

        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
        return public_url, None
    except Exception as e:
        return None, str(e)


@foto_bp.route("/upload", methods=["POST"])
def upload_photos():
    try:
        case_id = request.form.get("caso_id")
        if not case_id:
            return jsonify({"error": "caso_id es obligatorio"}), 400

        fotos_urls = {}
        generador = GeneradorEncodings()

        for tipo in ["frontal", "profile1", "profile2"]:
            file = request.files.get(tipo)
            if not file:
                continue

            # Subir foto a Supabase
            url, error = upload_photo_to_supabase(file, case_id, tipo)
            if error:
                return jsonify({"error": f"Error subiendo {tipo}: {error}"}), 500
            fotos_urls[tipo] = url

            # Guardar registro FotoReferencia
            res = supabase.table("FotoReferencia").insert({
                "caso_id": case_id,
                "ruta_archivo": url,
                "created_at": datetime.now().isoformat()
            }).execute()
            if not res.data:
                return jsonify({"error": f"No se pudo registrar FotoReferencia para {tipo}"}), 500
            foto_id = res.data[0]["id"]

            # Generar encoding y guardar en DB
            encoding_obj = generador.generar_encodings(url, foto_id)
            if not encoding_obj:
                continue

            encoding_dict = encoding_obj.guardar_en_db(supabase)
            fotos_urls[f"{tipo}_encoding"] = encoding_dict

        print("🧪 Debug tipos:", {k: type(v) for k, v in fotos_urls.items()})

        # 🔄 Recargar encodings automáticamente después de generar nuevos
        # Importación diferida para evitar ciclos de importación
        from api.detection_routes import initialize_detection_service
        
        print("🔄 Recargando encodings en el sistema de detección...")
        reload_success = initialize_detection_service()
        if reload_success:
            print("✅ Encodings recargados automáticamente")
        else:
            print("⚠️ No se pudieron recargar los encodings automáticamente")

        return jsonify({
            "success": True,
            "message": "Fotos y encodings procesados correctamente",
            "result": fotos_urls,
            "encodings_reloaded": reload_success
        }), 200

    except Exception as e:
        import traceback
        print("❌ Error interno:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@foto_bp.route("/caso/<int:caso_id>", methods=["GET"])
def get_fotos_by_caso(caso_id):
    """Obtiene todas las fotos de un caso específico"""
    try:
        response = supabase.table("FotoReferencia")\
            .select("*")\
            .eq("caso_id", caso_id)\
            .execute()
        
        if not response.data:
            return jsonify({
                "success": True,
                "fotos": [],
                "message": "No se encontraron fotos para este caso"
            }), 200
        
        # Transformar ruta_archivo a url_foto para compatibilidad con frontend
        fotos_transformed = []
        for foto in response.data:
            foto_copy = foto.copy()
            foto_copy['url_foto'] = foto_copy.get('ruta_archivo', '')
            fotos_transformed.append(foto_copy)
        
        return jsonify({
            "success": True,
            "fotos": fotos_transformed
        }), 200
        
    except Exception as e:
        print(f"❌ Error obteniendo fotos del caso {caso_id}:", e)
        return jsonify({"error": str(e)}), 500
