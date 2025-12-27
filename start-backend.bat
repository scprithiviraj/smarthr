@echo off
echo Starting SmartHR Backend...
set PATH=d:\smartHR\tools\apache-maven-3.9.6\bin;%PATH%
cd backend
echo Rebuilding backend...
call mvn clean package -DskipTests
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
java -jar target\backend-0.0.1-SNAPSHOT.jar --spring.jpa.hibernate.ddl-auto=update
pause
