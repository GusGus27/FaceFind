"""
Pruebas Unitarias para getAlertasPorCaso()
Función: AlertaService.getAlertasPorCaso()
Autor: Franco Melchor
Fecha: Noviembre 2025

Descripción:
Pruebas unitarias usando unittest (PyUnit) para verificar el correcto
funcionamiento de la obtención de alertas filtradas por caso.
"""

import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime
import sys
import os

# Agregar el path del proyecto para importar módulos
# Ajustar para subir dos niveles desde Franco_Melchor hasta facefind_back
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.alerta_service import AlertaService
from models.alerta import Alerta
from models.enums import EstadoAlerta, PrioridadAlerta


class TestGetAlertasPorCaso(unittest.TestCase):
    """
    Suite de pruebas unitarias para la función getAlertasPorCaso()
    """

    def setUp(self):
        """
        Configuración inicial antes de cada prueba
        """
        self.caso_id_valido = 1
        self.caso_id_sin_alertas = 999
        self.timestamp_ejemplo = "2025-11-23T10:30:00Z"

    def tearDown(self):
        """
        Limpieza después de cada prueba
        """
        pass

    # ==========================================
    # PRUEBAS DE CASO EXITOSO
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_caso_existente(self, mock_supabase):
        """
        TC-001: Verificar obtención exitosa de alertas de un caso
        Entrada: caso_id = 1 con 2 alertas
        Salida esperada: Lista con 2 alertas
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.85,
                'ubicacion': 'Av. Principal',
                'latitud': -16.5,
                'longitud': -68.15,
                'estado': 'PENDIENTE',
                'prioridad': 'ALTA',
                'falso_positivo': False,
                'Camara': {
                    'id': 1,
                    'ubicacion': 'Av. Principal',
                    'latitud': -16.5,
                    'longitud': -68.15,
                    'ip': '192.168.1.10',
                    'type': 'IP'
                }
            },
            {
                'id': 2,
                'caso_id': 1,
                'camara_id': 2,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.75,
                'ubicacion': 'Calle Secundaria',
                'latitud': -16.51,
                'longitud': -68.16,
                'estado': 'REVISADA',
                'prioridad': 'MEDIA',
                'falso_positivo': False,
                'Camara': {
                    'id': 2,
                    'ubicacion': 'Calle Secundaria',
                    'latitud': -16.51,
                    'longitud': -68.16,
                    'ip': '192.168.1.11',
                    'type': 'IP'
                }
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 2)
        self.assertIsInstance(resultado[0], Alerta)
        self.assertEqual(resultado[0].caso_id, 1)
        self.assertEqual(resultado[0].similitud, 0.85)
        mock_supabase.table.assert_called_once_with("Alerta")

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_caso_sin_alertas(self, mock_supabase):
        """
        TC-002: Verificar comportamiento con caso sin alertas
        Entrada: caso_id = 999 sin alertas
        Salida esperada: Lista vacía []
        """
        # Arrange
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_sin_alertas)

        # Assert
        self.assertEqual(len(resultado), 0)
        self.assertIsInstance(resultado, list)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_con_enriquecimiento_camara(self, mock_supabase):
        """
        TC-003: Verificar enriquecimiento de datos desde cámara
        Entrada: Alerta sin ubicación, cámara con ubicación
        Salida esperada: Alerta con ubicación de la cámara
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.85,
                'ubicacion': None,  # Sin ubicación en alerta
                'latitud': None,
                'longitud': None,
                'estado': 'PENDIENTE',
                'prioridad': 'ALTA',
                'falso_positivo': False,
                'Camara': {
                    'id': 1,
                    'ubicacion': 'Ubicación desde Cámara',
                    'latitud': -16.5,
                    'longitud': -68.15,
                    'ip': '192.168.1.10',
                    'type': 'IP'
                }
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].ubicacion, 'Ubicación desde Cámara')
        self.assertEqual(resultado[0].latitud, -16.5)
        self.assertEqual(resultado[0].longitud, -68.15)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_ordenadas_por_timestamp(self, mock_supabase):
        """
        TC-004: Verificar orden descendente por timestamp
        Entrada: 3 alertas con diferentes timestamps
        Salida esperada: Lista ordenada por timestamp DESC
        """
        # Arrange
        mock_data = [
            {
                'id': 3,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': '2025-11-23T12:00:00Z',
                'similitud': 0.85,
                'estado': 'PENDIENTE',
                'prioridad': 'ALTA',
                'falso_positivo': False,
                'Camara': None
            },
            {
                'id': 2,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': '2025-11-23T11:00:00Z',
                'similitud': 0.75,
                'estado': 'PENDIENTE',
                'prioridad': 'MEDIA',
                'falso_positivo': False,
                'Camara': None
            },
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': '2025-11-23T10:00:00Z',
                'similitud': 0.65,
                'estado': 'PENDIENTE',
                'prioridad': 'BAJA',
                'falso_positivo': False,
                'Camara': None
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 3)
        # Verificar que está ordenado por ID (refleja timestamp DESC)
        self.assertEqual(resultado[0].id, 3)
        self.assertEqual(resultado[1].id, 2)
        self.assertEqual(resultado[2].id, 1)

    # ==========================================
    # PRUEBAS DE CASOS LÍMITE
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_sin_datos_camara(self, mock_supabase):
        """
        TC-005: Verificar comportamiento cuando Camara es None
        Entrada: Alerta sin datos de cámara
        Salida esperada: Alerta con datos originales sin modificar
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.85,
                'ubicacion': 'Ubicación Original',
                'latitud': -16.5,
                'longitud': -68.15,
                'estado': 'PENDIENTE',
                'prioridad': 'ALTA',
                'falso_positivo': False,
                'Camara': None  # Sin datos de cámara
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0].ubicacion, 'Ubicación Original')
        self.assertEqual(resultado[0].latitud, -16.5)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_caso_id_cero(self, mock_supabase):
        """
        TC-006: Verificar comportamiento con caso_id = 0
        Entrada: caso_id = 0
        Salida esperada: Lista vacía (caso inválido)
        """
        # Arrange
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(0)

        # Assert
        self.assertEqual(len(resultado), 0)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_caso_id_negativo(self, mock_supabase):
        """
        TC-007: Verificar comportamiento con caso_id negativo
        Entrada: caso_id = -1
        Salida esperada: Lista vacía
        """
        # Arrange
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(-1)

        # Assert
        self.assertEqual(len(resultado), 0)

    # ==========================================
    # PRUEBAS DE MANEJO DE ERRORES
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_error_conexion(self, mock_supabase):
        """
        TC-008: Verificar manejo de error de conexión
        Entrada: Error en la consulta a base de datos
        Salida esperada: Lista vacía, sin excepción
        """
        # Arrange
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.side_effect = Exception("Error de conexión")
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 0)
        self.assertIsInstance(resultado, list)

    @patch('services.alerta_service.supabase')
    @patch('services.alerta_service.Alerta.from_dict')
    def test_obtener_alertas_error_parseo(self, mock_from_dict, mock_supabase):
        """
        TC-009: Verificar manejo de error al parsear datos
        Entrada: Error en Alerta.from_dict()
        Salida esperada: Lista vacía
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.85,
                'Camara': None
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table
        
        mock_from_dict.side_effect = Exception("Error parseando datos")

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 0)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_response_none(self, mock_supabase):
        """
        TC-010: Verificar comportamiento cuando response.data es None
        Entrada: response.data = None
        Salida esperada: Lista vacía
        """
        # Arrange
        mock_response = MagicMock()
        mock_response.data = None
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 0)

    # ==========================================
    # PRUEBAS DE DATOS ESPECÍFICOS
    # ==========================================

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_con_falsos_positivos(self, mock_supabase):
        """
        TC-011: Verificar obtención de alertas con falsos positivos
        Entrada: Alertas marcadas como falso_positivo
        Salida esperada: Lista incluye falsos positivos
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.85,
                'estado': 'FALSO_POSITIVO',
                'prioridad': 'ALTA',
                'falso_positivo': True,
                'Camara': None
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 1)
        self.assertTrue(resultado[0].falso_positivo)

    @patch('services.alerta_service.supabase')
    def test_obtener_alertas_con_diferentes_prioridades(self, mock_supabase):
        """
        TC-012: Verificar obtención de alertas con diferentes prioridades
        Entrada: Alertas con prioridad ALTA, MEDIA, BAJA
        Salida esperada: Lista con todas las prioridades
        """
        # Arrange
        mock_data = [
            {
                'id': 1,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.95,
                'estado': 'PENDIENTE',
                'prioridad': 'ALTA',
                'falso_positivo': False,
                'Camara': None
            },
            {
                'id': 2,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.70,
                'estado': 'PENDIENTE',
                'prioridad': 'MEDIA',
                'falso_positivo': False,
                'Camara': None
            },
            {
                'id': 3,
                'caso_id': 1,
                'camara_id': 1,
                'timestamp': self.timestamp_ejemplo,
                'similitud': 0.55,
                'estado': 'PENDIENTE',
                'prioridad': 'BAJA',
                'falso_positivo': False,
                'Camara': None
            }
        ]

        mock_response = MagicMock()
        mock_response.data = mock_data
        
        mock_table = MagicMock()
        mock_table.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
        mock_supabase.table.return_value = mock_table

        # Act
        resultado = AlertaService.getAlertasPorCaso(self.caso_id_valido)

        # Assert
        self.assertEqual(len(resultado), 3)
        prioridades = [alerta.prioridad.to_string() for alerta in resultado]
        self.assertIn('ALTA', prioridades)
        self.assertIn('MEDIA', prioridades)
        self.assertIn('BAJA', prioridades)


# ==========================================
# SUITE DE PRUEBAS
# ==========================================

def suite():
    """
    Crea una suite con todas las pruebas
    """
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestGetAlertasPorCaso))
    return suite


if __name__ == '__main__':
    # Ejecutar pruebas con verbosidad
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite())