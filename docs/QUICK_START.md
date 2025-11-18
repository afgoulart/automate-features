# Quick Start - Como Usar

## Instalação Rápida

```bash
npm install @arranjae/automate-features
```

## Configuração

### Opção 1: Claude Code (Recomendado) ⭐

Claude Code possui uma API pública e funcional:

```bash
# Configure as variáveis de ambiente
export PROMPT_AI_TYPE=CLAUDE_CODE
export PROMPT_AI_KEY=sua_claude_api_key_aqui
```

**Como obter a API key:**
1. Acesse: https://console.anthropic.com/
2. Crie conta/login
3. Navegue até API Keys
4. Gere uma API key
5. Use como `PROMPT_AI_KEY`

### Opção 2: Cursor (Limitado)

⚠️ **Atenção**: O Cursor não possui uma API HTTP pública. A URL `https://api.cursor.sh/v1` não está disponível.

Se você tiver acesso à API privada do Cursor:

```bash
export PROMPT_AI_TYPE=CURSOR
export PROMPT_AI_KEY=seu_token_cursor
export PROMPT_API_URL=https://sua-url-privada-cursor  # Se necessário
```

## Uso Básico

### Via CLI (Recomendado)

```bash
# Com modo CLI (inclui contexto do código fonte)
USE_CLI=true npm run automate-features -- \
  --propt-key=$PROMPT_AI_KEY \
  --source=$(pwd) \
  feature.md

# Sem modo CLI (sem contexto)
npm run automate-features -- \
  --propt-key=$PROMPT_AI_KEY \
  feature.md
```

### Via Código TypeScript

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.PROMPT_AI_KEY,
  useCli: true, // Habilita modo com contexto
  sourceDir: process.cwd(), // Diretório do projeto
});

const result = await pipeline.process({
  prompt: 'Criar componente de login',
  runCodeReview: true,
});
```

## Exemplos Práticos

### Exemplo 1: Gerar código React

```bash
# Criar arquivo feature.md
echo "Criar componente React de lista de tarefas com TypeScript" > feature.md

# Executar
PROMPT_AI_TYPE=CLAUDE_CODE \
USE_CLI=true \
npm run automate-features -- \
  --propt-key=$PROMPT_AI_KEY \
  --source=$(pwd) \
  feature.md
```

### Exemplo 2: Com variáveis de ambiente

```bash
# .env
PROMPT_AI_TYPE=CLAUDE_CODE
PROMPT_AI_KEY=sua_key_aqui
USE_CLI=true
SOURCE_DIR=$(pwd)

# Executar
npm run automate-features -- \
  --propt-key=$PROMPT_AI_KEY \
  --source=$(pwd) \
  feature.md
```

## Troubleshooting

### Erro: "Cursor API endpoint not found"

**Solução**: Use Claude Code:

```bash
PROMPT_AI_TYPE=CLAUDE_CODE npm run automate-features -- ...
```

### Erro: "Collected 0 characters of source code"

**Solução**: Verifique se o diretório source contém código:

```bash
# Use o diretório do projeto, não o diretório do feature.md
--source=$(pwd)  # ✅ Correto
--source=./TesteFeature  # ❌ Pode estar vazio
```

### Erro: "Missing field providerType"

**Solução**: Rebuild o projeto:

```bash
npm run build
```

## Próximos Passos

- 📖 Veja [Guia Completo](./USAGE.md) para mais exemplos
- 🔧 Veja [AI Providers](./AI_PROVIDERS.md) para configuração detalhada
- 🧪 Veja [Testar Localmente](./TESTING_LOCAL.md) para desenvolvimento

