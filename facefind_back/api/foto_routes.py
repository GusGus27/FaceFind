from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import os
from datetime import datetime

foto_bp = Blueprint("foto_bp", __name__)

# 🔑 Configurar cliente Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET_NAME = "fotos-referencia"

# 📤 Subir foto al bucket
def upload_photo_to_supabase(file, case_id, tipo):
    try:
        extension = file.filename.split(".")[-1]
        filename = f"{case_id}/{tipo}_{int(datetime.now().timestamp())}.{extension}"

        # Subir archivo al bucket
        res = supabase.storage.from_(BUCKET_NAME).upload(filename, file)
        if res.get("error"):
            return None, res["error"]["message"]

        # Obtener URL pública
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(filename)
        return public_url, None
    except Exception as e:
        return None, str(e)


# 📦 Endpoint para subir fotos (recibe archivos form-data)
@foto_bp.route("/upload", methods=["POST"])
def upload_photos():
    try:
        case_id = request.form.get("caso_id")
        if not case_id:
            return jsonify({"error": "caso_id es obligatorio"}), 400

        fotos_urls = {}
        for tipo in ["frontal", "perfil", "otros"]:
            file = request.files.get(tipo)
            if file:
                url, error = upload_photo_to_supabase(file, case_id, tipo)
                if error:
                    return jsonify({"error": f"Error subiendo {tipo}: {error}"}), 500
                fotos_urls[tipo] = url

        # Guardar las URLs en la tabla FotoReferencia
        for tipo, url in fotos_urls.items():
            supabase.table("FotoReferencia").insert({
                "caso_id": case_id,
                "ruta_archivo": url,
                "created_at": datetime.now().isoformat()
            }).execute()

        return jsonify({"message": "Fotos subidas correctamente", "urls": fotos_urls}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
