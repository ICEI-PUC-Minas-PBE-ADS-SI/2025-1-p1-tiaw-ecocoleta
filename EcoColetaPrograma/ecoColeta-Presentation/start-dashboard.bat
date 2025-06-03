@echo off
chcp 65001 >nul
color 0A
echo.
echo ===============================================
echo       🌱 EcoColeta Dashboard - Iniciador
echo ===============================================
echo.

echo ✨ Iniciando aplicação completa com dashboard...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo    Por favor, instale o Node.js em https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!

REM Verificar dependências
if not exist node_modules (
    echo 📦 Instalando dependências...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas!
)

echo.
echo 🚀 Iniciando servidor EcoColeta...
echo.
echo 📋 Informações do servidor:
echo    • Servidor Principal: http://localhost:3000
echo    • API JSON Server: http://localhost:3000/api
echo    • Dashboard Admin: http://localhost:3000/dashboardAdmin.html
echo    • Teste da API: http://localhost:3000/test-api.html
echo.
echo 📱 Páginas disponíveis:
echo    • Página inicial: http://localhost:3000/index.html
echo    • Autenticação: http://localhost:3000/autent.html
echo    • Dashboard: http://localhost:3000/dashboardAdmin.html
echo    • Comunidades: http://localhost:3000/comunidade.html
echo    • Perfil: http://localhost:3000/perfil.html
echo.
echo 💡 Dicas:
echo    • Use Ctrl+C para parar o servidor
echo    • O dashboard puxa dados automaticamente do db.json
echo    • Todas as APIs estão integradas em uma única aplicação
echo.

timeout /t 3 /nobreak >nul

echo 🎯 Abrindo dashboard no navegador...
start http://localhost:3000/dashboardAdmin.html

echo.
echo 🟢 Servidor iniciado! Aguardando conexões...
echo.

npm start
