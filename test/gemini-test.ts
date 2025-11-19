/**
 * Test script for Gemini provider
 *
 * This test validates:
 * - GeminiProvider can be instantiated
 * - API connection validation works
 * - Code generation functionality works
 * - Error handling is proper
 */

import { GeminiProvider } from '../src/integrations/providers/GeminiProvider';

async function testGeminiProvider() {
  console.log('🧪 Starting Gemini Provider Test\n');

  // API key from environment or hardcoded for testing
  const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyD-UgLVhfB1lY_I7k8_AUOCwBe2HXXIJPc';
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  console.log(`📋 Configuration:`);
  console.log(`   Model: ${model}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

  // Test 1: Provider instantiation
  console.log('📦 Test 1: Provider Instantiation');
  let provider: GeminiProvider;
  try {
    provider = new GeminiProvider(apiKey, model);
    console.log('   ✅ Provider instantiated successfully');
    console.log(`   Provider name: ${provider.getName()}`);
    console.log(`   Provider model: ${provider.getModel()}\n`);
  } catch (error) {
    console.error('   ❌ Failed to instantiate provider:', error);
    process.exit(1);
  }

  // Test 2: Connection validation
  console.log('🔌 Test 2: Connection Validation');
  try {
    const isValid = await provider.validateConnection();
    if (isValid) {
      console.log('   ✅ Connection validated successfully\n');
    } else {
      console.error('   ❌ Connection validation failed\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('   ❌ Connection validation error:', error);
    process.exit(1);
  }

  // Test 3: Simple code generation
  console.log('💻 Test 3: Simple Code Generation');
  const simplePrompt = 'Write a simple TypeScript function that adds two numbers';
  console.log(`   Prompt: "${simplePrompt}"`);
  try {
    const code = await provider.generateCode(simplePrompt);
    console.log('   ✅ Code generated successfully');
    console.log(`   Generated ${code.length} characters\n`);
    console.log('   Generated code:');
    console.log('   ' + '─'.repeat(60));
    console.log(code.split('\n').map(line => '   ' + line).join('\n'));
    console.log('   ' + '─'.repeat(60) + '\n');
  } catch (error) {
    console.error('   ❌ Code generation failed:', error);
    process.exit(1);
  }

  // Test 4: Code review
  console.log('🔍 Test 4: Code Review');
  const sampleCode = `
function calculate(a, b) {
  return a + b;
}
`;
  console.log('   Sample code to review:');
  console.log(sampleCode);
  try {
    const review = await provider.reviewCode(sampleCode);
    console.log('   ✅ Code review completed');
    console.log(`   Review length: ${review.length} characters\n`);
    console.log('   Review result:');
    console.log('   ' + '─'.repeat(60));
    console.log(review.split('\n').map(line => '   ' + line).join('\n'));
    console.log('   ' + '─'.repeat(60) + '\n');
  } catch (error) {
    console.error('   ❌ Code review failed:', error);
    process.exit(1);
  }

  // Test 5: Complex prompt with context
  console.log('🚀 Test 5: Complex Prompt with Context');
  const complexPrompt = `
Create a TypeScript class that implements a simple caching mechanism with the following features:
- Store key-value pairs
- Get cached values
- Check if key exists
- Clear cache
- Set expiration time for cached items
`;
  console.log('   Complex prompt submitted...');
  try {
    const complexCode = await provider.generateCode(complexPrompt);
    console.log('   ✅ Complex code generated successfully');
    console.log(`   Generated ${complexCode.length} characters\n`);
    console.log('   Generated code (first 500 chars):');
    console.log('   ' + '─'.repeat(60));
    const preview = complexCode.substring(0, 500);
    console.log(preview.split('\n').map(line => '   ' + line).join('\n'));
    if (complexCode.length > 500) {
      console.log('   ... (truncated)');
    }
    console.log('   ' + '─'.repeat(60) + '\n');
  } catch (error) {
    console.error('   ❌ Complex code generation failed:', error);
    process.exit(1);
  }

  console.log('✅ All tests passed successfully!\n');
  console.log('📊 Test Summary:');
  console.log('   ✓ Provider instantiation');
  console.log('   ✓ Connection validation');
  console.log('   ✓ Simple code generation');
  console.log('   ✓ Code review');
  console.log('   ✓ Complex code generation\n');
}

// Run tests
testGeminiProvider()
  .then(() => {
    console.log('🎉 Test suite completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
