from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

with open("alejo_1.jpg", "rb") as f:
    res = supabase.storage.from_("fotos-referencia").upload("scripts/alejo_1.jpg", f)

print(res)
