# Guia de Publicação no NPM

Este guia explica como publicar o módulo `@arranjae/automate-features` no NPM.

## Pré-requisitos

1. **Conta no NPM**
   - Crie uma conta em [npmjs.com](https://www.npmjs.com/)
   - Configure autenticação: `npm login`

2. **Organização NPM (para scoped packages)**
   - O pacote usa o escopo `@arranjae`
   - Você precisará criar a organização `arranjae` no NPM ou usar sua conta pessoal
   - Ou mudar o nome no `package.json` para um nome não-scoped

## Preparação para Publicação

### 1. Verificar Configuração

```bash
# Verificar se o build funciona
npm run build

# Verificar o que será publicado
npm run publish:check
```

### 2. Atualizar Versão

Use `npm version` para atualizar a versão seguindo [Semantic Versioning](https://semver.org/):

```bash
# Patch version (0.1.0 -> 0.1.1)
npm version patch

# Minor version (0.1.0 -> 0.2.0)
npm version minor

# Major version (0.1.0 -> 1.0.0)
npm version major
```

O comando irá:
- Atualizar `package.json`
- Criar um git tag
- Fazer commit

### 3. Testar Localmente

```bash
# Criar um pacote local para teste
npm pack

# Instalar localmente em outro projeto para testar
npm install /caminho/para/arranjae-automate-features-0.1.0.tgz
```

## Publicação

### Publicação Manual

```bash
# 1. Build do projeto
npm run build

# 2. Verificar o que será publicado
npm pack --dry-run

# 3. Publicar (requer estar logado)
npm publish

# Para publicar publicamente (se usando scoped package)
npm publish --access public
```

### Publicação Automática com CI/CD

O projeto já inclui uma GitHub Action configurada em `.github/workflows/publish.yml` que publica automaticamente no NPM de duas formas:

#### Opção 1: Via GitHub Release

1. Crie uma nova release no GitHub
2. A action detecta automaticamente e publica a versão do tag no NPM

```bash
# Criar tag e release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Depois criar release no GitHub (via interface ou CLI)
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes"
```

#### Opção 2: Via Workflow Dispatch (Manual)

1. Vá em **Actions** → **Publish to NPM**
2. Clique em **Run workflow**
3. Escolha a versão (patch, minor, major, ou custom)
4. Execute

A action irá:
- Executar testes e lint
- Fazer build do pacote
- Verificar se a versão já existe no NPM
- Publicar automaticamente
- Criar tag e release no GitHub (se workflow_dispatch)

#### Configuração do NPM_TOKEN

Configure o secret `NPM_TOKEN` no GitHub:

1. Acesse [npmjs.com/tokens](https://www.npmjs.com/settings/seu-usuario/tokens)
2. Crie um **Automation** token (não use um token legado)
3. No GitHub: **Settings** → **Secrets and variables** → **Actions**
4. Adicione novo secret: `NPM_TOKEN` com o valor do token

**Importante**: O token precisa ter permissão de publicação na organização `@arranjae`.

## Checklist Antes de Publicar

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Lint está ok (`npm run lint`)
- [ ] Versão atualizada no `package.json`
- [ ] CHANGELOG.md atualizado
- [ ] README.md está completo e correto
- [ ] LICENSE está presente
- [ ] `.npmignore` está configurado corretamente
- [ ] Testado localmente (`npm pack` e instalação local)

## Após Publicação

1. **Verificar no NPM**
   - Acesse: `https://www.npmjs.com/package/@arranjae/automate-features`
   - Verifique se apareceu corretamente

2. **Criar Release no GitHub**
   - Vá em Releases
   - Crie uma nova release com a tag criada pelo `npm version`
   - Copie o conteúdo do CHANGELOG.md

3. **Divulgar**
   - Compartilhe o link do pacote NPM
   - Atualize documentação se necessário

## Resolução de Problemas

### Erro: "You must sign up for private packages"
- Use `--access public` ao publicar scoped packages públicos

### Erro: "Package name already exists"
- O nome já está em uso, escolha outro nome

### Erro: "You do not have permission"
- Verifique se está logado: `npm whoami`
- Verifique se tem permissão na organização NPM

### Publicar versão beta
```bash
npm version 0.2.0-beta.1
npm publish --tag beta
```

Instalar versão beta:
```bash
npm install @arranjae/automate-features@beta
```

## Comandos Úteis

```bash
# Ver informações do pacote publicado
npm view @arranjae/automate-features

# Ver versões disponíveis
npm view @arranjae/automate-features versions

# Despublicar versão (apenas nas primeiras 72h)
npm unpublish @arranjae/automate-features@0.1.0

# Adicionar colaborador
npm owner add usuario @arranjae/automate-features
```

## Boas Práticas

1. **Sempre teste localmente antes de publicar**
2. **Use Semantic Versioning corretamente**
3. **Mantenha o CHANGELOG.md atualizado**
4. **Não publique código com erros**
5. **Use tags para versões beta/alpha**
6. **Não despublicar versões (exceto nas primeiras 72h)**

