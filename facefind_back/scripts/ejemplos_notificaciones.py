"""
Ejemplos de uso del Sistema de Alertas y Notificaciones
Casos de uso comunes para desarrolladores
"""

# ============================================================================
# EJEMPLO 1: Crear una alerta y generar notificaciones automáticamente
# ============================================================================

def ejemplo_crear_alerta_con_notificaciones():
    """
    Cuando se detecta una coincidencia, crear alerta y notificaciones
    """
    from services.alerta_service import AlertaService
    from models.frame import Frame
    from datetime import datetime
    import cv2
    
    # Supongamos que detectamos un rostro
    imagen = cv2.imread("path/to/imagen.jpg")
    frame = Frame(imagen=imagen)
    
    # Crear alerta (automáticamente genera notificaciones)
    alerta = AlertaService.crearAlerta(
        timestamp=datetime.now(),
        confidence=0.87,  # 87% de similitud
        ubicacion="Cámara Centro Comercial - Entrada Principal",
        camara_id=1,
        caso_id=123,
        frame=frame
    )
    
    print(f"✅ Alerta creada: ID {alerta.id}")
    print(f"   • Prioridad: {alerta.prioridad.to_string()}")
    print(f"   • Estado: {alerta.estado.to_string()}")
    print(f"   • Notificaciones: Se generaron automáticamente")


# ============================================================================
# EJEMPLO 2: Crear notificación manualmente desde una alerta
# ============================================================================

def ejemplo_crear_notificacion_manual():
    """
    Crear notificaciones manualmente para casos especiales
    """
    from services.alerta_service import AlertaService
    from services.notification_service import notification_service
    
    # Obtener una alerta existente
    alerta = AlertaService.obtener_alerta_por_id(alerta_id=1)
    
    if alerta:
        # Crear notificación de dashboard
        notif_dashboard = alerta.crearNotificacion("dashboard")
        print(f"✅ Notificación dashboard creada")
        
        # Crear notificación de email
        notif_email = alerta.crearNotificacion("email")
        notif_email.destinatario = "admin@facefind.com"
        print(f"✅ Notificación email creada")
        
        # Encolar para procesamiento
        notification_service._cola.encolar(notif_dashboard)
        notification_service._cola.encolar(notif_email)
        print(f"✅ Notificaciones encoladas")


# ============================================================================
# EJEMPLO 3: Consultar historial de alertas con filtros
# ============================================================================

def ejemplo_consultar_historial():
    """
    Consultar y filtrar alertas del historial
    """
    from services.alerta_service import AlertaService
    from models.enums import PrioridadAlerta, EstadoAlerta
    
    # Obtener historial
    historial = AlertaService.obtener_historial()
    
    # Filtrar por prioridad alta
    alertas_altas = historial.obtener_por_prioridad(PrioridadAlerta.ALTA)
    print(f"📊 Alertas de alta prioridad: {len(alertas_altas)}")
    
    # Filtrar pendientes
    alertas_pendientes = historial.obtener_pendientes()
    print(f"📊 Alertas pendientes: {len(alertas_pendientes)}")
    
    # Filtrar recientes (últimas 24 horas)
    alertas_recientes = historial.obtener_recientes(horas=24)
    print(f"📊 Alertas últimas 24h: {len(alertas_recientes)}")
    
    # Obtener por caso
    alertas_caso = historial.obtener_por_caso(caso_id=123)
    print(f"📊 Alertas del caso 123: {len(alertas_caso)}")
    
    # Obtener estadísticas
    stats = historial.obtener_estadisticas()
    print(f"📊 Estadísticas completas:")
    print(f"   • Total: {stats['total']}")
    print(f"   • Por prioridad: {stats['por_prioridad']}")
    print(f"   • Por estado: {stats['por_estado']}")


# ============================================================================
# EJEMPLO 4: Trabajar con la cola de notificaciones
# ============================================================================

def ejemplo_gestionar_cola():
    """
    Gestionar la cola de notificaciones manualmente
    """
    from services.notification_service import notification_service
    
    # Obtener estadísticas de la cola
    stats = notification_service.obtener_estadisticas_cola()
    print(f"📊 Estado de la cola:")
    print(f"   • En cola: {stats['en_cola']}")
    print(f"   • Procesadas: {stats['procesadas']}")
    print(f"   • Errores: {stats['errores']}")
    print(f"   • Capacidad máxima: {stats['capacidad_maxima']}")
    print(f"   • Llena: {stats['llena']}")
    
    # Ver errores recientes
    errores = notification_service._cola.obtener_errores_recientes()
    if errores:
        print(f"\n⚠️  Errores recientes:")
        for error in errores:
            print(f"   • Notificación {error['notificacion_id']}: {error['error']}")


# ============================================================================
# EJEMPLO 5: Enviar notificaciones por email
# ============================================================================

def ejemplo_enviar_email():
    """
    Enviar notificación por email manualmente
    """
    from services.alerta_service import AlertaService
    from services.notification_service import notification_service
    
    # Obtener alerta
    alerta = AlertaService.obtener_alerta_por_id(1)
    
    if alerta:
        # Crear notificación
        notificacion = alerta.crearNotificacion("email")
        notificacion.destinatario = "admin@example.com"
        
        # Enviar email
        exito = notification_service.enviar_notificacion_email(notificacion)
        
        if exito:
            print("✅ Email enviado correctamente")
        else:
            print("❌ Error al enviar email")


# ============================================================================
# EJEMPLO 6: Publicar notificación en dashboard (real-time)
# ============================================================================

def ejemplo_publicar_dashboard():
    """
    Publicar notificación en dashboard con Supabase Realtime
    """
    from services.alerta_service import AlertaService
    from services.notification_service import notification_service
    
    # Obtener alerta
    alerta = AlertaService.obtener_alerta_por_id(1)
    
    if alerta:
        # Crear notificación
        notificacion = alerta.crearNotificacion("dashboard")
        
        # Publicar en dashboard
        exito = notification_service.publicar_notificacion_dashboard(notificacion)
        
        if exito:
            print("✅ Notificación publicada en dashboard")
            print("   Los clientes suscritos la recibirán en tiempo real")
        else:
            print("❌ Error al publicar en dashboard")


# ============================================================================
# EJEMPLO 7: Obtener historial de notificaciones
# ============================================================================

def ejemplo_historial_notificaciones():
    """
    Consultar historial de notificaciones desde BD
    """
    from services.notification_service import notification_service
    
    # Obtener todas las notificaciones
    notificaciones = notification_service.obtener_historial_notificaciones(
        limite=50,
        solo_no_leidas=False
    )
    
    print(f"📋 Historial de notificaciones: {len(notificaciones)}")
    
    for notif in notificaciones[:5]:  # Mostrar primeras 5
        print(f"\n📧 Notificación {notif['id']}:")
        print(f"   • Tipo: {notif['tipo']}")
        print(f"   • Prioridad: {notif['prioridad']}")
        print(f"   • Estado: {notif['estado']}")
        print(f"   • Asunto: {notif['asunto']}")
    
    # Obtener solo no leídas
    no_leidas = notification_service.obtener_historial_notificaciones(
        limite=100,
        solo_no_leidas=True
    )
    
    print(f"\n📬 Notificaciones no leídas: {len(no_leidas)}")


# ============================================================================
# EJEMPLO 8: Marcar notificaciones como leídas
# ============================================================================

def ejemplo_marcar_leida():
    """
    Marcar notificaciones como leídas
    """
    from services.notification_service import notification_service
    
    # Obtener notificaciones no leídas
    notificaciones = notification_service.obtener_historial_notificaciones(
        limite=10,
        solo_no_leidas=True
    )
    
    # Marcar la primera como leída
    if notificaciones:
        notif_id = notificaciones[0]['id']
        exito = notification_service.marcar_notificacion_como_leida(notif_id)
        
        if exito:
            print(f"✅ Notificación {notif_id} marcada como leída")
        else:
            print(f"❌ Error al marcar notificación {notif_id}")


# ============================================================================
# EJEMPLO 9: Generar templates para visualización
# ============================================================================

def ejemplo_generar_templates():
    """
    Generar templates HTML y JSON para notificaciones
    """
    from services.alerta_service import AlertaService
    
    # Obtener alerta
    alerta = AlertaService.obtener_alerta_por_id(1)
    
    if alerta:
        # Crear notificación
        notificacion = alerta.crearNotificacion("email")
        
        # Generar template de email
        template_email = notificacion.generar_template_email()
        print("📧 Template de Email generado:")
        print(f"   • Asunto: {template_email['asunto']}")
        print(f"   • HTML: {len(template_email['html_body'])} caracteres")
        print(f"   • Texto plano: {len(template_email['texto_plano'])} caracteres")
        
        # Generar template de dashboard
        template_dashboard = notificacion.generar_template_dashboard()
        print("\n📊 Template de Dashboard generado:")
        print(f"   • Título: {template_dashboard['titulo']}")
        print(f"   • Mensaje: {template_dashboard['mensaje'][:50]}...")
        print(f"   • Prioridad: {template_dashboard['prioridad']}")


# ============================================================================
# EJEMPLO 10: Procesar alertas y notificaciones completo
# ============================================================================

def ejemplo_flujo_completo():
    """
    Ejemplo de flujo completo desde detección hasta notificación
    """
    from services.alerta_service import AlertaService
    from services.notification_service import notification_service
    from models.frame import Frame
    from datetime import datetime
    import cv2
    
    print("=" * 60)
    print("🔄 FLUJO COMPLETO: Detección → Alerta → Notificación")
    print("=" * 60)
    
    # 1. Simulamos una detección
    print("\n1️⃣ Detección facial...")
    imagen = cv2.imread("path/to/detected_face.jpg")
    frame = Frame(imagen=imagen)
    similitud = 0.92  # 92% de coincidencia
    print(f"   ✅ Rostro detectado con {similitud*100}% de similitud")
    
    # 2. Crear alerta (automáticamente genera notificaciones)
    print("\n2️⃣ Creando alerta...")
    alerta = AlertaService.crearAlerta(
        timestamp=datetime.now(),
        confidence=similitud,
        ubicacion="Terminal de Buses Norte - Cámara 3",
        camara_id=3,
        caso_id=456,
        frame=frame
    )
    print(f"   ✅ Alerta {alerta.id} creada")
    print(f"   • Prioridad: {alerta.prioridad.to_string()}")
    
    # 3. Las notificaciones se generan automáticamente
    print("\n3️⃣ Notificaciones generadas automáticamente:")
    print("   ✅ Notificación dashboard encolada")
    if similitud >= 0.70:
        print("   ✅ Notificación email encolada (similitud ≥ 70%)")
    
    # 4. El procesamiento asíncrono las procesará
    print("\n4️⃣ Procesamiento asíncrono:")
    print("   🔄 Las notificaciones se procesarán en segundo plano")
    print("   📧 Email se enviará a todos los administradores")
    print("   📊 Dashboard recibirá notificación en tiempo real")
    
    # 5. Verificar estado
    print("\n5️⃣ Estado del sistema:")
    stats = notification_service.obtener_estadisticas_cola()
    print(f"   • Notificaciones en cola: {stats['en_cola']}")
    print(f"   • Notificaciones procesadas: {stats['procesadas']}")
    
    print("\n" + "=" * 60)
    print("✅ FLUJO COMPLETADO")
    print("=" * 60)


# ============================================================================
# EJECUCIÓN DE EJEMPLOS
# ============================================================================

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("📚 EJEMPLOS DE USO - Sistema de Alertas y Notificaciones")
    print("=" * 70 + "\n")
    
    print("Descomenta el ejemplo que quieras ejecutar:\n")
    
    # Descomenta el ejemplo que quieras probar:
    
    # ejemplo_crear_alerta_con_notificaciones()
    # ejemplo_crear_notificacion_manual()
    # ejemplo_consultar_historial()
    # ejemplo_gestionar_cola()
    # ejemplo_enviar_email()
    # ejemplo_publicar_dashboard()
    # ejemplo_historial_notificaciones()
    # ejemplo_marcar_leida()
    # ejemplo_generar_templates()
    # ejemplo_flujo_completo()
    
    print("\n💡 TIP: Revisa el código de cada función para entender cómo funciona")
    print("📖 Documentación completa en: docs/SISTEMA_ALERTAS_NOTIFICACIONES.md\n")
