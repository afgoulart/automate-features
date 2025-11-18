# Como Usar o Modo CLI

O erro `getaddrinfo ENOTFOUND api.cursor.sh` indica que o código está tentando usar a API HTTP em vez do CLI.

## Habilitar Modo CLI

Para usar o modo CLI (Rust), você precisa definir a variável de ambiente `USE_CLI`:

```bash
# Via variável de ambiente
export USE_CLI=true

# Ou diretamente no comando
USE_CLI=true npm run automate-features -- --propt-key=KEY --source=$(pwd) feature.md
```

## Verificação

Quando o modo CLI está habilitado, você verá estas mensagens:

```
🔧 CLI mode enabled
📁 Source directory: /caminho/para/projeto
🔧 Using Cursor CLI provider (Rust backend)
✅ Cursor CLI is available
```

Se você ver `🌐 HTTP API mode (default)`, o modo CLI não está habilitado.

## Solução Rápida

```bash
# 1. Build do módulo Rust
npm run build:rust

# 2. Execute com USE_CLI=true
USE_CLI=true npm run automate-features -- --propt-key=SUA_KEY --source=$(pwd) feature.md
```

## Troubleshooting

### Erro: "Rust module not found"

```bash
# Rebuild o módulo Rust
npm run build:rust
```

### Erro: "Cursor CLI is not available"

```bash
# Verifique se o CLI está instalado
which cursor
cursor --version

# Se não estiver, instale:
# https://cursor.sh/docs/getting-started
```

### Ainda usando HTTP API

Certifique-se de que `USE_CLI=true` está definido:

```bash
# Verificar
echo $USE_CLI

# Definir
export USE_CLI=true
```

