import base64
import numpy as np

# ============================================================
# 🔹 FUNCIÓN 1: convertir texto Base64 → vector NumPy
# ============================================================
def base64_to_vector(b64_string: str) -> np.ndarray:
    """Convierte una cadena base64 a un vector NumPy (float64)."""
    vector_bytes = base64.b64decode(b64_string)
    vector = np.frombuffer(vector_bytes, dtype=np.float64)
    return vector


# ============================================================
# 🔹 FUNCIÓN 2: convertir vector NumPy → texto Base64
# ============================================================
def vector_to_base64(vector: np.ndarray) -> str:
    """Convierte un vector NumPy (float64) a cadena base64."""
    vector_bytes = vector.astype(np.float64).tobytes()
    b64_string = base64.b64encode(vector_bytes).decode("utf-8")
    return b64_string


# ============================================================
# 🔹 PRUEBA DE CONVERSIÓN (usando tu ejemplo)
# ============================================================

# Ejemplo: tu cadena base64 original
b64_string = """AAAAwBBMtb8AAADA0HvCPwAAACCO3H6/AAAAwPlgpL8AAABAz/rAvwAAAODAqJU/AAAAQC10sb8AAAAAoWuxvwAAAMAp38c/AAAAYGW7wL8AAADg1ljQPwAAAKCznZm/AAAA4JKL0L8AAADgHsl1PwAAAIANTnW/AAAAACUrvT8AAAAA8lXFvwAAAODQU8C/AAAAgCpJp78AAABAfTCuvwAAAKAk/qk/AAAAwNP4sj8AAABA/PqxPwAAAMDJmLc/AAAAwD2hsL8AAABAsAjVvwAAAGBM1b6/AAAAwGqiv78AAAAgyCa1PwAAAGA8cLC/AAAAgBAAfr8AAAAAtGydvwAAAIBqjLi/AAAAwFEpkD8AAAAAr5iVPwAAAAB4QkU/AAAAQCoqur8AAAAgsWa4vwAAAKBKOdQ/AAAAwPQefD8AAACACB7AvwAAAIC9YrG/AAAAAOG0sD8AAADgCQPOPwAAAKBOQcQ/AAAAIGT3qj8AAACAFQKrPwAAAED4asO/AAAAYMxwrT8AAACA9VnLvwAAAABQhLU/AAAAwGp7zT8AAACAYBjAPwAAAGAMN70/AAAAwAlZqz8AAAAgIkTIvwAAAIAh5Js/AAAAoOz9xj8AAADg7lnDvwAAAGCu58A/AAAAoHvuqj8AAACALVCjvwAAACDWlou/AAAAAPSgo78AAAAga6PTPwAAAGAtr7g/AAAAABHXwL8AAACAtHzEvwAAACArHsM/AAAAwBUwx78AAABAiUXEvwAAAKCxFsA/AAAAABJ4w78AAADgRS7QvwAAAOAqyc2/AAAAAOAUlT8AAAAgjt/XPwAAAOBaYMg/AAAAABOKw78AAAAAyCRyPwAAAGCcX6W/AAAAgDlHtb8AAACg5GC0PwAAAAAy4L4/AAAAgN/Ev78AAABA0nfDvwAAACA8gL6/AAAAgNT3ez8AAABAqCXPPwAAACAuwaa/AAAAQCG3qb8AAAAAmS/NPwAAAAAInqU/AAAAYEGatj8AAAAAbVdhvwAAAEAcfKk/AAAAwLE/qr8AAABAlzttPwAAAAAQY7u/AAAAAJEgfz8AAAAAhtp4vwAAAMALprW/AAAAIAsgqb8AAADA7c6zPwAAAACclMe/AAAAoOW+uz8AAACAw3F4vwAAAEBW3bS/AAAAgBNgqr8AAAAAsuh3vwAAAMB29MO/AAAA4Ep0gL8AAADgwmbMPwAAAGBkYdC/AAAAoHgDzj8AAAAATGPHPwAAAGDr9L4/AAAAoOajyD8AAADgD8C8PwAAAMBCRL4/AAAAgN6jlz8AAADAtVu5vwAAAEDVYMm/AAAAANhWp78AAAAA0zGoPwAAAIDRvJa/AAAAwFvrqT8AAACgEeumPw==
""".strip()

# 1️⃣ Texto → vector
vector = base64_to_vector(b64_string)
print("✅ Vector reconstruido (primeros 10 valores):")
print(vector[:10])
print("Dimensiones:", vector.shape)

# 2️⃣ Vector → texto (reverso)
b64_regenerado = vector_to_base64(vector)
print("\n✅ Cadena Base64 regenerada (primeros 100 caracteres):")
print(b64_regenerado[:100] + "...")

# 3️⃣ Comprobación: verificar igualdad
if b64_regenerado == b64_string:
    print("\n🎉 Conversión exacta: el texto original y regenerado son idénticos.")
else:
    print("\n⚠️ El texto regenerado difiere (puede haber espacios o saltos de línea).")
