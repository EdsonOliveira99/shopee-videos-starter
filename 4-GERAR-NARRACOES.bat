@echo off
cd /d "%~dp0"
title Gerando narracoes no ElevenLabs
echo Gerando as narracoes que faltam...
echo.
call node scripts\gerar-narracoes.mjs
echo.
echo ===== FIM =====
pause
