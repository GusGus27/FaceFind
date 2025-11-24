"""
Script de prueba para el servicio de emails
Prueba el envío de notificaciones sin necesidad de marcar alertas
"""
import sys
import os

# Agregar el directorio padre al path para que Python encuentre los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.email_service import EmailService
from services.supabase_client import supabase

def test_email_service():
    """Prueba el servicio de emails"""
    
    print("\n" + "="*80)
    print("🧪 PRUEBA DEL SERVICIO DE EMAILS")
    print("="*80 + "\n")
    
    # 1. Obtener una alerta de prueba
    print("1️⃣ Buscando alerta de prueba...")
    alertas_response = supabase.table("Alerta").select("id, caso_id").limit(1).execute()
    
    if not alertas_response.data:
        print("❌ No hay alertas en la base de datos para probar")
        print("💡 Crea una alerta primero desde el sistema de detección")
        return
    
    alerta = alertas_response.data[0]
    alerta_id = alerta["id"]
    caso_id = alerta["caso_id"]
    
    print(f"✅ Alerta encontrada: #{alerta_id} (Caso: #{caso_id})")
    
    # 2. Obtener el email del usuario
    print("\n2️⃣ Obteniendo email del usuario...")
    usuario_email = EmailService.obtener_email_usuario_caso(caso_id)
    
    if not usuario_email:
        print(f"❌ No se encontró email para el caso #{caso_id}")
        print("💡 Verifica que el caso tenga un usuario asociado")
        return
    
    print(f"✅ Email encontrado: {usuario_email}")
    
    # 3. Intentar enviar el email
    print("\n3️⃣ Enviando notificación...")
    resultado = EmailService.enviar_notificacion_deteccion_confirmada(
        alerta_id=alerta_id,
        caso_id=caso_id,
        usuario_email=usuario_email
    )
    
    # 4. Mostrar resultados
    print("\n" + "="*80)
    print("📊 RESULTADO:")
    print("="*80)
    
    if resultado["success"]:
        print("✅ ÉXITO")
        print(f"   Destinatario: {resultado.get('destinatario')}")
        print(f"   Nombre: {resultado.get('nombre_destinatario')}")
        print(f"   Email enviado (real): {resultado.get('email_enviado')}")
        print(f"   Notificación BD: ID #{resultado.get('notificacion_id')}")
        print("\n💡 Revisa la consola para ver el contenido del email")
    else:
        print("❌ ERROR")
        print(f"   Motivo: {resultado.get('error')}")
    
    print("="*80 + "\n")


def test_email_no_existe():
    """Prueba con un email que no existe"""
    
    print("\n" + "="*80)
    print("🧪 PRUEBA: EMAIL NO EXISTE")
    print("="*80 + "\n")
    
    # Obtener una alerta
    alertas_response = supabase.table("Alerta").select("id, caso_id").limit(1).execute()
    
    if not alertas_response.data:
        print("❌ No hay alertas para probar")
        return
    
    alerta = alertas_response.data[0]
    
    # Intentar con un email que no existe
    email_falso = "usuario_no_existe@example.com"
    
    print(f"Intentando enviar a: {email_falso}")
    
    resultado = EmailService.enviar_notificacion_deteccion_confirmada(
        alerta_id=alerta["id"],
        caso_id=alerta["caso_id"],
        usuario_email=email_falso
    )
    
    print("\n📊 RESULTADO:")
    if not resultado["success"]:
        print(f"✅ Manejo correcto de error: {resultado.get('error')}")
    else:
        print("❌ Debería haber fallado con email inexistente")
    
    print("="*80 + "\n")


if __name__ == "__main__":
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║                   📧 TEST EMAIL SERVICE                            ║
║                   FaceFind - Sistema de Notificaciones            ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
    
    # Ejecutar pruebas
    test_email_service()
    
    print("\n" + "─"*80 + "\n")
    
    test_email_no_existe()
    
    print("""
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  ✅ PRUEBAS COMPLETADAS                                            ║
║                                                                    ║
║  📝 NOTAS:                                                         ║
║  • Los emails NO se envían realmente (solo simulación)            ║
║  • Se registran en la tabla Notificacion                          ║
║  • Para enviar emails reales, revisa docs/INTEGRACION_EMAIL.md   ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
    """)
