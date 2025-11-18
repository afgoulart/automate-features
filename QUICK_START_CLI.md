# Quick Start - Modo CLI

## Como usar o modo CLI

Execute o comando com `USE_CLI=true`:

```bash
USE_CLI=true npm run automate-features -- --propt-key=$CURSOR_API_TOKEN --source=$SOURCE_DIR/TesteFeature ./TesteFeature/feature.md
```

## Verificação

Quando o modo CLI está funcionando, você verá estas mensagens:

```
🔧 CLI mode enabled
📁 Source directory: /caminho/para/projeto
[Pipeline] 🔧 CLI mode ENABLED
[CodeGenerator] Provider type: CursorCliProvider
🔧 Using Cursor CLI provider (Rust backend)
✅ Cursor CLI is available
✅ Rust module loaded from: /caminho/rust/target/release/automate_features_rust.node
```

## Se ainda aparecer erro HTTP

1. **Verifique se o build está atualizado:**
   ```bash
   npm run build
   ```

2. **Verifique se USE_CLI está definido:**
   ```bash
   echo $USE_CLI
   # Deve mostrar: true
   ```

3. **Execute novamente com USE_CLI explicitamente:**
   ```bash
   USE_CLI=true npm run automate-features -- --propt-key=KEY --source=DIR arquivo.md
   ```

## Troubleshooting

Se você ver `🌐 HTTP API mode (default)`, o modo CLI não está habilitado. Certifique-se de que `USE_CLI=true` está definido antes de executar o comando.

