# SmartHR Startup Script

Write-Host "Starting MySQL Database..."
# Assuming system service or Docker:
# docker-compose up -d mysql 
# OR just ensure local MySQL is running

Write-Host "Starting Backend (Spring Boot)..."
# Using pre-built JAR since local Maven tools were removed
Start-Process -FilePath "java" -ArgumentList "-jar", "d:\smartHR\backend\target\backend-0.0.1-SNAPSHOT.jar" -WorkingDirectory "d:\smartHR\backend" -WindowStyle Normal

Write-Host "Starting Frontend (React)..."
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "d:\smartHR\frontend" -WindowStyle Normal

Write-Host "Project Launching..."
Write-Host "Frontend will be at: http://localhost:5173"
Write-Host "Backend will be at: http://localhost:8080"
