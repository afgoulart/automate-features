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
CURSOR_API_TOKEN=seu_token_aqui
GITHUB_TOKEN=seu_token_github_aqui
```

### 2. Uso Básico

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.CURSOR_API_TOKEN!,
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

## Documentação Completa

- 📖 **[Guia de Uso](./docs/USAGE.md)** - Exemplos práticos e casos de uso
- 📚 **[API Reference](./docs/API.md)** - Documentação completa da API
- 🎯 **[SOLID](./docs/SOLID.md)** - Sobre validação de princípios SOLID
- 🧩 **[Atomic Design](./docs/ATOMIC_DESIGN.md)** - Sobre validação de Atomic Design
- 📦 **[Publicação](./docs/PUBLISHING.md)** - Como publicar no NPM

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

## Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para detalhes.

## Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.
