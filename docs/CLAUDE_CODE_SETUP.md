# Como Usar Claude Code com ANTHROPIC_API_KEY

## Configuração Rápida

### 1. Criar arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```bash
# Claude Code Configuration
PROMPT_AI_TYPE=CLAUDE_CODE
ANTHROPIC_API_KEY=sua_chave_api_aqui

# Opcional: URL personalizada (padrão: https://api.anthropic.com/v1)
# PROMPT_API_URL=https://api.anthropic.com/v1

# Opcional: GitHub (se quiser criar branches/issues/PRs)
# GITHUB_TOKEN=seu_token_github
# GITHUB_REPO_OWNER=seu-usuario
# GITHUB_REPO_NAME=seu-repositorio
```

### 2. Obter API Key da Anthropic

1. Acesse: https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create Key"
5. Copie a chave e adicione ao `.env`

### 3. Executar

```bash
# Usar arquivo .md qualquer
npm run automate-features -- ./feature.md

# Ou especificar diretório fonte
npm run automate-features -- --source=$(pwd) ./features/feature.md
```

## Variáveis de Ambiente Aceitas

O módulo aceita as seguintes variáveis para Claude Code:

| Variável | Descrição | Prioridade |
|----------|-----------|------------|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic (padrão) | ✅ **Recomendado** |
| `PROMPT_AI_KEY` | Chave genérica (funciona para qualquer provider) | ✅ Alternativa |
| `PROMPT_AI_TYPE` | Deve ser `CLAUDE_CODE` | ✅ Obrigatório |
| `PROMPT_API_URL` | URL customizada da API (opcional) | Opcional |

## Exemplos de Uso

### Exemplo 1: Usando apenas .env

```bash
# .env
PROMPT_AI_TYPE=CLAUDE_CODE
ANTHROPIC_API_KEY=sk-ant-api03-...

# Executar
npm run automate-features -- ./feature.md
```

### Exemplo 2: Passando via linha de comando

```bash
npm run automate-features -- \
  --prompt-type=CLAUDE_CODE \
  --propt-key=$ANTHROPIC_API_KEY \
  ./feature.md
```

### Exemplo 3: Com modo CLI (source context)

```bash
# .env
PROMPT_AI_TYPE=CLAUDE_CODE
ANTHROPIC_API_KEY=sk-ant-api03-...
USE_CLI=true
SOURCE_DIR=/path/to/project

# Executar
npm run automate-features -- ./feature.md
```

## Verificar Configuração

```bash
# Verificar se .env está sendo carregado
node -e "require('dotenv').config(); console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Configurado' : '❌ Não encontrado')"

# Verificar se o módulo está funcionando
npm run automate-features -- --help
```

## Troubleshooting

### Erro: "API key is required for Claude Code"

**Solução**: Verifique se `ANTHROPIC_API_KEY` está no `.env`:

```bash
# Verificar
cat .env | grep ANTHROPIC_API_KEY
```

### Erro: "Claude Code API error"

**Possíveis causas**:
1. Chave inválida ou expirada
2. Sem créditos na conta Anthropic
3. URL da API incorreta

**Solução**:
1. Verifique a chave em https://console.anthropic.com/
2. Confirme que há créditos na conta
3. Verifique a URL (padrão: `https://api.anthropic.com/v1`)

### O .env não está sendo carregado

**Solução**: O módulo tenta carregar `.env` automaticamente. Se não funcionar:

```bash
# Carregar manualmente
export $(cat .env | xargs)
npm run automate-features -- ./feature.md
```

## Comparação: ANTHROPIC_API_KEY vs PROMPT_AI_KEY

| Característica | `ANTHROPIC_API_KEY` | `PROMPT_AI_KEY` |
|----------------|---------------------|-----------------|
| **Uso** | Específico para Claude Code | Genérico (qualquer provider) |
| **Recomendado para** | Apenas Claude Code | Múltiplos providers |
| **Padrão Anthropic** | ✅ Sim | ❌ Não |
| **Compatibilidade** | ✅ Sim | ✅ Sim |

**Recomendação**: Use `ANTHROPIC_API_KEY` se você usa apenas Claude Code. Use `PROMPT_AI_KEY` se você alterna entre diferentes providers.

