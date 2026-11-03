@echo off
cd /d "%~dp0"
set "NODE=node"
where node >nul 2>nul
if errorlevel 1 (
 for /d %%D in ("%USERPROFILE%\Documents\Codex\Hermes\data\tools\node-*") do set "NODE=%%D\node.exe"
)
"%NODE%" iniciar-local.js
pause
