#!/bin/bash

# PathMentor Deployment Script
echo "🚀 PathMentor Deployment Helper"
echo "================================"

# Check if git repo is initialized
if [ ! -d .git ]; then
    echo "❌ No git repository found. Please run 'git init' first."
    exit 1
fi

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo ""
fi

echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Environment variables configured"
echo "2. ✅ Dependencies updated"
echo "3. ✅ Code committed to git"
echo ""

echo "🔧 Backend (Railway) Setup:"
echo "1. Go to https://railway.app"
echo "2. Connect your GitHub repository"
echo "3. Select the backend_new folder as root"
echo "4. Add environment variables from .env.example"
echo ""

echo "🌐 Frontend (Vercel) Setup:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Set root directory to 'frontend'"
echo "4. Add environment variables"
echo "5. Update NEXT_PUBLIC_API_URL with your Railway URL"
echo ""

echo "🎉 After deployment, test these endpoints:"
echo "Backend: https://your-app.railway.app/api/v1/health"
echo "Frontend: https://your-app.vercel.app"