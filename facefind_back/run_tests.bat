@echo off
echo ================================================
echo   FACEFIND - Suite de Pruebas de Autenticacion
echo ================================================
echo.

cd /d "%~dp0"

echo Verificando que el servidor este corriendo...
echo.

curl -s http://localhost:5000/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] El servidor no esta corriendo en http://localhost:5000
    echo.
    echo Por favor ejecuta primero: start_server.bat
    echo O ejecuta manualmente: python app.py
    echo.
    pause
    exit /b 1
)

echo [OK] Servidor detectado
echo.
echo ================================================
echo   Ejecutando tests automatizados...
echo ================================================
echo.

python test_auth.py

echo.
echo ================================================
echo   Tests completados
echo ================================================
echo.
pause
