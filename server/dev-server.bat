@echo off
title AI Dashboard Backend - Development Server

echo 🚀 Starting AI Dashboard Backend Development Server...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo ✅ Environment setup complete
echo 📁 Watching for changes in: src/**.ts
echo 🔧 Using tsx for TypeScript execution
echo Press Ctrl+C to stop the server
echo ─────────────────────────────────────

REM Start the development server
npm run dev
