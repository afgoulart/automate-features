#!/usr/bin/env node

/**
 * Post-install script for @arranjae/automate-features
 *
 * This script runs after package installation and prompts the user
 * to add the executable to their PATH for easier access.
 */

const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in a CI environment or non-interactive terminal
const isCI = process.env.CI === 'true' ||
             process.env.CONTINUOUS_INTEGRATION === 'true' ||
             !process.stdin.isTTY;

// Check if this is a global install
const isGlobalInstall = process.env.npm_config_global === 'true';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showWelcomeMessage() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                            ║', 'cyan');
  log('║   Thank you for installing @arranjae/automate-features!   ║', 'cyan');
  log('║                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log('');
}

function showUsageInstructions() {
  log('\n📚 Usage Instructions:', 'blue');
  log('');

  if (isGlobalInstall) {
    log('   Global installation detected!', 'green');
    log('   You can now use: automate-features <command>', 'bright');
  } else {
    log('   Local installation detected.', 'yellow');
    log('   You can use:', 'bright');
    log('   - npm run automate-features -- <command>');
    log('   - npx automate-features <command>');
    log('   - node bin/automate-features.js <command>');
  }

  log('');
  log('📖 Documentation:', 'blue');
  log('   https://github.com/arranjae/automate-features', 'bright');
  log('');
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function runAddToPath() {
  const scriptPath = path.join(__dirname, 'add-to-path.sh');

  // Check if script exists
  if (!fs.existsSync(scriptPath)) {
    log('❌ Error: add-to-path.sh script not found', 'yellow');
    return;
  }

  return new Promise((resolve, reject) => {
    exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Error running script: ${error.message}`, 'yellow');
        reject(error);
        return;
      }

      if (stderr) {
        console.error(stderr);
      }

      console.log(stdout);
      resolve();
    });
  });
}

async function main() {
  showWelcomeMessage();

  // Skip interactive prompts in CI or non-interactive environments
  if (isCI) {
    log('ℹ️  CI environment detected, skipping interactive setup.', 'yellow');
    showUsageInstructions();
    return;
  }

  // For global installs, npm/pnpm/yarn automatically handles PATH
  if (isGlobalInstall) {
    log('✅ Global installation complete!', 'green');
    log('   The "automate-features" command should be available in your PATH.', 'bright');
    showUsageInstructions();
    return;
  }

  // For local installs, offer to add to PATH
  log('📦 Local installation detected.', 'blue');
  log('');
  log('Would you like to add "automate-features" to your PATH?', 'bright');
  log('This will create a symlink in a directory that\'s already in your PATH,', 'yellow');
  log('making the command available globally.', 'yellow');
  log('');

  const answer = await promptUser('Add to PATH? (y/N): ');

  if (answer === 'y' || answer === 'yes') {
    log('');
    log('🔧 Adding to PATH...', 'blue');
    log('');

    try {
      await runAddToPath();
    } catch (error) {
      log('');
      log('⚠️  Failed to add to PATH automatically.', 'yellow');
      log('   You can run this command manually later:', 'yellow');
      log(`   bash ${path.join(__dirname, 'add-to-path.sh')}`, 'bright');
    }
  } else {
    log('');
    log('ℹ️  Skipped adding to PATH.', 'blue');
    log('   You can add it later by running:', 'bright');
    log(`   bash ${path.join(__dirname, 'add-to-path.sh')}`, 'bright');
  }

  showUsageInstructions();
}

// Run main function
main().catch((error) => {
  console.error('Error during postinstall:', error);
  process.exit(0); // Don't fail the installation
});
