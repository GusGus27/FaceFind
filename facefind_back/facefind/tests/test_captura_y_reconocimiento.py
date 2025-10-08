import os
import sys
import cv2

# Adjust path to find the facefind package
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from facefind.generador_encodings import GeneradorEncodings
from facefind.procesador_facefind import ProcesadorFaceFind
from facefind.camera.camera_manager import CameraManager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENCODINGS_PATH = os.path.join(BASE_DIR, "facefind", "encodings_test.pickle")
DATASET_PATH = os.path.join(BASE_DIR, "facefind", "dataset_personas")

def select_camera_type():
    while True:
        print("\nSeleccione el tipo de cámara:")
        print("1. Cámara USB")
        print("2. Cámara IP")
        option = input("Opción (1-2): ")
        
        if option == "1":
            return "USB", None
        elif option == "2":
            while True:
                url = input("Ingrese la URL de la cámara IP (o '3' para volver): ")
                if url == "3":
                    break
                return "IP", url
        else:
            print("Opción inválida. Intente nuevamente.")

def setup_camera():
    while True:
        camera_type, url = select_camera_type()
        if camera_type is None:
            continue
            
        camera_manager = CameraManager(camera_type)
        camera = camera_manager.factoryCamera()
        
        if url:
            camera.set_url(url)
        
        if camera.connect():
            return camera_manager, camera, camera_type, url
        else:
            print(f"No se pudo acceder a la cámara {camera_type}")
            print("¿Desea intentar nuevamente? (s/n)")
            if input().lower() != 's':
                return None, None, None, None

def capturar_fotos(nombre_persona, num_fotos=4):
    carpeta = os.path.join(DATASET_PATH, nombre_persona)
    os.makedirs(carpeta, exist_ok=True)
    
    camera_manager, camera, camera_type, url = setup_camera()
    if not camera:
        return None
        
    print("Presiona ESPACIO para tomar una foto. ESC para salir.")
    fotos_tomadas = 0
    while fotos_tomadas < num_fotos:
        frame = camera.get_frame()
        if frame is None:
            print("No se pudo obtener imagen de la cámara.")
            break
            
        cv2.imshow("Captura tu rostro", frame)
        key = cv2.waitKey(1)
        if key % 256 == 27:  # ESC
            print("Cancelado por el usuario.")
            break
        elif key % 256 == 32:  # ESPACIO
            ruta = os.path.join(carpeta, f"{nombre_persona}_{fotos_tomadas+1}.jpg")
            cv2.imwrite(ruta, frame)
            print(f"Foto {fotos_tomadas+1} guardada en {ruta}")
            fotos_tomadas += 1
            
    camera.disconnect()
    cv2.destroyAllWindows()
    return camera_manager, camera_type, url  # Return all camera settings

def reconocer_persona(encodings_path, camera_settings):
    if not camera_settings:
        print("Error: No hay configuración de cámara disponible")
        return
        
    camera_manager, camera_type, url = camera_settings
    camera = camera_manager.factoryCamera()
    if url:
        camera.set_url(url)
        
    if not camera.connect():
        print("Error al reconectar la cámara.")
        return
        
    print("Presiona ESPACIO para capturar y reconocer. ESC para salir.")
    while True:
        frame = camera.get_frame()
        if frame is None:
            print("No se pudo obtener imagen de la cámara.")
            break
            
        cv2.imshow("Reconocimiento facial", frame)
        key = cv2.waitKey(1)
        if key % 256 == 27:  # ESC
            print("Cancelado por el usuario.")
            break
        elif key % 256 == 32:  # ESPACIO
            temp_path = os.path.join(BASE_DIR, "facefind", "temp.jpg")
            cv2.imwrite(temp_path, frame)
            procesador = ProcesadorFaceFind(encodings_path=encodings_path)
            nombre = procesador.reconocer_rostro(temp_path)
            if nombre:
                print(f"¡Reconocido como: {nombre}!")
            else:
                print("No se reconoció el rostro.")
            os.remove(temp_path)
            break
            
    camera.disconnect()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    nombre_persona = input("Ingresa tu nombre para registrar tus fotos: ")
    camera_settings = capturar_fotos(nombre_persona)
    
    if camera_settings:
        print("\nGenerando encodings...")
        generador = GeneradorEncodings(
            dataset_path=DATASET_PATH,
            output_path=ENCODINGS_PATH
        )
        generador.generar_encodings()
        
        if not os.path.exists(ENCODINGS_PATH):
            print(f"❌ No se encontró el archivo de encodings en {ENCODINGS_PATH}")
            print("Verifica que la generación de encodings fue exitosa.")
        else:
            print("\n¡Listo! Ahora vamos a reconocer tu rostro.")
            reconocer_persona(ENCODINGS_PATH, camera_settings)