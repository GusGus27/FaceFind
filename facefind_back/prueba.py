from flask import Flask, jsonify
from supabase import create_client, Client
import os

app = Flask(__name__)

# Configuración
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
