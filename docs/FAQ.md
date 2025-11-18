# FAQ - Perguntas Frequentes

Respostas para as perguntas mais comuns sobre o **@arranjae/automate-features**.

## Sumário

- [Geral](#geral)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso e Funcionalidades](#uso-e-funcionalidades)
- [Providers de AI](#providers-de-ai)
- [Performance e Limitações](#performance-e-limitações)
- [Segurança](#segurança)
- [Troubleshooting](#troubleshooting)

## Geral

### O que é o automate-features?

É uma ferramenta CLI que permite gerar código automaticamente usando modelos de IA (Claude Code ou Cursor). Você descreve o que quer em um arquivo Markdown e a ferramenta gera o código completo seguindo boas práticas.

### Por que usar automate-features?

- **Produtividade**: Gere código completo em minutos
- **Qualidade**: Código segue princípios SOLID e boas práticas
- **Consistência**: Padrões uniformes em todo o projeto
- **Documentação**: Código vem documentado
- **Testes**: Inclui testes unitários e E2E
- **Integração**: Funciona com Git, GitHub, e CI/CD

### É gratuito?

A ferramenta em si é **open-source e gratuita**. Porém, você precisa de:
- **Claude Code**: API key da Anthropic (paga por uso)
- **Cursor**: Assinatura Pro do Cursor

### Qual a diferença entre modo API e modo CLI?

| Aspecto | Modo API | Modo CLI |
|---------|----------|----------|
| **Configuração** | Mais simples | Requer instalação do Claude CLI |
| **Performance** | Mais lento para projetos grandes | Mais rápido |
| **Contexto** | Envia via API | Acesso direto aos arquivos |
| **Suporte** | Claude e Cursor | Apenas Claude |
| **Uso** | `pnpm automate-features` | `USE_CLI=true pnpm automate-features` |

**Recomendação**: Use modo CLI para projetos médios/grandes.

## Instalação e Configuração

### Como instalar?

```bash
# Global
npm install -g @arranjae/automate-features

# Local (projeto)
npm install --save-dev @arranjae/automate-features

# pnpm
pnpm add -g @arranjae/automate-features
```

### Preciso de Rust instalado?

**Não** se você instalar via npm/pnpm. O módulo Rust já vem pré-compilado.

**Sim** se você:
- Clonou o repositório
- Está contribuindo com o projeto
- Quer compilar do zero

### Como obter a API key do Claude?

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create Key"
5. Copie a chave (começa com `sk-ant-api03-`)

### Como obter o token do Cursor?

O Cursor não oferece API pública ainda. Esta feature está em desenvolvimento.

### Onde colocar as credenciais?

**Opção 1: Arquivo .env (Recomendado)**
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-xxx
PROMPT_AI_TYPE=CLAUDE_CODE
USE_CLI=true
```

**Opção 2: Variáveis de ambiente**
```bash
export ANTHROPIC_API_KEY=sk-ant-api03-xxx
export PROMPT_AI_TYPE=CLAUDE_CODE
```

**Opção 3: Parâmetros CLI**
```bash
pnpm automate-features --prompt-key=sk-ant-api03-xxx ./feature.md
```

## Uso e Funcionalidades

### Como funciona o fluxo básico?

1. **Escreva** a feature em Markdown
2. **Execute** o comando CLI
3. **Revise** o código gerado
4. **Teste** o código
5. **Commit** (manual ou automático)

### Posso gerar múltiplos arquivos?

**Sim!** O gerador pode criar:
- Múltiplos arquivos fonte
- Testes
- Documentação
- Configurações
- Migrations
- Etc.

### O código gerado está pronto para produção?

**Quase sempre, mas revise!** O código:
- ✅ Segue boas práticas
- ✅ Tem testes
- ✅ É documentado
- ✅ Segue SOLID

**Mas você deve:**
- Revisar lógica de negócio
- Testar em ambiente local
- Verificar segurança
- Adaptar ao seu contexto

### Posso customizar o estilo do código?

**Sim!** Especifique no arquivo Markdown:

```markdown
## Estilo de Código

- Usar ESLint com Airbnb config
- Indentação: 2 espaços
- Quotes: single
- Semicolons: obrigatório
- Naming: camelCase para variáveis, PascalCase para classes
```

### Funciona com qualquer linguagem?

**Sim!** Suporta:
- TypeScript/JavaScript
- Python
- Go
- Rust
- Java
- PHP
- E outras...

### Posso integrar com GitHub?

**Sim!** Configure:

```bash
export GITHUB_TOKEN=ghp_xxx
export GITHUB_REPO_OWNER=seu-usuario
export GITHUB_REPO_NAME=seu-repo
```

A ferramenta vai:
- Criar branch
- Fazer commit
- Criar issue
- Criar Pull Request
- Executar code review

### Como funciona o code review automático?

Após gerar o código, a ferramenta:
1. Analisa o código gerado
2. Verifica boas práticas
3. Identifica possíveis problemas
4. Sugere melhorias
5. Gera relatório

Você vê um resumo com:
- ✅ Pontos positivos
- ⚠️ Avisos
- ❌ Problemas críticos
- 💡 Sugestões

## Providers de AI

### Qual provider escolher?

| Provider | Quando Usar |
|----------|-------------|
| **Claude Code CLI** | Projetos grandes, melhor contexto |
| **Claude Code API** | Projetos pequenos, sem CLI instalado |
| **Cursor** | Se já usa Cursor IDE |

**Recomendação**: Claude Code CLI para maioria dos casos.

### Posso usar modelos diferentes?

**Claude Code CLI**: Usa o modelo configurado (geralmente Sonnet)

**Claude API**: Você pode especificar:
```typescript
// No código TypeScript
model: 'claude-sonnet-4-5-20250929'
```

### Quanto custa usar?

**Claude Code (Anthropic):**
- Modelo Sonnet: ~$3 por milhão de tokens entrada, ~$15 por milhão de saída
- Feature média: $0.05 - $0.50
- Feature complexa: $0.50 - $2.00

**Cursor:**
- Plano Pro: $20/mês (uso ilimitado)

### Há limites de uso?

**Claude API:**
- Rate limits: Depende do seu tier na Anthropic
- Token limit: ~200k tokens por requisição

**Claude CLI:**
- Sem limites de token
- Rate limits: Mesmos da API

**Cursor:**
- Depende do plano

## Performance e Limitações

### Quanto tempo demora para gerar?

| Tamanho | API Mode | CLI Mode |
|---------|----------|----------|
| **Pequeno** (1 arquivo) | 5-10s | 3-5s |
| **Médio** (3-5 arquivos) | 15-30s | 10-20s |
| **Grande** (10+ arquivos) | 30-60s | 20-40s |
| **Muito Grande** | Timeout | 40-90s |

### Por que dá timeout?

**Causas comuns:**
1. Contexto muito grande (muitos arquivos)
2. Prompt muito complexo
3. Modo API com projeto grande

**Soluções:**
```bash
# Use CLI mode
USE_CLI=true pnpm automate-features ./feature.md

# Reduza o escopo
--source=./src/module-specific

# Divida em features menores
```

### Qual o tamanho máximo de projeto?

**Modo API:**
- Máximo: ~200k tokens de contexto
- Prático: Projetos até 50 arquivos

**Modo CLI:**
- Sem limite técnico
- Projetos com milhares de arquivos funcionam

### Posso usar offline?

**Não**. A ferramenta precisa de conexão com:
- API da Anthropic (Claude)
- API do Cursor
- GitHub (se usar integração)

## Segurança

### As credenciais são seguras?

**Sim**, se você:
- ✅ Usa `.env` (não commita)
- ✅ Adiciona `.env` ao `.gitignore`
- ✅ Usa variáveis de ambiente em CI/CD
- ❌ Não passa credenciais via linha de comando em logs

### O código é enviado para terceiros?

**Sim**, para o provider de AI:
- Claude: Anthropic
- Cursor: Anysphere

**Porém:**
- Anthropic não treina modelos com seus dados
- Você pode revisar o código antes de usar
- Opção de rodar localmente (futuro)

### Posso usar em projetos privados?

**Sim!** Totalmente permitido.

**Mas:**
- Revise termos de serviço do provider
- Considere implicações de enviar código proprietário
- Use `.env` para não expor segredos

### Como evitar expor segredos?

1. **Use .env para credenciais**
   ```bash
   # .env
   DATABASE_URL=postgresql://...
   API_SECRET=xxx
   ```

2. **Não inclua .env no source**
   ```bash
   echo ".env" >> .gitignore
   ```

3. **Não coloque segredos no prompt**
   ```markdown
   ❌ Ruim:
   Usar API_KEY=sk-xxx para autenticação

   ✅ Bom:
   Ler API_KEY de process.env.API_KEY
   ```

4. **Use variáveis de ambiente**
   ```typescript
   const apiKey = process.env.API_KEY;
   ```

## Troubleshooting

### "Module not found: automate_features_rust.node"

**Causa**: Módulo Rust não foi compilado ou está no lugar errado.

**Solução**:
```bash
# Recompilar
cargo build --release

# Copiar
cp target/release/libautomate_features_rust.dylib \
   target/release/automate_features_rust.node

# Linux
cp target/release/libautomate_features_rust.so \
   target/release/automate_features_rust.node
```

### "API key is required"

**Causa**: Faltou configurar a API key.

**Solução**:
```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-xxx

# Ou via parâmetro
--prompt-key=sk-ant-api03-xxx
```

### "Timeout after 120000ms"

**Causa**: Requisição demorou muito.

**Soluções**:
```bash
# 1. Use CLI mode
USE_CLI=true pnpm automate-features ./feature.md

# 2. Reduza escopo
--source=./src/specific-module

# 3. Simplifique o prompt
```

### "Claude CLI not found"

**Causa**: Claude CLI não está instalado.

**Solução**:
```bash
# Instalar
npm install -g @anthropic/claude-cli

# Ou desativar CLI mode
USE_CLI=false pnpm automate-features ./feature.md
```

### Código gerado está incompleto

**Possíveis causas:**
1. Timeout durante geração
2. Limite de tokens atingido
3. Erro não tratado

**Soluções:**
1. Use CLI mode
2. Divida em features menores
3. Verifique logs de erro

### Como reportar um bug?

1. Vá em [Issues](https://github.com/arranjae/automate-features/issues)
2. Clique em "New Issue"
3. Escolha "Bug Report"
4. Preencha o template
5. Inclua:
   - Versão da ferramenta
   - Sistema operacional
   - Comando executado
   - Logs de erro
   - Arquivo de feature (se possível)

## Mais Perguntas?

- 📖 Leia a [documentação completa](./USAGE_GUIDE.md)
- 💬 Abra uma [Discussion](https://github.com/arranjae/automate-features/discussions)
- 🐛 Reporte bugs via [Issues](https://github.com/arranjae/automate-features/issues)
- 📧 Entre em contato: [email@example.com]

---

**Última atualização**: 2025-01-17
