# Template/Parser System

Sistema completo de templates estruturados e parser para geração automática de código com IA.

## 📋 Visão Geral

O sistema de template/parser permite que os provedores de IA retornem respostas estruturadas em formato XML, que são automaticamente parseadas e executadas pelo sistema. Isso permite:

- ✅ **Geração automática de código** - Criar múltiplos arquivos automaticamente
- ✅ **Modificação de arquivos** - Atualizar arquivos existentes
- ✅ **Operações de arquivos** - CREATE, UPDATE, DELETE, RENAME
- ✅ **Metadados estruturados** - Tempo estimado, complexidade, dependências
- ✅ **Comandos de instalação** - Executar comandos automaticamente
- ✅ **Avisos e alertas** - Destacar considerações importantes
- ✅ **Validação de segurança** - Prevenir path traversal e outras vulnerabilidades

## 🏗️ Arquitetura

O sistema é composto por 4 componentes principais:

### 1. **Types** (`src/parser/types.ts`)
Define as interfaces TypeScript para todo o sistema:

```typescript
enum FileOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RENAME = 'RENAME',
}

interface FileAction {
  operation: FileOperation;
  path: string;
  content?: string;
  oldPath?: string;
  description?: string;
}

interface ParsedResponse {
  summary: string;
  files: FileAction[];
  commands?: string[];
  warnings?: string[];
  metadata?: {
    estimatedTime?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    dependencies?: string[];
  };
}
```

### 2. **Template Builder** (`src/parser/PromptTemplate.ts`)
Constrói prompts estruturados para a IA:

```typescript
// Obter template de geração de código
const template = PromptTemplateBuilder.getCodeGenerationTemplate();

// Construir prompt completo
const prompt = PromptTemplateBuilder.buildPrompt(
  'Create a user authentication service',
  'Optional context here'
);

// Prompts especializados
const reviewPrompt = PromptTemplateBuilder.buildReviewPrompt(code, filePath);
const refactorPrompt = PromptTemplateBuilder.buildRefactorPrompt(code, 'rename', 'Details');
```

### 3. **Response Parser** (`src/parser/ResponseParser.ts`)
Faz parsing de respostas XML da IA:

```typescript
// Parse XML response
const parsed = await ResponseParser.parseXMLResponse(xmlResponse);

// Validar response
ResponseParser.validateResponse(parsed);
```

### 4. **File Executor** (`src/parser/FileExecutor.ts`)
Executa operações de arquivo:

```typescript
const executor = new FileExecutor('/path/to/project');

// Dry run (validar sem executar)
const dryRunResult = await executor.dryRun(files);

// Executar todas as operações
const result = await executor.executeAll(files);
```

## 📝 Formato XML da Response

A IA deve retornar respostas no seguinte formato XML:

```xml
<response>
  <summary>
    Breve descrição do que será implementado (1-2 sentenças)
  </summary>

  <metadata>
    <estimatedTime>tempo estimado</estimatedTime>
    <complexity>simple|medium|complex</complexity>
    <dependencies>
      <dependency>package-name@version</dependency>
      <dependency>another-package@version</dependency>
    </dependencies>
  </metadata>

  <files>
    <file>
      <operation>CREATE|UPDATE|DELETE|RENAME</operation>
      <path>relative/path/to/file.ts</path>
      <oldPath>old/path (somente para RENAME)</oldPath>
      <description>O que este arquivo faz</description>
      <content><![CDATA[
// Conteúdo completo do arquivo aqui
// Use CDATA para evitar problemas de parsing XML
]]></content>
    </file>
    <!-- Adicione mais arquivos conforme necessário -->
  </files>

  <commands>
    <command>npm install package-name</command>
    <command>npm run build</command>
  </commands>

  <warnings>
    <warning>Aviso importante ou consideração</warning>
    <warning>Outro aviso se aplicável</warning>
  </warnings>
</response>
```

## 🔧 Operações de Arquivo

### CREATE - Criar novo arquivo
```xml
<file>
  <operation>CREATE</operation>
  <path>src/services/UserService.ts</path>
  <description>Serviço de gerenciamento de usuários</description>
  <content><![CDATA[
export class UserService {
  // Implementation here
}
]]></content>
</file>
```

**Requisitos:**
- `path` é obrigatório e deve ser relativo
- `content` é obrigatório
- Arquivo não deve existir

### UPDATE - Atualizar arquivo existente
```xml
<file>
  <operation>UPDATE</operation>
  <path>src/index.ts</path>
  <description>Adicionar export do UserService</description>
  <content><![CDATA[
export * from './services/UserService';
]]></content>
</file>
```

**Requisitos:**
- `path` é obrigatório
- `content` é obrigatório
- Arquivo deve existir
- Backup automático criado antes da atualização

### DELETE - Deletar arquivo
```xml
<file>
  <operation>DELETE</operation>
  <path>src/old-service.ts</path>
  <description>Remover serviço obsoleto</description>
</file>
```

**Requisitos:**
- `path` é obrigatório
- `content` não é necessário
- Arquivo deve existir
- Backup automático criado antes da deleção

### RENAME - Renomear/mover arquivo
```xml
<file>
  <operation>RENAME</operation>
  <oldPath>src/UserSvc.ts</oldPath>
  <path>src/services/UserService.ts</path>
  <description>Renomear e mover para pasta services</description>
</file>
```

**Requisitos:**
- `oldPath` é obrigatório (arquivo original)
- `path` é obrigatório (novo caminho)
- `content` não é necessário
- Arquivo original deve existir
- Novo caminho não deve existir

## 🛡️ Validação e Segurança

O sistema inclui validações robustas:

### Validação de Paths
```typescript
// ❌ REJEITADO - Path traversal
path: '../../../etc/passwd'

// ❌ REJEITADO - Path absoluto
path: '/etc/passwd'

// ✅ ACEITO - Path relativo
path: 'src/services/UserService.ts'
```

### Validação de Operações
```typescript
// ❌ REJEITADO - CREATE sem content
{ operation: 'CREATE', path: 'test.ts' }

// ❌ REJEITADO - UPDATE sem content
{ operation: 'UPDATE', path: 'test.ts' }

// ❌ REJEITADO - RENAME sem oldPath
{ operation: 'RENAME', path: 'new.ts' }

// ✅ ACEITO
{
  operation: 'CREATE',
  path: 'test.ts',
  content: 'export const test = true;'
}
```

### Validação de XML
- Deve ter tag `<response>` root
- Deve ter `<summary>`
- Deve ter pelo menos 1 `<file>`
- XML bem-formado (tags fechadas, etc)

## 💻 Uso Programático

### Exemplo Completo - End-to-End

```typescript
import {
  PromptTemplateBuilder,
  ResponseParser,
  FileExecutor
} from './src/parser';

async function generateCode() {
  // 1. Construir prompt para IA
  const prompt = PromptTemplateBuilder.buildPrompt(
    'Create a user authentication service with JWT'
  );

  // 2. Enviar para IA (pseudo-código)
  const aiResponse = await aiProvider.generateCode(prompt);

  // 3. Fazer parse da response XML
  const parsed = await ResponseParser.parseXMLResponse(aiResponse);

  // 4. Validar response
  ResponseParser.validateResponse(parsed);

  // 5. Criar executor
  const executor = new FileExecutor('./src');

  // 6. Dry run (opcional - validar antes de executar)
  const dryRun = await executor.dryRun(parsed.files);
  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.errors);
    return;
  }

  // 7. Executar operações de arquivo
  const result = await executor.executeAll(parsed.files);

  // 8. Processar resultado
  if (result.success) {
    console.log('✓ Files created:', result.filesCreated);
    console.log('✓ Files updated:', result.filesUpdated);
    console.log('✓ Files deleted:', result.filesDeleted);
  } else {
    console.error('✗ Errors:', result.errors);
  }
}
```

### Dry Run - Validar sem Executar

```typescript
const executor = new FileExecutor('./src');
const result = await executor.dryRun(files);

console.log('Would create:', result.filesCreated);
console.log('Would update:', result.filesUpdated);
console.log('Would delete:', result.filesDeleted);
console.log('Errors:', result.errors);

// Prosseguir somente se não houver erros
if (result.success) {
  await executor.executeAll(files);
}
```

### Prompts Especializados

```typescript
// Code review
const reviewPrompt = PromptTemplateBuilder.buildReviewPrompt(
  sourceCode,
  'src/services/UserService.ts'
);

// Refactoring
const refactorPrompt = PromptTemplateBuilder.buildRefactorPrompt(
  sourceCode,
  'extract',  // extract | rename | optimize | modernize
  'Extract authentication logic to separate class'
);
```

## 🧪 Testes

Execute a suite de testes completa:

```bash
pnpm test:template
```

A suite de testes inclui 41 testes cobrindo:

- ✅ Template Builder (11 tests)
- ✅ Response Parser com XML válido (12 tests)
- ✅ Multiple Files (4 tests)
- ✅ Validation (3 tests)
- ✅ File Executor Dry Run (4 tests)
- ✅ File Executor Create (5 tests)
- ✅ Error Handling (2 tests)

## 📊 Resultados da Execução

### ExecutionResult Interface

```typescript
interface ExecutionResult {
  success: boolean;
  filesCreated: string[];
  filesUpdated: string[];
  filesDeleted: string[];
  commandsExecuted: string[];
  errors: Array<{
    file?: string;
    operation?: string;
    error: string;
  }>;
}
```

### Exemplo de Resultado

```typescript
{
  success: true,
  filesCreated: [
    'src/services/UserService.ts',
    'src/services/UserService.test.ts'
  ],
  filesUpdated: [
    'src/index.ts'
  ],
  filesDeleted: [],
  commandsExecuted: [],
  errors: []
}
```

## 🔄 Integração com AI Providers

### Passo 1: Enviar Prompt Estruturado

```typescript
import { PromptTemplateBuilder } from './src/parser';

const prompt = PromptTemplateBuilder.buildPrompt(
  userRequest,
  optionalContext
);

// O prompt já inclui:
// - System prompt explicando as regras
// - Formato XML esperado
// - Exemplos completos
// - Request do usuário
```

### Passo 2: Processar Response

```typescript
import { ResponseParser } from './src/parser';

// A resposta da IA deve ser em XML
const aiResponse = await provider.generateCode(prompt);

// Parse automático
const parsed = await ResponseParser.parseXMLResponse(aiResponse);

// Validação automática
ResponseParser.validateResponse(parsed);
```

### Passo 3: Executar Operações

```typescript
import { FileExecutor } from './src/parser';

const executor = new FileExecutor(baseDirectory);
const result = await executor.executeAll(parsed.files);
```

## 🎯 Exemplo Real - Create User Service

### User Request
```
Create a user authentication service with JWT tokens
```

### AI Response
```xml
<response>
  <summary>
    Creating a UserAuthService with login/logout functionality using JWT tokens
  </summary>

  <metadata>
    <estimatedTime>15 minutes</estimatedTime>
    <complexity>medium</complexity>
    <dependencies>
      <dependency>jsonwebtoken@9.0.0</dependency>
      <dependency>bcrypt@5.1.0</dependency>
    </dependencies>
  </metadata>

  <files>
    <file>
      <operation>CREATE</operation>
      <path>src/services/AuthService.ts</path>
      <description>User authentication service with JWT</description>
      <content><![CDATA[
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export class AuthService {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.secretKey, { expiresIn: '24h' });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.secretKey) as { userId: string };
    } catch (error) {
      return null;
    }
  }
}
]]></content>
    </file>
  </files>

  <commands>
    <command>npm install jsonwebtoken @types/jsonwebtoken</command>
    <command>npm install bcrypt @types/bcrypt</command>
  </commands>

  <warnings>
    <warning>Store secretKey in environment variables, never hardcode it</warning>
    <warning>Consider using refresh tokens for better security</warning>
  </warnings>
</response>
```

### Resultado

```typescript
{
  success: true,
  filesCreated: ['src/services/AuthService.ts'],
  filesUpdated: [],
  filesDeleted: [],
  commandsExecuted: [],
  errors: []
}
```

## 🚀 Próximos Passos

Para usar o sistema de template/parser no seu projeto:

1. **Import os módulos:**
```typescript
import {
  PromptTemplateBuilder,
  ResponseParser,
  FileExecutor,
  FileOperation,
  ParsedResponse
} from './src/parser';
```

2. **Configure seu AI provider** para usar os prompts estruturados

3. **Processe as responses** com o parser

4. **Execute as operações** com o executor

5. **Trate os resultados** e erros apropriadamente

## 📚 Referências

- **Types**: `src/parser/types.ts` - Todas as interfaces TypeScript
- **Template Builder**: `src/parser/PromptTemplate.ts` - Construção de prompts
- **Response Parser**: `src/parser/ResponseParser.ts` - Parsing de XML
- **File Executor**: `src/parser/FileExecutor.ts` - Execução de operações
- **Tests**: `test/template-parser-test.ts` - 41 testes completos

## 🔍 Troubleshooting

### Erro: "No valid XML response found"
A resposta da IA não contém XML válido. Verifique se o prompt está sendo enviado corretamente.

### Erro: "Invalid file path: ... Paths must be relative"
O path contém `..` ou começa com `/`. Todos os paths devem ser relativos ao diretório base.

### Erro: "File already exists"
Tentando CREATE em arquivo que já existe. Use UPDATE ou DELETE primeiro.

### Erro: "Content is required for CREATE operation"
Operação CREATE requer conteúdo. Adicione tag `<content>` com CDATA.

## 💡 Dicas

- Use CDATA para content: `<![CDATA[...]]>`
- Sempre valide antes de executar (dry run)
- Backups são criados automaticamente para UPDATE e DELETE
- Paths são sempre relativos ao baseDir
- Use prompts especializados (review, refactor) quando apropriado
- Teste com a suite completa: `pnpm test:template`
