@echo off
cd /d "%~dp0"
where docker >nul 2>nul
if errorlevel 1 (
 echo Docker nao foi encontrado. Instale e inicie o Docker Desktop antes de executar.
 pause
 exit /b 1
)
if not exist .env (
 echo Falta o arquivo .env. Execute node gerar-config.js antes de iniciar.
 pause
 exit /b 1
)
docker compose up --build -d
if errorlevel 1 (pause & exit /b 1)
start http://localhost:40100
pause
