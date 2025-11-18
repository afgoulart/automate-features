# Como Criar Token do GitHub

## Método 1: Usando GitHub CLI (gh) ⭐ Recomendado

### 1. Instalar GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Fedora
sudo dnf install gh
```

**Windows:**
```bash
winget install GitHub.cli
```

### 2. Autenticar no GitHub

```bash
gh auth login
```

Siga as instruções:
- Escolha `GitHub.com`
- Escolha `HTTPS` ou `SSH`
- Escolha `Login with a web browser` (mais fácil)
- Autorize o acesso

### 3. Criar Token via CLI

```bash
# Criar token com permissões necessárias
gh auth token

# Ou criar um token com escopo específico
gh auth refresh -s repo,workflow,write:packages,delete:packages
```

### 4. Usar o Token

O token será exibido. Você pode:

```bash
# Salvar em variável de ambiente
export GITHUB_TOKEN=$(gh auth token)

# Ou adicionar ao .env
echo "GITHUB_TOKEN=$(gh auth token)" >> .env
```

## Método 2: Criar Token Manualmente (Web)

### 1. Acesse GitHub Settings

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"

### 2. Configure o Token

**Nome:** `automate-features` (ou qualquer nome)

**Expiração:** Escolha (90 dias, 1 ano, ou sem expiração)

**Permissões necessárias:**
- ✅ `repo` (acesso completo a repositórios privados)
  - `repo:status`
  - `repo_deployment`
  - `public_repo`
  - `repo:invite`
  - `security_events`
- ✅ `workflow` (atualizar GitHub Actions)
- ✅ `write:packages` (se usar GitHub Packages)
- ✅ `delete:packages` (se usar GitHub Packages)

### 3. Gerar e Copiar

1. Clique em "Generate token"
2. **IMPORTANTE**: Copie o token imediatamente (você não verá novamente)
3. Salve em local seguro

### 4. Configurar no Projeto

```bash
# Adicionar ao .env
echo "GITHUB_TOKEN=ghp_seu_token_aqui" >> .env

# Ou exportar
export GITHUB_TOKEN=ghp_seu_token_aqui
```

## Verificar Token

```bash
# Verificar se está funcionando
gh auth status

# Testar token
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

## Permissões Necessárias para automate-features

O módulo precisa das seguintes permissões:

- **`repo`**: Criar branches, issues e PRs
- **`workflow`**: Atualizar GitHub Actions (se necessário)
- **`write:issues`**: Criar e editar issues
- **`pull_requests:write`**: Criar e editar PRs

## Segurança

⚠️ **IMPORTANTE**:
- Nunca commite tokens no repositório
- Use `.env` e adicione ao `.gitignore`
- Rotacione tokens regularmente
- Use tokens com escopo mínimo necessário

## Exemplo de Uso

```bash
# Configurar token
export GITHUB_TOKEN=$(gh auth token)
export GITHUB_REPO_OWNER=seu-usuario
export GITHUB_REPO_NAME=seu-repositorio

# Executar
npm run automate-features -- --propt-key=$PROMPT_AI_KEY feature.md
```

## Troubleshooting

### Erro: "Bad credentials"

```bash
# Verificar token
gh auth status

# Re-autenticar
gh auth refresh
```

### Erro: "Resource not accessible by integration"

O token não tem permissões suficientes. Adicione as permissões necessárias.

### Token expirado

```bash
# Renovar token
gh auth refresh
```

