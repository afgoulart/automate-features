#!/usr/bin/env node

/**
 * Script to copy Rust binary to dist/native for npm packaging
 * This ensures the .node binary is included in the published package
 */

const fs = require('fs');
const path = require('path');

const sourceFile = path.join(__dirname, '../rust/target/release/automate_features_rust.node');
const destDir = path.join(__dirname, '../dist/native');
const destFile = path.join(destDir, 'automate_features_rust.node');

// Create dist/native directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('📁 Created directory: dist/native/');
}

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  console.error('❌ Rust binary not found. Please run: npm run build:rust');
  console.error(`   Expected: ${sourceFile}`);
  process.exit(1);
}

// Copy the binary
try {
  fs.copyFileSync(sourceFile, destFile);
  const stats = fs.statSync(destFile);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`✅ Rust binary copied to dist/native/ (${sizeKB} KB)`);
} catch (error) {
  console.error('❌ Error copying Rust binary:', error.message);
  process.exit(1);
}
