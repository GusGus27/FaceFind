"""
Script de utilidad para sincronizar encodings con Supabase Storage
Uso:
    python sync_encodings.py upload    # Subir encodings locales a la nube
    python sync_encodings.py download  # Descargar encodings de la nube
    python sync_encodings.py status    # Ver estado de encodings
"""
import sys
import os
import pickle
from services.encodings_storage import (
    upload_encodings_to_cloud, 
    download_encodings_from_cloud,
    get_encodings_status
)

def main():
    if len(sys.argv) < 2:
        print("❌ Uso: python sync_encodings.py [upload|download|status]")
        print("\nComandos disponibles:")
        print("  upload   - Subir encodings.pickle a Supabase Storage")
        print("  download - Descargar encodings.pickle desde Supabase Storage")
        print("  status   - Ver estado de encodings (local y nube)")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "upload":
        print("📤 Subiendo encodings a Supabase Storage...")
        result = upload_encodings_to_cloud()
        
        if result["success"]:
            #print(f"✅ {result['message']}")
            print(f"📁 Archivo: {result['file_name']}")
            print(f"📦 Tamaño: {result['size']} bytes ({result['size']/1024:.2f} KB)")
        else:
            print(f"❌ Error: {result['error']}")
            if 'solution' in result:
                print(f"💡 Solución: {result['solution']}")
            sys.exit(1)
    
    elif command == "download":
        print("📥 Descargando encodings desde Supabase Storage...")
        result = download_encodings_from_cloud()
        
        if result["success"]:
            print(f"✅ {result['message']}")
            print(f"📁 Archivo: {result['file_name']}")
            print(f"📦 Tamaño: {result['size']} bytes ({result['size']/1024:.2f} KB)")
            print(f"💾 Guardado en: {result['local_path']}")
            
            # Leer contenido
            try:
                with open(result['local_path'], 'rb') as f:
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
        
        status = get_encodings_status()
        
        # Local
        print(f"\n🖥️  Local:")
        if status['local']['exists']:
            size_kb = status['local']['size'] / 1024
            print(f"   Existe: ✅ Sí")
            print(f"   Ruta: {os.path.abspath('encodings.pickle')}")
            print(f"   Tamaño: {size_kb:.2f} KB")
            
            # Leer contenido
            try:
                with open('encodings.pickle', 'rb') as f:
                    data = pickle.load(f)
                encodings_count = len(data.get('encodings', []))
                unique_names = len(set(data.get('names', [])))
                print(f"   Encodings: {encodings_count}")
                print(f"   Personas únicas: {unique_names}")
            except Exception as e:
                print(f"   ⚠️ Error leyendo: {e}")
        else:
            print(f"   Existe: ❌ No")
            print(f"   Ruta esperada: {os.path.abspath('encodings.pickle')}")
        
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
            print(f"   💡 Usa 'python sync_encodings.py upload' para subir")
        
        print("\n" + "-" * 50)
    
    else:
        print(f"❌ Comando desconocido: {command}")
        print("Comandos disponibles: upload, download, status")
        sys.exit(1)

if __name__ == "__main__":
    main()
