@echo off
cd /d "%~dp0"
title FAZER TUDO - narracao, render e Google Drive
echo Gerando narracoes, renderizando, conferindo e copiando para o Google Drive...
echo (o jeito antigo continua funcionando: 4-GERAR-NARRACOES.bat e 2-RENDERIZAR.bat)
echo.
call node scripts\ferramentas-claude\arquivar-dias.mjs
call node scripts\v2\fazer-tudo.mjs %2
echo.
type "VIDEOS-PRONTOS\ULTIMA-EXECUCAO.txt"
if /I "%1"=="auto" exit /b
start "" "%~dp0VIDEOS-PRONTOS"
pause
