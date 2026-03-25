@echo off

echo Criando pasta de destino...
mkdir "C:\Users\194772024\Desktop\Assistentem" 2>nul

echo Extraindo arquivos...
tar -xf "C:\Users\194772024\Downloads\ParkinsonMouseAssist.zip" -C "C:\Program Files\Assistem"

if %errorLevel% neq 0 (
    echo ERRO ao extrair o arquivo!
    pause
    exit /b
)

echo Extracao concluida!
echo Executando projeto...

cd /d "C:\Program Files\Assistentem\ParkinsonMouseAssist"
dotnet run

pause
