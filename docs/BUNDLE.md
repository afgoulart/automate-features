# Estrutura do Bundle

O pacote `@arranjae/automate-features` exporta tanto os arquivos compilados quanto os arquivos TypeScript fonte e tipos.

## Estrutura do Pacote

Quando instalado via `npm install @arranjae/automate-features`, o pacote contém:

```
node_modules/@arranjae/automate-features/
├── dist/                    # Arquivos compilados e tipos
│   ├── index.js             # CommonJS (ponto de entrada principal)
│   ├── index.esm.js          # ES Modules bundle
│   ├── index.d.ts           # Tipos TypeScript principais
│   ├── core/
│   │   ├── Pipeline.ts      # Source TypeScript
│   │   ├── Pipeline.js      # Compilado CommonJS
│   │   ├── Pipeline.d.ts     # Tipos
│   │   └── ...
│   ├── generators/
│   ├── validators/
│   ├── integrations/
│   └── types/
├── src/                      # Arquivos TypeScript fonte originais
│   ├── index.ts
│   ├── core/
│   ├── generators/
│   ├── validators/
│   ├── integrations/
│   └── types/
├── config/                   # Configurações padrão
├── README.md
└── LICENSE
```

## Formas de Importação

### 1. Importação Padrão (Arquivos Compilados)

```typescript
// ES Modules
import { Pipeline } from '@arranjae/automate-features';

// CommonJS
const { Pipeline } = require('@arranjae/automate-features');
```

Isso importa os arquivos compilados de `dist/`.

### 2. Importação dos Arquivos Fonte TypeScript

```typescript
// Acessar arquivo TypeScript específico
import { Pipeline } from '@arranjae/automate-features/dist/core/Pipeline';

// Ou usar o export "source"
import type { Pipeline } from '@arranjae/automate-features/source';
```

### 3. Importação de Tipos

```typescript
import type { PipelineConfig, ProcessOptions } from '@arranjae/automate-features';
```

## Vantagens desta Estrutura

1. **Desenvolvimento**: Desenvolvedores podem acessar os arquivos fonte TypeScript para entender melhor a implementação
2. **Debugging**: Source maps permitem debugging dos arquivos originais
3. **Tipos**: Definições TypeScript completas incluídas
4. **Compatibilidade**: Suporta CommonJS e ES Modules
5. **Tree-shaking**: Bundlers podem fazer tree-shaking dos arquivos não utilizados

## Build Process

O processo de build gera:

1. **TypeScript Compilation** (`tsc`):
   - Compila `src/` para `dist/`
   - Gera `.js`, `.d.ts` e `.d.ts.map`

2. **Rollup Bundle**:
   - Cria `dist/index.esm.js` (ES Modules bundle otimizado)

3. **Copy Source Files**:
   - Copia arquivos `.ts` originais para `dist/` mantendo estrutura

## Verificação do Bundle

Para verificar o que será incluído no pacote:

```bash
npm run publish:check
```

Isso cria um `.tgz` que você pode inspecionar:

```bash
npm pack
tar -tzf arranjae-automate-features-*.tgz | head -30
```

## Uso em Projetos Consumidores

### TypeScript com Arquivos Compilados (Recomendado)

```typescript
import { Pipeline } from '@arranjae/automate-features';
// Usa dist/index.js (CommonJS) ou dist/index.esm.js (ES Modules)
```

### TypeScript com Arquivos Fonte (Para desenvolvimento/debug)

```typescript
// Em tsconfig.json, adicione:
{
  "compilerOptions": {
    "paths": {
      "@arranjae/automate-features/*": ["node_modules/@arranjae/automate-features/src/*"]
    }
  }
}

// Depois pode importar direto dos arquivos fonte:
import { Pipeline } from '@arranjae/automate-features/src/core/Pipeline';
```

### Apenas Tipos

```typescript
import type { PipelineConfig } from '@arranjae/automate-features';
```

## Tamanho do Pacote

- **Compilado apenas**: ~50KB
- **Com arquivos fonte**: ~150KB
- **Com source maps**: ~200KB

O tamanho adicional dos arquivos fonte é aceitável pois:
- Facilita debugging e desenvolvimento
- Permite importação seletiva
- Não afeta runtime (arquivos `.ts` não são executados diretamente)

