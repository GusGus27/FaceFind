"""
Script de diagnóstico para problemas de Supabase Storage
"""
import os
import sys

# Cargar variables de entorno
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("⚠️ python-dotenv no instalado, usando variables del sistema")

from services.supabase_client import supabase

def diagnose():
    print("🔍 Diagnóstico de Supabase Storage\n")
    print("=" * 60)
    
    # 1. Verificar variables de entorno
    print("\n1️⃣ Variables de entorno:")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    print(f"   SUPABASE_URL: {'✅ Configurada' if supabase_url else '❌ No configurada'}")
    if supabase_url:
        print(f"      {supabase_url}")
    
    print(f"   SUPABASE_KEY: {'✅ Configurada' if supabase_key else '❌ No configurada'}")
    
    if supabase_key:
        # Verificar si es service_role (empieza con eyJ y es largo)
        is_service_role = len(supabase_key) > 200
        key_type = '✅ SERVICE_ROLE' if is_service_role else '⚠️ ANON (deberías usar service_role)'
        print(f"      Tipo de key: {key_type}")
        print(f"      Longitud: {len(supabase_key)} caracteres")
    else:
        print("      ❌ SUPABASE_KEY no está configurada en .env")
        return
    
    # 2. Verificar conexión
    print("\n2️⃣ Conexión a Supabase:")
    try:
        print("   ✅ Cliente inicializado correctamente")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # 3. Verificar bucket
    print("\n3️⃣ Bucket 'face-encodings':")
    try:
        buckets = supabase.storage.list_buckets()
        bucket_exists = any(b.name == 'face-encodings' for b in buckets)
        
        if bucket_exists:
            print("   ✅ Bucket existe")
            
            # Obtener info del bucket
            for b in buckets:
                if b.name == 'face-encodings':
                    print(f"      ID: {b.id}")
                    print(f"      Público: {'Sí' if b.public else 'No'}")
                    print(f"      Creado: {b.created_at}")
            
            # Listar archivos
            try:
                files = supabase.storage.from_('face-encodings').list()
                print(f"   📁 Archivos en el bucket: {len(files)}")
                
                if len(files) > 0:
                    for file in files:
                        size = file.get('metadata', {}).get('size', 0)
                        size_kb = size / 1024
                        print(f"      - {file['name']} ({size_kb:.2f} KB)")
                else:
                    print("      (vacío)")
                    
            except Exception as e:
                print(f"   ⚠️ Error listando archivos: {e}")
        else:
            print("   ❌ Bucket NO existe")
            print("   💡 Solución:")
            print("      1. Ve a Supabase Dashboard → Storage")
            print("      2. Click en 'New bucket'")
            print("      3. Nombre: 'face-encodings'")
            print("      4. Público: No (Private)")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # 4. Verificar políticas RLS
    print("\n4️⃣ Permisos y Políticas RLS:")
    try:
        # Intentar subir un archivo de prueba
        test_data = b"test_diagnostico"
        print("   🧪 Probando permisos de escritura...")
        
        result = supabase.storage.from_('face-encodings').upload(
            'test_diagnostico.txt',
            test_data,
            file_options={"content-type": "text/plain", "upsert": "true"}
        )
        print("   ✅ Permisos de escritura OK")
        
        # Intentar leer
        print("   🧪 Probando permisos de lectura...")
        data = supabase.storage.from_('face-encodings').download('test_diagnostico.txt')
        print("   ✅ Permisos de lectura OK")
        
        # Limpiar
        supabase.storage.from_('face-encodings').remove(['test_diagnostico.txt'])
        print("   ✅ Permisos de eliminación OK")
        
    except Exception as e:
        error_msg = str(e)
        if "403" in error_msg or "row-level security" in error_msg or "Unauthorized" in error_msg:
            print("   ❌ Error de permisos RLS")
            print("\n   💡 Solución:")
            print("      Ejecuta este SQL en Supabase Dashboard → SQL Editor:")
            print("""
      -- Eliminar políticas antiguas
      DROP POLICY IF EXISTS "Allow service role to upload encodings" ON storage.objects;
      DROP POLICY IF EXISTS "Allow service role to update encodings" ON storage.objects;
      DROP POLICY IF EXISTS "Allow service role to read encodings" ON storage.objects;
      DROP POLICY IF EXISTS "Allow service role to delete encodings" ON storage.objects;
      
      -- Crear política unificada
      CREATE POLICY "Service role all access to face-encodings"
      ON storage.objects
      FOR ALL
      TO service_role
      USING (bucket_id = 'face-encodings')
      WITH CHECK (bucket_id = 'face-encodings');
            """)
        elif "404" in error_msg or "Bucket not found" in error_msg:
            print("   ❌ Bucket no encontrado")
            print("   💡 Crea el bucket 'face-encodings' primero")
        else:
            print(f"   ⚠️ Error: {error_msg}")
    
    # 5. Verificar archivo local
    print("\n5️⃣ Archivo local:")
    local_file = "encodings.pickle"
    if os.path.exists(local_file):
        size = os.path.getsize(local_file)
        size_kb = size / 1024
        print(f"   ✅ Existe ({size_kb:.2f} KB)")
        print(f"      Ruta: {os.path.abspath(local_file)}")
        
        # Leer contenido
        try:
            import pickle
            with open(local_file, 'rb') as f:
                data = pickle.load(f)
            encodings_count = len(data.get('encodings', []))
            names_count = len(set(data.get('names', [])))
            print(f"      Encodings: {encodings_count}")
            print(f"      Personas únicas: {names_count}")
        except Exception as e:
            print(f"      ⚠️ Error leyendo archivo: {e}")
    else:
        print(f"   ❌ No existe")
        print(f"      Ruta esperada: {os.path.abspath(local_file)}")
    
    # 6. Resumen
    print("\n" + "=" * 60)
    print("📋 RESUMEN:")
    
    issues = []
    if not supabase_url:
        issues.append("- SUPABASE_URL no configurada")
    if not supabase_key:
        issues.append("- SUPABASE_KEY no configurada")
    elif len(supabase_key) < 200:
        issues.append("- Usar SERVICE_ROLE_KEY en lugar de ANON_KEY")
    
    if not bucket_exists:
        issues.append("- Crear bucket 'face-encodings'")
    
    if issues:
        print("\n⚠️ Problemas encontrados:")
        for issue in issues:
            print(f"   {issue}")
    else:
        print("\n✅ Todo parece estar configurado correctamente")
    
    print("\n" + "=" * 60)
    print("✅ Diagnóstico completado\n")

if __name__ == "__main__":
    diagnose()
