# @arranjae/automate-features

Módulo de automação de desenvolvimento com geração de código, code review e integração com pipelines.

## Características

- 📦 **Pacote NPM** - Instalável como dependência em qualquer projeto
- 🔌 **API Simples** - Interface clara e fácil de integrar
- ⚙️ **Configurável** - Adaptável a diferentes pipelines e workflows
- 🔄 **Reutilizável** - Pode ser usado em múltiplos projetos
- 🚀 **Plug & Play** - Integração rápida em pipelines existentes

## Instalação

```bash
npm install @arranjae/automate-features
```

## Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# .env
# ⭐ Recomendado: Use Claude Code (API pública e funcional)
PROMPT_AI_TYPE=CLAUDE_CODE
PROMPT_AI_KEY=sua_claude_api_key_aqui

# Ou Cursor (pode não ter API pública)
# PROMPT_AI_TYPE=CURSOR
# PROMPT_AI_KEY=seu_token_cursor_aqui
# PROMPT_API_URL=https://sua-url-privada  # Se necessário

# GitHub (opcional)
GITHUB_TOKEN=seu_token_github_aqui
```

### 2. Uso Básico

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  // cursorApiToken é opcional se PROMPT_AI_KEY estiver definido
  cursorApiToken: process.env.PROMPT_AI_KEY || process.env.CURSOR_API_TOKEN,
  // apiUrl é opcional, sobrescreve PROMPT_API_URL e padrão do provedor
  apiUrl: process.env.PROMPT_API_URL,
  githubToken: process.env.GITHUB_TOKEN,
  repoOwner: 'seu-usuario',
  repoName: 'seu-repositorio',
});

// Gerar código, criar branch e PR com review automático
const result = await pipeline.process({
  prompt: 'Criar componente de login com validação',
  createBranch: true,
  createPR: true,
  runCodeReview: true,
});

if (result.success) {
  console.log(`✅ PR criada: #${result.prNumber}`);
  console.log(`✅ Review: ${result.review?.passed ? 'Passou' : 'Falhou'}`);
}
```

## 📚 Documentação e Wiki

### Começando

- 🚀 **[Quick Start CLI](./QUICK_START_CLI.md)** - Início rápido com a CLI
- 📖 **[Guia Completo de Uso](./docs/USAGE_GUIDE.md)** - Guia detalhado com exemplos práticos
- ❓ **[FAQ](./docs/FAQ.md)** - Perguntas frequentes e troubleshooting
- 🤝 **[Guia de Contribuição](./CONTRIBUTING.md)** - Como contribuir com o projeto

### Configuração

- ⚙️ **[Providers de AI](./docs/AI_PROVIDERS.md)** - Claude Code vs Cursor
- 🔧 **[Modo CLI](./docs/CLI_MODE.md)** - Usando Claude Code CLI local
- 🔑 **[GitHub Token Setup](./docs/GITHUB_TOKEN_SETUP.md)** - Configurar integração com GitHub
- 🎯 **[Claude Code Setup](./docs/CLAUDE_CODE_SETUP.md)** - Configurar Claude Code CLI

### Desenvolvimento

- 🧪 **[Testar Localmente](./docs/TESTING_LOCAL.md)** - Como testar o pacote em outro projeto
- 🦀 **[Rust CLI](./docs/RUST_CLI.md)** - Módulo Rust para performance
- 🎯 **[SOLID](./docs/SOLID.md)** - Validação de princípios SOLID
- 🧩 **[Atomic Design](./docs/ATOMIC_DESIGN.md)** - Validação de Atomic Design
- 📦 **[Publicação](./docs/PUBLISHING.md)** - Como publicar no NPM

### Guias Rápidos

- ⚡ **[Quick Start](./docs/QUICK_START.md)** - Início rápido
- 🔍 **[GitHub Token Quick](./docs/GITHUB_TOKEN_QUICK.md)** - Setup rápido do GitHub
- 🐛 **[Cursor API Issue](./docs/CURSOR_API_ISSUE.md)** - Problemas conhecidos com Cursor

## Exemplos Rápidos

### GitHub Actions

```yaml
- name: Generate code
  run: |
    npm install @arranjae/automate-features
    node -e "const {Pipeline} = require('@arranjae/automate-features');..."
```

### Script Node.js

```javascript
const { Pipeline } = require('@arranjae/automate-features');
const pipeline = new Pipeline({
  cursorApiToken: process.env.CURSOR_API_TOKEN,
});
const result = await pipeline.process({ prompt: 'Seu prompt aqui' });
```

Veja mais exemplos em [docs/USAGE.md](./docs/USAGE.md).

## Requisitos

- Node.js >= 16.0.0
- TypeScript >= 4.0.0 (peer dependency)

## Estrutura do Bundle

O pacote inclui:

- ✅ **Arquivos compilados** (CommonJS + ES Modules)
- ✅ **Arquivos TypeScript fonte** (`src/` e `dist/*.ts`)
- ✅ **Definições de tipos** (`.d.ts`)
- ✅ **Source maps** para debugging

Veja [docs/BUNDLE.md](./docs/BUNDLE.md) para detalhes completos sobre a estrutura do bundle.

## CI/CD

O projeto usa GitHub Actions para CI/CD:

- ✅ **CI**: Executa testes e lint em cada PR
- 📦 **Publish**: Publica automaticamente no NPM quando há uma nova release

Veja [docs/PUBLISHING.md](./docs/PUBLISHING.md) para detalhes sobre publicação.

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja como você pode ajudar:

- 🐛 **Reportar Bugs** - [Abrir Issue](https://github.com/arranjae/automate-features/issues/new?template=bug_report.md)
- 💡 **Sugerir Features** - [Abrir Issue](https://github.com/arranjae/automate-features/issues/new?template=feature_request.md)
- 📖 **Melhorar Docs** - [Criar PR](https://github.com/arranjae/automate-features/pulls)
- 💻 **Contribuir Código** - Leia o [Guia de Contribuição](./CONTRIBUTING.md)
- 💬 **Discussões** - [Participar](https://github.com/arranjae/automate-features/discussions)

### Processo Rápido

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

Leia o [CONTRIBUTING.md](./CONTRIBUTING.md) completo para mais detalhes.

## 🗺️ Roadmap

### ✅ Versão 0.1.x (Atual)

**Funcionalidades Implementadas:**
- ✅ Geração de código via Claude Code API
- ✅ Geração de código via Claude Code CLI (modo local)
- ✅ Suporte inicial para Cursor API
- ✅ Módulo Rust (NAPI) para performance
- ✅ Integração com GitHub (branches, issues, PRs)
- ✅ Code review automático
- ✅ Validação SOLID e Atomic Design
- ✅ CLI interativa com perguntas pós-geração
- ✅ Documentação completa e wiki

### 🚧 Versão 0.2.0 (Próxima Release)

**Planejado para Q1 2025:**

**Novos Providers:**
- [ ] Suporte para GPT-4 (OpenAI)
- [ ] Suporte para Gemini (Google)
- [ ] Suporte para Llama 3 (local via Ollama)

**Melhorias de Performance:**
- [ ] Cache inteligente de contexto
- [ ] Geração incremental de código
- [ ] Paralelização de múltiplas features

**UX/DX:**
- [ ] Interface web local (dashboard)
- [ ] Preview de código antes de aplicar
- [ ] Modo interativo com seleção de arquivos
- [ ] Templates pré-configurados

### 🎯 Versão 0.3.0

**Planejado para Q2 2025:**

**Integrações:**
- [ ] VS Code Extension
- [ ] JetBrains Plugin
- [ ] Integração com Linear/Jira
- [ ] Suporte para GitLab
- [ ] Suporte para Bitbucket

**Qualidade de Código:**
- [ ] Análise estática avançada
- [ ] Sugestões de refatoração
- [ ] Detecção de code smells
- [ ] Métricas de complexidade

**Testes:**
- [ ] Geração automática de mocks
- [ ] Coverage mínimo configurável
- [ ] Testes de mutação

### 🚀 Versão 1.0.0

**Planejado para Q3 2025:**

**Enterprise Features:**
- [ ] Modo multi-usuário
- [ ] Controle de acesso (RBAC)
- [ ] Auditoria completa
- [ ] Métricas e analytics
- [ ] Self-hosted option

**Segurança:**
- [ ] Escaneamento de vulnerabilidades
- [ ] Detecção de secrets no código
- [ ] Compliance checks (OWASP, CWE)
- [ ] SAST integrado

**Escalabilidade:**
- [ ] Suporte para monorepos
- [ ] Geração distribuída
- [ ] Queue system para múltiplas tarefas
- [ ] API REST pública

### 💡 Ideias Futuras (Backlog)

**AI/ML:**
- [ ] Aprendizado com feedback do usuário
- [ ] Sugestões baseadas no histórico
- [ ] Detecção de padrões no codebase
- [ ] Fine-tuning de modelos

**Automação:**
- [ ] Deploy automático após review
- [ ] Testes automáticos em staging
- [ ] Rollback automático se testes falharem
- [ ] Notificações (Slack, Discord, Email)

**Colaboração:**
- [ ] Comentários inline no código gerado
- [ ] Sistema de votação para sugestões
- [ ] Compartilhamento de templates
- [ ] Marketplace de prompts

### 📊 Como Contribuir com o Roadmap

Você pode influenciar o roadmap:

1. **Vote em Features** - Adicione 👍 nas [Issues](https://github.com/arranjae/automate-features/issues) que você quer
2. **Sugira Novas Features** - Abra uma [Discussion](https://github.com/arranjae/automate-features/discussions/categories/ideas)
3. **Implemente Features** - Escolha uma issue "help wanted" e envie um PR
4. **Patrocine o Projeto** - Recursos ajudam a priorizar desenvolvimento

### 🎯 Prioridades Atuais

1. **Estabilidade** - Corrigir bugs críticos
2. **Performance** - Otimizar geração de código
3. **Documentação** - Melhorar guias e exemplos
4. **Novos Providers** - Expandir opções de IA
5. **Testes** - Aumentar cobertura de testes

### 📅 Cronograma de Releases

| Versão | Data Prevista | Status |
|--------|--------------|--------|
| 0.1.0 | Nov 2024 | ✅ Released |
| 0.1.1 | Dez 2024 | ✅ Released |
| 0.2.0 | Mar 2025 | 🚧 Em Desenvolvimento |
| 0.3.0 | Jun 2025 | 📋 Planejado |
| 1.0.0 | Set 2025 | 📋 Planejado |

### 🔔 Acompanhe o Desenvolvimento

- ⭐ **Star** no GitHub para receber atualizações
- 👁️ **Watch** o repositório para notificações
- 📢 Siga nas [Discussions](https://github.com/arranjae/automate-features/discussions)
- 📰 Leia o [CHANGELOG](./CHANGELOG.md)

## Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.
