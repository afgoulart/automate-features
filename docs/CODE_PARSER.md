# Code Parser

O **CodeParser** é uma classe utilitária que extrai e organiza múltiplos arquivos de código gerado pela API, facilitando a criação automática de estruturas de projeto completas.

## Funcionalidades

- ✅ Suporta múltiplos formatos de saída
- ✅ Detecta automaticamente linguagens de programação
- ✅ Extrai múltiplos arquivos de uma única resposta
- ✅ Cria estrutura de diretórios automaticamente
- ✅ Fornece resumo detalhado dos arquivos extraídos

## Formatos Suportados

### 1. Markdown com Paths (Recomendado)

```markdown
## File: src/components/Button.tsx
\`\`\`tsx
export const Button = () => {
  return <button>Click me</button>;
};
\`\`\`

## File: src/components/Button.test.tsx
\`\`\`tsx
describe('Button', () => {
  it('renders', () => {
    // test code
  });
});
\`\`\`
```

### 2. XML-like Tags

```xml
<file path="src/utils/helpers.ts" language="typescript">
\`\`\`typescript
export const formatDate = (date: Date) => {
  return date.toISOString();
};
\`\`\`
</file>
```

### 3. Comment-based Paths

```typescript
// File: src/config.ts
\`\`\`typescript
export const config = {
  apiUrl: 'https://api.example.com'
};
\`\`\`
```

### 4. Single Code Block (Fallback)

Se nenhum formato específico for detectado, o parser trata o conteúdo como um único arquivo.

## Uso Básico

### 1. Parse Manual

```typescript
import { CodeParser } from '@arranjae/automate-features';

const generatedCode = `
## File: src/index.ts
\`\`\`typescript
console.log('Hello World');
\`\`\`

## File: src/types.ts
\`\`\`typescript
export interface User {
  id: number;
  name: string;
}
\`\`\`
`;

// Parse o código
const result = CodeParser.parse(generatedCode);

// Ver resumo
console.log(CodeParser.getSummary(result));
// Output:
// Found 2 file(s):
// - src/index.ts (typescript, 1 lines, 27 bytes)
// - src/types.ts (typescript, 4 lines, 64 bytes)

// Acessar arquivos
result.files.forEach(file => {
  console.log(`File: ${file.path}`);
  console.log(`Language: ${file.language}`);
  console.log(`Content:\n${file.content}\n`);
});
```

### 2. Generate, Parse, and Write

```typescript
import { CodeGenerator } from '@arranjae/automate-features';

const generator = new CodeGenerator(
  process.env.ANTHROPIC_API_KEY,
  undefined,
  false, // use API mode
  undefined,
  'CLAUDE_CODE'
);

// Gerar código e salvar arquivos automaticamente
const files = await generator.generateAndWrite(
  'Create a React component for a user profile card',
  './src', // base directory
  {
    language: 'typescript',
    framework: 'react'
  }
);

console.log(`Created ${files.length} files`);
```

### 3. Generate and Parse (sem salvar)

```typescript
import { CodeGenerator } from '@arranjae/automate-features';

const generator = new CodeGenerator(
  process.env.ANTHROPIC_API_KEY,
  undefined,
  false,
  undefined,
  'CLAUDE_CODE'
);

// Apenas parse, sem salvar
const { code, files } = await generator.generateAndParse(
  'Create a simple REST API with Express',
  {
    language: 'typescript',
    framework: 'express'
  }
);

// Revisar antes de salvar
files.forEach(file => {
  console.log(`\n=== ${file.path} ===`);
  console.log(file.content);
});

// Salvar manualmente se aprovar
if (confirm('Save files?')) {
  await CodeParser.writeFiles(files, './src');
}
```

## API Reference

### `CodeParser.parse(content: string): ParseResult`

Faz o parse do código gerado e extrai arquivos.

**Retorna:**
```typescript
interface ParseResult {
  files: ParsedFile[];
  rawContent: string;
}

interface ParsedFile {
  path: string;
  content: string;
  language?: string;
}
```

### `CodeParser.writeFiles(files: ParsedFile[], baseDir: string): Promise<void>`

Escreve os arquivos no disco.

**Parâmetros:**
- `files`: Array de arquivos parseados
- `baseDir`: Diretório base onde os arquivos serão criados

**Comportamento:**
- Cria diretórios automaticamente se não existirem
- Sobrescreve arquivos existentes
- Preserva estrutura de diretórios

### `CodeParser.getSummary(result: ParseResult): string`

Gera um resumo dos arquivos parseados.

**Retorna:** String formatada com:
- Número de arquivos
- Path de cada arquivo
- Linguagem detectada
- Número de linhas
- Tamanho em bytes

## Integração com Pipeline

O CodeParser é usado automaticamente no Pipeline quando `USE_CLI=false`:

```typescript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.ANTHROPIC_API_KEY,
  // useCli: false (padrão - usa API mode com parser)
});

const result = await pipeline.process({
  prompt: 'Create a complete authentication system',
  createBranch: true,
  createPR: true
});

// Arquivos são automaticamente parseados e salvos
console.log(`Generated ${result.filesCreated?.length} files`);
```

## Melhores Práticas

### 1. Especificar Paths Completos no Prompt

❌ **Ruim:**
```
Create a Button component
```

✅ **Bom:**
```
Create a Button component in src/components/Button.tsx with tests in src/components/Button.test.tsx
```

### 2. Usar System Prompt Adequado

O `ClaudeCodeProvider` já usa um system prompt otimizado que instrui o modelo a gerar código no formato correto:

```typescript
When generating multiple files, use this format for EACH file:

## File: path/to/file.ext
\`\`\`language
// file content here
\`\`\`
```

### 3. Validar Antes de Salvar

Para projetos críticos, sempre revise o código antes de salvar:

```typescript
const { files } = await generator.generateAndParse(prompt, config);

// Revisar
for (const file of files) {
  console.log(`\n=== ${file.path} ===`);
  console.log(file.content);

  const approved = await askUser(`Approve ${file.path}?`);
  if (!approved) {
    files.splice(files.indexOf(file), 1);
  }
}

// Salvar apenas os aprovados
await CodeParser.writeFiles(files, baseDir);
```

### 4. Usar com Code Review

Combine o parser com code review automático:

```typescript
const { files } = await generator.generateAndParse(prompt, config);

// Salvar temporariamente
await CodeParser.writeFiles(files, './temp');

// Revisar
const reviewer = new CodeReviewer();
const review = await reviewer.review('./temp');

if (review.passed) {
  // Mover para destino final
  await CodeParser.writeFiles(files, './src');
} else {
  console.log('Review failed:', review.issues);
}
```

## Detecção de Linguagem

O parser detecta automaticamente a linguagem com base na extensão do arquivo:

| Extensão | Linguagem |
|----------|-----------|
| `.ts`, `.tsx` | TypeScript |
| `.js`, `.jsx` | JavaScript |
| `.py` | Python |
| `.rs` | Rust |
| `.go` | Go |
| `.java` | Java |
| `.rb` | Ruby |
| `.php` | PHP |
| `.swift` | Swift |
| `.kt` | Kotlin |
| `.cpp`, `.c` | C/C++ |
| `.cs` | C# |
| `.sql` | SQL |
| `.md` | Markdown |
| `.json` | JSON |
| `.yaml`, `.yml` | YAML |

## Troubleshooting

### Problema: Nenhum arquivo detectado

**Causa:** Formato de saída não reconhecido.

**Solução:**
1. Verifique se o código gerado usa um dos formatos suportados
2. Ajuste o system prompt do provider
3. Use `result.rawContent` para inspecionar o conteúdo bruto

### Problema: Paths incorretos

**Causa:** Modelo gerou paths relativos ou incompletos.

**Solução:**
```typescript
// Normalizar paths antes de salvar
const normalizedFiles = files.map(file => ({
  ...file,
  path: file.path.startsWith('src/') ? file.path : `src/${file.path}`
}));

await CodeParser.writeFiles(normalizedFiles, baseDir);
```

### Problema: Conteúdo truncado

**Causa:** Limite de tokens atingido.

**Solução:**
```typescript
// Aumentar max_tokens ou dividir em múltiplas gerações
const config = {
  language: 'typescript',
  maxTokens: 8000 // aumentar limite
};
```

## Exemplos Avançados

### Gerar Projeto Completo

```typescript
const generator = new CodeGenerator(apiKey, undefined, false, undefined, 'CLAUDE_CODE');

const projectStructure = `
Create a complete Express.js REST API with:
- src/server.ts - Main server file
- src/routes/users.ts - User routes
- src/controllers/userController.ts - User controller
- src/models/User.ts - User model
- src/middlewares/auth.ts - Auth middleware
- src/config/database.ts - Database config
- src/types/index.ts - TypeScript types
- tests/users.test.ts - User tests
`;

const files = await generator.generateAndWrite(
  projectStructure,
  './',
  { language: 'typescript', framework: 'express' }
);

console.log(`✅ Created ${files.length} files`);
```

### Parse de Código Existente

```typescript
import fs from 'fs/promises';

// Ler código de arquivo
const content = await fs.readFile('generated-code.md', 'utf-8');

// Parse
const result = CodeParser.parse(content);

// Salvar arquivos extraídos
await CodeParser.writeFiles(result.files, './extracted');
```

## Veja Também

- [AI Providers](./AI_PROVIDERS.md) - Configuração de providers
- [Usage Guide](./USAGE_GUIDE.md) - Guia completo de uso
- [API Reference](./API_REFERENCE.md) - Documentação completa da API
