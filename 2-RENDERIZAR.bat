@echo off
cd /d "%~dp0"
title Renderizando videos
echo Renderizando todos os videos da pasta produtos...
echo.
call npm run render
echo.
echo ===== FIM =====
start "" "%~dp0VIDEOS-PRONTOS"
pause
