"""
Script para limpiar evidencias antiguas del Storage
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.evidencia_service import EvidenciaService

def main():
    """Ejecutar limpieza de evidencias antiguas"""
    print("🧹 Iniciando limpieza de evidencias antiguas...")
    
    archivos_eliminados = EvidenciaService.limpiar_evidencias_antiguas()
    
    print(f"\n✅ Limpieza completada")
    print(f"   Archivos eliminados: {archivos_eliminados}")

if __name__ == "__main__":
    main()
