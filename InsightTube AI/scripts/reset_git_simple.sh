#!/bin/bash

# Simple script to reset git history
# Alternative to clean_git_history.sh

echo "🔄 Simple Git Reset Script"
echo "This will remove all commits and start fresh"
echo ""

echo "Current git status:"
git status
echo ""

echo "Current commits:"
git log --oneline -10
echo ""

read -p "Continue with reset? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo "🧹 Resetting git history..."

# Remove all commits and start fresh
git checkout --orphan latest_branch
git add -A
git commit -m "🚀 Fresh start: AI-Powered YouTube Data Engineering Platform

Complete platform with:
• Modern AI architecture (LangChain, OpenAI)
• FastAPI backend + Streamlit dashboard
• Production-ready infrastructure
• Enterprise-grade features"

# Delete the old branch
git branch -D main
git branch -m main

echo "✅ Git history reset complete!"
echo "Current status:"
git status
echo ""
echo "You can now push to a new remote:"
echo "git remote add origin <your-repo-url>"
echo "git push -u origin main"
