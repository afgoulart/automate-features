# Quick Guide: Criar Token GitHub com gh CLI

## Passo a Passo Rápido

### 1. Instalar GitHub CLI (se não tiver)

```bash
# macOS
brew install gh

# Verificar instalação
gh --version
```

### 2. Autenticar

```bash
gh auth login
```

Siga as instruções na tela:
- Escolha `GitHub.com`
- Escolha `HTTPS`
- Escolha `Login with a web browser`
- Abra o link no navegador e autorize

### 3. Obter Token

```bash
# Método 1: Usar script automático
npm run setup:github-token

# Método 2: Manual
gh auth token

# Método 3: Exportar diretamente
export GITHUB_TOKEN=$(gh auth token)
```

### 4. Verificar

```bash
# Ver status da autenticação
gh auth status

# Testar token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## Usar no Projeto

### Opção 1: Variável de Ambiente

```bash
export GITHUB_TOKEN=$(gh auth token)
export GITHUB_REPO_OWNER=seu-usuario
export GITHUB_REPO_NAME=seu-repositorio
```

### Opção 2: Arquivo .env

```bash
# Executar script
npm run setup:github-token

# Ou manualmente
echo "GITHUB_TOKEN=$(gh auth token)" >> .env
echo "GITHUB_REPO_OWNER=seu-usuario" >> .env
echo "GITHUB_REPO_NAME=seu-repositorio" >> .env
```

## Comandos Úteis

```bash
# Ver token atual
gh auth token

# Renovar token
gh auth refresh

# Ver status
gh auth status

# Logout
gh auth logout
```

## Permissões Necessárias

O token precisa ter acesso a:
- ✅ `repo` - Para criar branches, issues e PRs
- ✅ `workflow` - Para GitHub Actions (opcional)

Estas permissões são solicitadas automaticamente durante `gh auth login`.

