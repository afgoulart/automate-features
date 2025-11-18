# Como Testar o Pacote Localmente

Este guia mostra diferentes formas de testar o pacote `@arranjae/automate-features` em outro projeto antes de publicá-lo no NPM.

## 📋 Pré-requisitos

1. **Build do pacote**: Certifique-se de que o pacote está compilado
   ```bash
   npm run build
   ```

2. **Projeto de teste**: Tenha um projeto Node.js onde você quer testar o pacote

## 🔗 Método 1: npm link (Recomendado)

O `npm link` cria um link simbólico que permite usar o pacote local como se fosse uma dependência instalada do NPM.

### Passo 1: Criar o link no pacote

No diretório do pacote (`Optmized-Process`):

```bash
npm link
# ou
pnpm link --global
```

### Passo 2: Usar o link no projeto de teste

No diretório do projeto onde você quer testar:

```bash
npm link @arranjae/automate-features
# ou
pnpm link @arranjae/automate-features
```

### Passo 3: Usar no projeto

```javascript
// No seu projeto de teste
const { Pipeline } = require('@arranjae/automate-features');
// ou
import { Pipeline } from '@arranjae/automate-features';
```

### Vantagens:
- ✅ Mudanças no código fonte são refletidas automaticamente (após rebuild)
- ✅ Não precisa reinstalar
- ✅ Funciona exatamente como uma dependência normal

### Desvantagens:
- ⚠️ Requer rebuild após mudanças (`npm run build`)
- ⚠️ Pode ter problemas com alguns bundlers (Webpack, Vite)

### Desfazer o link:

```bash
# No projeto de teste
npm unlink @arranjae/automate-features

# No pacote (opcional)
npm unlink
```

---

## 📁 Método 2: Instalação via Caminho Relativo

Use o protocolo `file:` para instalar diretamente do diretório local.

### No projeto de teste:

```bash
# Caminho relativo
npm install ../Optmized-Process

# Caminho absoluto
npm install /Users/msc/Projects/Optmized-Process

# Ou no package.json
{
  "dependencies": {
    "@arranjae/automate-features": "file:../Optmized-Process"
  }
}
```

### Vantagens:
- ✅ Funciona com qualquer gerenciador de pacotes
- ✅ Simples e direto
- ✅ Versões do projeto são mantidas

### Desvantagens:
- ⚠️ Cria uma cópia dos arquivos em `node_modules`
- ⚠️ Não atualiza automaticamente (precisa reinstalar)
- ⚠️ Pode ter problemas com links simbólicos

---

## 📦 Método 3: npm pack (Testar Pacote Completo)

Este método cria um arquivo `.tgz` como se fosse publicado no NPM, permitindo testar exatamente como será instalado pelos usuários.

### Passo 1: Criar o pacote

No diretório do pacote:

```bash
npm run build
npm pack
```

Isso criará um arquivo como `arranjae-automate-features-0.1.1.tgz`

### Passo 2: Instalar no projeto de teste

No projeto de teste:

```bash
npm install ../Optmized-Process/arranjae-automate-features-0.1.1.tgz

# Ou via caminho absoluto
npm install /Users/msc/Projects/Optmized-Process/arranjae-automate-features-0.1.1.tgz
```

### Vantagens:
- ✅ Testa exatamente como será publicado
- ✅ Testa o conteúdo do `files` do package.json
- ✅ Bom para validação final antes de publicar

### Desvantagens:
- ⚠️ Precisa recriar o pacote após cada mudança
- ⚠️ Mais trabalhoso para desenvolvimento iterativo

### Script útil:

Adicione no `package.json` do pacote:

```json
{
  "scripts": {
    "pack:test": "npm run build && npm pack"
  }
}
```

---

## 🚀 Método 4: Publicação como Pre-release

Publique como versão alpha/beta no NPM para testar em projetos reais.

### Passo 1: Preparar versão pre-release

```bash
# Versão beta
npm run release:beta

# Ou manualmente
npm version 0.1.1-beta.0
npm publish --tag beta
```

### Passo 2: Instalar no projeto de teste

```bash
npm install @arranjae/automate-features@beta
# ou
npm install @arranjae/automate-features@0.1.1-beta.0
```

### Vantagens:
- ✅ Testa em ambiente real (produção)
- ✅ Permite testar em múltiplos projetos
- ✅ Testa todo o processo de publicação

### Desvantagens:
- ⚠️ Público (se o pacote for público)
- ⚠️ Requer acesso ao NPM
- ⚠️ Mais lento para desenvolvimento iterativo

---

## 🔄 Workflow Recomendado para Desenvolvimento

### Desenvolvimento Iterativo (mudanças frequentes):

```bash
# 1. No pacote: criar link
cd /Users/msc/Projects/Optmized-Process
npm run build
npm link

# 2. No projeto de teste: usar o link
cd /caminho/para/projeto-teste
npm link @arranjae/automate-features

# 3. Durante desenvolvimento:
# - Faça mudanças no código do pacote
# - Execute `npm run build` no pacote
# - As mudanças estarão disponíveis no projeto de teste
```

### Validação Final (antes de publicar):

```bash
# 1. Criar pacote completo
npm run build
npm pack

# 2. Testar instalação
cd /caminho/para/projeto-teste
npm install ../Optmized-Process/arranjae-automate-features-*.tgz

# 3. Testar funcionalidades

# 4. Se tudo OK, publicar
cd /Users/msc/Projects/Optmized-Process
npm publish
```

---

## 🧪 Exemplo de Projeto de Teste

### Estrutura mínima:

```
meu-projeto-teste/
├── package.json
├── test.js
└── .env
```

### package.json:

```json
{
  "name": "meu-projeto-teste",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@arranjae/automate-features": "file:../Optmized-Process"
  }
}
```

### test.js:

```javascript
import { Pipeline } from '@arranjae/automate-features';

const pipeline = new Pipeline({
  cursorApiToken: process.env.PROMPT_AI_KEY,
  apiUrl: process.env.PROMPT_API_URL,
});

const result = await pipeline.process({
  prompt: 'Criar um componente simples',
  runCodeReview: true,
});

console.log('Resultado:', result);
```

### Executar:

```bash
node test.js
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module '@arranjae/automate-features'"

**Solução:**
- Verifique se executou `npm run build` no pacote
- Verifique se o link foi criado corretamente: `npm ls -g`
- Tente reinstalar: `npm unlink && npm link`

### Problema: Mudanças não aparecem no projeto de teste

**Solução:**
- Execute `npm run build` no pacote após cada mudança
- Ou use `npm run build:watch` para rebuild automático

### Problema: Erros de tipos TypeScript

**Solução:**
- Verifique se `dist/*.d.ts` foram gerados
- Verifique se `types` está correto no package.json
- Tente limpar e rebuild: `npm run clean && npm run build`

### Problema: Módulos não encontrados (dependencies do pacote)

**Solução:**
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Reinstale as dependências do pacote: `npm install`

---

## 📝 Checklist de Teste

Antes de publicar, teste:

- [ ] Instalação funciona (`npm install`)
- [ ] Import/require funciona (CommonJS e ES Modules)
- [ ] Tipos TypeScript estão disponíveis
- [ ] Todas as funcionalidades principais funcionam
- [ ] Source maps estão corretos (para debugging)
- [ ] Arquivos incluídos estão corretos (verificar `files` no package.json)
- [ ] Dependências estão corretas
- [ ] README e documentação estão atualizados

---

## 🔗 Links Úteis

- [npm link documentation](https://docs.npmjs.com/cli/v9/commands/npm-link)
- [npm pack documentation](https://docs.npmjs.com/cli/v9/commands/npm-pack)
- [Testing packages locally](https://docs.npmjs.com/cli/v9/using-npm/developers#testing-packages)

