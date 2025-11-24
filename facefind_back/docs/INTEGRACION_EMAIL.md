# 📧 Integración de Envío de Emails

## Estado Actual

Actualmente, el sistema registra notificaciones en la base de datos y muestra el contenido del email en la consola del servidor, pero **NO envía emails reales**.

## ¿Cómo funciona ahora?

1. Cuando se marca una alerta como "Revisada", el sistema:
   - ✅ Obtiene el email del usuario que creó el caso
   - ✅ Verifica que el usuario exista
   - ✅ Registra una notificación en la tabla `Notificacion`
   - ✅ Imprime en consola el contenido del email
   - ⚠️ **NO envía email real** (solo simulación)

## Integración con Servicios de Email Reales

Para enviar emails reales, necesitas integrar uno de estos servicios:

### Opción 1: SendGrid (Recomendado)

**Ventajas:**
- 100 emails gratis por día
- Fácil de integrar
- Excelente deliverability

**Pasos:**

1. **Instalar dependencia:**
   ```bash
   pip install sendgrid
   ```

2. **Obtener API Key:**
   - Regístrate en [SendGrid](https://sendgrid.com/)
   - Crea un API Key en Settings > API Keys
   - Guarda el API Key

3. **Agregar a `.env`:**
   ```env
   SENDGRID_API_KEY=tu_api_key_aqui
   SENDGRID_FROM_EMAIL=noreply@tudominio.com
   ```

4. **Actualizar `config.py`:**
   ```python
   class Config:
       # ... otras configuraciones
       SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
       SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@facefind.com')
   ```

5. **Modificar `email_service.py`:**
   
   Descomenta y adapta el código en la función `enviar_notificacion_deteccion_confirmada`:

   ```python
   from sendgrid import SendGridAPIClient
   from sendgrid.helpers.mail import Mail
   from config import Config
   
   # Dentro de enviar_notificacion_deteccion_confirmada():
   
   # Crear mensaje
   message = Mail(
       from_email=Config.SENDGRID_FROM_EMAIL,
       to_emails=usuario_email,
       subject=asunto,
       html_content=mensaje
   )
   
   # Enviar
   try:
       sg = SendGridAPIClient(Config.SENDGRID_API_KEY)
       response = sg.send(message)
       print(f"✅ Email enviado exitosamente a {usuario_email}")
       print(f"Status Code: {response.status_code}")
       
       return {
           "success": True,
           "message": f"Email enviado a {usuario_email}",
           "email_enviado": True,
           "status_code": response.status_code
       }
   except Exception as e:
       print(f"❌ Error enviando email con SendGrid: {str(e)}")
       return {
           "success": False,
           "error": str(e),
           "email_enviado": False
       }
   ```

### Opción 2: Mailgun

**Ventajas:**
- 5,000 emails gratis por mes (primeros 3 meses)
- API simple

**Pasos:**

1. **Instalar:**
   ```bash
   pip install requests
   ```

2. **Configurar `.env`:**
   ```env
   MAILGUN_API_KEY=tu_api_key
   MAILGUN_DOMAIN=tu_dominio.mailgun.org
   ```

3. **Código de integración:**
   ```python
   import requests
   
   def enviar_con_mailgun(destinatario, asunto, html):
       return requests.post(
           f"https://api.mailgun.net/v3/{Config.MAILGUN_DOMAIN}/messages",
           auth=("api", Config.MAILGUN_API_KEY),
           data={
               "from": f"FaceFind <noreply@{Config.MAILGUN_DOMAIN}>",
               "to": destinatario,
               "subject": asunto,
               "html": html
           }
       )
   ```

### Opción 3: SMTP (Gmail, Outlook, etc.)

**Ventajas:**
- Gratis
- No requiere servicios externos

**Desventajas:**
- Menos confiable
- Puede ser bloqueado como spam
- Límites estrictos

**Código:**
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def enviar_con_smtp(destinatario, asunto, html):
    msg = MIMEMultipart('alternative')
    msg['Subject'] = asunto
    msg['From'] = Config.SMTP_FROM_EMAIL
    msg['To'] = destinatario
    
    html_part = MIMEText(html, 'html')
    msg.attach(html_part)
    
    with smtplib.SMTP_SSL(Config.SMTP_HOST, Config.SMTP_PORT) as server:
        server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
        server.sendmail(Config.SMTP_FROM_EMAIL, destinatario, msg.as_string())
```

## Testing

Para probar el envío de emails:

1. **Inicia el servidor backend:**
   ```bash
   python app.py
   ```

2. **Marca una alerta como revisada** desde el frontend

3. **Verifica:**
   - ✅ Consola del servidor muestra el email
   - ✅ Se registra en tabla `Notificacion`
   - ✅ (Si integraste servicio) Email llega al destinatario

## Verificación de Usuario

El sistema ya incluye verificación de usuario:

```python
# Si el usuario no existe:
print(f"⚠️ Cuenta no encontrada: {usuario_email}")
return {
    "success": False,
    "error": f"Cuenta no encontrada: {usuario_email}"
}
```

Esto se muestra en:
- Consola del servidor
- Respuesta del API
- Alert del frontend

## Plantilla HTML del Email

El email incluye:
- 🎨 Diseño responsive y profesional
- 👤 Nombre de la persona desaparecida
- 📍 Ubicación de la detección
- 📊 Porcentaje de similitud
- 📅 Fecha y hora
- 🆔 IDs del caso y alerta
- 🔗 Link para ver en la aplicación

## Próximos Pasos

1. Elige un servicio de email (recomendamos SendGrid)
2. Obtén las credenciales
3. Actualiza las variables de entorno
4. Implementa el código de integración
5. Prueba con emails reales
6. Monitorea el deliverability

## Notas Importantes

- ⚠️ Nunca subas tu API Key al repositorio
- ✅ Usa variables de entorno para credenciales
- 📧 Verifica el dominio en el servicio de email
- 🔒 Configura SPF/DKIM para mejor deliverability
