"""
Script de inicialización del Sistema de Notificaciones
Ejecutar al inicio del servidor para activar el procesamiento asíncrono
"""
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.notification_service import notification_service
from services.alerta_service import AlertaService


def inicializar_sistema_notificaciones():
    """
    Inicializa el sistema completo de notificaciones
    """
    print("=" * 60)
    print("🔔 INICIALIZANDO SISTEMA DE NOTIFICACIONES")
    print("=" * 60)
    
    # 1. Cargar historial de alertas desde BD
    print("\n📊 Cargando historial de alertas...")
    try:
        alertas_cargadas = AlertaService.cargar_historial_desde_bd(limite=100)
        print(f"✅ {alertas_cargadas} alertas cargadas en memoria")
        
        # Mostrar estadísticas
        historial = AlertaService.obtener_historial()
        stats = historial.obtener_estadisticas()
        print(f"   • Total: {stats['total']}")
        print(f"   • Pendientes: {stats['pendientes']}")
        print(f"   • Recientes (24h): {stats['recientes_24h']}")
        print(f"   • Alta prioridad: {stats['por_prioridad'].get('ALTA', 0)}")
        
    except Exception as e:
        print(f"⚠️  Error al cargar historial: {str(e)}")
    
    # 2. Iniciar procesamiento asíncrono de notificaciones
    print("\n🚀 Iniciando procesamiento asíncrono de notificaciones...")
    try:
        notification_service.iniciar_procesamiento_asincrono()
        print("✅ Procesamiento asíncrono iniciado correctamente")
        
        # Mostrar estadísticas de cola
        stats_cola = notification_service.obtener_estadisticas_cola()
        print(f"   • Cola: {stats_cola['en_cola']} notificaciones pendientes")
        print(f"   • Procesadas: {stats_cola['procesadas']}")
        print(f"   • Errores: {stats_cola['errores']}")
        print(f"   • Capacidad: {stats_cola['capacidad_maxima']}")
        
    except Exception as e:
        print(f"❌ Error al iniciar procesamiento: {str(e)}")
        return False
    
    # 3. Verificar configuración
    print("\n🔧 Verificando configuración...")
    
    smtp_user = os.getenv('SMTP_USER')
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    
    if smtp_user:
        print(f"✅ SMTP configurado: {smtp_user} ({smtp_host})")
    else:
        print("⚠️  SMTP no configurado - Los emails no se enviarán")
        print("   Configura SMTP_USER y SMTP_PASSWORD en .env")
    
    # 4. Mostrar información de endpoints
    print("\n📡 Endpoints disponibles:")
    print("   • GET  /api/notifications/historial")
    print("   • GET  /api/notifications/estadisticas")
    print("   • GET  /api/notifications/no-leidas/count")
    print("   • PUT  /api/notifications/<id>/marcar-leida")
    print("   • POST /api/notifications/test-email")
    print("   • POST /api/notifications/iniciar-procesamiento")
    print("   • POST /api/notifications/detener-procesamiento")
    
    print("\n" + "=" * 60)
    print("✨ SISTEMA DE NOTIFICACIONES LISTO")
    print("=" * 60)
    print()
    
    return True


def verificar_dependencias():
    """
    Verifica que todas las dependencias estén instaladas
    """
    dependencias = [
        ('flask', 'Flask'),
        ('supabase', 'Supabase'),
        ('smtplib', 'SMTP (built-in)'),
    ]
    
    print("🔍 Verificando dependencias...")
    todas_ok = True
    
    for modulo, nombre in dependencias:
        try:
            __import__(modulo)
            print(f"✅ {nombre}")
        except ImportError:
            print(f"❌ {nombre} - NO INSTALADO")
            todas_ok = False
    
    return todas_ok


if __name__ == "__main__":
    print()
    
    # Verificar dependencias
    if not verificar_dependencias():
        print("\n❌ Faltan dependencias. Ejecuta: pip install -r requirements.txt")
        sys.exit(1)
    
    print()
    
    # Inicializar sistema
    exito = inicializar_sistema_notificaciones()
    
    if exito:
        print("💡 TIP: El procesamiento asíncrono continuará en segundo plano")
        print("         mientras el servidor esté en ejecución.\n")
        sys.exit(0)
    else:
        sys.exit(1)
