#!/usr/bin/env node

/**
 * Script para configurar o módulo Rust após build
 * Copia/renomeia o arquivo .dylib para .node se necessário
 */

const fs = require('fs');
const path = require('path');

const dylibPath = path.join(__dirname, '../rust/target/release/libautomate_features_rust.dylib');
const nodePath = path.join(__dirname, '../rust/target/release/automate_features_rust.node');

if (fs.existsSync(dylibPath) && !fs.existsSync(nodePath)) {
  console.log('📦 Copiando .dylib para .node...');
  fs.copyFileSync(dylibPath, nodePath);
  console.log('✅ Arquivo .node criado com sucesso!');
} else if (fs.existsSync(nodePath)) {
  console.log('✅ Arquivo .node já existe');
} else {
  console.error('❌ Arquivo .dylib não encontrado. Execute: npm run build:rust');
  process.exit(1);
}

