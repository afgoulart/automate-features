# Claude Model Configuration

Guia completo para configurar modelos específicos do Claude Code CLI e API.

## Modelos Disponíveis

### Claude Code CLI

O Claude Code CLI suporta os seguintes modelos via flag `--model`:

| Nome | Modelo ID | Descrição | Quando Usar |
|------|-----------|-----------|-------------|
| `opus` | claude-opus-4-20250514 | Mais poderoso e inteligente | Tarefas complexas, raciocínio avançado |
| `sonnet` | claude-sonnet-4-5-20250929 | **Padrão** - Balanceado | Uso geral, melhor custo-benefício |
| `haiku` | claude-haiku-4-20250620 | Mais rápido e econômico | Tarefas simples, prototipagem rápida |

### Claude Code API

A API usa model IDs completos:

| Model ID | Descrição |
|----------|-----------|
| `claude-opus-4-20250514` | Claude Opus 4 |
| `claude-sonnet-4-5-20250929` | **Padrão** - Claude Sonnet 4.5 |
| `claude-haiku-4-20250620` | Claude Haiku 4 |
| `claude-3-5-sonnet-20241022` | Legacy - Claude 3.5 Sonnet |

## Configuração

### Método 1: Variável de Ambiente (Recomendado)

Configure o modelo globalmente via `.env`:

```bash
# .env
CLAUDE_MODEL=opus           # Para CLI
CLAUDE_MODEL_ID=claude-opus-4-20250514  # Para API

# Exemplos:
CLAUDE_MODEL=sonnet         # Padrão (balanceado)
CLAUDE_MODEL=haiku          # Rápido e econômico
CLAUDE_MODEL=opus           # Mais poderoso
```

### Método 2: Variáveis de Sistema

Configure no sistema operacional:

```bash
# macOS/Linux
export CLAUDE_MODEL=opus
export CLAUDE_MODEL_ID=claude-opus-4-20250514

# Windows (PowerShell)
$env:CLAUDE_MODEL="opus"
$env:CLAUDE_MODEL_ID="claude-opus-4-20250514"

# Windows (CMD)
set CLAUDE_MODEL=opus
set CLAUDE_MODEL_ID=claude-opus-4-20250514
```

### Método 3: Por Projeto

Configure no package.json:

```json
{
  "scripts": {
    "generate": "CLAUDE_MODEL=opus pnpm automate-features",
    "generate:fast": "CLAUDE_MODEL=haiku pnpm automate-features",
    "generate:best": "CLAUDE_MODEL=opus pnpm automate-features"
  }
}
```

### Método 4: Inline (CLI)

```bash
# CLI Mode
CLAUDE_MODEL=opus USE_CLI=true pnpm automate-features ./feature.md

# API Mode
CLAUDE_MODEL_ID=claude-opus-4-20250514 pnpm automate-features ./feature.md
```

## Uso Programático

### TypeScript/JavaScript

```typescript
import { CodeGenerator } from '@arranjae/automate-features';

// Configurar via env vars antes de criar o generator
process.env.CLAUDE_MODEL = 'opus';  // Para CLI
process.env.CLAUDE_MODEL_ID = 'claude-opus-4-20250514';  // Para API

const generator = new CodeGenerator(
  process.env.ANTHROPIC_API_KEY,
  undefined,
  true, // useCli
  './src',
  'CLAUDE_CODE'
);

const result = await generator.generate('Create a complex authentication system');
```

### Diferentes Modelos para Diferentes Tarefas

```typescript
// Generator para tarefas simples (haiku - rápido)
process.env.CLAUDE_MODEL = 'haiku';
const fastGenerator = new CodeGenerator(apiKey, undefined, true, './src', 'CLAUDE_CODE');

// Generator para tarefas complexas (opus - poderoso)
process.env.CLAUDE_MODEL = 'opus';
const powerfulGenerator = new CodeGenerator(apiKey, undefined, true, './src', 'CLAUDE_CODE');

// Usar conforme necessidade
const simpleCode = await fastGenerator.generate('Add a button component');
const complexCode = await powerfulGenerator.generate('Implement OAuth2 with JWT refresh');
```

## Comparação de Modelos

### Performance

| Modelo | Velocidade | Custo Relativo | Qualidade | Use Cases |
|--------|-----------|----------------|-----------|-----------|
| **Haiku** | ⚡⚡⚡ Muito Rápido | 💰 Baixo | ⭐⭐⭐ Boa | Componentes simples, refatorações, testes |
| **Sonnet** | ⚡⚡ Rápido | 💰💰 Médio | ⭐⭐⭐⭐ Ótima | Uso geral, features completas |
| **Opus** | ⚡ Moderado | 💰💰💰 Alto | ⭐⭐⭐⭐⭐ Excelente | Arquitetura complexa, algoritmos avançados |

### Custos Estimados (API)

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) | Feature Simples | Feature Complexa |
|--------|----------------------|------------------------|-----------------|------------------|
| **Haiku** | $0.25 | $1.25 | ~$0.01 | ~$0.05 |
| **Sonnet** | $3.00 | $15.00 | ~$0.10 | ~$0.50 |
| **Opus** | $15.00 | $75.00 | ~$0.50 | ~$2.50 |

*Valores aproximados, sujeitos a mudanças*

### Tempo de Resposta Médio

| Modelo | Componente Simples | Feature Média | Projeto Completo |
|--------|-------------------|---------------|------------------|
| **Haiku** | 2-5s | 10-20s | 30-60s |
| **Sonnet** | 5-10s | 20-40s | 60-120s |
| **Opus** | 10-20s | 40-80s | 120-240s |

## Exemplos Práticos

### Desenvolvimento Iterativo

Use modelos diferentes em cada fase:

```bash
# Fase 1: Prototipagem rápida (Haiku)
CLAUDE_MODEL=haiku USE_CLI=true pnpm automate-features ./prototype.md

# Fase 2: Implementação (Sonnet - padrão)
USE_CLI=true pnpm automate-features ./implementation.md

# Fase 3: Otimização e refinamento (Opus)
CLAUDE_MODEL=opus USE_CLI=true pnpm automate-features ./optimization.md
```

### CI/CD Pipeline

```yaml
# .github/workflows/auto-features.yml
name: Auto Generate Features

on:
  push:
    paths:
      - 'features/**/*.md'

jobs:
  generate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        feature_type: [simple, complex]
        include:
          - feature_type: simple
            model: haiku
            path: 'features/simple/'
          - feature_type: complex
            model: opus
            path: 'features/complex/'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install

      - name: Generate code
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          CLAUDE_MODEL: ${{ matrix.model }}
          USE_CLI: true
        run: |
          for file in ${{ matrix.path }}*.md; do
            pnpm automate-features "$file"
          done
```

### Otimização de Custos

```typescript
// Estratégia: Usar Haiku primeiro, Opus apenas se necessário
async function generateWithFallback(prompt: string) {
  try {
    // Tenta com Haiku primeiro (mais barato)
    process.env.CLAUDE_MODEL = 'haiku';
    const result = await generator.generate(prompt);

    // Verificar qualidade (exemplo simples)
    if (result.code.length < 100) {
      throw new Error('Output muito curto');
    }

    return result;
  } catch (error) {
    console.log('Fallback para Opus...');

    // Se falhar, usa Opus (mais poderoso)
    process.env.CLAUDE_MODEL = 'opus';
    return await generator.generate(prompt);
  }
}
```

### Tarefas Específicas por Modelo

```typescript
const tasks = {
  // Haiku: Tarefas rápidas e simples
  haiku: [
    'Add a loading spinner component',
    'Create a utility function for date formatting',
    'Write unit tests for existing function',
    'Add comments to existing code',
    'Refactor variable names for clarity'
  ],

  // Sonnet: Uso geral (padrão)
  sonnet: [
    'Create a user authentication module',
    'Implement REST API endpoints',
    'Build a form validation system',
    'Create database migration scripts',
    'Add error handling middleware'
  ],

  // Opus: Tarefas complexas
  opus: [
    'Design microservices architecture',
    'Implement real-time WebSocket system',
    'Create distributed caching layer',
    'Build AI-powered recommendation engine',
    'Design and implement CQRS pattern'
  ]
};

// Processar com modelo apropriado
for (const [model, prompts] of Object.entries(tasks)) {
  process.env.CLAUDE_MODEL = model;

  for (const prompt of prompts) {
    await generator.generate(prompt);
  }
}
```

## Configuração Avançada

### Claude CLI Flags

Você pode passar flags adicionais via variável de ambiente:

```bash
export CLAUDE_CLI_FLAGS="--max-tokens 8000 --temperature 0.7"
USE_CLI=true pnpm automate-features ./feature.md
```

### Custom System Prompt por Modelo

```typescript
const systemPrompts = {
  haiku: 'Generate concise, efficient code with minimal comments.',
  sonnet: 'Generate production-ready code with good documentation.',
  opus: 'Generate highly optimized, well-architected code with comprehensive documentation and error handling.'
};

process.env.CLAUDE_SYSTEM_PROMPT = systemPrompts.opus;
```

## Troubleshooting

### Modelo não está sendo respeitado

**Problema:** Configurei `CLAUDE_MODEL=opus` mas ainda usa `sonnet`.

**Soluções:**

1. **Verificar se a variável está definida:**
```bash
echo $CLAUDE_MODEL  # Linux/macOS
echo %CLAUDE_MODEL%  # Windows CMD
$env:CLAUDE_MODEL    # Windows PowerShell
```

2. **Usar export antes do comando:**
```bash
export CLAUDE_MODEL=opus
pnpm automate-features ./feature.md
```

3. **Verificar logs do Rust:**
```bash
USE_CLI=true pnpm automate-features ./feature.md 2>&1 | grep "model"
```

### Modelo inválido

**Problema:** Erro "Invalid model: xyz"

**Solução:** Use apenas valores válidos: `opus`, `sonnet`, ou `haiku`.

```bash
# ❌ Errado
CLAUDE_MODEL=gpt-4  # Não existe no Claude

# ✅ Correto
CLAUDE_MODEL=opus
```

### Custo muito alto

**Problema:** Gastos elevados com Opus.

**Soluções:**

1. **Use Sonnet como padrão:**
```bash
CLAUDE_MODEL=sonnet  # Melhor custo-benefício
```

2. **Use Haiku para tarefas simples:**
```bash
CLAUDE_MODEL=haiku USE_CLI=true pnpm automate-features ./simple-task.md
```

3. **Monitore uso:**
```bash
# Adicione logging de modelo usado
echo "Using model: $CLAUDE_MODEL"
```

## Melhores Práticas

### 1. Use o Modelo Adequado

- **Haiku**: Prototipagem, componentes simples, testes
- **Sonnet**: Uso geral, features completas (default)
- **Opus**: Arquitetura complexa, otimizações críticas

### 2. Configure por Ambiente

```bash
# .env.development
CLAUDE_MODEL=haiku  # Rápido para desenvolvimento

# .env.production
CLAUDE_MODEL=sonnet  # Balanceado para produção

# .env.critical
CLAUDE_MODEL=opus  # Melhor qualidade para código crítico
```

### 3. Documente a Escolha

```typescript
/**
 * Gera componentes de UI
 * Usa Haiku por ser rápido e suficiente para UI simples
 */
process.env.CLAUDE_MODEL = 'haiku';
const uiGenerator = new CodeGenerator(...);

/**
 * Gera lógica de negócio
 * Usa Opus por precisar de maior precisão
 */
process.env.CLAUDE_MODEL = 'opus';
const businessLogicGenerator = new CodeGenerator(...);
```

### 4. Teste com Diferentes Modelos

```bash
# Testar com todos os modelos
for model in haiku sonnet opus; do
  echo "Testing with $model..."
  CLAUDE_MODEL=$model USE_CLI=true pnpm automate-features ./test.md
done
```

## Referências

- [Claude Models Overview](https://docs.anthropic.com/en/docs/models-overview)
- [Claude CLI Documentation](https://github.com/anthropics/claude-cli)
- [Pricing](https://www.anthropic.com/pricing)

## Veja Também

- [AI Providers](./AI_PROVIDERS.md) - Configuração de providers
- [CLI Mode](./CLI_MODE.md) - Usando Claude Code CLI
- [Usage Guide](./USAGE_GUIDE.md) - Guia completo de uso
