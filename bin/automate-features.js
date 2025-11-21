#!/usr/bin/env node

/**
 * CLI para @arranjae/automate-features
 * 
 * Uso: npm run automate-features -- --propt-key=KEY --propt-api-url=URL --source=DIR arquivo.md
 * 
 * O arquivo .md pode ser qualquer arquivo markdown (ex: definition.md, feature.md, task.md, etc.)
 */

// Carregar variáveis de ambiente do .env se disponível
// Tenta carregar .env de múltiplos locais possíveis
const path = require('path');
const fs = require('fs');

const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),           // Diretório de trabalho atual
  path.resolve(__dirname, '..', '.env'),         // Diretório do projeto (onde está package.json)
  path.resolve('/Users/msc/Projects/Optmized-Process', '.env')  // Path absoluto do projeto
];

let dotenvPath = null;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenvPath = envPath;
    break;
  }
}

if (dotenvPath) {
  try {
    // Parse .env file manually para ter controle total
    const dotenv = require('dotenv');
    const envFileContent = fs.readFileSync(dotenvPath, 'utf-8');
    const parsed = dotenv.parse(envFileContent);

    // Sobrescrever process.env com valores do .env (força override)
    Object.keys(parsed).forEach(key => {
      process.env[key] = parsed[key].trim();
    });

    console.log(`✓ [DOTENV] Loaded from: ${dotenvPath} (forced override)`);
    console.log(`   Loaded keys: ${Object.keys(parsed).join(', ')}`);
  } catch (e) {
    console.log(`⚠️  [DOTENV] Error loading .env: ${e.message}`);
  }
} else {
  console.log(`⚠️  [DOTENV] No .env file found in: ${possibleEnvPaths.join(', ')}`);
}

// Debug: log variáveis de ambiente importantes
console.log(`🔍 [DEBUG inicial] process.env.USE_CLI: "${process.env.USE_CLI}"`);
console.log(`🔍 [DEBUG inicial] process.env.PROMPT_AI_TYPE: "${process.env.PROMPT_AI_TYPE}"`);
console.log(`🔍 [DEBUG inicial] process.env.PROMPT_KEY: "${process.env.PROMPT_KEY ? '***' + process.env.PROMPT_KEY.slice(-4) : 'undefined'}"`);
console.log(`🔍 [DEBUG inicial] process.env.GEMINI_MODEL: "${process.env.GEMINI_MODEL}"`);

const { Pipeline } = require('../dist/index.js');

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║        @arranjae/automate-features - AI Code Generator    ║
╚════════════════════════════════════════════════════════════╝

📖 USAGE:
   automate-features [OPTIONS] <feature.md>

📝 DESCRIPTION:
   Development automation tool with AI code generation, automated
   code review (SOLID, Atomic Design, Lint), and CI/CD integration.

🔧 OPTIONS:
   --prompt-key=KEY        API key for AI provider (required)
                          Env: PROMPT_AI_KEY or ANTHROPIC_API_KEY

   --prompt-type=TYPE      AI provider type (default: CLAUDE_CODE)
                          Options: CLAUDE_CODE, CURSOR, GEMINI
                          Env: PROMPT_AI_TYPE

   --prompt-api-url=URL    Custom API URL (optional)
                          Env: PROMPT_API_URL

   --source=DIR           Source directory for context (optional)
                          Env: SOURCE

   --cli-mode, --cli      Enable CLI mode (use local AI CLI instead of API)
                          Takes priority over USE_CLI env var

   -h, --help             Show this help message
   -v, --version          Show version number

🌍 ENVIRONMENT VARIABLES:
   USE_CLI                Enable CLI mode (default: false, use API)
                          Values: true, false

   CLAUDE_MODEL           Claude model to use (default: sonnet)
                          Options: opus, sonnet, haiku

   ANTHROPIC_API_KEY      Claude API key (alternative to PROMPT_AI_KEY)
   GOOGLE_API_KEY         Gemini API key (alternative to PROMPT_AI_KEY)
   GEMINI_MODEL           Gemini model (default: gemini-pro)
   PROMPT_AI_KEY          Universal AI provider key
   PROMPT_AI_TYPE         AI provider type (CLAUDE_CODE, CURSOR, or GEMINI)
   GITHUB_TOKEN           GitHub token for PR/Issue creation

📚 EXAMPLES:
   # Basic usage with API mode (default)
   automate-features feature.md

   # With explicit API key
   automate-features --prompt-key=sk-xxx feature.md

   # Using Claude Code API with custom model
   CLAUDE_MODEL=opus automate-features feature.md

   # Using CLI mode with source context (new --cli-mode flag)
   automate-features --cli-mode --source=. feature.md

   # Using CLI mode with source context (legacy USE_CLI env var)
   USE_CLI=true automate-features --source=. feature.md

   # With environment variables
   export ANTHROPIC_API_KEY=sk-xxx
   export PROMPT_AI_TYPE=CLAUDE_CODE
   automate-features feature.md

   # Using Gemini provider
   export GOOGLE_API_KEY=your-api-key
   export PROMPT_AI_TYPE=GEMINI
   automate-features feature.md

   # Using Gemini with custom model
   GEMINI_MODEL=gemini-pro-vision PROMPT_AI_TYPE=GEMINI automate-features feature.md

📖 DOCUMENTATION:
   https://github.com/arranjae/automate-features

💡 For more information, visit the documentation or check the README.
`);
}

function parseArgs() {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Check for version flag
  if (args.includes('-v') || args.includes('--version')) {
    const pkg = require('../package.json');
    console.log(`v${pkg.version}`);
    process.exit(0);
  }

  const config = {
    promptKey: process.env.PROMPT_KEY || null, // Aceita --propt-key ou --prompt-key
    promptApiUrl: process.env.PROMPT_API_URL || null,  // Aceita --propt-api-url ou --prompt-api-url
    promptType: process.env.PROMPT_TYPE || null,  // --prompt-type
    source: process.env.SOURCE || null,
    definitionFile: process.env.DEFINITION_FILE || null,
    cliMode: null, // --cli-mode flag
  };

  for (const arg of args) {
    // Aceita tanto --propt-key quanto --prompt-key (compatibilidade)
    if (arg.startsWith('--propt-key=') || arg.startsWith('--prompt-key=')) {
      config.promptKey = arg.split('=')[1];
    } else if (arg.startsWith('--propt-api-url=') || arg.startsWith('--prompt-api-url=')) {
      config.promptApiUrl = arg.split('=')[1];
    } else if (arg.startsWith('--prompt-type=')) {
      config.promptType = arg.split('=')[1];
      console.log(`🔍 [DEBUG parseArgs] --prompt-type detectado: "${config.promptType}"`);
    } else if (arg.startsWith('--source=')) {
      config.source = arg.split('=')[1];
    } else if (arg === '--cli-mode' || arg === '--cli') {
      config.cliMode = true;
      console.log(`🔍 [DEBUG parseArgs] --cli-mode detectado: true`);
    } else if (!arg.startsWith('--')) {
      // Assume it's the markdown file (any .md file)
      config.definitionFile = arg;
      console.log(`🔍 [DEBUG parseArgs] Arquivo detectado: "${config.definitionFile}"`);
    }
  }

  console.log(`🔍 [DEBUG parseArgs] Config final:`, {
    promptKey: config.promptKey ? '***' : null,
    promptType: config.promptType,
    source: config.source,
    definitionFile: config.definitionFile
  });

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

  console.log(`🔍 [DEBUG main] config.promptType: "${config.promptType}"`);
  console.log(`🔍 [DEBUG main] process.env.PROMPT_AI_TYPE: "${process.env.PROMPT_AI_TYPE}"`);

  // Get AI provider type from command line, env var, or default
  let aiProviderType = config.promptType || process.env.PROMPT_AI_TYPE || 'CURSOR';

  console.log(`🔍 [DEBUG main] aiProviderType antes da normalização: "${aiProviderType}"`);

  // Debug: log antes da normalização
  if (config.promptType) {
    console.log(`🔍 [DEBUG] promptType recebido: "${config.promptType}"`);
  }

  // Fix common typos and normalize
  const originalType = aiProviderType;
  aiProviderType = aiProviderType.toUpperCase()
    .replace('COURSOR', 'CURSOR')  // Corrige typo COURSOR -> CURSOR
    .replace('CLOUD_CODE', 'CLAUDE_CODE')  // Corrige typo CLOUD_CODE -> CLAUDE_CODE
    .replace('CLOUD', 'CLAUDE');  // Corrige CLOUD -> CLAUDE

  // Debug: log após normalização
  console.log(`🔍 [DEBUG main] aiProviderType após normalização: "${aiProviderType}"`);
  if (originalType !== aiProviderType) {
    console.log(`🔧 [DEBUG] Tipo normalizado: "${originalType}" -> "${aiProviderType}"`);
  }

  // Validate required parameters
  // Se não tiver --propt-key, tenta usar variáveis de ambiente
  let apiKey = config.promptKey;
  if (!apiKey) {
    // Tenta PROMPT_AI_KEY primeiro
    apiKey = process.env.PROMPT_AI_KEY || process.env.CURSOR_API_TOKEN;

    // Se for CLAUDE_CODE, também tenta ANTHROPIC_API_KEY
    if (!apiKey && aiProviderType === 'CLAUDE_CODE') {
      apiKey = process.env.ANTHROPIC_API_KEY;
    }

    // Se for GEMINI, também tenta GOOGLE_API_KEY
    if (!apiKey && aiProviderType === 'GEMINI') {
      apiKey = process.env.GOOGLE_API_KEY;
    }
  }

  if (!apiKey) {
    let envVarName = 'PROMPT_AI_KEY';
    if (aiProviderType === 'CLAUDE_CODE') {
      envVarName = 'ANTHROPIC_API_KEY ou PROMPT_AI_KEY';
    } else if (aiProviderType === 'GEMINI') {
      envVarName = 'GOOGLE_API_KEY ou PROMPT_AI_KEY';
    }
    console.error(`❌ Erro: --propt-key é obrigatório ou defina ${envVarName} no .env`);
    console.error('   Uso: npm run automate-features -- --propt-key=KEY --prompt-type=CLAUDE_CODE --source=DIR arquivo.md');
    console.error(`   Ou defina ${envVarName} no arquivo .env`);
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

  console.log(`🤖 Provider de AI: ${aiProviderType}`);
  console.log(`🚀 Iniciando processo de automação...\n`);

  // Check if CLI mode should be used
  // Priority: --cli-mode flag > USE_CLI env var > default (false)
  console.log(`🔍 [DEBUG] process.env.USE_CLI: "${process.env.USE_CLI}"`);
  console.log(`🔍 [DEBUG] config.cliMode: ${config.cliMode}`);

  let useCli = false;
  if (config.cliMode === true) {
    useCli = true;  // --cli-mode flag takes priority
    process.env.USE_CLI = 'true';  // Set env var when --cli-mode is passed
    console.log(`✓ [CLI-MODE] process.env.USE_CLI definido como 'true' via flag --cli-mode`);
  } else if (process.env.USE_CLI === 'true' || process.env.USE_CLI === '1') {
    useCli = true;  // Fallback to USE_CLI env var (backward compatibility)
  }

  console.log(`🔍 [DEBUG] useCli calculado: ${useCli}`);

  // Source directory: use provided source, or project root (not the feature file directory)
  let sourceDirectory = config.source || process.env.SOURCE_DIR;

  // If source is provided but points to feature directory, use parent
  if (sourceDirectory && config.definitionFile) {
    const featurePath = path.resolve(config.definitionFile);
    const featureDir = path.dirname(featurePath);
    const sourcePath = path.resolve(sourceDirectory);

    // If source directory is the same as feature directory, use parent
    if (sourcePath === featureDir) {
      sourceDirectory = path.resolve(featureDir, '..');
      console.log(`⚠️  Source directory was same as feature directory, using parent: ${sourceDirectory}`);
    }
  }

  // If no source provided, use current working directory (project root)
  if (!sourceDirectory) {
    sourceDirectory = process.cwd();
  }

  // Normalize path
  sourceDirectory = path.resolve(sourceDirectory);

  if (useCli) {
    console.log('🔧 CLI mode enabled (with source context)');
    if (sourceDirectory) {
      console.log(`📁 Source directory: ${sourceDirectory}`);
    }
  } else {
    console.log('🌐 API mode (default - using Claude Code API directly)');
  }

  // Debug: log antes de criar o Pipeline
  console.log(`🔍 [DEBUG] Criando Pipeline com:`);
  console.log(`   - aiProviderType: "${aiProviderType}"`);
  console.log(`   - useCli: ${useCli}`);
  console.log(`   - sourceDir: "${sourceDirectory}"`);

  const pipeline = new Pipeline({
    cursorApiToken: apiKey, // Usa a chave obtida (pode ser de --propt-key ou .env)
    apiUrl: config.promptApiUrl,
    aiProviderType: aiProviderType, // Passa o tipo normalizado
    useCli: useCli, // Passa explicitamente o valor calculado
    sourceDir: sourceDirectory,
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
        console.log(result.code);
        console.log('─'.repeat(50));

        // Save generated code to file
        const outputFile = path.join(process.cwd(), 'generated-code.md');
        fs.writeFileSync(outputFile, result.code, 'utf-8');
        console.log(`\n💾 Código salvo em: ${outputFile}`);
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

      // Ask post-generation questions
      await askPostGenerationQuestions(result.code, result.branchName);

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

async function askPostGenerationQuestions(code, existingBranch) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  try {
    // Ask about documentation
    const wantsDoc = await question('\n📚 Deseja gerar documentação do que foi feito? (s/N): ');
    if (wantsDoc.toLowerCase() === 's' || wantsDoc.toLowerCase() === 'sim') {
      const docFile = path.join(process.cwd(), 'DOCUMENTATION.md');
      const docContent = `# Documentação da Implementação\n\n## Código Gerado\n\n${code}\n\n## Data de Geração\n\n${new Date().toISOString()}\n`;
      fs.writeFileSync(docFile, docContent, 'utf-8');
      console.log(`✅ Documentação salva em: ${docFile}`);
    }

    // Ask about branch creation (if not already created)
    if (!existingBranch) {
      const wantsBranch = await question('\n🌿 Deseja criar uma branch para essa tarefa? (s/N): ');
      if (wantsBranch.toLowerCase() === 's' || wantsBranch.toLowerCase() === 'sim') {
        const branchName = await question('Digite o nome da branch (formato: feature/nome ou bugfix/nome): ');
        if (branchName.trim()) {
          try {
            const { execSync } = require('child_process');
            execSync(`git checkout -b ${branchName.trim()}`, { stdio: 'inherit' });
            console.log(`✅ Branch '${branchName.trim()}' criada e ativada!`);
          } catch (error) {
            console.error(`❌ Erro ao criar branch: ${error.message}`);
          }
        }
      }
    }
  } finally {
    rl.close();
  }
}

main();

