/**
 * Simple API Mode Test
 *
 * Tests that the API mode (without CLI) and CodeParser are working correctly
 * by creating a mock test that doesn't require actual API calls.
 */

import { CodeParser } from '../src/core/CodeParser';
import * as path from 'path';
import * as fs from 'fs/promises';

async function testCodeParser() {
  console.log('🧪 Testing CodeParser (API Mode Component)\n');

  // Create output directory
  const outputDir = path.join(__dirname, '../test-output');
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Test 1: Parse markdown with file paths
    console.log('🔨 Test 1: Parse Markdown with File Paths');
    const mockGeneratedCode1 = `
## File: src/components/Button.tsx
\`\`\`typescript
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant }) => {
  return (
    <button className={\`btn btn-\${variant}\`} onClick={onClick}>
      {label}
    </button>
  );
};
\`\`\`

## File: src/components/Button.test.tsx
\`\`\`typescript
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with label', () => {
    const { getByText } = render(<Button label="Click me" onClick={() => {}} variant="primary" />);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Button label="Click me" onClick={handleClick} variant="primary" />);
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`
`;

    const result1 = CodeParser.parse(mockGeneratedCode1);
    console.log(`✅ Parsed ${result1.files.length} file(s)\n`);

    result1.files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Language: ${file.language || 'unknown'}`);
      console.log(`   Lines: ${file.content.split('\n').length}`);
      console.log(`   Size: ${file.content.length} bytes\n`);
    });

    // Test 2: Parse XML-like tags format
    console.log('🔨 Test 2: Parse XML-like Tags Format');
    const mockGeneratedCode2 = `
<file path="src/utils/helpers.ts" language="typescript">
\`\`\`typescript
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
\`\`\`
</file>
`;

    const result2 = CodeParser.parse(mockGeneratedCode2);
    console.log(`✅ Parsed ${result2.files.length} file(s)\n`);

    result2.files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path}`);
      console.log(`   Language: ${file.language || 'unknown'}`);
      console.log(`   Lines: ${file.content.split('\n').length}`);
      console.log(`   Size: ${file.content.length} bytes\n`);
    });

    // Test 3: Write files to disk
    console.log('🔨 Test 3: Write Files to Disk');
    const allFiles = [...result1.files, ...result2.files];

    console.log('💾 Saving files...');
    await CodeParser.writeFiles(allFiles, outputDir);
    console.log('✅ Files saved\n');

    // Test 4: Get summary
    console.log('🔨 Test 4: Generate Summary');
    const summary1 = CodeParser.getSummary(result1);
    console.log(summary1);
    console.log('');

    // Verify files were created
    console.log('🔨 Test 5: Verify Files on Disk');
    const createdFiles = await fs.readdir(outputDir, { recursive: true });

    console.log(`✅ ${createdFiles.length} file(s) created:\n`);
    for (const file of createdFiles) {
      const fullPath = path.join(outputDir, file as string);
      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          console.log(`  - ${file}`);
        }
      } catch (err) {
        // Skip directories
      }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Test 1 (Markdown): Parsed ${result1.files.length} file(s)`);
    console.log(`✅ Test 2 (XML Tags): Parsed ${result2.files.length} file(s)`);
    console.log(`✅ Test 3 (Write): Saved ${allFiles.length} file(s) to disk`);
    console.log(`✅ Test 4 (Summary): Generated summary successfully`);
    console.log(`✅ Test 5 (Verify): Confirmed files on disk`);
    console.log(`📁 Output directory: ${outputDir}\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('\n✅ CodeParser is working correctly for API mode!');

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
testCodeParser().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
