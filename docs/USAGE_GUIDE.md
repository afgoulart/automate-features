# Guia Completo de Uso

Guia detalhado para usar o **@arranjae/automate-features** em diferentes cenários.

## Sumário

- [Instalação](#instalação)
- [Configuração Inicial](#configuração-inicial)
- [Modos de Operação](#modos-de-operação)
- [Casos de Uso](#casos-de-uso)
- [Parâmetros e Opções](#parâmetros-e-opções)
- [Boas Práticas](#boas-práticas)
- [Troubleshooting](#troubleshooting)

## Instalação

### Via NPM

```bash
npm install -g @arranjae/automate-features
```

### Via PNPM

```bash
pnpm add -g @arranjae/automate-features
```

### Instalação Local (Desenvolvimento)

```bash
git clone https://github.com/arranjae/automate-features.git
cd automate-features
pnpm install
cargo build --release
```

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do seu projeto:

```bash
# Provider de AI (CURSOR ou CLAUDE_CODE)
PROMPT_AI_TYPE=CLAUDE_CODE

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-xxx  # Para Claude Code
CURSOR_API_TOKEN=your-cursor-token   # Para Cursor

# GitHub (opcional - para criar branches/PRs)
GITHUB_TOKEN=ghp_xxx
GITHUB_REPO_OWNER=seu-usuario
GITHUB_REPO_NAME=seu-repo

# Modo CLI (opcional)
USE_CLI=true  # Usa Claude CLI local em vez de API
```

### 2. Instalar Claude Code CLI (Opcional)

Se quiser usar o modo CLI:

```bash
# Instalar Claude Code CLI
npm install -g @anthropic/claude-cli

# Verificar instalação
claude --version
```

## Modos de Operação

### Modo 1: API HTTP (Padrão)

Usa a API HTTP diretamente. Mais rápido para projetos pequenos.

```bash
pnpm automate-features --source=./src ./features/new-feature.md
```

**Vantagens:**
- Não requer instalação de CLIs adicionais
- Funciona em qualquer ambiente
- Controle fino sobre timeouts e retries

**Desvantagens:**
- Pode ser mais lento para projetos grandes
- Requer envio de contexto via rede

### Modo 2: CLI Local (Recomendado)

Usa o Claude Code CLI instalado localmente.

```bash
USE_CLI=true pnpm automate-features --source=./src ./features/new-feature.md
```

**Vantagens:**
- Acesso direto aos arquivos do projeto
- Melhor performance para projetos grandes
- Não precisa enviar contexto via API

**Desvantagens:**
- Requer Claude CLI instalado
- Apenas para Claude Code (Cursor não tem CLI)

## Casos de Uso

### Caso 1: Criar Nova Feature

**Cenário:** Adicionar um sistema de autenticação OAuth2

**1. Crie o arquivo de definição:**

```markdown
# features/oauth2-auth.md

## Objetivo
Implementar autenticação OAuth2 com Google e GitHub

## Requisitos
- Suporte para Google OAuth2
- Suporte para GitHub OAuth2
- Armazenamento seguro de tokens
- Refresh automático de tokens
- Middleware de autenticação

## Stack Técnica
- Node.js + Express
- Passport.js
- JWT para sessões
- MongoDB para armazenamento

## Arquitetura
- Seguir padrão MVC
- Aplicar princípios SOLID
- Testes unitários com Jest
- Testes E2E com Supertest

## Rotas
- POST /auth/google
- POST /auth/github
- GET /auth/callback/google
- GET /auth/callback/github
- POST /auth/refresh
- POST /auth/logout
```

**2. Execute o comando:**

```bash
USE_CLI=true pnpm automate-features \
  --source=$(pwd) \
  --prompt-type=CLAUDE_CODE \
  ./features/oauth2-auth.md
```

**3. Resultado:**
- Código gerado em `generated-code.md`
- Opção para gerar documentação
- Opção para criar branch Git

### Caso 2: Corrigir Bug Complexo

**1. Descreva o bug:**

```markdown
# bugs/memory-leak.md

## Problema
Memory leak no processamento de uploads grandes

## Sintomas
- Memória cresce constantemente
- Não há liberação após uploads
- Server crash após ~100 uploads

## Contexto
Arquivo: src/services/UploadService.ts
Função: processLargeFile()

## Solução Esperada
- Usar streams para processar arquivos
- Liberar memória adequadamente
- Adicionar testes de stress
- Documentar limites de tamanho
```

**2. Execute:**

```bash
USE_CLI=true pnpm automate-features \
  --source=./src \
  ./bugs/memory-leak.md
```

### Caso 3: Refatoração

**1. Descreva a refatoração:**

```markdown
# refactor/extract-validators.md

## Objetivo
Extrair validações para módulo dedicado

## Escopo
Arquivos afetados:
- src/api/UserController.ts
- src/api/ProductController.ts
- src/api/OrderController.ts

## Ação
1. Criar pasta src/validators/
2. Extrair validações inline
3. Usar biblioteca class-validator
4. Aplicar decorators
5. Centralizar mensagens de erro
6. Adicionar testes para cada validador

## Princípios
- Single Responsibility
- DRY (Don't Repeat Yourself)
- Validações reusáveis
```

**2. Execute:**

```bash
USE_CLI=true pnpm automate-features \
  --source=./src \
  ./refactor/extract-validators.md
```

### Caso 4: Adicionar Testes

**1. Especifique os testes:**

```markdown
# tests/add-payment-tests.md

## Objetivo
Adicionar cobertura de testes para PaymentService

## Escopo
Arquivo: src/services/PaymentService.ts

## Testes Necessários

### Testes Unitários (Jest)
- Processar pagamento com sucesso
- Falha por cartão inválido
- Falha por valor negativo
- Timeout de gateway
- Retry automático
- Webhook de confirmação

### Testes de Integração
- Fluxo completo de pagamento
- Estorno de pagamento
- Parcelamento

### Mocks
- Mock do gateway de pagamento
- Mock do banco de dados
- Mock de serviços externos

## Cobertura Esperada
Mínimo 90% de cobertura
```

**2. Execute:**

```bash
USE_CLI=true pnpm automate-features \
  --source=./src \
  ./tests/add-payment-tests.md
```

### Caso 5: Criar Documentação

**1. Especifique a documentação:**

```markdown
# docs/api-documentation.md

## Objetivo
Gerar documentação completa da API REST

## Formato
- OpenAPI 3.0 (Swagger)
- Markdown para README
- Exemplos de requisições
- Códigos de erro

## Endpoints a Documentar
- /api/users/*
- /api/products/*
- /api/orders/*
- /api/auth/*

## Incluir
- Schemas de request/response
- Códigos de status HTTP
- Exemplos com curl
- Autenticação necessária
- Rate limiting
```

**2. Execute:**

```bash
USE_CLI=true pnpm automate-features \
  --source=./src \
  ./docs/api-documentation.md
```

## Parâmetros e Opções

### Parâmetros Obrigatórios

```bash
pnpm automate-features <arquivo.md>
```

- `<arquivo.md>` - Arquivo markdown com instruções

### Parâmetros Opcionais

#### `--source=<diretório>`
Define o diretório de contexto do projeto.

```bash
--source=/caminho/completo/para/projeto
--source=$(pwd)
--source=./src
```

#### `--prompt-type=<TIPO>`
Define o provider de AI.

```bash
--prompt-type=CLAUDE_CODE  # Usa Claude Code
--prompt-type=CURSOR       # Usa Cursor
```

#### `--propt-key=<KEY>` ou `--prompt-key=<KEY>`
API key do provider.

```bash
--prompt-key=sk-ant-api03-xxx
```

#### `--propt-api-url=<URL>`
URL customizada da API (para Cursor).

```bash
--prompt-api-url=https://api.cursor.sh/v1
```

### Variáveis de Ambiente

#### `USE_CLI=true`
Ativa modo CLI (apenas Claude Code).

```bash
USE_CLI=true pnpm automate-features ./feature.md
```

#### `PROMPT_AI_TYPE`
Provider padrão (se não especificado via `--prompt-type`).

```bash
export PROMPT_AI_TYPE=CLAUDE_CODE
```

#### `ANTHROPIC_API_KEY`
API key do Claude (Claude Code).

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

#### `CURSOR_API_TOKEN`
API token do Cursor.

```bash
export CURSOR_API_TOKEN=your-token
```

#### GitHub (Opcional)

```bash
export GITHUB_TOKEN=ghp_xxx
export GITHUB_REPO_OWNER=usuario
export GITHUB_REPO_NAME=repositorio
```

## Boas Práticas

### 1. Estrutura de Arquivos de Feature

Organize seus arquivos de feature:

```
features/
├── authentication/
│   ├── oauth2.md
│   └── jwt-refresh.md
├── payments/
│   ├── stripe-integration.md
│   └── webhook-handling.md
└── notifications/
    ├── email-service.md
    └── push-notifications.md
```

### 2. Seja Específico nas Instruções

❌ **Ruim:**
```markdown
Criar um sistema de autenticação
```

✅ **Bom:**
```markdown
# Sistema de Autenticação JWT

## Stack
- Express.js
- Passport.js
- bcrypt para hash
- jsonwebtoken

## Features
- Registro de usuário com validação de email
- Login com email/senha
- Refresh token (7 dias)
- Access token (15 minutos)
- Logout (blacklist de tokens)

## Endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

## Validações
- Email válido
- Senha mínimo 8 caracteres
- Senha deve conter: maiúscula, minúscula, número, símbolo
```

### 3. Contexto Adequado

Use `--source` para limitar o contexto:

```bash
# Apenas backend
--source=./src/backend

# Apenas frontend
--source=./src/frontend

# Módulo específico
--source=./src/modules/payments
```

### 4. Iteração Incremental

Não tente fazer tudo de uma vez:

1. **Primeira iteração:** Estrutura básica
2. **Segunda iteração:** Lógica de negócio
3. **Terceira iteração:** Testes
4. **Quarta iteração:** Documentação

### 5. Review do Código Gerado

Sempre revise o código antes de commitar:

```bash
# Código será salvo em generated-code.md
cat generated-code.md

# Copie para os arquivos apropriados
# Revise cada mudança
# Teste localmente
# Commit apenas após verificação
```

## Troubleshooting

### Problema: "CLI not found"

**Erro:**
```
Failed to execute claude CLI: No such file or directory
```

**Solução:**
```bash
# Instale o Claude CLI
npm install -g @anthropic/claude-cli

# Ou desative o modo CLI
USE_CLI=false pnpm automate-features ./feature.md
```

### Problema: Timeout

**Erro:**
```
Request timeout after 120000ms
```

**Solução:**
```bash
# Reduza o escopo do source
--source=./src/specific-module

# Ou use CLI mode (mais rápido)
USE_CLI=true pnpm automate-features ./feature.md
```

### Problema: "API key is required"

**Erro:**
```
--propt-key é obrigatório ou defina ANTHROPIC_API_KEY no .env
```

**Solução:**
```bash
# Opção 1: Via parâmetro
--prompt-key=sk-ant-api03-xxx

# Opção 2: Via .env
echo "ANTHROPIC_API_KEY=sk-ant-api03-xxx" >> .env

# Opção 3: Via export
export ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

### Problema: Código Incompleto

**Sintoma:** Código gerado está truncado ou incompleto

**Solução:**
```bash
# Use modo CLI (sem limite de contexto)
USE_CLI=true pnpm automate-features ./feature.md

# Ou divida em múltiplas features menores
```

### Problema: Erro de Build Rust

**Erro:**
```
error: failed to select a version for napi-build
```

**Solução:**
```bash
cd rust  # ou diretório raiz se Cargo.toml está lá
cargo clean
cargo build --release
```

### Problema: Módulo Rust não Encontrado

**Erro:**
```
Cannot find module 'automate_features_rust.node'
```

**Solução:**
```bash
# Reconstrua o módulo
cargo build --release

# Copie para o local correto
cp target/release/libautomate_features_rust.dylib target/release/automate_features_rust.node

# Linux:
cp target/release/libautomate_features_rust.so target/release/automate_features_rust.node
```

## Exemplos Avançados

### Exemplo 1: Pipeline Completo com GitHub

```bash
# 1. Criar feature
USE_CLI=true \
GITHUB_TOKEN=ghp_xxx \
GITHUB_REPO_OWNER=myuser \
GITHUB_REPO_NAME=myrepo \
pnpm automate-features \
  --source=$(pwd) \
  ./features/user-dashboard.md

# Isso vai:
# - Gerar código
# - Criar branch feature/user-dashboard
# - Criar issue no GitHub
# - Fazer commit do código
# - Criar Pull Request
# - Executar code review
```

### Exemplo 2: Múltiplas Features

```bash
# Script para processar múltiplas features
for feature in features/*.md; do
  echo "Processing $feature..."
  USE_CLI=true pnpm automate-features --source=$(pwd) "$feature"
  sleep 10  # Evitar rate limiting
done
```

### Exemplo 3: CI/CD Integration

```yaml
# .github/workflows/auto-features.yml
name: Auto Generate Features

on:
  push:
    paths:
      - 'features/*.md'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: pnpm install

      - name: Generate code
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          USE_CLI: true
        run: |
          for feature in features/*.md; do
            pnpm automate-features --source=$(pwd) "$feature"
          done

      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'feat: auto-generated features'
          branch: auto-features
          title: 'Auto-generated Features'
```

## Próximos Passos

- Leia [CONTRIBUTING.md](../CONTRIBUTING.md) para contribuir
- Veja [exemplos completos](./examples/)
- Consulte [API_PROVIDERS.md](./AI_PROVIDERS.md) para configurar providers
- Entre na [comunidade](https://github.com/arranjae/automate-features/discussions)

---

**Precisa de ajuda?** Abra uma [issue](https://github.com/arranjae/automate-features/issues) ou [discussion](https://github.com/arranjae/automate-features/discussions).
