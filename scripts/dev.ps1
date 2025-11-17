# PresensiRupa - Development Mode for Windows (PowerShell)
# Start both services with better output formatting

Clear-Host

Write-Host "╔══════════════════════════════════════════════════════════════════╗"
Write-Host "║                                                                  ║"
Write-Host "║            🚀 PresensiRupa - Development Environment 🚀        ║"
Write-Host "║                                                                  ║"
Write-Host "║  This script will start both backend and frontend with          ║"
Write-Host "║  auto-reload enabled for development.                          ║"
Write-Host "║                                                                  ║"
Write-Host "╚══════════════════════════════════════════════════════════════════╝"
Write-Host ""

# Project root is the current directory, where this script is expected to be run from.
# All paths are relative to this location.
Write-Host "📍 Project Location: (Current Directory)"
Write-Host ""

# --- Environment Setup ---
$DevEnvFile = ".env.development"
$TargetEnvFile = ".env"
if (Test-Path $DevEnvFile) {
    Copy-Item -Path $DevEnvFile -Destination $TargetEnvFile -Force
    Write-Host "✅ Development environment (.env.development) loaded."
} else {
    Write-Host "⚠️ .env.development not found. Using default settings." -ForegroundColor Yellow
}
Write-Host ""


# --- Virtual Environment Setup ---
$VenvPath = ".venv"

if (Test-Path $VenvPath) {
    Write-Host "✅ Virtual environment found!"
} else {
    Write-Host "Virtual environment not found. Checking Python version..."
    try {
        $pythonVersion = (python --version 2>&1).Split(" ")[1]
        $majorMinor = $pythonVersion.Substring(0, 4)

        if ($majorMinor -ne "3.11") {
            Write-Host ""
            Write-Host "❌ Python version mismatch!" -ForegroundColor Red
            Write-Host "Current version: $pythonVersion"
            Write-Host "Required version: 3.11.x"
            Write-Host ""
            $choice = Read-Host "Continue with Python $pythonVersion? (y/n)"
            if ($choice -ne 'y') {
                Write-Host "Setup cancelled."
                exit
            }
            Write-Host "⚠️  Proceeding with Python $pythonVersion (not recommended)" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Python $pythonVersion is correct!"
        }
        
        Write-Host "Creating Python virtual environment..."
        python -m venv $VenvPath
    } catch {
        Write-Host "❌ Python is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Please install Python 3.11 from: https://www.python.org/downloads/"
        exit
    }
}

# --- Activate Virtual Environment ---
$activateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    . $activateScript
    Write-Host "✅ Virtual environment activated."
} else {
    Write-Host "❌ Activation script not found at $activateScript" -ForegroundColor Red
    exit
}


# --- Dependency Checks ---
# Check pip dependencies
Write-Host "Checking pip dependencies..."
pip install -r requirements.txt --quiet
Write-Host "✅ Python dependencies are up to date."


# Check npm dependencies
Write-Host "Checking npm dependencies..."
$nodeModulesPath = "frontend\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing frontend dependencies (this may take a moment)..."
    Push-Location "frontend"
npm install --quiet
    Pop-Location
    Write-Host "✅ Frontend dependencies installed"
} else {
    Write-Host "✅ Frontend dependencies found"
}

Write-Host "✅ All dependencies ready"
Write-Host ""

# --- Log Setup ---
$LogDir = "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory | Out-Null
}

# --- Start Services ---
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "SERVICES STARTING IN BACKGROUND:"
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""

# Start Backend
$BackendLog = Join-Path $LogDir "backend.log"
Write-Host "🔄 Starting Backend... Log available at logs\backend.log"
$PythonwPath = Join-Path $VenvPath "Scripts\python.exe"
if (-not (Test-Path $PythonwPath)) {
    Write-Host "⚠️ pythonw.exe not found, falling back to python.exe" -ForegroundColor Yellow
    $PythonwPath = Join-Path $VenvPath "Scripts\python.exe"
}
$BackendCommand = "-m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 --no-use-colors"
Start-Process -FilePath $PythonwPath -ArgumentList $BackendCommand -RedirectStandardOutput $BackendLog -NoNewWindow

# Wait a bit
Start-Sleep -Seconds 3

# Start Frontend
$FrontendLog = Join-Path $LogDir "frontend.log"
Write-Host "🔄 Starting Frontend... Log available at logs\frontend.log"
$FrontendDir = "frontend"
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $FrontendDir -RedirectStandardOutput $FrontendLog -NoNewWindow

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host "✅ Backend and Frontend are running in the background."
Write-Host "════════════════════════════════════════════════════════════════"
Write-Host ""
Write-Host "💡 Tips:"
Write-Host "   • Monitor logs: Get-Content logs\backend.log -Wait -Tail 10"
Write-Host "   • To stop all services, run the 'scripts\kill.ps1' script."
Write-Host ""
Write-Host "Open your browser at:"
Write-Host "  → Frontend: http://localhost:5173"
Write-Host "  → Backend API Docs: http://localhost:8001/docs"
Write-Host ""