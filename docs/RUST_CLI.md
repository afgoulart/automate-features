# Rust CLI Integration

Este documento explica como usar a integração Rust para executar os CLIs do Cursor e Claude Code em vez de usar as APIs HTTP.

## Visão Geral

A integração Rust permite:

- Executar os CLIs do Cursor e Claude Code diretamente
- Coletar automaticamente o código fonte do projeto como contexto
- Melhor performance e controle sobre a execução

## Arquitetura

```
TypeScript/Node.js
    ↓
rust-bindings.ts (wrapper)
    ↓
Rust NAPI Module (automate_features_rust.node)
    ↓
CLI executables (cursor, claude)
```

## Pré-requisitos

1. **Rust instalado**:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **CLI do Cursor ou Claude Code instalado**:
   - Cursor: https://cursor.sh/docs/getting-started
   - Claude Code: https://docs.anthropic.com/claude/docs/cli

## Build

### Build do módulo Rust

```bash
# Build de release (recomendado)
npm run build:rust

# Build de desenvolvimento
npm run build:rust:dev
```

### Build completo

```bash
npm run build
```

Isso irá:

1. Compilar o módulo Rust
2. Compilar TypeScript
3. Criar os bundles

## Uso

### Modo CLI via Environment Variables

```bash
# Usar CLI do Cursor
export USE_CLI=true
export PROMPT_AI_TYPE=CURSOR
export PROMPT_AI_KEY=seu_token
export SOURCE_DIR=/caminho/para/projeto

npm run automate-features -- --propt-key=$PROMPT_AI_KEY --source=$SOURCE_DIR feature.md
```

### Modo CLI via código TypeScript

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.PROMPT_AI_KEY,
  useCli: true, // Habilita modo CLI
  sourceDir: process.cwd(), // Diretório do projeto
});

const result = await pipeline.process({
  prompt: 'Criar componente de login',
  runCodeReview: true,
});
```

### Usar Factory diretamente

```typescript
import { AIProviderFactory } from '@arranjae/automate-features';

// Criar provider CLI
const provider = AIProviderFactory.create(
  'CURSOR',
  process.env.PROMPT_AI_KEY!,
  undefined, // apiUrl não usado em CLI mode
  true, // useCli
  process.cwd() // sourceDir
);

const code = await provider.generateCode('Criar função de validação');
```

## Como Funciona

### 1. Coleta de Código Fonte

O Rust coleta automaticamente arquivos de código do diretório especificado:

- Arquivos suportados: `.ts`, `.tsx`, `.js`, `.jsx`, `.rs`, `.py`, `.go`, `.java`, `.cpp`, `.c`, `.h`
- Respeita `.gitignore` e `.ignore`
- Ignora `node_modules`, `target`, `dist`, etc.

### 2. Execução do CLI

O Rust executa o CLI apropriado com:

- Prompt completo (incluindo contexto do código)
- API key/token via variáveis de ambiente
- Captura de stdout/stderr

### 3. Retorno do Código

O código gerado é retornado para o TypeScript e processado normalmente.

## Vantagens do Modo CLI

✅ **Contexto Completo**: O CLI recebe todo o código fonte do projeto  
✅ **Melhor Performance**: Execução direta sem overhead HTTP  
✅ **Controle Total**: Pode usar todas as features do CLI  
✅ **Offline**: Alguns CLIs podem funcionar offline

## Desvantagens

⚠️ **Dependência Externa**: Requer CLI instalado  
⚠️ **Build Adicional**: Precisa compilar Rust  
⚠️ **Mais Complexo**: Setup mais complexo

## Troubleshooting

### Erro: "Rust module not found"

```bash
# Build o módulo Rust primeiro
npm run build:rust
```

### Erro: "Cursor CLI is not available"

```bash
# Verifique se o CLI está instalado
which cursor
cursor --version

# Se não estiver, instale:
# https://cursor.sh/docs/getting-started
```

### Erro: "Failed to execute cursor CLI"

- Verifique se `CURSOR_API_KEY` está definido
- Verifique se o CLI está no PATH
- Teste manualmente: `cursor generate --prompt "test"`

### Erro de compilação Rust

```bash
# Limpe e rebuild
npm run clean:rust
npm run build:rust
```

## Desenvolvimento

### Estrutura Rust

```
rust/
├── Cargo.toml
├── build.rs
└── src/
    └── lib.rs
```

### Modificar Código Rust

1. Edite `rust/src/lib.rs`
2. Rebuild: `npm run build:rust`
3. Teste: `npm run example`

### Debug

```bash
# Build com debug
npm run build:rust:dev

# Ver logs
RUST_LOG=debug npm run example
```

## Referências

- [NAPI-RS Documentation](https://napi.rs/)
- [Rust Async](https://rust-lang.github.io/async-book/)
- [Cursor CLI Docs](https://cursor.sh/docs)
- [Claude CLI Docs](https://docs.anthropic.com/claude/docs/cli)
