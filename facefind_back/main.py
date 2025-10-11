from flask import Flask
from flask_cors import CORS
from api.auth_routes import auth_bp
from api.user_routes import user_bp
from api.caso_routes import caso_bp
from api.encodings_routes import encodings_bp
from api.foto_routes import foto_bp
from facefind.sistema_facefind import SistemaFaceFind

# Crear app Flask principal
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(caso_bp, url_prefix="/casos")
app.register_blueprint(encodings_bp, url_prefix="/encodings")
app.register_blueprint(foto_bp, url_prefix="/fotos")
app.register_blueprint(SistemaFaceFind().app)

@app.route('/')
def index():
    return {"message": "🚀 FaceFind API corriendo con Flask"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
