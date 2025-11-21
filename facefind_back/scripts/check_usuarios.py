"""
Script para verificar usuarios en la tabla Usuario
"""
import sys
from pathlib import Path

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.supabase_client import supabase

print("🔍 Verificando tabla Usuario...\n")

# Ver usuarios en la tabla Usuario
result = supabase.table("Usuario").select("*").execute()

print(f"Total de usuarios en tabla Usuario: {len(result.data)}\n")

if result.data:
    print("Usuarios encontrados:")
    for user in result.data:
        print(f"  ID: {user.get('id')}")
        print(f"  Nombre: {user.get('nombre')}")
        print(f"  Email: {user.get('email')}")
        print(f"  Role: {user.get('role')}")
        print(f"  Status: {user.get('status')}")
        print("  " + "-" * 40)
else:
    print("⚠️ La tabla Usuario está VACÍA")
    print("\nEsto significa que:")
    print("  1. El signup NO está insertando en la tabla Usuario")
    print("  2. O hubo un error al registrar")
    print("\n💡 Solución:")
    print("  - Intenta registrar un usuario nuevo desde el frontend")
    print("  - O ejecuta: python fix_usuarios.py")
