import requests
import base64
import cv2
import time
import json
from datetime import datetime

class CameraAPITester:
    def __init__(self, api_url="http://localhost:5000", camera_index=0):
        """
        Inicializa el tester con cámara
        
        Args:
            api_url: URL de la API Flask
            camera_index: Índice de la cámara (0 para cámara principal de laptop)
        """
        self.api_url = api_url
        self.camera_index = camera_index
        self.camera = None
        
    def start_camera(self):
        """Inicializa la cámara"""
        print(f"🎥 Iniciando cámara {self.camera_index}...")
        
        self.camera = cv2.VideoCapture(self.camera_index)
        
        if not self.camera.isOpened():
            print(f"❌ Error: No se pudo abrir la cámara {self.camera_index}")
            return False
            
        # Configurar resolución (opcional)
        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        print("✓ Cámara iniciada correctamente")
        return True
    
    def stop_camera(self):
        """Detiene la cámara"""
        if self.camera:
            self.camera.release()
            cv2.destroyAllWindows()
            print("✓ Cámara detenida")
    
    def capture_frame_as_base64(self):
        """Captura un frame y lo convierte a base64"""
        if not self.camera:
            return None
            
        ret, frame = self.camera.read()
        if not ret:
            return None
        
        # Codificar frame a JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        
        # Convertir a base64
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return img_base64, frame
    
    def test_api_health(self):
        """Probar si la API está funcionando"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✓ API funcionando correctamente")
                print(f"  - Caras conocidas: {data.get('known_faces', 0)}")
                return True
            else:
                print(f"❌ API respondió con código: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Error conectando con la API: {e}")
            return False
    
    def send_frame_to_api(self, img_base64):
        """Envía un frame a la API y obtiene resultados"""
        try:
            response = requests.post(
                f"{self.api_url}/detect-faces",
                json={"image": img_base64},
                #timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Error en API: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error enviando frame: {e}")
            return None
    
    def draw_results_on_frame(self, frame, api_response):
        """Dibuja los resultados de la API en el frame"""
        if not api_response or not api_response.get("success"):
            return frame
        
        data = api_response.get("data", {})
        faces = data.get("faces", [])
        
        for face in faces:
            bbox = face.get("bbox", {})
            x = int(bbox.get("x", 0))
            y = int(bbox.get("y", 0))
            w = int(bbox.get("width", 0))
            h = int(bbox.get("height", 0))
            
            # Determinar si hay match y color
            match = bool(face.get("match_found"))
            color = (0, 255, 0) if match else (0, 0, 255)
            
            # Mostrar "Desconocido" cuando no hay match
            if match:
                name = face.get("best_match_name", "Desconocido")
                similarity = face.get("similarity_percentage", 0)
                text = f"{name} ({similarity:.1f}%)"
            else:
                name = "Desconocido"
                text = "Desconocido"
            
            # Dibujar rectángulo
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            
            # Fondo para el texto
            cv2.rectangle(frame, (x, y - 30), (x + w, y), color, -1)
            
            # Texto
            cv2.putText(frame, text, (x + 5, y - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Información general
        faces_count = data.get("faces_detected", 0)
        info_text = f"Rostros detectados: {faces_count}"
        cv2.putText(frame, info_text, (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return frame
    
    def run_realtime_test(self, send_every_frames=10):
        """
        Ejecuta test en tiempo real con la cámara
        
        Args:
            send_every_frames: Enviar frame a la API cada N frames (para no saturar)
        """
        if not self.start_camera():
            return
        
        if not self.test_api_health():
            self.stop_camera()
            return
        
        print("\n🎬 Iniciando test en tiempo real...")
        print("Controles:")
        print("  - 's': Enviar frame actual a la API")
        print("  - 'a': Activar/desactivar envío automático")
        print("  - 'q': Salir")
        print("-" * 50)
        
        frame_count = 0
        auto_send = False
        last_detection_time = 0
        
        while True:
            # Capturar frame
            result = self.capture_frame_as_base64()
            if result is None:
                print("❌ Error capturando frame")
                break
                
            img_base64, frame = result
            frame_count += 1
            
            # Envío automático cada N frames (si está activado)
            api_response = None
            if auto_send and frame_count % send_every_frames == 0:
                print(f"📤 Enviando frame {frame_count} a la API...")
                api_response = self.send_frame_to_api(img_base64)
                
                if api_response and api_response.get("success"):
                    data = api_response["data"]
                    if data["faces_detected"] > 0:
                        print(f"✅ {data['faces_detected']} rostro(s) detectado(s):")
                        for face in data["faces"]:
                            name = face["best_match_name"]
                            similarity = face["similarity_percentage"]
                            print(f"   - {name}: {similarity:.2f}%")
                        last_detection_time = time.time()
            
            # Dibujar resultados si los hay
            if api_response:
                frame = self.draw_results_on_frame(frame, api_response)
            
            # Añadir información de estado
            status_text = "AUTO: ON" if auto_send else "AUTO: OFF"
            cv2.putText(frame, status_text, (10, frame.shape[0] - 20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            # Mostrar frame
            cv2.imshow("Camera API Test - Face Detection", frame)
            
            # Manejar teclas
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('s'):
                print("📤 Enviando frame manual...")
                api_response = self.send_frame_to_api(img_base64)
                if api_response:
                    print("Respuesta:", json.dumps(api_response, indent=2))
            elif key == ord('a'):
                auto_send = not auto_send
                status = "activado" if auto_send else "desactivado"
                print(f"🔄 Envío automático {status}")
        
        self.stop_camera()
    
    def run_single_shot_test(self):
        """Ejecuta un test de una sola captura"""
        if not self.start_camera():
            return
        
        if not self.test_api_health():
            self.stop_camera()
            return
        
        print("\n📸 Test de captura única")
        print("Presiona ESPACIO para capturar y enviar a la API, 'q' para salir")
        
        while True:
            result = self.capture_frame_as_base64()
            if result is None:
                break
                
            img_base64, frame = result
            
            # Mostrar frame
            cv2.imshow("Camera Test - Presiona ESPACIO para capturar", frame)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord(' '):  # Espacio
                print("📤 Capturando y enviando a la API...")
                
                api_response = self.send_frame_to_api(img_base64)
                
                if api_response and api_response.get("success"):
                    data = api_response["data"]
                    print(f"\n✅ Resultado:")
                    print(f"  - Rostros detectados: {data['faces_detected']}")
                    
                    for i, face in enumerate(data["faces"]):
                        print(f"  - Rostro {i+1}:")
                        print(f"    Nombre: {face['best_match_name']}")
                        print(f"    Similitud: {face['similarity_percentage']:.2f}%")
                        print(f"    Match: {'✓' if face['match_found'] else '✗'}")
                    
                    # Mostrar frame con resultados
                    result_frame = self.draw_results_on_frame(frame.copy(), api_response)
                    cv2.imshow("Resultado de detección", result_frame)
                    cv2.waitKey(0)  # Esperar hasta que presione una tecla
                    cv2.destroyWindow("Resultado de detección")
                else:
                    print("❌ Error en la detección")
        
        self.stop_camera()


def main():
    """Función principal del test"""
    print("🧪 Test de API con Cámara - Face Detection")
    print("=" * 50)
    
    # Crear tester
    tester = CameraAPITester(
        api_url="http://localhost:5000",
        camera_index=0  # Cambiar a 1 si tienes cámara USB externa
    )
    
    print("\nOpciones de test:")
    print("1. Test en tiempo real (envío automático)")
    print("2. Test de captura manual (presionar ESPACIO)")
    print("3. Solo verificar API")
    
    try:
        option = input("\nSelecciona una opción (1-3): ").strip()
        
        if option == "1":
            tester.run_realtime_test(send_every_frames=15)  # Enviar cada 15 frames
        elif option == "2":
            tester.run_single_shot_test()
        elif option == "3":
            tester.test_api_health()
        else:
            print("❌ Opción inválida")
            
    except KeyboardInterrupt:
        print("\n⚠️ Test interrumpido por el usuario")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    finally:
        tester.stop_camera()
        print("🏁 Test finalizado")


if __name__ == "__main__":
    main()