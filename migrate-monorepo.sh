#!/bin/bash

echo "Iniciando migração para Monorepo..."

# Criar pasta do backend
mkdir -p backend

# Mover arquivos e pastas principais do backend
echo "Movendo arquivos do backend..."
mv src backend/ 2>/dev/null
mv prisma backend/ 2>/dev/null
mv package.json backend/ 2>/dev/null
mv tsconfig.json backend/ 2>/dev/null
mv node_modules backend/ 2>/dev/null
mv test-api.sh backend/ 2>/dev/null
mv .env backend/ 2>/dev/null

# O package.root.json foi criado pelo assistente, vamos renomeá-lo para package.json na raiz
mv package.root.json package.json

# Instalar front-end Vite
echo "Inicializando o Frontend com Vite e React TS..."
npx -y create-vite@latest frontend --template react-ts

# Instalar dependências a partir do workspace
echo "Instalando dependências dos workspaces..."
npm install

echo "Migração estrutural concluída! O código do frontend agora será implementado."
