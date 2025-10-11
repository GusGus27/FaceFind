"""
Script de utilidad para sincronizar encodings con Supabase Storage
Uso:
    python scripts/sync_encodings.py upload    # Subir encodings locales a la nube
    python scripts/sync_encodings.py download  # Descargar encodings de la nube
    python scripts/sync_encodings.py status    # Ver estado de encodings
"""
import sys
import os
import pickle
from pathlib import Path

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Obtener el directorio raíz del proyecto (facefind_back/)
BACKEND_ROOT = Path(__file__).parent.parent
ENCODINGS_PATH = BACKEND_ROOT / "encodings.pickle"

# Agregar el directorio raíz al path para importar módulos
sys.path.insert(0, str(BACKEND_ROOT))

from services.encodings_storage import (
    upload_encodings_to_cloud, 
    download_encodings_from_cloud,
    get_encodings_status
)

def main():
    if len(sys.argv) < 2:
        print("❌ Uso: python scripts/sync_encodings.py [upload|download|status]")
        print("\nComandos disponibles:")
        print("  upload   - Subir encodings.pickle a Supabase Storage")
        print("  download - Descargar encodings.pickle desde Supabase Storage")
        print("  status   - Ver estado de encodings (local y nube)")
        print(f"\n📂 Archivo: {ENCODINGS_PATH}")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "upload":
        print("📤 Subiendo encodings a Supabase Storage...")
        print(f"📂 Desde: {ENCODINGS_PATH}")
        
        # Verificar que el archivo existe antes de intentar subir
        if not ENCODINGS_PATH.exists():
            print(f"❌ Error: El archivo {ENCODINGS_PATH} no existe")
            print(f"💡 Genera los encodings primero o verifica la ruta")
            sys.exit(1)
        
        # Cambiar al directorio raíz para que encodings_storage encuentre el archivo
        os.chdir(BACKEND_ROOT)
        result = upload_encodings_to_cloud()
        
        if result["success"]:
            print(f"✅ Subida exitosa")
            print(f"📁 Archivo: encodings.pickle")
            print(f"📦 Tamaño: {result['size']} bytes ({result['size']/1024:.2f} KB)")
        else:
            print(f"❌ Error: {result['error']}")
            if 'solution' in result:
                print(f"💡 Solución: {result['solution']}")
            sys.exit(1)
    
    elif command == "download":
        print("📥 Descargando encodings desde Supabase Storage...")
        print(f"📂 Destino: {ENCODINGS_PATH}")
        
        # Cambiar al directorio raíz para que encodings_storage guarde en el lugar correcto
        os.chdir(BACKEND_ROOT)
        result = download_encodings_from_cloud()
        
        if result["success"]:
            print(f"✅ {result['message']}")
            print(f"📁 Archivo: {result['file_name']}")
            print(f"📦 Tamaño: {result['size']} bytes ({result['size']/1024:.2f} KB)")
            print(f"💾 Guardado en: {ENCODINGS_PATH}")
            
            # Leer contenido
            try:
                with open(ENCODINGS_PATH, 'rb') as f:
                    data = pickle.load(f)
                print(f"📊 Encodings: {len(data.get('encodings', []))}")
                print(f"👥 Personas: {len(set(data.get('names', [])))}")
            except Exception as e:
                print(f"⚠️ Advertencia: No se pudo leer el archivo: {e}")
        else:
            print(f"❌ Error: {result['error']}")
            sys.exit(1)
    
    elif command == "status":
        print("📊 Estado de encodings:")
        print("-" * 50)
        
        # Cambiar al directorio raíz para verificar status correctamente
        os.chdir(BACKEND_ROOT)
        status = get_encodings_status()
        
        # Local
        print(f"\n🖥️  Local:")
        if status['local']['exists']:
            size_kb = status['local']['size'] / 1024
            print(f"   Existe: ✅ Sí")
            print(f"   Ruta: {ENCODINGS_PATH.absolute()}")
            print(f"   Tamaño: {size_kb:.2f} KB")
            
            # Leer contenido
            try:
                with open(ENCODINGS_PATH, 'rb') as f:
                    data = pickle.load(f)
                encodings_count = len(data.get('encodings', []))
                unique_names = len(set(data.get('names', [])))
                print(f"   Encodings: {encodings_count}")
                print(f"   Personas únicas: {unique_names}")
            except Exception as e:
                print(f"   ⚠️ Error leyendo: {e}")
        else:
            print(f"   Existe: ❌ No")
            print(f"   Ruta esperada: {ENCODINGS_PATH.absolute()}")
        
        # Remoto
        print(f"\n☁️  Remoto (Supabase):")
        if 'error' in status['cloud']:
            print(f"   ❌ Error: {status['cloud']['error']}")
        elif status['cloud']['exists']:
            size_kb = status['cloud']['size'] / 1024
            print(f"   Existe: ✅ Sí")
            print(f"   Bucket: face-encodings")
            print(f"   Archivo: encodings.pickle")
            print(f"   Tamaño: {size_kb:.2f} KB")
        else:
            print(f"   Existe: ❌ No")
            print(f"   💡 Usa 'python scripts/sync_encodings.py upload' para subir")
        
        print("\n" + "-" * 50)
    
    else:
        print(f"❌ Comando desconocido: {command}")
        print("Comandos disponibles: upload, download, status")
        sys.exit(1)

if __name__ == "__main__":
    main()
