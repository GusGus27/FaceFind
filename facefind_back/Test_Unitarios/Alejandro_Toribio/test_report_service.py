"""
Test unitarios para ReportService
Pruebas basadas en análisis de complejidad ciclomática y caja negra
"""
import unittest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from io import BytesIO
import sys
import os

# Agregar el directorio raíz del backend al path para importar módulos
# Subir dos niveles: Alejandro_Toribio -> Test_Unitarios -> facefind_back
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from services.report_service import ReportService


class TestObtenerAlertasFiltradas(unittest.TestCase):
    """Pruebas unitarias para el método _obtener_alertas_filtradas"""
    
    def setUp(self):
        """Configuración antes de cada prueba"""
        self.mock_response = Mock()
        self.mock_response.data = []
        
    @patch('services.report_service.supabase')
    def test_camino_1_sin_filtros_sin_datos(self, mock_supabase):
        """
        Camino 1: Sin filtros, respuesta vacía
        Cobertura: No se aplican filtros, response.data vacío
        """
        # Arrange
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, None, None)
        
        # Assert
        self.assertEqual(resultado, [])
        mock_query.select.assert_called_once()
        mock_query.order.assert_called_once_with("timestamp", desc=True)
    
    @patch('services.report_service.supabase')
    def test_camino_2_con_fecha_inicio(self, mock_supabase):
        """
        Camino 2: Con filtro de fecha_inicio
        Cobertura: if fecha_inicio = True
        """
        # Arrange
        fecha_inicio = datetime(2024, 1, 1)
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.gte.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(fecha_inicio, None, None, None, None)
        
        # Assert
        mock_query.gte.assert_called_once_with("timestamp", fecha_inicio.isoformat())
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_camino_3_con_fecha_fin(self, mock_supabase):
        """
        Camino 3: Con filtro de fecha_fin
        Cobertura: if fecha_fin = True
        """
        # Arrange
        fecha_fin = datetime(2024, 12, 31)
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.lte.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, fecha_fin, None, None, None)
        
        # Assert
        mock_query.lte.assert_called_once_with("timestamp", fecha_fin.isoformat())
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_camino_4_con_estado(self, mock_supabase):
        """
        Camino 4: Con filtro de estado
        Cobertura: if estado = True
        """
        # Arrange
        estado = "pendiente"
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, estado, None, None)
        
        # Assert
        mock_query.eq.assert_called_once_with("estado", "PENDIENTE")
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_camino_5_con_camara_id(self, mock_supabase):
        """
        Camino 5: Con filtro de camara_id
        Cobertura: if camara_id = True
        """
        # Arrange
        camara_id = 123
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, None, camara_id)
        
        # Assert
        mock_query.eq.assert_called_once_with("camara_id", camara_id)
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_camino_6_con_datos_sin_usuario_filtro(self, mock_supabase):
        """
        Camino 6: Con datos, sin filtro de usuario
        Cobertura: response.data no vacío, usuario_id = None
        """
        # Arrange
        mock_alerta = {
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'similitud': 0.95,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'ubicacion': 'Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'falso_positivo': False,
            'Caso': {
                'id': 1,
                'usuario_id': 100,
                'status': 'activo',
                'PersonaDesaparecida': {'nombre_completo': 'Juan Pérez'},
                'Usuario': {'nombre': 'Admin', 'email': 'admin@test.com'}
            },
            'Camara': {'id': 1, 'ubicacion': 'Centro', 'ip': '192.168.1.1', 'type': 'IP'}
        }
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[mock_alerta])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, None, None)
        
        # Assert
        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0]['id'], 1)
        self.assertEqual(resultado[0]['persona_nombre'], 'Juan Pérez')
    
    @patch('services.report_service.supabase')
    def test_camino_7_con_usuario_filtro_coincide(self, mock_supabase):
        """
        Camino 7: Con filtro de usuario_id que coincide
        Cobertura: usuario_id != None AND caso.usuario_id == usuario_id
        """
        # Arrange
        usuario_id = 100
        mock_alerta = {
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'similitud': 0.95,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'ubicacion': 'Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'falso_positivo': False,
            'Caso': {
                'id': 1,
                'usuario_id': 100,
                'status': 'activo',
                'PersonaDesaparecida': {'nombre_completo': 'Juan Pérez'},
                'Usuario': {'nombre': 'Admin', 'email': 'admin@test.com'}
            },
            'Camara': {'id': 1, 'ubicacion': 'Centro', 'ip': '192.168.1.1', 'type': 'IP'}
        }
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[mock_alerta])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, usuario_id, None)
        
        # Assert
        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0]['usuario_nombre'], 'Admin')
    
    @patch('services.report_service.supabase')
    def test_camino_8_con_usuario_filtro_no_coincide(self, mock_supabase):
        """
        Camino 8: Con filtro de usuario_id que NO coincide
        Cobertura: usuario_id != None AND caso.usuario_id != usuario_id (continue)
        """
        # Arrange
        usuario_id = 999  # Diferente al usuario_id de la alerta
        mock_alerta = {
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'Caso': {
                'id': 1,
                'usuario_id': 100,  # Diferente
                'status': 'activo',
                'PersonaDesaparecida': {'nombre_completo': 'Juan Pérez'},
                'Usuario': {'nombre': 'Admin', 'email': 'admin@test.com'}
            },
            'Camara': {}
        }
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[mock_alerta])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, usuario_id, None)
        
        # Assert
        self.assertEqual(len(resultado), 0)  # Debe estar vacío por el filtro
    
    @patch('services.report_service.supabase')
    def test_camino_9_usuario_sin_caso(self, mock_supabase):
        """
        Camino 9: Con filtro de usuario pero alerta sin caso
        Cobertura: usuario_id != None AND not alerta.get('Caso')
        """
        # Arrange
        usuario_id = 100
        mock_alerta = {
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'Caso': None,  # Sin caso
            'Camara': {}
        }
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[mock_alerta])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, usuario_id, None)
        
        # Assert
        self.assertEqual(len(resultado), 0)
    
    @patch('services.report_service.supabase')
    def test_camino_10_todos_los_filtros(self, mock_supabase):
        """
        Camino 10: Con todos los filtros aplicados
        Cobertura: Todos los if = True
        """
        # Arrange
        fecha_inicio = datetime(2024, 1, 1)
        fecha_fin = datetime(2024, 12, 31)
        estado = "revisada"
        usuario_id = 100
        camara_id = 5
        
        mock_alerta = {
            'id': 1,
            'timestamp': '2024-06-15T10:00:00',
            'similitud': 0.95,
            'estado': 'REVISADA',
            'prioridad': 'ALTA',
            'ubicacion': 'Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'falso_positivo': False,
            'Caso': {
                'id': 1,
                'usuario_id': 100,
                'status': 'activo',
                'PersonaDesaparecida': {'nombre_completo': 'Juan Pérez'},
                'Usuario': {'nombre': 'Admin', 'email': 'admin@test.com'}
            },
            'Camara': {'id': 5, 'ubicacion': 'Centro', 'ip': '192.168.1.1', 'type': 'IP'}
        }
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.gte.return_value = mock_query
        mock_query.lte.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[mock_alerta])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(
            fecha_inicio, fecha_fin, estado, usuario_id, camara_id
        )
        
        # Assert
        self.assertEqual(len(resultado), 1)
        mock_query.gte.assert_called_once()
        mock_query.lte.assert_called_once()
        # eq se llama dos veces: una para estado, otra para camara_id
        self.assertEqual(mock_query.eq.call_count, 2)
    
    @patch('services.report_service.supabase')
    def test_camino_11_excepcion(self, mock_supabase):
        """
        Camino 11: Manejo de excepción
        Cobertura: except Exception
        """
        # Arrange
        mock_query = Mock()
        mock_query.select.side_effect = Exception("Error de base de datos")
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, None, None)
        
        # Assert
        self.assertEqual(resultado, [])


class TestGenerarReporteExcel(unittest.TestCase):
    """Pruebas unitarias para generar_reporte_excel"""
    
    @patch('services.report_service.ReportService._agregar_marca_agua')
    @patch('services.report_service.ReportService._crear_hoja_graficos')
    @patch('services.report_service.ReportService._crear_hoja_estadisticas')
    @patch('services.report_service.ReportService._crear_hoja_alertas')
    @patch('services.report_service.ReportService._obtener_alertas_filtradas')
    @patch('services.report_service.openpyxl.Workbook')
    def test_generar_excel_sin_datos(self, mock_workbook, mock_obtener, mock_alertas, 
                                      mock_stats, mock_graficos, mock_marca):
        """Prueba generación de Excel sin datos"""
        # Arrange
        mock_obtener.return_value = []
        mock_wb = Mock()
        mock_workbook.return_value = mock_wb
        mock_ws_active = Mock()
        mock_ws_active.title = "Alertas"
        mock_wb.active = mock_ws_active
        mock_wb.create_sheet = Mock(return_value=Mock())
        mock_wb.save = Mock()
        
        # Act
        resultado = ReportService.generar_reporte_excel()
        
        # Assert
        self.assertIsInstance(resultado, BytesIO)
        mock_obtener.assert_called_once()
        mock_alertas.assert_called_once()
        mock_stats.assert_called_once()
        mock_graficos.assert_called_once()
        mock_marca.assert_called_once()
    
    @patch('services.report_service.ReportService._agregar_marca_agua')
    @patch('services.report_service.ReportService._crear_hoja_graficos')
    @patch('services.report_service.ReportService._crear_hoja_estadisticas')
    @patch('services.report_service.ReportService._crear_hoja_alertas')
    @patch('services.report_service.ReportService._obtener_alertas_filtradas')
    @patch('services.report_service.openpyxl.Workbook')
    def test_generar_excel_con_datos(self, mock_workbook, mock_obtener, mock_alertas,
                                       mock_stats, mock_graficos, mock_marca):
        """Prueba generación de Excel con datos"""
        # Arrange
        mock_alertas_data = [{
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'similitud': 0.95,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'ubicacion': 'Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'falso_positivo': False,
            'persona_nombre': 'Juan Pérez',
            'usuario_nombre': 'Admin',
            'usuario_email': 'admin@test.com',
            'camara_info': 'IP - Centro',
            'caso_id': 1,
            'caso_status': 'activo'
        }]
        mock_obtener.return_value = mock_alertas_data
        
        mock_wb = Mock()
        mock_workbook.return_value = mock_wb
        mock_ws_active = Mock()
        mock_ws_active.title = "Alertas"
        mock_wb.active = mock_ws_active
        mock_wb.create_sheet = Mock(return_value=Mock())
        mock_wb.save = Mock()
        
        # Act
        resultado = ReportService.generar_reporte_excel()
        
        # Assert
        self.assertIsInstance(resultado, BytesIO)
        self.assertEqual(mock_wb.create_sheet.call_count, 2)  # Estadísticas y Gráficos
        mock_alertas.assert_called_once_with(mock_ws_active, mock_alertas_data)
        mock_stats.assert_called_once()
        mock_graficos.assert_called_once()


class TestGenerarReporteCSV(unittest.TestCase):
    """Pruebas unitarias para generar_reporte_csv"""
    
    @patch('services.report_service.ReportService._obtener_alertas_filtradas')
    def test_generar_csv_sin_datos(self, mock_obtener):
        """Prueba generación de CSV sin datos"""
        # Arrange
        mock_obtener.return_value = []
        
        # Act
        resultado = ReportService.generar_reporte_csv()
        
        # Assert
        self.assertIsInstance(resultado, BytesIO)
        contenido = resultado.getvalue().decode('utf-8-sig')
        self.assertIn('ID Alerta', contenido)
        self.assertIn('Fecha/Hora', contenido)
    
    @patch('services.report_service.ReportService._obtener_alertas_filtradas')
    def test_generar_csv_con_datos(self, mock_obtener):
        """Prueba generación de CSV con datos"""
        # Arrange
        mock_alertas = [{
            'id': 1,
            'timestamp': '2024-01-01T10:00:00',
            'similitud': 0.95,
            'estado': 'PENDIENTE',
            'prioridad': 'ALTA',
            'ubicacion': 'Lima',
            'latitud': -12.0464,
            'longitud': -77.0428,
            'falso_positivo': False,
            'persona_nombre': 'Juan Pérez',
            'usuario_nombre': 'Admin',
            'usuario_email': 'admin@test.com',
            'camara_info': 'IP - Centro',
            'caso_id': 1,
            'caso_status': 'activo'
        }]
        mock_obtener.return_value = mock_alertas
        
        # Act
        resultado = ReportService.generar_reporte_csv()
        
        # Assert
        self.assertIsInstance(resultado, BytesIO)
        contenido = resultado.getvalue().decode('utf-8-sig')
        self.assertIn('Juan Pérez', contenido)
        self.assertIn('Lima', contenido)
        self.assertIn('95.0', contenido)  # Similitud


class TestPruebasCajaNegra(unittest.TestCase):
    """Pruebas de caja negra basadas en clases de equivalencia"""
    
    @patch('services.report_service.supabase')
    def test_clase_equivalencia_fechas_validas(self, mock_supabase):
        """CE1: Fechas válidas en rango correcto"""
        # Arrange
        fecha_inicio = datetime(2024, 1, 1)
        fecha_fin = datetime(2024, 12, 31)
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.gte.return_value = mock_query
        mock_query.lte.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(fecha_inicio, fecha_fin, None, None, None)
        
        # Assert
        self.assertEqual(resultado, [])
        mock_query.gte.assert_called_once()
        mock_query.lte.assert_called_once()
    
    @patch('services.report_service.supabase')
    def test_clase_equivalencia_estado_valido(self, mock_supabase):
        """CE2: Estado válido (PENDIENTE, REVISADA, CONFIRMADA)"""
        # Arrange
        estados_validos = ['pendiente', 'revisada', 'confirmada']
        
        for estado in estados_validos:
            mock_query = Mock()
            mock_query.select.return_value = mock_query
            mock_query.eq.return_value = mock_query
            mock_query.order.return_value = mock_query
            mock_query.execute.return_value = Mock(data=[])
            mock_supabase.table.return_value = mock_query
            
            # Act
            resultado = ReportService._obtener_alertas_filtradas(None, None, estado, None, None)
            
            # Assert
            self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_clase_equivalencia_ids_positivos(self, mock_supabase):
        """CE3: IDs positivos válidos"""
        # Arrange
        usuario_id = 1
        camara_id = 1
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, usuario_id, camara_id)
        
        # Assert
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_valor_limite_fecha_mismo_dia(self, mock_supabase):
        """VL1: Fecha inicio = Fecha fin (mismo día)"""
        # Arrange
        fecha = datetime(2024, 6, 15)
        
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.gte.return_value = mock_query
        mock_query.lte.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(fecha, fecha, None, None, None)
        
        # Assert
        self.assertEqual(resultado, [])
    
    @patch('services.report_service.supabase')
    def test_valor_limite_id_minimo(self, mock_supabase):
        """VL2: ID mínimo válido (1)"""
        # Arrange
        mock_query = Mock()
        mock_query.select.return_value = mock_query
        mock_query.eq.return_value = mock_query
        mock_query.order.return_value = mock_query
        mock_query.execute.return_value = Mock(data=[])
        mock_supabase.table.return_value = mock_query
        
        # Act
        resultado = ReportService._obtener_alertas_filtradas(None, None, None, 1, 1)
        
        # Assert
        self.assertEqual(resultado, [])


if __name__ == '__main__':
    # Ejecutar tests con verbosidad
    unittest.main(verbosity=2)
