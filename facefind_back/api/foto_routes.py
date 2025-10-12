from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import os
from datetime import datetime
from dotenv import load_dotenv

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
    try:
        extension = file.filename.split(".")[-1]
        filename = f"{case_id}/{tipo}_{int(datetime.now().timestamp())}.{extension}"

        # Leer bytes
        file_bytes = file.read()

        # Subir a Supabase
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

            # 1️⃣ Subir a Supabase Storage
            url, error = upload_photo_to_supabase(file, case_id, tipo)
            if error:
                return jsonify({"error": f"Error subiendo {tipo}: {error}"}), 500
            fotos_urls[tipo] = url

            # 2️⃣ Guardar en FotoReferencia
            res = supabase.table("FotoReferencia").insert({
                "caso_id": case_id,
                "ruta_archivo": url,
                "created_at": datetime.now().isoformat()
            }).execute()
            if not res.data:
                return jsonify({"error": f"No se pudo registrar FotoReferencia para {tipo}"}), 500

            foto_id = res.data[0]["id"]

            # 3️⃣ Generar encoding
            encoding_obj = generador.generar_encodings(url, foto_id)

            # 4️⃣ Guardar encoding
            if encoding_obj:
                encoding_dict = encoding_obj.guardar_en_db(supabase)
                print("📦 Encoding dict listo para JSON:", encoding_dict)
                fotos_urls[f"{tipo}_encoding"] = encoding_dict


        return jsonify({
            "message": "Fotos y encodings procesados correctamente",
            "result": fotos_urls
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
