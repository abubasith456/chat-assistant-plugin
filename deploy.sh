#!/bin/bash

# Chat Assistant Deployment Script

echo "🚀 Chat Assistant Deployment Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}➤${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

echo
print_step "Setting up GitHub Pages deployment..."

# Check if .github/workflows exists
if [ ! -d ".github/workflows" ]; then
    print_error ".github/workflows directory not found!"
    exit 1
fi

print_success "GitHub Actions workflow configured"
print_warning "Don't forget to enable GitHub Pages in your repository settings"
print_warning "Go to: Settings → Pages → Source: GitHub Actions"

echo
print_step "Building frontend for production..."

# Build frontend
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

echo
print_step "Setting up Docker deployment..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    print_success "Docker is available"
    
    echo
    print_step "Building Docker image..."
    docker build -t chat-assistant-backend .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
        
        echo
        print_step "Testing Docker container..."
        docker run -d --name chat-assistant-test -p 7860:7860 chat-assistant-backend
        
        sleep 5
        
        # Test health endpoint
        if curl -f http://localhost:7860/health > /dev/null 2>&1; then
            print_success "Docker container is running and healthy"
        else
            print_warning "Docker container might not be fully ready yet"
        fi
        
        # Clean up test container
        docker stop chat-assistant-test > /dev/null 2>&1
        docker rm chat-assistant-test > /dev/null 2>&1
        
    else
        print_error "Docker build failed"
    fi
else
    print_warning "Docker not found. Please install Docker to test the backend deployment"
fi

echo
print_step "Deployment setup complete!"
echo
echo "📋 Next Steps:"
echo "==============="
echo
echo "For GitHub Pages (Frontend):"
echo "1. Push your changes to the main branch"
echo "2. Enable GitHub Pages in repository settings"
echo "3. Select 'GitHub Actions' as the source"
echo "4. Your site will be available at: https://abubasith456.github.io/chat-assistant-plugin/"
echo
echo "For Hugging Face (Backend):"
echo "1. Create a new Space on Hugging Face"
echo "2. Choose 'Docker' as the SDK"
echo "3. Upload these files to your Space:"
echo "   - backend/ (entire folder)"
echo "   - Dockerfile"
echo "   - README_HUGGINGFACE.md"
echo "4. Set environment variables in Space settings:"
echo "   - NVIDIA_API_KEY=your_api_key"
echo "   - PORT=7860"
echo "5. Your backend will be available at: https://your-username-space-name.hf.space"
echo
echo "For local testing:"
echo "• Frontend: npm run dev"
echo "• Backend: docker-compose up"
echo "• Full stack: docker-compose up && npm run dev (in separate terminal)"
echo

print_success "All deployment configurations are ready! 🎉"
