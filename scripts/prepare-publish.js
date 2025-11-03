#!/usr/bin/env node

/**
 * Script para preparar publicação NPM
 * Verifica se tudo está pronto para publicação
 */

const fs = require('fs');
const path = require('path');

const checks = [];

// Verificar se LICENSE existe
if (!fs.existsSync('LICENSE')) {
  checks.push({ status: '❌', message: 'LICENSE não encontrado' });
} else {
  checks.push({ status: '✅', message: 'LICENSE encontrado' });
}

// Verificar se README existe
if (!fs.existsSync('README.md')) {
  checks.push({ status: '❌', message: 'README.md não encontrado' });
} else {
  checks.push({ status: '✅', message: 'README.md encontrado' });
}

// Verificar se package.json tem campos obrigatórios
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.author || packageJson.author === '') {
  checks.push({ status: '⚠️', message: 'Campo "author" não preenchido no package.json' });
}
if (!packageJson.repository?.url || packageJson.repository.url === '') {
  checks.push({ status: '⚠️', message: 'Campo "repository.url" não preenchido no package.json' });
}
if (!packageJson.homepage || packageJson.homepage === '') {
  checks.push({ status: '⚠️', message: 'Campo "homepage" não preenchido no package.json' });
}

// Verificar se dist/ existe após build
if (!fs.existsSync('dist')) {
  checks.push({ status: '❌', message: 'Pasta dist/ não encontrada. Execute: npm run build' });
} else {
  const distFiles = fs.readdirSync('dist');
  const requiredFiles = ['index.js', 'index.esm.js', 'index.d.ts'];
  const missingFiles = requiredFiles.filter(file => !distFiles.includes(file));
  
  if (missingFiles.length > 0) {
    checks.push({ status: '❌', message: `Arquivos faltando em dist/: ${missingFiles.join(', ')}` });
  } else {
    checks.push({ status: '✅', message: 'Todos os arquivos necessários estão em dist/' });
  }
}

// Verificar se .npmignore existe
if (!fs.existsSync('.npmignore')) {
  checks.push({ status: '⚠️', message: '.npmignore não encontrado (recomendado)' });
} else {
  checks.push({ status: '✅', message: '.npmignore encontrado' });
}

// Mostrar resultados
console.log('\n📦 Verificação de Preparação para Publicação NPM\n');
console.log('─'.repeat(60));

checks.forEach(check => {
  console.log(`${check.status} ${check.message}`);
});

console.log('─'.repeat(60));

const errors = checks.filter(c => c.status === '❌').length;
const warnings = checks.filter(c => c.status === '⚠️').length;

if (errors > 0) {
  console.log(`\n❌ Encontrados ${errors} erro(s) que precisam ser corrigidos antes de publicar.`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️ Encontrados ${warnings} aviso(s). Recomenda-se corrigir antes de publicar.`);
  console.log('Você ainda pode publicar, mas algumas informações podem estar faltando.\n');
} else {
  console.log('\n✅ Tudo pronto para publicação!\n');
  console.log('Próximos passos:');
  console.log('  1. npm run publish:check    # Verificar o que será publicado');
  console.log('  2. npm login                 # Fazer login no NPM');
  console.log('  3. npm publish               # Publicar o pacote\n');
}

