#!/bin/bash

# Test script to demonstrate version checking logic

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
REQUIRED_VERSION="3.11"
MAJOR_MINOR=$(echo $PYTHON_VERSION | cut -d. -f1-2)

echo "════════════════════════════════════════"
echo "Python Version Check Test"
echo "════════════════════════════════════════"
echo ""
echo "Current Python: $PYTHON_VERSION"
echo "Major.Minor: $MAJOR_MINOR"
echo "Required: $REQUIRED_VERSION"
echo ""

if [ "$MAJOR_MINOR" != "$REQUIRED_VERSION" ]; then
    echo "Result: ❌ MISMATCH"
    echo "Action: Show warning & ask user"
else
    echo "Result: ✅ MATCH"
    echo "Action: Continue normally"
fi

echo ""
echo "════════════════════════════════════════"
