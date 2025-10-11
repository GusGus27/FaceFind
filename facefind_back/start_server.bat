@echo off
echo ================================================
echo   FACEFIND - Inicio del Servidor Backend
echo ================================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando entorno...
if not exist ".env" (
    echo [ERROR] Archivo .env no encontrado
    echo Por favor crea el archivo .env con:
    echo   SUPABASE_URL=tu_url
    echo   SUPABASE_KEY=tu_key
    pause
    exit /b 1
)

echo [OK] Archivo .env encontrado
echo.

echo [2/3] Verificando dependencias...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo [INSTALANDO] Dependencias faltantes...
    pip install -r requirements.txt
) else (
    echo [OK] Dependencias instaladas
)
echo.

echo [3/3] Iniciando servidor...
echo.
echo ================================================
echo   Servidor iniciando en http://localhost:5000
echo ================================================
echo.
echo Endpoints disponibles:
echo   POST /auth/signup    - Registrar usuario
echo   POST /auth/signin    - Iniciar sesion
echo   POST /auth/signout   - Cerrar sesion
echo   GET  /health         - Estado del servicio
echo.
echo Presiona Ctrl+C para detener el servidor
echo ================================================
echo.

python app.py

pause
