#!/bin/bash

# Kill script untuk menghentikan semua services (backend + frontend)
# Usage: ./kill.sh

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║           🛑 Stopping PresensiRupa Services 🛑                    ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Kill uvicorn processes (backend)
if pgrep -f "uvicorn.*main.py" > /dev/null; then
    echo "⏹️  Stopping Backend (uvicorn)..."
    pkill -f "uvicorn.*main.py" || true
    sleep 1
    echo "✅ Backend stopped"
else
    echo "ℹ️  Backend tidak berjalan"
fi

# Kill vite processes (frontend)
if pgrep -f "vite" > /dev/null; then
    echo "⏹️  Stopping Frontend (vite)..."
    pkill -f "vite" || true
    sleep 1
    echo "✅ Frontend stopped"
else
    echo "ℹ️  Frontend tidak berjalan"
fi

# Kill node processes (fallback untuk npm)
if pgrep -f "node.*vite" > /dev/null; then
    echo "⏹️  Stopping Node (npm vite)..."
    pkill -f "node.*vite" || true
    sleep 1
    echo "✅ Node stopped"
fi

# Kill Python processes (fallback)
if pgrep -f "python.*main.py" > /dev/null; then
    echo "⏹️  Stopping Python processes..."
    pkill -f "python.*main.py" || true
    sleep 1
    echo "✅ Python stopped"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "✅ All services stopped successfully!"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Untuk memulai kembali, jalankan:"
echo "   ./dev.sh"
echo ""
