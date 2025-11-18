# Guia de Contribuição

Obrigado por considerar contribuir com o **@arranjae/automate-features**! Este documento fornece diretrizes para contribuir com o projeto.

## Sumário

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

## Como Contribuir

Existem várias formas de contribuir:

1. **Reportar bugs** - Encontrou um problema? Abra uma issue
2. **Sugerir melhorias** - Tem uma ideia? Compartilhe conosco
3. **Corrigir bugs** - Escolha uma issue e envie um PR
4. **Adicionar features** - Implemente novas funcionalidades
5. **Melhorar documentação** - Ajude a tornar a documentação mais clara
6. **Adicionar testes** - Melhore a cobertura de testes

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+ e pnpm
- Rust 1.70+ (para módulo nativo)
- Git
- Claude Code CLI ou Cursor API (para testes)

### Instalação

1. **Fork o repositório**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/SEU-USERNAME/automate-features.git
   cd automate-features
   ```

3. **Configure o upstream**
   ```bash
   git remote add upstream https://github.com/arranjae/automate-features.git
   ```

4. **Instale as dependências**
   ```bash
   pnpm install
   ```

5. **Compile o módulo Rust**
   ```bash
   cargo build --release
   cp target/release/libautomate_features_rust.dylib target/release/automate_features_rust.node
   # No Linux: cp target/release/libautomate_features_rust.so target/release/automate_features_rust.node
   ```

6. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o .env com suas credenciais
   ```

7. **Execute os testes**
   ```bash
   pnpm test
   ```

## Estrutura do Projeto

```
automate-features/
├── bin/                    # CLI entry point
│   └── automate-features.js
├── src/                    # Código TypeScript
│   ├── core/              # Lógica principal
│   │   ├── CodeGenerator.ts
│   │   ├── Pipeline.ts
│   │   └── CodeReviewer.ts
│   ├── integrations/      # Integrações com APIs
│   │   ├── AIProviderFactory.ts
│   │   ├── providers/
│   │   │   ├── ClaudeCodeCliProvider.ts
│   │   │   └── CursorCliProvider.ts
│   │   └── rust-bindings.ts
│   ├── types/             # Definições TypeScript
│   └── index.ts
├── rust/                   # Módulo Rust (via NAPI)
│   ├── src/
│   │   └── lib.rs
│   ├── Cargo.toml
│   └── build.rs
├── docs/                   # Documentação
├── scripts/                # Scripts auxiliares
└── tests/                  # Testes

```

### Componentes Principais

- **Pipeline**: Orquestra o fluxo completo de geração de código
- **CodeGenerator**: Gera código usando providers AI
- **AIProviderFactory**: Factory para criação de providers
- **Providers**: Implementações específicas (Claude, Cursor)
- **Rust Module**: Execução otimizada de CLIs via NAPI

## Padrões de Código

### TypeScript

- Use TypeScript estrito (`strict: true`)
- Siga os princípios SOLID
- Prefira composição sobre herança
- Use interfaces para contratos
- Documente funções públicas com JSDoc

**Exemplo:**
```typescript
/**
 * Generates code based on a prompt
 * @param prompt - The user's code generation request
 * @param options - Configuration options
 * @returns Generated code result
 */
export async function generate(
  prompt: string,
  options: GenerateOptions
): Promise<GenerateResult> {
  // Implementation
}
```

### Rust

- Siga as convenções Rust (rustfmt)
- Use tipos explícitos em APIs públicas
- Documente funções com `///`
- Trate erros explicitamente (evite `unwrap()` em produção)

**Exemplo:**
```rust
/// Executes Claude CLI with the given prompt
///
/// # Arguments
/// * `prompt` - The code generation prompt
/// * `api_key` - Anthropic API key
/// * `source_dir` - Optional source directory path
///
/// # Returns
/// Result containing generated code or error
pub async fn execute_claude_cli(
    prompt: &str,
    api_key: &str,
    source_dir: Option<&str>,
) -> napi::Result<String> {
    // Implementation
}
```

### Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula, etc
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```bash
feat(cli): add support for custom AI models
fix(rust): correct source_dir parameter in execute_claude_cli
docs(readme): update installation instructions
refactor(providers): extract common logic to base class
```

### Branches

- `main` - Branch principal (sempre estável)
- `feature/<nome>` - Novas funcionalidades
- `fix/<nome>` - Correções de bugs
- `docs/<nome>` - Melhorias na documentação
- `refactor/<nome>` - Refatorações

**Exemplo:**
```bash
git checkout -b feature/add-gemini-provider
git checkout -b fix/claude-cli-timeout
```

## Processo de Pull Request

### Antes de Submeter

1. **Atualize sua branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Execute os testes**
   ```bash
   pnpm test
   pnpm run lint
   ```

3. **Compile o Rust**
   ```bash
   cargo build --release
   cargo test
   ```

4. **Teste manualmente**
   ```bash
   # Teste com Claude Code
   USE_CLI=true pnpm automate-features --source=./test-dir ./test-dir/feature.md

   # Teste com Cursor (se aplicável)
   PROMPT_AI_TYPE=CURSOR pnpm automate-features ./test-dir/feature.md
   ```

### Submetendo o PR

1. **Crie um PR descritivo**
   - Título claro e objetivo
   - Descrição detalhada das mudanças
   - Screenshots/GIFs se aplicável
   - Referência a issues relacionadas

**Template de PR:**
```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Resultado esperado

## Checklist
- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Commits seguem Conventional Commits
- [ ] Build do Rust passa
- [ ] Testes TypeScript passam
- [ ] Lint passa sem erros

## Issues Relacionadas
Closes #123
```

2. **Aguarde a revisão**
   - Responda aos comentários
   - Faça as alterações solicitadas
   - Mantenha a branch atualizada

3. **Após aprovação**
   - Squash commits se necessário
   - Aguarde o merge

## Reportando Bugs

Use o template de issue para bugs:

```markdown
**Descrição do Bug**
Descrição clara e concisa do bug.

**Passos para Reproduzir**
1. Vá para '...'
2. Execute '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Comportamento Atual**
O que está acontecendo.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- SO: [ex: macOS 14.0]
- Node: [ex: 18.17.0]
- Rust: [ex: 1.74.0]
- Versão: [ex: 0.1.1]
- Provider: [Claude Code CLI / Cursor]

**Logs**
```bash
# Cole os logs relevantes aqui
```

**Contexto Adicional**
Qualquer informação adicional.
```

## Sugerindo Melhorias

Use o template de issue para features:

```markdown
**Resumo da Feature**
Descrição clara e concisa da funcionalidade.

**Motivação**
Por que essa feature é importante?

**Descrição Detalhada**
Como a feature deveria funcionar?

**Alternativas Consideradas**
Outras abordagens que você pensou.

**Impacto**
- Breaking change? Sim/Não
- Novas dependências? Quais?
- Mudanças na API? Descreva

**Tarefas**
- [ ] Tarefa 1
- [ ] Tarefa 2
```

## Adicionando Novos Providers

Para adicionar suporte a um novo provider de AI:

### 1. Crie a Interface

```typescript
// src/integrations/providers/NewProvider.ts
import { AIProvider, GenerateCodeRequest, GenerateCodeResponse } from '../../types';

export class NewProvider implements AIProvider {
  constructor(private apiKey: string, private config?: NewProviderConfig) {}

  async generateCode(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    // Implementação
  }

  async isAvailable(): Promise<boolean> {
    // Verificar disponibilidade
  }
}
```

### 2. Registre no Factory

```typescript
// src/integrations/AIProviderFactory.ts
case 'NEW_PROVIDER':
  return new NewProvider(apiKey, config);
```

### 3. Adicione Documentação

- Atualize `docs/AI_PROVIDERS.md`
- Adicione exemplo de uso
- Documente variáveis de ambiente necessárias

### 4. Adicione Testes

```typescript
// tests/providers/NewProvider.test.ts
describe('NewProvider', () => {
  it('should generate code', async () => {
    // Test implementation
  });
});
```

## Melhorando o Módulo Rust

### Regras

1. **Segurança**: Sempre valide inputs
2. **Errors**: Use `napi::Error` para erros
3. **Async**: Use Tokio para operações assíncronas
4. **Docs**: Documente todas as funções públicas
5. **Testes**: Adicione testes Rust quando possível

### Exemplo de Contribuição

```rust
/// New function to do X
#[napi]
pub async fn new_function(param: String) -> napi::Result<String> {
    // Validate input
    if param.is_empty() {
        return Err(napi::Error::from_reason("param cannot be empty"));
    }

    // Implementation
    let result = do_something(&param).await
        .map_err(|e| napi::Error::from_reason(format!("Failed: {}", e)))?;

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_new_function() {
        let result = new_function("test".to_string()).await;
        assert!(result.is_ok());
    }
}
```

## Perguntas?

- Abra uma [Discussion](https://github.com/arranjae/automate-features/discussions)
- Entre em contato via [email@example.com]
- Consulte a [documentação](./docs/)

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

**Obrigado por contribuir! 🚀**
