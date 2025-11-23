"""
Servicio de Notificaciones
Gestiona el envío de notificaciones por email y dashboard (real-time)
"""
from typing import List, Optional, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from threading import Thread
from models.notificacion import Notificacion, TipoNotificacion, EstadoNotificacion
from models.alerta import Alerta
from models.enums import PrioridadAlerta
from services.cola_notificaciones import ColaNotificaciones
from services.supabase_client import supabase


class NotificationService:
    """
    Servicio para gestionar notificaciones del sistema
    Implementa envío por email y notificaciones real-time para dashboard
    """

    def __init__(self):
        """Constructor del servicio"""
        self._cola = ColaNotificaciones(max_size=500)
        self._procesando = False
        self._umbral_email = 0.70  # Solo enviar email si similitud >= 70%
        
        # Configuración SMTP desde variables de entorno
        self._smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self._smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self._smtp_user = os.getenv('SMTP_USER', '')
        self._smtp_password = os.getenv('SMTP_PASSWORD', '')
        self._email_from = os.getenv('EMAIL_FROM', self._smtp_user)

    def crear_notificacion_desde_alerta(self, 
                                        alerta: Alerta, 
                                        tipo: str = "dashboard") -> Notificacion:
        """
        Crea una notificación a partir de una alerta
        Utiliza el método crearNotificacion del diagrama UML

        Args:
            alerta: Alerta que genera la notificación
            tipo: Tipo de notificación ('email' o 'dashboard')

        Returns:
            Instancia de Notificacion
        """
        return alerta.crearNotificacion(tipo)

    def procesar_alerta(self, alerta: Alerta, admin_emails: Optional[List[str]] = None) -> Dict:
        """
        Procesa una alerta y crea las notificaciones necesarias
        
        Args:
            alerta: Alerta a procesar
            admin_emails: Lista de emails de administradores
            
        Returns:
            Diccionario con resultado del procesamiento
        """
        notificaciones_creadas = []
        
        # Siempre crear notificación para dashboard (real-time)
        notif_dashboard = self.crear_notificacion_desde_alerta(alerta, "dashboard")
        self._cola.encolar(notif_dashboard)
        notificaciones_creadas.append(notif_dashboard)
        
        # Crear notificación por email si supera umbral
        if alerta.similitud >= self._umbral_email:
            notif_email = self.crear_notificacion_desde_alerta(alerta, "email")
            
            # Asignar destinatarios
            if admin_emails:
                for email in admin_emails:
                    # Crear una notificación por cada admin
                    notif_copy = self.crear_notificacion_desde_alerta(alerta, "email")
                    notif_copy.destinatario = email
                    self._cola.encolar(notif_copy)
                    notificaciones_creadas.append(notif_copy)
            else:
                self._cola.encolar(notif_email)
                notificaciones_creadas.append(notif_email)
        
        # Guardar notificaciones en BD
        for notif in notificaciones_creadas:
            self._guardar_notificacion(notif)
        
        return {
            "success": True,
            "notificaciones_creadas": len(notificaciones_creadas),
            "notificaciones": [n.to_dict() for n in notificaciones_creadas]
        }

    def enviar_notificacion_email(self, notificacion: Notificacion) -> bool:
        """
        Envía una notificación por email

        Args:
            notificacion: Notificación a enviar

        Returns:
            True si se envió correctamente
        """
        if not notificacion.destinatario:
            print("Error: Notificación sin destinatario")
            return False

        try:
            # Generar template HTML
            template = notificacion.generar_template_email()
            
            # Crear mensaje
            mensaje = MIMEMultipart('alternative')
            mensaje['Subject'] = template['asunto']
            mensaje['From'] = self._email_from
            mensaje['To'] = notificacion.destinatario
            
            # Agregar versión texto plano y HTML
            parte_texto = MIMEText(template['texto_plano'], 'plain', 'utf-8')
            parte_html = MIMEText(template['html_body'], 'html', 'utf-8')
            
            mensaje.attach(parte_texto)
            mensaje.attach(parte_html)
            
            # Enviar email
            with smtplib.SMTP(self._smtp_host, self._smtp_port) as server:
                server.starttls()
                server.login(self._smtp_user, self._smtp_password)
                server.send_message(mensaje)
            
            # Marcar como enviada
            notificacion.marcar_como_enviada()
            self._actualizar_estado_notificacion(notificacion)
            
            print(f"Email enviado a {notificacion.destinatario}")
            return True
            
        except Exception as e:
            print(f"Error al enviar email: {str(e)}")
            notificacion.marcar_como_error()
            self._actualizar_estado_notificacion(notificacion)
            return False

    def publicar_notificacion_dashboard(self, notificacion: Notificacion) -> bool:
        """
        Publica una notificación en tiempo real para el dashboard
        Utiliza Supabase Realtime

        Args:
            notificacion: Notificación a publicar

        Returns:
            True si se publicó correctamente
        """
        try:
            # Generar template para dashboard
            data_dashboard = notificacion.generar_template_dashboard()
            
            # Guardar en tabla de notificaciones (se propaga por Realtime)
            response = supabase.table('notificaciones')\
                .insert(data_dashboard)\
                .execute()
            
            if response.data:
                notificacion.marcar_como_enviada()
                self._actualizar_estado_notificacion(notificacion)
                print(f"Notificación publicada en dashboard")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error al publicar en dashboard: {str(e)}")
            notificacion.marcar_como_error()
            self._actualizar_estado_notificacion(notificacion)
            return False

    def procesar_cola(self) -> None:
        """
        Procesa la cola de notificaciones de forma continua
        Se ejecuta en un hilo separado
        """
        self._procesando = True
        print("Iniciando procesamiento de cola de notificaciones...")
        
        while self._procesando:
            try:
                # Obtener siguiente notificación (espera hasta 1 segundo)
                notificacion = self._cola.desencolar(timeout=1.0)
                
                if notificacion is None:
                    continue
                
                # Procesar según tipo
                if notificacion.tipo == TipoNotificacion.EMAIL:
                    exito = self.enviar_notificacion_email(notificacion)
                elif notificacion.tipo == TipoNotificacion.DASHBOARD:
                    exito = self.publicar_notificacion_dashboard(notificacion)
                else:
                    exito = False
                
                # Registrar resultado
                if exito:
                    self._cola.marcar_como_procesada(notificacion)
                else:
                    self._cola.marcar_como_error(notificacion, "Error en procesamiento")
                    
            except Exception as e:
                print(f"Error en procesamiento de cola: {str(e)}")
        
        print("Procesamiento de cola detenido.")

    def iniciar_procesamiento_asincrono(self) -> None:
        """Inicia el procesamiento de la cola en un hilo separado"""
        if not self._procesando:
            hilo = Thread(target=self.procesar_cola, daemon=True)
            hilo.start()
            print("Procesamiento asíncrono iniciado")

    def detener_procesamiento(self) -> None:
        """Detiene el procesamiento de la cola"""
        self._procesando = False

    def obtener_historial_notificaciones(self, 
                                         limite: int = 50,
                                         solo_no_leidas: bool = False) -> List[Dict]:
        """
        Obtiene el historial de notificaciones desde BD

        Args:
            limite: Número máximo de notificaciones
            solo_no_leidas: Si True, solo retorna no leídas

        Returns:
            Lista de notificaciones
        """
        try:
            query = supabase.table('notificaciones')\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(limite)
            
            if solo_no_leidas:
                query = query.is_('leida_en', 'null')
            
            response = query.execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Error al obtener historial: {str(e)}")
            return []

    def marcar_notificacion_como_leida(self, notificacion_id: int) -> bool:
        """
        Marca una notificación como leída

        Args:
            notificacion_id: ID de la notificación

        Returns:
            True si se actualizó correctamente
        """
        try:
            response = supabase.table('notificaciones')\
                .update({
                    'leida_en': datetime.now().isoformat(),
                    'estado': EstadoNotificacion.LEIDA.to_string()
                })\
                .eq('id', notificacion_id)\
                .execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"Error al marcar como leída: {str(e)}")
            return False

    def obtener_estadisticas_cola(self) -> Dict:
        """
        Obtiene estadísticas de la cola de notificaciones

        Returns:
            Diccionario con estadísticas
        """
        return self._cola.obtener_estadisticas()

    def _guardar_notificacion(self, notificacion: Notificacion) -> Optional[int]:
        """
        Guarda una notificación en la base de datos

        Args:
            notificacion: Notificación a guardar

        Returns:
            ID de la notificación guardada o None
        """
        try:
            data = {
                'alerta_id': notificacion.alerta_id,
                'tipo': notificacion.tipo.to_string(),
                'prioridad': notificacion.prioridad.to_string(),
                'estado': notificacion.estado.to_string(),
                'destinatario': notificacion.destinatario,
                'asunto': notificacion.asunto,
                'contenido': notificacion.contenido,
                'created_at': notificacion.created_at.isoformat()
            }
            
            response = supabase.table('notificaciones')\
                .insert(data)\
                .execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0].get('id')
            
            return None
            
        except Exception as e:
            print(f"Error al guardar notificación: {str(e)}")
            return None

    def _actualizar_estado_notificacion(self, notificacion: Notificacion) -> bool:
        """
        Actualiza el estado de una notificación en BD

        Args:
            notificacion: Notificación con estado actualizado

        Returns:
            True si se actualizó correctamente
        """
        if not notificacion.id:
            return False

        try:
            data = {
                'estado': notificacion.estado.to_string(),
                'enviada_en': notificacion.enviada_en.isoformat() if notificacion.enviada_en else None
            }
            
            response = supabase.table('notificaciones')\
                .update(data)\
                .eq('id', notificacion.id)\
                .execute()
            
            return bool(response.data)
            
        except Exception as e:
            print(f"Error al actualizar estado: {str(e)}")
            return False

    def __repr__(self) -> str:
        return f"<NotificationService(cola={self._cola}, procesando={self._procesando})>"


# Instancia singleton del servicio
notification_service = NotificationService()
