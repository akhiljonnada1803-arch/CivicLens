# CivicLens AI - Development Runner (PowerShell)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting CivicLens AI Full-Stack Development Environment" -ForegroundColor Cyan
Write-Host "   Municipality: GVMC Ward 14 Operations Console" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend in background process
Write-Host "Starting FastAPI Backend on http://localhost:8001..." -ForegroundColor Green
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload" -PassThru

# Start Frontend in background process
Write-Host "Starting Operations Console on http://localhost:3000..." -ForegroundColor Green
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -PassThru

Write-Host ""
Write-Host "✨ Services launched!" -ForegroundColor Yellow
Write-Host "   • Web Console:    http://localhost:3000" -ForegroundColor White
Write-Host "   • FastAPI Docs:   http://localhost:8001/docs" -ForegroundColor White
Write-Host "   • Edge Simulator: python edge-simulator/simulator.py" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

