# Gemini Provider: SDK vs REST API

Este documento compara as duas abordagens de implementação para o Gemini Provider.

## 📊 Comparação Rápida

| Aspecto | REST API (Atual) ✅ | SDK Oficial |
|---------|---------------------|-------------|
| **Dependências** | Apenas axios (já instalado) | Requer @google/genai (~500KB) |
| **Tamanho Bundle** | Menor | Maior |
| **Controle** | Total sobre requests | Abstraído pelo SDK |
| **Manutenção** | Manual (atualizar endpoints) | Automática (SDK atualizado) |
| **Documentação** | API REST docs | SDK docs |
| **Error Handling** | Manual | Padronizado pelo SDK |
| **Status** | ✅ Implementado e testado | 🔧 Exemplo disponível |

## 🔧 Implementação Atual (REST API)

### Vantagens
- ✅ **Zero dependências extras** - Usa axios que já está instalado
- ✅ **Bundle menor** - Não adiciona peso ao pacote
- ✅ **Controle total** - Acesso direto aos endpoints
- ✅ **Customização** - Fácil ajustar timeouts, headers, etc
- ✅ **Já testado** - Todos os testes passando

### Desvantagens
- ⚠️ **Manutenção manual** - Precisa atualizar endpoints se API mudar
- ⚠️ **Parsing manual** - Precisa extrair dados da response

### Código Exemplo
\`\`\`typescript
const response = await axios.post(
  \`\${this.apiUrl}?key=\${this.apiKey}\`,
  {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  }
);

const text = response.data.candidates[0].content.parts[0].text;
\`\`\`

## 📦 Implementação com SDK

### Vantagens
- ✅ **API mais limpa** - Interface simplificada
- ✅ **Type safety** - Types do TypeScript incluídos
- ✅ **Atualizações automáticas** - SDK mantido pelo Google
- ✅ **Error handling** - Erros padronizados

### Desvantagens
- ⚠️ **Dependência extra** - Adiciona @google/genai (~500KB)
- ⚠️ **Bundle maior** - Aumenta tamanho do pacote
- ⚠️ **Menos controle** - Abstrações do SDK
- ⚠️ **Não testado** - Precisa validação

### Código Exemplo
\`\`\`typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: this.apiKey });

const response = await ai.models.generateContent({
  model: this.model,
  contents: prompt,
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

const text = response.text;
\`\`\`

## 🚀 Como Migrar para SDK (Opcional)

Se você decidir usar o SDK oficial:

### 1. Instalar Dependência
\`\`\`bash
pnpm add @google/genai
\`\`\`

### 2. Atualizar AIProviderFactory
\`\`\`typescript
// src/integrations/AIProviderFactory.ts
import { GeminiProviderSDK } from './providers/GeminiProviderSDK';

// No switch case:
case 'GEMINI': {
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  return new GeminiProviderSDK(apiKey, geminiModel);
}
\`\`\`

### 3. Descomentar Código
Edite \`src/integrations/providers/GeminiProviderSDK.ts\` e descomente:
- Imports do @google/genai
- Inicialização do cliente
- Chamadas da API

### 4. Testar
\`\`\`bash
GOOGLE_API_KEY=your-key pnpm test:gemini
\`\`\`

## 📋 Recomendação

**Mantenha a implementação REST atual** a menos que:

1. ✅ Você precise de features específicas do SDK
2. ✅ O SDK oferece melhor error handling para seu caso
3. ✅ Você prefere seguir o padrão oficial do Google
4. ✅ O tamanho do bundle não é preocupação

## 🔍 Monitoramento de Atualizações

### REST API
- Endpoint: \`https://generativelanguage.googleapis.com/v1/models/{model}:generateContent\`
- Docs: https://ai.google.dev/api/rest
- Changelog: https://ai.google.dev/docs/changelog

### SDK
- Package: \`@google/genai\`
- Docs: https://ai.google.dev/tutorials/node_quickstart
- GitHub: https://github.com/google/generative-ai-js

## 💡 Conclusão

A **implementação atual com REST API é recomendada** para este projeto porque:

1. ✅ Mantém o bundle pequeno
2. ✅ Já está testada e funcionando
3. ✅ Oferece controle total
4. ✅ Sem dependências extras

A implementação com SDK está disponível em \`GeminiProviderSDK.ts\` como referência caso você queira migrar no futuro.
