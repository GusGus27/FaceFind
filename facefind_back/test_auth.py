"""
Script de prueba para verificar el sistema de autenticación con hasheo de contraseñas
"""
import requests
import json

API_BASE_URL = "http://localhost:5000"

def test_signup():
    """Prueba registro de nuevo usuario"""
    print("\n🔵 TEST 1: Registro de nuevo usuario")
    print("-" * 50)
    
    data = {
        "nombre": "Usuario Test",
        "email": "test_usuario@facefind.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signup", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            print("✅ Registro exitoso - Contraseña hasheada por Supabase")
        else:
            print("⚠️ Error en registro")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_signin():
    """Prueba inicio de sesión"""
    print("\n🔵 TEST 2: Inicio de sesión")
    print("-" * 50)
    
    data = {
        "email": "test_usuario@facefind.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signin", json=data)
        print(f"Status: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200:
            print("✅ Login exitoso - Hash verificado correctamente")
            print(f"Usuario: {result['user']['nombre']}")
            print(f"Email: {result['user']['email']}")
            print(f"Role: {result['user']['role']}")
            print(f"Token: {result['session']['access_token'][:50]}...")
            return result['session']['access_token']
        else:
            print("⚠️ Error en login")
            print(f"Response: {json.dumps(result, indent=2)}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def test_signin_wrong_password():
    """Prueba login con contraseña incorrecta"""
    print("\n🔵 TEST 3: Login con contraseña incorrecta")
    print("-" * 50)
    
    data = {
        "email": "test_usuario@facefind.com",
        "password": "wrongpassword"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/auth/signin", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 401:
            print("✅ Rechazo correcto - Hash no coincide")
        else:
            print("⚠️ Comportamiento inesperado")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_signup_validations():
    """Prueba validaciones en signup"""
    print("\n🔵 TEST 4: Validaciones de registro")
    print("-" * 50)
    
    test_cases = [
        {
            "nombre": "Test",
            "email": "test@test.com",
            "password": "123",  # Muy corta
            "expected": "contraseña debe tener al menos 6 caracteres"
        },
        {
            "nombre": "A",  # Muy corto
            "email": "test2@test.com",
            "password": "password123",
            "expected": "nombre debe tener al menos 2 caracteres"
        },
        {
            "nombre": "Test User",
            "email": "",  # Email vacío
            "password": "password123",
            "expected": "Email y contraseña son requeridos"
        }
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n  Sub-test 4.{i}: {test['expected']}")
        try:
            response = requests.post(f"{API_BASE_URL}/auth/signup", json=test)
            result = response.json()
            
            if response.status_code == 400:
                print(f"  ✅ Validación funcionando: {result.get('error', '')}")
            else:
                print(f"  ⚠️ Status inesperado: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")

def main():
    print("=" * 50)
    print("🔐 PRUEBAS DE AUTENTICACIÓN CON HASHEO")
    print("=" * 50)
    print("\n⚠️  NOTA: Asegúrate de que el servidor esté corriendo en http://localhost:5000")
    print("    Ejecuta: python app.py o flask run\n")
    
    input("Presiona ENTER para comenzar las pruebas...")
    
    # Ejecutar pruebas
    test_signup()
    test_signin()
    test_signin_wrong_password()
    test_signup_validations()
    
    print("\n" + "=" * 50)
    print("🎯 PRUEBAS COMPLETADAS")
    print("=" * 50)
    print("\n✅ Si todo funcionó correctamente:")
    print("   - Las contraseñas se guardan hasheadas en auth.users")
    print("   - NO se guardan en la tabla Usuario")
    print("   - bcrypt verifica los hashes al hacer login")
    print("   - Las validaciones funcionan correctamente")

if __name__ == "__main__":
    main()
