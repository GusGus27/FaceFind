"""
Script de diagnóstico para Supabase Storage
Verifica configuración y permisos del bucket face-encodings
"""
import sys
from pathlib import Path

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configurar encoding UTF-8 para Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from config import Config
from supabase import create_client

def diagnose_storage():
    print("🔍 Diagnóstico de Supabase Storage")
    print("=" * 50)
    
    # 1. Verificar configuración
    print("\n1️⃣ Variables de configuración:")
    print(f"   SUPABASE_URL: {'✅ Configurada' if Config.SUPABASE_URL else '❌ No configurada'}")
    print(f"   SUPABASE_KEY: {'✅ Configurada' if Config.SUPABASE_KEY else '❌ No configurada'}")
    print(f"   SUPABASE_SERVICE_ROLE_KEY: {'✅ Configurada' if Config.SUPABASE_SERVICE_ROLE_KEY else '❌ No configurada'}")
    
    if not Config.SUPABASE_SERVICE_ROLE_KEY:
        print("\n❌ ERROR: SUPABASE_SERVICE_ROLE_KEY es requerida para operaciones de Storage")
        print("💡 Solución:")
        print("   1. Ve a tu proyecto en Supabase")
        print("   2. Settings > API")
        print("   3. Copia la 'service_role' key")
        print("   4. Agrega SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key a tu .env")
        return False
    
    # 2. Probar conexión con Service Role
    print("\n2️⃣ Conexión con Service Role:")
    try:
        client = create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)
        print("   ✅ Cliente inicializado correctamente")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 3. Verificar bucket
    print("\n3️⃣ Bucket 'face-encodings':")
    try:
        buckets = client.storage.list_buckets()
        print(f"   📋 Buckets encontrados: {len(buckets)}")
        
        # Manejar diferentes estructuras de respuesta
        bucket_names = []
        for bucket in buckets:
            if hasattr(bucket, 'name'):
                bucket_names.append(bucket.name)
            elif isinstance(bucket, dict):
                bucket_names.append(bucket.get('name', str(bucket)))
            else:
                bucket_names.append(str(bucket))
        
        print(f"   📝 Nombres: {bucket_names}")
        
        if 'face-encodings' in bucket_names:
            print("   ✅ Bucket 'face-encodings' existe")
            
            # Verificar permisos
            try:
                files = client.storage.from_('face-encodings').list()
                print("   ✅ Permisos de lectura: OK")
                
                # Intentar crear un archivo de prueba
                test_data = b"test"
                try:
                    client.storage.from_('face-encodings').upload(
                        "test.txt", 
                        test_data,
                        file_options={"content-type": "application/octet-stream"}
                    )
                    print("   ✅ Permisos de escritura: OK")
                    
                    # Limpiar archivo de prueba
                    client.storage.from_('face-encodings').remove(["test.txt"])
                    print("   ✅ Permisos de eliminación: OK")
                    
                except Exception as e:
                    print(f"   ❌ Error de escritura: {e}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error de lectura: {e}")
                return False
                
        else:
            print("   ❌ Bucket 'face-encodings' no existe")
            print("💡 Solución:")
            print("   1. Ve a Storage en tu proyecto Supabase")
            print("   2. Crea un bucket llamado 'face-encodings'")
            print("   3. Configura las políticas RLS si es necesario")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # 4. Verificar archivo de encodings local
    print("\n4️⃣ Archivo local 'encodings.pickle':")
    encodings_path = Path(__file__).parent.parent / "encodings.pickle"
    
    if encodings_path.exists():
        size_kb = encodings_path.stat().st_size / 1024
        print(f"   ✅ Archivo existe")
        print(f"   📁 Ruta: {encodings_path.absolute()}")
        print(f"   📦 Tamaño: {size_kb:.2f} KB")
    else:
        print(f"   ❌ Archivo no existe")
        print(f"   📁 Ruta esperada: {encodings_path.absolute()}")
        print("💡 Solución:")
        print("   1. Genera los encodings faciales primero")
        print("   2. O descarga desde la nube: python scripts/sync_encodings.py download")
    
    print("\n" + "=" * 50)
    print("✅ Diagnóstico completado")
    return True

if __name__ == "__main__":
    diagnose_storage()
