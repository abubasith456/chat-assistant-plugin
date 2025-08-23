# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Chat Assistant Plugin

A fully configurable chat widget available in two versions:
- **React + Tailwind CSS** - For React applications
- **Vanilla JS + CSS** - For any website (no dependencies)

## 🚀 Features

- ✅ **Fully Configurable** - Colors, size, position, content
- ✅ **Multiple Positions** - Bottom-left, bottom-right, top-left, top-right
- ✅ **Smooth Animations** - Professional slide & fade transitions
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Sample Messages** - Pre-loaded conversation for demo
- ✅ **Typing Indicator** - Shows when bot is responding
- ✅ **Auto-scroll** - Messages automatically scroll to bottom
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **XSS Protection** - Sanitized message content

## 📦 Version A: React + Tailwind CSS

### Setup Instructions

1. **Copy the ChatWidget component:**
   ```bash
   cp src/components/ChatWidget.tsx your-project/src/components/
   ```

2. **Import and use in your React app:**
   ```tsx
   import ChatWidget from './components/ChatWidget';

   function App() {
     return (
       <div>
         <ChatWidget config={{
           position: 'bottom-right',
           primaryColor: '#10B981',
           title: 'Support Chat'
         }} />
       </div>
     );
   }
   ```

### Example Configurations

```tsx
// Default blue theme
<ChatWidget />

// Custom green theme
<ChatWidget config={{
  position: 'bottom-left',
  primaryColor: '#10B981',
  headerBgColor: '#059669',
  userBubbleColor: '#10B981',
  title: 'Support Chat',
  width: '400px',
  height: '600px'
}} />

// Compact purple theme
<ChatWidget config={{
  position: 'top-right',
  primaryColor: '#8B5CF6',
  headerBgColor: '#7C3AED',
  title: 'Help',
  width: '320px',
  height: '400px',
  borderRadius: '20px'
}} />
```

## 📦 Version B: Vanilla JS + CSS

### Setup Instructions

1. **Copy the files to your project:**
   ```
   vanilla-js/
   ├── chat-widget.css
   ├── chat-widget.js
   └── index.html (demo)
   ```

2. **Include in your HTML:**
   ```html
   <link rel="stylesheet" href="path/to/chat-widget.css">
   <script src="path/to/chat-widget.js"></script>
   ```

3. **Initialize the widget:**
   ```javascript
   // Basic usage
   ChatWidget.init();

   // Custom configuration
   ChatWidget.init({
     position: 'bottom-left',
     primaryColor: '#10B981',
     title: 'Support Chat',
     width: '400px',
     height: '600px'
   });
   ```

### Alternative: Auto-initialization

Add a data attribute to any element:
```html
<div data-chat-widget='{"position": "bottom-right", "title": "Help"}'></div>
```

## ⚙️ Configuration Options

Both versions support the same configuration options:

```javascript
{
  // Position
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
  
  // Size
  width: '380px',
  height: '500px',
  borderRadius: '12px',
  
  // Colors
  primaryColor: '#3B82F6',        // Main brand color
  backgroundColor: '#FFFFFF',     // Panel background
  textColor: '#374151',           // Main text color
  headerBgColor: '#3B82F6',       // Header background
  headerTextColor: '#FFFFFF',     // Header text
  inputBgColor: '#F9FAFB',        // Input background
  inputTextColor: '#374151',      // Input text
  buttonBgColor: '#3B82F6',       // Send button
  buttonTextColor: '#FFFFFF',     // Button text
  messageBubbleColor: '#F3F4F6',  // Bot message background
  userBubbleColor: '#3B82F6',     // User message background
  
  // Content
  title: 'Chat Assistant',
  placeholder: 'Type your message...',
  
  // Behavior
  defaultOpen: false              // Start opened/closed
}
```

## 🎨 Styling Examples

### Corporate Blue (Default)
```javascript
{
  primaryColor: '#3B82F6',
  headerBgColor: '#3B82F6',
  userBubbleColor: '#3B82F6'
}
```

### Success Green
```javascript
{
  primaryColor: '#10B981',
  headerBgColor: '#059669',
  userBubbleColor: '#10B981',
  buttonBgColor: '#10B981'
}
```

### Royal Purple
```javascript
{
  primaryColor: '#8B5CF6',
  headerBgColor: '#7C3AED',
  userBubbleColor: '#8B5CF6',
  buttonBgColor: '#8B5CF6'
}
```

### Dark Mode
```javascript
{
  backgroundColor: '#1F2937',
  textColor: '#F3F4F6',
  headerBgColor: '#111827',
  inputBgColor: '#374151',
  messageBubbleColor: '#374151'
}
```

## 🚀 Advanced Usage

### Multiple Widgets (Vanilla JS)
```javascript
// Create multiple widgets for different purposes
const salesChat = ChatWidget.init({
  position: 'bottom-right',
  title: 'Sales Chat',
  primaryColor: '#10B981'
});

const supportChat = ChatWidget.init({
  position: 'bottom-left', 
  title: 'Support',
  primaryColor: '#EF4444'
});

// Destroy when needed
salesChat.destroy();
```

### Dynamic Configuration (React)
```tsx
function App() {
  const [theme, setTheme] = useState('blue');
  
  const themeConfigs = {
    blue: { primaryColor: '#3B82F6' },
    green: { primaryColor: '#10B981' },
    purple: { primaryColor: '#8B5CF6' }
  };

  return (
    <div>
      <ChatWidget config={themeConfigs[theme]} />
    </div>
  );
}
```

## 🧪 Testing & Development

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Testing the Plugins

#### Test React Version
```bash
# Start development server
npm run dev

# Visit http://localhost:5173 to see the React version
```

#### Test Vanilla JS Version
```bash
# Open the vanilla demo directly
open vanilla-js/index.html

# Or serve it with a local server
npx serve vanilla-js
```

## 📦 Publishing to npm

This project includes automated scripts for building and publishing both versions to npm.

### Prerequisites

1. **npm account**: Make sure you're logged in to npm
   ```bash
   npm whoami  # Should show your npm username
   # If not logged in: npm login
   ```

2. **Required dependencies**: 
   ```bash
   npm install uglify-js --save-dev
   ```

### Publishing Scripts

#### Option 1: Complete Pipeline (Recommended)

**Test everything first (dry run):**
```bash
./scripts/complete-publish.sh --dry-run
```

**Publish and clean everything:**
```bash
./scripts/complete-publish.sh
```

This single command will:
- 🏗️ Build vanilla JavaScript plugin with minification
- 📦 Publish both packages to npm with auto-version incrementing
- 🧹 Clean all caches (npm, yarn, Docker, temp files)
- 📥 Reinstall fresh dependencies

#### Option 2: Step-by-Step

**Build vanilla plugin only:**
```bash
node scripts/build-vanilla.js
```

**Publish both packages:**
```bash
./scripts/publish-packages.sh --dry-run  # Test first
./scripts/publish-packages.sh            # Actual publish
```

### Published Packages

After publishing, your packages will be available as:

**Vanilla JavaScript Plugin:**
```bash
npm install chat-assistant-plugin
```

**React Component:**
```bash
npm install @mohamedabu.basith/react-chat-widget
```

### Script Details

#### `complete-publish.sh` Features:
- ✅ **Automatic building** of vanilla plugin with minification
- ✅ **Smart version management** - auto-increments if version exists
- ✅ **Multiple build formats** for React (ESM, UMD, Modern JS)
- ✅ **Cache cleanup** - npm, yarn, Docker, temp files
- ✅ **Fresh dependency installation**
- ✅ **Dry-run mode** for safe testing

#### Available Commands:
```bash
# Help
./scripts/complete-publish.sh --help

# Test without publishing
./scripts/complete-publish.sh --dry-run

# Full publish + clean
./scripts/complete-publish.sh
```

### Troubleshooting

**Permission issues:**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

**npm login issues:**
```bash
npm login
npm whoami  # Verify login
```

**Build errors:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Cache issues:**
```bash
# Manual cache cleanup
npm cache clean --force
rm -rf node_modules build dist
```

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 📱 Mobile Responsive

The widget automatically adapts to mobile screens:
- Smaller screens: Widget takes more screen space
- Touch-friendly button sizes
- Optimized animations for mobile performance

## 🔒 Security

- All user input is sanitized to prevent XSS attacks
- No external dependencies or CDN requirements
- No data collection or tracking

## 🎯 Demo

1. **React Version**: Run `npm run dev` and visit the demo
2. **Vanilla JS Version**: Open `vanilla-js/index.html` in your browser

## 📄 License

MIT License - feel free to use in commercial projects.

## 🤝 Contributing

Feel free to submit issues and feature requests!

---

**Need help?** Check the demo files for working examples of both versions.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
