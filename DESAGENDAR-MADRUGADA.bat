@echo off
title Desligar o agendamento de madrugada
schtasks /Delete /TN "Shopee-FazerTudo" /F
echo.
echo Agendamento removido. O FAZER-TUDO.bat continua podendo ser usado com dois cliques.
pause
