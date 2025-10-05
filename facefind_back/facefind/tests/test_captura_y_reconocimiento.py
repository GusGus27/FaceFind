import cv2
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# ...existing imports...
from facefind.generador_encodings import GeneradorEncodings
from facefind.procesador_facefind import ProcesadorFaceFind
# ...resto del código...

def capturar_fotos(nombre_persona, num_fotos=4):
    carpeta = f"facefind/dataset_personas/{nombre_persona}"
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
            cv2.imwrite("temp.jpg", frame)
            procesador = ProcesadorFaceFind(encodings_path)
            nombre = procesador.reconocer_rostro("temp.jpg")
            if nombre:
                print(f"¡Reconocido como: {nombre}!")
            else:
                print("No se reconoció el rostro.")
            os.remove("temp.jpg")
            break
    cam.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    nombre_persona = input("Ingresa tu nombre para registrar tus fotos: ")
    capturar_fotos(nombre_persona)
    print("Generando encodings...")
    generador = GeneradorEncodings(
        dataset_path="facefind/dataset_personas",
        output_path="facefind/encodings_test.pickle"
    )
    generador.generar_encodings()
    print("¡Listo! Ahora vamos a reconocer tu rostro.")
    reconocer_persona("facefind/encodings_test.pickle")