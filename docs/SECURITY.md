# Segurança - Verificação de Credenciais

Este documento descreve as práticas de segurança do projeto para evitar vazamento de credenciais.

## Checklist de Segurança

### ✅ Configurações Atuais

- [x] Arquivo `.env` está no `.gitignore`
- [x] Arquivo `.env.example` não contém valores reais
- [x] Nenhum token hardcoded no código fonte
- [x] Todas as credenciais são lidas de variáveis de ambiente
- [x] Arquivos `.gitattributes` configurado para proteger arquivos sensíveis

### 📋 Arquivos Protegidos

Os seguintes padrões estão no `.gitignore`:
```
.env
.env.local
.env.*.local
.env.*
```

**Importante**: O arquivo `.env.example` é versionado (com valores placeholder) e está **permitido** no git.

### 🔍 Verificação Manual

Antes de cada commit, verifique:

```bash
# Verificar se há tokens nos arquivos modificados
git diff --cached | grep -E "(token|key|secret|password)" | grep -v "your_.*_here" | grep -v "example"

# Verificar se .env não está sendo commitado
git ls-files | grep "\.env$"
```

### 🛡️ Pre-commit Hook (Opcional)

Um hook de pre-commit está disponível em `.pre-commit-hook`. Para ativá-lo:

```bash
# Copiar para .git/hooks/
cp .pre-commit-hook .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

O hook verifica automaticamente se há credenciais sendo commitadas.

### 🚨 O que NUNCA fazer

❌ **NÃO** commitar arquivos `.env` com valores reais
❌ **NÃO** hardcodar tokens no código
❌ **NÃO** commitar arquivos com padrões como:
   - `password = "algum_valor"`
   - `api_key = "algum_valor"`
   - `CURSOR_API_TOKEN = "token_real"`
   - `GITHUB_TOKEN = "token_real"`

### ✅ O que é Permitido

✅ Arquivo `.env.example` com valores placeholder:
```
CURSOR_API_TOKEN=your_cursor_api_token_here
GITHUB_TOKEN=your_github_token_here
```

✅ Variáveis de ambiente sendo lidas:
```typescript
process.env.CURSOR_API_TOKEN
process.env.GITHUB_TOKEN
```

✅ Documentação mencionando variáveis de ambiente

### 🔐 Se uma Credencial foi Exposta

Se você acidentalmente commitou uma credencial:

1. **Imediatamente revogue a credencial** (no serviço onde ela foi gerada)
2. **Remova do histórico do Git**:
   ```bash
   # Ver histórico
   git log --all --full-history --source -- "*env*"
   
   # Remover do histórico (CUIDADO - isso reescreve o histórico)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (apenas se for seguro):
   ```bash
   git push origin --force --all
   ```
4. **Gere novas credenciais**

### 📝 Exemplos Seguros vs Inseguros

#### ✅ SEGURO
```typescript
// Lendo de variável de ambiente
const token = process.env.CURSOR_API_TOKEN;
```

```bash
# .env.example (permitido no git)
CURSOR_API_TOKEN=your_token_here
```

#### ❌ INSEGURO
```typescript
// Token hardcoded
const token = "ghp_abcdef1234567890abcdef1234567890abcdef";
```

```bash
# .env com valor real (NUNCA commitar)
CURSOR_API_TOKEN=ghp_real_token_here_123456
```

### 🔄 Verificação Contínua

Execute esta verificação periodicamente:

```bash
# Verificar se .env está sendo ignorado
git check-ignore -v .env

# Verificar se há tokens no código
grep -r "ghp_\|sk-\|AIza" src/ examples/ --exclude-dir=node_modules || echo "✅ Nenhum token encontrado"

# Verificar arquivos no staging
git diff --cached --name-only | xargs grep -l "token\|key\|secret" || echo "✅ Nenhum arquivo sensível no staging"
```

