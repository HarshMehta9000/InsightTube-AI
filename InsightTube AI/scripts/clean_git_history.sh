#!/bin/bash

# Script to remove all previous commits and start fresh
# This will completely reset the git history

echo "🧹 Cleaning Git History..."
echo "⚠️  WARNING: This will remove ALL previous commits and start fresh!"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_error "Not a git repository. Please run this from the project root."
    exit 1
fi

# Confirm with user
print_warning "This action will:"
echo "  • Remove ALL previous commits"
echo "  • Delete the entire git history"
echo "  • Start with a fresh repository"
echo "  • Keep all current files"
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_info "Operation cancelled by user."
    exit 0
fi

# Backup current branch name
current_branch=$(git branch --show-current)
print_info "Current branch: $current_branch"

# Remove all remote tracking
print_info "Removing remote tracking..."
git remote remove origin 2>/dev/null || true

# Remove all tags
print_info "Removing all tags..."
git tag | xargs git tag -d 2>/dev/null || true

# Create orphan branch (no history)
print_info "Creating orphan branch..."
git checkout --orphan temp_branch

# Add all files
print_info "Adding all files..."
git add -A

# Create initial commit
print_info "Creating initial commit..."
git commit -m "🚀 Initial commit: AI-Powered YouTube Data Engineering Analysis Platform

🎯 Complete platform transformation with:
• Modern AI architecture using LangChain and OpenAI
• FastAPI backend with comprehensive REST API
• Beautiful Streamlit dashboard with interactive analytics
• Production-ready Docker and Kubernetes support
• Enterprise-grade data engineering capabilities
• Comprehensive testing and documentation

✨ Features:
• AI-powered video analysis and insights
• Natural language queries with conversational AI
• Real-time data processing and streaming
• Multi-cloud support and scalability
• Professional monitoring and security

🚀 Ready for production deployment!"

# Delete the old branch
print_info "Removing old branch..."
git branch -D "$current_branch"

# Rename temp branch to main
print_info "Renaming branch to main..."
git branch -m main

# Force push if remote exists (optional)
if git remote -v | grep -q origin; then
    print_warning "Remote origin detected. Do you want to force push the new history?"
    read -p "Force push to remote? (yes/no): " force_push
    
    if [ "$force_push" = "yes" ]; then
        print_info "Force pushing to remote..."
        git push -f origin main
    else
        print_info "Skipping remote push. You can push manually later with:"
        echo "  git push -f origin main"
    fi
fi

print_success "Git history cleaned successfully!"
print_info "New repository created with single initial commit."
print_info "All previous commits have been removed."
print_info "Current status:"
echo ""
git status
echo ""
print_info "You can now add a new remote origin:"
echo "  git remote add origin <your-new-repo-url>"
print_info "And push to start fresh:"
echo "  git push -u origin main"
