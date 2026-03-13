#!/bin/bash

echo "Movendo os arquivos restantes para a pasta backend..."

mv dist backend/ 2>/dev/null
mv .eslintrc.json backend/ 2>/dev/null
mv .prettierrc backend/ 2>/dev/null
mv Dockerfile backend/ 2>/dev/null
mv postman_collection.json backend/ 2>/dev/null
mv setup.sh backend/ 2>/dev/null
mv .env.example backend/ 2>/dev/null
mv README.md backend/ 2>/dev/null

echo "Removendo package-lock antigo..."
rm package-lock.json 2>/dev/null

echo "Limpeza concluída!"
