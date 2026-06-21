#!/bin/bash

# YouTube AI Data Engineering Analysis Platform Setup Script
# This script sets up the development environment and starts the platform

set -e

echo "🚀 Setting up YouTube AI Data Engineering Analysis Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if Python is installed
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION is installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data logs temp notebooks dags plugins
    mkdir -p infrastructure/{mongodb,postgres,prometheus,grafana}
    
    print_success "Directories created successfully"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.template ]; then
            cp env.template .env
            print_warning "Environment file created from template. Please edit .env with your actual values."
        else
            print_warning "No environment template found. Please create .env file manually."
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f requirements.txt ]; then
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
        print_success "Python dependencies installed successfully"
    else
        print_warning "requirements.txt not found. Skipping Python dependency installation."
    fi
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    docker-compose build --no-cache
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting platform services..."
    
    # Start core services first
    docker-compose up -d mongodb postgres redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 30
    
    # Start remaining services
    docker-compose up -d
    
    print_success "All services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Check API health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API is healthy"
    else
        print_warning "API health check failed"
    fi
    
    # Check dashboard
    if curl -f http://localhost:8501 > /dev/null 2>&1; then
        print_success "Dashboard is accessible"
    else
        print_warning "Dashboard health check failed"
    fi
    
    # Check databases
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_success "MongoDB is healthy"
    else
        print_warning "MongoDB health check failed"
    fi
    
    if docker-compose exec -T postgres pg_isready -U youtube_user > /dev/null 2>&1; then
        print_success "PostgreSQL is healthy"
    else
        print_warning "PostgreSQL health check failed"
    fi
}

# Display service URLs
display_urls() {
    echo ""
    echo "🎉 Platform setup completed successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "  • API Documentation: http://localhost:8000/docs"
    echo "  • API Health Check: http://localhost:8000/health"
    echo "  • Dashboard: http://localhost:8501"
    echo "  • Jupyter Notebook: http://localhost:8888"
    echo "  • MLflow: http://localhost:5000"
    echo "  • Airflow: http://localhost:8081"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Grafana: http://localhost:3000"
    echo "  • Spark Master: http://localhost:8080"
    echo "  • Elasticsearch: http://localhost:9200"
    echo "  • Kibana: http://localhost:5601"
    echo ""
    echo "🔑 Default Credentials:"
    echo "  • Grafana: admin / admin123"
    echo "  • Jupyter: password123"
    echo "  • MongoDB: admin / password123"
    echo "  • PostgreSQL: youtube_user / youtube_pass"
    echo "  • Redis: redis123"
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Edit .env file with your API keys and configuration"
    echo "  2. Access the dashboard at http://localhost:8501"
    echo "  3. Explore the API documentation at http://localhost:8000/docs"
    echo "  4. Check out the Jupyter notebooks in the notebooks/ directory"
    echo ""
}

# Main setup function
main() {
    echo "=========================================="
    echo "YouTube AI Data Engineering Analysis"
    echo "Platform Setup Script"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_python
    
    # Setup environment
    create_directories
    setup_environment
    install_dependencies
    
    # Build and start services
    build_docker_images
    start_services
    
    # Health checks
    check_health
    
    # Display information
    display_urls
}

# Run main function
main "$@"
