@echo off
cd /d "%~dp0"
title Remotion Studio
echo Abrindo o Remotion Studio no navegador. Feche esta janela para parar.
echo.
call npm run dev
pause
