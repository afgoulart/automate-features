#!/usr/bin/env node

/**
 * CLI para @arranjae/automate-features
 * 
 * Uso: npm run automate-features -- --propt-key=KEY --propt-api-url=URL --source=DIR arquivo.md
 * 
 * O arquivo .md pode ser qualquer arquivo markdown (ex: definition.md, feature.md, task.md, etc.)
 */

const { Pipeline } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    proptKey: null,
    proptApiUrl: null,
    source: null,
    definitionFile: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--propt-key=')) {
      config.proptKey = arg.split('=')[1];
    } else if (arg.startsWith('--propt-api-url=')) {
      config.proptApiUrl = arg.split('=')[1];
    } else if (arg.startsWith('--source=')) {
      config.source = arg.split('=')[1];
    } else if (!arg.startsWith('--')) {
      // Assume it's the markdown file (any .md file)
      config.definitionFile = arg;
    }
  }

  return config;
}

function readDefinitionFile(filePath) {
  try {
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Arquivo não encontrado: ${absolutePath}`);
    }

    // Verifica se é um arquivo .md (opcional, mas recomendado)
    const ext = path.extname(absolutePath).toLowerCase();
    if (ext !== '.md') {
      console.warn(`⚠️  Aviso: O arquivo não tem extensão .md (${ext}). Continuando...`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Erro ao ler arquivo: ${error.message}`);
  }
}

async function main() {
  const config = parseArgs();

  // Validate required parameters
  if (!config.proptKey) {
    console.error('❌ Erro: --propt-key é obrigatório');
    console.error('   Uso: npm run automate-features -- --propt-key=KEY --propt-api-url=URL --source=DIR arquivo.md');
    process.exit(1);
  }

  if (!config.definitionFile) {
    console.error('❌ Erro: arquivo .md é obrigatório');
    console.error('   Uso: npm run automate-features -- --propt-key=KEY --propt-api-url=URL --source=DIR arquivo.md');
    console.error('   Exemplo: npm run automate-features -- --propt-key=abc123 --propt-api-url=https://api.example.com --source=$(pwd) feature.md');
    process.exit(1);
  }

  // Read markdown file
  let prompt;
  try {
    prompt = readDefinitionFile(config.definitionFile);
    const fileName = path.basename(config.definitionFile);
    console.log(`📄 Arquivo lido: ${fileName} (${config.definitionFile})\n`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  // Set working directory if source is provided
  if (config.source) {
    const sourceDir = path.resolve(config.source);
    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ Diretório source não encontrado: ${sourceDir}`);
      process.exit(1);
    }
    process.chdir(sourceDir);
    console.log(`📁 Diretório de trabalho: ${sourceDir}\n`);
  }

  // Get optional GitHub config from environment
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;
  const aiProviderType = process.env.PROMPT_AI_TYPE || 'CURSOR';

  console.log(`🤖 Provider de AI: ${aiProviderType}`);
  console.log(`🚀 Iniciando processo de automação...\n`);

  const pipeline = new Pipeline({
    cursorApiToken: config.proptKey,
    apiUrl: config.proptApiUrl,
    aiProviderType: aiProviderType,
    githubToken: githubToken,
    repoOwner: repoOwner,
    repoName: repoName,
    config: {
      solidRules: true,
      atomicDesign: true,
      lintRules: ['eslint'],
    },
  });

  try {
    const result = await pipeline.process({
      prompt,
      createBranch: !!githubToken && !!repoOwner && !!repoName,
      createIssue: !!githubToken && !!repoOwner && !!repoName,
      createPR: !!githubToken && !!repoOwner && !!repoName,
      runCodeReview: true,
    });

    if (result.success) {
      console.log('\n✅ Processo concluído com sucesso!\n');

      if (result.code) {
        console.log('📄 Código gerado:');
        console.log('─'.repeat(50));
        console.log(result.code.substring(0, 200) + (result.code.length > 200 ? '...' : ''));
        console.log('─'.repeat(50));
      }

      if (result.branchName) {
        console.log(`🌿 Branch criada: ${result.branchName}`);
      }

      if (result.issueNumber) {
        console.log(`📋 Issue criada: #${result.issueNumber}`);
      }

      if (result.prNumber) {
        console.log(`🔀 Pull Request criada: #${result.prNumber}`);
      }

      if (result.review) {
        console.log(`\n📊 Code Review:`);
        console.log(`   Status: ${result.review.passed ? '✅ Passou' : '❌ Falhou'}`);
        if (result.review.summary) {
          console.log(`   ${result.review.summary}`);
        }

        if (result.review.issues && result.review.issues.length > 0) {
          console.log(`\n   Issues encontrados:`);
          result.review.issues.slice(0, 5).forEach((issue, index) => {
            console.log(`   ${index + 1}. [${issue.type}] ${issue.message}`);
            if (issue.file) console.log(`      📁 ${issue.file}`);
            if (issue.suggestion) console.log(`      💡 ${issue.suggestion}`);
          });
          if (result.review.issues.length > 5) {
            console.log(`   ... e mais ${result.review.issues.length - 5} issue(s)`);
          }
        }
      }

      process.exit(0);
    } else {
      console.error(`\n❌ Erro: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Erro inesperado:`, error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

