"""
Cliente de Supabase centralizado
"""
from supabase import create_client
from config import Config

# Crear cliente Supabase usando configuración centralizada
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def get_supabase_client():
    """
    Retorna una instancia del cliente Supabase.
    Útil para scripts independientes y módulos que necesiten su propia instancia.
    """
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)