"""
Script de Prueba - Recarga Dinámica de Encodings
Demuestra cómo usar el nuevo endpoint /detection/reload-encodings
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def check_detection_status():
    """Verificar estado del servicio de detección"""
    print("\n" + "="*60)
    print("1️⃣  VERIFICANDO ESTADO DEL SERVICIO DE DETECCIÓN")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/detection/status")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Estado: {data.get('status')}")
            print(f"📊 Caras conocidas: {data.get('known_faces', 0)}")
            print(f"📊 Total encodings: {data.get('total_encodings', 0)}")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def get_known_faces():
    """Obtener lista de caras conocidas"""
    print("\n" + "="*60)
    print("2️⃣  OBTENIENDO LISTA DE CARAS CONOCIDAS")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/detection/get-known-faces")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                known_faces = data.get('data', {}).get('known_faces', [])
                total = data.get('data', {}).get('total_encodings', 0)
                
                print(f"✅ Total encodings: {total}")
                print(f"📋 Caras conocidas ({len(known_faces)}):")
                for i, name in enumerate(known_faces, 1):
                    print(f"   {i}. {name}")
                return known_faces
            else:
                print(f"❌ Error: {data.get('error')}")
                return []
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def reload_encodings():
    """Recargar encodings sin reiniciar el servidor"""
    print("\n" + "="*60)
    print("3️⃣  RECARGANDO ENCODINGS (Sin reiniciar servidor)")
    print("="*60)
    
    try:
        response = requests.post(f"{BASE_URL}/detection/reload-encodings")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ {data.get('message')}")
                print(f"📊 Total encodings recargados: {data.get('total_encodings', 0)}")
                print(f"📋 Caras detectadas:")
                
                known_faces = data.get('known_faces', [])
                for i, name in enumerate(known_faces, 1):
                    print(f"   {i}. {name}")
                    
                return True
            else:
                print(f"❌ Error: {data.get('error')}")
                return False
        else:
            print(f"❌ Error HTTP: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_workflow():
    """Simula el flujo de trabajo completo"""
    print("\n" + "🧪 "*20)
    print("🧪 TEST: FLUJO DE TRABAJO DE RECARGA DINÁMICA")
    print("🧪 "*20)
    
    print("\n📝 ESCENARIO:")
    print("   1. Verificar estado inicial del servicio")
    print("   2. Ver caras conocidas actuales")
    print("   3. [MANUAL] Usuario agrega nueva persona al sistema")
    print("   4. Recargar encodings sin reiniciar")
    print("   5. Verificar que nueva persona esté disponible")
    
    # Paso 1: Verificar estado
    if not check_detection_status():
        print("\n❌ No se puede continuar. Servicio no disponible.")
        return False
    
    # Paso 2: Ver caras antes de recargar
    print("\n📸 CARAS CONOCIDAS (ANTES DE RECARGAR):")
    before_faces = get_known_faces()
    
    # Paso 3: Instrucciones para el usuario
    print("\n" + "⏸️ "*20)
    print("⏸️  PAUSA PARA ACCIÓN MANUAL")
    print("⏸️ "*20)
    print("\n📌 INSTRUCCIONES:")
    print("   1. Ve a tu aplicación FaceFind")
    print("   2. Agrega una nueva persona desaparecida")
    print("   3. Genera los encodings de las fotos")
    print("   4. Presiona ENTER aquí para continuar...")
    
    input()
    
    # Paso 4: Recargar encodings
    print("\n🔄 Recargando encodings...")
    if not reload_encodings():
        print("\n❌ Falló la recarga de encodings")
        return False
    
    # Paso 5: Verificar después de recargar
    print("\n📸 CARAS CONOCIDAS (DESPUÉS DE RECARGAR):")
    after_faces = get_known_faces()
    
    # Comparar
    print("\n" + "="*60)
    print("📊 RESULTADOS DE LA COMPARACIÓN")
    print("="*60)
    print(f"Caras antes:  {len(before_faces)}")
    print(f"Caras después: {len(after_faces)}")
    
    new_faces = set(after_faces) - set(before_faces)
    if new_faces:
        print(f"\n✅ ¡Nuevas caras detectadas! ({len(new_faces)})")
        for name in new_faces:
            print(f"   🆕 {name}")
    else:
        print("\n⚠️  No se detectaron nuevas caras")
        print("   Esto es normal si no agregaste ninguna persona nueva")
    
    print("\n✅ TEST COMPLETADO")
    return True

def main():
    """Función principal"""
    print("\n" + "🔍"*30)
    print("🔍 SCRIPT DE PRUEBA - RECARGA DINÁMICA DE ENCODINGS")
    print("🔍"*30)
    print("\nEste script demuestra cómo el nuevo endpoint /detection/reload-encodings")
    print("permite actualizar las caras conocidas SIN REINICIAR el servidor.")
    
    while True:
        print("\n" + "="*60)
        print("MENÚ DE PRUEBAS")
        print("="*60)
        print("1. Verificar estado del servicio")
        print("2. Ver caras conocidas")
        print("3. Recargar encodings")
        print("4. Test completo (flujo de trabajo)")
        print("5. Salir")
        print("="*60)
        
        choice = input("\nSelecciona una opción (1-5): ").strip()
        
        if choice == "1":
            check_detection_status()
        elif choice == "2":
            get_known_faces()
        elif choice == "3":
            reload_encodings()
        elif choice == "4":
            test_workflow()
        elif choice == "5":
            print("\n👋 ¡Hasta luego!")
            break
        else:
            print("\n❌ Opción inválida. Intenta de nuevo.")
    
if __name__ == "__main__":
    main()
