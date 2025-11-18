#!/usr/bin/env node

/**
 * Script para configurar o módulo Rust após build
 * Copia/renomeia o arquivo .dylib/.so/.dll para .node se necessário
 * Suporta macOS (.dylib), Linux (.so) e Windows (.dll)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const targetDir = path.join(__dirname, '../rust/target/release');
const nodePath = path.join(targetDir, 'automate_features_rust.node');

// Definir extensões nativas por plataforma
const platformExtensions = {
  darwin: '.dylib',
  linux: '.so',
  win32: '.dll',
};

// Detectar plataforma
const platform = os.platform();
const nativeExt = platformExtensions[platform] || '.so';
const nativePath = path.join(targetDir, `libautomate_features_rust${nativeExt}`);

// Verificar se arquivo .node já existe
if (fs.existsSync(nodePath)) {
  console.log('✅ Arquivo .node já existe');
  process.exit(0);
}

// Procurar arquivo nativo
if (fs.existsSync(nativePath)) {
  console.log(`📦 Copiando ${nativeExt} para .node...`);
  fs.copyFileSync(nativePath, nodePath);
  console.log('✅ Arquivo .node criado com sucesso!');
  process.exit(0);
}

// Se não encontrou, tentar procurar em todas as extensões
const allExtensions = ['.dylib', '.so', '.dll'];
for (const ext of allExtensions) {
  const altPath = path.join(targetDir, `libautomate_features_rust${ext}`);
  if (fs.existsSync(altPath)) {
    console.log(`📦 Copiando ${ext} para .node...`);
    fs.copyFileSync(altPath, nodePath);
    console.log('✅ Arquivo .node criado com sucesso!');
    process.exit(0);
  }
}

// Nenhum arquivo encontrado
console.error(`❌ Arquivo nativo não encontrado.`);
console.error(`   Procurado em: ${targetDir}`);
console.error(`   Extensões: ${allExtensions.join(', ')}`);
console.error(`   Plataforma: ${platform}`);
console.error(`   Execute: npm run build:rust`);
process.exit(1);
