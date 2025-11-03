# Guia de Uso - @arranjae/automate-features

Este guia explica como usar o módulo `@arranjae/automate-features` em diferentes cenários.

## Instalação

```bash
npm install @arranjae/automate-features
```

## Configuração Inicial

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do seu projeto:

```env
CURSOR_API_TOKEN=seu_token_cursor_aqui
GITHUB_TOKEN=seu_token_github_aqui
```

Ou exporte as variáveis no seu ambiente:

```bash
export CURSOR_API_TOKEN=seu_token_cursor_aqui
export GITHUB_TOKEN=seu_token_github_aqui
```

### 2. Obter as Credenciais

#### Cursor API Token
1. Acesse: `https://cursor.sh/settings`
2. Navegue até a seção de API/Integrations
3. Gere ou copie o token
4. Adicione ao `.env` como `CURSOR_API_TOKEN`

#### GitHub Token
1. Acesse: `https://github.com/settings/tokens`
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Selecione as permissões:
   - `repo` (acesso completo a repositórios)
   - `workflow` (atualizar GitHub Actions)
   - `write:issues` (criar e editar issues)
   - `pull_requests:write` (criar e editar PRs)
4. Adicione ao `.env` como `GITHUB_TOKEN`

## Uso Básico

### Exemplo 1: Gerar Código Simples

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.CURSOR_API_TOKEN!,
  config: {
    solidRules: true,
    atomicDesign: false,
    lintRules: ['eslint'],
  },
});

// Gerar código sem criar branch/PR
const result = await pipeline.process({
  prompt: 'Criar uma função que calcula o IMC de uma pessoa',
  createBranch: false,
  createIssue: false,
  createPR: false,
  runCodeReview: true,
});

console.log('Código gerado:', result.code);
console.log('Review:', result.review);
```

### Exemplo 2: Workflow Completo com GitHub

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.CURSOR_API_TOKEN!,
  githubToken: process.env.GITHUB_TOKEN!,
  repoOwner: 'seu-usuario',
  repoName: 'seu-repositorio',
  config: {
    solidRules: true,
    atomicDesign: true,
    lintRules: ['eslint', 'prettier'],
    autoApprove: false,
  },
});

// Workflow completo: gerar código, criar branch, issue e PR
const result = await pipeline.process({
  prompt: 'Criar componente React de login com validação de formulário',
  createBranch: true,
  createIssue: true,
  createPR: true,
  runCodeReview: true,
});

if (result.success) {
  console.log(`✅ Branch criada: ${result.branchName}`);
  console.log(`✅ Issue criada: #${result.issueNumber}`);
  console.log(`✅ PR criada: #${result.prNumber}`);
  console.log(`✅ Review: ${result.review?.passed ? 'Passou' : 'Falhou'}`);
} else {
  console.error('❌ Erro:', result.error);
}
```

## Casos de Uso

### Caso 1: Integração em GitHub Actions

Crie um arquivo `.github/workflows/generate-code.yml`:

```yaml
name: Generate Code from Prompt

on:
  workflow_dispatch:
    inputs:
      prompt:
        description: 'Descrição da feature a ser gerada'
        required: true
        type: string

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
        run: npm install @arranjae/automate-features
      
      - name: Generate code
        env:
          CURSOR_API_TOKEN: ${{ secrets.CURSOR_API_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          node -e "
          const { Pipeline } = require('@arranjae/automate-features');
          const pipeline = new Pipeline({
            cursorApiToken: process.env.CURSOR_API_TOKEN,
            githubToken: process.env.GITHUB_TOKEN,
            repoOwner: '${{ github.repository_owner }}',
            repoName: '${{ github.event.repository.name }}',
          });
          pipeline.process({
            prompt: '${{ github.event.inputs.prompt }}',
            createBranch: true,
            createPR: true,
            runCodeReview: true,
          }).then(result => {
            console.log('Resultado:', JSON.stringify(result, null, 2));
          });
          "
```

**Como usar:**
1. Vá em "Actions" no GitHub
2. Selecione "Generate Code from Prompt"
3. Clique em "Run workflow"
4. Digite o prompt descrevendo a feature
5. Execute

### Caso 2: Script Node.js Standalone

Crie um arquivo `generate.js`:

```javascript
#!/usr/bin/env node

const { Pipeline } = require('@arranjae/automate-features');
require('dotenv').config();

async function main() {
  const prompt = process.argv[2];
  
  if (!prompt) {
    console.error('Uso: node generate.js "seu prompt aqui"');
    process.exit(1);
  }

  const pipeline = new Pipeline({
    cursorApiToken: process.env.CURSOR_API_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    repoOwner: process.env.GITHUB_REPO_OWNER,
    repoName: process.env.GITHUB_REPO_NAME,
    config: {
      solidRules: true,
      atomicDesign: true,
      lintRules: ['eslint'],
    },
  });

  console.log('🚀 Processando prompt...\n');
  
  const result = await pipeline.process({
    prompt,
    createBranch: true,
    createIssue: true,
    createPR: true,
    runCodeReview: true,
  });

  if (result.success) {
    console.log('\n✅ Sucesso!');
    console.log(`📝 Código gerado: ${result.code?.substring(0, 100)}...`);
    if (result.branchName) console.log(`🌿 Branch: ${result.branchName}`);
    if (result.issueNumber) console.log(`📋 Issue: #${result.issueNumber}`);
    if (result.prNumber) console.log(`🔀 PR: #${result.prNumber}`);
    if (result.review) {
      console.log(`\n📊 Review: ${result.review.passed ? '✅ Passou' : '❌ Falhou'}`);
      console.log(`   ${result.review.summary}`);
    }
  } else {
    console.error('\n❌ Erro:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
```

**Como usar:**
```bash
node generate.js "Criar componente de botão reutilizável"
```

### Caso 3: Integração em CI/CD (Jenkins)

Crie um arquivo `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    environment {
        CURSOR_API_TOKEN = credentials('cursor-api-token')
        GITHUB_TOKEN = credentials('github-token')
    }
    
    parameters {
        string(name: 'PROMPT', defaultValue: '', description: 'Descrição da feature')
    }
    
    stages {
        stage('Generate Code') {
            steps {
                script {
                    sh '''
                        npm install @arranjae/automate-features
                        node -e "
                        const { Pipeline } = require('@arranjae/automate-features');
                        const pipeline = new Pipeline({
                            cursorApiToken: process.env.CURSOR_API_TOKEN,
                            githubToken: process.env.GITHUB_TOKEN,
                            repoOwner: '${GITHUB_REPO_OWNER}',
                            repoName: '${GITHUB_REPO_NAME}',
                        });
                        pipeline.process({
                            prompt: '${PROMPT}',
                            createBranch: true,
                            createPR: true,
                            runCodeReview: true,
                        }).then(result => {
                            if (result.success) {
                                echo '✅ Código gerado com sucesso'
                                echo \"Branch: \${result.branchName}\"
                                echo \"PR: #\${result.prNumber}\"
                            } else {
                                error(\"❌ Erro: \${result.error}\")
                            }
                        });
                        "
                    '''
                }
            }
        }
    }
}
```

### Caso 4: Uso Programático Avançado

```typescript
import { 
  Pipeline, 
  CodeGenerator, 
  CodeReviewer,
  SolidValidator,
  AtomicDesignValidator 
} from '@arranjae/automate-features';

// Usar componentes individualmente
async function exemploAvancado() {
  // 1. Gerar código
  const codeGenerator = new CodeGenerator(process.env.CURSOR_API_TOKEN!);
  const code = await codeGenerator.generate(
    'Criar função de validação de email',
    { language: 'typescript' }
  );

  // 2. Validar SOLID
  const solidValidator = new SolidValidator();
  const solidResult = await solidValidator.validate(code.code, 'src/utils/email.ts');
  
  if (!solidResult.passed) {
    console.log('⚠️ Violações SOLID encontradas:');
    solidResult.issues.forEach(issue => {
      console.log(`  - ${issue.message}`);
    });
  }

  // 3. Validar Atomic Design (se for componente)
  const atomicValidator = new AtomicDesignValidator();
  const atomicResult = await atomicValidator.validate(code.code, 'src/components/EmailInput.tsx');

  // 4. Revisar código completo
  const reviewer = new CodeReviewer({
    solidRules: true,
    atomicDesign: true,
    lintRules: ['eslint'],
  });
  
  const review = await reviewer.review(code.code, code.filePath);
  console.log('Review completo:', review);
}

exemploAvancado();
```

### Caso 5: CLI Customizado

Crie um arquivo `cli.js` para uso como comando:

```javascript
#!/usr/bin/env node

const { Pipeline } = require('@arranjae/automate-features');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🚀 Optimized Process CLI\n');
  
  const prompt = await askQuestion('Digite o prompt da feature: ');
  const createBranch = (await askQuestion('Criar branch? (s/n): ')).toLowerCase() === 's';
  const createPR = (await askQuestion('Criar PR? (s/n): ')).toLowerCase() === 's';
  const runReview = (await askQuestion('Executar code review? (s/n): ')).toLowerCase() === 's';

  const pipeline = new Pipeline({
    cursorApiToken: process.env.CURSOR_API_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    repoOwner: process.env.GITHUB_REPO_OWNER,
    repoName: process.env.GITHUB_REPO_NAME,
  });

  console.log('\n⏳ Processando...\n');

  const result = await pipeline.process({
    prompt,
    createBranch,
    createPR,
    runCodeReview: runReview,
  });

  if (result.success) {
    console.log('✅ Sucesso!\n');
    console.log('Resultado:', JSON.stringify(result, null, 2));
  } else {
    console.error('❌ Erro:', result.error);
  }

  rl.close();
}

main().catch(console.error);
```

Torne executável e use:
```bash
chmod +x cli.js
./cli.js
```

## Opções de Configuração

### PipelineConfig

```typescript
interface PipelineConfig {
  cursorApiToken: string;      // Obrigatório: Token da Cursor API
  githubToken?: string;          // Opcional: Token do GitHub
  repoOwner?: string;            // Opcional: Proprietário do repositório
  repoName?: string;             // Opcional: Nome do repositório
  config?: {
    solidRules?: boolean;       // Validar SOLID (padrão: true)
    atomicDesign?: boolean;      // Validar Atomic Design (padrão: true)
    lintRules?: string[];        // Regras de lint (padrão: ['eslint'])
    autoApprove?: boolean;       // Auto-aprovar PRs (padrão: false)
  };
}
```

### ProcessOptions

```typescript
interface ProcessOptions {
  prompt: string;                // Obrigatório: Descrição da feature
  createBranch?: boolean;        // Criar branch (padrão: false)
  createIssue?: boolean;         // Criar issue (padrão: false)
  createPR?: boolean;            // Criar PR (padrão: false)
  runCodeReview?: boolean;        // Executar review (padrão: false)
  branchName?: string;           // Nome da branch (auto-gerado se não fornecido)
}
```

## Exemplos de Prompts

### Frontend (React)

```
"Criar componente Button reutilizável com variantes (primary, secondary, danger), 
suporte a ícones e estados de loading, seguindo Atomic Design"
```

### Backend (Node.js)

```
"Criar serviço de autenticação JWT com validação de token, refresh token, 
e middleware de autenticação para Express"
```

### Full Stack

```
"Criar feature completa de comentários: API RESTful com CRUD, 
componente React com listagem infinita, e sistema de validação"
```

## Troubleshooting

### Erro: "Cursor API token is required"
- Verifique se `CURSOR_API_TOKEN` está definido no `.env` ou como variável de ambiente

### Erro: "GitHub token is required"
- Necessário apenas se usar funcionalidades do GitHub (branch, issue, PR)
- Verifique se `GITHUB_TOKEN` está configurado

### Erro: "Failed to generate code"
- Verifique se o token da Cursor API é válido
- Verifique a conexão com a internet
- Tente um prompt mais simples primeiro

### Review sempre falhando
- Verifique as configurações de validação
- Revise os logs para ver quais validações estão falhando
- Considere desabilitar temporariamente algumas validações para debug

## Próximos Passos

- Veja [INTEGRATION.md](./INTEGRATION.md) para exemplos de integração em diferentes pipelines
- Consulte [API.md](./API.md) para documentação completa da API
- Leia [SOLID.md](./SOLID.md) e [ATOMIC_DESIGN.md](./ATOMIC_DESIGN.md) para entender as validações

