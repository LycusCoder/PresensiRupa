@echo off
REM PresensiRupa - Development Mode for Windows
REM Start both services with better output formatting

setlocal enabledelayedexpansion

cls

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║            🚀 PresensiRupa - Development Environment 🚀        ║
echo ║                                                                  ║
echo ║  This script will start both backend and frontend with          ║
echo ║  auto-reload enabled for development.                          ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

set "SCRIPT_DIR=%cd%"
echo 📍 Project Location: %SCRIPT_DIR%
echo.

REM Check if venv already exists
if exist "venv\" (
    echo ✅ Virtual environment found!
) else (
    echo Virtual environment not found. Checking Python version...
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set "PYTHON_VERSION=%%i"

    REM Extract major.minor version
    for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
        set "MAJOR=%%a"
        set "MINOR=%%b"
    )
    set "MAJOR_MINOR=%MAJOR%.%MINOR%"

    if not "%MAJOR_MINOR%"=="3.11" (
        echo.
        echo ❌ Python version mismatch!
        echo Current version: %PYTHON_VERSION%
        echo Required version: 3.11.x
        echo.
        echo Options:
        echo   1. Install Python 3.11 from: https://www.python.org/downloads/
        echo   2. Continue anyway at your own risk (may cause compatibility issues)
        echo.
        set /p CONTINUE="Continue with Python %PYTHON_VERSION%? (y/n): "
        if /i not "!CONTINUE!"=="y" (
            echo.
            echo Setup cancelled.
            pause
            exit /b 1
        )
        echo.
        echo ⚠️  Proceeding with Python %PYTHON_VERSION% (not recommended)
        echo.
    ) else (
        echo ✅ Python %PYTHON_VERSION% is correct!
        echo.
    )

    echo Creating Python virtual environment with Python 3.11...
    python3.11 -m venv venv
)

call venv\Scripts\activate.bat

REM Check dependencies
echo Checking pip dependencies...
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt >nul 2>&1
    echo ✅ Python dependencies installed
) else (
    echo ✅ Python dependencies found
)

echo Checking npm dependencies...
if not exist "frontend\node_modules\" (
    echo Installing frontend dependencies (this may take a moment^)...
    cd frontend
    call npm install
    if errorlevel 1 (
        cd ..
        echo ❌ npm install failed!
        echo Troubleshooting:
        echo   1. Check npm is installed: npm --version
        echo   2. Check Node.js version: node --version
        echo   3. Try again: rmdir /s /q frontend\node_modules ^&^& dev.bat
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies found
)
)

echo ✅ All dependencies ready
echo.

REM Show info
echo ════════════════════════════════════════════════════════════════
echo SERVICES STARTING:
echo ════════════════════════════════════════════════════════════════
echo.
echo   Backend:  FastAPI on port 8001
echo            ^ http://localhost:8001
echo            ^ http://localhost:8001/docs (API Documentation)
echo.
echo   Frontend: Vite React on port 5173
echo            ^ http://localhost:5173
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo ⏱️  Services starting... (Press Ctrl+C to stop)
echo.

REM Start both services
echo 🔄 Starting Backend...
start "Backend - PresensiRupa" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"

REM Wait for backend
timeout /t 3 /nobreak

echo 🔄 Starting Frontend...
cd frontend
start "Frontend - PresensiRupa" cmd /k "npm run dev"
cd ..

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Backend and Frontend are running!
echo ════════════════════════════════════════════════════════════════
echo.
echo 💡 Tips:
echo    • Edit Python files to auto-reload backend
echo    • Edit React files to auto-reload frontend
echo    • Close the windows or press Ctrl+C to stop services
echo.
echo Open your browser at:
echo   → Frontend: http://localhost:5173
echo   → Backend API Docs: http://localhost:8001/docs
echo.
pause
