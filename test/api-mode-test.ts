/**
 * Test API Mode Code Generation
 *
 * This script tests code generation using the API mode (without CLI)
 * to validate that the CodeParser is working correctly.
 */

import * as dotenv from 'dotenv';
import { CodeGenerator } from '../src/core/CodeGenerator';
import { CodeParser } from '../src/core/CodeParser';
import * as path from 'path';
import * as fs from 'fs/promises';

// Load environment variables
dotenv.config();

async function testApiMode() {
  console.log('🧪 Testing API Mode Code Generation\n');

  // Check if API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: ANTHROPIC_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(__dirname, '../test-output');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    console.log('📝 Creating CodeGenerator with API mode...');
    const generator = new CodeGenerator(
      apiKey,
      undefined,
      false, // useCli = false (API mode)
      undefined,
      'CLAUDE_CODE'
    );

    console.log('✅ CodeGenerator created\n');

    // Test 1: Generate a simple component
    console.log('🔨 Test 1: Generate a simple React component');
    const prompt1 = `Create a simple React Button component with TypeScript.

## File: src/components/Button.tsx
Create a Button component that accepts:
- label (string)
- onClick (function)
- variant ('primary' | 'secondary')

Use TypeScript and include proper types.`;

    console.log('📤 Sending request to API...');
    const result1 = await generator.generateAndParse(prompt1, {
      language: 'typescript',
      framework: 'react',
    });

    console.log(`✅ Received response from API`);
    console.log(`📦 Parsed ${result1.files.length} file(s):\n`);

    result1.files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Language: ${file.language || 'unknown'}`);
      console.log(`   Lines: ${file.content.split('\n').length}`);
      console.log(`   Size: ${file.content.length} bytes\n`);
    });

    // Save files
    console.log('💾 Saving files to disk...');
    await CodeParser.writeFiles(result1.files, outputDir);
    console.log('✅ Files saved\n');

    // Test 2: Generate multiple files
    console.log('🔨 Test 2: Generate multiple files (component + test + types)');
    const prompt2 = `Create a complete implementation with multiple files:

## File: src/components/Card.tsx
Create a React Card component with title, description, and image props.

## File: src/components/Card.test.tsx
Create unit tests for the Card component using Jest and React Testing Library.

## File: src/types/Card.types.ts
Create TypeScript types/interfaces for the Card component.`;

    console.log('📤 Sending request to API...');
    const result2 = await generator.generateAndParse(prompt2, {
      language: 'typescript',
      framework: 'react',
    });

    console.log(`✅ Received response from API`);
    console.log(`📦 Parsed ${result2.files.length} file(s):\n`);

    result2.files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Language: ${file.language || 'unknown'}`);
      console.log(`   Lines: ${file.content.split('\n').length}`);
      console.log(`   Size: ${file.content.length} bytes\n`);
    });

    // Save files
    console.log('💾 Saving files to disk...');
    await CodeParser.writeFiles(result2.files, outputDir);
    console.log('✅ Files saved\n');

    // Summary
    console.log('📊 Test Summary:');
    console.log(`✅ Test 1: Generated ${result1.files.length} file(s)`);
    console.log(`✅ Test 2: Generated ${result2.files.length} file(s)`);
    console.log(`📁 Output directory: ${outputDir}\n`);

    console.log('🎉 All tests passed successfully!');

    // List all files created
    console.log('\n📄 Files created:');
    const allFiles = await fs.readdir(outputDir, { recursive: true });
    for (const file of allFiles) {
      const stats = await fs.stat(path.join(outputDir, file));
      if (stats.isFile()) {
        console.log(`  - ${file}`);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error instanceof Error) {
      console.error(`Message: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the test
testApiMode().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
