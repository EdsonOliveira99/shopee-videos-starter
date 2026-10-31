@echo off
cd /d "%~dp0"
title Agendar o FAZER-TUDO todo dia de madrugada
echo Vai agendar o FAZER-TUDO para rodar todo dia no horario escolhido na instalacao (conta.json).
echo O PC pode estar em suspensao (ele acorda sozinho), mas nao desligado.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\v2\agendar.ps1"
if errorlevel 1 goto erro
echo.
echo ===== AGENDADO =====
echo Para desligar: rode DESAGENDAR-MADRUGADA.bat
pause
exit /b 0
:erro
echo [ERRO] Nao consegui agendar. Mande um print desta janela.
pause
exit /b 1
