"""
Script de prueba para verificar deduplicación
Muestra cómo funciona sin alertas duplicadas
"""
import requests
import base64
import json
from pathlib import Path


def test_deduplication():
    """
    Prueba el sistema de deduplicación
    """
    api_url = "http://localhost:5000"
    
    print("=" * 60)
    print("🧪 PRUEBA DE DEDUPLICACIÓN Y PRIORIZACIÓN")
    print("=" * 60)
    
    # 1. Verificar estado del sistema
    print("\n📊 1. Verificando estado del sistema...")
    try:
        response = requests.get(f"{api_url}/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ Sistema activo")
            print(f"   - Rostros conocidos: {data.get('known_faces', 0)}")
            print(f"   - Max rostros: {data.get('max_faces', 0)}")
            print(f"   - Deduplicación: {'✅ Activada' if data.get('deduplication_enabled') else '❌ Desactivada'}")
            print(f"   - Procesamiento paralelo: {'✅ Activado' if data.get('parallel_processing_enabled') else '❌ Desactivado'}")
        else:
            print(f"❌ Error: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ No se pudo conectar al servidor: {e}")
        print("\n💡 Asegúrate de que el servidor esté corriendo:")
        print("   cd facefind_back")
        print("   python app.py")
        return
    
    # 2. Información sobre deduplicación
    print("\n" + "=" * 60)
    print("📖 CÓMO FUNCIONA LA DEDUPLICACIÓN")
    print("=" * 60)
    print("""
Cuando el sistema detecta múltiples rostros de la MISMA persona:

ANTES (sin deduplicación):
  Input:  3 rostros → Pedro (95%), Juan (88%), Pedro (92%)
  Output: 3 alertas → Pedro, Juan, Pedro ❌ DUPLICADO

AHORA (con deduplicación):
  Input:  3 rostros → Pedro (95%), Juan (88%), Pedro (92%)
  Output: 2 alertas → Pedro (95%), Juan (88%) ✅ ÚNICO
          └─ Solo el Pedro con mejor similitud

BENEFICIOS:
  ✅ Sin spam de alertas
  ✅ Solo la mejor detección por persona
  ✅ Más limpio para el frontend
  ✅ Mejor experiencia de usuario
    """)
    
    # 3. Información sobre priorización
    print("=" * 60)
    print("🎯 PRIORIZACIÓN POR CALIDAD")
    print("=" * 60)
    print("""
El sistema ahora prioriza rostros usando:

1. TAMAÑO (60%):
   - Rostros más grandes = más cercanos a cámara
   - Mejor resolución para reconocimiento
   
2. NITIDEZ (40%):
   - Medida con varianza de Laplaciano
   - Descarta rostros borrosos o desenfocados

EJEMPLO:
  Detectados: 5 rostros
  Scores:     [92.5, 88.3, 76.1, 65.4, 52.8]
  Procesados: Top 3 → [92.5, 88.3, 76.1] ✅
  Descartados: [65.4, 52.8] (baja calidad)

LOGS QUE VERÁS:
  🧠 Detectados 5 rostros totales
     🎯 Procesando los 3 rostros de mejor calidad
     ⚡ Procesamiento paralelo de 3 rostros
  ✅ Rostro 0: Coincide con Pedro (95.2%, calidad: 92.5)
  ✅ Rostro 1: Coincide con Juan (88.3%, calidad: 88.3)
     🔄 Deduplicado: Pedro (2 detecciones → 1 alerta)
  ⏱️  Procesamiento completado en 210ms
    """)
    
    # 4. Prueba con imagen si está disponible
    print("=" * 60)
    print("📸 PRUEBA CON IMAGEN (OPCIONAL)")
    print("=" * 60)
    
    # Buscar imágenes de prueba
    test_images = []
    backend_path = Path(__file__).parent.parent
    
    # Buscar en dataset
    dataset_path = backend_path / "facefind" / "dataset_personas"
    if dataset_path.exists():
        for person_folder in dataset_path.iterdir():
            if person_folder.is_dir():
                for img_file in person_folder.glob("*.jpg"):
                    test_images.append(img_file)
                    if len(test_images) >= 1:
                        break
            if test_images:
                break
    
    if test_images:
        print(f"\n✅ Encontrada imagen de prueba: {test_images[0].name}")
        respuesta = input("\n¿Quieres probar con esta imagen? (s/n): ").lower()
        
        if respuesta == 's':
            try:
                # Leer y codificar imagen
                with open(test_images[0], 'rb') as f:
                    img_data = base64.b64encode(f.read()).decode('utf-8')
                
                print(f"\n📤 Enviando imagen al servidor...")
                response = requests.post(
                    f"{api_url}/detect-faces",
                    json={"image": img_data},
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get('success'):
                        data = result['data']
                        print(f"\n✅ Detección exitosa!")
                        print(f"\n📊 Resultados:")
                        print(f"   - Total detectados: {data.get('total_faces_detected', 0)}")
                        print(f"   - Procesados: {data.get('faces_processed', 0)}")
                        print(f"   - Tiempo: {data.get('processing_time_ms', 0):.0f}ms")
                        
                        faces = data.get('faces', [])
                        if faces:
                            print(f"\n👥 Rostros identificados:")
                            for i, face in enumerate(faces, 1):
                                print(f"\n   {i}. {face['best_match_name']}")
                                print(f"      - Similitud: {face['similarity_percentage']}%")
                                print(f"      - Calidad: {face.get('quality_score', 'N/A')}")
                                print(f"      - Match: {'✅ Sí' if face['match_found'] else '❌ No'}")
                        else:
                            print("\n   No se identificaron rostros conocidos")
                    else:
                        print(f"\n❌ Error: {result.get('error', 'Desconocido')}")
                else:
                    print(f"\n❌ Error HTTP: {response.status_code}")
                    
            except Exception as e:
                print(f"\n❌ Error procesando imagen: {e}")
    else:
        print("\nℹ️  No se encontraron imágenes de prueba en dataset_personas/")
        print("   Puedes agregar imágenes ahí para probar")
    
    # 5. Instrucciones finales
    print("\n" + "=" * 60)
    print("📝 CÓMO PROBAR MANUALMENTE")
    print("=" * 60)
    print("""
1. Captura una imagen con MÚLTIPLES instancias de la MISMA persona
   (por ejemplo, foto de grupo con Pedro apareciendo 2 veces)

2. Envía la imagen al endpoint /detect-faces

3. Observa el resultado:
   - total_faces_detected: Total de rostros en la imagen
   - faces_processed: Rostros después de deduplicación
   - faces: Array con rostros únicos

4. Verifica en los logs del servidor:
   🔄 Deduplicado: Pedro (2 detecciones → 1 alerta)

EJEMPLO CON CURL:
  # Guardar imagen en base64
  base64 imagen.jpg > imagen.b64
  
  # Enviar
  curl -X POST http://localhost:5000/detect-faces \\
    -H "Content-Type: application/json" \\
    -d '{"image": "'$(cat imagen.b64)'"}'
    """)
    
    print("\n" + "=" * 60)
    print("✅ PRUEBA COMPLETADA")
    print("=" * 60)


if __name__ == "__main__":
    test_deduplication()
