@echo off
cd /d "%~dp0"
title Voltar para a versao estavel
echo.
echo Isto devolve os programas (src, scripts e .bat) ao estado do dia da instalacao.
echo Seus videos, produtos e midias NAO sao apagados.
echo.
pause
if not exist "_BACKUPS\versao-estavel-codigo.zip" goto semzip
echo Desligando tarefas agendadas da automacao...
schtasks /Change /TN "Shopee-FazerTudo" /DISABLE >nul 2>nul
echo Restaurando arquivos...
powershell -NoProfile -Command "Expand-Archive -Path _BACKUPS\versao-estavel-codigo.zip -DestinationPath . -Force"
if errorlevel 1 goto erro
echo.
echo ===== PRONTO: voltou para a versao estavel =====
echo Se usava o agendamento, rode AGENDAR-MADRUGADA.bat de novo.
pause
exit /b 0
:semzip
echo [ERRO] Nao achei _BACKUPS\versao-estavel-codigo.zip (ele e criado pelo 1-INSTALAR.bat).
pause
exit /b 1
:erro
echo [ERRO] Nao consegui restaurar. Mande um print desta janela.
pause
exit /b 1
