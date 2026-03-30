#!/bin/bash

# Stop script for YouTube AI Data Engineering Platform (Simple Mode)

echo "🛑 Stopping YouTube AI Data Engineering Platform..."

# Check if PID files exist
if [ -f .api_pid ]; then
    API_PID=$(cat .api_pid)
    if kill -0 $API_PID 2>/dev/null; then
        echo "Stopping API backend (PID: $API_PID)..."
        kill $API_PID
    else
        echo "API backend process not found."
    fi
    rm -f .api_pid
else
    echo "No API PID file found."
fi

if [ -f .dashboard_pid ]; then
    DASHBOARD_PID=$(cat .dashboard_pid)
    if kill -0 $DASHBOARD_PID 2>/dev/null; then
        echo "Stopping Streamlit dashboard (PID: $DASHBOARD_PID)..."
        kill $DASHBOARD_PID
    else
        echo "Dashboard process not found."
    fi
    rm -f .dashboard_pid
else
    echo "No dashboard PID file found."
fi

# Also try to kill any remaining processes on the ports
echo "Cleaning up port usage..."

# Kill processes on port 8000 (API)
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "Killing processes on port 8000..."
    lsof -ti:8000 | xargs kill -9
fi

# Kill processes on port 8501 (Dashboard)
if lsof -ti:8501 > /dev/null 2>&1; then
    echo "Killing processes on port 8501..."
    lsof -ti:8501 | xargs kill -9
fi

echo "✅ Platform stopped successfully!"
echo "💡 To start again, run: ./scripts/start_simple.sh"
