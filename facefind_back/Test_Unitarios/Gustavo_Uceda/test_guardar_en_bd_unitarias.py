"""
Pruebas Unitarias para _guardar_en_bd()
Función: AlertaService._guardar_en_bd()
Autor: Gustavo Uceda
Fecha: Noviembre 2025

Descripción:
Pruebas unitarias usando unittest (PyUnit) para verificar el correcto
funcionamiento del guardado de alertas en la base de datos Supabase.
Incluye pruebas de caja blanca (cobertura de caminos) y caja negra (particiones).
"""

import unittest
from unittest.mock import patch, MagicMock, Mock
from datetime import datetime
import sys
import os
import base64

# Agregar el path del proyecto para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.alerta_service import AlertaService
from models.alerta import Alerta
from models.enums import EstadoAlerta, PrioridadAlerta


class TestGuardarEnBD(unittest.TestCase):
    """
    Suite de pruebas unitarias para la función _guardar_en_bd()
    Complejidad Ciclomática: V(G) = 7
    """

    def setUp(self):
        """
        Configuración inicial antes de cada prueba
        """
        self.alerta_basica = Alerta(
            caso_id=1,
            camara_id=1,
            timestamp=datetime(2024, 1, 15, 10, 30, 0),
            similitud=0.85,
            ubicacion="Centro Lima",
            latitud=-12.0464,
            longitud=-77.0428,
            estado=EstadoAlerta.PENDIENTE,
            prioridad=PrioridadAlerta.ALTA,
            imagen_bytes=None,
            horario_inicio=None,
            horario_fin=None,
            falso_positivo=False
        )

    def tearDown(self):
        """
        Limpieza después de cada prueba
        """
        pass

    # ==========================================
    # PRUEBAS DE CAJA BLANCA - CAMINOS INDEPENDIENTES
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_cb01_caso_basico_minimo(self, mock_supabase):
        """
        CB-01: Camino 1 - Caso básico sin campos opcionales
        Ruta: 1→2(F)→6→7→8(F)→10→11→12(F)→14(F)→16→17(F)→19→20→21
        Decisiones: [F, F, F, F, F]
        
        Entrada: Alerta básica sin imagen_bytes, sin horarios, imagen_url válida
        Salida esperada: Alerta guardada exitosamente con id asignado
        """
        # Arrange
        imagen_url = "https://storage.supabase.co/evidencias/img1.jpg"
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 123,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': imagen_url,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 123)
        self.assertEqual(resultado.caso_id, 1)
        self.assertIsNone(resultado.horario_inicio)
        self.assertIsNone(resultado.horario_fin)
        mock_supabase.table.assert_called_once_with("Alerta")
        mock_table.insert.assert_called_once()

    @patch('services.alerta_service.supabase')
    def test_cb02_imagen_url_invalida_dict(self, mock_supabase):
        """
        CB-02: Camino 2 - imagen_url inválida (dict)
        Ruta: 1→2(T)→3→4→5→6→7→8(F)→10→11→12(F)→14(F)→16→17(F)→19→20→21
        Decisiones: [T, F, F, F, F]
        
        Entrada: imagen_url como dict (inválido)
        Salida esperada: imagen_url reseteada a None, advertencia impresa
        """
        # Arrange
        imagen_url = {"signedURL": "https://storage.supabase.co/img.jpg"}
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 124,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,  # Se resetea a None
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        with patch('builtins.print') as mock_print:
            resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 124)
        # Verificar que se imprimió la advertencia
        mock_print.assert_any_call(
            "⚠️ ADVERTENCIA en _guardar_en_bd: imagen_url no es string: <class 'dict'>"
        )

    @patch('services.alerta_service.supabase')
    def test_cb03_con_imagen_bytes(self, mock_supabase):
        """
        CB-03: Camino 3 - Con imagen_bytes
        Ruta: 1→2(F)→6→7→8(T)→9→10→11→12(F)→14(F)→16→17(F)→19→20→21
        Decisiones: [F, T, F, F, F]
        
        Entrada: Alerta con imagen_bytes
        Salida esperada: imagen_bytes codificado en base64 y guardado
        """
        # Arrange
        imagen_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR'
        self.alerta_basica._imagen_bytes = imagen_bytes
        imagen_base64_esperado = base64.b64encode(imagen_bytes).decode('utf-8')
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 125,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': imagen_base64_esperado,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 125)
        # Verificar que se llamó insert con imagen codificada
        call_args = mock_table.insert.call_args[0][0]
        self.assertIn('imagen', call_args)

    @patch('services.alerta_service.supabase')
    def test_cb04_con_horario_inicio(self, mock_supabase):
        """
        CB-04: Camino 4 - Con horario_inicio solamente
        Ruta: 1→2(F)→6→7→8(F)→10→11→12(T)→13→14(F)→16→17(F)→19→20→21
        Decisiones: [F, F, T, F, F]
        
        Entrada: Alerta con horario_inicio
        Salida esperada: horario_inicio agregado al diccionario data
        """
        # Arrange
        self.alerta_basica._horario_inicio = datetime(2024, 1, 15, 8, 0, 0)
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 126,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'horario_inicio': '2024-01-15T08:00:00',
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 126)
        # Verificar que se incluyó horario_inicio en el insert
        call_args = mock_table.insert.call_args[0][0]
        self.assertIn('horario_inicio', call_args)

    @patch('services.alerta_service.supabase')
    def test_cb05_con_horario_fin(self, mock_supabase):
        """
        CB-05: Camino 5 - Con horario_fin solamente
        Ruta: 1→2(F)→6→7→8(F)→10→11→12(F)→14(T)→15→16→17(F)→19→20→21
        Decisiones: [F, F, F, T, F]
        
        Entrada: Alerta con horario_fin
        Salida esperada: horario_fin agregado al diccionario data
        """
        # Arrange
        self.alerta_basica._horario_fin = datetime(2024, 1, 15, 18, 0, 0)
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 127,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'horario_fin': '2024-01-15T18:00:00',
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 127)
        # Verificar que se incluyó horario_fin en el insert
        call_args = mock_table.insert.call_args[0][0]
        self.assertIn('horario_fin', call_args)

    @patch('services.alerta_service.supabase')
    def test_cb06_error_insercion_bd(self, mock_supabase):
        """
        CB-06: Camino 6 - Error en inserción (response.data None)
        Ruta: 1→2(F)→6→7→8(F)→10→11→12(F)→14(F)→16→17(T)→18→21
        Decisiones: [F, F, F, F, T]
        
        Entrada: Supabase retorna response.data = None
        Salida esperada: Exception lanzada
        """
        # Arrange
        mock_response = Mock()
        mock_response.data = None  # Simular error
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act & Assert
        with self.assertRaises(Exception) as context:
            AlertaService._guardar_en_bd(self.alerta_basica, None)
        
        self.assertEqual(str(context.exception), "Error guardando alerta en BD")

    @patch('services.alerta_service.supabase')
    def test_cb07_caso_completo_todos_opcionales(self, mock_supabase):
        """
        CB-07: Camino 7 - Todos los campos opcionales presentes
        Ruta: 1→2(F)→6→7→8(T)→9→10→11→12(T)→13→14(T)→15→16→17(F)→19→20→21
        Decisiones: [F, T, T, T, F]
        
        Entrada: Alerta completa con imagen_bytes, ambos horarios, imagen_url
        Salida esperada: Todos los campos guardados correctamente
        """
        # Arrange
        imagen_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR'
        self.alerta_basica._imagen_bytes = imagen_bytes
        self.alerta_basica._horario_inicio = datetime(2024, 1, 15, 8, 0, 0)
        self.alerta_basica._horario_fin = datetime(2024, 1, 15, 18, 0, 0)
        imagen_url = "https://storage.supabase.co/evidencias/img_completo.jpg"
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 128,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': base64.b64encode(imagen_bytes).decode('utf-8'),
            'imagen_url': imagen_url,
            'horario_inicio': '2024-01-15T08:00:00',
            'horario_fin': '2024-01-15T18:00:00',
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 128)
        # Verificar que se incluyeron todos los campos opcionales
        call_args = mock_table.insert.call_args[0][0]
        self.assertIn('imagen', call_args)
        self.assertIn('imagen_url', call_args)
        self.assertIn('horario_inicio', call_args)
        self.assertIn('horario_fin', call_args)

    # ==========================================
    # PRUEBAS DE CAJA NEGRA - PARTICIONES DE EQUIVALENCIA
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_cn01_alerta_valida_completa(self, mock_supabase):
        """
        CN-01: Particiones válidas - Alerta completa
        PE: PE-01, PE-02-V-A, PE-03-V-A, PE-04-V-A, PE-05-V-A, PE-06-V
        
        Entrada: Todos los campos con valores válidos
        Salida esperada: Alerta guardada exitosamente
        """
        # Arrange
        imagen_bytes = b'\x89PNG\r\n\x1a\n'
        self.alerta_basica._imagen_bytes = imagen_bytes
        self.alerta_basica._horario_inicio = datetime(2024, 1, 15, 8, 0, 0)
        self.alerta_basica._horario_fin = datetime(2024, 1, 15, 18, 0, 0)
        imagen_url = "https://storage.supabase.co/evidencias/img1.jpg"
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 200,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': base64.b64encode(imagen_bytes).decode('utf-8'),
            'imagen_url': imagen_url,
            'horario_inicio': '2024-01-15T08:00:00',
            'horario_fin': '2024-01-15T18:00:00',
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 200)
        self.assertIsInstance(resultado, Alerta)

    @patch('services.alerta_service.supabase')
    def test_cn02_imagen_url_invalida_lista(self, mock_supabase):
        """
        CN-02: PE-01-INV-B - imagen_url como lista (inválida)
        
        Entrada: imagen_url = ["url1.jpg", "url2.jpg"]
        Salida esperada: Reseteo a None, advertencia
        """
        # Arrange
        imagen_url = ["https://url1.jpg", "https://url2.jpg"]
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 201,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        with patch('builtins.print') as mock_print:
            resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        # Verificar advertencia
        mock_print.assert_any_call(
            "⚠️ ADVERTENCIA en _guardar_en_bd: imagen_url no es string: <class 'list'>"
        )

    @patch('services.alerta_service.supabase')
    def test_cn03_sin_imagen_bytes(self, mock_supabase):
        """
        CN-03: PE-02-INV - Sin imagen_bytes
        
        Entrada: imagen_bytes = None
        Salida esperada: Campo imagen guardado como NULL
        """
        # Arrange
        imagen_url = "https://storage.supabase.co/evidencias/img.jpg"
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 202,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': imagen_url,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 202)

    @patch('services.alerta_service.supabase')
    def test_cn04_sin_horarios(self, mock_supabase):
        """
        CN-04: PE-03-V-B, PE-04-V-B - Sin horarios
        
        Entrada: horario_inicio = None, horario_fin = None
        Salida esperada: Campos horarios NO agregados a data
        """
        # Arrange
        mock_response = Mock()
        mock_response.data = [{
            'id': 203,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        # Verificar que no se incluyeron horarios en el insert
        call_args = mock_table.insert.call_args[0][0]
        self.assertNotIn('horario_inicio', call_args)
        self.assertNotIn('horario_fin', call_args)

    @patch('services.alerta_service.supabase')
    def test_cn05_timestamp_como_string(self, mock_supabase):
        """
        CN-05: PE-05-V-B - timestamp como string ISO
        
        Entrada: timestamp = "2024-01-15T10:30:00"
        Salida esperada: Se usa directamente sin conversión
        """
        # Arrange
        self.alerta_basica._timestamp = "2024-01-15T10:30:00"
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 204,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 204)

    @patch('services.alerta_service.supabase')
    def test_cn06_error_bd_response_none(self, mock_supabase):
        """
        CN-06: PE-06-INV-A - Error BD con response.data = None
        
        Entrada: Supabase retorna response.data = None
        Salida esperada: Exception lanzada
        """
        # Arrange
        mock_response = Mock()
        mock_response.data = None
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act & Assert
        with self.assertRaises(Exception) as context:
            AlertaService._guardar_en_bd(self.alerta_basica, None)
        
        self.assertIn("Error guardando alerta en BD", str(context.exception))

    # ==========================================
    # PRUEBAS DE VALORES LÍMITE
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_vl01_imagen_bytes_vacio(self, mock_supabase):
        """
        VL-01: Valor límite - imagen_bytes vacío (0 bytes)
        
        Entrada: imagen_bytes = b''
        Salida esperada: Base64 string vacío
        """
        # Arrange
        self.alerta_basica._imagen_bytes = b''
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 300,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': '',  # Base64 vacío
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 300)

    @patch('services.alerta_service.supabase')
    def test_vl02_fecha_antigua(self, mock_supabase):
        """
        VL-02: Valor límite - fecha muy antigua
        
        Entrada: timestamp = datetime(1900, 1, 1, 0, 0, 0)
        Salida esperada: Fecha guardada correctamente
        """
        # Arrange
        self.alerta_basica._timestamp = datetime(1900, 1, 1, 0, 0, 0)
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 301,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '1900-01-01T00:00:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.id, 301)

    @patch('services.alerta_service.supabase')
    def test_vl03_similitud_minima(self, mock_supabase):
        """
        VL-03: Valor límite - similitud 0.0 (mínimo)
        
        Entrada: similitud = 0.0
        Salida esperada: Guardado correcto
        """
        # Arrange
        self.alerta_basica._similitud = 0.0
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 302,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.0,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.similitud, 0.0)

    @patch('services.alerta_service.supabase')
    def test_vl04_similitud_maxima(self, mock_supabase):
        """
        VL-04: Valor límite - similitud 1.0 (máximo)
        
        Entrada: similitud = 1.0
        Salida esperada: Guardado correcto
        """
        # Arrange
        self.alerta_basica._similitud = 1.0
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 303,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 1.0,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        self.assertEqual(resultado.similitud, 1.0)

    @patch('services.alerta_service.supabase')
    def test_vl05_imagen_url_none_explicito(self, mock_supabase):
        """
        VL-05: Valor límite - imagen_url = None explícito
        
        Entrada: imagen_url = None
        Salida esperada: Guardado sin advertencia
        """
        # Arrange
        mock_response = Mock()
        mock_response.data = [{
            'id': 304,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        with patch('builtins.print') as mock_print:
            resultado = AlertaService._guardar_en_bd(self.alerta_basica, None)

        # Assert
        self.assertIsNotNone(resultado)
        # Verificar que NO se imprimió advertencia de imagen_url
        advertencia_calls = [call for call in mock_print.call_args_list 
                            if '⚠️ ADVERTENCIA en _guardar_en_bd' in str(call)]
        self.assertEqual(len(advertencia_calls), 0)

    # ==========================================
    # PRUEBAS DE MANEJO DE ERRORES
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_error_response_data_lista_vacia(self, mock_supabase):
        """
        PE-06-INV-B: Error con response.data como lista vacía
        
        Entrada: response.data = []
        Salida esperada: Exception por IndexError
        """
        # Arrange
        mock_response = Mock()
        mock_response.data = []  # Lista vacía
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act & Assert
        with self.assertRaises(Exception):
            AlertaService._guardar_en_bd(self.alerta_basica, None)

    @patch('services.alerta_service.supabase')
    def test_imagen_url_numero(self, mock_supabase):
        """
        PE-01-INV-C: imagen_url como número (inválido)
        
        Entrada: imagen_url = 12345
        Salida esperada: Reseteo a None, advertencia
        """
        # Arrange
        imagen_url = 12345
        
        mock_response = Mock()
        mock_response.data = [{
            'id': 305,
            'caso_id': 1,
            'camara_id': 1,
            'timestamp': '2024-01-15T10:30:00',
            'similitud': 0.85,
            'ubicacion': 'Centro Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'imagen': None,
            'imagen_url': None,
            'falso_positivo': False
        }]
        
        mock_table = Mock()
        mock_table.insert.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        with patch('builtins.print') as mock_print:
            resultado = AlertaService._guardar_en_bd(self.alerta_basica, imagen_url)

        # Assert
        self.assertIsNotNone(resultado)
        mock_print.assert_any_call(
            "⚠️ ADVERTENCIA en _guardar_en_bd: imagen_url no es string: <class 'int'>"
        )


# ==========================================
# SUITE DE PRUEBAS
# ==========================================

def suite():
    """
    Crea una suite con todas las pruebas
    """
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestGuardarEnBD))
    return suite


if __name__ == '__main__':
    # Ejecutar pruebas con verbosidad
    print("=" * 70)
    print("PRUEBAS UNITARIAS: AlertaService._guardar_en_bd()")
    print("Complejidad Ciclomática: V(G) = 7")
    print("Autor: Gustavo Quispe")
    print("=" * 70)
    print()
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    
    print()
    print("=" * 70)
    print(f"Tests ejecutados: {result.testsRun}")
    print(f"Éxitos: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Fallos: {len(result.failures)}")
    print(f"Errores: {len(result.errors)}")
    print("=" * 70)
