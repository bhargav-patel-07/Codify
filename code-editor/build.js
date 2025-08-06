const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting custom build script...');

// 1. Verify package.json exists and contains Next.js
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found in the project root');
  process.exit(1);
}

const packageJson = require(packageJsonPath);
const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next;

if (!hasNext) {
  console.error('Error: Next.js is not listed in package.json dependencies');
  process.exit(1);
}

console.log('✓ Next.js found in package.json');

// 2. Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✓ Dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}

// 3. Run Next.js build
console.log('Running Next.js build...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✓ Next.js build completed successfully');
} catch (error) {
  console.error('Error during Next.js build:', error);
  process.exit(1);
}

console.log('Build process completed!');
