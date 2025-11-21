"""
Rutas API para manejo de encodings faciales
"""
from flask import Blueprint, jsonify
from services.encodings_storage import (
    upload_encodings_to_cloud,
    download_encodings_from_cloud,
    get_encodings_status,
    sync_encodings
)

encodings_bp = Blueprint("encodings", __name__)


@encodings_bp.route("/upload", methods=["POST"])
def upload_encodings():
    """Sube encodings a Supabase Storage"""
    try:
        result = upload_encodings_to_cloud()
        return jsonify(result), 200 if result["success"] else 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@encodings_bp.route("/download", methods=["GET"])
def download_encodings():
    """Descarga encodings desde Supabase Storage"""
    try:
        result = download_encodings_from_cloud()
        return jsonify(result), 200 if result["success"] else 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@encodings_bp.route("/sync", methods=["POST"])
def sync():
    """Sincroniza encodings (upload y download)"""
    try:
        result = sync_encodings("both")
        return jsonify(result), 200 if result["success"] else 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@encodings_bp.route("/status", methods=["GET"])
def status():
    """Obtiene estado de encodings (local y nube)"""
    try:
        result = get_encodings_status()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
