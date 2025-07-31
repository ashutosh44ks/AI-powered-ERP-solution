#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AI Dashboard Backend Development Server...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to handle cleanup on script exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down development server...${NC}"
    kill $NODEMON_PID 2>/dev/null
    exit 0
}

# Set trap to handle Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}✅ Environment setup complete${NC}"
echo -e "${BLUE}📁 Watching for changes in: src/**.ts${NC}"
echo -e "${BLUE}🔧 Using tsx for TypeScript execution${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo -e "${GREEN}─────────────────────────────────────${NC}"

# Start nodemon in background and capture PID
npm run dev &
NODEMON_PID=$!

# Wait for the background process
wait $NODEMON_PID
