"""
Script para sincronizar usuario de Auth a tabla Usuario
"""
from services.supabase_client import supabase

print("🔄 Sincronizando usuario de Auth a tabla Usuario\n")

# El usuario que queremos sincronizar
email_to_sync = "juan@gmail.com"

# 1. Verificar si ya existe en tabla Usuario
check_result = supabase.table("Usuario").select("*").eq("email", email_to_sync).execute()

if check_result.data:
    print(f"✅ El usuario {email_to_sync} YA existe en la tabla Usuario")
    print(f"   ID: {check_result.data[0]['id']}")
    print(f"   Nombre: {check_result.data[0]['nombre']}")
else:
    print(f"⚠️  El usuario {email_to_sync} NO existe en la tabla Usuario")
    print("   Insertando...")
    
    # 2. Insertar en tabla Usuario
    try:
        insert_result = supabase.table("Usuario").insert({
            "nombre": "Juan",  # Nombre del frontend
            "email": email_to_sync,
            "password": "NO_SE_USA",  # Dummy value porque la columna es NOT NULL
            "role": "user",
            "status": "active"
        }).execute()
        
        if insert_result.data:
            print(f"✅ Usuario insertado exitosamente!")
            print(f"   ID: {insert_result.data[0]['id']}")
            print(f"   Email: {insert_result.data[0]['email']}")
            print("\n🎉 Ahora puedes hacer login con juan@gmail.com")
        else:
            print(f"❌ Error al insertar usuario")
            
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "="*50)
print("✅ Sincronización completada")
