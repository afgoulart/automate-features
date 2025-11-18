# Provedores de AI Suportados

O módulo `@arranjae/automate-features` suporta múltiplos provedores de AI através de uma interface abstrata. Isso permite que você escolha qual serviço de AI usar sem alterar o código.

## Provedores Disponíveis

### 1. Cursor (`CURSOR`)

⚠️ **Nota Importante**: O Cursor não possui uma API HTTP pública. A URL `https://api.cursor.sh/v1` não está disponível publicamente. O Cursor é principalmente um editor de código.

**Recomendação**: Use **Claude Code** (`CLAUDE_CODE`) que possui uma API pública e funcional.

**Configuração (se você tiver acesso à API privada do Cursor):**

```env
PROMPT_AI_TYPE=CURSOR
PROMPT_AI_KEY=seu_cursor_api_token
PROMPT_API_URL=https://sua-url-privada-cursor  # URL privada/customizada se disponível
```

**Importante**:

- `PROMPT_AI_KEY` é a mesma variável usada para qualquer tipo de AI. Apenas o `PROMPT_AI_TYPE` muda.
- `PROMPT_API_URL` é genérica e funciona para qualquer tipo de AI (opcional, tem valor padrão).
- Se você não tem acesso à API privada do Cursor, use Claude Code.

**Como obter a chave (se disponível):**

1. Acesse: `https://cursor.sh/settings`
2. Navegue até API/Integrations
3. Gere ou copie o token
4. Use como `PROMPT_AI_KEY`
5. **Nota**: Pode ser necessário fornecer uma URL customizada via `PROMPT_API_URL`

### 2. Claude Code (`CLAUDE_CODE`) ⭐ **Recomendado**

Integração com a API da Anthropic (Claude). **Esta é a opção recomendada** pois possui uma API HTTP pública e funcional.

**Configuração:**

```env
PROMPT_AI_TYPE=CLAUDE_CODE
PROMPT_AI_KEY=sua_claude_api_key
PROMPT_API_URL=https://api.anthropic.com/v1  # Opcional, usa padrão se não fornecido
```

**Importante**:

- Use a mesma variável `PROMPT_AI_KEY`, apenas mude o `PROMPT_AI_TYPE`.
- `PROMPT_API_URL` é genérica e funciona para qualquer tipo de AI (opcional, tem valor padrão).

**Como obter a chave:**

1. Acesse: `https://console.anthropic.com/`
2. Crie uma conta ou faça login
3. Navegue até API Keys
4. Gere uma nova API key
5. Use como `PROMPT_AI_KEY`

## Uso

### Via Variáveis de Ambiente (Recomendado)

```typescript
// .env
PROMPT_AI_TYPE=CURSOR
PROMPT_AI_KEY=seu_token_aqui
PROMPT_API_URL=https://api.cursor.sh/v1  # Opcional

// código
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  // cursorApiToken é opcional se PROMPT_AI_KEY estiver definido
  githubToken: process.env.GITHUB_TOKEN,
});

const result = await pipeline.process({
  prompt: 'Criar componente React',
});
```

### Via Configuração Explícita

```typescript
import { Pipeline, AIProviderFactory } from '@arranjae/automate-features';

// Criar provider manualmente
const aiProvider = AIProviderFactory.create('CLAUDE_CODE', 'sua_api_key');

// Usar no CodeGenerator
import { CodeGenerator } from '@arranjae/automate-features';

const generator = new CodeGenerator(aiProvider);
const code = await generator.generate('Criar função utilitária');
```

### Via Pipeline com Token e URL

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: 'seu_token_aqui', // Usará PROMPT_AI_TYPE do env ou padrão CURSOR
  apiUrl: 'https://api.cursor.sh/v1', // Opcional, sobrescreve PROMPT_API_URL e padrão
  githubToken: process.env.GITHUB_TOKEN,
});

const result = await pipeline.process({
  prompt: 'Criar componente',
});
```

## Adicionar Novo Provedor

Para adicionar um novo provedor de AI:

1. **Criar implementação do provider:**

```typescript
// src/integrations/providers/NovoProvider.ts
import { AIProvider, GeneratorConfig } from '../AIProvider';

export class NovoProvider implements AIProvider {
  constructor(apiKey: string) {
    // Inicialização
  }

  async generateCode(prompt: string, config?: GeneratorConfig): Promise<string> {
    // Implementação da geração de código
  }

  async validateConnection(): Promise<boolean> {
    // Validação de conexão
  }
}
```

2. **Atualizar AIProviderFactory:**

```typescript
// src/integrations/AIProviderFactory.ts
export type AIProviderType = 'CURSOR' | 'CLAUDE_CODE' | 'NOVO_PROVIDER';

static create(type: AIProviderType, apiKey: string): AIProvider {
  switch (type) {
    case 'CURSOR':
      return new CursorProvider(apiKey);
    case 'CLAUDE_CODE':
      return new ClaudeCodeProvider(apiKey);
    case 'NOVO_PROVIDER':
      return new NovoProvider(apiKey);
    default:
      throw new Error(`Unsupported AI provider type: ${type}`);
  }
}
```

3. **Exportar no index.ts:**

```typescript
export { NovoProvider } from './integrations/providers/NovoProvider';
```

## Comparação de Provedores

| Característica     | Cursor                     | Claude Code                    |
| ------------------ | -------------------------- | ------------------------------ |
| API Base           | `https://api.cursor.sh/v1` | `https://api.anthropic.com/v1` |
| Autenticação       | Bearer Token               | x-api-key                      |
| Timeout            | 60s                        | 60s                            |
| Modelo             | Cursor Engine              | claude-3-5-sonnet              |
| Extração de código | Direto                     | Via markdown blocks            |

## Troubleshooting

### Erro: "AI provider token/key is required"

- Verifique se `PROMPT_AI_KEY` está definido
- Ou use `CURSOR_API_TOKEN` para compatibilidade

### Erro: "Unsupported AI provider type"

- Verifique se `PROMPT_AI_TYPE` é `CURSOR` ou `CLAUDE_CODE`
- Valores são case-insensitive

### Erro: "Claude Code API error"

- Verifique se a API key está correta
- Confirme que tem créditos na conta Anthropic
- Verifique a URL da API (pode ser configurada via `CLAUDE_CODE_API_URL`)
