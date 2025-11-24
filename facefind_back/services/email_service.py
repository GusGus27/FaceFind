"""
Email Service - Servicio para envío de correos electrónicos
Utiliza SendGrid para envío de emails
"""
from typing import Optional, Dict
from services.supabase_client import supabase
from datetime import datetime
import traceback
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import Config


class EmailService:
    """
    Servicio para envío de correos electrónicos
    """

    @staticmethod
    def enviar_notificacion_deteccion_confirmada(
        alerta_id: int,
        caso_id: int,
        usuario_email: str
    ) -> Dict:
        """
        Envía un correo notificando que se confirmó una detección
        
        Args:
            alerta_id: ID de la alerta confirmada
            caso_id: ID del caso
            usuario_email: Email del usuario a notificar
            
        Returns:
            Dict con resultado del envío
        """
        try:
            # Obtener información del caso y alerta
            caso_response = supabase.table("Caso")\
                .select("*, PersonaDesaparecida(nombre_completo, age, gender)")\
                .eq("id", caso_id)\
                .single()\
                .execute()
            
            if not caso_response.data:
                return {
                    "success": False,
                    "error": "Caso no encontrado"
                }
            
            caso = caso_response.data
            persona_nombre = caso.get("PersonaDesaparecida", {}).get("nombre_completo", "la persona desaparecida")
            
            # Obtener información de la alerta
            alerta_response = supabase.table("Alerta")\
                .select("*, Camara(ubicacion, ip)")\
                .eq("id", alerta_id)\
                .single()\
                .execute()
            
            if not alerta_response.data:
                return {
                    "success": False,
                    "error": "Alerta no encontrada"
                }
            
            alerta = alerta_response.data
            ubicacion = alerta.get("ubicacion", "ubicación no especificada")
            similitud = alerta.get("similitud", 0) * 100
            timestamp = alerta.get("timestamp", datetime.now().isoformat())
            
            # Verificar que el usuario exista
            try:
                usuario_response = supabase.table("Usuario")\
                    .select("id, nombre, email")\
                    .eq("email", usuario_email)\
                    .single()\
                    .execute()
                
                if not usuario_response.data:
                    print(f"⚠️ Cuenta no encontrada: {usuario_email}")
                    return {
                        "success": False,
                        "error": f"Cuenta no encontrada: {usuario_email}"
                    }
            except Exception as e:
                print(f"⚠️ Cuenta no encontrada: {usuario_email}")
                return {
                    "success": False,
                    "error": f"Cuenta no encontrada: {usuario_email}"
                }
            
            usuario = usuario_response.data
            nombre_usuario = usuario.get("nombre", "Usuario")
            
            # Construir el mensaje del email
            asunto = f"🚨 FaceFind: Detección Confirmada de {persona_nombre}"
            
            mensaje = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .alert-box {{ background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745; border-radius: 5px; }}
                    .detail {{ margin: 10px 0; }}
                    .label {{ font-weight: bold; color: #667eea; }}
                    .value {{ color: #333; }}
                    .footer {{ text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em; }}
                    .btn {{ background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔍 FaceFind</h1>
                        <h2>Detección Confirmada</h2>
                    </div>
                    <div class="content">
                        <p>Hola <strong>{nombre_usuario}</strong>,</p>
                        
                        <p>Te informamos que se ha <strong>confirmado una detección</strong> relacionada con tu caso.</p>
                        
                        <div class="alert-box">
                            <h3 style="margin-top: 0; color: #28a745;">✅ Información de la Detección</h3>
                            
                            <div class="detail">
                                <span class="label">👤 Persona Buscada:</span>
                                <span class="value">{persona_nombre}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="label">📍 Ubicación:</span>
                                <span class="value">{ubicacion}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="label">📊 Nivel de Similitud:</span>
                                <span class="value">{similitud:.1f}%</span>
                            </div>
                            
                            <div class="detail">
                                <span class="label">📅 Fecha y Hora:</span>
                                <span class="value">{timestamp}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="label">🆔 Caso ID:</span>
                                <span class="value">#{caso_id}</span>
                            </div>
                            
                            <div class="detail">
                                <span class="label">🚨 Alerta ID:</span>
                                <span class="value">#{alerta_id}</span>
                            </div>
                        </div>
                        
                        <p><strong>¿Qué hacer ahora?</strong></p>
                        <ul>
                            <li>Revisa los detalles de la detección en tu panel de control</li>
                            <li>Contacta con las autoridades si es necesario</li>
                            <li>Mantente atento a nuevas notificaciones</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="http://localhost:5173" class="btn">Ver en FaceFind</a>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un mensaje automático de FaceFind.</p>
                            <p>Sistema de Reconocimiento Facial para Localización de Personas Desaparecidas</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Nota: Supabase Auth no tiene API directa para enviar emails personalizados
            # Usaremos la tabla de Notificaciones para registrar y luego podrías
            # configurar un trigger en Supabase o usar un servicio externo como SendGrid
            
            # Registrar en la tabla de Notificaciones
            notificacion_data = {
                "usuario_id": usuario.get("id"),
                "type": "DETECCION_CONFIRMADA",
                "title": asunto,
                "message": f"Se confirmó una detección de {persona_nombre} en {ubicacion} con {similitud:.1f}% de similitud.",
                "severity": "success",
                "isRead": False,
                "timestamp": datetime.now().isoformat()
            }
            
            notif_response = supabase.table("Notificacion").insert(notificacion_data).execute()
            
            # Enviar email con SendGrid
            email_enviado = False
            email_error = None
            
            if Config.SENDGRID_API_KEY:
                try:
                    message = Mail(
                        from_email=Config.SENDGRID_FROM_EMAIL,
                        to_emails=usuario_email,
                        subject=asunto,
                        html_content=mensaje
                    )
                    
                    sg = SendGridAPIClient(Config.SENDGRID_API_KEY)
                    response = sg.send(message)
                    
                    print("\n" + "="*80)
                    print("✅ EMAIL ENVIADO EXITOSAMENTE")
                    print("="*80)
                    print(f"Para: {usuario_email}")
                    print(f"Nombre: {nombre_usuario}")
                    print(f"Asunto: {asunto}")
                    print(f"Status Code: {response.status_code}")
                    print(f"Caso: {persona_nombre} (ID: {caso_id})")
                    print(f"Ubicación: {ubicacion}")
                    print(f"Similitud: {similitud:.1f}%")
                    print("="*80 + "\n")
                    
                    email_enviado = True
                    
                except Exception as e:
                    email_error = str(e)
                    print(f"❌ Error enviando email con SendGrid: {email_error}")
                    traceback.print_exc()
            else:
                print("⚠️ SENDGRID_API_KEY no configurada. Email no enviado.")
                print("\n" + "="*80)
                print("📧 EMAIL (MODO SIMULACIÓN):")
                print("="*80)
                print(f"Para: {usuario_email}")
                print(f"Nombre: {nombre_usuario}")
                print(f"Asunto: {asunto}")
                print(f"Caso: {persona_nombre} (ID: {caso_id})")
                print(f"Ubicación: {ubicacion}")
                print(f"Similitud: {similitud:.1f}%")
                print("="*80 + "\n")
            
            return {
                "success": True,
                "message": f"Email {'enviado' if email_enviado else 'registrado'} para {usuario_email}",
                "email_enviado": email_enviado,
                "notificacion_id": notif_response.data[0].get("id") if notif_response.data else None,
                "destinatario": usuario_email,
                "nombre_destinatario": nombre_usuario,
                "email_error": email_error
            }
            
        except Exception as e:
            print(f"❌ Error enviando email: {str(e)}")
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def obtener_email_usuario_caso(caso_id: int) -> Optional[str]:
        """
        Obtiene el email del usuario que creó el caso
        
        Args:
            caso_id: ID del caso
            
        Returns:
            Email del usuario o None
        """
        try:
            caso_response = supabase.table("Caso")\
                .select("Usuario(email)")\
                .eq("id", caso_id)\
                .single()\
                .execute()
            
            if caso_response.data and "Usuario" in caso_response.data:
                return caso_response.data["Usuario"].get("email")
            
            return None
            
        except Exception as e:
            print(f"Error obteniendo email del usuario: {e}")
            return None
