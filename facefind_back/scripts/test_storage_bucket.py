"""
Script para verificar configuración del bucket de evidencias
"""
import os
from supabase import create_client

# Configuración directa
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Cliente con Service Role Key
supabase_storage = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

BUCKET_NAME = "evidencias-deteccion"

def verificar_bucket():
    """Verifica si el bucket existe y está configurado correctamente"""
    try:
        print(f"🔍 Verificando bucket '{BUCKET_NAME}'...\n")
        
        # 1. Listar todos los buckets
        print("📦 Buckets disponibles:")
        buckets = supabase_storage.storage.list_buckets()
        for bucket in buckets:
            print(f"   - {bucket.name} (public: {bucket.public})")
        
        # 2. Verificar si existe el bucket
        bucket_exists = any(b.name == BUCKET_NAME for b in buckets)
        if not bucket_exists:
            print(f"\n❌ El bucket '{BUCKET_NAME}' NO EXISTE")
            print(f"\n💡 Para crearlo, ejecuta:")
            print(f"   supabase_storage.storage.create_bucket('{BUCKET_NAME}', public=True)")
            return False
        
        # 3. Verificar si es público
        bucket_info = next(b for b in buckets if b.name == BUCKET_NAME)
        print(f"\n✅ Bucket '{BUCKET_NAME}' encontrado")
        print(f"   Es público: {bucket_info.public}")
        
        if not bucket_info.public:
            print(f"\n⚠️  El bucket NO es público")
            print(f"   Las URLs públicas no funcionarán")
            print(f"\n💡 Para hacerlo público, ve a:")
            print(f"   Supabase Dashboard > Storage > {BUCKET_NAME} > Settings > Make Public")
            return False
        
        # 4. Listar archivos (primeros 10)
        print(f"\n📁 Archivos en el bucket (primeros 10):")
        try:
            files = supabase_storage.storage.from_(BUCKET_NAME).list()
            if not files:
                print("   (vacío)")
            else:
                for i, file in enumerate(files[:10]):
                    print(f"   {i+1}. {file['name']}")
                    # Generar URL pública
                    url = supabase_storage.storage.from_(BUCKET_NAME).get_public_url(file['name'])
                    print(f"      URL: {url}")
        except Exception as e:
            print(f"   Error listando archivos: {e}")
        
        print("\n✅ Bucket configurado correctamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def crear_bucket_si_no_existe():
    """Crea el bucket si no existe"""
    try:
        print(f"\n🔧 Intentando crear bucket '{BUCKET_NAME}'...")
        
        supabase_storage.storage.create_bucket(
            BUCKET_NAME,
            options={"public": True}  # Hacer público
        )
        
        print(f"✅ Bucket '{BUCKET_NAME}' creado exitosamente (público)")
        return True
        
    except Exception as e:
        error_msg = str(e)
        if "already exists" in error_msg.lower():
            print(f"ℹ️  El bucket ya existe")
            return True
        else:
            print(f"❌ Error creando bucket: {e}")
            return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TEST: Verificación de Bucket de Evidencias")
    print("=" * 60)
    
    # Verificar configuración
    print(f"\n📋 Configuración:")
    print(f"   SUPABASE_URL: {SUPABASE_URL}")
    print(f"   SERVICE_ROLE_KEY configurada: {'✅' if SUPABASE_SERVICE_ROLE_KEY else '❌'}")
    print(f"   Bucket: {BUCKET_NAME}\n")
    
    # Verificar bucket
    bucket_ok = verificar_bucket()
    
    if not bucket_ok:
        respuesta = input("\n¿Quieres intentar crear el bucket? (s/n): ")
        if respuesta.lower() == 's':
            crear_bucket_si_no_existe()
            print("\n" + "=" * 60)
            print("Verificando nuevamente...")
            print("=" * 60)
            verificar_bucket()
    
    print("\n" + "=" * 60)
    print("✅ Verificación completada")
    print("=" * 60)
