#!/usr/bin/env node

/**
 * Script para copiar arquivos TypeScript fonte para dist/
 * Isso permite que o pacote exporte tanto os arquivos compilados quanto os originais
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const distDir = path.join(__dirname, '..', 'dist');

/**
 * Copia recursivamente arquivos TypeScript mantendo a estrutura de diretórios
 */
function copyTypeScriptFiles(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyTypeScriptFiles(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      // Copiar apenas arquivos .ts (não .d.ts que já foram gerados pelo tsc)
      if (!entry.name.endsWith('.d.ts')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

try {
  console.log('📋 Copiando arquivos TypeScript fonte para dist/...');
  copyTypeScriptFiles(srcDir, distDir);
  console.log('✅ Arquivos TypeScript copiados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

