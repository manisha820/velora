@echo off
title VELORA Maison - Local Server Launcher
echo ===================================================
echo   VELORA MAISON - SECURE LOCAL CONCIERGE SERVER
echo ===================================================
echo.
echo Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this computer.
    echo Please install Node.js from https://nodejs.org/ to run the server.
    pause
    exit /b
)

if not exist "node_modules\" (
    echo [INFO] Installing required server packages (http-server)...
    call npm install
)

echo [INFO] Starting your local luxury server at http://127.0.0.1:8080 ...
echo [INFO] Press Ctrl+C in this window to stop hosting.
echo.
start http://127.0.0.1:8080/index.html
call npm start
pause
