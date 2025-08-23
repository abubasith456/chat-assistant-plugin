#!/bin/bash

# Start Chat Assistant Dashboard and Backend
echo "🚀 Starting Chat Assistant Dashboard..."

# Set MongoDB URL if not already set
export MONGODB_URL="${MONGODB_URL:-mongodb+srv://abubasith:abubasith@cluster0.fhejr.mongodb.net/}"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend started successfully on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend in background
echo "🎨 Starting dashboard..."
cd ../dashboard
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Services started successfully!"
echo "📱 Dashboard: http://localhost:5174"
echo "🔌 API: http://localhost:8000"
echo "📊 MongoDB: Connected to Atlas"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
