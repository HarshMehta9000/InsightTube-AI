#!/bin/bash

# Simple startup script for YouTube AI Data Engineering Platform (No Docker)
# This script runs the core components directly on your system

set -e

echo "🚀 Starting YouTube AI Data Engineering Platform (Simple Mode)..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning "No .env file found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        print_warning "Please edit .env with your API keys before continuing."
        print_warning "Press Enter when ready, or Ctrl+C to cancel..."
        read
    else
        print_warning "No environment template found. Some features may not work."
    fi
fi

# Check Python dependencies
print_status "Checking Python dependencies..."
if ! python3 -c "import streamlit, fastapi, langchain" 2>/dev/null; then
    print_warning "Some Python dependencies are missing. Installing..."
    pip install -r requirements.txt
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data logs temp

# Start the API backend in background
print_status "Starting FastAPI backend..."
cd apps/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
cd ../..

# Wait a moment for API to start
sleep 3

# Start the Streamlit dashboard
print_status "Starting Streamlit dashboard..."
cd apps/dashboard
PYTHONPATH="${PYTHONPATH}:$(pwd)/../.." python3 -m streamlit run main.py --server.port=8501 --server.address=0.0.0.0 &
DASHBOARD_PID=$!
cd ../..

# Store PIDs for cleanup
echo $API_PID > .api_pid
echo $DASHBOARD_PID > .dashboard_pid

# Wait a moment for dashboard to start
sleep 3

print_success "Platform started successfully!"
echo ""
echo "🌐 Service URLs:"
echo "  • Dashboard: http://localhost:8501"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • API Health: http://localhost:8000/health"
echo ""
echo "📝 To stop the platform:"
echo "  • Run: ./scripts/stop_simple.sh"
echo "  • Or manually kill processes: kill $API_PID $DASHBOARD_PID"
echo ""
echo "✅ Platform is ready! Access the dashboard at http://localhost:8501"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for user to stop
trap 'echo ""; print_warning "Stopping services..."; kill $API_PID $DASHBOARD_PID 2>/dev/null; rm -f .api_pid .dashboard_pid; exit 0' INT

# Keep script running
wait
