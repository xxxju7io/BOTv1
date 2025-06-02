@echo off
title Iniciando Tor e o Bot...
echo Iniciando o serviço Tor...

:: Inicia o serviço Tor em segundo plano
start "" "C:\Users\User\tor\tor.exe"

:: Aguarda 10 segundos para o serviço subir
timeout /t 10 /nobreak >nul

echo Iniciando o bot...
node index.js

pause
