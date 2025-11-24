"""
Pruebas Unitarias para actualizar_configuracion()
Función: Camara.actualizar_configuracion()
HU-11: Gestión de Múltiples Cámaras
Autor: [Tu Nombre]
Fecha: Noviembre 2025

Descripción:
Pruebas unitarias usando unittest (PyUnit) para verificar el correcto
funcionamiento de la actualización de configuración de cámaras.
"""

import unittest
from datetime import datetime
import sys
import os

# Agregar el path del proyecto para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from models.camara import Camara


class TestActualizarConfiguracion(unittest.TestCase):
    """
    Suite de pruebas unitarias para la función actualizar_configuracion()
    """

    def setUp(self):
        """
        Configuración inicial antes de cada prueba
        Crea una cámara base para todas las pruebas
        """
        self.camara_usb = Camara(
            id=1,
            nombre="Cámara USB Principal",
            tipo="USB",
            ubicacion="Entrada",
            activa=True,
            resolution="1920x1080",
            fps=30
        )
        
        self.camara_ip = Camara(
            id=2,
            nombre="Cámara IP Exterior",
            tipo="IP",
            ubicacion="Jardín",
            activa=True,
            url="rtsp://192.168.1.100:554/stream",
            resolution="1280x720",
            fps=25
        )

    def tearDown(self):
        """
        Limpieza después de cada prueba
        """
        pass

    # ==========================================
    # PRUEBAS DE CASO EXITOSO
    # ==========================================

    def test_actualizar_nombre_exitoso(self):
        """
        TC-001: Verificar actualización exitosa del nombre
        Entrada: nuevo nombre "Cámara Recepción"
        Salida esperada: nombre actualizado correctamente
        """
        # Arrange
        nombre_original = self.camara_usb.nombre
        nuevo_nombre = "Cámara Recepción"
        updated_at_original = self.camara_usb.updated_at

        # Act
        self.camara_usb.actualizar_configuracion(nombre=nuevo_nombre)

        # Assert
        self.assertEqual(self.camara_usb.nombre, nuevo_nombre)
        self.assertNotEqual(self.camara_usb.nombre, nombre_original)
        self.assertGreater(self.camara_usb.updated_at, updated_at_original)

    def test_actualizar_ubicacion_exitoso(self):
        """
        TC-002: Verificar actualización exitosa de la ubicación
        Entrada: nueva ubicación "Sala de Reuniones"
        Salida esperada: ubicación actualizada correctamente
        """
        # Arrange
        ubicacion_original = self.camara_usb.ubicacion
        nueva_ubicacion = "Sala de Reuniones"

        # Act
        self.camara_usb.actualizar_configuracion(ubicacion=nueva_ubicacion)

        # Assert
        self.assertEqual(self.camara_usb.ubicacion, nueva_ubicacion)
        self.assertNotEqual(self.camara_usb.ubicacion, ubicacion_original)

    def test_actualizar_url_camara_ip(self):
        """
        TC-003: Verificar actualización exitosa de URL en cámara IP
        Entrada: nueva URL "rtsp://192.168.1.150:554/stream"
        Salida esperada: URL actualizada correctamente
        """
        # Arrange
        url_original = self.camara_ip.url
        nueva_url = "rtsp://192.168.1.150:554/stream"

        # Act
        self.camara_ip.actualizar_configuracion(url=nueva_url)

        # Assert
        self.assertEqual(self.camara_ip.url, nueva_url)
        self.assertNotEqual(self.camara_ip.url, url_original)

    def test_actualizar_resolution_exitoso(self):
        """
        TC-004: Verificar actualización exitosa de resolución
        Entrada: nueva resolución "3840x2160" (4K)
        Salida esperada: resolución actualizada correctamente
        """
        # Arrange
        resolution_original = self.camara_usb.resolution
        nueva_resolution = "3840x2160"

        # Act
        self.camara_usb.actualizar_configuracion(resolution=nueva_resolution)

        # Assert
        self.assertEqual(self.camara_usb.resolution, nueva_resolution)
        self.assertNotEqual(self.camara_usb.resolution, resolution_original)

    def test_actualizar_fps_exitoso(self):
        """
        TC-005: Verificar actualización exitosa de FPS
        Entrada: nuevos fps 60
        Salida esperada: FPS actualizado correctamente
        """
        # Arrange
        fps_original = self.camara_usb.fps
        nuevo_fps = 60

        # Act
        self.camara_usb.actualizar_configuracion(fps=nuevo_fps)

        # Assert
        self.assertEqual(self.camara_usb.fps, nuevo_fps)
        self.assertNotEqual(self.camara_usb.fps, fps_original)

    def test_actualizar_tipo_exitoso(self):
        """
        TC-006: Verificar actualización exitosa del tipo de cámara
        Entrada: nuevo tipo "IP"
        Salida esperada: tipo actualizado correctamente
        """
        # Arrange
        tipo_original = self.camara_usb.tipo
        nuevo_tipo = "IP"

        # Act
        self.camara_usb.actualizar_configuracion(tipo=nuevo_tipo)

        # Assert
        self.assertEqual(self.camara_usb.tipo, nuevo_tipo)
        self.assertNotEqual(self.camara_usb.tipo, tipo_original)

    def test_actualizar_multiples_parametros_exitoso(self):
        """
        TC-007: Verificar actualización exitosa de múltiples parámetros
        Entrada: nombre, ubicación, resolution y fps
        Salida esperada: todos los parámetros actualizados correctamente
        """
        # Arrange
        nuevos_valores = {
            'nombre': "Cámara Principal Actualizada",
            'ubicacion': "Hall Principal",
            'resolution': "2560x1440",
            'fps': 50
        }

        # Act
        self.camara_usb.actualizar_configuracion(**nuevos_valores)

        # Assert
        self.assertEqual(self.camara_usb.nombre, nuevos_valores['nombre'])
        self.assertEqual(self.camara_usb.ubicacion, nuevos_valores['ubicacion'])
        self.assertEqual(self.camara_usb.resolution, nuevos_valores['resolution'])
        self.assertEqual(self.camara_usb.fps, nuevos_valores['fps'])

    # ==========================================
    # PRUEBAS DE CASOS LÍMITE
    # ==========================================

    def test_actualizar_sin_parametros(self):
        """
        TC-008: Verificar que no falla si no se pasan parámetros
        Entrada: llamada sin argumentos
        Salida esperada: cámara sin cambios, no arroja error
        """
        # Arrange
        nombre_original = self.camara_usb.nombre
        ubicacion_original = self.camara_usb.ubicacion
        fps_original = self.camara_usb.fps

        # Act
        self.camara_usb.actualizar_configuracion()

        # Assert
        self.assertEqual(self.camara_usb.nombre, nombre_original)
        self.assertEqual(self.camara_usb.ubicacion, ubicacion_original)
        self.assertEqual(self.camara_usb.fps, fps_original)

    def test_actualizar_con_parametro_vacio(self):
        """
        TC-009: Verificar actualización con strings vacíos
        Entrada: nombre vacío ""
        Salida esperada: nombre actualizado a string vacío
        """
        # Arrange
        nombre_vacio = ""

        # Act
        self.camara_usb.actualizar_configuracion(nombre=nombre_vacio)

        # Assert
        self.assertEqual(self.camara_usb.nombre, nombre_vacio)

    def test_actualizar_fps_valor_minimo(self):
        """
        TC-010: Verificar actualización con FPS mínimo válido
        Entrada: fps = 1
        Salida esperada: FPS actualizado a 1
        """
        # Arrange
        fps_minimo = 1

        # Act
        self.camara_usb.actualizar_configuracion(fps=fps_minimo)

        # Assert
        self.assertEqual(self.camara_usb.fps, fps_minimo)

    def test_actualizar_fps_valor_maximo(self):
        """
        TC-011: Verificar actualización con FPS máximo válido
        Entrada: fps = 120
        Salida esperada: FPS actualizado a 120
        """
        # Arrange
        fps_maximo = 120

        # Act
        self.camara_usb.actualizar_configuracion(fps=fps_maximo)

        # Assert
        self.assertEqual(self.camara_usb.fps, fps_maximo)

    def test_actualizar_url_a_none(self):
        """
        TC-012: Verificar actualización de URL a None
        Entrada: url = None
        Salida esperada: URL actualizada a None
        """
        # Arrange
        self.camara_ip.url = "rtsp://192.168.1.100:554/stream"

        # Act
        self.camara_ip.actualizar_configuracion(url=None)

        # Assert
        self.assertIsNone(self.camara_ip.url)

    def test_actualizar_resolution_a_none(self):
        """
        TC-013: Verificar actualización de resolución a None
        Entrada: resolution = None
        Salida esperada: resolución actualizada a None
        """
        # Act
        self.camara_usb.actualizar_configuracion(resolution=None)

        # Assert
        self.assertIsNone(self.camara_usb.resolution)

    # ==========================================
    # PRUEBAS DE CASOS INVÁLIDOS
    # ==========================================

    def test_actualizar_fps_negativo(self):
        """
        TC-014: Verificar rechazo de FPS negativo
        Entrada: fps = -10
        Salida esperada: ValueError
        """
        # Arrange
        fps_invalido = -10

        # Act & Assert
        with self.assertRaises(ValueError) as context:
            self.camara_usb.actualizar_configuracion(fps=fps_invalido)
        
        self.assertIn("FPS debe estar entre 1 y 120", str(context.exception))

    def test_actualizar_fps_excesivo(self):
        """
        TC-015: Verificar rechazo de FPS superior al máximo
        Entrada: fps = 150
        Salida esperada: ValueError
        """
        # Arrange
        fps_excesivo = 150

        # Act & Assert
        with self.assertRaises(ValueError) as context:
            self.camara_usb.actualizar_configuracion(fps=fps_excesivo)
        
        self.assertIn("FPS debe estar entre 1 y 120", str(context.exception))

    def test_actualizar_tipo_invalido(self):
        """
        TC-016: Verificar rechazo de tipo de cámara inválido
        Entrada: tipo = "WIRELESS"
        Salida esperada: ValueError
        """
        # Arrange
        tipo_invalido = "WIRELESS"

        # Act & Assert
        with self.assertRaises(ValueError) as context:
            self.camara_usb.actualizar_configuracion(tipo=tipo_invalido)
        
        self.assertIn("Tipo debe ser 'USB' o 'IP'", str(context.exception))

    def test_actualizar_fps_cero(self):
        """
        TC-017: Verificar rechazo de FPS en cero
        Entrada: fps = 0
        Salida esperada: ValueError
        """
        # Arrange
        fps_cero = 0

        # Act & Assert
        with self.assertRaises(ValueError) as context:
            self.camara_usb.actualizar_configuracion(fps=fps_cero)
        
        self.assertIn("FPS debe estar entre 1 y 120", str(context.exception))

    # ==========================================
    # PRUEBAS DE INTEGRIDAD
    # ==========================================

    def test_actualizar_updated_at_cambia(self):
        """
        TC-018: Verificar que updated_at se actualiza automáticamente
        Entrada: cualquier actualización de parámetro
        Salida esperada: updated_at es mayor que el valor original
        """
        # Arrange
        import time
        updated_at_original = self.camara_usb.updated_at
        time.sleep(0.01)  # Pequeña pausa para asegurar diferencia de timestamp

        # Act
        self.camara_usb.actualizar_configuracion(nombre="Nuevo Nombre")

        # Assert
        self.assertGreater(self.camara_usb.updated_at, updated_at_original)

    def test_actualizar_no_afecta_id(self):
        """
        TC-019: Verificar que actualizar configuración no modifica el ID
        Entrada: múltiples parámetros actualizados
        Salida esperada: ID permanece sin cambios
        """
        # Arrange
        id_original = self.camara_usb.id

        # Act
        self.camara_usb.actualizar_configuracion(
            nombre="Nuevo Nombre",
            ubicacion="Nueva Ubicación",
            fps=45
        )

        # Assert
        self.assertEqual(self.camara_usb.id, id_original)

    def test_actualizar_no_afecta_activa(self):
        """
        TC-020: Verificar que actualizar_configuracion no modifica el estado activa
        Entrada: actualización de parámetros
        Salida esperada: campo 'activa' permanece sin cambios
        """
        # Arrange
        activa_original = self.camara_usb.activa

        # Act
        self.camara_usb.actualizar_configuracion(
            nombre="Nombre Actualizado",
            ubicacion="Ubicación Actualizada"
        )

        # Assert
        self.assertEqual(self.camara_usb.activa, activa_original)

    def test_actualizar_parametro_desconocido_ignorado(self):
        """
        TC-021: Verificar que parámetros desconocidos son ignorados
        Entrada: parámetro 'color' que no existe en el modelo
        Salida esperada: no arroja error, parámetro ignorado
        """
        # Act - No debe arrojar error
        try:
            self.camara_usb.actualizar_configuracion(color="azul")
            test_passed = True
        except Exception:
            test_passed = False

        # Assert
        self.assertTrue(test_passed)
        self.assertFalse(hasattr(self.camara_usb, 'color'))

    # ==========================================
    # PRUEBAS DE ENCADENAMIENTO
    # ==========================================

    def test_actualizar_multiples_veces_consecutivas(self):
        """
        TC-022: Verificar múltiples actualizaciones consecutivas
        Entrada: 3 actualizaciones seguidas del mismo parámetro
        Salida esperada: valor final es el de la última actualización
        """
        # Act
        self.camara_usb.actualizar_configuracion(nombre="Nombre 1")
        self.camara_usb.actualizar_configuracion(nombre="Nombre 2")
        self.camara_usb.actualizar_configuracion(nombre="Nombre 3")

        # Assert
        self.assertEqual(self.camara_usb.nombre, "Nombre 3")

    def test_actualizar_diferentes_parametros_secuencialmente(self):
        """
        TC-023: Verificar actualizaciones secuenciales de diferentes parámetros
        Entrada: actualizar nombre, luego ubicación, luego fps
        Salida esperada: todos los valores actualizados correctamente
        """
        # Act
        self.camara_usb.actualizar_configuracion(nombre="Nuevo Nombre")
        nombre_intermedio = self.camara_usb.nombre
        
        self.camara_usb.actualizar_configuracion(ubicacion="Nueva Ubicación")
        ubicacion_intermedia = self.camara_usb.ubicacion
        
        self.camara_usb.actualizar_configuracion(fps=55)
        fps_final = self.camara_usb.fps

        # Assert
        self.assertEqual(nombre_intermedio, "Nuevo Nombre")
        self.assertEqual(ubicacion_intermedia, "Nueva Ubicación")
        self.assertEqual(fps_final, 55)


# ==========================================
# EJECUTAR PRUEBAS
# ==========================================

if __name__ == '__main__':
    # Configurar verbosidad
    unittest.main(verbosity=2)
