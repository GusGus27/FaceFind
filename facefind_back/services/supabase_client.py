from supabase import create_client
from dotenv import load_dotenv
import os

# 🔹 Cargar las variables desde el archivo .env
load_dotenv()

# 🔹 Leer las variables de entorno
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 🔹 Validar que existan
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("⚠️ Las variables SUPABASE_URL o SUPABASE_KEY no están configuradas correctamente en el archivo .env")

# 🔹 Crear cliente Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

#PROBAR CONEXIÓN
"""
if __name__ == "__main__":
    print("✅ Probando conexión con Supabase...")
    print(f"URL: {SUPABASE_URL}")
    print("Intentando listar tablas...")

    try:
        data = supabase.table("Caso").select("*").limit(1).execute()
        print("Conexión exitosa:", data)
    except Exception as e:
        print("❌ Error al conectar:", e)

"""