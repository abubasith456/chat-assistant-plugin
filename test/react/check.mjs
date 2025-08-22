import path from 'path';
import url from 'url';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// packages are installed at workspace root node_modules; compute path accordingly
const pkgPath = path.resolve(__dirname, '..', '..', 'node_modules', '@mohamedabu.basith', 'react-chat-widget', 'dist', 'index.esm.js');
try {
  const mod = await import(url.pathToFileURL(pkgPath).href);
  console.log('Imported module keys:', Object.keys(mod));
  if (mod.default) {
    console.log('Default export type:', typeof mod.default);
  }
} catch (err) {
  console.error('Import failed:', err.message);
  process.exitCode = 1;
}
