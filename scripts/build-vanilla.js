#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Building vanilla JavaScript plugin...');

const srcDir = path.join(__dirname, '../public/vanilla-plugin');
const buildDir = path.join(__dirname, '../build/vanilla-plugin');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy files to build directory
const filesToCopy = [
  'plugin.js',
  'plugin.css', 
  'README.md'
];

filesToCopy.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(buildDir, file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file}`);
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

// Create minified versions
import uglifyJS from 'uglify-js';

try {
  // Minify JavaScript
  const jsContent = fs.readFileSync(path.join(srcDir, 'plugin.js'), 'utf8');
  const minifiedJS = uglifyJS.minify(jsContent, {
    compress: {
      drop_console: true,
      drop_debugger: true
    },
    mangle: true
  });
  
  if (minifiedJS.error) {
    console.error('❌ JavaScript minification failed:', minifiedJS.error);
  } else {
    fs.writeFileSync(path.join(buildDir, 'plugin.min.js'), minifiedJS.code);
    console.log('✅ Created plugin.min.js');
  }
} catch (error) {
  console.warn('⚠️  Could not create minified JS (uglify-js not installed)');
  console.log('   Run: npm install --save-dev uglify-js');
}

// Create package info
// Create package.json for distribution
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const packageInfo = {
  name: 'chat-assistant-vanilla',
  version: packageJson.version,
  description: 'Vanilla JavaScript chat assistant widget - no dependencies required',
  main: 'plugin.js',
  style: 'plugin.css',
  files: [
    'plugin.js',
    'plugin.min.js', 
    'plugin.css',
    'README.md'
  ],
  keywords: ['chat', 'widget', 'assistant', 'vanilla', 'javascript', 'ui'],
  author: 'Chat Assistant Team',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/your-org/chat-assistant-plugin'
  },
  browser: 'chat-assistant.js',
  unpkg: 'chat-assistant.min.js',
  jsdelivr: 'chat-assistant.min.js'
};

fs.writeFileSync(
  path.join(buildDir, 'package.json'), 
  JSON.stringify(packageInfo, null, 2)
);

console.log('✅ Created package.json');
console.log('🎉 Vanilla build complete!');
console.log(`📁 Output directory: ${buildDir}`);
