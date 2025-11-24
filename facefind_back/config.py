"""
Configuración centralizada para FaceFind Backend
"""
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class Config:
    """Configuración base de la aplicación"""
    
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "True") == "True"
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    PORT = int(os.getenv("FLASK_PORT", "5000"))
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Face Detection
    ENCODINGS_FILE = os.getenv("ENCODINGS_FILE", "encodings.pickle")
    FACE_TOLERANCE = float(os.getenv("FACE_TOLERANCE", "0.6"))
    
    # Evidencias
    EVIDENCIAS_RETENCION_DIAS = int(os.getenv('EVIDENCIAS_RETENCION_DIAS', 60))
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # SendGrid Email
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
    SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@facefind.com')
    
    @staticmethod
    def validate():
        """Valida que las variables críticas estén configuradas"""
        if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
            raise ValueError(
                "⚠️ Las variables SUPABASE_URL y SUPABASE_KEY son requeridas. "
                "Asegúrate de tener un archivo .env configurado."
            )
        
        if not Config.SUPABASE_SERVICE_ROLE_KEY:
            print("⚠️ SUPABASE_SERVICE_ROLE_KEY no configurada. Algunas funciones de Storage pueden no funcionar.")
        
        return True

# Validar configuración al importar
Config.validate()

