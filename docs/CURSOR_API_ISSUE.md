# Problema com Cursor API

## Erro: `getaddrinfo ENOTFOUND api.cursor.sh`

O erro indica que o domínio `api.cursor.sh` não pode ser resolvido. Isso significa que:

1. **O Cursor pode não ter uma API HTTP pública**
2. A URL da API pode estar incorreta
3. A API pode estar em um domínio diferente

## Soluções

### Opção 1: Usar Claude Code (Recomendado)

Claude Code tem uma API HTTP pública e funcionando:

```bash
PROMPT_AI_TYPE=CLAUDE_CODE \
PROMPT_AI_KEY=sua_claude_api_key \
USE_CLI=true \
npm run automate-features -- --propt-key=$PROMPT_AI_KEY --source=$(pwd) feature.md
```

### Opção 2: Verificar URL da API do Cursor

Se você tiver acesso à documentação oficial do Cursor, verifique:
- A URL correta da API
- Se a API requer autenticação especial
- Se há um endpoint diferente

### Opção 3: Usar sem modo CLI

Se a API HTTP não funcionar, você pode usar sem o modo CLI (mas sem contexto do código fonte):

```bash
# Sem USE_CLI - usa API HTTP normal
npm run automate-features -- --propt-key=$CURSOR_API_TOKEN feature.md
```

## Nota

O "modo CLI" foi implementado para incluir contexto do código fonte do projeto na requisição. Se a API do Cursor não estiver disponível, use Claude Code que tem uma API pública e funcional.

