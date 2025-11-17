#!/bin/bash

# PresensiRupa - Full Stack Development Mode
# Start both services with live reload in one command
# This version shows logs from both services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get the script's directory, resolve the project root, and set it as current location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Welcome message
clear
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║            🚀 PresensiRupa - Development Environment 🚀        ║
║                                                                  ║
║  This script will start both backend and frontend with          ║
║  auto-reload enabled for development.                          ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📍 Project Location: $PROJECT_ROOT${NC}"
echo ""

# --- Environment Setup ---
if [ -f ".env.development" ]; then
    cp .env.development .env
    echo -e "${GREEN}✅ Development environment (.env.development) loaded.${NC}"
else
    echo -e "${YELLOW}⚠️ .env.development not found. Using default settings.${NC}"
fi
echo ""

# Check if venv already exists
if [ -d "venv" ]; then
    echo -e "${GREEN}✅ Virtual environment found!${NC}"
    echo -e "${YELLOW}Activating venv...${NC}"
    source venv/bin/activate
else
    # Only check Python version if creating new venv
    echo -e "${YELLOW}Virtual environment not found. Checking Python version...${NC}"
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    REQUIRED_VERSION="3.11"

    # Extract major and minor version
    MAJOR_MINOR=$(echo $PYTHON_VERSION | cut -d. -f1-2)

    if [ "$MAJOR_MINOR" != "$REQUIRED_VERSION" ]; then
        echo -e "${RED}❌ Python version mismatch!${NC}"
        echo -e "${YELLOW}Current version: $PYTHON_VERSION${NC}"
        echo -e "${YELLOW}Required version: $REQUIRED_VERSION.x${NC}"
        echo ""
        echo -e "${CYAN}Options:${NC}"
        echo "  1. Install Python 3.11 from: https://www.python.org/downloads/"
        echo "  2. Use python3.11 command if installed: ${BLUE}python3.11 -m venv venv${NC}"
        echo "  3. Continue anyway at your own risk (may cause compatibility issues)"
        echo ""
        read -p "Continue with Python $PYTHON_VERSION? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Setup cancelled.${NC}"
            exit 1
        fi
        echo -e "${YELLOW}⚠️  Proceeding with Python $PYTHON_VERSION (not recommended)${NC}"
        echo ""
    else
        echo -e "${GREEN}✅ Python $PYTHON_VERSION is correct!${NC}"
        echo ""
    fi

    # Create venv with Python 3.11
    echo -e "${YELLOW}Creating Python virtual environment with Python 3.11...${NC}"
    python3.11 -m venv venv
    
    # Activate venv
    source venv/bin/activate
fi

# --- Dependency Checks ---
echo -e "${YELLOW}Checking dependencies...${NC}"
pip install -r requirements.txt --quiet
echo -e "${GREEN}✅ Python dependencies are up to date.${NC}"

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies (this may take a moment)...${NC}"
    (cd frontend && npm install --quiet)
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies found${NC}"
fi
echo -e "${GREEN}✅ All dependencies ready${NC}"
echo ""

# --- Log Setup ---
mkdir -p logs

# --- Start Services ---
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SERVICES STARTING IN BACKGROUND:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Function for cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
    echo -e "${RED}🛑 Stopping all services...${NC}"
    # Kill all child processes
    pkill -P $$ || true
    sleep 1
    echo -e "${GREEN}✅ All services stopped${NC}"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "🔄 Starting Backend... Log available at logs/backend.log"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001 > logs/backend.log 2>&1 &
BACKEND_PID=$!

sleep 2

# Start frontend
echo -e "🔄 Starting Frontend... Log available at logs/frontend.log"
(cd frontend && npm run dev) > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Backend and Frontend are running in the background.${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}💡 Tips:${NC}"
echo -e "   • Monitor logs: tail -f logs/backend.log"
echo -e "   • Use Ctrl+C in this terminal to stop all services gracefully."
echo ""
echo -e "Open your browser at:"
echo -e "  → Frontend: http://localhost:5173"
echo -e "  → Backend API Docs: http://localhost:8001/docs"
echo ""

# Wait for child processes to be stopped
wait
