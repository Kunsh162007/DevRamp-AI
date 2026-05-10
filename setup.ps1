# DevRamp AI - Quick Setup Script for Windows
Write-Host "🚀 DevRamp AI - Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if Python is installed
Write-Host "Checking Python..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host "✓ $pythonVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found. Please install Python 3.10+ from https://python.org" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
Write-Host "Checking Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker found" -ForegroundColor Green
} else {
    Write-Host "⚠ Docker not found. Docker is optional but recommended" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setting up environment..." -ForegroundColor Cyan

# Copy .env.example to .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "⚠ Please edit .env and add your IBM Bob API credentials" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Cyan

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
}
Set-Location ..

# Install backend dependencies
Write-Host ""
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
}
Set-Location ..

# Install Bob service dependencies
Write-Host ""
Write-Host "Installing Bob service dependencies..." -ForegroundColor Yellow
Set-Location bob-service
python -m pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Bob service dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Bob service installation failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your IBM Bob API credentials" -ForegroundColor White
Write-Host "2. Start the database: docker-compose up postgres redis -d" -ForegroundColor White
Write-Host "3. Run migrations: cd backend && npm run prisma:migrate" -ForegroundColor White
Write-Host "4. Start all services: docker-compose up" -ForegroundColor White
Write-Host ""
Write-Host "Or start services individually:" -ForegroundColor Cyan
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  Bob Service: cd bob-service && uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
Write-Host "Access the application at http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Made with Bob
