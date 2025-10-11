"""
Servicio para gestionar encodings en Supabase Storage
"""
import os
from services.supabase_client import supabase

BUCKET_NAME = "face-encodings"
FILE_NAME = "encodings.pickle"

def upload_encodings_to_cloud(local_path: str = "encodings.pickle") -> dict:
    """
    Sube el archivo de encodings a Supabase Storage
    """
    try:
        if not os.path.exists(local_path):
            return {"success": False, "error": "Archivo no encontrado"}
        
        # Leer archivo
        with open(local_path, 'rb') as f:
            file_data = f.read()
        
        # Verificar si existe y eliminarlo
        try:
            files = supabase.storage.from_(BUCKET_NAME).list()
            if any(f['name'] == FILE_NAME for f in files):
                supabase.storage.from_(BUCKET_NAME).remove([FILE_NAME])
        except:
            pass
        
        # Subir archivo
        supabase.storage.from_(BUCKET_NAME).upload(
            FILE_NAME,
            file_data,
            file_options={"content-type": "application/octet-stream"}
        )
        
        return {"success": True, "size": len(file_data)}
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def download_encodings_from_cloud(local_path: str = "encodings.pickle") -> dict:
    """
    Descarga el archivo de encodings desde Supabase Storage
    """
    try:
        # Descargar archivo
        data = supabase.storage.from_(BUCKET_NAME).download(FILE_NAME)
        
        if not data:
            return {"success": False, "error": "Archivo no encontrado"}
        
        # Guardar localmente
        with open(local_path, 'wb') as f:
            f.write(data)
        
        return {
            "success": True,
            "size": len(data),
            "local_path": local_path
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def sync_encodings(direction: str = "both") -> dict:
    """
    Sincroniza encodings entre local y nube
    
    Args:
        direction: 'upload', 'download', o 'both'
    
    Returns:
        Dict con resultado
    """
    results = {
        "success": True,
        "operations": []
    }
    
    if direction in ["upload", "both"]:
        upload_result = upload_encodings_to_cloud()
        results["operations"].append({
            "operation": "upload",
            "result": upload_result
        })
        if not upload_result["success"]:
            results["success"] = False
    
    if direction in ["download", "both"]:
        download_result = download_encodings_from_cloud()
        results["operations"].append({
            "operation": "download",
            "result": download_result
        })
        if not download_result["success"]:
            results["success"] = False
    
    return results

def get_encodings_status() -> dict:
    """
    Obtiene el estado de los encodings (local y nube)
    
    Returns:
        Dict con información de estado
    """
    local_path = "encodings.pickle"
    
    status = {
        "local": {
            "exists": os.path.exists(local_path),
            "size": os.path.getsize(local_path) if os.path.exists(local_path) else 0
        },
        "cloud": {
            "exists": False,
            "size": 0
        }
    }
    
    try:
        files = supabase.storage.from_(BUCKET_NAME).list()
        
        for file in files:
            if file['name'] == FILE_NAME:
                status["cloud"]["exists"] = True
                status["cloud"]["size"] = file.get('metadata', {}).get('size', 0)
                break
                
    except Exception as e:
        status["cloud"]["error"] = str(e)
    
    return status
