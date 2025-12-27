# SmartHR Startup Script

Write-Host "Starting MySQL Database..."
# Assuming system service or Docker:
# docker-compose up -d mysql 
# OR just ensure local MySQL is running

Write-Host "Starting Backend (Spring Boot)..."
Start-Process -FilePath "d:\smartHR\tools\apache-maven-3.9.6\bin\mvn.cmd" -ArgumentList "spring-boot:run" -WorkingDirectory "d:\smartHR\backend" -WindowStyle Normal

Write-Host "Starting Frontend (React)..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "d:\smartHR\frontend" -WindowStyle Normal

Write-Host "Project Launching..."
Write-Host "Frontend will be at: http://localhost:5173 (or 5174/5175/5176)"
Write-Host "Backend will be at: http://localhost:8080"
