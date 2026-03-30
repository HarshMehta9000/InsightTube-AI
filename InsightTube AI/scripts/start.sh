#!/bin/bash

# YouTube AI Data Engineering Analysis Platform Start Script
# This script starts the platform services

set -e

echo "🚀 Starting YouTube AI Data Engineering Analysis Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup.sh first or create .env file manually."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
print_status "Starting platform services..."
docker-compose up -d

print_success "Platform services started successfully!"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Display service status
echo ""
echo "📊 Platform Status:"
docker-compose ps

echo ""
echo "🌐 Service URLs:"
echo "  • Dashboard: http://localhost:8501"
echo "  • API Docs: http://localhost:8000/docs"
echo "  • Jupyter: http://localhost:8888"
echo "  • MLflow: http://localhost:5000"
echo "  • Airflow: http://localhost:8081"
echo "  • Grafana: http://localhost:3000"
echo "  • Prometheus: http://localhost:9090"
echo "  • Spark: http://localhost:8080"
echo "  • Elasticsearch: http://localhost:9200"
echo "  • Kibana: http://localhost:5601"

echo ""
echo "✅ Platform is ready! Access the dashboard at http://localhost:8501"

python ingestion_service.py
python batch_processor.py
