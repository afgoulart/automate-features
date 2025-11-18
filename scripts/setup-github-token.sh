#!/bin/bash

# Script para configurar GitHub token usando gh CLI

echo "🔐 Configurando GitHub Token"
echo ""

# Verificar se gh está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não está instalado"
    echo ""
    echo "Para instalar:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   sudo apt install gh  # ou equivalente"
    echo "  Windows: winget install GitHub.cli"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI encontrado"
echo ""

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo "🔑 Autenticando no GitHub..."
    gh auth login
else
    echo "✅ Já autenticado no GitHub"
    gh auth status
fi

echo ""
echo "📝 Obtendo token..."

# Obter token
TOKEN=$(gh auth token)

if [ -z "$TOKEN" ]; then
    echo "❌ Erro: Não foi possível obter o token"
    exit 1
fi

echo "✅ Token obtido com sucesso!"
echo ""
echo "📋 Token: ${TOKEN:0:20}..."
echo ""

# Adicionar ao .env
ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "# GitHub Configuration" > "$ENV_FILE"
    echo "GITHUB_TOKEN=$TOKEN" >> "$ENV_FILE"
    echo ""
    echo "✅ Arquivo .env criado com GITHUB_TOKEN"
else
    # Verificar se já existe
    if grep -q "GITHUB_TOKEN=" "$ENV_FILE"; then
        # Atualizar token existente
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^GITHUB_TOKEN=.*/GITHUB_TOKEN=$TOKEN/" "$ENV_FILE"
        else
            # Linux
            sed -i "s/^GITHUB_TOKEN=.*/GITHUB_TOKEN=$TOKEN/" "$ENV_FILE"
        fi
        echo "✅ Token atualizado no .env"
    else
        echo "" >> "$ENV_FILE"
        echo "# GitHub Configuration" >> "$ENV_FILE"
        echo "GITHUB_TOKEN=$TOKEN" >> "$ENV_FILE"
        echo "✅ Token adicionado ao .env"
    fi
fi

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "Para usar o token:"
echo "  export GITHUB_TOKEN=\$(gh auth token)"
echo ""
echo "Ou use o arquivo .env:"
echo "  source .env  # ou use dotenv no código"
echo ""

