@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Instalando Shopee Videos
where node >nul 2>nul
if errorlevel 1 goto semnode
for /f "tokens=1 delims=." %%v in ('node -v') do set NODEV=%%v
set NODEV=%NODEV:v=%
if %NODEV% LSS 18 goto nodevelho
call node scripts\instalar\instalar.mjs
if errorlevel 1 goto erro
pause
exit /b 0
:semnode
echo.
echo O Node.js nao esta instalado (ele e o motor que gera os videos).
choice /M "Quer que eu instale agora pelo winget"
if errorlevel 2 goto manual
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
echo.
echo Node instalado. FECHE esta janela e de dois cliques no 1-INSTALAR.bat de novo.
pause
exit /b 0
:nodevelho
echo.
echo Seu Node.js e muito antigo (versao %NODEV%). Instale a versao LTS em https://nodejs.org
pause
exit /b 1
:manual
echo.
echo Instale a versao LTS em https://nodejs.org e rode o 1-INSTALAR.bat de novo.
pause
exit /b 1
:erro
echo.
echo [ERRO] A instalacao nao terminou. Mande um print desta janela.
pause
exit /b 1
