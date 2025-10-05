import os
import sys
import cv2

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from facefind.generador_encodings import GeneradorEncodings
from facefind.procesador_facefind import ProcesadorFaceFind

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENCODINGS_PATH = os.path.join(BASE_DIR, "facefind", "encodings_test.pickle")
DATASET_PATH = os.path.join(BASE_DIR, "facefind", "dataset_personas")

def capturar_fotos(nombre_persona, num_fotos=4):
    carpeta = os.path.join(DATASET_PATH, nombre_persona)
    os.makedirs(carpeta, exist_ok=True)
    cam = cv2.VideoCapture(0)
    print("Presiona ESPACIO para tomar una foto. ESC para salir.")
    fotos_tomadas = 0
    while fotos_tomadas < num_fotos:
        ret, frame = cam.read()
        if not ret:
            print("No se pudo acceder a la cámara.")
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
    cam.release()
    cv2.destroyAllWindows()

def reconocer_persona(encodings_path):
    cam = cv2.VideoCapture(0)
    print("Presiona ESPACIO para capturar y reconocer. ESC para salir.")
    while True:
        ret, frame = cam.read()
        if not ret:
            print("No se pudo acceder a la cámara.")
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
    cam.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    nombre_persona = input("Ingresa tu nombre para registrar tus fotos: ")
    capturar_fotos(nombre_persona)
    print("Generando encodings...")
    generador = GeneradorEncodings(
        dataset_path=DATASET_PATH,
        output_path=ENCODINGS_PATH
    )
    generador.generar_encodings()
    if not os.path.exists(ENCODINGS_PATH):
        print(f"❌ No se encontró el archivo de encodings en {ENCODINGS_PATH}.")
        print("Verifica que la generación de encodings fue exitosa.")
    else:
        print("¡Listo! Ahora vamos a reconocer tu rostro.")
        reconocer_persona(ENCODINGS_PATH)