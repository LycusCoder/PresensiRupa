#!/usr/bin/env python3
"""
Simple Flask runner script
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("🐻 Starting Smart Presence Flask Server...")
print("=" * 60)

try:
    from app import app
    print("✅ App imported successfully")
    print("📍 Starting server on http://0.0.0.0:5000")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)
except Exception as e:
    print(f"❌ Error starting Flask: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
