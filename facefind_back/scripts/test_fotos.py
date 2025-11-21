from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
print("Key length:", len(key))

supabase = create_client(url, key)
res = supabase.storage.from_("fotos-referencia").list()
print(res)
