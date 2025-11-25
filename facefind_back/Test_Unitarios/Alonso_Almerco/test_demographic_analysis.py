"""
PRUEBAS UNITARIAS - FUNCIÓN: get_demographic_analysis()
Servicio: StatisticsService
Módulo: services/statistics_service.py

PROPÓSITO: Pruebas de caja blanca y caja negra para la función get_demographic_analysis()
"""

import pytest
from unittest.mock import patch, MagicMock
from services.statistics_service import StatisticsService



class TestDemographicAnalysisWhiteBox:

    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_whitebox_camino1_exitoso_con_datos(self, mock_repo):
        """CAMINO 1: Ejecución exitosa con grupos de edad"""
        # ARRANGE
        mock_repo.return_value = {
            "0-18": 5,
            "18-30": 12,
            "30-50": 8,
            "50+": 3
        }
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        assert resultado["total_cases"] == 28
        assert resultado["age_distribution"]["0-18"]["count"] == 5
        assert abs(resultado["age_distribution"]["0-18"]["percentage"] - 17.9) < 0.1
        assert abs(resultado["age_distribution"]["18-30"]["percentage"] - 42.9) < 0.1
        assert "most_common_group" in resultado
        print("✓ CAMINO 1: Éxito con datos - PASÓ")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_whitebox_camino2_sin_datos(self, mock_repo):
        """CAMINO 2: Ejecución con dict vacío (total == 0)"""
        # ARRANGE
        mock_repo.return_value = {}
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        assert resultado["total_cases"] == 0
        assert resultado["age_distribution"] == {}
        assert resultado.get("most_common_group") is None
        print("✓ CAMINO 2: Sin datos - PASÓ")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_whitebox_camino3_excepcion_en_repository(self, mock_repo):
        """CAMINO 3: Manejo de excepciones"""
        # ARRANGE
        mock_repo.side_effect = Exception("Error en BD")
        
        # ACT & ASSERT
        with pytest.raises(Exception):
            StatisticsService.get_demographic_analysis()
        
        print("✓ CAMINO 3: Excepción - PASÓ")


class TestDemographicAnalysisBlackBox:

    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cv1_datos_completos_validos(self, mock_repo):
        """CASO VÁLIDO 1: Datos completos y válidos"""
        # ARRANGE
        mock_repo.return_value = {
            "0-18": 10,
            "18-30": 25,
            "30-50": 15,
            "50+": 5
        }
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        assert resultado["total_cases"] == 55
        assert len(resultado["age_distribution"]) == 4
        assert all("count" in v and "percentage" in v for v in resultado["age_distribution"].values())
        assert "most_common_group" in resultado
        print("✓ CV1: Datos completos - VÁLIDO")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cv2_un_solo_grupo(self, mock_repo):
        """CASO VÁLIDO 2: Un solo grupo de edad"""
        # ARRANGE
        mock_repo.return_value = {"18-30": 100}
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        assert resultado["total_cases"] == 100
        assert resultado["age_distribution"]["18-30"]["percentage"] == 100.0
        assert resultado.get("most_common_group") == "18-30"
        print("✓ CV2: Un grupo - VÁLIDO")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cv3_distribucion_variada(self, mock_repo):
        """CASO VÁLIDO 3: Distribución con porcentajes variados"""
        # ARRANGE
        mock_repo.return_value = {
            "0-18": 1,
            "18-30": 50,
            "30-50": 30,
            "50+": 19
        }
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        assert resultado["total_cases"] == 100
        assert resultado["age_distribution"]["0-18"]["percentage"] == 1.0
        assert resultado["age_distribution"]["18-30"]["percentage"] == 50.0
        assert sum(g["percentage"] for g in resultado["age_distribution"].values()) == 100.0
        print("✓ CV3: Distribución variada - VÁLIDO")
    
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cnv1_repository_retorna_none(self, mock_repo):
        """CASO NO VÁLIDO 1: Repository retorna None"""
        # ARRANGE
        mock_repo.return_value = None
        
        # ACT & ASSERT
        with pytest.raises((TypeError, AttributeError)):
            StatisticsService.get_demographic_analysis()
        
        print("✓ CNV1: None del repository - INVÁLIDO (error capturado)")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cnv2_valores_negativos(self, mock_repo):
        """CASO NO VÁLIDO 2: Valores negativos en count"""
        # ARRANGE
        mock_repo.return_value = {
            "18-30": -10,
            "30-50": 20
        }
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT - La función acepta valores negativos (sin validar)
        assert resultado["total_cases"] == 10
        assert resultado["age_distribution"]["18-30"]["percentage"] == -100.0  # Porcentaje negativo inválido
        print("✓ CNV2: Valores negativos - INVÁLIDO (sin validación)")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cnv3_tipos_datos_incorrectos(self, mock_repo):
        """CASO NO VÁLIDO 3: Tipos de datos incorrectos"""
        # ARRANGE
        mock_repo.return_value = {
            "18-30": "veinticinco",  # String en lugar de int
            "30-50": 20
        }
        
        # ACT & ASSERT
        with pytest.raises((TypeError, ValueError)):
            StatisticsService.get_demographic_analysis()
        
        print("✓ CNV3: Tipos incorrectos - INVÁLIDO (error capturado)")
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_caja_negra_cnv4_exception_en_repository(self, mock_repo):
        """CASO NO VÁLIDO 4: Repository lanza excepción"""
        # ARRANGE
        mock_repo.side_effect = Exception("Error de conexión BD")
        
        # ACT & ASSERT
        with pytest.raises(Exception):
            StatisticsService.get_demographic_analysis()
        
        print("✓ CNV4: Exception - INVÁLIDO (re-lanzado)")


# ============================================================================
# PRUEBAS DE INTEGRACIÓN
# ============================================================================

class TestDemographicAnalysisIntegration:
    """Pruebas que validan el flujo completo"""
    
    @patch('services.statistics_service.StatisticsRepository.get_cases_by_age_group')
    def test_integracion_flujo_completo_realista(self, mock_repo):
        """Prueba de integración: Datos realistas"""
        # ARRANGE
        mock_repo.return_value = {
            "0-18": 45,
            "18-30": 120,
            "30-50": 85,
            "50+": 50
        }
        
        # ACT
        resultado = StatisticsService.get_demographic_analysis()
        
        # ASSERT
        total = 45 + 120 + 85 + 50
        assert resultado["total_cases"] == total
        
        # Validar que los porcentajes sumen ~100%
        total_percentage = sum(g["percentage"] for g in resultado["age_distribution"].values())
        assert 99.9 <= total_percentage <= 100.1  # Permitir pequeños errores de redondeo
        
        # Validar que el grupo más común esté presente
        assert "most_common_group" in resultado
        
        print(f"✓ INTEGRACIÓN: Flujo completo - PASÓ")
        print(f"  Total casos: {resultado['total_cases']}")
        print(f"  Grupo más común: {resultado.get('most_common_group', 'N/A')}")
        print(f"  Distribución: {resultado['age_distribution']}")



if __name__ == "__main__":
    print("\n" + "="*70)
    print("EJECUTANDO PRUEBAS UNITARIAS - get_demographic_analysis()")
    print("="*70 + "\n")
    
    pytest.main([__file__, "-v", "-s"])
