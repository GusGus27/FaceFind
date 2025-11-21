import sys
from pathlib import Path

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask, jsonify
from config import Config
from services.supabase_client import get_supabase_client

app = Flask(__name__)

# Obtener cliente Supabase con Service Role Key
supabase = get_supabase_client()

@app.route("/make_admin/<user_id>", methods=["POST"])
def make_admin(user_id):
    try:
        # ⚠️ Usa admin API (disponible con la Service Role Key)
        result = supabase.auth.admin.update_user_by_id(
            user_id,
            {
                "app_metadata": {"role": "admin"}
            }
        )

        return jsonify({"status": "ok", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
