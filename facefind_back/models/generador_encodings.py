import face_recognition
import numpy as np
import cv2
import requests
from datetime import datetime
from models.encoding import Encoding# 👈 importa tu clase Encoding

class GeneradorEncodings:
    """
    Clase responsable de generar encoding facial a partir de una foto.
    Retorna un objeto Encoding.
    """

    def __init__(self):
        pass

    def generar_encodings(self, url: str, foto_id: int) -> Encoding:
        """
        Genera un encoding para una sola foto (descargada desde URL).

        Args:
            url: URL pública de la imagen en Supabase Storage
            foto_id: ID en la tabla FotoReferencia

        Returns:
            Encoding o None si falla
        """
        try:
            # 1️⃣ Descargar imagen desde la URL
            response = requests.get(url, stream=True)
            if response.status_code != 200:
                print(f"⚠️ No se pudo descargar la imagen: {url}")
                return None

            print(f"✅ Imagen descargada, procesando...")
            
            img_array = np.asarray(bytearray(response.content), dtype=np.uint8)
            imagen = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
            
            if imagen is None:
                print(f"⚠️ No se pudo decodificar la imagen: {url}")
                return None
                
            rgb = cv2.cvtColor(imagen, cv2.COLOR_BGR2RGB)

            # 2️⃣ Detectar rostro
            ubicaciones = face_recognition.face_locations(rgb, model="cnn")
            if not ubicaciones:
                print(f"⚠️ No se detectó rostro en {url}")
                return None

            print(f"✅ Rostro detectado, generando encoding...")
            
            # 3️⃣ Generar encoding
            encoding_array = face_recognition.face_encodings(rgb, ubicaciones)[0]

            # 4️⃣ Retornar un objeto Encoding
            return Encoding(
                vector=np.array(encoding_array, dtype=np.float64),
                foto_referencia_id=foto_id,
                fecha_generacion=datetime.now()
            )

        except Exception as e:
            print(f"❌ Error generando encoding para {url}: {e}")
            return None
