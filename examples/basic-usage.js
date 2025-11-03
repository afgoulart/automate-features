#!/usr/bin/env node

/**
 * Exemplo básico de uso do @arranjae/automate-features
 * 
 * Uso: node examples/basic-usage.js "seu prompt aqui"
 */

const { Pipeline } = require('../dist/index.js');
require('dotenv').config();

async function main() {
  const prompt = process.argv[2];
  
  if (!prompt) {
    console.error('❌ Uso: node examples/basic-usage.js "seu prompt aqui"');
    process.exit(1);
  }

  if (!process.env.CURSOR_API_TOKEN) {
    console.error('❌ CURSOR_API_TOKEN não encontrado no .env');
    process.exit(1);
  }

  console.log('🚀 Iniciando processo de geração...\n');
  console.log(`📝 Prompt: ${prompt}\n`);

  const pipeline = new Pipeline({
    cursorApiToken: process.env.CURSOR_API_TOKEN,
    githubToken: process.env.GITHUB_TOKEN,
    repoOwner: process.env.GITHUB_REPO_OWNER,
    repoName: process.env.GITHUB_REPO_NAME,
    config: {
      solidRules: true,
      atomicDesign: true,
      lintRules: ['eslint'],
    },
  });

  try {
    const result = await pipeline.process({
      prompt,
      createBranch: !!process.env.GITHUB_TOKEN,
      createIssue: !!process.env.GITHUB_TOKEN,
      createPR: !!process.env.GITHUB_TOKEN,
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
    } else {
      console.error(`\n❌ Erro: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Erro inesperado:`, error.message);
    process.exit(1);
  }
}

main();

