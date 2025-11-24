"""
Pruebas Unitarias para limpiar_evidencias_antiguas()
Función: EvidenciaService.limpiar_evidencias_antiguas()
Autor: Marcelo Landa
Fecha: Noviembre 2025

Descripción:
Pruebas unitarias usando unittest (PyUnit) para verificar el correcto
funcionamiento de la limpieza de evidencias antiguas en Supabase Storage.
"""

import unittest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta, timezone
import sys
import os

# Agregar el path del proyecto para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.evidencia_service import EvidenciaService


class TestLimpiarEvidenciasAntiguas(unittest.TestCase):
    """
    Suite de pruebas unitarias para la función limpiar_evidencias_antiguas()
    """

    def setUp(self):
        """
        Configuración inicial antes de cada prueba
        """
        self.dias_retencion = 60
        self.fecha_actual = datetime.now()
        self.fecha_limite = self.fecha_actual - timedelta(days=self.dias_retencion)

    def tearDown(self):
        """
        Limpieza después de cada prueba
        """
        pass

    # ==========================================
    # PRUEBAS DE CASO EXITOSO
    # ==========================================

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_sin_archivos_antiguos(self, mock_config, mock_storage):
        """
        TC-001: Verificar que retorna 0 cuando no hay archivos antiguos
        Entrada: Bucket vacío
        Salida esperada: 0 archivos eliminados
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = []
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 0)
        mock_bucket.list.assert_called_once()
        mock_bucket.remove.assert_not_called()

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_archivos_dentro_del_periodo(self, mock_config, mock_storage):
        """
        TC-002: Verificar que no elimina archivos recientes
        Entrada: Archivos creados hace 30 días (dentro del periodo)
        Salida esperada: 0 archivos eliminados
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        fecha_reciente = (datetime.now() - timedelta(days=30)).isoformat() + 'Z'
        
        archivos_mock = [
            {'name': 'archivo1.jpg', 'created_at': fecha_reciente},
            {'name': 'archivo2.jpg', 'created_at': fecha_reciente}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 0)
        mock_bucket.remove.assert_not_called()

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_archivos_antiguos_exitoso(self, mock_config, mock_storage):
        """
        TC-003: Verificar eliminación exitosa de archivos antiguos
        Entrada: Archivos creados hace 70 días (fuera del periodo)
        Salida esperada: 2 archivos eliminados
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        fecha_antigua = (datetime.now() - timedelta(days=70)).isoformat() + 'Z'
        
        archivos_mock = [
            {'name': 'archivo_viejo1.jpg', 'created_at': fecha_antigua},
            {'name': 'archivo_viejo2.jpg', 'created_at': fecha_antigua}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 2)
        self.assertEqual(mock_bucket.remove.call_count, 2)
        mock_bucket.remove.assert_any_call(['archivo_viejo1.jpg'])
        mock_bucket.remove.assert_any_call(['archivo_viejo2.jpg'])

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_archivos_mixtos(self, mock_config, mock_storage):
        """
        TC-004: Verificar eliminación selectiva (mezcla de antiguos y recientes)
        Entrada: 2 archivos antiguos y 2 recientes
        Salida esperada: 2 archivos eliminados (solo los antiguos)
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        now_utc = datetime.now(timezone.utc)
        fecha_antigua = (now_utc - timedelta(days=70)).isoformat().replace('+00:00', 'Z')
        fecha_reciente = (now_utc - timedelta(days=30)).isoformat().replace('+00:00', 'Z')
        
        archivos_mock = [
            {'name': 'viejo1.jpg', 'created_at': fecha_antigua},
            {'name': 'reciente1.jpg', 'created_at': fecha_reciente},
            {'name': 'viejo2.jpg', 'created_at': fecha_antigua},
            {'name': 'reciente2.jpg', 'created_at': fecha_reciente}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 2)
        self.assertEqual(mock_bucket.remove.call_count, 2)
        mock_bucket.remove.assert_any_call(['viejo1.jpg'])
        mock_bucket.remove.assert_any_call(['viejo2.jpg'])

    # ==========================================
    # PRUEBAS DE CASOS LÍMITE
    # ==========================================

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_archivo_justo_en_limite(self, mock_config, mock_storage):
        """
        TC-005: Verificar comportamiento en el límite exacto
        Entrada: Archivo creado exactamente hace 59 días
        Salida esperada: 0 archivos eliminados (aún dentro del período de retención)
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        now_utc = datetime.now(timezone.utc)
        fecha_limite = (now_utc - timedelta(days=59)).isoformat().replace('+00:00', 'Z')
        
        archivos_mock = [
            {'name': 'archivo_limite.jpg', 'created_at': fecha_limite}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 0)
        mock_bucket.remove.assert_not_called()

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_archivos_sin_fecha(self, mock_config, mock_storage):
        """
        TC-006: Verificar manejo de archivos sin fecha de creación
        Entrada: Archivos sin campo 'created_at'
        Salida esperada: 0 archivos eliminados (ignora archivos sin fecha)
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        
        archivos_mock = [
            {'name': 'archivo_sin_fecha1.jpg'},
            {'name': 'archivo_sin_fecha2.jpg', 'created_at': None}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 0)
        mock_bucket.remove.assert_not_called()

    @patch('services.evidencia_service.supabase_storage')
    @patch('config.Config')
    def test_limpiar_con_dias_retencion_personalizados(self, mock_config_class, mock_storage):
        """
        TC-007: Verificar funcionamiento con días de retención personalizados
        Entrada: EVIDENCIAS_RETENCION_DIAS = 30
        Salida esperada: Elimina archivos mayores a 30 días
        """
        # Arrange
        mock_config_class.EVIDENCIAS_RETENCION_DIAS = 30
        now_utc = datetime.now(timezone.utc)
        fecha_antigua = (now_utc - timedelta(days=45)).isoformat().replace('+00:00', 'Z')
        
        archivos_mock = [
            {'name': 'archivo_45dias.jpg', 'created_at': fecha_antigua}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 1)
        mock_bucket.remove.assert_called_once_with(['archivo_45dias.jpg'])

    # ==========================================
    # PRUEBAS DE MANEJO DE ERRORES
    # ==========================================

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_error_al_listar_archivos(self, mock_config, mock_storage):
        """
        TC-008: Verificar manejo de error al listar archivos
        Entrada: Error en bucket.list()
        Salida esperada: 0 archivos eliminados, sin excepción
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        mock_bucket = MagicMock()
        mock_bucket.list.side_effect = Exception("Error de conexión")
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 0)

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_error_al_eliminar_archivo(self, mock_config, mock_storage):
        """
        TC-009: Verificar manejo de error al eliminar un archivo específico
        Entrada: Error en bucket.remove() para un archivo
        Salida esperada: Continúa con otros archivos, retorna cuenta parcial
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        fecha_antigua = (datetime.now() - timedelta(days=70)).isoformat() + 'Z'
        
        archivos_mock = [
            {'name': 'archivo1.jpg', 'created_at': fecha_antigua},
            {'name': 'archivo2.jpg', 'created_at': fecha_antigua}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        # Primer remove falla, segundo tiene éxito
        mock_bucket.remove.side_effect = [Exception("Error al eliminar"), None]
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        # Debería fallar completamente y retornar 0 debido al try-except global
        self.assertEqual(resultado, 0)

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_sin_config_dias_retencion(self, mock_config, mock_storage):
        """
        TC-010: Verificar valor por defecto cuando no existe EVIDENCIAS_RETENCION_DIAS
        Entrada: Config sin EVIDENCIAS_RETENCION_DIAS
        Salida esperada: Usa valor por defecto de 60 días
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = None
        fecha_antigua = (datetime.now() - timedelta(days=70)).isoformat() + 'Z'
        
        archivos_mock = [
            {'name': 'archivo_viejo.jpg', 'created_at': fecha_antigua}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        with patch('services.evidencia_service.getattr', return_value=60):
            resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 1)

    # ==========================================
    # PRUEBAS DE VOLUMEN
    # ==========================================

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_gran_cantidad_archivos(self, mock_config, mock_storage):
        """
        TC-011: Verificar rendimiento con gran cantidad de archivos
        Entrada: 100 archivos antiguos
        Salida esperada: 100 archivos eliminados
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        fecha_antigua = (datetime.now() - timedelta(days=70)).isoformat() + 'Z'
        
        # Generar 100 archivos antiguos
        archivos_mock = [
            {'name': f'archivo_{i}.jpg', 'created_at': fecha_antigua}
            for i in range(100)
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 100)
        self.assertEqual(mock_bucket.remove.call_count, 100)

    # ==========================================
    # PRUEBAS DE FORMATO DE FECHA
    # ==========================================

    @patch('services.evidencia_service.supabase_storage')
    @patch('services.evidencia_service.Config')
    def test_limpiar_fecha_formato_iso(self, mock_config, mock_storage):
        """
        TC-012: Verificar manejo de fecha en formato ISO con Z
        Entrada: Fecha con formato ISO estándar
        Salida esperada: Parseo correcto y eliminación
        """
        # Arrange
        mock_config.EVIDENCIAS_RETENCION_DIAS = 60
        fecha_antigua = (datetime.now() - timedelta(days=70)).isoformat() + 'Z'
        
        archivos_mock = [
            {'name': 'archivo.jpg', 'created_at': fecha_antigua}
        ]
        
        mock_bucket = MagicMock()
        mock_bucket.list.return_value = archivos_mock
        mock_storage.storage.from_.return_value = mock_bucket

        # Act
        resultado = EvidenciaService.limpiar_evidencias_antiguas()

        # Assert
        self.assertEqual(resultado, 1)


# ==========================================
# SUITE DE PRUEBAS
# ==========================================

def suite():
    """
    Crea una suite con todas las pruebas
    """
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestLimpiarEvidenciasAntiguas))
    return suite


if __name__ == '__main__':
    # Ejecutar pruebas con verbosidad
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite())
