#!/bin/bash

# YouTube AI Data Engineering Analysis Platform Stop Script
# This script stops the platform services

set -e

echo "🛑 Stopping YouTube AI Data Engineering Analysis Platform..."

# Colors for output
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running."
    exit 1
fi

# Stop services
print_status "Stopping platform services..."
docker-compose down

print_warning "Platform services stopped."

# Optional: Remove volumes (uncomment if you want to clear all data)
# print_status "Removing volumes..."
# docker-compose down -v

echo ""
echo "✅ Platform has been stopped successfully."
echo "💡 To start again, run: ./scripts/start.sh"
