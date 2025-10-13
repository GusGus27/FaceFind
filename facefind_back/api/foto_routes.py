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


@foto_bp.route("/replace/<int:foto_id>", methods=["PUT"])
def replace_foto(foto_id):
    """
    Reemplaza una foto existente:
    1. Elimina los encodings antiguos de la tabla Embedding
    2. Elimina la foto antigua del storage
    3. Sube la nueva foto
    4. Actualiza el registro en FotoReferencia
    5. Genera nuevos encodings
    6. Recarga el modelo de detección
    """
    try:
        # Validar que venga el archivo
        if 'file' not in request.files:
            return jsonify({"error": "No se envió ningún archivo"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Nombre de archivo vacío"}), 400

        print(f"🔄 Iniciando reemplazo de foto ID: {foto_id}")

        # 1. Obtener información de la foto actual
        foto_response = supabase.table("FotoReferencia")\
            .select("*")\
            .eq("id", foto_id)\
            .execute()
        
        if not foto_response.data:
            return jsonify({"error": "Foto no encontrada"}), 404
        
        foto_actual = foto_response.data[0]
        caso_id = foto_actual['caso_id']
        ruta_antigua = foto_actual['ruta_archivo']
        
        print(f"📸 Foto actual: caso_id={caso_id}, ruta={ruta_antigua}")

        # 2. Eliminar encodings antiguos de la tabla Embedding
        print(f"🗑️ Eliminando encodings antiguos para foto_id={foto_id}")
        delete_encodings = supabase.table("Embedding")\
            .delete()\
            .eq("foto_referencia_id", foto_id)\
            .execute()
        
        if delete_encodings.data:
            print(f"✅ {len(delete_encodings.data)} encodings eliminados")
        else:
            print("⚠️ No se encontraron encodings para eliminar (o ya fueron eliminados)")

        # 3. Eliminar foto antigua del storage (opcional, puedes comentar si quieres mantener historial)
        try:
            # Extraer el path del storage desde la URL
            if BUCKET_NAME in ruta_antigua:
                # Formato: https://[...].supabase.co/storage/v1/object/public/fotos-referencia/12/frontal_123456.jpg
                storage_path = ruta_antigua.split(f"{BUCKET_NAME}/")[-1]
                print(f"🗑️ Eliminando foto antigua del storage: {storage_path}")
                
                delete_response = supabase.storage.from_(BUCKET_NAME).remove([storage_path])
                print(f"✅ Foto antigua eliminada del storage")
        except Exception as storage_error:
            print(f"⚠️ No se pudo eliminar foto antigua del storage: {storage_error}")
            # No es crítico, continuamos

        # 4. Subir nueva foto
        print(f"📤 Subiendo nueva foto para caso_id={caso_id}")
        tipo_foto = "updated"  # Puedes inferir el tipo si lo necesitas
        nueva_url, error = upload_photo_to_supabase(file, caso_id, tipo_foto)
        
        if error:
            return jsonify({"error": f"Error subiendo nueva foto: {error}"}), 500
        
        print(f"✅ Nueva foto subida: {nueva_url}")

        # 5. Actualizar registro en FotoReferencia
        print(f"🔄 Actualizando registro FotoReferencia ID={foto_id}")
        update_response = supabase.table("FotoReferencia")\
            .update({
                "ruta_archivo": nueva_url,
                "created_at": datetime.now().isoformat()  # Actualizar fecha
            })\
            .eq("id", foto_id)\
            .execute()
        
        if not update_response.data:
            return jsonify({"error": "No se pudo actualizar el registro de la foto"}), 500
        
        print(f"✅ Registro actualizado")

        # 6. Generar nuevos encodings
        print(f"🧠 Generando nuevos encodings para foto_id={foto_id}")
        generador = GeneradorEncodings()
        encoding_obj = generador.generar_encodings(nueva_url, foto_id)
        
        if not encoding_obj:
            print("⚠️ No se pudo generar encoding para la nueva foto")
            return jsonify({
                "success": True,
                "message": "Foto reemplazada pero no se generó encoding",
                "nueva_url": nueva_url,
                "foto_id": foto_id
            }), 200
        
        # Guardar encoding en DB
        encoding_dict = encoding_obj.guardar_en_db(supabase)
        print(f"✅ Nuevo encoding guardado: {encoding_dict}")

        # 7. Recargar encodings en el sistema de detección
        from api.detection_routes import initialize_detection_service
        
        print("🔄 Recargando encodings en el sistema de detección...")
        reload_success = initialize_detection_service()
        
        if reload_success:
            print("✅ Encodings recargados automáticamente")
        else:
            print("⚠️ No se pudieron recargar los encodings automáticamente")

        return jsonify({
            "success": True,
            "message": "Foto reemplazada exitosamente",
            "foto_id": foto_id,
            "nueva_url": nueva_url,
            "encoding_generado": bool(encoding_obj),
            "encodings_reloaded": reload_success
        }), 200

    except Exception as e:
        import traceback
        print("❌ Error reemplazando foto:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@foto_bp.route("/delete/<int:foto_id>", methods=["DELETE"])
def delete_foto(foto_id):
    """
    Elimina una foto de referencia:
    1. Elimina encodings asociados
    2. Elimina del storage
    3. Elimina registro de BD
    4. Recarga modelo
    """
    try:
        print(f"🗑️ Iniciando eliminación de foto ID: {foto_id}")

        # 1. Obtener información de la foto
        foto_response = supabase.table("FotoReferencia")\
            .select("*")\
            .eq("id", foto_id)\
            .execute()
        
        if not foto_response.data:
            return jsonify({"error": "Foto no encontrada"}), 404
        
        foto = foto_response.data[0]
        ruta_archivo = foto['ruta_archivo']

        # 2. Eliminar encodings
        print(f"🗑️ Eliminando encodings para foto_id={foto_id}")
        supabase.table("Embedding")\
            .delete()\
            .eq("foto_referencia_id", foto_id)\
            .execute()

        # 3. Eliminar del storage
        try:
            if BUCKET_NAME in ruta_archivo:
                storage_path = ruta_archivo.split(f"{BUCKET_NAME}/")[-1]
                print(f"🗑️ Eliminando del storage: {storage_path}")
                supabase.storage.from_(BUCKET_NAME).remove([storage_path])
        except Exception as storage_error:
            print(f"⚠️ Error eliminando del storage: {storage_error}")

        # 4. Eliminar registro de BD
        delete_response = supabase.table("FotoReferencia")\
            .delete()\
            .eq("id", foto_id)\
            .execute()

        # 5. Recargar encodings
        from api.detection_routes import initialize_detection_service
        reload_success = initialize_detection_service()

        return jsonify({
            "success": True,
            "message": "Foto eliminada exitosamente",
            "encodings_reloaded": reload_success
        }), 200

    except Exception as e:
        import traceback
        print("❌ Error eliminando foto:", e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
