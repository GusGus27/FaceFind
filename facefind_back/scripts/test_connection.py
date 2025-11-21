"""
Test rápido de conexión a Supabase
"""
import sys
from pathlib import Path

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.supabase_client import supabase

print("🔍 Test de conexión a Supabase\n")

try:
    # Intentar consultar la tabla Usuario
    result = supabase.table("Usuario").select("*").limit(1).execute()
    print("✅ Conexión exitosa")
    print(f"✅ Tabla 'Usuario' accesible")
    
    if result.data:
        print(f"\n📊 Ejemplo de registro:")
        print(f"   Columnas: {list(result.data[0].keys())}")
    else:
        print("\n⚠️ Tabla vacía")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

print("\n✅ Todo OK - Supabase está funcionando")
