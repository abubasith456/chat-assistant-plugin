#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building vanilla JavaScript plugin...');

const srcDir = path.join(__dirname, '../public/vanilla-plugin');
const buildDir = path.join(__dirname, '../build/vanilla-plugin');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Copy files to build directory
const filesToCopy = [
  'chat-assistant.js',
  'chat-assistant.css', 
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
const uglifyJS = require('uglify-js');

try {
  // Minify JavaScript
  const jsContent = fs.readFileSync(path.join(srcDir, 'chat-assistant.js'), 'utf8');
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
    fs.writeFileSync(path.join(buildDir, 'chat-assistant.min.js'), minifiedJS.code);
    console.log('✅ Created chat-assistant.min.js');
  }
} catch (error) {
  console.warn('⚠️  Could not create minified JS (uglify-js not installed)');
  console.log('   Run: npm install --save-dev uglify-js');
}

// Create package info
const packageInfo = {
  name: 'chat-assistant-vanilla',
  version: require('../package.json').version,
  description: 'Vanilla JavaScript chat assistant widget - no dependencies required',
  main: 'chat-assistant.js',
  style: 'chat-assistant.css',
  files: [
    'chat-assistant.js',
    'chat-assistant.min.js', 
    'chat-assistant.css',
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
