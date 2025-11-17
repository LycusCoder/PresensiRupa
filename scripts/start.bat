@echo off
REM PresensiRupa - Full Stack Startup Script for Windows
REM Start both backend and frontend
REM Usage: start.bat

setlocal enabledelayedexpansion

REM Colors in Windows (using findstr for colored output)
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║              PresensiRupa - Full Stack Startup                  ║
echo ║                Smart Attendance System v1.0                     ║
echo ║                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Get current directory
set "SCRIPT_DIR=%cd%"
echo 📍 Working Directory: %SCRIPT_DIR%
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

    echo 🔧 Creating virtual environment with Python 3.11...
    python3.11 -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔧 Activating Python virtual environment...
call venv\Scripts\activate.bat
echo ✅ Virtual environment activated
echo.

REM Check dependencies
echo Checking npm dependencies...
if not exist "frontend\node_modules\" (
    echo 🔧 Installing frontend dependencies (this may take a moment^)...
    cd frontend
    call npm install
    if errorlevel 1 (
        cd ..
        echo ❌ npm install failed!
        echo Troubleshooting:
        echo   1. Check npm is installed: npm --version
        echo   2. Check Node.js version: node --version
        echo   3. Try again: rmdir /s /q frontend\node_modules ^&^& start.bat
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies found
)

echo Checking pip dependencies...

REM Check if Python packages are installed
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo 🔧 Installing Python dependencies...
    pip install -r requirements.txt >nul 2>&1
    echo ✅ Python dependencies installed
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ All checks passed! Starting services...
echo ═══════════════════════════════════════════════════════════════
echo.

REM Show startup info
echo 📋 Services Starting:
echo   🔵 Backend (FastAPI)  = http://localhost:8001
echo   🟢 Frontend (Vite)    = http://localhost:5173
echo   📚 API Documentation  = http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop all services
echo.
echo ════════════════════════════════════════════════════════════════
echo.

REM Start backend in separate window
echo 🔄 Starting Backend (FastAPI)...
start "PresensiRupa Backend" cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"
echo ✅ Backend started in new window

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start frontend in separate window
echo 🔄 Starting Frontend (Vite)...
cd frontend
start "PresensiRupa Frontend" cmd /k "npm run dev"
cd ..
echo ✅ Frontend started in new window

echo.
echo ════════════════════════════════════════════════════════════════
echo ✅ Both services are running!
echo ════════════════════════════════════════════════════════════════
echo.
echo 🌐 Open your browser:
echo   → Frontend: http://localhost:5173
echo   → Backend API Docs: http://localhost:8001/docs
echo.
echo Close this window or press any key when done...
pause
